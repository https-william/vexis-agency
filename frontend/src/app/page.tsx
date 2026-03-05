"use client";

import { useState, useCallback, useEffect } from "react";
import { Analytics } from "@vercel/analytics/next";
import ChatPanel from "@/components/ChatPanel";
import LoginPage from "@/components/LoginPage";
import { Agent, AGENTS, ChatMessage, API_BASE } from "@/lib/agents";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import {
  IconDashboard, IconAgents, IconLeads, IconTasks, IconCalendar,
  IconContracts, IconSettings, IconSignOut, IconSearch, IconPlus,
  IconRevenue, IconUptime, IconMail, IconBolt, IconWrench, IconStack, IconConfig
} from "@/components/Icons";

type Tab = "dashboard" | "agents" | "leads" | "tasks" | "calendar" | "contracts" | "settings";

export default function Home() {
  const [user, setUser] = useState<any>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<Tab>("dashboard");
  const [selectedAgent, setSelectedAgent] = useState<Agent>(AGENTS[0]);
  const [conversations, setConversations] = useState<Record<string, ChatMessage[]>>({});
  const [isTyping, setIsTyping] = useState(false);
  const [unreadCounts, setUnreadCounts] = useState<Record<string, number>>({});

  useEffect(() => {
    if (!isSupabaseConfigured) {
      setUser({ email: "dev@vexis.ai", id: "dev-bypass-1234" });
      setAuthLoading(false);
      return;
    }
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setAuthLoading(false);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);

  const handleSignOut = async () => {
    if (isSupabaseConfigured) await supabase.auth.signOut();
    setUser(null);
  };

  const currentMessages = conversations[selectedAgent.id] || [];

  const handleSendMessage = useCallback(async (message: string) => {
    const userMsg: ChatMessage = { id: `user-${Date.now()}`, role: "user", content: message, timestamp: new Date().toISOString(), type: "message" };
    setConversations(p => ({ ...p, [selectedAgent.id]: [...(p[selectedAgent.id] || []), userMsg] }));
    setIsTyping(true);

    try {
      const res = await fetch(`${API_BASE}/api/agents/${selectedAgent.id}/chat`, {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ message }),
      });
      if (!res.ok) throw new Error(`API error: ${res.status}`);
      const data = await res.json();
      const agentMsg: ChatMessage = {
        id: `agent-${Date.now()}`, agentId: selectedAgent.id, agentName: data.agent, agentTitle: data.agent_title,
        agentIcon: data.agent_icon, role: "agent", content: data.message, timestamp: data.timestamp, type: "message",
      };
      setConversations(p => ({ ...p, [selectedAgent.id]: [...(p[selectedAgent.id] || []), agentMsg] }));
      if (data.metadata?.handoff_to) {
        const t = AGENTS.find(a => a.id === data.metadata.handoff_to);
        if (t) setUnreadCounts(p => ({ ...p, [t.id]: (p[t.id] || 0) + 1 }));
      }
    } catch (err) {
      setConversations(p => ({
        ...p, [selectedAgent.id]: [...(p[selectedAgent.id] || []), {
          id: `err-${Date.now()}`, role: "agent", agentName: selectedAgent.name, agentTitle: selectedAgent.title,
          agentIcon: selectedAgent.icon, content: `Connection lost. Vexis Engine backend is unreachable at ${API_BASE.replace('http://', '').replace('https://', '').split('/')[0]}. If this is production, ensure your backend DO droplet is running.`,
          timestamp: new Date().toISOString(), type: "error",
        }]
      }));
    } finally { setIsTyping(false); }
  }, [selectedAgent]);

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--color-vexis-bg)] relative">
        <div className="aurora"><div className="aurora-orb aurora-1" /><div className="aurora-orb aurora-2" /></div>
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[var(--color-vexis-blue)] to-[var(--color-vexis-teal)] flex items-center justify-center animate-pulse relative z-10 shadow-xl shadow-[var(--color-vexis-blue)]/20">
          <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" /></svg>
        </div>
      </div>
    );
  }

  if (!user) return <LoginPage onAuth={() => supabase.auth.getSession().then(({ data }) => setUser(data.session?.user))} />;

  const navItems = [
    { id: "dashboard", icon: <IconDashboard />, label: "Dashboard" },
    { id: "agents", icon: <IconAgents />, label: "Agents" },
    { id: "leads", icon: <IconLeads />, label: "Leads" },
    { id: "tasks", icon: <IconTasks />, label: "Tasks" },
    { id: "calendar", icon: <IconCalendar />, label: "Calendar" },
    { id: "contracts", icon: <IconContracts />, label: "Contracts" },
    { id: "settings", icon: <IconSettings />, label: "Settings" },
  ] as const;

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar Navigation */}
      <aside className="w-[240px] flex-shrink-0 h-screen flex flex-col border-r border-[var(--color-vexis-border)] bg-[var(--color-vexis-surface)]/60 backdrop-blur-xl relative z-20">
        <div className="px-6 py-6 border-b border-[var(--color-vexis-border)]/50 reveal reveal-1">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[var(--color-vexis-blue)] to-[var(--color-vexis-teal)] flex items-center justify-center shadow-lg shadow-[var(--color-vexis-blue)]/15">
              <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" /></svg>
            </div>
            <div>
              <h1 className="font-display font-extrabold text-[15px] text-white tracking-tight">VEXIS</h1>
              <p className="text-[9px] text-[var(--color-vexis-text-secondary)] tracking-[0.15em] uppercase mt-0.5">Workspace</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 py-5 px-4 space-y-1 overflow-y-auto">
          <p className="text-[10px] font-semibold tracking-[0.2em] uppercase text-[var(--color-vexis-text-muted)] px-3 mb-3">Menu</p>
          {navItems.map((item, i) => (
            <button key={item.id} onClick={() => setActiveTab(item.id)}
              className={`reveal reveal-${i + 2} w-full flex items-center gap-3.5 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all
                ${activeTab === item.id
                  ? "nav-active"
                  : "text-[var(--color-vexis-text-secondary)] hover:text-white hover:bg-[var(--color-vexis-card)]"}`}>
              {item.icon}
              {item.label}
            </button>
          ))}
        </nav>

        <div className="px-4 py-5 border-t border-[var(--color-vexis-border)]/50 space-y-3 relative z-10 bg-[var(--color-vexis-surface)]/80">
          <div className="glass rounded-xl p-3.5">
            <div className="flex items-center gap-2 mb-2">
              <span className="w-2 h-2 rounded-full bg-[var(--color-vexis-green)] status-live" />
              <span className="text-[10px] font-semibold text-[var(--color-vexis-text)] uppercase tracking-wider">Fleet Online</span>
            </div>
            <div className="flex gap-0.5">
              {[1, 2, 3, 4, 5, 6].map(k => (
                <div key={k} className="flex-1 h-1 rounded-full bg-[var(--color-vexis-green)]/20">
                  <div className="h-full rounded-full bg-[var(--color-vexis-green)]" style={{ width: "100%" }} />
                </div>
              ))}
            </div>
          </div>
          <button onClick={handleSignOut} className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-[var(--color-vexis-text-muted)] font-medium hover:text-[var(--color-vexis-text)] hover:bg-[var(--color-vexis-card)] transition-colors">
            <IconSignOut className="w-4 h-4" /> Sign Out
          </button>
        </div>
      </aside>

      {/* Main Area */}
      <main className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden relative z-10">
        {activeTab === "dashboard" && <DashboardTab />}
        {activeTab === "agents" && (
          <AgentsTab agents={AGENTS} selectedAgent={selectedAgent}
            onSelectAgent={(a: Agent) => { setSelectedAgent(a); setUnreadCounts(p => ({ ...p, [a.id]: 0 })); }}
            messages={currentMessages} isTyping={isTyping} onSendMessage={handleSendMessage} unreadCounts={unreadCounts} />
        )}
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
function AgentsTab({ agents, selectedAgent, onSelectAgent, messages, isTyping, onSendMessage, unreadCounts }: any) {
  return (
    <div className="flex h-full w-full">
      <div className="w-[260px] flex-shrink-0 border-r border-[var(--color-vexis-border)] bg-[var(--color-vexis-bg)]/40 backdrop-blur-md flex flex-col">
        <div className="px-5 py-5 border-b border-[var(--color-vexis-border)]/50">
          <h2 className="font-display font-bold text-base text-white">AI Agents</h2>
          <p className="text-[11px] font-medium text-[var(--color-vexis-text-muted)] mt-0.5">6 specialized instances</p>
        </div>
        <div className="flex-1 overflow-y-auto p-3 space-y-1">
          {agents.map((agent: Agent) => {
            const isActive = agent.id === selectedAgent.id;
            const unread = unreadCounts[agent.id] || 0;
            return (
              <button key={agent.id} onClick={() => onSelectAgent(agent)}
                className={`w-full flex items-center gap-3.5 px-3 py-3 rounded-xl transition-all
                  ${isActive ? "bg-[var(--color-vexis-blue-muted)] shadow-[inset_0_0_0_1px_rgba(79,140,255,0.2)]" : "hover:bg-[var(--color-vexis-card)] border border-transparent"}`}>
                <div className={`relative w-10 h-10 rounded-[14px] flex items-center justify-center font-display font-bold text-lg
                  ${isActive ? "bg-[var(--color-vexis-blue)] text-white shadow-lg shadow-[var(--color-vexis-blue)]/20" : "bg-[var(--color-vexis-surface)] border border-[var(--color-vexis-border)] text-[var(--color-vexis-blue)]"}`}>
                  {agent.name[0]}
                  <span className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-[2.5px] border-[var(--color-vexis-bg)] bg-[var(--color-vexis-green)] ${agent.status === "online" ? "status-live" : ""}`} />
                </div>
                <div className="flex-1 text-left min-w-0">
                  <p className={`text-[13px] font-bold truncate ${isActive ? "text-[var(--color-vexis-blue)]" : "text-white"}`}>{agent.name}</p>
                  <p className="text-[11px] font-medium text-[var(--color-vexis-text-muted)] truncate">{agent.title}</p>
                </div>
                {unread > 0 && <span className="flex-shrink-0 w-5 h-5 rounded-full bg-[var(--color-vexis-blue)] text-white text-[10px] font-bold flex items-center justify-center shadow-lg shadow-[var(--color-vexis-blue)]/30">{unread}</span>}
              </button>
            );
          })}
        </div>
      </div>
      <ChatPanel agent={selectedAgent} messages={messages} isTyping={isTyping} onSendMessage={onSendMessage} />
    </div>
  );
}

/* ═══════════════ DASHBOARD ═══════════════ */
function DashboardTab() {
  const metrics = [
    { label: "Leads Found", value: "0", color: "var(--color-vexis-blue)" },
    { label: "Contacted", value: "0", color: "var(--color-vexis-teal)" },
    { label: "Replied", value: "0", color: "var(--color-vexis-amber)" },
    { label: "Calls Booked", value: "0", color: "var(--color-vexis-green)" },
    { label: "Deals Closed", value: "0", color: "var(--color-vexis-green)" },
  ];

  return (
    <div className="flex-1 overflow-y-auto p-10 space-y-8">
      <div className="flex items-end justify-between reveal reveal-1">
        <div>
          <h1 className="font-display font-black text-4xl text-white tracking-tight">Overview</h1>
          <p className="text-sm font-medium text-[var(--color-vexis-text-secondary)] mt-1.5">Real-time performance across all agent operations.</p>
        </div>
        <div className="text-right">
          <p className="font-display font-black text-[42px] tracking-tight leading-none text-gradient-gold">$0</p>
          <p className="text-[10px] font-bold text-[var(--color-vexis-text-muted)] uppercase tracking-[0.15em] mt-1.5 flex items-center justify-end gap-1"><IconRevenue className="w-3.5 h-3.5" /> Total Revenue</p>
        </div>
      </div>

      <div className="glass rounded-3xl p-8 reveal reveal-2 relative overflow-hidden group">
        <div className="absolute inset-0 bg-gradient-to-r from-[var(--color-vexis-blue)]/5 to-[var(--color-vexis-teal)]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        <div className="flex items-center gap-2 mb-6">
          <IconDashboard className="w-4 h-4 text-[var(--color-vexis-blue)]" />
          <h2 className="font-display font-bold text-[13px] text-[var(--color-vexis-text)] uppercase tracking-wider">Sales Pipeline</h2>
        </div>
        <div className="flex items-end gap-5 relative z-10">
          {metrics.map(m => (
            <div key={m.label} className="flex-1 text-center">
              <div className="h-24 rounded-2xl mb-4 flex items-end justify-center transition-all hover:scale-105" style={{ background: `linear-gradient(to top, ${m.color}08, transparent)` }}>
                <div className="w-full h-1.5 rounded-t-xl opacity-60" style={{ backgroundColor: m.color }} />
              </div>
              <p className="font-display font-extrabold text-2xl text-white">{m.value}</p>
              <p className="text-[10px] font-semibold text-[var(--color-vexis-text-muted)] uppercase tracking-wider mt-1">{m.label}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-5">
        {[{ icon: <IconUptime />, title: "Agent Uptime", value: "99.9%", sub: "All 6 online", c: "var(--color-vexis-green)" },
        { icon: <IconMail />, title: "Email Opens", value: "—", sub: "No campaigns yet", c: "var(--color-vexis-teal)" },
        { icon: <IconStack />, title: "Avg Deal Size", value: "$0", sub: "Close first deal", c: "var(--color-vexis-blue)" },
        ].map((k, i) => (
          <div key={k.title} className={`glass glass-hover rounded-[24px] p-6 reveal reveal-${i + 3}`}>
            <div className="flex items-center gap-2 mb-3">
              <span className="text-[var(--color-vexis-text-muted)]">{k.icon}</span>
              <span className="text-[11px] font-bold text-[var(--color-vexis-text-muted)] uppercase tracking-wider">{k.title}</span>
            </div>
            <p className="font-display font-extrabold text-[28px] text-white tracking-tight">{k.value}</p>
            <p className="text-[11px] font-medium mt-1.5" style={{ color: k.c }}>{k.sub}</p>
          </div>
        ))}
      </div>

      <div className="reveal reveal-6">
        <div className="flex items-center gap-2 mb-4">
          <IconBolt className="w-4 h-4 text-[var(--color-vexis-blue)]" />
          <h2 className="font-display font-bold text-[13px] text-[var(--color-vexis-text)] uppercase tracking-wider">Agent Fleet</h2>
        </div>
        <div className="grid grid-cols-3 gap-4">
          {AGENTS.map(agent => (
            <div key={agent.id} className="glass glass-hover rounded-[20px] p-5 flex items-center gap-4">
              <div className="w-12 h-12 rounded-[14px] bg-[var(--color-vexis-surface)] border border-[var(--color-vexis-border)] flex items-center justify-center font-display font-bold text-xl text-[var(--color-vexis-blue)] shadow-inner">
                {agent.name[0]}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[15px] font-display font-bold text-white truncate">{agent.name}</p>
                <p className="text-[11px] font-medium text-[var(--color-vexis-text-muted)] truncate mt-0.5">{agent.title}</p>
              </div>
              <div className="flex flex-col items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[var(--color-vexis-green)] shadow-[0_0_12px_rgba(52,211,153,0.6)] status-live" />
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
    <div className="flex-1 overflow-y-auto p-10 space-y-8">
      <div className="reveal reveal-1">
        <h1 className="font-display font-black text-4xl text-white tracking-tight">Lead Engine</h1>
        <p className="text-sm font-medium text-[var(--color-vexis-text-secondary)] mt-1.5">Archer&apos;s pipeline — scrape, analyze, score, target.</p>
      </div>

      <div className="glass rounded-[24px] p-8 reveal reveal-2 relative overflow-hidden group">
        <div className="absolute inset-0 bg-gradient-to-br from-[var(--color-vexis-blue)]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        <div className="grid grid-cols-3 gap-5 relative z-10">
          <div>
            <label className="text-[10px] font-bold text-[var(--color-vexis-text-muted)] uppercase tracking-[0.15em] mb-2 block">Niche / Industry</label>
            <div className="relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--color-vexis-text-muted)]"><IconSearch className="w-4 h-4" /></div>
              <input type="text" value={niche} onChange={e => setNiche(e.target.value)} placeholder="e.g. law firms"
                className="input-field w-full pl-11 pr-4 py-3.5 rounded-xl text-[13px] font-medium" />
            </div>
          </div>
          <div>
            <label className="text-[10px] font-bold text-[var(--color-vexis-text-muted)] uppercase tracking-[0.15em] mb-2 block">Target Location</label>
            <div className="relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--color-vexis-text-muted)]"><IconSearch className="w-4 h-4" /></div>
              <input type="text" value={location} onChange={e => setLocation(e.target.value)} placeholder="e.g. Lagos, Nigeria"
                className="input-field w-full pl-11 pr-4 py-3.5 rounded-xl text-[13px] font-medium" />
            </div>
          </div>
          <div>
            <label className="text-[10px] font-bold text-[var(--color-vexis-text-muted)] uppercase tracking-[0.15em] mb-2 block">Target Volume</label>
            <div className="flex gap-3">
              <input type="number" value={maxLeads} onChange={e => setMaxLeads(Number(e.target.value))} min={5} max={50}
                className="input-field w-24 px-4 py-3.5 rounded-xl text-[13px] font-medium text-center" />
              <button onClick={handleSearch} disabled={isSearching || !niche.trim() || !location.trim()}
                className={`flex-1 flex items-center justify-center gap-2 py-3.5 rounded-xl text-[13px] font-display font-bold transition-all
                  ${isSearching ? "bg-[var(--color-vexis-surface)] text-[var(--color-vexis-text-muted)] border border-[var(--color-vexis-border)]" : "btn-primary"}`}>
                {isSearching ? <span className="animate-spin text-lg">⚙</span> : <IconSearch className="w-4 h-4" />}
                {isSearching ? "Hunting..." : "Deploy Archer"}
              </button>
            </div>
          </div>
        </div>
        <div className="flex flex-wrap gap-2 mt-5 relative z-10">
          <span className="text-[10px] font-semibold text-[var(--color-vexis-text-muted)] uppercase tracking-wider py-1.5 mr-2">Presets:</span>
          {[{ n: "Law Firms", l: "Lagos" }, { n: "Dental Clinics", l: "London" }, { n: "Real Estate", l: "Dubai" }, { n: "SaaS Startups", l: "San Francisco" }].map(p => (
            <button key={`${p.n}-${p.l}`} onClick={() => { setNiche(p.n); setLocation(p.l); }}
              className="glass glass-hover px-3.5 py-1.5 rounded-lg text-[11px] font-medium text-[var(--color-vexis-text-secondary)] hover:text-white transition-colors">{p.n} · {p.l}</button>
          ))}
        </div>
      </div>

      {error && <div className="glass rounded-xl p-4 border-l-4 border-[var(--color-vexis-red)] bg-[var(--color-vexis-red)]/5"><p className="text-sm font-medium text-[var(--color-vexis-red)]">{error}</p></div>}

      {results && (
        <div className="reveal reveal-3 mb-4 flex items-center justify-between">
          <p className="text-[13px] font-semibold text-[var(--color-vexis-text)]">Found <span className="text-[var(--color-vexis-blue)] font-bold">{results.leads?.length || 0}</span> highly qualified targets.</p>
          <button className="btn-ghost px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5">Export CSV</button>
        </div>
      )}

      <div className="space-y-3">
        {results?.leads?.map((lead: any, i: number) => (
          <div key={i} className={`glass glass-hover rounded-[16px] p-5 flex items-start gap-5 reveal reveal-${Math.min(i + 3, 8)}`}>
            <div className={`w-12 h-12 rounded-[12px] flex items-center justify-center text-lg font-display font-black shadow-inner
              ${lead.score >= 8 ? "badge-green" : lead.score >= 6 ? "badge-amber" : "badge-red"}`}>
              {lead.score}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-base font-display font-bold text-white mb-0.5">{lead.name}</h3>
              <p className="text-[12px] font-medium text-[var(--color-vexis-text-muted)]">{lead.address || "Address unavailable"}</p>
              <div className="flex flex-wrap gap-1.5 mt-2.5">
                {lead.gaps?.length ? lead.gaps.map((g: string) => (
                  <span key={g} className={`px-2 py-0.5 rounded text-[10px] font-semibold tracking-wide 
                    ${g === "no_website" ? "bg-[var(--color-vexis-red)]/10 text-[var(--color-vexis-red)]" : "bg-[var(--color-vexis-amber)]/10 text-[var(--color-vexis-amber)]"}`}>
                    {g.replace(/_/g, " ").toUpperCase()}
                  </span>
                )) : <span className="px-2 py-0.5 rounded text-[10px] font-semibold tracking-wide bg-[var(--color-vexis-green)]/10 text-[var(--color-vexis-green)]">OPTIMIZED</span>}
              </div>
            </div>
            <button className="btn-ghost p-2.5 rounded-xl"><IconPlus className="w-4 h-4" /></button>
          </div>
        ))}
      </div>

      {!results && !isSearching && (
        <div className="glass rounded-[32px] p-20 text-center reveal reveal-3 max-w-2xl mx-auto mt-12">
          <div className="w-20 h-20 rounded-[20px] bg-gradient-to-br from-[var(--color-vexis-blue)]/20 to-[var(--color-vexis-teal)]/10 flex items-center justify-center mx-auto mb-6 shadow-xl shadow-[var(--color-vexis-blue)]/10">
            <IconSearch className="w-8 h-8 text-[var(--color-vexis-blue)]" />
          </div>
          <h3 className="font-display font-black text-2xl text-white mb-2 tracking-tight">System Ready for Deployment</h3>
          <p className="text-[13px] font-medium text-[var(--color-vexis-text-secondary)] leading-relaxed max-w-md mx-auto">Define your target parameters above. Archer uses advanced scraping and semantic analysis to find and score high-intent B2B leads.</p>
        </div>
      )}
    </div>
  );
}

/* ═══════════════ TASKS ═══════════════ */
function TasksTab() {
  const cols = [
    { title: "Quick Turnaround", sub: "Under 30 min", color: "var(--color-vexis-teal)", icon: <IconBolt /> },
    { title: "Standard Operations", sub: "1–4 hours", color: "var(--color-vexis-blue)", icon: <IconWrench /> },
    { title: "Deep Strategy", sub: "1+ day project", color: "var(--color-vexis-violet)", icon: <IconStack /> },
  ];
  return (
    <div className="flex-1 overflow-y-auto p-10">
      <div className="flex items-end justify-between mb-8 reveal reveal-1">
        <div>
          <h1 className="font-display font-black text-4xl text-white tracking-tight">Task Queue</h1>
          <p className="text-sm font-medium text-[var(--color-vexis-text-secondary)] mt-1.5">Intelligently routed and managed by Atlas.</p>
        </div>
        <button className="btn-primary px-5 py-2.5 rounded-xl text-[13px] font-display font-bold flex items-center gap-2"><IconPlus className="w-4 h-4" /> Add Task</button>
      </div>
      <div className="grid grid-cols-3 gap-6">
        {cols.map((c, i) => (
          <div key={c.title} className={`reveal reveal-${i + 2}`}>
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${c.color}20`, color: c.color }}>
                <div className="w-3.5 h-3.5">{c.icon}</div>
              </div>
              <div>
                <h3 className="text-[13px] font-display font-extrabold text-white tracking-wide">{c.title}</h3>
                <span className="text-[10px] font-semibold text-[var(--color-vexis-text-muted)] uppercase tracking-wider">{c.sub}</span>
              </div>
            </div>
            <div className="bg-[var(--color-vexis-surface)]/50 rounded-2xl p-10 text-center border-2 border-dashed border-[var(--color-vexis-border)]/50">
              <p className="text-xs font-medium text-[var(--color-vexis-text-muted)] leading-relaxed">System queue is currently clear.<br />Atlas will auto-route tasks upon deal closure.</p>
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
      <div className="px-10 py-8 border-b border-[var(--color-vexis-border)] bg-[var(--color-vexis-bg)]/80 backdrop-blur-md relative z-10 reveal reveal-1">
        <h1 className="font-display font-black text-4xl text-white tracking-tight">Scheduling</h1>
        <p className="text-sm font-medium text-[var(--color-vexis-text-secondary)] mt-1.5 flex items-center gap-2">
          Powered by <span className="px-1.5 py-0.5 rounded bg-[var(--color-vexis-card)] text-[var(--color-vexis-blue)] font-bold text-xs">Cal.com</span>
        </p>
      </div>
      {url ? <iframe src={url} className="flex-1 w-full border-0 bg-white" title="Calendar" /> : (
        <div className="flex-1 flex flex-col items-center justify-center p-10 reveal reveal-2">
          <div className="w-20 h-20 rounded-[24px] bg-[var(--color-vexis-card)] flex items-center justify-center text-[var(--color-vexis-blue)] mb-5 shadow-xl shadow-black/20"><IconCalendar className="w-8 h-8" /></div>
          <h2 className="font-display font-extrabold text-2xl text-white mb-2">Connect Cal.com</h2>
          <p className="text-sm font-medium text-[var(--color-vexis-text-muted)] max-w-sm text-center">Add your Cal.com booking link to the environment variables to enable seamless prospect scheduling within the dashboard.</p>
        </div>
      )}
    </div>
  );
}

function ContractsTab() {
  const url = process.env.NEXT_PUBLIC_DOCUMENSO_URL || "";
  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <div className="px-10 py-8 border-b border-[var(--color-vexis-border)] bg-[var(--color-vexis-bg)]/80 backdrop-blur-md relative z-10 reveal reveal-1">
        <h1 className="font-display font-black text-4xl text-white tracking-tight">Agreements</h1>
        <p className="text-sm font-medium text-[var(--color-vexis-text-secondary)] mt-1.5 flex items-center gap-2">
          Powered by <span className="px-1.5 py-0.5 rounded bg-[var(--color-vexis-card)] text-[var(--color-vexis-teal)] font-bold text-xs">Documenso</span>
        </p>
      </div>
      {url ? <iframe src={url} className="flex-1 w-full border-0 bg-white" title="Contracts" /> : (
        <div className="flex-1 flex flex-col items-center justify-center p-10 reveal reveal-2">
          <div className="w-20 h-20 rounded-[24px] bg-[var(--color-vexis-card)] flex items-center justify-center text-[var(--color-vexis-teal)] mb-5 shadow-xl shadow-black/20"><IconContracts className="w-8 h-8" /></div>
          <h2 className="font-display font-extrabold text-2xl text-white mb-2">Connect Documenso</h2>
          <p className="text-sm font-medium text-[var(--color-vexis-text-muted)] max-w-sm text-center">Add your Documenso URL to the environment variables to handle digital signatures directly from the command center.</p>
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
        { label: "NullClaw Runtime", value: "6 Instances Array", type: "badge-blue" },
        { label: "Execution Mode", value: process.env.NEXT_PUBLIC_USE_NULLCLAW === "true" ? "Live" : "Standby Validation", type: process.env.NEXT_PUBLIC_USE_NULLCLAW === "true" ? "badge-green" : "badge-amber" },
      ]
    },
    {
      title: "Infrastructure", icon: <IconWrench />, items: [
        { label: "Frontend Host", value: "Vercel · Next.js 16 Edge", type: "text" },
        { label: "Backend Core", value: "Docker Containerized OS", type: "text" },
        { label: "Memory State", value: "PostgreSQL 15 + Redis 7", type: "text" },
        { label: "Identity", value: "Supabase Auth", type: "badge-blue" },
      ]
    },
  ];

  return (
    <div className="flex-1 overflow-y-auto p-10 space-y-8 max-w-5xl mx-auto w-full">
      <div className="reveal reveal-1 border-b border-[var(--color-vexis-border)] pb-6">
        <h1 className="font-display font-black text-4xl text-white tracking-tight">System Preferences</h1>
        <p className="text-sm font-medium text-[var(--color-vexis-text-secondary)] mt-1.5">Manage routing, integrations, and core infrastructure variables.</p>
      </div>

      <div className="grid grid-cols-2 gap-6">
        {sections.map((section, si) => (
          <div key={section.title} className={`glass rounded-[24px] p-7 reveal reveal-${si + 2}`}>
            <div className="flex items-center gap-2.5 mb-6 border-b border-[var(--color-vexis-border)] pb-4">
              <div className="text-[var(--color-vexis-blue)]">{section.icon}</div>
              <h2 className="font-display font-bold text-[14px] text-white uppercase tracking-wider">{section.title}</h2>
            </div>
            <div className="space-y-4">
              {section.items.map(item => (
                <div key={item.label} className="flex items-center justify-between">
                  <span className="text-[13px] font-medium text-[var(--color-vexis-text-secondary)]">{item.label}</span>
                  {item.type === "text" && <span className="text-[13px] font-semibold text-white">{item.value}</span>}
                  {item.type === "mono" && <span className="text-[12px] font-mono font-medium text-[var(--color-vexis-blue)] px-2 py-0.5 rounded bg-[var(--color-vexis-blue)]/10">{item.value}</span>}
                  {item.type === "badge-green" && (
                    <span className="px-2.5 py-1 rounded-[8px] border border-[var(--color-vexis-green)]/20 text-[10px] font-bold tracking-wide bg-[var(--color-vexis-green)]/10 text-[var(--color-vexis-green)]">{item.value}</span>
                  )}
                  {item.type === "badge-amber" && (
                    <span className="px-2.5 py-1 rounded-[8px] border border-[var(--color-vexis-amber)]/20 text-[10px] font-bold tracking-wide bg-[var(--color-vexis-amber)]/10 text-[var(--color-vexis-amber)]">{item.value}</span>
                  )}
                  {item.type === "badge-blue" && (
                    <span className="px-2.5 py-1 rounded-[8px] border border-[var(--color-vexis-blue)]/20 text-[10px] font-bold tracking-wide bg-[var(--color-vexis-blue)]/10 text-[var(--color-vexis-blue)]">{item.value}</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
