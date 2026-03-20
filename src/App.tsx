import { useState, useEffect } from 'react'
import Navbar from './components/Navbar'
import Hero from './components/Hero'
import Features from './components/Features'
import Philosophy from './components/Philosophy'
import Protocol from './components/Protocol'
import Pricing from './components/Pricing'
import Footer from './components/Footer'
import Auth from './components/Auth'
import Dashboard from './components/Dashboard'

function App() {
  const [view, setView] = useState<'LANDING' | 'AUTH' | 'DASHBOARD'>('LANDING')
  const [theme, setTheme] = useState<'dark' | 'light'>('dark')

  useEffect(() => {
    if (theme === 'light') {
      document.documentElement.classList.add('light')
    } else {
      document.documentElement.classList.remove('light')
    }
  }, [theme])

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark')
  }

  const handleLoginSuccess = () => {
    setView('DASHBOARD')
  }

  const handleLogout = () => {
    setView('LANDING')
  }

  if (view === 'AUTH') {
    return <Auth onBack={() => setView('LANDING')} onLogin={handleLoginSuccess} />
  }

  if (view === 'DASHBOARD') {
    return <Dashboard onLogout={handleLogout} />
  }

  return (
    <main className="relative min-h-screen vertical-stripes">
      <Navbar onAuth={() => setView('AUTH')} theme={theme} onToggleTheme={toggleTheme} />
      <Hero />
      <Features />
      <Philosophy />
      <Protocol />
      <Pricing />
      <Footer />
    </main>
  )
}

export default App
