"use client";

import { useState, useCallback, useEffect } from "react";
import { Analytics } from "@vercel/analytics/next";
import ChatPanel from "@/components/ChatPanel";
import LoginPage from "@/components/LoginPage";
import { AGENTS, Agent, ChatMessage, getAgentEndpoint, USE_NULLCLAW, API_BASE } from "@/lib/agents";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import {
  IconDashboard, IconAgents, IconLeads, IconTasks, IconCalendar,
  IconContracts, IconSettings, IconSignOut, IconSearch, IconPlus,
  IconRevenue, IconUptime, IconMail, IconBolt, IconWrench, IconStack, IconConfig
} from "@/components/Icons";
import { IconArcher, IconNova, IconScout, IconEcho, IconAtlas, IconSentinel } from "@/components/AgentIcons";

const IconMarketplace = ({ className = "w-5 h-5" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
    <line x1="3" y1="6" x2="21" y2="6" />
    <path d="M16 10a4 4 0 0 1-8 0" />
  </svg>
);

type Tab = "dashboard" | "agents" | "marketplace" | "leads" | "tasks" | "calendar" | "contracts" | "settings";

const getAgentIcon = (id: string, className = "w-5 h-5") => {
  switch (id) {
    case "archer": return <IconArcher className={className} />;
    case "nova": return <IconNova className={className} />;
    case "scout": return <IconScout className={className} />;
    case "echo": return <IconEcho className={className} />;
    case "atlas": return <IconAtlas className={className} />;
    case "sentinel": return <IconSentinel className={className} />;
    default: return <IconAtlas className={className} />;
  }
};

export default function DashboardLayout() {
  const [user, setUser] = useState<any>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<Tab>("dashboard");
  const [selectedAgent, setSelectedAgent] = useState<Agent>(AGENTS[0]);
  const [conversations, setConversations] = useState<Record<string, ChatMessage[]>>({});
  const [isTyping, setIsTyping] = useState(false);
  const [unreadCounts, setUnreadCounts] = useState<Record<string, number>>({});

  const fetchConversations = async (userId: string) => {
    if (!isSupabaseConfigured) return;
    const { data } = await supabase.from("chat_messages").select("*").eq("user_id", userId).order("created_at", { ascending: true });
    if (data) {
      const grouped: Record<string, ChatMessage[]> = {};
      data.forEach(msg => {
        if (!grouped[msg.agent_id]) grouped[msg.agent_id] = [];
        const agentDef = AGENTS.find(a => a.id === msg.agent_id);
        grouped[msg.agent_id].push({
          id: msg.id,
          role: msg.role,
          content: msg.content,
          timestamp: msg.created_at,
          type: "message",
          metadata: msg.metadata || undefined,
          agentId: msg.agent_id,
          agentName: agentDef?.name,
          agentTitle: agentDef?.title,
          agentIcon: agentDef?.icon,
        });
      });
      setConversations(grouped);
    }
  };

  useEffect(() => {
    if (!isSupabaseConfigured) {
      setUser({ email: "dev@vexis.ai", id: "dev-bypass-1234" });
      setAuthLoading(false);
      return;
    }
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) fetchConversations(session.user.id);
      setAuthLoading(false);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) fetchConversations(session.user.id);
    });
    return () => subscription.unsubscribe();
  }, []);

  const handleSignOut = async () => {
    if (isSupabaseConfigured) await supabase.auth.signOut();
    setUser(null);
  };

  const currentMessages = conversations[selectedAgent.id] || [];

  const handleSendMessage = useCallback(async (message: string, agentOverride?: Agent) => {
    const targetAgent = agentOverride || selectedAgent;
    const userMsg: ChatMessage = { id: `user-${Date.now()}`, role: "user", content: message, timestamp: new Date().toISOString(), type: "message" };
    setConversations(p => ({ ...p, [targetAgent.id]: [...(p[targetAgent.id] || []), userMsg] }));

    if (user && isSupabaseConfigured && user.id !== "dev-bypass-1234") {
      await supabase.from("chat_messages").insert({
        user_id: user.id,
        agent_id: targetAgent.id,
        role: "user",
        content: message,
      });
    }

    setIsTyping(true);

    try {
      const endpoint = getAgentEndpoint(targetAgent.id);
      const url = USE_NULLCLAW
        ? `${endpoint}/api/chat`
        : `${endpoint}/api/agents/${targetAgent.id}/chat`;

      const historyPayload = (conversations[targetAgent.id] || []).map(m => ({
        role: m.role === "agent" ? "assistant" : m.role,
        content: m.content
      }));

      const res = await fetch(url, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message, history: historyPayload }),
      });
      if (!res.ok) throw new Error(`API error: ${res.status}`);
      const data = await res.json();
      const agentMsg: ChatMessage = {
        id: `agent-${Date.now()}`, agentId: targetAgent.id, agentName: data.agent, agentTitle: data.agent_title,
        agentIcon: data.agent_icon, role: "agent", content: data.message, timestamp: data.timestamp, type: "message",
        metadata: data.metadata,
      };
      setConversations(p => ({ ...p, [targetAgent.id]: [...(p[targetAgent.id] || []), agentMsg] }));

      if (user && isSupabaseConfigured && user.id !== "dev-bypass-1234") {
        await supabase.from("chat_messages").insert({
          user_id: user.id,
          agent_id: targetAgent.id,
          role: "agent",
          content: data.message,
          metadata: data.metadata || null,
        });
      }

      if (data.metadata?.handoff_to) {
        const t = AGENTS.find(a => a.id === data.metadata.handoff_to);
        if (t) setUnreadCounts(p => ({ ...p, [t.id]: (p[t.id] || 0) + 1 }));
      }
    } catch (err) {
      setConversations(p => ({
        ...p, [targetAgent.id]: [...(p[targetAgent.id] || []), {
          id: `err-${Date.now()}`, role: "agent", agentName: targetAgent.name, agentTitle: targetAgent.title,
          agentIcon: targetAgent.icon, content: `Connection lost. Autonomous Engine is unreachable at ${getAgentEndpoint(targetAgent.id).replace('http://', '').replace('https://', '')}. Ensure the local instance is running.`,
          timestamp: new Date().toISOString(), type: "error",
        }]
      }));
    } finally { setIsTyping(false); }
  }, [selectedAgent]);

  const handleForward = useCallback((targetAgentId: string, context: string) => {
    const target = AGENTS.find(a => a.id === targetAgentId);
    if (!target) return;

    // Switch to the target agent UI immediately
    setSelectedAgent(target);
    setUnreadCounts(p => ({ ...p, [target.id]: 0 }));

    // Send a transfer prompt to the TARGET agent instead of relying on state timing
    const transferMsg = `[HANDOFF FROM ${selectedAgent.name}]: Here is the context for the next steps: \n\n"${context.substring(0, 500)}..."\n\nPlease proceed with the recommended action.`;
    handleSendMessage(transferMsg, target);
  }, [selectedAgent, handleSendMessage]);

  if (authLoading) return <div className="min-h-screen bg-[var(--color-vexis-bg)]" />;

  if (!user) return <LoginPage onAuth={() => supabase.auth.getSession().then(({ data }) => setUser(data.session?.user))} />;

  const navItems = [
    { id: "dashboard", icon: <IconDashboard className="drop-shadow-sm" />, label: "Dashboard" },
    { id: "agents", icon: <IconAgents className="drop-shadow-sm" />, label: "Agents" },
    { id: "marketplace", icon: <IconMarketplace className="drop-shadow-sm" />, label: "Marketplace" },
    { id: "leads", icon: <IconLeads className="drop-shadow-sm" />, label: "Leads" },
    { id: "tasks", icon: <IconTasks className="drop-shadow-sm" />, label: "Tasks" },
    { id: "calendar", icon: <IconCalendar className="drop-shadow-sm" />, label: "Calendar" },
    { id: "contracts", icon: <IconContracts className="drop-shadow-sm" />, label: "Contracts" },
    { id: "settings", icon: <IconSettings className="drop-shadow-sm" />, label: "Settings" },
  ] as const;

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-[var(--color-vexis-bg)]/20 relative">
      {/* Bottom Glass Dock Navigation */}
      <nav className="!absolute z-50 bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-1.5 p-[10px] rounded-[24px] glass border border-white/10 shadow-2xl backdrop-blur-3xl w-max">
        <div className="flex items-center justify-center w-10 h-10 rounded-[14px] btn-primary shadow-md mr-2">
          <svg className="w-5 h-5 text-white drop-shadow-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" /></svg>
        </div>

        {navItems.map((item, i) => (
          <button key={item.id} onClick={() => setActiveTab(item.id)}
            title={item.label}
            className={`reveal reveal-${i + 2} relative group flex items-center justify-center w-11 h-11 rounded-[14px] transition-all duration-300
              ${activeTab === item.id
                ? "bg-white/10 shadow-inner border border-white/10 text-white"
                : "text-[var(--color-vexis-text-secondary)] hover:text-white hover:bg-white/5"}`}>
            <div className={`w-5 h-5 flex items-center justify-center transition-transform duration-300 ${activeTab === item.id ? "scale-110 drop-shadow-md" : "opacity-80 group-hover:scale-110"}`}>
              {item.icon}
            </div>
            {/* Tooltip */}
            <span className="absolute -top-10 left-1/2 -translate-x-1/2 px-3 py-1.5 bg-[var(--color-vexis-bg)]/90 backdrop-blur-md text-white text-[11px] font-bold rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap border border-white/10 shadow-xl">
              {item.label}
            </span>
          </button>
        ))}

        <div className="w-px h-8 bg-white/10 mx-2" />

        <div className="relative group flex flex-col items-center justify-center w-11 h-11">
          <span className="w-3 h-3 rounded-full bg-[var(--color-vexis-green)] shadow-[0_0_12px_rgba(52,211,153,0.8)] status-live" />
          <span className="absolute -top-10 left-1/2 -translate-x-1/2 px-3 py-1.5 bg-[var(--color-vexis-bg)]/90 backdrop-blur-md text-white text-[11px] font-bold rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap border border-white/10 shadow-xl">
            Fleet Online
          </span>
        </div>

        <button onClick={handleSignOut} title="Sign Out" className="group flex items-center justify-center w-11 h-11 rounded-[14px] text-[var(--color-vexis-text-secondary)] hover:text-white hover:bg-white/5 transition-all relative">
          <IconSignOut className="w-5 h-5 opacity-80 group-hover:scale-110 transition-transform duration-300" />
          <span className="absolute -top-10 right-0 px-3 py-1.5 bg-[var(--color-vexis-bg)]/90 backdrop-blur-md text-white text-[11px] font-bold rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap border border-white/10 shadow-xl">
            Sign Out
          </span>
        </button>
      </nav>

      {/* Main Area */}
      <main className="flex-1 flex flex-col min-w-0 min-h-0 overflow-hidden relative z-10 pb-[80px]">
        {activeTab === "dashboard" && <DashboardTab />}
        {activeTab === "agents" && (
          <AgentsTab agents={AGENTS} selectedAgent={selectedAgent}
            onSelectAgent={(a: Agent) => { setSelectedAgent(a); setUnreadCounts(p => ({ ...p, [a.id]: 0 })); }}
            messages={currentMessages} isTyping={isTyping} onSendMessage={handleSendMessage} unreadCounts={unreadCounts}
            onForward={handleForward} />
        )}
        {activeTab === "marketplace" && <MarketplaceTab />}
        {activeTab === "leads" && <LeadSearchTab />}
        {activeTab === "tasks" && <TasksTab />}
        {activeTab === "calendar" && <CalendarTab />}
        {activeTab === "contracts" && <ContractsTab />}
        {activeTab === "settings" && <SettingsTab user={user} />}
      </main>
    </div>
  );
}

