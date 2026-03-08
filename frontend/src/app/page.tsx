import Link from "next/link";
import { IconBolt, IconStack, IconPipeline } from "@/components/Icons";

export default function LandingPage() {
    return (
        <div className="min-h-screen bg-[var(--color-vexis-bg)] relative overflow-x-hidden selection:bg-[var(--color-vexis-blue)] selection:text-white">
            {/* Aurora Mesh Background */}
            <div className="aurora pointer-events-none">
                <div className="aurora-orb aurora-1" />
                <div className="aurora-orb aurora-2" />
                <div className="aurora-orb aurora-3" />
                <div className="aurora-orb aurora-4" />
            </div>

            <div className="relative z-10 flex flex-col min-h-screen px-6 py-6 mx-auto max-w-7xl">

                {/* Navigation */}
                <header className="flex items-center justify-between glass px-6 py-4 rounded-[24px] reveal reveal-1 shadow-2xl sticky top-6 z-50">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-[12px] btn-primary flex items-center justify-center shadow-lg">
                            <svg className="w-5 h-5 text-white drop-shadow-md" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" /></svg>
                        </div>
                        <span className="font-display font-black text-xl text-white tracking-tight drop-shadow-md">VEXIS</span>
                    </div>
                    <nav className="hidden md:flex items-center gap-8">
                        <a href="#problem" className="text-sm font-bold text-[var(--color-vexis-text-secondary)] hover:text-white transition-colors">The Chaos</a>
                        <a href="#solution" className="text-sm font-bold text-[var(--color-vexis-text-secondary)] hover:text-white transition-colors">The Engine</a>
                        <a href="#agents" className="text-sm font-bold text-[var(--color-vexis-text-secondary)] hover:text-white transition-colors">The Fleet</a>
                        <a href="#marketplace" className="text-sm font-bold text-[var(--color-vexis-text-secondary)] hover:text-white transition-colors flex items-center gap-2">
                            Marketplace <span className="px-1.5 py-0.5 rounded-[6px] badge-blue font-black tracking-widest text-[8px] text-white blink">NEW</span>
                        </a>
                    </nav>
                    <div className="flex items-center gap-4">
                        <Link href="/dashboard" className="text-sm font-extrabold text-[var(--color-vexis-text-secondary)] hover:text-white glass-hover px-4 py-2 rounded-xl transition-all hidden sm:block">
                            Sign In
                        </Link>
                        <Link href="/dashboard" className="btn-primary px-5 py-2.5 rounded-xl text-sm font-black shadow-[0_0_20px_rgba(42,107,255,0.4)] ring-1 ring-white/20 hover:scale-105 transition-transform">
                            Initialize Command
                        </Link>
                    </div>
                </header>

                {/* Hero Section */}
                <main className="flex flex-col items-center justify-center text-center mt-24 md:mt-32 mb-40 z-20">
                    <div className="inline-flex items-center justify-center gap-2 glass px-4 py-1.5 rounded-full mb-8 reveal reveal-2 shadow-inner border border-white/10">
                        <span className="w-2 h-2 rounded-full bg-[var(--color-vexis-green)] shadow-[0_0_12px_rgba(52,211,153,0.8)] status-live" />
                        <span className="text-[10px] font-black text-white uppercase tracking-[0.2em] drop-shadow-md">Vexis Engine v3.0 Autonomous Core</span>
                    </div>

                    <h1 className="font-display font-black text-[64px] md:text-[110px] leading-[0.9] tracking-tighter text-white mb-8 reveal reveal-3 drop-shadow-2xl max-w-5xl">
                        Autonomous <br className="hidden md:block" />
                        <span className="text-transparent bg-clip-text bg-gradient-to-br from-white via-white to-white/40 drop-shadow-[0_0_30px_rgba(255,255,255,0.3)]">
                            Revenue Control.
                        </span>
                    </h1>

                    <p className="max-w-2xl text-[16px] md:text-[20px] font-medium text-[var(--color-vexis-text-secondary)] mb-12 reveal reveal-4 leading-relaxed">
                        Stop scaling human headcount. Deploy an elite fleet of 6 specialized AI agents out of the box. Scraping, researching, closing, strategizing, and monitoring—fully autonomous.
                    </p>

                    <div className="flex flex-col sm:flex-row items-center gap-5 reveal reveal-5">
                        <Link href="/dashboard" className="btn-primary px-8 py-4 rounded-[20px] text-[15px] font-black shadow-[0_0_40px_rgba(42,107,255,0.5)] ring-1 ring-white/30 flex items-center gap-3 hover:scale-105 transition-transform">
                            <IconBolt className="w-5 h-5 drop-shadow-md" /> Enter Command Center
                        </Link>
                        <a href="#problem" className="glass px-8 py-4 rounded-[20px] text-[15px] font-black text-white hover:bg-white/10 transition-colors shadow-lg border border-white/10 flex items-center gap-3">
                            See How It Works
                        </a>
                    </div>

                    {/* Dashboard Preview mockup image replacing static box */}
                    <div className="mt-24 w-full max-w-5xl aspect-video glass rounded-[32px] border border-white/10 shadow-[0_0_80px_rgba(42,107,255,0.15)] reveal reveal-6 relative overflow-hidden flex items-center justify-center group bg-gradient-to-br from-white/5 to-[var(--color-vexis-bg)]/80 backdrop-blur-3xl">
                        <div className="absolute top-0 left-0 w-full h-12 glass border-b border-white/10 flex items-center px-5 gap-2.5 z-20 bg-white/[0.03]">
                            <div className="w-3.5 h-3.5 rounded-full bg-[#FF5F56] border border-black/10 shadow-sm" />
                            <div className="w-3.5 h-3.5 rounded-full bg-[#FFBD2E] border border-black/10 shadow-sm" />
                            <div className="w-3.5 h-3.5 rounded-full bg-[#27C93F] border border-black/10 shadow-sm" />
                        </div>
                        <div className="w-full h-full pt-12 grid grid-cols-4 opacity-70 blur-[3px] group-hover:blur-none group-hover:opacity-100 transition-all duration-700 bg-[var(--color-vexis-bg)]/40 relative z-10">
                            <div className="col-span-1 border-r border-white/5 p-6 border-white/10 space-y-5 bg-white/[0.01]">
                                <div className="w-full h-12 bg-white/5 rounded-[14px] shadow-sm animate-pulse" />
                                <div className="w-full h-12 bg-gradient-to-r from-[var(--color-vexis-blue)]/20 to-transparent rounded-[14px] shadow-sm" />
                                <div className="w-full h-12 bg-white/5 rounded-[14px] shadow-sm" />
                                <div className="w-full h-12 bg-white/5 rounded-[14px] shadow-sm" />
                            </div>
                            <div className="col-span-3 p-10 flex flex-col gap-6 bg-gradient-to-br from-transparent to-black/20">
                                <div className="flex justify-between items-center mb-4">
                                    <div className="w-1/3 h-14 bg-white/10 rounded-[16px] shadow-sm" />
                                    <div className="w-32 h-10 bg-[var(--color-vexis-blue)]/40 rounded-xl shadow-sm" />
                                </div>
                                <div className="grid grid-cols-3 gap-6 mb-6">
                                    <div className="h-28 bg-white/5 rounded-[20px] shadow-md border border-white/5" />
                                    <div className="h-28 bg-white/5 rounded-[20px] shadow-md border border-white/5" />
                                    <div className="h-28 bg-white/5 rounded-[20px] shadow-md border border-white/5" />
                                </div>
                                <div className="flex-1 bg-white/5 rounded-[24px] shadow-lg border border-white/10 flex p-8 gap-8">
                                    <div className="w-1/2 h-full bg-white/10 rounded-[16px] shadow-inner" />
                                    <div className="w-1/2 h-full bg-white/10 rounded-[16px] shadow-inner" />
                                </div>
                            </div>
                        </div>
                        <div className="absolute inset-0 flex items-center justify-center z-30 group-hover:opacity-0 transition-opacity duration-500 pointer-events-none">
                            <h3 className="font-display font-black text-3xl tracking-widest uppercase items-center flex gap-4 text-white drop-shadow-[0_0_30px_rgba(255,255,255,0.9)]">
                                <IconPipeline className="w-8 h-8 drop-shadow-md" /> Access Dashboard UI
                            </h3>
                        </div>
                    </div>
                </main>

                {/* Section 1: The Pain Point */}
                <section id="problem" className="py-32 z-20 relative">
                    <div className="max-w-3xl mx-auto text-center mb-20">
                        <h2 className="text-[12px] font-black text-[var(--color-vexis-red)] uppercase tracking-[0.3em] mb-4">The Chaos of Modern Growth</h2>
                        <h3 className="font-display font-black text-4xl md:text-5xl text-white tracking-tight leading-tight">
                            You're throwing human hours at machine problems.
                        </h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="glass rounded-[24px] p-8 relative overflow-hidden group">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--color-vexis-red)]/10 blur-[50px] rounded-full group-hover:bg-[var(--color-vexis-red)]/20 transition-colors" />
                            <h4 className="font-display font-black text-xl text-white mb-3">Manual Scraping is Dead</h4>
                            <p className="text-[14px] text-[var(--color-vexis-text-secondary)] leading-relaxed">Your SDRs waste 40% of their day digging through LinkedIn and Google Maps trying to find qualified leads. It's expensive, slow, and soul-crushing.</p>
                        </div>
                        <div className="glass rounded-[24px] p-8 relative overflow-hidden group">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--color-vexis-amber)]/10 blur-[50px] rounded-full group-hover:bg-[var(--color-vexis-amber)]/20 transition-colors" />
                            <h4 className="font-display font-black text-xl text-white mb-3">Pipeline Leakage</h4>
                            <p className="text-[14px] text-[var(--color-vexis-text-secondary)] leading-relaxed">Leads go cold because follow-ups are forgotten. Proposals take days to write instead of minutes. You are losing deals to slower response times.</p>
                        </div>
                        <div className="glass rounded-[24px] p-8 relative overflow-hidden group">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--color-vexis-violet)]/10 blur-[50px] rounded-full group-hover:bg-[var(--color-vexis-violet)]/20 transition-colors" />
                            <h4 className="font-display font-black text-xl text-white mb-3">Context Silos</h4>
                            <p className="text-[14px] text-[var(--color-vexis-text-secondary)] leading-relaxed">Your sales tool doesn't talk to your ops tool. Your researchers don't pass full context to writers. Information drops, and clients feel the friction.</p>
                        </div>
                    </div>
                </section>

                {/* Section 2: The Solution */}
                <section id="solution" className="py-32 z-20">
                    <div className="glass rounded-[40px] p-10 md:p-16 border border-[var(--color-vexis-blue)]/20 relative overflow-hidden shadow-[0_0_80px_rgba(42,107,255,0.1)]">
                        <div className="absolute inset-0 bg-gradient-to-br from-[var(--color-vexis-blue)]/5 to-[var(--color-vexis-teal)]/5" />

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center relative z-10">
                            <div>
                                <h2 className="text-[12px] font-black text-[var(--color-vexis-teal)] uppercase tracking-[0.3em] mb-4">The Paradigm Shift</h2>
                                <h3 className="font-display font-black text-4xl md:text-5xl text-white tracking-tight leading-tight mb-6">
                                    Software that acts as your workforce.
                                </h3>
                                <p className="text-[16px] text-[var(--color-vexis-text-secondary)] leading-relaxed mb-8">
                                    Vexis Engine isn't a CRM or a SaaS tool. It is an autonomous hive-mind of highly specialized AI operating on Native Edge Runtimes. They talk to each other, hand off tasks, write contracts, and close deals while you sleep.
                                </p>

                                <ul className="space-y-4">
                                    {[
                                        "Zero-Latency Local Execution (Direct Binary Access)",
                                        "Agent-to-Agent Swarm Handoffs",
                                        "Integrated Vector Memory per Agent",
                                        "Direct Integration with Mautic & Chatwoot"
                                    ].map(item => (
                                        <li key={item} className="flex items-center gap-3">
                                            <div className="w-5 h-5 rounded-full bg-[var(--color-vexis-blue)]/20 flex items-center justify-center text-[var(--color-vexis-blue-hover)]">✓</div>
                                            <span className="text-[14px] font-bold text-white">{item}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            <div className="relative">
                                {/* Abstract Swarm Visualization */}
                                <div className="aspect-square max-w-md mx-auto relative flex items-center justify-center">
                                    <div className="absolute w-full h-full border border-white/5 rounded-full animate-spin" style={{ animationDuration: '20s' }} />
                                    <div className="absolute w-3/4 h-3/4 border border-white/10 rounded-full animate-spin reverse" style={{ animationDuration: '15s' }} />
                                    <div className="absolute w-1/2 h-1/2 border border-white/20 rounded-full animate-spin" style={{ animationDuration: '10s', animationDirection: 'reverse' }} />

                                    <div className="w-24 h-24 rounded-full glass z-20 flex items-center justify-center shadow-[0_0_40px_rgba(42,107,255,0.4)]">
                                        <h4 className="font-display font-black text-lg text-white">VEXIS</h4>
                                    </div>

                                    {/* Orbiting Agents */}
                                    <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 rounded-full glass border border-[var(--color-vexis-blue)] flex items-center justify-center z-10"><span className="text-xl">🎯</span></div>
                                    <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 w-12 h-12 rounded-full glass border border-[var(--color-vexis-green)] flex items-center justify-center z-10"><span className="text-xl">⚡</span></div>
                                    <div className="absolute top-1/2 left-0 -translate-x-1/2 -translate-y-1/2 w-12 h-12 rounded-full glass border border-[var(--color-vexis-violet)] flex items-center justify-center z-10"><span className="text-xl">🔍</span></div>
                                    <div className="absolute top-1/2 right-0 translate-x-1/2 -translate-y-1/2 w-12 h-12 rounded-full glass border border-[var(--color-vexis-amber)] flex items-center justify-center z-10"><span className="text-xl">🧠</span></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Section 3: Meet The Team */}
                <section id="agents" className="py-32 z-20">
                    <div className="text-center mb-16">
                        <h2 className="text-[12px] font-black text-[var(--color-vexis-blue-hover)] uppercase tracking-[0.3em] mb-4">The Hive Mind</h2>
                        <h3 className="font-display font-black text-4xl md:text-5xl text-white tracking-tight">Meet Your Elite Agency Squad.</h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[
                            { name: "Archer", role: "Lead Hunter", desc: "Obsessed with finding high-value prospects. Scrapes Google Maps, LinkedIn, and intent data to build highly qualified target lists.", color: "var(--color-vexis-blue-hover)", icon: "🎯" },
                            { name: "Nova", role: "Sales Closer", desc: "Relentless, charismatic, razor-sharp. Masters the straight-line close, overcomes objections instantly, and converts leads to cash.", color: "var(--color-vexis-green)", icon: "⚡" },
                            { name: "Scout", role: "Research Analyst", desc: "Meticulous and thorough. Deep-dives into target companies, uncovers their tech stack, their pain points, and builds custom reporting.", color: "var(--color-vexis-violet)", icon: "🔍" },
                            { name: "Echo", role: "Content Writer", desc: "High-converting copywriter. Drafts highly personalized cold emails, subject lines that get 60% open rates, and proposal documents.", color: "var(--color-vexis-rose)", icon: "✍️" },
                            { name: "Atlas", role: "Co-Founder / Strategist", desc: "The brain. Structuring deals, planning fulfillment tasks, quoting prices, and overseeing the entire operational workflow.", color: "var(--color-vexis-amber)", icon: "🧠" },
                            { name: "Sentinel", role: "Ops & Monitor", desc: "The silent guardian. Monitors API latencies, checks server health, logs errors, and delivers daily business impact briefings.", color: "var(--color-vexis-teal)", icon: "🛡️" },
                        ].map(a => (
                            <div key={a.name} className="glass rounded-[24px] p-8 flex flex-col hover:scale-105 transition-transform duration-300 border border-white/5 hover:border-[var(--color-vexis-blue)]/50 cursor-default">
                                <div className="w-14 h-14 rounded-[16px] mb-6 flex items-center justify-center text-2xl shadow-inner border border-white/10" style={{ backgroundColor: `${a.color}20` }}>
                                    <span className="drop-shadow-md">{a.icon}</span>
                                </div>
                                <h4 className="font-display font-black text-2xl text-white mb-1">{a.name}</h4>
                                <p className="text-[11px] font-bold uppercase tracking-widest mb-4" style={{ color: a.color }}>{a.role}</p>
                                <p className="text-[14px] text-[var(--color-vexis-text-secondary)] leading-relaxed flex-1">{a.desc}</p>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Section 4: The Marketplace */}
                <section id="marketplace" className="py-24 z-20">
                    <div className="glass rounded-[40px] p-12 md:p-20 relative overflow-hidden border border-[var(--color-vexis-blue)]/30 shadow-[0_0_100px_rgba(42,107,255,0.15)] flex flex-col md:flex-row items-center gap-16">
                        <div className="absolute inset-0 bg-gradient-to-br from-[var(--color-vexis-blue)]/10 to-transparent pointer-events-none" />
                        <div className="absolute -top-40 -right-40 w-96 h-96 bg-[var(--color-vexis-blue)]/20 rounded-full blur-[120px] pointer-events-none" />

                        <div className="flex-1 relative z-10">
                            <h2 className="text-[12px] font-black text-[var(--color-vexis-blue-hover)] uppercase tracking-[0.3em] mb-4">B2B SaaS Engine</h2>
                            <h3 className="font-display font-black text-4xl md:text-6xl text-white tracking-tight leading-[1.1] mb-6">
                                The Open-Source <br />
                                Agent Marketplace.
                            </h3>
                            <p className="text-[16px] font-medium text-[var(--color-vexis-text-secondary)] leading-relaxed mb-8 max-w-lg">
                                Stop building custom agents from scratch. Vexis hosts 20+ specialized, world-class personas (Support Responders, AI Engineers, Analytics). <strong className="text-white">Find a client. Choose an agent. Click Deploy.</strong> Vexis spins up the logic, webhook, and LLM orchestration instantly.
                            </p>
                            <Link href="/dashboard" className="btn-primary px-8 py-4 rounded-[20px] text-[14px] font-black shadow-[0_0_40px_rgba(42,107,255,0.5)] ring-1 ring-white/30 inline-flex items-center gap-3 hover:scale-105 transition-transform">
                                <IconStack className="w-5 h-5 drop-shadow-md" /> Browse 20+ Agents
                            </Link>
                        </div>

                        <div className="w-full md:w-[45%] relative z-10 grid grid-cols-2 gap-4">
                            {[
                                { name: "Support Responder", tag: "Customer Logic" },
                                { name: "AI Engineer", tag: "Code Ops" },
                                { name: "Analytics Reporter", tag: "Data Sci" },
                                { name: "SEO Specialist", tag: "Growth" }
                            ].map((a, i) => (
                                <div key={i} className="glass rounded-[24px] p-6 border border-white/10 hover:-translate-y-2 transition-transform shadow-xl bg-white/[0.02]">
                                    <div className="w-10 h-10 rounded-[12px] bg-[var(--color-vexis-blue)]/20 text-[var(--color-vexis-blue-hover)] flex items-center justify-center mb-4 border border-[var(--color-vexis-blue)]/30"><IconBolt className="w-5 h-5" /></div>
                                    <h4 className="font-display font-black text-white text-lg leading-tight mb-1">{a.name}</h4>
                                    <span className="text-[9px] font-black uppercase tracking-widest text-[var(--color-vexis-text-muted)]">{a.tag}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Final CTA */}
                <section className="py-40 z-20 text-center relative">
                    <div className="absolute inset-x-0 bottom-0 h-1/2 bg-[var(--color-vexis-blue)]/10 blur-[120px] rounded-full pointer-events-none" />
                    <h2 className="font-display font-black text-5xl md:text-7xl text-white tracking-tight mb-8 relative z-10 drop-shadow-2xl">
                        Ready to scale infinitely?
                    </h2>
                    <p className="max-w-xl mx-auto text-[18px] text-[var(--color-vexis-text-secondary)] mb-12 relative z-10">
                        Stop burning capital on bloated sales teams. Deploy Vexis Engine today and control your revenue pipeline via Slack, WhatsApp, or our Dashboard.
                    </p>
                    <div className="relative z-10">
                        <Link href="/dashboard" className="btn-primary px-12 py-5 rounded-[24px] text-lg font-black shadow-[0_0_60px_rgba(42,107,255,0.6)] ring-2 ring-white/30 hover:scale-110 transition-transform inline-flex items-center gap-3">
                            <IconBolt className="w-6 h-6" /> Boot Sequence
                        </Link>
                    </div>
                </section>

                <footer className="py-8 border-t border-[var(--color-vexis-border)]/50 mt-auto text-center z-20">
                    <p className="text-[12px] font-bold text-[var(--color-vexis-text-muted)] tracking-widest uppercase">
                        © 2026 Vexis AI Automation Agency. Internal System v3.0 Powered By Edge Execution.
                    </p>
                </footer>

            </div>
        </div>
    );
}
