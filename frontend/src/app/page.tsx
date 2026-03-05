"use client";

import { useState, useCallback, useEffect } from "react";
import { Analytics } from "@vercel/analytics/next";
import ChatPanel from "@/components/ChatPanel";
import LoginPage from "@/components/LoginPage";
import { Agent, AGENTS, ChatMessage, API_BASE } from "@/lib/agents";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";

type Tab = "dashboard" | "agents" | "leads" | "tasks" | "calendar" | "contracts" | "settings";

export default function Home() {
  const [user, setUser] = useState<any>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<Tab>("dashboard");
  const [selectedAgent, setSelectedAgent] = useState<Agent>(AGENTS[0]);
  const [conversations, setConversations] = useState<Record<string, ChatMessage[]>>({});
  const [isTyping, setIsTyping] = useState(false);
  const [unreadCounts, setUnreadCounts] = useState<Record<string, number>>({});

  // Check auth state
  useEffect(() => {
    if (!isSupabaseConfigured) {
      setUser({ email: "dev@vexis.ai" }); // Skip auth in dev
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
    await supabase.auth.signOut();
    setUser(null);
  };

  const currentMessages = conversations[selectedAgent.id] || [];

  const handleSendMessage = useCallback(async (message: string) => {
    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`, role: "user", content: message,
      timestamp: new Date().toISOString(), type: "message",
    };
    setConversations(p => ({ ...p, [selectedAgent.id]: [...(p[selectedAgent.id] || []), userMsg] }));
    setIsTyping(true);

    try {
      const res = await fetch(`${API_BASE}/api/agents/${selectedAgent.id}/chat`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message }),
      });
      if (!res.ok) throw new Error(`API error: ${res.status}`);
      const data = await res.json();
      const agentMsg: ChatMessage = {
        id: `agent-${Date.now()}`, agentId: selectedAgent.id, agentName: data.agent,
        agentTitle: data.agent_title, agentIcon: data.agent_icon, role: "agent",
        content: data.message, timestamp: data.timestamp, type: "message",
      };
      setConversations(p => ({ ...p, [selectedAgent.id]: [...(p[selectedAgent.id] || []), agentMsg] }));
      if (data.metadata?.handoff_to) {
        const t = AGENTS.find(a => a.id === data.metadata.handoff_to);
        if (t) setUnreadCounts(p => ({ ...p, [t.id]: (p[t.id] || 0) + 1 }));
      }
    } catch (err) {
      setConversations(p => ({
        ...p, [selectedAgent.id]: [...(p[selectedAgent.id] || []), {
          id: `err-${Date.now()}`, role: "agent", agentName: selectedAgent.name,
          agentTitle: selectedAgent.title, agentIcon: selectedAgent.icon,
          content: `Connection failed. Ensure the gateway runs on ${API_BASE}.`,
          timestamp: new Date().toISOString(), type: "error",
        }]
      }));
    } finally { setIsTyping(false); }
  }, [selectedAgent]);

  // Auth gate
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--color-vexis-bg)]">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[var(--color-vexis-accent)] to-[#c49a3a] flex items-center justify-center animate-pulse">
          <span className="text-[var(--color-vexis-bg)] font-bold text-xl font-display">V</span>
        </div>
      </div>
    );
  }

  if (!user) return <LoginPage onAuth={() => supabase.auth.getSession().then(({ data }) => setUser(data.session?.user))} />;

  const navItems: { id: Tab; icon: string; label: string }[] = [
    { id: "dashboard", icon: "⬡", label: "Dashboard" },
    { id: "agents", icon: "◉", label: "Agents" },
    { id: "leads", icon: "◎", label: "Leads" },
    { id: "tasks", icon: "▣", label: "Tasks" },
    { id: "calendar", icon: "◫", label: "Calendar" },
    { id: "contracts", icon: "▧", label: "Contracts" },
    { id: "settings", icon: "⚙", label: "Settings" },
  ];

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Navigation Sidebar */}
      <aside className="w-[220px] flex-shrink-0 h-screen flex flex-col border-r border-[var(--color-vexis-border)] bg-[var(--color-vexis-surface)]">
        {/* Logo */}
        <div className="px-5 py-5 border-b border-[var(--color-vexis-border)] reveal reveal-1">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[var(--color-vexis-accent)] to-[#c49a3a] flex items-center justify-center">
              <span className="text-[var(--color-vexis-bg)] font-bold text-sm font-display">V</span>
            </div>
            <div>
              <h1 className="font-display font-bold text-sm text-gradient-gold tracking-tight">VEXIS</h1>
              <p className="text-[9px] text-[var(--color-vexis-text-muted)] tracking-[0.12em] uppercase">Command Center</p>
            </div>
          </div>
        </div>

        {/* Nav items */}
        <nav className="flex-1 py-4 px-3 space-y-0.5">
          <p className="text-[9px] font-semibold tracking-[0.15em] uppercase text-[var(--color-vexis-text-muted)] px-3 mb-3">Navigation</p>
          {navItems.map((item, i) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`reveal reveal-${i + 2} w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left text-sm transition-all
                ${activeTab === item.id
                  ? "nav-active font-semibold"
                  : "text-[var(--color-vexis-text-secondary)] hover:text-[var(--color-vexis-text)] hover:bg-[var(--color-vexis-card)]"
                }`}
            >
              <span className="text-xs w-5 text-center">{item.icon}</span>
              {item.label}
            </button>
          ))}
        </nav>

        {/* User + status */}
        <div className="px-3 py-4 border-t border-[var(--color-vexis-border)] space-y-3">
          <div className="glass rounded-xl p-3">
            <div className="flex items-center gap-1.5 mb-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-[var(--color-vexis-green)]" />
              <span className="text-[9px] font-semibold text-[var(--color-vexis-green)] uppercase tracking-wider">Systems Online</span>
            </div>
            <div className="flex gap-0.5">
              {[1, 2, 3, 4, 5].map(k => (
                <div key={k} className="flex-1 h-0.5 rounded-full bg-[var(--color-vexis-green)]/30">
                  <div className="h-full rounded-full bg-[var(--color-vexis-green)]" style={{ width: "100%" }} />
                </div>
              ))}
            </div>
          </div>
          <button onClick={handleSignOut} className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-[11px] text-[var(--color-vexis-text-muted)] hover:text-[var(--color-vexis-red)] hover:bg-[var(--color-vexis-red)]/5 transition-all">
            ↳ Sign Out
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        {activeTab === "dashboard" && <DashboardTab />}
        {activeTab === "agents" && (
          <AgentsTab
            agents={AGENTS} selectedAgent={selectedAgent}
            onSelectAgent={(a) => { setSelectedAgent(a); setUnreadCounts(p => ({ ...p, [a.id]: 0 })); }}
            messages={currentMessages} isTyping={isTyping}
            onSendMessage={handleSendMessage} unreadCounts={unreadCounts}
          />
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
function AgentsTab({ agents, selectedAgent, onSelectAgent, messages, isTyping, onSendMessage, unreadCounts }: {
  agents: Agent[]; selectedAgent: Agent; onSelectAgent: (a: Agent) => void;
  messages: ChatMessage[]; isTyping: boolean; onSendMessage: (m: string) => void;
  unreadCounts: Record<string, number>;
}) {
  return (
    <div className="flex h-full">
      {/* Agent list panel */}
      <div className="w-[240px] flex-shrink-0 border-r border-[var(--color-vexis-border)] bg-[var(--color-vexis-bg)] flex flex-col">
        <div className="px-5 py-4 border-b border-[var(--color-vexis-border)]">
          <h2 className="font-display font-bold text-sm text-white">AI Agents</h2>
          <p className="text-[10px] text-[var(--color-vexis-text-muted)]">6 agents · all online</p>
        </div>
        <div className="flex-1 overflow-y-auto p-2 space-y-0.5">
          {agents.map(agent => {
            const isActive = agent.id === selectedAgent.id;
            const unread = unreadCounts[agent.id] || 0;
            return (
              <button key={agent.id} onClick={() => onSelectAgent(agent)}
                className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all
                  ${isActive ? "bg-[var(--color-vexis-accent-muted)] border border-[var(--color-vexis-accent)]/20" : "hover:bg-[var(--color-vexis-card)] border border-transparent"}`}>
                <div className="relative w-9 h-9 rounded-xl bg-[var(--color-vexis-card)] flex items-center justify-center text-base">
                  {agent.icon}
                  <span className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-[var(--color-vexis-bg)] bg-[var(--color-vexis-green)] ${agent.status === "online" ? "status-pulse" : ""}`} />
                </div>
                <div className="flex-1 text-left min-w-0">
                  <p className={`text-sm font-semibold truncate ${isActive ? "text-[var(--color-vexis-accent)]" : "text-[var(--color-vexis-text)]"}`}>{agent.name}</p>
                  <p className="text-[10px] text-[var(--color-vexis-text-muted)] truncate">{agent.title}</p>
                </div>
                {unread > 0 && (
                  <span className="flex-shrink-0 w-4 h-4 rounded-full bg-[var(--color-vexis-accent)] text-[var(--color-vexis-bg)] text-[9px] font-bold flex items-center justify-center">{unread}</span>
                )}
              </button>
            );
          })}
        </div>
      </div>
      {/* Chat panel */}
      <ChatPanel agent={selectedAgent} messages={messages} isTyping={isTyping} onSendMessage={onSendMessage} />
    </div>
  );
}

/* ═══════════════ DASHBOARD ═══════════════ */
function DashboardTab() {
  const metrics = [
    { label: "Leads Found", value: "0", color: "var(--color-vexis-accent)" },
    { label: "Contacted", value: "0", color: "var(--color-vexis-cyan)" },
    { label: "Replied", value: "0", color: "var(--color-vexis-amber)" },
    { label: "Calls Booked", value: "0", color: "var(--color-vexis-green)" },
    { label: "Deals Closed", value: "0", color: "var(--color-vexis-green)" },
  ];

  return (
    <div className="flex-1 overflow-y-auto p-8 space-y-6">
      <div className="flex items-end justify-between reveal reveal-1">
        <div>
          <h1 className="font-display font-extrabold text-3xl text-white tracking-tight">Dashboard</h1>
          <p className="text-sm text-[var(--color-vexis-text-muted)] mt-1">Real-time performance across all agents</p>
        </div>
        <div className="text-right">
          <p className="font-display font-extrabold text-4xl text-gradient-gold">$0</p>
          <p className="text-[9px] text-[var(--color-vexis-text-muted)] uppercase tracking-wider">Revenue</p>
        </div>
      </div>

      {/* Pipeline */}
      <div className="glass rounded-2xl p-6 glow-gold reveal reveal-2">
        <h2 className="font-display font-bold text-xs text-[var(--color-vexis-accent)] uppercase tracking-wider mb-5">Sales Pipeline</h2>
        <div className="flex items-end gap-4">
          {metrics.map(m => (
            <div key={m.label} className="flex-1 text-center">
              <div className="h-20 rounded-xl mb-3 flex items-end justify-center" style={{ background: `linear-gradient(to top, ${m.color}06, transparent)` }}>
                <div className="w-full h-1 rounded-t-lg opacity-40" style={{ backgroundColor: m.color }} />
              </div>
              <p className="font-display font-bold text-xl text-white">{m.value}</p>
              <p className="text-[9px] text-[var(--color-vexis-text-muted)] uppercase tracking-wider mt-1">{m.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { icon: "⏱", title: "Agent Uptime", value: "99.9%", sub: "All 6 online", c: "var(--color-vexis-green)" },
          { icon: "📧", title: "Email Opens", value: "—", sub: "No campaigns yet", c: "var(--color-vexis-cyan)" },
          { icon: "💰", title: "Avg Deal", value: "$0", sub: "Close first deal", c: "var(--color-vexis-accent)" },
        ].map((k, i) => (
          <div key={k.title} className={`glass glass-hover rounded-2xl p-5 reveal reveal-${i + 3}`}>
            <div className="flex items-center gap-2 mb-3">
              <span className="text-sm">{k.icon}</span>
              <span className="text-[10px] text-[var(--color-vexis-text-muted)] uppercase tracking-wider">{k.title}</span>
            </div>
            <p className="font-display font-extrabold text-2xl text-white">{k.value}</p>
            <p className="text-[10px] mt-1" style={{ color: k.c }}>{k.sub}</p>
          </div>
        ))}
      </div>

      {/* Agent fleet */}
      <div className="reveal reveal-6">
        <h2 className="font-display font-bold text-xs text-[var(--color-vexis-accent)] uppercase tracking-wider mb-3">Agent Fleet</h2>
        <div className="grid grid-cols-3 gap-3">
          {AGENTS.map(agent => (
            <div key={agent.id} className="glass glass-hover rounded-xl p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[var(--color-vexis-card)] flex items-center justify-center text-base">{agent.icon}</div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-display font-bold text-white">{agent.name}</p>
                <p className="text-[9px] text-[var(--color-vexis-text-muted)]">{agent.title}</p>
              </div>
              <div className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-vexis-green)] status-pulse" />
                <span className="text-[8px] text-[var(--color-vexis-green)] font-mono">ON</span>
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
    <div className="flex-1 overflow-y-auto p-8 space-y-6">
      <div className="reveal reveal-1">
        <h1 className="font-display font-extrabold text-3xl text-white tracking-tight">Lead Engine</h1>
        <p className="text-sm text-[var(--color-vexis-text-muted)] mt-1">Archer&apos;s pipeline — scrape, analyze, score</p>
      </div>

      <div className="glass glow-gold rounded-2xl p-6 reveal reveal-2">
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="text-[9px] text-[var(--color-vexis-text-muted)] uppercase tracking-wider mb-1.5 block">Niche</label>
            <input type="text" value={niche} onChange={e => setNiche(e.target.value)} placeholder="e.g. law firms"
              className="input-obsidian w-full px-4 py-3 rounded-xl text-sm" />
          </div>
          <div>
            <label className="text-[9px] text-[var(--color-vexis-text-muted)] uppercase tracking-wider mb-1.5 block">Location</label>
            <input type="text" value={location} onChange={e => setLocation(e.target.value)} placeholder="e.g. Lagos, Nigeria"
              className="input-obsidian w-full px-4 py-3 rounded-xl text-sm" />
          </div>
          <div>
            <label className="text-[9px] text-[var(--color-vexis-text-muted)] uppercase tracking-wider mb-1.5 block">Max</label>
            <div className="flex gap-3">
              <input type="number" value={maxLeads} onChange={e => setMaxLeads(Number(e.target.value))} min={5} max={50}
                className="input-obsidian w-20 px-3 py-3 rounded-xl text-sm" />
              <button onClick={handleSearch} disabled={isSearching || !niche.trim() || !location.trim()}
                className={`flex-1 py-3 rounded-xl text-sm font-display font-bold ${isSearching ? "bg-[var(--color-vexis-card)] text-[var(--color-vexis-text-muted)]" : "btn-gold"}`}>
                {isSearching ? "Searching..." : "◎ Search"}
              </button>
            </div>
          </div>
        </div>
        <div className="flex flex-wrap gap-2 mt-4">
          {[{ n: "Law Firms", l: "Lagos" }, { n: "Dental Clinics", l: "London" }, { n: "Real Estate", l: "Dubai" }, { n: "Restaurants", l: "Sydney" }].map(p => (
            <button key={`${p.n}-${p.l}`} onClick={() => { setNiche(p.n); setLocation(p.l); }}
              className="glass glass-hover px-3 py-1.5 rounded-lg text-[9px] text-[var(--color-vexis-text-muted)] hover:text-[var(--color-vexis-accent)]">{p.n} · {p.l}</button>
          ))}
        </div>
      </div>

      {error && <div className="glass rounded-xl p-4 border-l-4 border-[var(--color-vexis-red)]"><p className="text-sm text-[var(--color-vexis-red)]">{error}</p></div>}

      {results?.leads?.map((lead: any, i: number) => (
        <div key={i} className={`glass glass-hover rounded-xl p-4 flex items-start gap-4 reveal reveal-${Math.min(i + 1, 8)}`}>
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-display font-bold ${lead.score >= 8 ? "score-high" : lead.score >= 6 ? "score-mid" : "score-low"}`}>{lead.score}</div>
          <div className="flex-1">
            <h3 className="text-sm font-display font-bold text-white">{lead.name}</h3>
            <p className="text-[10px] text-[var(--color-vexis-text-muted)]">{lead.address}</p>
            <div className="flex flex-wrap gap-1 mt-1.5">
              {lead.gaps?.map((g: string) => (
                <span key={g} className={`px-2 py-0.5 rounded text-[8px] font-mono ${g === "no_website" ? "bg-[var(--color-vexis-red)]/10 text-[var(--color-vexis-red)]" : "bg-[var(--color-vexis-amber)]/10 text-[var(--color-vexis-amber)]"}`}>{g.replace(/_/g, " ")}</span>
              ))}
            </div>
          </div>
        </div>
      ))}

      {!results && !isSearching && (
        <div className="glass rounded-2xl p-16 text-center reveal reveal-3">
          <div className="w-16 h-16 rounded-2xl bg-[var(--color-vexis-card)] flex items-center justify-center text-3xl mx-auto mb-4 glow-gold">🎯</div>
          <h3 className="font-display font-bold text-lg text-white mb-1">Ready to Hunt</h3>
          <p className="text-sm text-[var(--color-vexis-text-muted)]">Enter a niche and location above to get started.</p>
        </div>
      )}
    </div>
  );
}