/* ═══════════════ AGENTS TAB ═══════════════ */
function AgentsTab({ agents, selectedAgent, onSelectAgent, messages, isTyping, onSendMessage, unreadCounts, onForward }: any) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  useEffect(() => {
    if (typeof window !== "undefined" && window.innerWidth < 768) {
      setIsSidebarOpen(false);
    }
  }, []);

  return (
    <div className="flex h-full w-full relative">
      {/* Retractable Agents Sidebar */}
      <div className={`flex-shrink-0 border-r border-[var(--color-vexis-border)] glass z-20 flex flex-col transition-all duration-300 absolute md:relative h-full
        ${isSidebarOpen ? "w-[240px] translate-x-0" : "w-[240px] -translate-x-full md:w-0 md:border-0 md:opacity-0 overflow-hidden"}`}>
        <div className="px-5 py-5 border-b border-[var(--color-vexis-border)]/50 flex items-center justify-between">
          <div className={`${!isSidebarOpen && "md:hidden"}`}>
            <h2 className="font-display font-extrabold text-[15px] text-white drop-shadow-md tracking-tight whitespace-nowrap">AI Agents</h2>
            <p className="text-[10px] font-medium text-[var(--color-vexis-text-secondary)] mt-0.5 whitespace-nowrap">6 specialized instances</p>
          </div>
          <button onClick={() => setIsSidebarOpen(false)} className="md:hidden text-white/50 hover:text-white">✕</button>
        </div>
        <div className="flex-1 overflow-y-auto p-3 space-y-1 scrollbar-thin">
          {agents.map((agent: Agent) => {
            const isActive = agent.id === selectedAgent.id;
            const unread = unreadCounts[agent.id] || 0;
            return (
              <button key={agent.id} onClick={() => onSelectAgent(agent)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all shadow-sm
                  ${isActive ? "nav-active glass bg-white/5 border-y border-y-white/5 shadow-md" : "hover:text-white hover:bg-white/5"}`}>
                <div className={`relative w-8 h-8 rounded-[10px] flex items-center justify-center shadow-inner
                  ${isActive ? "btn-primary shadow-md" : "glass border border-white/5 text-white"}`}>
                  {getAgentIcon(agent.id, "w-4 h-4 drop-shadow-sm")}
                  <span className={`absolute -bottom-1 -right-1 w-2.5 h-2.5 rounded-full border-2 border-[var(--color-vexis-bg)] bg-[var(--color-vexis-green)] ${agent.status === "online" ? "status-live shadow-[0_0_8px_rgba(52,211,153,0.5)]" : ""}`} />
                </div>
                <div className="flex-1 text-left min-w-0">
                  <p className={`text-[12px] font-black truncate drop-shadow-sm leading-tight ${isActive ? "text-white" : "text-[var(--color-vexis-text-secondary)]"}`}>{agent.name}</p>
                  <p className="text-[9px] font-bold text-[var(--color-vexis-blue-hover)] truncate uppercase tracking-widest mt-0.5 opacity-80">{agent.title}</p>
                </div>
                {unread > 0 && <span className="flex-shrink-0 w-5 h-5 rounded-full btn-primary text-white text-[10px] font-black flex items-center justify-center">{unread}</span>}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col min-w-0 h-full relative">
        <button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className={`absolute top-4 ${isSidebarOpen ? "hidden md:block md:-left-4" : "left-4"} z-30 p-2 glass rounded-xl text-white shadow-md hover:bg-white/10 transition-colors`}
          title="Toggle Agents List"
        >
          <svg className="w-5 h-5 drop-shadow-sm" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" /></svg>
        </button>
        <ChatPanel agent={selectedAgent} messages={messages} isTyping={isTyping} onSendMessage={onSendMessage} onForward={onForward} />
      </div>

      {/* Mobile Overlay */}
      {isSidebarOpen && (
        <div className="absolute inset-0 bg-black/50 z-10 md:hidden backdrop-blur-sm" onClick={() => setIsSidebarOpen(false)} />
      )}
    </div>
  );
}

/* ═══════════════ DASHBOARD ═══════════════ */
function DashboardTab() {
  const metrics = [
    { label: "Leads Found", value: "0", color: "var(--color-vexis-blue-hover)" },
    { label: "Contacted", value: "0", color: "var(--color-vexis-teal)" },
    { label: "Replied", value: "0", color: "var(--color-vexis-amber)" },
    { label: "Calls Booked", value: "0", color: "var(--color-vexis-green)" },
    { label: "Deals Closed", value: "0", color: "var(--color-vexis-green)" },
  ];

  return (
    <div className="flex-1 overflow-y-auto p-8 space-y-8">
      <div className="flex items-end justify-between reveal reveal-1">
        <div>
          <h1 className="font-display font-black text-3xl text-white tracking-tight drop-shadow-lg">Overview</h1>
          <p className="text-[14px] font-medium text-[var(--color-vexis-text-secondary)] mt-1.5">Real-time performance across all agent operations.</p>
        </div>
        <div className="glass px-5 py-3 rounded-2xl shadow-xl relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-tr from-[var(--color-vexis-gold)]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <p className="font-display font-black text-3xl tracking-tight leading-none text-gradient-white drop-shadow-md relative z-10">$0</p>
          <p className="text-[10px] font-extrabold text-[var(--color-vexis-text-muted)] uppercase tracking-[0.2em] mt-1.5 flex items-center justify-end gap-1.5 relative z-10">
            <IconRevenue className="w-3.5 h-3.5 text-[var(--color-vexis-gold)]" /> Total Revenue
          </p>
        </div>
      </div>

      <div className="glass rounded-[24px] p-8 reveal reveal-2 relative group shadow-xl">
        <div className="absolute inset-0 bg-gradient-to-r from-[var(--color-vexis-blue-hover)]/5 to-[var(--color-vexis-teal)]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none rounded-[24px]" />
        <div className="flex items-center gap-2 mb-6 relative z-10">
          <div className="w-7 h-7 rounded-md btn-primary flex items-center justify-center">
            <IconDashboard className="w-3.5 h-3.5" />
          </div>
          <h2 className="font-display font-black text-[13px] text-white uppercase tracking-widest drop-shadow-sm">Sales Pipeline</h2>
        </div>
        <div className="flex items-end gap-6 relative z-10">
          {metrics.map(m => (
            <div key={m.label} className="flex-1 text-center group/item cursor-default">
              <div className="h-24 rounded-[16px] mb-4 flex items-end justify-center transition-all duration-500 group-hover/item:scale-105 shadow-[inset_0_2px_10px_rgba(0,0,0,0.5)] border border-white/5 relative overflow-hidden" style={{ background: `linear-gradient(to top, ${m.color}15, transparent)` }}>
                <div className="absolute bottom-0 w-full h-1.5 rounded-t-lg opacity-80 shadow-[0_0_15px_currentColor] transition-all duration-500 group-hover/item:h-3 group-hover/item:opacity-100" style={{ backgroundColor: m.color, color: m.color }} />
              </div>
              <p className="font-display font-black text-2xl text-white drop-shadow-md">{m.value}</p>
              <p className="text-[10px] font-bold text-[var(--color-vexis-text-muted)] uppercase tracking-wider mt-1 group-hover/item:text-white transition-colors">{m.label}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-8">
        {[{ icon: <IconUptime />, title: "Agent Uptime", value: "99.9%", sub: "All 6 online", c: "var(--color-vexis-green)" },
        { icon: <IconMail />, title: "Email Opens", value: "—", sub: "No campaigns yet", c: "var(--color-vexis-teal)" },
        { icon: <IconStack />, title: "Avg Deal Size", value: "$0", sub: "Close first deal", c: "var(--color-vexis-blue-hover)" },
        ].map((k, i) => (
          <div key={k.title} className={`glass glass-hover rounded-[24px] p-6 reveal reveal-${i + 3} shadow-lg`}>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-[10px] glass flex items-center justify-center text-white shadow-inner">{k.icon}</div>
              <span className="text-[11px] font-bold text-[var(--color-vexis-text-muted)] uppercase tracking-wider">{k.title}</span>
            </div>
            <p className="font-display font-black text-2xl text-white tracking-tight drop-shadow-md">{k.value}</p>
            <p className="text-[10px] font-bold mt-1 uppercase tracking-wide" style={{ color: k.c, textShadow: `0 0 8px ${k.c}80` }}>{k.sub}</p>
          </div>
        ))}
      </div>

      <div className="reveal reveal-6">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-7 h-7 rounded-md btn-primary flex items-center justify-center shadow-[0_0_10px_rgba(42,107,255,0.6)]">
            <IconBolt className="w-3.5 h-3.5" />
          </div>
          <h2 className="font-display font-black text-[13px] text-white uppercase tracking-widest drop-shadow-sm">Agent Fleet Status</h2>
        </div>
        <div className="grid grid-cols-3 gap-4">
          {AGENTS.map(agent => (
            <div key={agent.id} className="glass glass-hover rounded-[20px] p-4 flex items-center gap-4 shadow-md">
              <div className="w-10 h-10 rounded-[12px] glass flex items-center justify-center text-white shadow-[0_2px_10px_rgba(0,0,0,0.5)] border border-white/10">
                {getAgentIcon(agent.id, "w-5 h-5 drop-shadow-md")}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[14px] font-display font-bold text-white truncate drop-shadow-sm">{agent.name}</p>
                <p className="text-[11px] font-bold text-[var(--color-vexis-blue-hover)] truncate uppercase tracking-wider">{agent.title}</p>
              </div>
              <div className="flex flex-col items-center gap-1.5">
                <span className="w-3 h-3 rounded-full border border-white/20 bg-[var(--color-vexis-green)] shadow-[0_0_15px_rgba(52,211,153,0.8)] status-live" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ═══════════════ LEAD SEARCH ═══════════════ */
function LeadSearchTab() {
  const [niche, setNiche] = useState("");
  const [location, setLocation] = useState("");
  const [maxLeads, setMaxLeads] = useState(20);
  const [isSearching, setIsSearching] = useState(false);
  const [results, setResults] = useState<any>(null);
  const [error, setError] = useState("");

  const handleSearch = async () => {
    if (!niche.trim() || !location.trim()) return;
    setIsSearching(true); setError(""); setResults(null);
    try {
      const res = await fetch(`${API_BASE}/api/leads/search`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ niche: niche.trim(), location: location.trim(), max_leads: maxLeads, analyze_websites: false }),
      });
      if (!res.ok) throw new Error(`API error: ${res.status}`);
      setResults(await res.json());
    } catch (err) { setError(err instanceof Error ? err.message : "Search failed"); }
    finally { setIsSearching(false); }
  };

  return (
    <div className="flex-1 overflow-y-auto p-8 space-y-8">
      <div className="reveal reveal-1">
        <h1 className="font-display font-black text-4xl text-white tracking-tight drop-shadow-lg">Lead Engine</h1>
        <p className="text-[14px] font-medium text-[var(--color-vexis-text-secondary)] mt-1.5">Archer&apos;s pipeline — scrape, analyze, score, target.</p>
      </div>

      <div className="glass rounded-[24px] p-8 reveal reveal-2 relative shadow-xl">
        <div className="grid grid-cols-3 gap-6 relative z-10">
          <div>
            <label className="text-[11px] font-extrabold text-[var(--color-vexis-text)] uppercase tracking-widest mb-2.5 block drop-shadow-md">Niche / Industry</label>
            <div className="relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--color-vexis-blue-hover)]"><IconSearch className="w-4 h-4 drop-shadow-md" /></div>
              <input type="text" value={niche} onChange={e => setNiche(e.target.value)} placeholder="e.g. law firms"
                className="input-field w-full pl-11 pr-4 py-3 rounded-xl text-[14px] font-bold shadow-inner" />
            </div>
          </div>
          <div>
            <label className="text-[11px] font-extrabold text-[var(--color-vexis-text)] uppercase tracking-widest mb-2.5 block drop-shadow-md">Target Location</label>
            <div className="relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--color-vexis-blue-hover)]"><IconSearch className="w-4 h-4 drop-shadow-md" /></div>
              <input type="text" value={location} onChange={e => setLocation(e.target.value)} placeholder="e.g. Lagos, Nigeria"
                className="input-field w-full pl-11 pr-4 py-3 rounded-xl text-[14px] font-bold shadow-inner" />
            </div>
          </div>
          <div>
            <label className="text-[11px] font-extrabold text-[var(--color-vexis-text)] uppercase tracking-widest mb-2.5 block drop-shadow-md">Target Volume</label>
            <div className="flex gap-3">
              <input type="number" value={maxLeads} onChange={e => setMaxLeads(Number(e.target.value))} min={5} max={50}
                className="input-field w-24 px-4 py-3 rounded-xl text-[14px] font-bold text-center shadow-inner" />
              <button onClick={handleSearch} disabled={isSearching || !niche.trim() || !location.trim()}
                className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-[14px] font-display font-bold shadow-md transition-all
                  ${isSearching ? "glass border-[var(--color-vexis-border)] text-[var(--color-vexis-text-muted)] cursor-not-allowed" : "btn-primary ring-1 ring-white/20"}`}>
                {isSearching ? <span className="animate-spin text-lg drop-shadow-md">⚙</span> : <IconSearch className="w-4 h-4 drop-shadow-md" />}
                {isSearching ? "Hunting..." : "Deploy Archer"}
              </button>
            </div>
          </div>
        </div>
      </div>

      {results && (
        <div className="reveal reveal-3 mb-6 flex items-center justify-between glass px-6 py-4 rounded-2xl shadow-lg border-l-4 border-l-[var(--color-vexis-blue-hover)]">
          <p className="text-[15px] font-bold text-white drop-shadow-sm">Found <span className="text-[var(--color-vexis-blue-hover)] font-black text-lg mx-1">{results.leads?.length || 0}</span> highly qualified targets.</p>
          <button className="btn-primary px-5 py-2 rounded-xl text-xs font-bold shadow-md">Export CSV</button>
        </div>
      )}

      <div className="space-y-3">
        {results?.leads?.map((lead: any, i: number) => (
          <div key={i} className={`glass glass-hover rounded-[20px] p-5 flex items-center gap-5 reveal reveal-${Math.min(i + 3, 8)} shadow-md`}>
            <div className={`w-12 h-12 rounded-[12px] flex items-center justify-center text-lg font-display font-black shadow-[inset_0_2px_10px_rgba(0,0,0,0.6)] border border-white/10
              ${lead.score >= 8 ? "badge-green" : lead.score >= 6 ? "badge-amber" : "badge-red"}`}>
              {lead.score}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-display font-bold text-white mb-1 drop-shadow-sm">{lead.name}</h3>
              <p className="text-[13px] font-medium text-[var(--color-vexis-text-secondary)]">{lead.address || "Address unavailable"}</p>
              <div className="flex flex-wrap gap-2 mt-4">
                {lead.gaps?.length ? lead.gaps.map((g: string) => (
                  <span key={g} className={`px-2.5 py-1 rounded-md text-[10px] font-black tracking-widest shadow-sm 
                    ${g === "no_website" ? "badge-red" : "badge-amber"}`}>
                    {g.replace(/_/g, " ").toUpperCase()}
                  </span>
                )) : <span className="px-2.5 py-1 rounded-md text-[10px] font-black tracking-widest shadow-sm badge-green">OPTIMIZED</span>}
              </div>
            </div>
            <button className="btn-primary w-12 h-12 rounded-2xl shadow-lg flex items-center justify-center"><IconPlus className="w-5 h-5" /></button>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ═══════════════ TASKS ═══════════════ */
function TasksTab() {
  const cols = [
    { title: "Quick Turnaround", sub: "Under 30 min", color: "var(--color-vexis-teal)", icon: <IconBolt /> },
    { title: "Standard Ops", sub: "1–4 hours", color: "var(--color-vexis-blue)", icon: <IconWrench /> },
    { title: "Deep Strategy", sub: "1+ day project", color: "var(--color-vexis-violet)", icon: <IconStack /> },
  ];
  return (
    <div className="flex-1 overflow-y-auto p-8">
      <div className="flex items-end justify-between mb-8 reveal reveal-1">
        <div>
          <h1 className="font-display font-black text-4xl text-white tracking-tight drop-shadow-lg">Task Queue</h1>
          <p className="text-[14px] font-medium text-[var(--color-vexis-text-secondary)] mt-1.5">Intelligently routed and managed by Atlas.</p>
        </div>
        <button className="btn-primary px-5 py-2.5 rounded-[12px] text-[14px] font-display font-black shadow-[0_0_15px_rgba(42,107,255,0.4)] ring-1 ring-white/20 flex items-center gap-2"><IconPlus className="w-4 h-4" /> Add Task</button>
      </div>
      <div className="grid grid-cols-3 gap-6">
        {cols.map((c, i) => (
          <div key={c.title} className={`reveal reveal-${i + 2}`}>
            <div className="flex items-center gap-3 mb-5 glass px-4 py-3 rounded-[16px] shadow-sm">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center shadow-inner" style={{ backgroundColor: `${c.color}25`, color: c.color, border: `1px solid ${c.color}40` }}>
                <div className="w-4 h-4 drop-shadow-md">{c.icon}</div>
              </div>
              <div>
                <h3 className="text-[12px] font-display font-black text-white tracking-widest uppercase drop-shadow-sm">{c.title}</h3>
                <span className="text-[10px] font-bold text-[var(--color-vexis-text-muted)] tracking-widest uppercase" style={{ color: c.color }}>{c.sub}</span>
              </div>
            </div>
            <div className="glass rounded-[24px] p-8 text-center border-2 border-dashed border-[var(--color-vexis-border)] shadow-md relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-duration-500" />
              <div className="w-12 h-12 rounded-[14px] glass mx-auto mb-4 flex items-center justify-center text-[var(--color-vexis-text-muted)] shadow-[inset_0_2px_10px_rgba(0,0,0,0.6)]">
                <IconTasks className="w-6 h-6" />
              </div>
              <p className="text-[13px] font-bold text-[var(--color-vexis-text-muted)] leading-relaxed uppercase tracking-wider">System queue clear.<br />Atlas will route tasks.</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ═══════════════ IFRAME TABS ═══════════════ */
function CalendarTab() {
  const url = process.env.NEXT_PUBLIC_CALCOM_URL || "";
  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <div className="px-12 py-10 border-b border-[var(--color-vexis-border)] glass z-20 shadow-2xl reveal reveal-1">
        <h1 className="font-display font-black text-5xl text-white tracking-tight drop-shadow-lg">Scheduling</h1>
        <p className="text-[15px] font-medium text-[var(--color-vexis-text-secondary)] mt-2 flex items-center gap-3">
          Powered by <span className="px-2.5 py-1 rounded-[8px] badge-blue font-black tracking-widest text-[10px] shadow-sm ring-1 ring-white/10 text-white">CAL.COM</span>
        </p>
      </div>
      {url ? <iframe src={url} className="flex-1 w-full border-0 bg-[var(--color-vexis-bg)]" title="Calendar" /> : (
        <div className="flex-1 flex flex-col items-center justify-center p-12 reveal reveal-2 bg-[var(--color-vexis-bg)]">
          <div className="w-28 h-28 rounded-[32px] glass flex items-center justify-center text-[var(--color-vexis-blue-hover)] mb-8 shadow-2xl relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-tr from-[var(--color-vexis-blue)]/20 to-transparent pointer-events-none" />
            <IconCalendar className="w-12 h-12 drop-shadow-md" />
          </div>
          <h2 className="font-display font-black text-3xl text-white mb-4 drop-shadow-lg">Connect Cal.com</h2>
          <p className="text-[15px] font-medium text-[var(--color-vexis-text-secondary)] max-w-md text-center leading-relaxed">Add your Cal.com booking link to the environment variables to enable seamless prospect scheduling within the command center.</p>
        </div>
      )}
    </div>
  );
}

function ContractsTab() {
  const url = process.env.NEXT_PUBLIC_DOCUMENSO_URL || "";
  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <div className="px-12 py-10 border-b border-[var(--color-vexis-border)] glass z-20 shadow-2xl reveal reveal-1">
        <h1 className="font-display font-black text-5xl text-white tracking-tight drop-shadow-lg">Agreements</h1>
        <p className="text-[15px] font-medium text-[var(--color-vexis-text-secondary)] mt-2 flex items-center gap-3">
          Powered by <span className="px-2.5 py-1 rounded-[8px] badge-green font-black tracking-widest text-[10px] shadow-sm ring-1 ring-white/10 text-white">DOCUMENSO</span>
        </p>
      </div>
      {url ? <iframe src={url} className="flex-1 w-full border-0 bg-[var(--color-vexis-bg)]" title="Contracts" /> : (
        <div className="flex-1 flex flex-col items-center justify-center p-12 reveal reveal-2 bg-[var(--color-vexis-bg)]">
          <div className="w-28 h-28 rounded-[32px] glass flex items-center justify-center text-[var(--color-vexis-teal)] mb-8 shadow-2xl relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-tr from-[var(--color-vexis-teal)]/20 to-transparent pointer-events-none" />
            <IconContracts className="w-12 h-12 drop-shadow-md" />
          </div>
          <h2 className="font-display font-black text-3xl text-white mb-4 drop-shadow-lg">Connect Documenso</h2>
          <p className="text-[15px] font-medium text-[var(--color-vexis-text-secondary)] max-w-md text-center leading-relaxed">Add your Documenso URL to the environment variables to handle digital signatures directly from the dashboard.</p>
        </div>
      )}
    </div>
  );
}

/* ═══════════════ SETTINGS ═══════════════ */
function SettingsTab({ user }: { user: any }) {
  const sections = [
    {
      title: "Account Parameters", icon: <IconConfig />, items: [
        { label: "Admin Email", value: user?.email || "—", type: "text" },
        { label: "Account ID", value: user?.id?.slice(0, 10) + "..." || "—", type: "mono" },
        { label: "Session State", value: isSupabaseConfigured ? "Authenticated" : "Sandbox Mode", type: isSupabaseConfigured ? "badge-green" : "badge-amber" },
      ]
    },
    {
      title: "API Integrations", icon: <IconStack />, items: [
        { label: "Groq Processing", value: "5 Keys Active", type: "badge-green" },
        { label: "Cal.com Webhook", value: process.env.NEXT_PUBLIC_CALCOM_API_KEY ? "Connected" : "Not set", type: process.env.NEXT_PUBLIC_CALCOM_API_KEY ? "badge-green" : "badge-amber" },
        { label: "Documenso API", value: process.env.NEXT_PUBLIC_DOCUMENSO_API_KEY ? "Connected" : "Not set", type: process.env.NEXT_PUBLIC_DOCUMENSO_API_KEY ? "badge-green" : "badge-amber" },
      ]
    },
    {
      title: "Artificial Intelligence", icon: <IconBolt />, items: [
        { label: "Autonomous Engine", value: "6 Instances Array", type: "badge-blue" },
        { label: "Execution Mode", value: USE_NULLCLAW ? "Live Edge" : "Standby Debug", type: USE_NULLCLAW ? "badge-green" : "badge-amber" },
      ]
    },
    {
      title: "Infrastructure", icon: <IconWrench />, items: [
        { label: "Frontend Host", value: "Vercel · Edge", type: "text" },
        { label: "Backend Core", value: "Containerized Engine", type: "text" },
        { label: "Memory State", value: "PostgreSQL + Redis", type: "text" },
        { label: "Identity", value: "Supabase Auth", type: "badge-blue" },
      ]
    },
  ];

  return (
    <div className="flex-1 overflow-y-auto p-12 space-y-10 max-w-6xl mx-auto w-full">
      <div className="reveal reveal-1 pb-6 glass px-10 py-8 rounded-[32px] shadow-2xl">
        <h1 className="font-display font-black text-5xl text-white tracking-tight drop-shadow-lg">System Preferences</h1>
        <p className="text-[15px] font-medium text-[var(--color-vexis-text-secondary)] mt-2">Manage routing, integrations, and core infrastructure variables.</p>
      </div>

      <div className="grid grid-cols-2 gap-8">
        {sections.map((section, si) => (
          <div key={section.title} className={`glass rounded-[32px] p-10 reveal reveal-${si + 2} shadow-2xl relative overflow-hidden`}>
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-3xl" />
            <div className="flex items-center gap-4 mb-8 border-b border-[var(--color-vexis-border)] pb-6 relative z-10">
              <div className="w-12 h-12 rounded-[16px] btn-primary flex items-center justify-center shadow-lg">
                <div className="text-white drop-shadow-md w-6 h-6">{section.icon}</div>
              </div>
              <h2 className="font-display font-black text-[15px] text-white uppercase tracking-widest drop-shadow-md">{section.title}</h2>
            </div>
            <div className="space-y-6 relative z-10">
              {section.items.map(item => (
                <div key={item.label} className="flex items-center justify-between glass px-5 py-3.5 rounded-2xl shadow-sm hover:shadow-lg transition-shadow">
                  <span className="text-[13px] font-extrabold text-[var(--color-vexis-text-secondary)] uppercase tracking-wider">{item.label}</span>
                  {item.type === "text" && <span className="text-[14px] font-bold text-white drop-shadow-sm">{item.value}</span>}
                  {item.type === "mono" && <span className="text-[13px] font-mono font-bold text-[var(--color-vexis-blue-hover)] bg-white/5 px-2.5 py-1 rounded shadow-inner border border-white/5">{item.value}</span>}
                  {item.type === "badge-green" && <span className="px-3 py-1.5 rounded-[10px] badge-green font-black tracking-widest text-[10px] drop-shadow-md">{item.value}</span>}
                  {item.type === "badge-amber" && <span className="px-3 py-1.5 rounded-[10px] badge-amber font-black tracking-widest text-[10px] drop-shadow-md">{item.value}</span>}
                  {item.type === "badge-blue" && <span className="px-3 py-1.5 rounded-[10px] badge-blue font-black tracking-widest text-[10px] drop-shadow-md text-white border-white/20">{item.value}</span>}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ═══════════════ MARKETPLACE ═══════════════ */
function MarketplaceTab() {
  const [agents, setAgents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [deploying, setDeploying] = useState<string | null>(null);

  useEffect(() => {
    fetch("http://localhost:8000/api/marketplace/agents")
      .then(res => res.json())
      .then(data => {
        if (data.agents) setAgents(data.agents);
        setLoading(false);
      })
      .catch(err => {
        console.error("Failed to fetch marketplace agents", err);
        setLoading(false);
      });
  }, []);

  const handleDeploy = (agentId: string) => {
    setDeploying(agentId);
    setTimeout(() => {
      alert(`[MOCK] Deployment initiated for ${agentId}. A secure API webhook has been sent to your primary email.`);
      setDeploying(null);
    }, 1500);
  };

  return (
    <div className="flex-1 overflow-y-auto p-12 space-y-10 max-w-7xl mx-auto w-full">
      <div className="reveal reveal-1 pb-6 glass px-10 py-10 rounded-[32px] shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-[var(--color-vexis-blue)]/20 rounded-full blur-[100px] pointer-events-none" />
        <h1 className="font-display font-black text-5xl text-white tracking-tight drop-shadow-lg relative z-10">B2B Agent Marketplace</h1>
        <p className="text-[16px] font-medium text-[var(--color-vexis-text-secondary)] mt-3 max-w-2xl relative z-10">
          Deploy highly-specialized AI personas directly to your clients. One click generates a fully hosted LangGraph execution webhook bundled with the agent's GitHub profile.
        </p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center p-20">
          <div className="w-10 h-10 rounded-full border-4 border-white/10 border-t-[var(--color-vexis-blue)] animate-spin shadow-[0_0_15px_var(--color-vexis-blue-hover)]" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {agents.map((agent, i) => (
            <div key={agent.id} className={`glass rounded-[24px] p-6 reveal reveal-${(i % 5) + 2} flex flex-col items-start shadow-xl border border-white/5 hover:border-white/20 transition-all hover:-translate-y-1 group relative overflow-hidden bg-white/[0.02]`}>
              <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none" />
              <div className="w-12 h-12 rounded-[16px] bg-white/5 flex items-center justify-center mb-5 shadow-inner border border-white/5 group-hover:bg-[var(--color-vexis-blue)]/20 transition-colors z-10">
                <IconStack className="w-6 h-6 text-white drop-shadow-md group-hover:text-[var(--color-vexis-blue-hover)] transition-colors" />
              </div>

              <div className="w-full relative z-10 flex-1">
                <div className="inline-block px-2.5 py-1 rounded-[8px] bg-white/10 text-[9px] font-black uppercase tracking-widest text-white/80 mb-3 shadow-sm">{agent.category}</div>
                <h3 className="font-display font-extrabold text-[17px] text-white tracking-tight leading-tight mb-2 drop-shadow-sm line-clamp-2">{agent.name}</h3>
                <p className="text-[12px] font-medium text-[var(--color-vexis-text-muted)] line-clamp-3 leading-relaxed">
                  {agent.description}
                </p>
              </div>

              <div className="w-full mt-6 pt-5 border-t border-[var(--color-vexis-border)]/50 relative z-10">
                <button
                  onClick={() => handleDeploy(agent.id)}
                  disabled={deploying === agent.id}
                  className="w-full px-4 py-3 rounded-xl btn-primary text-white text-[12px] font-black shadow-lg hover:shadow-[0_0_20px_rgba(42,107,255,0.4)] transition-all flex items-center justify-center gap-2 group-hover:scale-[1.02]"
                >
                  {deploying === agent.id ? "Deploying..." : "Deploy to Client"}
                  <svg className="w-4 h-4 drop-shadow-sm opacity-80" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
