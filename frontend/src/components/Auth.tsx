import { useState, useEffect } from 'react'
import { gsap } from 'gsap'
import { ArrowLeft, Mail, Lock, User, Github, Chrome } from 'lucide-react'

export default function Auth({ onBack, onLogin }: { onBack: () => void, onLogin?: () => void }) {
  const [isLogin, setIsLogin] = useState(true)

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from('.auth-card', { y: 30, opacity: 0, duration: 0.6, ease: 'power3.out' })
      gsap.from('.auth-field', { y: 15, opacity: 0, stagger: 0.08, duration: 0.5, ease: 'power3.out', delay: 0.2 })
    })
    return () => ctx.revert()
  }, [isLogin])

  return (
    <div className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden" style={{ background: 'var(--bg)' }}>
      {/* Warm ambient orbs */}
      <div className="absolute top-1/4 right-1/4 w-[500px] h-[500px] bg-electric/[0.03] rounded-full blur-[150px] pointer-events-none" />
      <div className="absolute bottom-1/4 left-1/4 w-[400px] h-[400px] bg-amber-500/[0.02] rounded-full blur-[120px] pointer-events-none" />

      <div className="auth-card w-full max-w-md glass-panel-strong rounded-3xl p-10 relative">
        {/* Inner glow */}
        <div className="absolute inset-0 rounded-3xl overflow-hidden pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-1/3 bg-electric/[0.04] blur-[60px]" />
        </div>

        <div className="relative z-10">
          {/* Back */}
          <button onClick={onBack} className="auth-field flex items-center gap-2 text-[var(--muted)] hover:text-[var(--text)] transition-colors mb-10 text-sm">
            <ArrowLeft className="w-4 h-4" /> Back to site
          </button>

          {/* Header */}
          <div className="auth-field mb-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full flex items-center justify-center overflow-hidden shrink-0"
                style={{ background: 'var(--bg-raised)', boxShadow: '4px 4px 10px var(--clay-shadow-1), -2px -2px 6px var(--clay-highlight), inset 0 1px 0 var(--clay-highlight)' }}>
                <img src="/vexis-logo.png" alt="Vexis" className="w-6 h-6 object-contain" />
              </div>
              <span className="font-bold text-lg tracking-tight">Vexis</span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight mb-1">
              {isLogin ? 'Welcome back' : 'Create your account'}
            </h1>
            <p className="text-sm text-[var(--muted)]">
              {isLogin ? 'Sign in to access your dashboard' : 'Get started with Vexis in minutes'}
            </p>
          </div>

          {/* Social */}
          <div className="auth-field grid grid-cols-2 gap-3 mb-6">
            <button className="clay-button flex items-center justify-center gap-2 py-3 text-xs font-medium text-[var(--muted)] hover:text-[var(--text)] transition-colors">
              <Github className="w-4 h-4" /> GitHub
            </button>
            <button className="clay-button flex items-center justify-center gap-2 py-3 text-xs font-medium text-[var(--muted)] hover:text-[var(--text)] transition-colors">
              <Chrome className="w-4 h-4" /> Google
            </button>
          </div>

          <div className="auth-field flex items-center gap-3 mb-6">
            <div className="h-px flex-1" style={{ background: 'var(--border)' }} />
            <span className="text-[10px] text-[var(--muted)] uppercase tracking-widest">or</span>
            <div className="h-px flex-1" style={{ background: 'var(--border)' }} />
          </div>

          {/* Form */}
          <form className="space-y-4">
            {!isLogin && (
              <div className="auth-field space-y-1.5">
                <label className="text-[10px] font-medium uppercase tracking-wider text-[var(--muted)] ml-1">Full Name</label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--muted)]" />
                  <input type="text" placeholder="Your name" className="skeu-input w-full py-3 pl-10 pr-4 text-sm" />
                </div>
              </div>
            )}

            <div className="auth-field space-y-1.5">
              <label className="text-[10px] font-medium uppercase tracking-wider text-[var(--muted)] ml-1">Email</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--muted)]" />
                <input type="email" placeholder="you@company.com" className="skeu-input w-full py-3 pl-10 pr-4 text-sm" />
              </div>
            </div>

            <div className="auth-field space-y-1.5">
              <div className="flex justify-between items-center ml-1">
                <label className="text-[10px] font-medium uppercase tracking-wider text-[var(--muted)]">Password</label>
                {isLogin && <button type="button" className="text-[10px] text-electric hover:underline">Forgot?</button>}
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--muted)]" />
                <input type="password" placeholder="••••••••" className="skeu-input w-full py-3 pl-10 pr-4 text-sm" />
              </div>
            </div>

            <div className="auth-field pt-2">
              <button type="button" onClick={onLogin}
                className="clay-button clay-button-accent w-full py-3.5 font-semibold text-sm text-white cursor-pointer">
                {isLogin ? 'Sign in' : 'Create account'}
              </button>
            </div>
          </form>

          <div className="auth-field mt-6 text-center">
            <button onClick={() => setIsLogin(!isLogin)} className="text-sm text-[var(--muted)] hover:text-electric transition-colors cursor-pointer">
              {isLogin ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
