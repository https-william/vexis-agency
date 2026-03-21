import { useEffect, useRef, useState } from 'react'
import { gsap } from 'gsap'
import { CheckCircle2, Zap, ArrowRight, ShieldCheck } from 'lucide-react'

export default function Hero() {
  const containerRef = useRef<HTMLDivElement>(null)
  const [activeTask, setActiveTask] = useState("Initializing System...")

  useEffect(() => {
    if (!containerRef.current) return
    
    const tasks = [
      "Confirming Reservation for Table 4...",
      "Updating CRM Lead Priority...",
      "Answering Hotel FAQ (Late Checkout)...",
      "Scheduling Property Tour for 2pm...",
      "Optimizing Workflow Efficiency..."
    ]
    
    let i = 0
    const interval = setInterval(() => {
      setActiveTask(tasks[i % tasks.length])
      i++
    }, 3000)

    const ctx = gsap.context(() => {
      const tl = gsap.timeline()
      tl.from('.hero-content > *', {
        y: 40,
        opacity: 0,
        duration: 0.8,
        stagger: 0.15,
        ease: 'power3.out'
      })
      .from('.hero-skeleton', {
        scale: 0.95,
        opacity: 0,
        duration: 1,
        ease: 'power2.out'
      }, '-=0.4')
    }, containerRef)

    return () => {
      ctx.revert()
      clearInterval(interval)
    }
  }, [])

  return (
    <section ref={containerRef} className="relative min-h-screen w-full flex flex-col lg:flex-row items-center justify-center px-8 lg:px-20 overflow-hidden pt-32 gap-16 lg:gap-24">
      {/* Dynamic Vertical Gradient */}
      <div className="absolute inset-0 bg-v-gradient z-0 opacity-20" />
      
      {/* Text Content */}
      <div className="hero-content relative z-10 w-full lg:w-1/2 space-y-10 text-center lg:text-left">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-growth/10 border border-growth/20 rounded-full text-growth text-[10px] font-black uppercase tracking-[0.2em]">
          <span className="w-1.5 h-1.5 rounded-full bg-growth animate-pulse" />
          The AI Employee for your Business
        </div>

        <h1 className="text-5xl md:text-[5rem] font-black tracking-[-0.05em] leading-[0.9] text-white">
          Stop missing <span className="text-growth">revenue.</span><br />
          Start <span className="opacity-40">scaling.</span>
        </h1>

        <p className="text-base md:text-xl opacity-60 max-w-xl lg:mx-0 mx-auto leading-relaxed font-medium">
          Whether you run a 50-room hotel or a bustling restaurant, Vexis deploys specialized AI agents that handle your bookings, sales, and daily operations—so you can focus on your guests.
        </p>

        <div className="flex flex-wrap lg:justify-start justify-center gap-6">
          <button className="glass-button-3d px-10 py-5 bg-growth/20 text-white rounded-2xl font-black uppercase tracking-widest text-[11px] flex items-center gap-3 active:scale-95 transition-all cursor-pointer">
            <Zap className="w-4 h-4 text-growth" />
            Claim your 24/7 Agent
          </button>
          <button className="px-10 py-5 rounded-2xl font-black uppercase tracking-widest text-[11px] transition-all active:scale-95 cursor-pointer dark:text-white/60 text-slate-500 hover:text-white flex items-center gap-2">
            View Industry Case Studies
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <div className="flex flex-wrap lg:justify-start justify-center gap-8 pt-4 opacity-40">
          <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest">
            <ShieldCheck className="w-4 h-4" />
            PCI Compliant
          </div>
          <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest">
            <CheckCircle2 className="w-4 h-4" />
            Elite Implementation
          </div>
        </div>
      </div>

      {/* The "Backbone" Preview - Visualizing the Actual Work */}
      <div className="hero-skeleton relative z-10 w-full lg:w-[480px] aspect-[4/5] bg-black/40 backdrop-blur-3xl border border-white/10 rounded-[3rem] p-8 shadow-2xl overflow-hidden flex flex-col">
        <div className="flex items-center justify-between mb-8">
          <div className="flex gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500/50" />
            <div className="w-3 h-3 rounded-full bg-amber-500/50" />
            <div className="w-3 h-3 rounded-full bg-growth/50" />
          </div>
          <div className="text-[10px] font-jetbrains uppercase tracking-widest opacity-40">Live Agent Feed</div>
        </div>

        <div className="flex-1 space-y-6">
          <div className="p-4 bg-white/[0.03] border border-white/5 rounded-2xl">
            <div className="text-[9px] uppercase font-black text-growth mb-2 tracking-widest">Active Task</div>
            <div className="text-sm font-medium text-white/90 font-jetbrains animate-pulse">
              &gt; {activeTask}
            </div>
          </div>

          <div className="space-y-4 pt-4 border-t border-white/5">
            {[
              { label: 'Network Latency', value: '14ms', status: 'Optimal' },
              { label: 'Booking Success', value: '99.8%', status: 'Stable' },
              { label: 'Response Speed', value: '0.4s', status: 'Elite' },
            ].map((stat, i) => (
              <div key={i} className="flex justify-between items-center px-4 py-3 bg-white/[0.02] rounded-xl border border-white/5">
                <span className="text-[10px] uppercase font-bold opacity-40 tracking-widest">{stat.label}</span>
                <span className="text-xs font-jetbrains font-bold text-growth">{stat.value}</span>
              </div>
            ))}
          </div>

          <div className="mt-8 relative h-32 rounded-2xl bg-gradient-to-t from-growth/10 to-transparent border border-growth/10 flex items-center justify-center group pointer-events-none">
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10" />
            <div className="flex flex-col items-center gap-2">
              <span className="text-[9px] font-black uppercase tracking-[0.3em] text-growth">Infrastructure Ready</span>
              <div className="flex gap-1">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="w-1 h-3 bg-growth/40 rounded-full animate-bounce" style={{ animationDelay: `${i * 0.1}s` }} />
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="mt-auto pt-6 text-center">
          <span className="text-[10px] font-jetbrains uppercase tracking-widest opacity-20">Vexis Core Architecture v2.0.4</span>
        </div>
      </div>
    </section>
  )
}
