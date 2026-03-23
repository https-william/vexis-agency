import { CheckCircle2, Calendar, MessageCircle } from 'lucide-react'

const TierCard = ({ name, features, isMain = false, cta }: any) => (
  <div className={`
    p-12 rounded-[3rem] border transition-all duration-500 relative flex flex-col group
    ${isMain 
      ? 'glass-card border-growth/30 scale-105 z-10 shadow-[0_0_50px_rgba(16,185,129,0.15)] bg-growth/[0.05]' 
      : 'glass-card dark:border-white/5 border-slate-200 hover:border-growth/20 shadow-xl dark:shadow-none'}
  `}>
    {isMain && (
      <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-growth text-white text-[10px] font-black uppercase tracking-widest px-6 py-2 rounded-full shadow-[0_0_20px_rgba(16,185,129,0.5)]">
        Most Popular
      </div>
    )}
    
    <div className="mb-10 text-center md:text-left">
      <h3 className={`text-[11px] font-jetbrains uppercase tracking-[0.4em] mb-4 ${isMain ? 'text-growth' : 'text-slate'}`}>
        {name}
      </h3>
      <div className="flex items-baseline justify-center md:justify-start gap-1">
        <span className="text-2xl font-black opacity-60">Custom Pricing</span>
      </div>
      <p className="text-xs opacity-40 mt-2">Tailored to your business needs</p>
    </div>

    <ul className="space-y-4 mb-12 flex-grow">
      {features.map((f: string, i: number) => (
        <li key={i} className="flex items-start gap-3">
          <CheckCircle2 className={`w-4 h-4 mt-1 shrink-0 ${isMain ? 'text-growth' : 'text-growth/40'}`} />
          <span className="text-sm text-white/70">{f}</span>
        </li>
      ))}
    </ul>

    <a 
      href={cta.href}
      target="_blank"
      rel="noopener noreferrer"
      className={`
        glass-button-3d w-full py-5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all duration-500 relative overflow-hidden flex items-center justify-center gap-3 cursor-pointer
        ${isMain ? 'bg-growth text-white shadow-[0_10px_30px_-5px_rgba(16,185,129,0.3)]' : 'bg-white/5 border border-white/10 text-white hover:bg-white/10'}
      `}
    >
      <cta.icon className="w-4 h-4" />
      <span className="relative z-10">{cta.label}</span>
    </a>
  </div>
)

export default function Pricing() {
  return (
    <section id="membership" className="py-32 px-4 md:px-24 border-t border-white/5 relative z-10">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-24 space-y-6">
          <div className="inline-block px-4 py-1.5 rounded-full border border-growth/20 bg-growth/5 text-[10px] text-growth uppercase tracking-widest font-black mb-4">
            Deployment Tiers
          </div>
          <h2 className="text-5xl md:text-8xl font-black tracking-tighter text-white">
            Let's Build <span className="italic text-growth">Together.</span>
          </h2>
          <p className="text-white/40 font-jetbrains uppercase tracking-widest text-xs max-w-lg mx-auto">
            Every business is different. We design pricing around your actual usage and revenue goals.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <TierCard 
            name="Starter"
            features={[
              "1 AI Voice Agent",
              "Up to 300 minutes/month",
              "WhatsApp Auto-Responder",
              "Basic Analytics Dashboard",
              "Email Support"
            ]}
            cta={{ label: "Book a Discovery Session", href: "https://cal.com", icon: Calendar }}
          />
          <TierCard 
            isMain
            name="Growth"
            features={[
              "3 AI Agents (Voice + WhatsApp + CRM)",
              "Up to 1,000 minutes/month",
              "Lead Qualification Engine",
              "Priority Response (< 4hrs)",
              "Weekly Performance Reports",
              "Custom Agent Personality"
            ]}
            cta={{ label: "Book a Discovery Session", href: "https://cal.com", icon: Calendar }}
          />
          <TierCard 
            name="Scale"
            features={[
              "Unlimited Agent Fleet",
              "Dedicated Infrastructure",
              "Custom Integrations",
              "24/7 Monitoring & Support",
              "Revenue Attribution Dashboard"
            ]}
            cta={{ label: "Chat on WhatsApp", href: "https://wa.me/message/yourlink", icon: MessageCircle }}
          />
        </div>

        <div className="text-center mt-16">
          <p className="text-white/30 text-xs font-jetbrains">
            All plans include a 7-day pilot deployment · No long-term contracts · Cancel anytime
          </p>
        </div>
      </div>
    </section>
  )
}
