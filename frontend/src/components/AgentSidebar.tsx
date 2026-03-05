"use client";

import { Agent } from "@/lib/agents";

interface AgentSidebarProps {
    agents: Agent[];
    selectedAgent: Agent;
    onSelectAgent: (agent: Agent) => void;
    unreadCounts: Record<string, number>;
}

export default function AgentSidebar({
    agents,
    selectedAgent,
    onSelectAgent,
    unreadCounts,
}: AgentSidebarProps) {
    return (
        <aside className="w-[280px] flex-shrink-0 h-screen flex flex-col border-r border-[var(--color-vexis-border)] bg-[var(--color-vexis-surface)]">
            {/* Logo */}
            <div className="px-6 py-5 border-b border-[var(--color-vexis-border)] reveal reveal-1">
                <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[var(--color-vexis-accent)] to-[#c49a3a] flex items-center justify-center">
                        <span className="text-[var(--color-vexis-bg)] font-bold text-sm font-display">V</span>
                    </div>
                    <div>
                        <h1 className="font-display font-bold text-base tracking-tight text-gradient-gold">VEXIS</h1>
                        <p className="text-[10px] text-[var(--color-vexis-text-muted)] tracking-widest uppercase">Command Center</p>
                    </div>
                </div>
            </div>

            {/* Section label */}
            <div className="px-6 pt-5 pb-2 reveal reveal-2">
                <p className="text-[10px] font-semibold tracking-[0.15em] uppercase text-[var(--color-vexis-text-muted)]">
                    AI Agents
                </p>
            </div>

            {/* Agent list */}
            <div className="flex-1 overflow-y-auto px-3 space-y-1">
                {agents.map((agent, i) => {
                    const isActive = agent.id === selectedAgent.id;
                    const unread = unreadCounts[agent.id] || 0;

                    return (
                        <button
                            key={agent.id}
                            onClick={() => onSelectAgent(agent)}
                            className={`reveal reveal-${i + 3} w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-300 group relative
                ${isActive
                                    ? "bg-[var(--color-vexis-accent-muted)] border border-[var(--color-vexis-accent)]/20"
                                    : "hover:bg-[var(--color-vexis-card)] border border-transparent"
                                }`}
                        >
                            {/* Agent icon */}
                            <div className={`relative w-10 h-10 rounded-xl flex items-center justify-center text-lg transition-all duration-300
                ${isActive
                                    ? "bg-gradient-to-br from-[var(--color-vexis-accent)]/20 to-[var(--color-vexis-accent)]/5 shadow-sm"
                                    : "bg-[var(--color-vexis-card)] group-hover:bg-[var(--color-vexis-card-hover)]"
                                }`}>
                                {agent.icon}

                                {/* Status dot */}
                                <span className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-[var(--color-vexis-surface)]
                  ${agent.status === "online" ? "bg-[var(--color-vexis-green)]" : ""}
                  ${agent.status === "working" ? "bg-[var(--color-vexis-amber)]" : ""}
                  ${agent.status === "error" ? "bg-[var(--color-vexis-red)]" : ""}
                  ${agent.status === "offline" ? "bg-[var(--color-vexis-text-muted)]" : ""}
                  ${agent.status === "online" ? "status-pulse" : ""}
                `} />
                            </div>

                            {/* Agent info */}
                            <div className="flex-1 min-w-0 text-left">
                                <p className={`text-sm font-semibold transition-colors truncate
                  ${isActive ? "text-[var(--color-vexis-accent)]" : "text-[var(--color-vexis-text)] group-hover:text-white"}`}>
                                    {agent.name}
                                </p>
                                <p className="text-[11px] text-[var(--color-vexis-text-muted)] truncate">
                                    {agent.title}
                                </p>
                            </div>

                            {/* Unread badge */}
                            {unread > 0 && (
                                <span className="flex-shrink-0 w-5 h-5 rounded-full bg-[var(--color-vexis-accent)] text-[var(--color-vexis-bg)] text-[10px] font-bold flex items-center justify-center">
                                    {unread}
                                </span>
                            )}

                            {/* Active indicator bar */}
                            {isActive && (
                                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-6 rounded-r-full bg-[var(--color-vexis-accent)]" />
                            )}
                        </button>
                    );
                })}
            </div>

            {/* Bottom section */}
            <div className="px-4 py-4 border-t border-[var(--color-vexis-border)]">
                <div className="glass rounded-xl p-3">
                    <div className="flex items-center gap-2 mb-2">
                        <div className="w-2 h-2 rounded-full bg-[var(--color-vexis-green)]" />
                        <span className="text-[10px] font-semibold text-[var(--color-vexis-green)] uppercase tracking-wider">All Systems Operational</span>
                    </div>
                    <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map((k) => (
                            <div key={k} className="flex-1 h-1 rounded-full bg-[var(--color-vexis-green)]/20">
                                <div className="h-full rounded-full bg-[var(--color-vexis-green)]" style={{ width: "100%" }} />
                            </div>
                        ))}
                    </div>
                    <p className="text-[9px] text-[var(--color-vexis-text-muted)] mt-1.5">5 API keys active</p>
                </div>
            </div>
        </aside>
    );
}
