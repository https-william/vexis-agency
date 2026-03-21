import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { Hotel, Home, ShoppingBag, ArrowUpRight } from 'lucide-react'

export default function Features() {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!containerRef.current) return
    const ctx = gsap.context(() => {
      gsap.from('.feature-card', {
        scrollTrigger: {
          trigger: '.features-grid',
          start: 'top 80%',
        },
        y: 60,
        opacity: 0,
        duration: 0.8,
        stagger: 0.2,
        ease: 'power3.out'
      })
    }, containerRef)
    return () => ctx.revert()
  }, [])

  const industries = [
    {
      title: "Hospitality & Dining",
      description: "Agents that handle late-night bookings, answer menu FAQs, and manage reservation cancellations without you lifting a finger.",
      icon: <Hotel className="w-6 h-6 text-growth" />,
      features: ["24/7 Table Booking", "Instant Checkout Support", "Review Automated Responses"],
      tag: "Never Miss a Guest"
    },
    {
      title: "Real Estate & Housing",
      description: "24/7 lead response and property tour scheduling. Our agents qualify buyers in seconds and book viewings on your calendar.",
      icon: <Home className="w-6 h-6 text-growth" />,
      features: ["Lead Qualification", "Viewing Scheduler", "MLS Data Integration"],
      tag: "Close Faster"
    },
    {
      title: "Retail & E-commerce",
      description: "Hyper-fast customer support that tracks orders, handles returns, and upsells customers based on their history.",
      icon: <ShoppingBag className="w-6 h-6 text-growth" />,
      features: ["Order Tracking GPT", "Return Management", "Personalized Upsells"],
      tag: "Infinite Scale"
    }
  ]

  return (
    <section ref={containerRef} id="features" className="relative py-32 px-8 lg:px-20 bg-black overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
      
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-24 space-y-4">
          <span className="text-[10px] font-black uppercase tracking-[0.4em] text-growth">Core Deployment Profiles</span>
          <h2 className="text-4xl md:text-6xl font-black tracking-tight text-white mb-6">
            Agents built for your <span className="text-growth">bottom line.</span>
          </h2>
          <p className="text-white/40 max-w-2xl mx-auto text-lg">
            We don't sell software. We deploy specialized AI employees that solve specific revenue bottlenecks for your industry.
          </p>
        </div>

        <div className="features-grid grid grid-cols-1 md:grid-cols-3 gap-8">
          {industries.map((ind, i) => (
            <div key={i} className="feature-card group relative p-10 bg-white/[0.02] border border-white/5 rounded-[2.5rem] hover:bg-white/[0.04] transition-all duration-500 overflow-hidden">
              <div className="absolute top-0 right-0 p-6 opacity-0 group-hover:opacity-100 transition-opacity">
                <ArrowUpRight className="w-5 h-5 text-growth" />
              </div>

              <div className="mb-8 w-14 h-14 rounded-2xl bg-growth/10 flex items-center justify-center border border-growth/20">
                {ind.icon}
              </div>

              <div className="space-y-4 mb-8">
                <span className="text-[9px] font-black uppercase tracking-widest text-growth/60">{ind.tag}</span>
                <h3 className="text-2xl font-bold text-white">{ind.title}</h3>
                <p className="text-white/50 text-sm leading-relaxed">
                  {ind.description}
                </p>
              </div>

              <ul className="space-y-3 pt-8 border-t border-white/5">
                {ind.features.map((feat, j) => (
                  <li key={j} className="flex items-center gap-3 text-xs text-white/40">
                    <div className="w-1.5 h-1.5 rounded-full bg-growth" />
                    {feat}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
