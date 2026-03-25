import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { Hotel, Home, ShoppingBag, ArrowUpRight } from 'lucide-react'

gsap.registerPlugin(ScrollTrigger)

const INDUSTRIES = [
  {
    title: "Hospitality & Dining",
    description: "Agents that handle bookings, answer FAQs, and manage cancellations — 24/7, no breaks.",
    icon: Hotel,
    features: ["24/7 Table Booking", "Instant Checkout Support", "Review Response Automation"],
    tag: "Never Miss a Guest",
    gradient: "from-amber-500/10 to-orange-500/5"
  },
  {
    title: "Real Estate",
    description: "Qualify leads in seconds and schedule viewings automatically. Your agents respond faster than any human team.",
    icon: Home,
    features: ["Lead Qualification", "Viewing Scheduler", "Follow-up Sequences"],
    tag: "Close Faster",
    gradient: "from-electric/10 to-blue-600/5"
  },
  {
    title: "Retail & Services",
    description: "Order tracking, returns, and upsells handled by AI that knows your customers.",
    icon: ShoppingBag,
    features: ["Order Tracking", "Return Management", "Personalized Upsells"],
    tag: "Scale Without Hiring",
    gradient: "from-emerald-500/10 to-green-600/5"
  }
]

export default function Features() {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!containerRef.current) return
    const ctx = gsap.context(() => {
      // Section heading reveal
      gsap.from('.features-heading > *', {
        scrollTrigger: { trigger: '.features-heading', start: 'top 85%' },
        y: 30, opacity: 0, duration: 0.7, stagger: 0.1, ease: 'power3.out'
      })

      // Cards entrance: staggered with scale + slight rotation
      gsap.from('.feature-card', {
        scrollTrigger: { trigger: '.features-grid', start: 'top 80%' },
        y: 60, opacity: 0, scale: 0.92, rotateX: 4,
        duration: 0.8, stagger: 0.18, ease: 'power3.out'
      })
    }, containerRef)
    return () => ctx.revert()
  }, [])

  return (
    <section ref={containerRef} id="features" className="relative py-28 px-6 lg:px-20 overflow-hidden warm-ambient">
      <div className="max-w-6xl mx-auto">
        <div className="features-heading text-center mb-20 space-y-3">
          <span className="text-[10px] font-semibold uppercase tracking-[0.3em] text-electric">What We Deploy</span>
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight">
            Agents built for your <span className="text-electric">industry.</span>
          </h2>
          <p className="text-[var(--muted)] max-w-xl mx-auto">
            We don't sell software. We deploy AI employees that solve specific bottlenecks for your business.
          </p>
        </div>

        <div className="features-grid grid grid-cols-1 md:grid-cols-3 gap-8">
          {INDUSTRIES.map((ind, i) => (
            <div key={i} className="feature-card group clay-card p-8 relative overflow-hidden">
              {/* Gradient overlay */}
              <div className={`absolute inset-0 bg-gradient-to-br ${ind.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-3xl`} />
              
              <div className="relative z-10">
                <div className="absolute top-0 right-0 opacity-0 group-hover:opacity-100 transition-opacity">
                  <ArrowUpRight className="w-4 h-4 text-electric" />
                </div>

                {/* Skeuomorphic icon container */}
                <div className="mb-6 w-14 h-14 rounded-2xl flex items-center justify-center" 
                  style={{ background: 'var(--bg)', boxShadow: 'var(--inner-shadow), 0 0 0 1px var(--border)' }}>
                  <ind.icon className="w-6 h-6 text-electric" />
                </div>

                <span className="text-[9px] font-semibold uppercase tracking-widest text-[var(--muted)]">{ind.tag}</span>
                <h3 className="text-xl font-semibold mt-2 mb-3">{ind.title}</h3>
                <p className="text-[var(--muted)] text-sm leading-relaxed mb-6">{ind.description}</p>

                <ul className="space-y-2.5 pt-6" style={{ borderTop: '1px solid var(--border)' }}>
                  {ind.features.map((feat, j) => (
                    <li key={j} className="flex items-center gap-2.5 text-xs text-[var(--text-secondary)]">
                      <div className="w-1.5 h-1.5 rounded-full bg-electric" />
                      {feat}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
