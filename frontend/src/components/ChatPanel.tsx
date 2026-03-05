"use client";

import { useState, useRef, useEffect } from "react";
import { Agent, ChatMessage } from "@/lib/agents";

interface ChatPanelProps {
    agent: Agent;
    messages: ChatMessage[];
    isTyping: boolean;
    onSendMessage: (message: string) => void;
}

export default function ChatPanel({
    agent,
    messages,
    isTyping,
    onSendMessage,
}: ChatPanelProps) {
    const [input, setInput] = useState("");
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, isTyping]);

    useEffect(() => {
        inputRef.current?.focus();
    }, [agent.id]);

    const handleSend = () => {
        const trimmed = input.trim();
        if (!trimmed) return;
        onSendMessage(trimmed);
        setInput("");
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const formatTime = (timestamp: string) => {
        try {
            return new Date(timestamp).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
            });
        } catch {
            return "";
        }
    };

    // Quick actions per agent
    const quickActions: Record<string, string[]> = {
        archer: ["Find leads: law firms in Lagos", "Scrape dental clinics in Dubai", "Search restaurants in London"],
        nova: ["Draft follow-up for stale leads", "Show outreach stats", "Check pipeline status"],
        scout: ["Research TechCorp Inc.", "Deep-dive on last lead batch"],
        echo: ["Draft cold email for no-website leads", "Write case study template"],
        atlas: ["What needs my attention?", "Prep for my next call", "Show task queue"],
        sentinel: ["System status report", "API usage check", "Agent health scan"],
    };

    return (
        <div className="flex-1 flex flex-col h-full">
            {/* Agent header */}
            <header className="flex items-center justify-between px-6 py-4 border-b border-[var(--color-vexis-border)] glass reveal reveal-1">
                <div className="flex items-center gap-4">
                    <div className="relative w-11 h-11 rounded-xl bg-gradient-to-br from-[var(--color-vexis-card)] to-[var(--color-vexis-card-hover)] flex items-center justify-center text-xl">
                        {agent.icon}
                        <span className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-[var(--color-vexis-surface)]
              ${agent.status === "online" ? "bg-[var(--color-vexis-green)]" : "bg-[var(--color-vexis-amber)]"}`}
                        />
                    </div>
                    <div>
                        <h2 className="font-display font-bold text-white text-base tracking-tight">{agent.name}</h2>
                        <p className="text-[11px] text-[var(--color-vexis-text-muted)] flex items-center gap-2">
                            <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono
                ${agent.engine === "langgraph"
                                    ? "bg-[var(--color-vexis-accent-muted)] text-[var(--color-vexis-accent)]"
                                    : "bg-[var(--color-vexis-cyan)]/10 text-[var(--color-vexis-cyan)]"
                                }`}>
                                {agent.engine === "langgraph" ? "GPT OSS 120B" : agent.id === "sentinel" ? "Llama 3.1 8B" : "GPT OSS 20B"}
                            </span>
                            {agent.title}
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <button className="btn-ghost px-3 py-1.5 rounded-lg text-xs">⚙️ Config</button>
                    <button className="btn-gold px-4 py-1.5 rounded-lg text-xs">View Pipeline</button>
                </div>
            </header>

            {/* Messages area */}
            <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
                {/* Empty state */}
                {messages.length === 0 && (
                    <div className="flex flex-col items-center justify-center h-full text-center reveal reveal-1">
                        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[var(--color-vexis-card)] to-[var(--color-vexis-card-hover)] flex items-center justify-center text-4xl mb-5 glow-gold">
                            {agent.icon}
                        </div>
                        <h3 className="font-display font-bold text-xl text-white mb-2">
                            Talk to {agent.name}
                        </h3>
                        <p className="text-sm text-[var(--color-vexis-text-muted)] max-w-md mb-6">
                            {agent.name} is your {agent.title}. Send a message or pick a quick action below.
                        </p>
                        <div className="flex flex-wrap gap-2 justify-center max-w-lg">
                            {(quickActions[agent.id] || []).map((action) => (
                                <button
                                    key={action}
                                    onClick={() => onSendMessage(action)}
                                    className="glass glass-hover gold-border px-4 py-2 rounded-xl text-xs text-[var(--color-vexis-text-secondary)] hover:text-[var(--color-vexis-accent)] transition-colors"
                                >
                                    {action}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* Message bubbles */}
                {messages.map((msg) => (
                    <div
                        key={msg.id}
                        className={`message-enter flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                    >
                        {msg.role === "agent" && (
                            <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-[var(--color-vexis-card)] flex items-center justify-center text-sm mr-3 mt-1">
                                {msg.agentIcon || agent.icon}
                            </div>
                        )}

                        <div
                            className={`max-w-[70%] rounded-2xl px-4 py-3 ${msg.role === "user"
                                ? "bg-gradient-to-br from-[var(--color-vexis-accent)] to-[#c49a3a] text-[var(--color-vexis-bg)] rounded-br-md"
                                : msg.type === "error"
                                    ? "glass border border-[var(--color-vexis-red)]/20 rounded-bl-md"
                                    : "glass rounded-bl-md"
                                }`}
                        >
                            {msg.role === "agent" && (
                                <p className="text-[10px] font-semibold text-[var(--color-vexis-accent)] mb-1 font-display">
                                    {msg.agentName || agent.name}
                                    <span className="text-[var(--color-vexis-text-muted)] font-normal font-sans"> · {msg.agentTitle || agent.title}</span>
                                </p>
                            )}
                            <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                            <p className={`text-[10px] mt-1.5 text-right ${msg.role === "user" ? "text-[var(--color-vexis-bg)]/60" : "text-[var(--color-vexis-text-muted)]"
                                }`}>
                                {formatTime(msg.timestamp)}
                            </p>
                        </div>

                        {msg.role === "user" && (
                            <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-gradient-to-br from-[var(--color-vexis-accent)]/20 to-[var(--color-vexis-accent)]/5 flex items-center justify-center text-sm ml-3 mt-1 border border-[var(--color-vexis-accent)]/20">
                                👤
                            </div>
                        )}
                    </div>
                ))}

                {/* Typing indicator */}
                {isTyping && (
                    <div className="flex items-start gap-3 message-enter">
                        <div className="w-8 h-8 rounded-lg bg-[var(--color-vexis-card)] flex items-center justify-center text-sm">
                            {agent.icon}
                        </div>
                        <div className="glass rounded-2xl rounded-bl-md px-4 py-3">
                            <p className="text-[10px] font-semibold text-[var(--color-vexis-accent)] mb-1.5 font-display">
                                {agent.name} <span className="text-[var(--color-vexis-text-muted)] font-normal font-sans">is thinking</span>
                            </p>
                            <div className="flex gap-1.5">
                                <span className="typing-dot w-2 h-2 rounded-full bg-[var(--color-vexis-accent)]" />
                                <span className="typing-dot w-2 h-2 rounded-full bg-[var(--color-vexis-accent)]" />
                                <span className="typing-dot w-2 h-2 rounded-full bg-[var(--color-vexis-accent)]" />
                            </div>
                        </div>
                    </div>
                )}

                <div ref={messagesEndRef} />
            </div>

            {/* Input area */}
            <div className="px-6 py-4 border-t border-[var(--color-vexis-border)]">
                <div className="flex items-center gap-3 glass rounded-xl px-4 py-3 focus-within:border-[var(--color-vexis-accent)]/30 transition-all">
                    <button className="text-[var(--color-vexis-text-muted)] hover:text-[var(--color-vexis-accent)] transition-colors">
                        📎
                    </button>

                    <input
                        ref={inputRef}
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder={`Message ${agent.name}...`}
                        className="flex-1 bg-transparent text-[var(--color-vexis-text)] placeholder-[var(--color-vexis-text-muted)] text-sm outline-none"
                    />

                    <button
                        onClick={handleSend}
                        disabled={!input.trim()}
                        className={`w-9 h-9 rounded-lg flex items-center justify-center transition-all text-sm
              ${input.trim()
                                ? "btn-gold"
                                : "bg-[var(--color-vexis-card)] text-[var(--color-vexis-text-muted)]"
                            }`}
                    >
                        ➤
                    </button>
                </div>
                <p className="text-[9px] text-[var(--color-vexis-text-muted)] mt-2 text-center tracking-wider uppercase">
                    Powered by Groq · Press ↵ to send
                </p>
            </div>
        </div>
    );
}
