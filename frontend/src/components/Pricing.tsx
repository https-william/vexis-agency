import { CheckCircle2, Calendar, MessageCircle } from 'lucide-react'
import { useGeoPrice } from '../hooks/useGeoPrice'

const CAL_LINK = "https://cal.com/mrwiliam/vexis"
const WA_LINK = "https://wa.me/2347071703030"

interface TierProps {
  name: string
  price: string
  priceNote: string
  features: string[]
  isMain?: boolean
  cta: { label: string; href: string; icon: typeof Calendar }
}

const TierCard = ({ name, price, priceNote, features, isMain = false, cta }: TierProps) => (
  <div className={`p-10 relative flex flex-col transition-all duration-300 ${
    isMain 
      ? 'glass-panel-strong rounded-3xl scale-[1.02] z-10' 
      : 'clay-card'
  }`}>
    {isMain && (
      <>
        <div className="absolute inset-0 rounded-3xl pointer-events-none" style={{
          boxShadow: '0 0 40px rgba(59,130,246,0.08), inset 0 1px 0 rgba(255,255,255,0.08)'
        }} />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 clay-button clay-button-accent text-white text-[9px] font-semibold uppercase tracking-widest px-5 py-1.5">
          Most Popular
        </div>
      </>
    )}
    
    <div className="mb-8 relative z-10">
      <h3 className={`text-[10px] font-jetbrains uppercase tracking-[0.3em] mb-3 ${isMain ? 'text-electric' : 'text-[var(--muted)]'}`}>
        {name}
      </h3>
      <div className="flex items-baseline gap-1">
        <span className="text-3xl font-bold">{price}</span>
        <span className="text-xs text-[var(--muted)]">{priceNote}</span>
      </div>
    </div>

    <ul className="space-y-3 mb-10 flex-grow relative z-10">
      {features.map((f, i) => (
        <li key={i} className="flex items-start gap-2.5">
          <CheckCircle2 className={`w-4 h-4 mt-0.5 shrink-0 ${isMain ? 'text-electric' : 'text-electric/40'}`} />
          <span className="text-sm text-[var(--muted)]">{f}</span>
        </li>
      ))}
    </ul>

    <a href={cta.href} target="_blank" rel="noopener noreferrer"
      className={`relative z-10 w-full py-4 rounded-xl text-[10px] font-semibold uppercase tracking-widest transition-all duration-300 flex items-center justify-center gap-2.5 cursor-pointer ${
        isMain 
          ? 'clay-button clay-button-accent text-white'
          : 'clay-button text-[var(--text)]'
      }`}>
      <cta.icon className="w-3.5 h-3.5" />
      {cta.label}
    </a>
  </div>
)

export default function Pricing() {
  const geo = useGeoPrice()

  return (
    <section id="membership" className="py-28 px-6 lg:px-20 relative z-10 warm-ambient">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-20 space-y-3">
          <span className="text-[10px] font-semibold uppercase tracking-[0.3em] text-electric">Plans</span>
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight">
            Simple, transparent <span className="text-electric">pricing.</span>
          </h2>
          <p className="text-[var(--muted)] max-w-lg mx-auto">
            Every plan includes a 7-day pilot. No contracts. Cancel anytime.
          </p>
          {!geo.loading && geo.country !== 'International' && (
            <p className="text-[10px] text-[var(--muted)] uppercase tracking-widest">
              Pricing shown in {geo.currency} for {geo.country}
            </p>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
          <TierCard 
            name="Starter"
            price={geo.loading ? '...' : `${geo.symbol}${geo.starter}`}
            priceNote="/month"
            features={[
              "1 AI Voice Agent",
              "300 minutes included",
              "WhatsApp Auto-Responder",
              "Basic Analytics",
              "Email Support"
            ]}
            cta={{ label: "Book a Demo", href: CAL_LINK, icon: Calendar }}
          />
          <TierCard 
            isMain
            name="Growth"
            price={geo.loading ? '...' : `${geo.symbol}${geo.growth}`}
            priceNote="/month"
            features={[
              "3 AI Agents (Voice + WhatsApp + CRM)",
              "1,000 minutes included",
              "Lead Qualification Engine",
              "Priority Support (< 4hrs)",
              "Weekly Performance Reports",
              "Custom Agent Personality"
            ]}
            cta={{ label: "Book a Demo", href: CAL_LINK, icon: Calendar }}
          />
          <TierCard 
            name="Scale"
            price="Custom"
            priceNote=""
            features={[
              "Unlimited Agent Fleet",
              "Dedicated Infrastructure",
              "Custom Integrations",
              "24/7 Monitoring & Support",
              "Revenue Attribution Dashboard"
            ]}
            cta={{ label: "Chat on WhatsApp", href: WA_LINK, icon: MessageCircle }}
          />
        </div>
      </div>
    </section>
  )
}
