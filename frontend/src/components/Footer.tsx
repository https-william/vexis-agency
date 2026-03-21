import { Github, Twitter, Linkedin, Mail } from 'lucide-react'

export default function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="relative bg-obsidian pt-40 pb-12 px-8 overflow-hidden rounded-t-[4rem]">
      {/* High-Impact Brand Cover Background */}
      <div className="absolute inset-0 z-0 transition-opacity duration-1000">
        <div 
          className="absolute inset-0 opacity-20"
          style={{ 
            backgroundImage: 'url("/vexis-cover.png")',
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}
        />
        {/* Multi-layer overlay for readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-bg via-bg/85 to-transparent" />
        <div className="absolute inset-0 bg-bg/60 backdrop-blur-[4px]" />
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-16 md:gap-8 mb-32">
          <div className="col-span-1 md:col-span-2 space-y-12">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-12">
              <div className="space-y-6 max-w-md">
                <h2 className="text-4xl md:text-5xl font-black tracking-tighter">Vexis.</h2>
                <p className="text-sm md:text-base opacity-60 leading-relaxed font-medium">
                  The invisible infrastructure powering the world's most efficient autonomous revenue organizations. Built for the elite.
                </p>
              </div>
            </div>

            <div className="flex gap-6">
              {[Twitter, Github, Linkedin, Mail].map((Icon, i) => (
                <a 
                  key={i} 
                  href="#" 
                  className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-electric/20 hover:border-electric/40 transition-all group active:scale-95"
                >
                  <Icon className="w-5 h-5 text-white/40 group-hover:text-electric transition-colors" />
                </a>
              ))}
            </div>
          </div>

          <div className="col-span-1">
            <h4 className="text-[10px] items-center gap-2 border-b border-white/10 pb-4 uppercase tracking-[0.3em] font-black mb-8 flex text-electric">
              <span className="w-1.5 h-1.5 rounded-full bg-electric animate-pulse" />
              Sectors
            </h4>
            <ul className="space-y-4">
              {['Vexis Voice', 'WhatsApp Engine', 'CRM Protocol', 'Revenue Bridge'].map((item) => (
                <li key={item}>
                  <a href="#" className="text-sm opacity-40 hover:opacity-100 hover:text-electric transition-all font-medium">{item}</a>
                </li>
              ))}
            </ul>
          </div>

          <div className="col-span-1">
            <h4 className="text-[10px] items-center gap-2 border-b border-white/10 pb-4 uppercase tracking-[0.3em] font-black mb-8 flex opacity-40">
              Company
            </h4>
            <ul className="space-y-4">
              {['About', 'Philosophy', 'Elite Access', 'Privacy'].map((item) => (
                <li key={item}>
                  <a href="#" className="text-sm opacity-40 hover:opacity-100 hover:text-electric transition-all font-medium">{item}</a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="pt-12 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-4 text-[10px] font-jetbrains uppercase tracking-widest opacity-30">
            <span>© {currentYear} Vexis Autonomous</span>
            <span className="w-1.5 h-1.5 rounded-full bg-white/20" />
            <span>Digital Assets Protected</span>
          </div>

          <div className="flex items-center gap-3 px-4 py-2 bg-emerald-500/5 border border-emerald-500/10 rounded-full">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_10px_#10b981]" />
            <span className="text-[10px] font-jetbrains uppercase tracking-widest text-emerald-500 font-bold">System Operational</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
