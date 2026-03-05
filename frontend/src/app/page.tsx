"use client";

import { useState, useCallback } from "react";
import AgentSidebar from "@/components/AgentSidebar";
import ChatPanel from "@/components/ChatPanel";
import { Agent, AGENTS, ChatMessage, API_BASE } from "@/lib/agents";

type Tab = "dashboard" | "agents" | "leads" | "tasks" | "calendar" | "contracts";

export default function Home() {
  const [activeTab, setActiveTab] = useState<Tab>("agents");
  const [selectedAgent, setSelectedAgent] = useState<Agent>(AGENTS[0]);
  const [conversations, setConversations] = useState<Record<string, ChatMessage[]>>({});
  const [isTyping, setIsTyping] = useState(false);
  const [unreadCounts, setUnreadCounts] = useState<Record<string, number>>({});

  const currentMessages = conversations[selectedAgent.id] || [];

  const handleSelectAgent = useCallback((agent: Agent) => {
    setSelectedAgent(agent);
    setUnreadCounts((prev) => ({ ...prev, [agent.id]: 0 }));
  }, []);

  const handleSendMessage = useCallback(
    async (message: string) => {
      const userMsg: ChatMessage = {
        id: `user-${Date.now()}`,
        role: "user",
        content: message,
        timestamp: new Date().toISOString(),
        type: "message",
      };

      setConversations((prev) => ({
        ...prev,
        [selectedAgent.id]: [...(prev[selectedAgent.id] || []), userMsg],
      }));

      setIsTyping(true);

      try {
        const res = await fetch(`${API_BASE}/api/agents/${selectedAgent.id}/chat`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ message }),
        });

        if (!res.ok) throw new Error(`API error: ${res.status}`);
        const data = await res.json();

        const agentMsg: ChatMessage = {
          id: `agent-${Date.now()}`,
          agentId: selectedAgent.id,
          agentName: data.agent,
          agentTitle: data.agent_title,
          agentIcon: data.agent_icon,
          role: "agent",
          content: data.message,
          timestamp: data.timestamp,
          type: "message",
        };

        setConversations((prev) => ({
          ...prev,
          [selectedAgent.id]: [...(prev[selectedAgent.id] || []), agentMsg],
        }));

        if (data.metadata?.handoff_to) {
          const target = AGENTS.find(a => a.id === data.metadata.handoff_to);
          if (target) {
            setUnreadCounts((prev) => ({
              ...prev,
              [target.id]: (prev[target.id] || 0) + 1,
            }));
          }
        }
      } catch (err) {
        const errorMsg: ChatMessage = {
          id: `err-${Date.now()}`,
          role: "agent",
          agentName: selectedAgent.name,
          agentTitle: selectedAgent.title,
          agentIcon: selectedAgent.icon,
          content: `Connection failed. Ensure the gateway is running on ${API_BASE}.\n\n${err instanceof Error ? err.message : "Unknown error"}`,
          timestamp: new Date().toISOString(),
          type: "error",
        };
        setConversations((prev) => ({
          ...prev,
          [selectedAgent.id]: [...(prev[selectedAgent.id] || []), errorMsg],
        }));
      } finally {
        setIsTyping(false);
      }
    },
    [selectedAgent]
  );

  const tabs: { id: Tab; label: string; icon: string }[] = [
    { id: "dashboard", label: "Overview", icon: "◈" },
    { id: "agents", label: "Agents", icon: "◉" },
    { id: "leads", label: "Leads", icon: "◎" },
    { id: "tasks", label: "Tasks", icon: "▣" },
    { id: "calendar", label: "Calendar", icon: "◫" },
    { id: "contracts", label: "Contracts", icon: "▧" },
  ];

  return (
    <div className="flex h-screen overflow-hidden">
      <AgentSidebar
        agents={AGENTS}
        selectedAgent={selectedAgent}
        onSelectAgent={handleSelectAgent}
        unreadCounts={unreadCounts}
      />

      <div className="flex-1 flex flex-col min-w-0">
        {/* Top navigation */}
        <nav className="flex items-center gap-1 px-6 py-2.5 border-b border-[var(--color-vexis-border)] bg-[var(--color-vexis-surface)]/80 backdrop-blur-sm reveal reveal-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2
                ${activeTab === tab.id
                  ? "bg-[var(--color-vexis-accent-muted)] text-[var(--color-vexis-accent)] font-display"
                  : "text-[var(--color-vexis-text-muted)] hover:text-[var(--color-vexis-text)] hover:bg-[var(--color-vexis-card)]"
                }`}
            >
              <span className="text-[10px]">{tab.icon}</span>
              {tab.label}
            </button>
          ))}

          <div className="ml-auto flex items-center gap-3">
            <span className="text-[10px] text-[var(--color-vexis-text-muted)] font-mono tracking-wider">
              {new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
            </span>
            <button className="btn-gold px-4 py-1.5 rounded-lg text-xs font-display">
              + New Task
            </button>
          </div>
        </nav>

        {/* Tab content */}
        {activeTab === "agents" && (
          <ChatPanel
            agent={selectedAgent}
            messages={currentMessages}
            isTyping={isTyping}
            onSendMessage={handleSendMessage}
          />
        )}

        {activeTab === "dashboard" && <DashboardTab />}
        {activeTab === "leads" && <LeadSearchTab />}
        {activeTab === "tasks" && <TasksTab />}
        {activeTab === "calendar" && <CalendarTab />}
        {activeTab === "contracts" && <ContractsTab />}
      </div>
    </div>
  );
}

/* ═══════════════════ DASHBOARD ═══════════════════ */
function DashboardTab() {
  const metrics = [
    { label: "Leads Found", value: "0", icon: "◎", color: "var(--color-vexis-accent)" },
    { label: "Contacted", value: "0", icon: "◉", color: "var(--color-vexis-cyan)" },
    { label: "Replied", value: "0", icon: "◈", color: "var(--color-vexis-amber)" },
    { label: "Calls Booked", value: "0", icon: "◫", color: "var(--color-vexis-green)" },
    { label: "Deals Closed", value: "0", icon: "◆", color: "var(--color-vexis-green)" },
  ];

  return (
    <div className="flex-1 overflow-y-auto p-8 space-y-8">
      {/* Hero header */}
      <div className="flex items-end justify-between reveal reveal-1">
        <div>
          <p className="text-[11px] font-semibold tracking-[0.2em] uppercase text-[var(--color-vexis-accent)] mb-2 font-display">Dashboard</p>
          <h1 className="font-display font-extrabold text-3xl text-white tracking-tight">Command Overview</h1>
          <p className="text-sm text-[var(--color-vexis-text-muted)] mt-1">Real-time performance across all agents</p>
        </div>
        <div className="text-right">
          <p className="font-display font-extrabold text-4xl text-gradient-gold">$0</p>
          <p className="text-[10px] text-[var(--color-vexis-text-muted)] uppercase tracking-wider">Total Revenue</p>
        </div>
      </div>

      {/* Pipeline funnel */}
      <div className="glass rounded-2xl p-6 glow-gold reveal reveal-2">
        <h2 className="font-display font-bold text-sm text-[var(--color-vexis-accent)] uppercase tracking-wider mb-5">Sales Pipeline</h2>
        <div className="flex items-end gap-4">
          {metrics.map((m, i) => (
            <div key={m.label} className="flex-1 text-center group">
              <div className="mb-3 relative">
                <div className="h-24 rounded-xl flex items-end justify-center overflow-hidden" style={{ background: `linear-gradient(to top, ${m.color}08, transparent)` }}>
                  <div
                    className="w-full rounded-t-lg transition-all duration-1000 group-hover:opacity-100 opacity-50"
                    style={{ backgroundColor: m.color, height: "4px" }}
                  />
                </div>
              </div>
              <p className="font-display font-bold text-2xl text-white">{m.value}</p>
              <p className="text-[10px] text-[var(--color-vexis-text-muted)] uppercase tracking-wider mt-1">{m.label}</p>
              {i < metrics.length - 1 && (
                <div className="hidden" />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { icon: "⏱", title: "Agent Uptime", value: "99.9%", sub: "All 6 agents active", accent: "var(--color-vexis-green)" },
          { icon: "📧", title: "Email Open Rate", value: "—", sub: "No campaigns yet", accent: "var(--color-vexis-cyan)" },
          { icon: "💰", title: "Avg Deal Size", value: "$0", sub: "Close your first deal", accent: "var(--color-vexis-accent)" },
        ].map((kpi, i) => (
          <div key={kpi.title} className={`glass glass-hover gold-border rounded-2xl p-5 reveal reveal-${i + 3}`}>
            <div className="flex items-center gap-2 mb-4">
              <span className="text-lg">{kpi.icon}</span>
              <span className="text-[11px] text-[var(--color-vexis-text-muted)] uppercase tracking-wider">{kpi.title}</span>
            </div>
            <p className="font-display font-extrabold text-2xl text-white">{kpi.value}</p>
            <p className="text-[11px] mt-1" style={{ color: kpi.accent }}>{kpi.sub}</p>
          </div>
        ))}
      </div>

      {/* Agent Grid */}
      <div className="reveal reveal-6">
        <h2 className="font-display font-bold text-sm text-[var(--color-vexis-accent)] uppercase tracking-wider mb-4">Agent Fleet</h2>
        <div className="grid grid-cols-3 gap-3">
          {AGENTS.map((agent) => (
            <div key={agent.id} className="glass glass-hover gold-border rounded-xl p-4 flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[var(--color-vexis-card)] to-[var(--color-vexis-card-hover)] flex items-center justify-center text-lg">
                {agent.icon}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-display font-bold text-white">{agent.name}</p>
                <p className="text-[10px] text-[var(--color-vexis-text-muted)] truncate">{agent.title}</p>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[var(--color-vexis-green)] status-pulse" />
                <span className="text-[9px] text-[var(--color-vexis-green)] font-mono">ON</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Activity feed */}
      <div className="glass rounded-2xl p-6 reveal reveal-7">
        <h2 className="font-display font-bold text-sm text-[var(--color-vexis-accent)] uppercase tracking-wider mb-4">Activity Log</h2>
        <div className="text-center py-10">
          <div className="w-16 h-16 rounded-2xl bg-[var(--color-vexis-card)] flex items-center justify-center text-3xl mx-auto mb-4">🚀</div>
          <p className="text-sm text-[var(--color-vexis-text-muted)]">
            No activity yet. Start with <span className="text-[var(--color-vexis-accent)] font-display font-bold">Archer</span> to find leads.
          </p>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════ LEAD SEARCH ═══════════════════ */
function LeadSearchTab() {
  const [niche, setNiche] = useState("");
  const [location, setLocation] = useState("");
  const [maxLeads, setMaxLeads] = useState(20);
  const [isSearching, setIsSearching] = useState(false);
  const [results, setResults] = useState<any>(null);
  const [error, setError] = useState("");

  const handleSearch = async () => {
    if (!niche.trim() || !location.trim()) return;
    setIsSearching(true);
    setError("");
    setResults(null);
    try {
      const res = await fetch(`${API_BASE}/api/leads/search`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ niche: niche.trim(), location: location.trim(), max_leads: maxLeads, analyze_websites: false }),
      });
      if (!res.ok) throw new Error(`API error: ${res.status}`);
      setResults(await res.json());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Search failed");
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="flex-1 overflow-y-auto p-8 space-y-6">
      <div className="reveal reveal-1">
        <p className="text-[11px] font-semibold tracking-[0.2em] uppercase text-[var(--color-vexis-accent)] mb-2 font-display">Lead Engine</p>
        <h1 className="font-display font-extrabold text-3xl text-white tracking-tight">Find Prospects</h1>
        <p className="text-sm text-[var(--color-vexis-text-muted)] mt-1">Archer&apos;s pipeline — scrape, analyze gaps, score for outreach</p>
      </div>

      {/* Search form */}
      <div className="glass glow-gold rounded-2xl p-6 reveal reveal-2">
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="text-[10px] text-[var(--color-vexis-text-muted)] uppercase tracking-wider mb-2 block">Niche</label>
            <input
              type="text" value={niche} onChange={(e) => setNiche(e.target.value)}
              placeholder="e.g. law firms"
              className="input-obsidian w-full px-4 py-3 rounded-xl text-sm"
            />
          </div>
          <div>
            <label className="text-[10px] text-[var(--color-vexis-text-muted)] uppercase tracking-wider mb-2 block">Location</label>
            <input
              type="text" value={location} onChange={(e) => setLocation(e.target.value)}
              placeholder="e.g. Lagos, Nigeria"
              className="input-obsidian w-full px-4 py-3 rounded-xl text-sm"
            />
          </div>
          <div>
            <label className="text-[10px] text-[var(--color-vexis-text-muted)] uppercase tracking-wider mb-2 block">Max Results</label>
            <div className="flex items-center gap-3">
              <input
                type="number" value={maxLeads} onChange={(e) => setMaxLeads(Number(e.target.value))}
                min={5} max={50}
                className="input-obsidian w-20 px-4 py-3 rounded-xl text-sm"
              />
              <button
                onClick={handleSearch} disabled={isSearching || !niche.trim() || !location.trim()}
                className={`flex-1 px-6 py-3 rounded-xl text-sm font-display font-bold transition-all flex items-center justify-center gap-2 ${isSearching ? "bg-[var(--color-vexis-card)] text-[var(--color-vexis-text-muted)] cursor-wait" : "btn-gold"
                  }`}
              >
                {isSearching ? <><span className="animate-spin">⏳</span> Searching...</> : <>◎ Search</>}
              </button>
            </div>
          </div>
        </div>

        {/* Presets */}
        <div className="flex flex-wrap gap-2 mt-4">
          {[
            { n: "Law Firms", l: "Lagos" },
            { n: "Dental Clinics", l: "London" },
            { n: "Real Estate", l: "Dubai" },
            { n: "Restaurants", l: "Sydney" },
            { n: "SaaS Companies", l: "San Francisco" },
          ].map((p) => (
            <button
              key={`${p.n}-${p.l}`}
              onClick={() => { setNiche(p.n); setLocation(p.l); }}
              className="glass glass-hover px-3 py-1.5 rounded-lg text-[10px] text-[var(--color-vexis-text-muted)] hover:text-[var(--color-vexis-accent)] transition-colors"
            >
              {p.n} · {p.l}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div className="glass rounded-xl p-4 border-l-4 border-[var(--color-vexis-red)] reveal reveal-1">
          <p className="text-sm text-[var(--color-vexis-red)]">{error}</p>
        </div>
      )}

      {results && (
        <>
          <div className="glass rounded-2xl p-6 reveal reveal-1">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display font-bold text-sm text-[var(--color-vexis-accent)] uppercase tracking-wider">Results</h2>
              <button
                onClick={() => {
                  const blob = new Blob([results.csv || ""], { type: "text/csv" });
                  const a = document.createElement("a");
                  a.href = URL.createObjectURL(blob);
                  a.download = `leads_${niche}.csv`;
                  a.click();
                }}
                className="btn-ghost px-3 py-1.5 rounded-lg text-[11px] text-[var(--color-vexis-green)]"
              >
                ↓ Export CSV
              </button>
            </div>
            <div className="grid grid-cols-4 gap-4">
              {[
                { v: results.total_found, l: "Found", c: "var(--color-vexis-text)" },
                { v: results.high_score_count, l: "High Priority", c: "var(--color-vexis-accent)" },
                { v: results.leads?.filter((l: any) => l.gaps?.includes("no_website")).length || 0, l: "No Website", c: "var(--color-vexis-red)" },
                { v: results.leads?.filter((l: any) => l.gaps?.includes("low_rating")).length || 0, l: "Low Rating", c: "var(--color-vexis-amber)" },
              ].map((s) => (
                <div key={s.l} className="text-center p-4 rounded-xl bg-[var(--color-vexis-bg)]/50">
                  <p className="font-display font-extrabold text-2xl" style={{ color: s.c }}>{s.v}</p>
                  <p className="text-[10px] text-[var(--color-vexis-text-muted)] uppercase tracking-wider mt-1">{s.l}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            {results.leads?.map((lead: any, i: number) => (
              <div key={i} className={`glass glass-hover gold-border rounded-xl p-4 flex items-start gap-4 reveal reveal-${Math.min(i + 1, 8)}`}>
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center text-sm font-display font-bold ${lead.score >= 8 ? "score-high" : lead.score >= 6 ? "score-mid" : "score-low"
                  }`}>
                  {lead.score}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-display font-bold text-white">{lead.name}</h3>
                    {lead.score >= 7 && (
                      <span className="px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider bg-[var(--color-vexis-accent-muted)] text-[var(--color-vexis-accent)]">
                        Priority
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-[var(--color-vexis-text-muted)] mt-0.5">{lead.address}</p>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {lead.gaps?.map((gap: string) => (
                      <span key={gap} className={`px-2 py-0.5 rounded text-[9px] font-mono ${gap === "no_website" ? "bg-[var(--color-vexis-red)]/10 text-[var(--color-vexis-red)]" :
                          gap === "low_rating" ? "bg-[var(--color-vexis-amber)]/10 text-[var(--color-vexis-amber)]" :
                            "bg-[var(--color-vexis-card)] text-[var(--color-vexis-text-muted)]"
                        }`}>
                        {gap.replace(/_/g, " ")}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="text-right space-y-1 flex-shrink-0">
                  {lead.phone && <p className="text-[11px] text-[var(--color-vexis-text-muted)] font-mono">{lead.phone}</p>}
                  {lead.rating != null && <p className="text-[11px] text-[var(--color-vexis-amber)]">★ {lead.rating}</p>}
                </div>
              </div>
            ))}
          </div>

          {results.for_nova?.length > 0 && (
            <div className="glass glow-gold rounded-2xl p-6 border border-[var(--color-vexis-accent)]/20">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-display font-bold text-sm text-white">{results.for_nova.length} leads ready for Nova</h3>
                  <p className="text-[11px] text-[var(--color-vexis-text-muted)] mt-0.5">Pitch angles prepared for outreach</p>
                </div>
                <button className="btn-gold px-5 py-2.5 rounded-xl text-sm font-display font-bold">
                  ⚡ Send to Nova
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {!results && !isSearching && !error && (
        <div className="glass rounded-2xl p-16 text-center reveal reveal-3">
          <div className="w-20 h-20 rounded-2xl bg-[var(--color-vexis-card)] flex items-center justify-center text-4xl mx-auto mb-5 glow-gold">🎯</div>
          <h3 className="font-display font-bold text-xl text-white mb-2">Ready to Hunt</h3>
          <p className="text-sm text-[var(--color-vexis-text-muted)] max-w-md mx-auto">
            Enter a niche and location above. Archer will search, analyze gaps, and score leads for outreach.
          </p>
        </div>
      )}
    </div>
  );
}

