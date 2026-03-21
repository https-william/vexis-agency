import { useState } from 'react'
import { Send, Sparkles, CheckCircle2 } from 'lucide-react'

export default function LeadBackbone() {
  const [status, setStatus] = useState<'IDLE' | 'SENDING' | 'SUCCESS'>('IDLE')
  const [formData, setFormData] = useState({ name: '', industry: 'Hotel', email: '' })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setStatus('SENDING')
    setTimeout(() => {
      setStatus('SUCCESS')
    }, 1500)
  }

  return (
    <section id="reserve" className="py-32 px-8 lg:px-20 relative bg-black overflow-hidden">
      <div className="absolute inset-0 bg-growth/5 blur-[120px] rounded-full translate-y-1/2" />
      
      <div className="max-w-5xl mx-auto relative z-10 glass-card p-12 lg:p-20 rounded-[4rem] text-center">
        <div className="max-w-2xl mx-auto space-y-8">
          <div className="w-16 h-16 bg-growth/20 rounded-2xl flex items-center justify-center mx-auto mb-10 border border-growth/40 shadow-[0_0_30px_rgba(16,185,129,0.2)]">
            <Sparkles className="w-8 h-8 text-growth" />
          </div>

          <h2 className="text-4xl md:text-6xl font-black tracking-tighter text-white">
            Ready to <span className="text-growth">deploy?</span>
          </h2>
          <p className="text-lg text-white/50">
            Secure your slot in our exclusive deployment queue. We only onboard 3 elite clients per month to ensure absolute infrastructure stability.
          </p>

          <form onSubmit={handleSubmit} className="mt-12 space-y-6 text-left">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] uppercase font-black tracking-widest text-white/40 ml-4">Full Identity</label>
                <input 
                  required
                  type="text" 
                  placeholder="John Vexis" 
                  className="w-full bg-white/[0.03] border border-white/10 rounded-2xl px-6 py-4 text-white focus:border-growth/50 focus:bg-white/[0.05] transition-all outline-none"
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] uppercase font-black tracking-widest text-white/40 ml-4">Industry Sector</label>
                <select 
                  className="w-full bg-white/[0.03] border border-white/10 rounded-2xl px-6 py-4 text-white focus:border-growth/50 outline-none appearance-none cursor-pointer"
                  value={formData.industry}
                  onChange={e => setFormData({...formData, industry: e.target.value})}
                >
                  <option value="Hotel">Hospitality / Hotel</option>
                  <option value="Restaurant">Restaurant / Dining</option>
                  <option value="RealEstate">Real Estate</option>
                  <option value="Other">Other Enterprise</option>
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] uppercase font-black tracking-widest text-white/40 ml-4">Communication Channel (Email)</label>
              <input 
                required
                type="email" 
                placeholder="hq@yourbrand.com" 
                className="w-full bg-white/[0.03] border border-white/10 rounded-2xl px-6 py-4 text-white focus:border-growth/50 focus:bg-white/[0.05] transition-all outline-none"
                value={formData.email}
                onChange={e => setFormData({...formData, email: e.target.value})}
              />
            </div>

            <button 
              type="submit"
              disabled={status !== 'IDLE'}
              className="w-full group glass-button-3d py-6 rounded-2xl bg-growth/20 flex items-center justify-center gap-4 text-white font-black uppercase tracking-[0.2em] text-xs cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden"
            >
              {status === 'IDLE' && (
                <>
                  Connect with an Architect 
                  <Send className="w-4 h-4 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform text-growth" />
                </>
              )}
              {status === 'SENDING' && <div className="w-5 h-5 border-2 border-growth border-t-transparent rounded-full animate-spin" />}
              {status === 'SUCCESS' && (
                <>
                  Protocol Initialized
                  <CheckCircle2 className="w-5 h-5 text-growth" />
                </>
              )}
            </button>
          </form>

          {status === 'SUCCESS' && (
            <div className="mt-8 p-4 bg-growth/10 border border-growth/20 rounded-2xl animate-fade-in">
              <p className="text-xs text-growth font-bold uppercase tracking-widest">
                Verification sent to {formData.email}. Our team will contact you in &lt; 12 hours.
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
