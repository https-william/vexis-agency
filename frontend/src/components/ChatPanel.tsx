"use client";

import { useState, useRef, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Agent, ChatMessage } from "@/lib/agents";
import { IconSend, IconAttach, IconConfig, IconPipeline } from "@/components/Icons";
import { IconArcher, IconNova, IconScout, IconEcho, IconAtlas, IconSentinel } from "@/components/AgentIcons";

interface ChatPanelProps {
    agent: Agent;
    messages: ChatMessage[];
    isTyping: boolean;
    onSendMessage: (message: string) => void;
    onForward?: (targetAgentId: string, context: string) => void;
}

export default function ChatPanel({ agent, messages, isTyping, onSendMessage, onForward }: ChatPanelProps) {
    const [input, setInput] = useState("");
    const [pipeOpen, setPipeOpen] = useState(false);
    const endRef = useRef<HTMLDivElement>(null);
    const streamEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    // Connect to live stream logs
    const [streamLogs, setStreamLogs] = useState<{ id: string, text: string, type: string, time: string }[]>([]);

    useEffect(() => {
        // Reset logs when agent changes
        setStreamLogs([
            { id: "1", text: `[SYSTEM] ${agent.name} (${agent.title}) initialized.`, type: "system", time: new Date().toISOString() },
            {
                id: "2",
                text: process.env.NEXT_PUBLIC_USE_NULLCLAW === "true"
                    ? `[CORE] Bypassing gateway... Direct connection to NullClaw established.`
                    : `[CORE] Connected to Vexis Python API Gateway on Port 8000.`,
                type: "success",
                time: new Date().toISOString()
            },
            { id: "3", text: `[MEMORY] Connected to remote persistent memory storage (Supabase).`, type: "info", time: new Date().toISOString() },
        ]);
        inputRef.current?.focus();

        const wsUrl = process.env.NEXT_PUBLIC_USE_NULLCLAW === "true"
            ? "ws://localhost:3010/ws/logs" // Fallback placeholder
            : "ws://localhost:8000/ws/logs";

        let ws: WebSocket | null = null;
        try {
            ws = new WebSocket(wsUrl);
            ws.onmessage = (e) => {
                try {
                    const data = JSON.parse(e.data);
                    if (data.text && !data.text.includes("/ws/logs")) {
                        setStreamLogs(prev => {
                            // avoid exact duplicates if sent rapidly
                            if (prev.length > 0 && prev[prev.length - 1].text === data.text) return prev;
                            return [...prev.slice(-99), data];
                        });
                    }
                } catch (err) { }
            };
        } catch (err) {
            console.error("Failed to connect to log stream", err);
        }

        return () => {
            if (ws) ws.close();
        };
    }, [agent.id]);

    useEffect(() => {
        if (isTyping) {
            setStreamLogs(prev => [...prev.slice(-99), {
                id: Math.random().toString(),
                text: `[PROCESS] Sending request to ${process.env.NEXT_PUBLIC_USE_NULLCLAW === "true" ? "NullClaw" : "Python API Gateway"}... Waiting for agent reasoning.`,
                type: "process",
                time: new Date().toISOString()
            }]);
        } else if (messages.length > 0) {
            setStreamLogs(prev => [...prev.slice(-99), {
                id: Math.random().toString(),
                text: `[SUCCESS] Output received and formatted.`,
                type: "success",
                time: new Date().toISOString()
            }]);
        }
    }, [isTyping, messages.length]);

    useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, isTyping]);
    useEffect(() => { streamEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [streamLogs]);

    const send = () => {
        const t = input.trim();
        if (!t) return;
        setStreamLogs(prev => [...prev.slice(-40), { id: Math.random().toString(), text: `[INPUT] Received prompt: "${t.substring(0, 20)}..."`, type: "info", time: new Date().toISOString() }]);
        onSendMessage(t);
        setInput("");
    };
    const onKey = (e: React.KeyboardEvent) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } };

    const fmtTime = (ts: string) => { try { return new Date(ts).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" }); } catch { return ""; } };
    const fmtMsgTime = (ts: string) => { try { return new Date(ts).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }); } catch { return ""; } };

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

    const quickActions: Record<string, string[]> = {
        archer: ["Find leads: law firms in Lagos", "Scrape dental clinics in Dubai"],
        nova: ["Draft follow-up for stale leads", "Show pipeline status"],
        scout: ["Research TechCorp Inc.", "Deep-dive on last batch"],
        echo: ["Draft cold email template", "Write case study"],
        atlas: ["What needs attention?", "Show task queue"],
        sentinel: ["System health report", "API usage check"],
    };

    return (
        <div className="flex-1 flex flex-col h-full bg-[var(--color-vexis-bg)]/30">
            <header className="flex items-center justify-between px-6 py-4 border-b border-[var(--color-vexis-border-light)] glass backdrop-blur-3xl z-20">
                <div className="flex items-center gap-4">
                    <div className="relative w-12 h-12 rounded-[16px] btn-primary flex items-center justify-center text-white shadow-[0_4px_16px_rgba(42,107,255,0.4)]">
                        {getAgentIcon(agent.id, "w-6 h-6 drop-shadow-md")}
                        <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full border-[3px] border-[var(--color-vexis-bg)] bg-[var(--color-vexis-green)] shadow-[0_0_10px_rgba(52,211,153,0.5)] status-live" />
                    </div>
                    <div>
                        <h2 className="font-display font-bold text-lg text-white tracking-tight drop-shadow-sm">{agent.name}</h2>
                        <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-[10px] px-2 py-0.5 rounded-md font-mono badge-blue shadow-sm">
                                {process.env.NEXT_PUBLIC_USE_NULLCLAW === "true" ? "NullClaw Runtime" : "Python Edge Gateway"}
                            </span>
                            <span className="text-[11px] font-medium text-[var(--color-vexis-text-secondary)]">{agent.title}</span>
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <button className="btn-ghost px-3 py-2 rounded-xl shadow-sm"><IconConfig className="w-4 h-4" /></button>
                    <button className="btn-primary px-4 py-2 rounded-xl text-[13px] flex items-center gap-2">
                        <IconPipeline className="w-4 h-4" /> Provider: Groq
                    </button>
                </div>
            </header>

            <div className="flex-1 overflow-hidden flex">
                {/* Left side: Chat interface */}
                <div className="flex-1 flex flex-col min-w-0 h-full border-r border-[var(--color-vexis-border)] relative">
                    <div className="flex-1 overflow-y-auto px-6 py-6 space-y-4">
                        {messages.length === 0 && (
                            <div className="flex flex-col items-center justify-center h-full text-center reveal reveal-1">
                                <div className="w-20 h-20 rounded-[24px] glass flex items-center justify-center text-[var(--color-vexis-blue-hover)] mb-6 shadow-2xl relative">
                                    <div className="absolute inset-0 bg-gradient-to-br from-[var(--color-vexis-blue)]/20 to-transparent rounded-[24px] pointer-events-none" />
                                    <div className="relative z-10 drop-shadow-md">{getAgentIcon(agent.id, "w-10 h-10")}</div>
                                </div>
                                <h3 className="font-display font-extrabold text-2xl text-white mb-2 drop-shadow-md">Engage {agent.name}</h3>
                                <p className="text-[13px] text-[var(--color-vexis-text-secondary)] max-w-sm mb-6 leading-relaxed">{agent.title}</p>
                                <div className="flex flex-wrap gap-3 justify-center max-w-lg">
                                    {(quickActions[agent.id] || []).map(a => (
                                        <button key={a} onClick={() => onSendMessage(a)}
                                            className="glass glass-hover px-4 py-2.5 rounded-xl text-xs font-medium text-[var(--color-vexis-text)] transition-colors">{a}</button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {messages.map(msg => (
                            <div key={msg.id} className={`message-enter flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                                {msg.role === "agent" && (
                                    <div className="flex-shrink-0 w-8 h-8 rounded-[10px] btn-primary flex items-center justify-center text-white mr-2 mt-0.5 shadow-sm">
                                        {getAgentIcon(msg.agentId || agent.id, "w-4 h-4")}
                                    </div>
                                )}
                                <div className={`max-w-[85%] rounded-[18px] px-4 py-3 shadow-md ${msg.role === "user"
                                    ? "bg-gradient-to-br from-[var(--color-vexis-blue)] to-[var(--color-vexis-blue-hover)] text-white rounded-tr-sm"
                                    : msg.type === "error" ? "glass !border-[var(--color-vexis-red)]/30 rounded-tl-sm text-white" : "glass rounded-tl-sm relative text-white"}`}>
                                    {msg.role === "agent" && (
                                        <p className="text-[10px] font-bold text-[var(--color-vexis-blue-hover)] mb-0.5 font-display tracking-widest uppercase opacity-90">
                                            {msg.agentName || agent.name}
                                        </p>
                                    )}
                                    <div className="text-[13.5px] leading-relaxed relative z-10 font-medium prose prose-invert max-w-none">
                                        <ReactMarkdown
                                            remarkPlugins={[remarkGfm]}
                                            components={{
                                                p: ({ node, ...props }) => <p className="mb-2 last:mb-0" {...props} />,
                                                ul: ({ node, ...props }) => <ul className="list-disc ml-4 mb-2" {...props} />,
                                                ol: ({ node, ...props }) => <ol className="list-decimal ml-4 mb-2" {...props} />,
                                                li: ({ node, ...props }) => <li className="mb-1" {...props} />,
                                                h1: ({ node, ...props }) => <h1 className="text-lg font-bold mb-2" {...props} />,
                                                h2: ({ node, ...props }) => <h2 className="text-md font-bold mb-1" {...props} />,
                                                h3: ({ node, ...props }) => <h3 className="text-sm font-bold mb-1" {...props} />,
                                                code: ({ node, ...props }) => <code className="bg-white/10 px-1 rounded text-[12px] font-mono" {...props} />,
                                                pre: ({ node, ...props }) => <pre className="bg-black/20 p-3 rounded-lg my-2 overflow-x-auto border border-white/5 font-mono text-[12px]" {...props} />,
                                                table: ({ node, ...props }) => (
                                                    <div className="overflow-x-auto my-3 rounded-xl border border-white/10 glass shadow-inner">
                                                        <table className="w-full text-left text-[12px] border-collapse" {...props} />
                                                    </div>
                                                ),
                                                thead: ({ node, ...props }) => <thead className="bg-white/5 border-b border-white/10" {...props} />,
                                                th: ({ node, ...props }) => <th className="px-3 py-2 font-black uppercase tracking-wider text-[10px] text-[var(--color-vexis-blue-hover)]" {...props} />,
                                                td: ({ node, ...props }) => <td className="px-3 py-2 border-b border-white/5 last:border-0" {...props} />,
                                                blockquote: ({ node, ...props }) => <blockquote className="border-l-4 border-[var(--color-vexis-blue-hover)] pl-4 italic my-2 bg-white/5 py-1" {...props} />,
                                                a: ({ node, ...props }) => <a className="text-[var(--color-vexis-blue-hover)] hover:underline font-bold" target="_blank" rel="noopener noreferrer" {...props} />,
                                            }}
                                        >
                                            {msg.content}
                                        </ReactMarkdown>
                                    </div>

                                    {msg.role === "agent" && !!msg.metadata?.handoff_suggested && (
                                        <div className="mt-3 pt-3 border-t border-white/10 relative z-10">
                                            <button
                                                onClick={() => onForward?.(msg.metadata!.handoff_suggested as string, msg.content)}
                                                className="group relative flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 hover:bg-[var(--color-vexis-blue)]/20 hover:border-[var(--color-vexis-blue)]/40 transition-all duration-300 shadow-xl overflow-hidden active:scale-95"
                                            >
                                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                                                <div className="w-5 h-5 rounded flex items-center justify-center bg-[var(--color-vexis-blue)]/20 text-[var(--color-vexis-blue-hover)]">
                                                    <IconPipeline className="w-3 h-3" />
                                                </div>
                                                <span className="text-[11px] font-bold text-white tracking-wide">
                                                    Forward to {String(msg.metadata.handoff_suggested).charAt(0).toUpperCase() + String(msg.metadata.handoff_suggested).slice(1)}
                                                </span>
                                                <div className="w-1.5 h-1.5 rounded-full bg-[var(--color-vexis-blue-hover)] animate-pulse shadow-[0_0_8px_var(--color-vexis-blue-hover)]" />
                                            </button>
                                        </div>
                                    )}

                                    <p className={`text-[9px] mt-1 text-right relative z-10 font-mono ${msg.role === "user" ? "text-white/60" : "text-[var(--color-vexis-text-muted)]"}`}>{fmtMsgTime(msg.timestamp)}</p>
                                </div>
                            </div>
                        ))}

                        {isTyping && (
                            <div className="flex items-start gap-2 message-enter mt-2">
                                <div className="w-8 h-8 rounded-[10px] btn-primary flex items-center justify-center text-white shadow-sm">
                                    {getAgentIcon(agent.id, "w-4 h-4")}
                                </div>
                                <div className="glass rounded-[14px] rounded-tl-sm px-3.5 py-2.5 shadow-md flex items-center h-9">
                                    <div className="flex gap-1 py-1">
                                        <span className="typing-dot w-1.5 h-1.5 rounded-full bg-[var(--color-vexis-blue)] shadow-[0_0_6px_rgba(42,107,255,0.6)]" />
                                        <span className="typing-dot w-1.5 h-1.5 rounded-full bg-[var(--color-vexis-blue)] shadow-[0_0_6px_rgba(42,107,255,0.6)]" />
                                        <span className="typing-dot w-1.5 h-1.5 rounded-full bg-[var(--color-vexis-blue)] shadow-[0_0_6px_rgba(42,107,255,0.6)]" />
                                    </div>
                                </div>
                            </div>
                        )}
                        <div ref={endRef} className="h-4" />
                    </div>
                    {/* Input Area */}
                    <div className="p-4 pt-0">
                        <div className="flex items-center gap-2 glass rounded-2xl px-3 py-2.5 focus-within:ring-1 focus-within:ring-[var(--color-vexis-blue-glow)] transition-all shadow-[0_8px_30px_rgba(0,0,0,0.3)] bg-white-[0.02]">
                            <button className="w-9 h-9 rounded-xl flex items-center justify-center text-[var(--color-vexis-text-secondary)] hover:bg-white/5 hover:text-white transition-colors">
                                <IconAttach className="w-4.5 h-4.5" />
                            </button>
                            <input ref={inputRef} type="text" value={input} onChange={e => setInput(e.target.value)} onKeyDown={onKey}
                                placeholder={`Message ${agent.name}...`} className="flex-1 bg-transparent text-[var(--color-vexis-text)] placeholder-[var(--color-vexis-text-muted)] text-[14px] outline-none font-medium h-9" />
                            <button onClick={send} disabled={!input.trim()}
                                className={`w-9 h-9 rounded-[10px] flex items-center justify-center transition-all shadow-sm
                  ${input.trim() ? "btn-primary hover:scale-105" : "bg-white/5 text-[var(--color-vexis-text-muted)] border border-white/5"}`}>
                                <IconSend className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Right side: Live Agent Stream */}
                <div className="hidden lg:flex w-[280px] flex-shrink-0 flex-col bg-[#050508]/80 backdrop-blur-3xl relative border-l border-white/5">
                    <div className="absolute inset-0 bg-gradient-to-b from-[var(--color-vexis-blue)]/5 to-transparent pointer-events-none" />
                    <div className="px-5 py-3 border-b border-[var(--color-vexis-border)]/50 flex items-center justify-between glass z-10 sticky top-0 shadow-sm">
                        <div className="flex items-center gap-2">
                            <IconPipeline className="w-3.5 h-3.5 text-[var(--color-vexis-blue)] drop-shadow-md" />
                            <span className="text-[11px] font-display font-black text-white uppercase tracking-widest opacity-90">Process Feed</span>
                        </div>
                        <span className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-[var(--color-vexis-green)] shadow-[0_0_8px_var(--color-vexis-green)] animate-pulse" /> <span className="text-[9px] font-mono text-[var(--color-vexis-text-muted)]">Live</span></span>
                    </div>
                    <div className="flex-1 overflow-y-auto p-4 space-y-2.5 font-mono text-[9.5px] relative z-10 scrollbar-thin">
                        {streamLogs.map((log) => (
                            <div key={log.id} className="leading-[1.6] reveal flex items-start gap-2 border-b border-white/5 pb-2 mb-2 last:border-0">
                                <span className="text-[var(--color-vexis-text-muted)] opacity-50 flex-shrink-0">[{fmtTime(log.time)}]</span>
                                <span className={`${log.type === "error" ? "text-[var(--color-vexis-red)]" : log.type === "warning" ? "text-[var(--color-vexis-amber)]" : log.type === "system" ? "text-[var(--color-vexis-violet)]" : log.type === "success" ? "text-[var(--color-vexis-green)]" : log.type === "process" ? "text-[var(--color-vexis-blue-hover)]" : "text-[var(--color-vexis-text-secondary)]"} break-words whitespace-pre-wrap`}>
                                    {log.text.replace(/\[vexis.*?\]\s*/g, '')}
                                </span>
                            </div>
                        ))}
                        {isTyping && (
                            <div className="leading-[1.6] flex items-start gap-2 animate-pulse mt-3 opacity-80">
                                <span className="text-[var(--color-vexis-text-muted)] opacity-50 flex-shrink-0">[{fmtTime(new Date().toISOString())}]</span>
                                <span className="text-[var(--color-vexis-blue)] flex items-center gap-1.5">_ Vector processing<span className="flex gap-0.5"><span className="typing-dot w-1 h-1 rounded-full bg-current" /><span className="typing-dot w-1 h-1 rounded-full bg-current delay-75" /><span className="typing-dot w-1 h-1 rounded-full bg-current delay-150" /></span></span>
                            </div>
                        )}
                        <div ref={streamEndRef} className="h-4" />
                    </div>
                </div>
            </div>
        </div>
    );
}
