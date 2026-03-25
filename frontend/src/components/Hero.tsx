import { useEffect, useRef, useState } from 'react'
import { gsap } from 'gsap'
import { ArrowRight, ShieldCheck, Zap, Phone, MessageCircle, Users } from 'lucide-react'

const LIVE_TASKS = [
  "Confirming reservation for table 4...",
  "Qualifying inbound real estate lead...",
  "Processing late checkout request...",
  "Scheduling property viewing for 2pm...",
  "Responding to WhatsApp booking inquiry...",
]

const METRICS = [
  { label: 'Response Time', value: '0.4s', icon: Zap },
  { label: 'Success Rate', value: '99.8%', icon: ShieldCheck },
  { label: 'Active Agents', value: '3', icon: Users },
]

export default function Hero() {
  const containerRef = useRef<HTMLDivElement>(null)
  const [taskIndex, setTaskIndex] = useState(0)
  const [typedText, setTypedText] = useState('')
  const [cursorVisible, setCursorVisible] = useState(true)

  // Typewriter effect for live task
  useEffect(() => {
    const currentTask = LIVE_TASKS[taskIndex]
    setTypedText('')
    let charIdx = 0
    const typeInterval = setInterval(() => {
      if (charIdx <= currentTask.length) {
        setTypedText(currentTask.slice(0, charIdx))
        charIdx++
      } else {
        clearInterval(typeInterval)
      }
    }, 35)

    const nextTask = setTimeout(() => {
      setTaskIndex(i => (i + 1) % LIVE_TASKS.length)
    }, 4000)

    return () => {
      clearInterval(typeInterval)
      clearTimeout(nextTask)
    }
  }, [taskIndex])

  // Blinking cursor
  useEffect(() => {
    const blinkInterval = setInterval(() => setCursorVisible(v => !v), 530)
    return () => clearInterval(blinkInterval)
  }, [])

  // GSAP entrance animations
  useEffect(() => {
    if (!containerRef.current) return
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } })

      // Hero text stagger
      tl.from('.hero-badge', { y: 20, opacity: 0, duration: 0.6 })
        .from('.hero-headline span', { y: 60, opacity: 0, duration: 0.9, stagger: 0.15 }, '-=0.3')
        .from('.hero-sub', { y: 20, opacity: 0, duration: 0.6 }, '-=0.4')
        .from('.hero-cta-group > *', { y: 20, opacity: 0, duration: 0.5, stagger: 0.1 }, '-=0.3')
        .from('.hero-trust > *', { y: 10, opacity: 0, stagger: 0.08, duration: 0.4 }, '-=0.2')

      // Terminal card entrance
      tl.from('.hero-terminal', {
        x: 60, opacity: 0, rotateY: -5, scale: 0.95,
        duration: 1, ease: 'power2.out'
      }, '-=0.8')

      // Stats stagger inside terminal
      tl.from('.terminal-stat', {
        x: 20, opacity: 0, stagger: 0.1, duration: 0.4
      }, '-=0.4')

      // Floating orbs slow drift
      gsap.to('.orb-1', {
        y: -30, x: 15, duration: 6, repeat: -1, yoyo: true, ease: 'sine.inOut'
      })
      gsap.to('.orb-2', {
        y: 20, x: -20, duration: 8, repeat: -1, yoyo: true, ease: 'sine.inOut'
      })
      gsap.to('.orb-3', {
        y: -15, x: 10, duration: 5, repeat: -1, yoyo: true, ease: 'sine.inOut'
      })
    }, containerRef)
    return () => ctx.revert()
  }, [])

  return (
    <section ref={containerRef} className="relative min-h-screen flex flex-col lg:flex-row items-center justify-center px-6 lg:px-20 pt-28 pb-20 gap-16 lg:gap-20 overflow-hidden">
      <div className="absolute inset-0 bg-v-gradient z-0" />
      
      {/* Animated ambient orbs */}
      <div className="orb-1 absolute top-[15%] left-[20%] w-[500px] h-[500px] bg-electric/[0.04] rounded-full blur-[140px] pointer-events-none" />
      <div className="orb-2 absolute bottom-[20%] right-[15%] w-[400px] h-[400px] bg-indigo-500/[0.03] rounded-full blur-[120px] pointer-events-none" />
      <div className="orb-3 absolute top-[50%] left-[60%] w-[300px] h-[300px] bg-amber-500/[0.02] rounded-full blur-[100px] pointer-events-none" />
      
      {/* Left: Text Content */}
      <div className="relative z-10 w-full lg:w-1/2 space-y-8 text-center lg:text-left">
        <div className="hero-badge inline-flex items-center gap-2 px-4 py-2 glass-panel rounded-full text-electric text-[10px] font-semibold uppercase tracking-[0.15em]">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-electric opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-electric" />
          </span>
          AI Employees for your Business
        </div>

        <h1 className="hero-headline text-4xl md:text-6xl lg:text-7xl font-bold tracking-[-0.03em] leading-[1.05]">
          <span className="block">Stop missing</span>
          <span className="block text-electric">revenue.</span>
        </h1>

        <p className="hero-sub text-base md:text-lg text-[var(--text-secondary)] max-w-lg lg:mx-0 mx-auto leading-relaxed">
          Whether you run a hotel or a restaurant, Vexis deploys AI agents that handle bookings, sales, and customer support around the clock.
        </p>

        <div className="hero-cta-group flex flex-wrap lg:justify-start justify-center gap-4">
          <a href="https://cal.com/mrwiliam/vexis" target="_blank" rel="noopener noreferrer"
            className="clay-button clay-button-accent px-8 py-4 font-semibold text-sm flex items-center gap-2.5 text-white">
            <Zap className="w-4 h-4" />
            Book a Demo
          </a>
          <a href="#features" className="clay-button px-8 py-4 font-semibold text-sm flex items-center gap-2.5 text-[var(--text-secondary)] hover:text-[var(--text)]">
            See what we build
            <ArrowRight className="w-4 h-4" />
          </a>
        </div>

        <div className="hero-trust flex flex-wrap lg:justify-start justify-center gap-6 pt-2 text-[var(--muted)]">
          <div className="flex items-center gap-2 text-[10px] font-medium uppercase tracking-widest">
            <ShieldCheck className="w-3.5 h-3.5" /> Enterprise Ready
          </div>
          <div className="flex items-center gap-2 text-[10px] font-medium uppercase tracking-widest">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>
            Systems Online
          </div>
        </div>
      </div>

      {/* Right: Live Terminal — Glass Panel with depth */}
      <div className="hero-terminal relative z-10 w-full lg:w-[460px]">
        {/* Terminal glow */}
        <div className="absolute -inset-4 bg-electric/[0.04] rounded-[2.5rem] blur-[30px] pointer-events-none" />
        
        <div className="relative glass-panel-strong rounded-3xl p-7 overflow-hidden">
          {/* Inner specular glow */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-1/2 bg-electric/[0.05] blur-[50px] pointer-events-none" />

          <div className="relative z-10">
            {/* Window chrome */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex gap-2">
                <div className="w-3 h-3 rounded-full bg-red-400/70 hover:bg-red-400 transition-colors" />
                <div className="w-3 h-3 rounded-full bg-amber-400/70 hover:bg-amber-400 transition-colors" />
                <div className="w-3 h-3 rounded-full bg-emerald-400/70 hover:bg-emerald-400 transition-colors" />
              </div>
              <span className="text-[9px] font-jetbrains text-[var(--muted)] uppercase tracking-widest">Live Agent Feed</span>
            </div>

            {/* Active task with typewriter */}
            <div className="p-4 rounded-2xl mb-4" style={{ background: 'rgba(59,130,246,0.06)', border: '1px solid rgba(59,130,246,0.12)' }}>
              <div className="flex items-center gap-2 mb-2">
                <div className="relative flex h-1.5 w-1.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-electric opacity-75" />
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-electric" />
                </div>
                <span className="text-[9px] uppercase font-semibold text-electric tracking-widest">Active Task</span>
              </div>
              <div className="text-sm font-jetbrains opacity-80 h-5">
                &gt; {typedText}
                <span className={`inline-block w-[2px] h-[14px] bg-electric ml-0.5 align-middle transition-opacity ${cursorVisible ? 'opacity-100' : 'opacity-0'}`} />
              </div>
            </div>

            {/* Stats */}
            <div className="space-y-2.5">
              {METRICS.map((stat, i) => (
                <div key={i} className="terminal-stat flex justify-between items-center px-4 py-3 rounded-xl" style={{ background: 'var(--glass)', border: '1px solid var(--border)' }}>
                  <div className="flex items-center gap-2.5">
                    <stat.icon className="w-3.5 h-3.5 text-[var(--muted)]" />
                    <span className="text-[10px] uppercase font-medium text-[var(--muted)] tracking-wider">{stat.label}</span>
                  </div>
                  <span className="text-xs font-jetbrains font-bold text-electric">{stat.value}</span>
                </div>
              ))}
            </div>

            {/* Footer */}
            <div className="mt-5 pt-4 flex justify-between items-center" style={{ borderTop: '1px solid var(--border)' }}>
              <span className="text-[9px] font-jetbrains text-[var(--muted)] uppercase tracking-widest">Vexis Core v2.1</span>
              <div className="flex gap-3">
                <div className="flex items-center gap-1.5 text-[9px] text-[var(--muted)]">
                  <Phone className="w-3 h-3" /><span className="font-jetbrains">47</span>
                </div>
                <div className="flex items-center gap-1.5 text-[9px] text-[var(--muted)]">
                  <MessageCircle className="w-3 h-3" /><span className="font-jetbrains">1.2K</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
