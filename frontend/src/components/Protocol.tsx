import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { Search, Rocket, TrendingUp } from 'lucide-react'

gsap.registerPlugin(ScrollTrigger)

const steps = [
  {
    step: "01",
    title: "Discovery",
    desc: "We audit your operations and identify where leads and revenue are slipping through the cracks.",
    icon: Search,
  },
  {
    step: "02",
    title: "Deployment",
    desc: "We build and deploy custom AI agents trained on your specific business, menu, listings, or services.",
    icon: Rocket,
  },
  {
    step: "03",
    title: "Optimization",
    desc: "We monitor performance, tune responses, and ensure your agents get smarter every week.",
    icon: TrendingUp,
  }
]

export default function Protocol() {
  const containerRef = useRef(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from('.protocol-step', {
        scrollTrigger: { trigger: '.protocol-grid', start: 'top 80%' },
        y: 30, opacity: 0, duration: 0.6, stagger: 0.15, ease: 'power3.out'
      })
    }, containerRef)
    return () => ctx.revert()
  }, [])

  return (
    <section id="protocol" ref={containerRef} className="relative py-28 px-6 lg:px-20 warm-ambient">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-20 space-y-3">
          <span className="text-[10px] font-semibold uppercase tracking-[0.3em] text-electric">How It Works</span>
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight">
            Three steps to <span className="text-electric">autopilot.</span>
          </h2>
        </div>

        <div className="protocol-grid grid grid-cols-1 md:grid-cols-3 gap-8 relative">
          {/* Connecting line (desktop only) */}
          <div className="hidden md:block absolute top-16 left-[16.67%] right-[16.67%] h-px" style={{ background: 'linear-gradient(90deg, transparent, var(--accent), transparent)', opacity: 0.2 }} />

          {steps.map((s, i) => (
            <div key={i} className="protocol-step clay-card p-8 relative text-center">
              {/* Skeuomorphic step badge */}
              <div className="mx-auto mb-6 w-14 h-14 rounded-2xl flex items-center justify-center relative"
                style={{ background: 'var(--bg)', boxShadow: 'var(--inner-shadow), 0 0 0 1px var(--border)' }}>
                <s.icon className="w-6 h-6 text-electric" />
                <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-electric text-white text-[9px] font-bold flex items-center justify-center shadow-lg">
                  {s.step}
                </div>
              </div>

              <h3 className="text-xl font-bold mb-3">{s.title}</h3>
              <p className="text-[var(--muted)] text-sm leading-relaxed">{s.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
