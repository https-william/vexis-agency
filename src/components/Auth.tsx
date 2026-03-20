import { useState, useEffect } from 'react'
import { gsap } from 'gsap'
import { ArrowLeft, Mail, Lock, User, Github, Chrome, Cpu, Terminal as TerminalIcon, ShieldCheck, Globe } from 'lucide-react'

export default function Auth({ onBack, onLogin }: { onBack: () => void, onLogin?: () => void }) {
  const [isLogin, setIsLogin] = useState(true)
  const [systemLogs, setSystemLogs] = useState<string[]>([
    "INIT_CORE_PROTOCOLS... [OK]",
    "ESTABLISHING_ENCRYPTED_TUNNEL... [OK]",
    "MAPPING_USER_IDENTITY_NODES... [PENDING]",
    "BYPASSING_OPERATIONAL_LATENCY... [OK]"
  ])

  useEffect(() => {
    const interval = setInterval(() => {
      setSystemLogs(prev => {
        const logs = [...prev]
        logs.shift()
        logs.push(`LOG_SIGNAL_${Math.random().toString(36).substring(7).toUpperCase()}... [OK]`)
        return logs
      })
    }, 2000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from('.pane-left', {
        x: -100,
        opacity: 0,
        duration: 1.2,
        ease: 'power4.out'
      })
      gsap.from('.pane-right', {
        x: 100,
        opacity: 0,
        duration: 1.2,
        ease: 'power4.out'
      })
      gsap.from('.auth-stagger', {
        y: 20,
        opacity: 0,
        stagger: 0.1,
        duration: 0.8,
        ease: 'power3.out',
        delay: 0.4
      })
    })
    return () => ctx.revert()
  }, [isLogin])

  return (
    <div className="min-h-screen bg-obsidian flex flex-col lg:flex-row relative overflow-hidden font-inter selection:bg-electric/30">
      {/* GLOBAL NOISE OVERLAY */}
      <div className="fixed inset-0 pointer-events-none z-50 opacity-[0.03] mix-blend-overlay">
        <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
          <filter id="noiseFilter">
            <feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="3" stitchTiles="stitch" />
          </filter>
          <rect width="100%" height="100%" filter="url(#noiseFilter)" />
        </svg>
      </div>

      {/* LEFT PANE: THE VOID / ATMOSPHERE */}
      <div className="pane-left hidden lg:flex relative w-1/3 bg-black border-r border-white/5 overflow-hidden flex-col p-12 justify-between">
        {/* Decorative Grid */}
        <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(circle, #3B82F6 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
        
        <div className="relative z-10 space-y-8">
          <div className="flex items-center gap-4 text-electric">
            <Cpu className="w-6 h-6 animate-pulse" />
            <span className="text-[10px] font-jetbrains uppercase tracking-[0.4em] font-black">Vexis Core Framework 4.0</span>
          </div>
          
          <h2 className="text-6xl font-black tracking-tighter text-white leading-[0.8] mix-blend-difference">
            THE<br />
            <span className="text-electric italic font-playfair">GATEWAY.</span>
          </h2>
          
          <p className="text-white/40 text-sm max-w-xs leading-relaxed font-medium">
            Authorization required to access the autonomous revenue infrastructure. Standard encryption protocols engaged.
          </p>
        </div>

        <div className="relative z-10 space-y-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-[8px] font-jetbrains uppercase tracking-[0.3em] text-white/20">
              <TerminalIcon className="w-3 h-3" />
              Live System Telemetry
            </div>
            <div className="space-y-1">
              {systemLogs.map((log, i) => (
                <div key={i} className="text-[9px] font-jetbrains text-electric/40 uppercase tracking-wider">{log}</div>
              ))}
            </div>
          </div>
          
          <div className="flex items-center gap-12">
            <div className="flex flex-col gap-1">
              <span className="text-[8px] text-white/20 uppercase tracking-widest font-black">Node Status</span>
              <span className="text-[10px] text-green-500 uppercase tracking-widest font-black flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-ping" />
                Active
              </span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-[8px] text-white/20 uppercase tracking-widest font-black">Location</span>
              <span className="text-[10px] text-white/60 uppercase tracking-widest font-black flex items-center gap-2">
                <Globe className="w-3 h-3" />
                Lagos, NG
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT PANE: THE TERMINAL / AUTH */}
      <div className="pane-right flex-1 relative flex items-center justify-center p-8 bg-obsidian">
        {/* Atmospheric Glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl h-full max-h-2xl bg-electric/5 blur-[180px] rounded-full pointer-events-none" />

        <div className="w-full max-w-md relative z-10">
          <button 
            onClick={onBack}
            className="auth-stagger mb-12 flex items-center gap-3 text-white/40 hover:text-white transition-all group"
          >
            <div className="w-8 h-8 rounded-full border border-white/5 flex items-center justify-center group-hover:bg-white/5 transition-colors">
              <ArrowLeft className="w-4 h-4" />
            </div>
            <span className="text-[10px] font-black uppercase tracking-[0.3em]">Disconnect Terminal</span>
          </button>

          <header className="auth-stagger mb-12">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-10 h-10 rounded-xl bg-electric/10 border border-electric/30 flex items-center justify-center text-electric font-black italic shadow-inner">
                V
              </div>
              <div className="h-[1px] flex-1 bg-gradient-to-r from-electric/30 to-transparent" />
            </div>
            <h1 className="text-4xl font-black text-white tracking-tighter mb-4 leading-none">
              {isLogin ? 'AUTHENTICATE USER' : 'INITIALIZE PROFILE'}
            </h1>
            <p className="text-white/30 text-sm font-medium">
              Secondary identity verification required for command access.
            </p>
          </header>

          <form className="space-y-6">
            {!isLogin && (
              <div className="auth-stagger space-y-2 group">
                <label className="text-[9px] font-black uppercase tracking-[0.3em] text-white/20 ml-1 group-focus-within:text-electric transition-colors">Legal Identity</label>
                <div className="relative">
                  <User className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/10 group-focus-within:text-electric transition-colors" />
                  <input 
                    type="text" 
                    placeholder="FULL NAME"
                    className="w-full bg-white/[0.02] border border-white/5 rounded-2xl py-5 pl-14 pr-6 text-xs text-white uppercase tracking-widest placeholder:text-white/5 focus:outline-none focus:border-electric/40 focus:bg-white/[0.04] transition-all"
                  />
                </div>
              </div>
            )}

            <div className="auth-stagger space-y-2 group">
              <label className="text-[9px] font-black uppercase tracking-[0.3em] text-white/20 ml-1 group-focus-within:text-electric transition-colors">Network Alias</label>
              <div className="relative">
                <Mail className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/10 group-focus-within:text-electric transition-colors" />
                <input 
                  type="email" 
                  placeholder="EMAIL_ADDRESS"
                  className="w-full bg-white/[0.02] border border-white/5 rounded-2xl py-5 pl-14 pr-6 text-xs text-white uppercase tracking-widest placeholder:text-white/5 focus:outline-none focus:border-electric/40 focus:bg-white/[0.04] transition-all"
                />
              </div>
            </div>

            <div className="auth-stagger space-y-2 group">
              <div className="flex justify-between items-center ml-1">
                <label className="text-[9px] font-black uppercase tracking-[0.3em] text-white/20 group-focus-within:text-electric transition-colors">Access Key</label>
                {isLogin && <button className="text-[8px] font-black uppercase tracking-[0.2em] text-white/10 hover:text-white transition-colors">Lost Key?</button>}
              </div>
              <div className="relative">
                <Lock className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/10 group-focus-within:text-electric transition-colors" />
                <input 
                  type="password" 
                  placeholder="••••••••"
                  className="w-full bg-white/[0.02] border border-white/5 rounded-2xl py-5 pl-14 pr-6 text-xs text-white placeholder:text-white/5 focus:outline-none focus:border-electric/40 focus:bg-white/[0.04] transition-all"
                />
              </div>
            </div>

            <div className="auth-stagger pt-4">
              <button 
                type="button"
                onClick={onLogin}
                className="glass-button-3d w-full py-6 bg-electric/10 border-electric/30 text-white rounded-3xl font-black uppercase tracking-[0.4em] text-xs flex items-center justify-center gap-3 active:scale-[0.98] transition-all group relative">
                <div className="absolute inset-0 bg-electric/20 blur-xl opacity-0 group-hover:opacity-40 transition-opacity rounded-3xl" />
                <ShieldCheck className="w-5 h-5 relative z-10" />
                <span className="relative z-10">{isLogin ? 'VERIFY IDENTITY' : 'COMMIT IDENTITY'}</span>
              </button>
            </div>
          </form>

          <footer className="auth-stagger mt-12 space-y-8">
            <div className="relative flex items-center gap-6">
              <div className="h-[1px] flex-1 bg-white/5" />
              <span className="text-[8px] font-black uppercase tracking-[0.5em] text-white/10">External Nodes</span>
              <div className="h-[1px] flex-1 bg-white/5" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <button className="glass-button-3d py-5 bg-white/[0.01] border-white/5 rounded-2xl flex items-center justify-center gap-3 text-[9px] font-black uppercase tracking-widest text-white/40 hover:text-white hover:bg-white/[0.03] transition-all">
                <Github className="w-4 h-4" />
                Github
              </button>
              <button className="glass-button-3d py-5 bg-white/[0.01] border-white/5 rounded-2xl flex items-center justify-center gap-3 text-[9px] font-black uppercase tracking-widest text-white/40 hover:text-white hover:bg-white/[0.03] transition-all">
                <Chrome className="w-4 h-4" />
                Google
              </button>
            </div>

            <button 
              onClick={() => setIsLogin(!isLogin)}
              className="w-full py-2 text-[10px] font-black uppercase tracking-[0.2em] text-white/20 hover:text-electric transition-all"
            >
              {isLogin ? "Generate New Access Profile" : "Existing Node? Resume Authentication"}
            </button>
          </footer>
        </div>

        {/* Floating System Info */}
        <div className="absolute top-12 right-12 hidden xl:block">
          <div className="flex items-center gap-6 text-white/10 font-jetbrains text-[9px] font-black uppercase tracking-widest">
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-electric/40 shadow-[0_0_8px_#3B82F6]" />
              Secure_Session
            </div>
            <div className="h-4 w-[1px] bg-white/5" />
            <span>v4.0.2</span>
          </div>
        </div>
      </div>
    </div>
  )
}