/* ═══════════════════ TASKS ═══════════════════ */
function TasksTab() {
  const columns = [
    { title: "Quick", subtitle: "Under 30 min", color: "var(--color-vexis-green)", icon: "⚡" },
    { title: "Medium", subtitle: "1–2 hours", color: "var(--color-vexis-amber)", icon: "🔧" },
    { title: "Complex", subtitle: "1+ day", color: "var(--color-vexis-red)", icon: "🏗️" },
  ];

  return (
    <div className="flex-1 overflow-y-auto p-8">
      <div className="flex items-end justify-between mb-8 reveal reveal-1">
        <div>
          <p className="text-[11px] font-semibold tracking-[0.2em] uppercase text-[var(--color-vexis-accent)] mb-2 font-display">Fulfillment</p>
          <h1 className="font-display font-extrabold text-3xl text-white tracking-tight">Task Queue</h1>
          <p className="text-sm text-[var(--color-vexis-text-muted)] mt-1">Sorted by complexity · managed by Atlas</p>
        </div>
        <button className="btn-gold px-5 py-2.5 rounded-xl text-sm font-display font-bold">+ Add Task</button>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {columns.map((col, i) => (
          <div key={col.title} className={`reveal reveal-${i + 2}`}>
            <div className="flex items-center gap-2 mb-4">
              <span>{col.icon}</span>
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: col.color }} />
              <h3 className="text-sm font-display font-bold text-white">{col.title}</h3>
              <span className="text-[10px] text-[var(--color-vexis-text-muted)]">{col.subtitle}</span>
              <span className="ml-auto text-[10px] font-mono text-[var(--color-vexis-text-muted)] bg-[var(--color-vexis-card)] px-2 py-0.5 rounded">0</span>
            </div>
            <div className="glass rounded-xl p-8 text-center border border-dashed border-[var(--color-vexis-border)]">
              <p className="text-sm text-[var(--color-vexis-text-muted)]">
                Tasks from closed deals appear here
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ═══════════════════ CALENDAR ═══════════════════ */
function CalendarTab() {
  const calUrl = process.env.NEXT_PUBLIC_CALCOM_URL || "";

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <div className="px-8 py-5 border-b border-[var(--color-vexis-border)] reveal reveal-1">
        <p className="text-[11px] font-semibold tracking-[0.2em] uppercase text-[var(--color-vexis-accent)] mb-2 font-display">Scheduling</p>
        <h1 className="font-display font-extrabold text-3xl text-white tracking-tight">Calendar</h1>
        <p className="text-sm text-[var(--color-vexis-text-muted)] mt-1">Prospect call scheduling — powered by Cal.com</p>
      </div>

      {calUrl ? (
        <iframe src={calUrl} className="flex-1 w-full border-0" title="Calendar" allow="camera; microphone; fullscreen" />
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center p-8 reveal reveal-2">
          <div className="w-20 h-20 rounded-2xl bg-[var(--color-vexis-card)] flex items-center justify-center text-4xl mb-5 glow-gold">📅</div>
          <h2 className="font-display font-bold text-xl text-white mb-2">Connect Cal.com</h2>
          <p className="text-sm text-[var(--color-vexis-text-muted)] max-w-md text-center mb-6">
            Set <code className="px-1.5 py-0.5 rounded bg-[var(--color-vexis-card)] text-[var(--color-vexis-accent)] text-xs font-mono">NEXT_PUBLIC_CALCOM_URL</code> to embed your calendar.
          </p>
          <div className="glass rounded-xl p-4 text-left max-w-lg w-full font-mono text-sm text-[var(--color-vexis-green)]">
            NEXT_PUBLIC_CALCOM_URL=https://cal.com/your-username
          </div>
        </div>
      )}
    </div>
  );
}

/* ═══════════════════ CONTRACTS ═══════════════════ */
function ContractsTab() {
  const docUrl = process.env.NEXT_PUBLIC_DOCUMENSO_URL || "";

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <div className="px-8 py-5 border-b border-[var(--color-vexis-border)] reveal reveal-1">
        <p className="text-[11px] font-semibold tracking-[0.2em] uppercase text-[var(--color-vexis-accent)] mb-2 font-display">Legal</p>
        <h1 className="font-display font-extrabold text-3xl text-white tracking-tight">Contracts</h1>
        <p className="text-sm text-[var(--color-vexis-text-muted)] mt-1">E-signatures — powered by Documenso</p>
      </div>

      {docUrl ? (
        <iframe src={docUrl} className="flex-1 w-full border-0" title="Contracts" allow="camera; microphone; fullscreen" />
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center p-8 reveal reveal-2">
          <div className="w-20 h-20 rounded-2xl bg-[var(--color-vexis-card)] flex items-center justify-center text-4xl mb-5 glow-gold">📄</div>
          <h2 className="font-display font-bold text-xl text-white mb-2">Connect Documenso</h2>
          <p className="text-sm text-[var(--color-vexis-text-muted)] max-w-md text-center mb-6">
            Set <code className="px-1.5 py-0.5 rounded bg-[var(--color-vexis-card)] text-[var(--color-vexis-accent)] text-xs font-mono">NEXT_PUBLIC_DOCUMENSO_URL</code> to embed contract signing.
          </p>
          <div className="glass rounded-xl p-5 max-w-lg w-full">
            <h3 className="text-sm font-display font-bold text-white mb-3">Contract Flow</h3>
            <div className="space-y-2">
              {["Nova closes a deal with a prospect", "Atlas creates a contract from template", "Contract sent for e-signature via Documenso", "Signed → Atlas creates fulfillment tasks"].map((step, i) => (
                <div key={step} className="flex items-start gap-3 text-[11px] text-[var(--color-vexis-text-muted)]">
                  <span className="flex-shrink-0 w-5 h-5 rounded-full bg-[var(--color-vexis-accent-muted)] text-[var(--color-vexis-accent)] flex items-center justify-center font-mono font-bold text-[9px]">{i + 1}</span>
                  {step}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
