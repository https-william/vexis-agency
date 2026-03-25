import { Github, Twitter, Linkedin, Mail } from 'lucide-react'

const WA_LINK = "https://wa.me/2347071703030"

export default function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="relative pt-28 pb-10 px-6 lg:px-20 overflow-hidden">
      {/* Warm ambient gradient */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full h-1/2 bg-electric/[0.02] blur-[120px] pointer-events-none" />

      <div className="max-w-6xl mx-auto relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-20">
          <div className="col-span-1 md:col-span-2 space-y-6">
            <h2 className="text-3xl font-bold tracking-tight">Vexis.</h2>
            <p className="text-sm text-[var(--muted)] max-w-sm leading-relaxed">
              AI employees that handle your bookings, sales, and customer support — so you can focus on growing your business.
            </p>
            <div className="flex gap-3">
              {[
                { icon: Twitter, href: "#" },
                { icon: Github, href: "https://github.com/https-william/vexis-agency" },
                { icon: Linkedin, href: "#" },
                { icon: Mail, href: "mailto:hello@vexis.agency" },
              ].map(({ icon: Icon, href }, i) => (
                <a key={i} href={href} target="_blank" rel="noopener noreferrer"
                  className="clay-button w-10 h-10 flex items-center justify-center text-[var(--muted)] hover:text-electric transition-colors">
                  <Icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-[10px] font-semibold uppercase tracking-[0.2em] text-electric mb-6">Solutions</h4>
            <ul className="space-y-3">
              {['Voice Agents', 'WhatsApp Bots', 'CRM Integration', 'Lead Qualification'].map(item => (
                <li key={item}>
                  <a href="#features" className="text-sm text-[var(--muted)] hover:text-electric transition-colors">{item}</a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[var(--muted)] mb-6">Company</h4>
            <ul className="space-y-3">
              {[
                { label: 'About', href: '#philosophy' },
                { label: 'Plans', href: '#membership' },
                { label: 'Contact', href: '#reserve' },
                { label: 'WhatsApp', href: WA_LINK },
              ].map(item => (
                <li key={item.label}>
                  <a href={item.href} className="text-sm text-[var(--muted)] hover:text-electric transition-colors">{item.label}</a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="pt-8 flex flex-col md:flex-row justify-between items-center gap-4" style={{ borderTop: '1px solid var(--border)' }}>
          <div className="text-[10px] font-jetbrains text-[var(--muted)] uppercase tracking-widest">
            © {currentYear} Vexis · Lagos, Nigeria
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 glass-panel rounded-full">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[9px] font-jetbrains uppercase tracking-widest text-emerald-500 font-medium">All Systems Online</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
