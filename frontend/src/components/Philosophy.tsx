import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

export default function Philosophy() {
  const sectionRef = useRef(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      const lines = gsap.utils.toArray('.manifesto-line')
      lines.forEach((line: any) => {
        gsap.from(line, {
          scrollTrigger: { trigger: line, start: 'top 85%' },
          y: 25, opacity: 0, duration: 0.8, ease: 'power3.out'
        })
      })
    }, sectionRef)
    return () => ctx.revert()
  }, [])

  return (
    <section id="philosophy" ref={sectionRef} className="relative py-36 px-6 lg:px-20 overflow-hidden">
      {/* Warm ambient background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-0 w-1/2 h-full bg-electric/[0.02] blur-[150px] rounded-full -translate-y-1/2" />
        <div className="absolute bottom-0 right-0 w-1/3 h-1/2 bg-amber-500/[0.02] blur-[120px] rounded-full" />
      </div>
      
      <div className="max-w-5xl mx-auto relative z-10">
        <div className="flex flex-col gap-20">
          <div className="manifesto-line space-y-4 max-w-lg">
            <span className="inline-block text-[10px] font-semibold uppercase tracking-[0.3em] text-[var(--muted)] px-3 py-1.5 glass-panel rounded-full">The Problem</span>
            <p className="text-xl md:text-2xl text-[var(--text-secondary)] leading-relaxed">
              Your business is losing customers right now because no one picked up the phone. Or replied to that WhatsApp message. Or followed up on that lead.
            </p>
          </div>

          <div className="manifesto-line space-y-4 text-right ml-auto max-w-3xl">
            <span className="inline-block text-[10px] font-semibold uppercase tracking-[0.3em] text-electric px-3 py-1.5 glass-panel rounded-full">Our Solution</span>
            <h2 className="text-4xl md:text-7xl font-bold tracking-tight leading-[0.95]">
              AI that works<br />
              <span className="text-electric">while you sleep.</span>
            </h2>
            <p className="text-[var(--muted)] text-sm md:text-base max-w-md ml-auto">
              We deploy autonomous agents that handle calls, bookings, and inquiries 24/7 — so you never miss another naira.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
