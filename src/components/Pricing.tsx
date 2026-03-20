import { CheckCircle2 } from 'lucide-react'

const PricingCard = ({ name, price, features, isMain = false }: any) => (
  <div className={`
    p-12 rounded-[3rem] border transition-all duration-500 relative flex flex-col group
    ${isMain 
      ? 'glass-card border-electric/30 scale-105 z-10 shadow-[0_0_50px_rgba(59,130,246,0.15)] bg-electric/[0.05]' 
      : 'glass-card dark:border-white/5 border-slate-200 hover:border-electric/20 shadow-xl dark:shadow-none'}
  `}>
    {isMain && (
      <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-electric text-white text-[10px] font-black uppercase tracking-widest px-6 py-2 rounded-full shadow-[0_0_20px_rgba(59,130,246,0.5)]">
        Most Optimized
      </div>
    )}
    
    <div className="mb-10 text-center md:text-left">
      <h3 className={`text-[11px] font-jetbrains uppercase tracking-[0.4em] mb-4 ${isMain ? 'text-electric' : 'text-slate'}`}>
        {name}
      </h3>
      <div className="flex items-baseline justify-center md:justify-start gap-1">
        <span className="text-4xl font-black">₦{price}</span>
        <span className="text-xs opacity-40">/retainer</span>
      </div>
    </div>

    <ul className="space-y-4 mb-12 flex-grow">
      {features.map((f: string, i: number) => (
        <li key={i} className="flex items-start gap-3">
          <CheckCircle2 className={`w-4 h-4 mt-1 shrink-0 ${isMain ? 'text-electric' : 'text-electric/40'}`} />
          <span className="text-sm text-white/70">{f}</span>
        </li>
      ))}
    </ul>

    <button className={`
      glass-button-3d w-full py-5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all duration-500 relative overflow-hidden
      ${isMain ? 'bg-electric text-white shadow-[0_10px_30px_-5px_rgba(59,130,246,0.3)]' : 'bg-white/5 border border-white/10 text-white hover:bg-white/10'}
    `}>
      <span className="relative z-10">Select Infrastructure</span>
    </button>
  </div>
)

export default function Pricing() {
  return (
    <section id="membership" className="py-32 px-4 md:px-24 border-t border-white/5 relative z-10">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-24 space-y-6">
          <div className="inline-block px-4 py-1.5 rounded-full border border-electric/20 bg-electric/5 text-[10px] text-electric uppercase tracking-widest font-black mb-4">
            Pricing Models
          </div>
          <h2 className="text-5xl md:text-8xl font-black tracking-tighter text-white">
            Select Your <span className="italic text-electric">Tier.</span>
          </h2>
          <p className="text-slate font-jetbrains uppercase tracking-widest text-xs">
            Invisible infrastructure at scale.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <PricingCard 
            name="Essential"
            price="3.5M"
            features={[
              "3 Core Automation Flows",
              "Single-Tenant AI Agent",
              "Invisible Bridge Support",
              "Data Silo Security"
            ]}
          />
          <PricingCard 
            isMain
            name="Performance"
            price="8.2M"
            features={[
              "10 Advanced Workflows",
              "Parallel Agent Swarm",
              "Emergency Break-Fix Support",
              "Priority API Thresholds",
              "Custom Integrator Protocol"
            ]}
          />
          <PricingCard 
            name="Enterprise"
            price="Talk to Sales"
            features={[
              "Unlimited Orchestration",
              "Dedicated Infrastructure",
              "Surgical Transformation Team",
              "24/7 Monitoring Unit"
            ]}
          />
        </div>
      </div>
    </section>
  )
}
