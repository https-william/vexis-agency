import { useEffect, useState } from 'react'
import { Sun, Moon, X, Menu } from 'lucide-react'

const NavLink = ({ href, label }: { href: string, label: string }) => (
  <a href={href} className="text-[var(--muted)] hover:text-[var(--text)] transition-colors duration-200 text-sm font-medium">
    {label}
  </a>
)

export default function Navbar({ onAuth, theme, onToggleTheme }: { onAuth: () => void, theme: 'light' | 'dark', onToggleTheme: () => void }) {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <nav className={`fixed top-6 left-1/2 -translate-x-1/2 z-[100] w-[95%] max-w-5xl transition-all duration-500 ${isScrolled ? 'top-4' : 'top-6'}`}>
      <div className={`relative flex items-center justify-between px-6 py-3.5 rounded-2xl transition-all duration-500 ${
        isScrolled ? 'glass-panel-strong shadow-lg' : 'bg-transparent'
      }`}>
        <div className="flex items-center gap-2.5 cursor-pointer">
          <div className="relative w-8 h-8 flex items-center justify-center logo-aura">
            <img src="/vexis-logo.png" alt="Vexis" className="w-6 h-6 object-contain" />
          </div>
          <span className="text-lg font-bold tracking-tight hidden sm:block">Vexis</span>
        </div>

        <div className="hidden md:flex items-center gap-8">
          <NavLink href="#features" label="Solutions" />
          <NavLink href="#philosophy" label="About" />
          <NavLink href="#membership" label="Plans" />
          <NavLink href="#reserve" label="Contact" />
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onToggleTheme}
            className="clay-button w-9 h-9 flex items-center justify-center"
          >
            {theme === 'dark' 
              ? <Sun className="w-3.5 h-3.5 text-[var(--muted)]" /> 
              : <Moon className="w-3.5 h-3.5 text-[var(--muted)]" />
            }
          </button>

          <button
            onClick={onAuth}
            className="hidden sm:flex clay-button clay-button-accent px-5 py-2.5 text-white text-xs font-semibold"
          >
            Dashboard
          </button>

          <button className="md:hidden p-1.5 text-[var(--muted)]" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {isMobileMenuOpen && (
        <div className="md:hidden mt-2 p-6 glass-panel-strong rounded-2xl space-y-4">
          <NavLink href="#features" label="Solutions" />
          <NavLink href="#philosophy" label="About" />
          <NavLink href="#membership" label="Plans" />
          <NavLink href="#reserve" label="Contact" />
          <button onClick={onAuth} className="w-full py-3 bg-electric text-white text-sm font-semibold rounded-xl">
            Dashboard
          </button>
        </div>
      )}
    </nav>
  )
}