/* ═══════════════ TASKS ═══════════════ */
function TasksTab() {
  const cols = [
    { title: "Quick", sub: "Under 30 min", color: "var(--color-vexis-green)", icon: "⚡" },
    { title: "Medium", sub: "1–2 hours", color: "var(--color-vexis-amber)", icon: "🔧" },
    { title: "Complex", sub: "1+ day", color: "var(--color-vexis-red)", icon: "🏗️" },
  ];
  return (
    <div className="flex-1 overflow-y-auto p-8">
      <div className="flex items-end justify-between mb-6 reveal reveal-1">
        <div>
          <h1 className="font-display font-extrabold text-3xl text-white tracking-tight">Task Queue</h1>
          <p className="text-sm text-[var(--color-vexis-text-muted)] mt-1">Managed by Atlas</p>
        </div>
        <button className="btn-gold px-4 py-2 rounded-xl text-sm font-display font-bold">+ Add Task</button>
      </div>
      <div className="grid grid-cols-3 gap-6">
        {cols.map((c, i) => (
          <div key={c.title} className={`reveal reveal-${i + 2}`}>
            <div className="flex items-center gap-2 mb-3">
              <span>{c.icon}</span>
              <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: c.color }} />
              <h3 className="text-sm font-display font-bold text-white">{c.title}</h3>
              <span className="text-[9px] text-[var(--color-vexis-text-muted)]">{c.sub}</span>
            </div>
            <div className="glass rounded-xl p-10 text-center border border-dashed border-[var(--color-vexis-border)]">
              <p className="text-sm text-[var(--color-vexis-text-muted)]">Tasks appear when deals close</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ═══════════════ CALENDAR ═══════════════ */
function CalendarTab() {
  const url = process.env.NEXT_PUBLIC_CALCOM_URL || "";
  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <div className="px-8 py-5 border-b border-[var(--color-vexis-border)] reveal reveal-1">
        <h1 className="font-display font-extrabold text-3xl text-white tracking-tight">Calendar</h1>
        <p className="text-sm text-[var(--color-vexis-text-muted)] mt-1">Prospect scheduling · Cal.com</p>
      </div>
      {url ? <iframe src={url} className="flex-1 w-full border-0" title="Calendar" /> : (
        <div className="flex-1 flex flex-col items-center justify-center p-8 reveal reveal-2">
          <div className="w-16 h-16 rounded-2xl bg-[var(--color-vexis-card)] flex items-center justify-center text-3xl mb-4 glow-gold">📅</div>
          <h2 className="font-display font-bold text-lg text-white mb-1">Connect Cal.com</h2>
          <p className="text-sm text-[var(--color-vexis-text-muted)] mb-4">Set <code className="px-1 py-0.5 rounded bg-[var(--color-vexis-card)] text-[var(--color-vexis-accent)] text-xs font-mono">NEXT_PUBLIC_CALCOM_URL</code></p>
        </div>
      )}
    </div>
  );
}

/* ═══════════════ CONTRACTS ═══════════════ */
function ContractsTab() {
  const url = process.env.NEXT_PUBLIC_DOCUMENSO_URL || "";
  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <div className="px-8 py-5 border-b border-[var(--color-vexis-border)] reveal reveal-1">
        <h1 className="font-display font-extrabold text-3xl text-white tracking-tight">Contracts</h1>
        <p className="text-sm text-[var(--color-vexis-text-muted)] mt-1">E-signatures · Documenso</p>
      </div>
      {url ? <iframe src={url} className="flex-1 w-full border-0" title="Contracts" /> : (
        <div className="flex-1 flex flex-col items-center justify-center p-8 reveal reveal-2">
          <div className="w-16 h-16 rounded-2xl bg-[var(--color-vexis-card)] flex items-center justify-center text-3xl mb-4 glow-gold">📄</div>
          <h2 className="font-display font-bold text-lg text-white mb-1">Connect Documenso</h2>
          <p className="text-sm text-[var(--color-vexis-text-muted)] mb-4">Set <code className="px-1 py-0.5 rounded bg-[var(--color-vexis-card)] text-[var(--color-vexis-accent)] text-xs font-mono">NEXT_PUBLIC_DOCUMENSO_URL</code></p>
        </div>
      )}
    </div>
  );
}

/* ═══════════════ SETTINGS ═══════════════ */
function SettingsTab({ user }: { user: any }) {
  const sections = [
    {
      title: "Account", items: [
        { label: "Email", value: user?.email || "—", type: "text" },
        { label: "User ID", value: user?.id?.slice(0, 8) + "..." || "—", type: "mono" },
      ]
    },
    {
      title: "API Keys", items: [
        { label: "Groq Keys", value: "5 keys configured", type: "badge-green" },
        { label: "Cal.com", value: process.env.NEXT_PUBLIC_CALCOM_API_KEY ? "Connected" : "Not set", type: process.env.NEXT_PUBLIC_CALCOM_API_KEY ? "badge-green" : "badge-amber" },
        { label: "Documenso", value: process.env.NEXT_PUBLIC_DOCUMENSO_API_KEY ? "Connected" : "Not set", type: process.env.NEXT_PUBLIC_DOCUMENSO_API_KEY ? "badge-green" : "badge-amber" },
      ]
    },
    {
      title: "NullClaw Agents", items: [
        { label: "Runtime", value: "6 instances configured", type: "badge-green" },
        { label: "NullClaw Mode", value: process.env.NEXT_PUBLIC_USE_NULLCLAW === "true" ? "Active" : "Standby", type: process.env.NEXT_PUBLIC_USE_NULLCLAW === "true" ? "badge-green" : "badge-amber" },
      ]
    },
    {
      title: "Infrastructure", items: [
        { label: "Frontend", value: "Vercel (Next.js 16)", type: "text" },
        { label: "Backend", value: "Docker (FastAPI + NullClaw)", type: "text" },
        { label: "Database", value: "PostgreSQL + Redis", type: "text" },
        { label: "Auth", value: "Supabase", type: "badge-green" },
      ]
    },
  ];

  return (
    <div className="flex-1 overflow-y-auto p-8 space-y-6">
      <div className="reveal reveal-1">
        <h1 className="font-display font-extrabold text-3xl text-white tracking-tight">Settings</h1>
        <p className="text-sm text-[var(--color-vexis-text-muted)] mt-1">Configuration & integrations</p>
      </div>

      {sections.map((section, si) => (
        <div key={section.title} className={`glass rounded-2xl p-5 reveal reveal-${si + 2}`}>
          <h2 className="font-display font-bold text-xs text-[var(--color-vexis-accent)] uppercase tracking-wider mb-4">{section.title}</h2>
          <div className="space-y-3">
            {section.items.map(item => (
              <div key={item.label} className="flex items-center justify-between py-2 border-b border-[var(--color-vexis-border)] last:border-0">
                <span className="text-sm text-[var(--color-vexis-text-secondary)]">{item.label}</span>
                {item.type === "text" && <span className="text-sm text-white">{item.value}</span>}
                {item.type === "mono" && <span className="text-sm text-white font-mono">{item.value}</span>}
                {item.type === "badge-green" && (
                  <span className="px-2.5 py-1 rounded-lg text-[10px] font-semibold bg-[var(--color-vexis-green)]/10 text-[var(--color-vexis-green)]">{item.value}</span>
                )}
                {item.type === "badge-amber" && (
                  <span className="px-2.5 py-1 rounded-lg text-[10px] font-semibold bg-[var(--color-vexis-amber)]/10 text-[var(--color-vexis-amber)]">{item.value}</span>
                )}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
