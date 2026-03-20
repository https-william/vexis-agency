import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'

export default function Hero() {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!containerRef.current) return
    
    const ctx = gsap.context(() => {
      const tl = gsap.timeline()
      
      tl.from('.hero-badge', {
        scale: 0.8,
        opacity: 0,
        duration: 0.8,
        ease: 'back.out(1.7)'
      })
      .from('.hero-main-text', {
        y: 60,
        opacity: 0,
        duration: 1.2,
        ease: 'power4.out'
      }, '-=0.4')
      .from('.hero-sub-text', {
        y: 20,
        opacity: 0,
        duration: 0.8,
        ease: 'power2.out'
      }, '-=0.6')
      .from('.hero-buttons', {
        y: 20,
        opacity: 0,
        duration: 0.8,
        ease: 'power2.out'
      }, '-=0.4')
    }, containerRef)

    return () => ctx.revert()
  }, [])

  return (
    <section ref={containerRef} className="relative min-h-screen w-full flex flex-col items-center justify-center text-center px-4 overflow-hidden pt-32">
      {/* Dynamic Vertical Gradient - Defined in CSS */}
      <div className="absolute inset-0 bg-v-gradient z-0" />

      {/* Hero Logo with Circular Blending Aura */}
      <div className="hero-badge relative mb-12 group">
        <div className="relative z-10 w-48 h-48 md:w-64 md:h-64 logo-aura flex items-center justify-center">
          <img 
            src="/vexis-logo.png" 
            alt="Vexis Identity" 
            className="w-full h-full object-contain"
          />
        </div>
      </div>

      <div className="relative z-10 max-w-5xl space-y-10">
        <h1 className="hero-main-text text-4xl md:text-[5.5rem] font-black tracking-[-0.05em] leading-[0.9]">
          Autonomous<br />
          <span className="opacity-40">Revenue Control.</span>
        </h1>

        <p className="hero-sub-text text-base md:text-lg opacity-60 max-w-xl mx-auto leading-relaxed font-medium">
          Stop wasting hours on repetitive tasks. Deploy an elite fleet of specialized AI agents that handle your sales, research, and daily operations entirely on autopilot.
        </p>

        <div className="hero-buttons flex flex-wrap justify-center gap-6">
          <button className="glass-button-3d px-10 py-4 bg-electric/20 text-white rounded-2xl font-black uppercase tracking-widest text-[11px] flex items-center gap-3 active:scale-95 transition-all cursor-pointer">
            <span className="w-5 h-5 bg-white/10 rounded-lg flex items-center justify-center text-xs shadow-inner">⚡</span>
            Initialize Fleet
          </button>
          <button className="glass-button-3d px-10 py-4 bg-white/[0.05] rounded-2xl font-black uppercase tracking-widest text-[11px] hover:bg-white/[0.1] transition-colors active:scale-95 cursor-pointer dark:text-white text-slate-900 border dark:border-white/10 border-slate-200">
            Operational Protocol
          </button>
        </div>
      </div>
    </section>
  )
}
