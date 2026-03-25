import { useState } from 'react'
import { Send, CheckCircle2, Calendar } from 'lucide-react'

const CAL_LINK = "https://cal.com/mrwiliam/vexis"

export default function LeadBackbone() {
  const [status, setStatus] = useState<'IDLE' | 'SENDING' | 'SUCCESS'>('IDLE')
  const [formData, setFormData] = useState({ name: '', industry: 'Hotel', email: '' })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setStatus('SENDING')
    setTimeout(() => setStatus('SUCCESS'), 1500)
  }

  return (
    <section id="reserve" className="py-28 px-6 lg:px-20 relative overflow-hidden warm-ambient">
      <div className="max-w-3xl mx-auto relative z-10 glass-panel-strong p-10 lg:p-16 rounded-3xl text-center">
        {/* Inner warm glow */}
        <div className="absolute inset-0 rounded-3xl overflow-hidden pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-2/3 h-1/3 bg-electric/[0.04] blur-[80px]" />
        </div>

        <div className="max-w-xl mx-auto space-y-6 relative z-10">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-8"
            style={{ background: 'var(--bg)', boxShadow: 'var(--inner-shadow), 0 0 0 1px var(--border)' }}>
            <Calendar className="w-7 h-7 text-electric" />
          </div>

          <h2 className="text-3xl md:text-5xl font-bold tracking-tight">
            Ready to <span className="text-electric">start?</span>
          </h2>
          <p className="text-[var(--muted)]">
            Book a free discovery session. We'll audit your operations and show you exactly where AI agents can save you time and money.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <a href={CAL_LINK} target="_blank" rel="noopener noreferrer"
              className="clay-button clay-button-accent px-8 py-4 font-semibold text-sm flex items-center justify-center gap-2 text-white">
              <Calendar className="w-4 h-4" />
              Book a Free Demo
            </a>
          </div>

          <div className="relative pt-8">
            <div className="absolute inset-x-0 top-0 h-px" style={{ background: 'linear-gradient(90deg, transparent, var(--border), transparent)' }} />
            <p className="text-[10px] text-[var(--muted)] uppercase tracking-widest mb-6">Or leave your details</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 text-left">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] uppercase font-medium tracking-widest text-[var(--muted)] ml-1 mb-1.5 block">Name</label>
                <input required type="text" placeholder="Your name"
                  className="skeu-input w-full px-4 py-3 text-sm"
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})} />
              </div>
              <div>
                <label className="text-[10px] uppercase font-medium tracking-widest text-[var(--muted)] ml-1 mb-1.5 block">Industry</label>
                <select className="skeu-input w-full px-4 py-3 text-sm cursor-pointer appearance-none"
                  value={formData.industry}
                  onChange={e => setFormData({...formData, industry: e.target.value})}>
                  <option value="Hotel">Hospitality / Hotel</option>
                  <option value="Restaurant">Restaurant / Dining</option>
                  <option value="RealEstate">Real Estate</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-[10px] uppercase font-medium tracking-widest text-[var(--muted)] ml-1 mb-1.5 block">Email</label>
              <input required type="email" placeholder="you@company.com"
                className="skeu-input w-full px-4 py-3 text-sm"
                value={formData.email}
                onChange={e => setFormData({...formData, email: e.target.value})} />
            </div>

            <button type="submit" disabled={status !== 'IDLE'}
              className="clay-button w-full py-4 font-semibold text-sm flex items-center justify-center gap-2.5 disabled:opacity-50">
              {status === 'IDLE' && <><Send className="w-3.5 h-3.5" /> Submit</>}
              {status === 'SENDING' && <div className="w-4 h-4 border-2 border-electric border-t-transparent rounded-full animate-spin" />}
              {status === 'SUCCESS' && <><CheckCircle2 className="w-4 h-4 text-emerald-500" /> We'll be in touch!</>}
            </button>
          </form>

          {status === 'SUCCESS' && (
            <div className="mt-4 p-3 clay-card rounded-xl" style={{ background: 'rgba(16,185,129,0.05)' }}>
              <p className="text-xs text-emerald-500 font-medium">
                We'll contact {formData.email} within 12 hours.
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
