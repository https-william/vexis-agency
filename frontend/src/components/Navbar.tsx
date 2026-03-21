import { useEffect, useState } from 'react'
import { Sun, Moon, X, Menu } from 'lucide-react' // Added imports for icons

// NavLink component definition (added as it was used but not defined)
const NavLink = ({ href, label }: { href: string, label: string }) => (
  <a
    href={href}
    className="text-slate-600 dark:text-white/50 hover:text-slate-900 dark:hover:text-white transition-colors duration-300 text-sm font-medium"
  >
    {label}
  </a>
)

export default function Navbar({ onAuth, theme, onToggleTheme }: { onAuth: () => void, theme: 'light' | 'dark', onToggleTheme: () => void }) {
  const [isScrolled, setIsScrolled] = useState(false) // Changed 'scrolled' to 'isScrolled'
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false) // Added new state

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <nav className={`fixed top-6 left-1/2 -translate-x-1/2 z-[100] w-[95%] max-w-7xl transition-all duration-500 ${
      isScrolled ? 'top-4' : 'top-6'
    }`}>
      <div className={`relative flex items-center justify-between px-6 py-4 rounded-pill transition-all duration-500 ${
        isScrolled
          ? 'bg-white/10 dark:bg-black/40 backdrop-blur-2xl border border-white/10 shadow-2xl'
          : 'bg-transparent'
      }`}>
        <div className="flex items-center gap-3 group cursor-pointer transition-transform duration-300 hover:scale-105">
          <div className="relative w-10 h-10 flex items-center justify-center logo-aura">
            <img 
              src="/vexis-logo.png" 
              alt="Vexis Logo" 
              className="w-8 h-8 object-contain"
            />
          </div>
          <span className="text-xl font-black tracking-tighter uppercase hidden sm:block dark:text-white text-slate-900">Vexis</span>
        </div>

        <div className="hidden md:flex items-center gap-10">
          <NavLink href="#features" label="Sectors" />
          <NavLink href="#philosophy" label="Philosophy" />
          <NavLink href="#pricing" label="Reserve" />
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={onToggleTheme}
            className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center hover:bg-white/5 transition-all cursor-pointer relative overflow-hidden group"
          >
            <div className={`absolute transition-all duration-500 ${theme === 'dark' ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
              <Sun className="w-4 h-4 text-white" />
            </div>
            <div className={`absolute transition-all duration-500 ${theme === 'light' ? 'translate-y-0 opacity-100' : '-translate-y-10 opacity-0'}`}>
              <Moon className="w-4 h-4 text-slate-800" />
            </div>
          </button>

          <button
            onClick={onAuth}
            className="hidden sm:flex glass-button-3d px-8 py-3 rounded-pill text-[10px] font-black uppercase tracking-widest text-white cursor-pointer"
          >
            Launch Terminal
          </button>

          <button className="md:hidden p-2 text-white/50 hover:text-white" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
            {isMobileMenuOpen ? <X /> : <Menu />}
          </button>
        </div>
      </div>
    </nav>
  )
}
