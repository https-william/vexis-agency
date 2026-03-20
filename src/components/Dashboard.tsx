import { useState, useEffect } from 'react'
import { gsap } from 'gsap'
import { 
  LayoutDashboard, 
  MessageSquare, 
  Phone, 
  Users, 
  Settings, 
  Wallet, 
  LogOut, 
  ChevronRight,
  Bell,
  Search,
  Command
} from 'lucide-react'
import { VoiceModule, WhatsAppModule, CRMModule } from './dashboard/DashboardModules'

type ServiceType = 'VOICE' | 'WHATSAPP' | 'CRM'

export default function Dashboard({ onLogout }: { onLogout: () => void }) {
  const [service, setService] = useState<ServiceType>('VOICE')
  const [isSidebarOpen, setSidebarOpen] = useState(true)

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from('.dash-sidebar', {
        x: -50,
        opacity: 0,
        duration: 1,
        ease: 'power4.out'
      })
      gsap.from('.dash-content', {
        y: 20,
        opacity: 0,
        duration: 1,
        delay: 0.2,
        ease: 'power3.out'
      })
    })
    return () => ctx.revert()
  }, [])

  const renderModule = () => {
    switch (service) {
      case 'VOICE': return <VoiceModule />
      case 'WHATSAPP': return <WhatsAppModule />
      case 'CRM': return <CRMModule />
      default: return <VoiceModule />
    }
  }

  return (
    <div className="min-h-screen bg-obsidian text-white flex font-inter">
      {/* SIDEBAR */}
      <aside className={`dash-sidebar fixed lg:static inset-y-0 left-0 z-50 w-72 bg-black border-r border-white/5 transition-transform duration-300 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="h-full flex flex-col p-8">
          <div className="flex items-center gap-4 mb-12">
            <div className="w-10 h-10 rounded-xl bg-electric/10 border border-electric/30 flex items-center justify-center text-electric font-black italic">
              V
            </div>
            <span className="text-xl font-black tracking-tighter uppercase">Vexis</span>
          </div>

          <nav className="flex-1 space-y-2">
            <SidebarItem 
              icon={<LayoutDashboard className="w-4 h-4" />} 
              label="Terminal" 
              active={true}
            />
            <div className="h-px bg-white/5 my-6" />
            <div className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em] mb-4 ml-3">Operations</div>
            <SidebarItem 
              icon={<Phone className="w-4 h-4" />} 
              label="Voice Agent" 
              active={service === 'VOICE'}
              onClick={() => setService('VOICE')}
            />
            <SidebarItem 
              icon={<MessageSquare className="w-4 h-4" />} 
              label="WhatsApp Bot" 
              active={service === 'WHATSAPP'}
              onClick={() => setService('WHATSAPP')}
            />
            <SidebarItem 
              icon={<Users className="w-4 h-4" />} 
              label="CRM Hub" 
              active={service === 'CRM'}
              onClick={() => setService('CRM')}
            />
          </nav>

          <footer className="pt-8 border-t border-white/5 space-y-2">
            <SidebarItem icon={<Settings className="w-4 h-4" />} label="Settings" />
            <button 
              onClick={onLogout}
              className="w-full flex items-center gap-4 px-4 py-3 rounded-xl text-xs font-bold text-red-500/60 hover:text-red-500 hover:bg-red-500/5 transition-all cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              Disconnect
            </button>
          </footer>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="dash-content flex-1 h-screen overflow-y-auto bg-obsidian relative">
        {/* TOPBAR */}
        <header className="sticky top-0 z-40 bg-obsidian/80 backdrop-blur-xl border-b border-white/5 px-8 py-6 flex items-center justify-between">
          <div className="flex items-center gap-4 bg-white/[0.03] border border-white/5 rounded-2xl px-4 py-2 w-96 group focus-within:border-electric/30 transition-all">
            <Search className="w-4 h-4 text-white/20 group-focus-within:text-electric transition-colors" />
            <input 
              type="text" 
              placeholder="Search fleet infrastructure..." 
              className="bg-transparent border-none outline-none text-xs text-white placeholder:text-white/10 w-full"
            />
            <div className="flex items-center gap-1 opacity-20">
              <Command className="w-3 h-3" />
              <span className="text-[10px]">K</span>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div className="flex flex-col items-end gap-1">
              <span className="text-[9px] font-black text-white/20 uppercase tracking-widest">Global Balance</span>
              <div className="flex items-center gap-2 text-sm font-black text-white">
                <Wallet className="w-4 h-4 text-electric" />
                ₦1,240,000.00
              </div>
            </div>
            <button className="relative w-10 h-10 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center hover:bg-white/10 transition-all cursor-pointer">
              <Bell className="w-4 h-4 text-white/60" />
              <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-electric shadow-[0_0_10px_#3B82F6]" />
            </button>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-electric/20 to-transparent border border-white/10" />
          </div>
        </header>

        {/* WORKSPACE */}
        <div className="p-10 max-w-7xl mx-auto">
          {renderModule()}
        </div>
      </main>
    </div>
  )
}

function SidebarItem({ icon, label, active = false, onClick }: any) {
  return (
    <button 
      onClick={onClick}
      className={`
        w-full flex items-center gap-4 px-4 py-3.5 rounded-xl text-xs font-bold uppercase tracking-widest transition-all cursor-pointer
        ${active 
          ? 'bg-electric/10 text-electric border border-electric/20 shadow-[0_0_20px_rgba(59,130,246,0.1)]' 
          : 'text-white/40 hover:text-white hover:bg-white/5'}
      `}
    >
      <div className={`${active ? 'text-electric' : 'text-current opacity-40'}`}>
        {icon}
      </div>
      {label}
      {active && <ChevronRight className="w-3 h-3 ml-auto opacity-40" />}
    </button>
  )
}
