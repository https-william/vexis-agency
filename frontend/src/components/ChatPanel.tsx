"use client";

import { useState, useRef, useEffect } from "react";
import { Agent, ChatMessage } from "@/lib/agents";
import { IconSend, IconAttach, IconConfig, IconPipeline } from "@/components/Icons";

interface ChatPanelProps {
    agent: Agent;
    messages: ChatMessage[];
    isTyping: boolean;
    onSendMessage: (message: string) => void;
}

export default function ChatPanel({ agent, messages, isTyping, onSendMessage }: ChatPanelProps) {
    const [input, setInput] = useState("");
    const endRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, isTyping]);
    useEffect(() => { inputRef.current?.focus(); }, [agent.id]);

    const send = () => { const t = input.trim(); if (!t) return; onSendMessage(t); setInput(""); };
    const onKey = (e: React.KeyboardEvent) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } };

    const fmt = (ts: string) => { try { return new Date(ts).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }); } catch { return ""; } };

    const model = agent.engine === "langgraph" ? "GPT OSS 120B" : agent.id === "sentinel" ? "Llama 3.1 8B" : "GPT OSS 20B";
    const modelColor = agent.engine === "langgraph" ? "badge-blue" : agent.id === "sentinel" ? "badge-amber" : "badge-green";

    const quickActions: Record<string, string[]> = {
        archer: ["Find leads: law firms in Lagos", "Scrape dental clinics in Dubai"],
        nova: ["Draft follow-up for stale leads", "Show pipeline status"],
        scout: ["Research TechCorp Inc.", "Deep-dive on last batch"],
        echo: ["Draft cold email template", "Write case study"],
        atlas: ["What needs attention?", "Show task queue"],
        sentinel: ["System health report", "API usage check"],
    };

    return (
        <div className="flex-1 flex flex-col h-full">
            <header className="flex items-center justify-between px-5 py-3.5 border-b border-[var(--color-vexis-border)] bg-[var(--color-vexis-surface)]/80 backdrop-blur-sm">
                <div className="flex items-center gap-3">
                    <div className="relative w-9 h-9 rounded-xl bg-[var(--color-vexis-card)] flex items-center justify-center text-base font-display font-bold text-[var(--color-vexis-blue)]">
                        {agent.name[0]}
                        <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-[var(--color-vexis-surface)] bg-[var(--color-vexis-green)]" />
                    </div>
                    <div>
                        <h2 className="font-display font-bold text-sm text-white">{agent.name}</h2>
                        <div className="flex items-center gap-2">
                            <span className={`text-[9px] px-1.5 py-0.5 rounded font-mono ${modelColor}`}>{model}</span>
                            <span className="text-[10px] text-[var(--color-vexis-text-muted)]">{agent.title}</span>
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <button className="btn-ghost px-2.5 py-1.5 rounded-lg"><IconConfig className="w-3.5 h-3.5" /></button>
                    <button className="btn-primary px-3 py-1.5 rounded-lg text-xs flex items-center gap-1.5"><IconPipeline className="w-3 h-3" /> Pipeline</button>
                </div>
            </header>

            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
                {messages.length === 0 && (
                    <div className="flex flex-col items-center justify-center h-full text-center reveal reveal-1">
                        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[var(--color-vexis-blue)]/10 to-[var(--color-vexis-teal)]/5 flex items-center justify-center text-2xl font-display font-bold text-[var(--color-vexis-blue)] mb-4">
                            {agent.name[0]}
                        </div>
                        <h3 className="font-display font-bold text-lg text-white mb-1">Talk to {agent.name}</h3>
                        <p className="text-xs text-[var(--color-vexis-text-muted)] max-w-sm mb-5">{agent.title}</p>
                        <div className="flex flex-wrap gap-2 justify-center max-w-md">
                            {(quickActions[agent.id] || []).map(a => (
                                <button key={a} onClick={() => onSendMessage(a)}
                                    className="glass glass-hover px-3 py-2 rounded-xl text-xs text-[var(--color-vexis-text-secondary)] hover:text-[var(--color-vexis-blue)] transition-colors">{a}</button>
                            ))}
                        </div>
                    </div>
                )}

                {messages.map(msg => (
                    <div key={msg.id} className={`message-enter flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                        {msg.role === "agent" && (
                            <div className="flex-shrink-0 w-7 h-7 rounded-lg bg-[var(--color-vexis-card)] flex items-center justify-center text-[10px] font-display font-bold text-[var(--color-vexis-blue)] mr-2.5 mt-0.5">
                                {(msg.agentName || agent.name)[0]}
                            </div>
                        )}
                        <div className={`max-w-[70%] rounded-2xl px-3.5 py-2.5 ${msg.role === "user"
                            ? "bg-[var(--color-vexis-blue)] text-white rounded-br-lg"
                            : msg.type === "error" ? "glass border border-[var(--color-vexis-red)]/20 rounded-bl-lg" : "glass rounded-bl-lg"}`}>
                            {msg.role === "agent" && (
                                <p className="text-[9px] font-semibold text-[var(--color-vexis-blue)] mb-0.5 font-display">
                                    {msg.agentName || agent.name}
                                </p>
                            )}
                            <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                            <p className={`text-[9px] mt-1 text-right ${msg.role === "user" ? "text-white/50" : "text-[var(--color-vexis-text-muted)]"}`}>{fmt(msg.timestamp)}</p>
                        </div>
                    </div>
                ))}

                {isTyping && (
                    <div className="flex items-start gap-2.5 message-enter">
                        <div className="w-7 h-7 rounded-lg bg-[var(--color-vexis-card)] flex items-center justify-center text-[10px] font-display font-bold text-[var(--color-vexis-blue)]">{agent.name[0]}</div>
                        <div className="glass rounded-2xl rounded-bl-lg px-3.5 py-2.5">
                            <div className="flex gap-1">
                                <span className="typing-dot w-1.5 h-1.5 rounded-full bg-[var(--color-vexis-blue)]" />
                                <span className="typing-dot w-1.5 h-1.5 rounded-full bg-[var(--color-vexis-blue)]" />
                                <span className="typing-dot w-1.5 h-1.5 rounded-full bg-[var(--color-vexis-blue)]" />
                            </div>
                        </div>
                    </div>
                )}
                <div ref={endRef} />
            </div>

            <div className="px-5 py-3 border-t border-[var(--color-vexis-border)]">
                <div className="flex items-center gap-2.5 glass rounded-xl px-3.5 py-2.5 focus-within:border-[var(--color-vexis-blue)]/20 transition-all">
                    <button className="text-[var(--color-vexis-text-muted)] hover:text-[var(--color-vexis-blue)] transition-colors"><IconAttach className="w-4 h-4" /></button>
                    <input ref={inputRef} type="text" value={input} onChange={e => setInput(e.target.value)} onKeyDown={onKey}
                        placeholder={`Message ${agent.name}...`} className="flex-1 bg-transparent text-[var(--color-vexis-text)] placeholder-[var(--color-vexis-text-muted)] text-sm outline-none" />
                    <button onClick={send} disabled={!input.trim()}
                        className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${input.trim() ? "btn-primary" : "bg-[var(--color-vexis-card)] text-[var(--color-vexis-text-muted)]"}`}>
                        <IconSend className="w-3.5 h-3.5" />
                    </button>
                </div>
            </div>
        </div>
    );
}
