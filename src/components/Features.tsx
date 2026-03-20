import { useEffect, useRef, useState } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { Activity, Shield, Terminal as TerminalIcon } from 'lucide-react'

gsap.registerPlugin(ScrollTrigger)

// --- CARD 1: DIAGNOSTIC SHUFFLER ---
function DiagnosticShuffler() {
  const [items, setItems] = useState([
    { id: 1, label: 'Neural Task Queue', status: 'Processing' },
    { id: 2, label: 'Marketplace Engine', status: 'Active' },
    { id: 3, label: 'Revenue Agent v4', status: 'Autonomous' }
  ])

  useEffect(() => {
    const interval = setInterval(() => {
      setItems(prev => {
        const newItems = [...prev]
        const first = newItems.shift()
        if (first) newItems.push(first)
        return newItems
      })
    }, 3000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="relative h-48 w-full flex flex-col items-center justify-center perspective-1000">
      {items.map((item, index) => (
        <div 
          key={item.id}
          className="absolute w-full max-w-[280px] p-4 glass-card rounded-xl shadow-2xl transition-all duration-700 ease-[cubic-bezier(0.34,1.56,0.64,1)] shadow-black/20"
          style={{
            transform: `translateY(${(index - 1) * 40}px) scale(${1 - index * 0.05}) translateZ(${-index * 20}px)`,
            opacity: index === 0 ? 1 : 0.4,
            zIndex: 10 - index
          }}
        >
          <div className="flex justify-between items-center">
            <span className="text-xs font-bold uppercase tracking-tighter">{item.label}</span>
            <span className="text-[10px] bg-electric/20 px-2 py-0.5 rounded-full text-electric font-black">
              {item.status}
            </span>
          </div>
        </div>
      ))}
    </div>
  )
}

// --- CARD 2: TELEMETRY TYPEWRITER ---
function TelemetryTypewriter() {
  const [text, setText] = useState('')
  const fullText = ">> Initialized Vexis Revenue Bridge...\n>> Mapping Operational Bottlenecks...\n>> Deploying 24/7 Agentic Fleet...\n>> Status: Efficiency Optimized [100%]"
  const [index, setIndex] = useState(0)

  useEffect(() => {
    if (index < fullText.length) {
      const timeout = setTimeout(() => {
        setText(prev => prev + fullText[index])
        setIndex(index + 1)
      }, 40)
      return () => clearTimeout(timeout)
    } else {
      setTimeout(() => {
        setText('')
        setIndex(0)
      }, 5000)
    }
  }, [index])

  return (
    <div className="bg-black/40 backdrop-blur-md p-4 rounded-xl border border-white/5 h-48 overflow-hidden font-jetbrains">
      <div className="flex items-center gap-2 mb-3 border-b border-white/5 pb-2">
        <div className="w-2 h-2 rounded-full bg-electric animate-pulse" />
        <span className="text-[10px] uppercase tracking-widest text-white/40">Live Feed</span>
      </div>
      <pre className="text-[10px] opacity-80 whitespace-pre-wrap leading-relaxed">
        {text}
        <span className="inline-block w-1.5 h-3 bg-electric ml-1 animate-pulse" />
      </pre>
    </div>
  )
}

// --- CARD 3: CURSOR PROTOCOL SCHEDULER ---
function CursorScheduler() {
  const [activeDay, setActiveDay] = useState<number | null>(null)
  const cursorRef = useRef<SVGSVGElement>(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ repeat: -1 })
      
      tl.to(cursorRef.current, { x: 40, y: 40, duration: 1.5, ease: 'power2.inOut' })
        .to({}, { duration: 0.2, onComplete: () => setActiveDay(1) })
        .to(cursorRef.current, { scale: 0.9, duration: 0.1 })
        .to(cursorRef.current, { scale: 1, duration: 0.1 })
        .to(cursorRef.current, { x: 120, y: 80, duration: 1.2, ease: 'power2.inOut' })
        .to({}, { duration: 0.2, onComplete: () => setActiveDay(4) })
        .to(cursorRef.current, { x: 180, y: 150, duration: 1, ease: 'power2.inOut' })
        .to(cursorRef.current, { opacity: 0, duration: 0.5 })
        .set(cursorRef.current, { x: 0, y: 0, opacity: 1 })
        .add(() => setActiveDay(null))
    })
    return () => ctx.revert()
  }, [])

  return (
    <div className="relative bg-white/5 p-4 rounded-xl border border-white/5 h-48 overflow-hidden">
      <div className="grid grid-cols-7 gap-2">
        {['S','M','T','W','T','F','S'].map((day, i) => (
          <div 
            key={i} 
            className={`
              h-8 flex items-center justify-center rounded-md border text-[10px] font-bold transition-all duration-300
              ${activeDay === i ? 'bg-electric border-electric text-white scale-110 shadow-lg' : 'border-white/10 opacity-20'}
            `}
          >
            {day}
          </div>
        ))}
      </div>
      
      <div className="mt-8 flex justify-center">
        <div className={`
          px-4 py-2 rounded-full border text-[10px] font-bold uppercase tracking-widest transition-all duration-500
          ${activeDay !== null ? 'bg-electric/10 border-electric text-electric' : 'border-white/5 text-white/10'}
        `}>
          Protocol: Hardened
        </div>
      </div>

      <svg 
        ref={cursorRef}
        viewBox="0 0 24 24" 
        className="absolute top-0 left-0 w-5 h-5 fill-electric drop-shadow-[0_0_10px_rgba(59,130,246,0.5)] z-20 pointer-events-none"
      >
        <path d="M5.5 3.21V20.8c0 .45.54.67.85.35l4.83-4.83 2.3 5.17c.14.33.52.48.84.34l2.11-.94c.33-.14.48-.52.34-.84l-2.3-5.17 6.36-.61c.44-.04.66-.58.35-.89l-15.11-13.5c-.32-.3-.87-.08-.87.37z" />
      </svg>
    </div>
  )
}

const FeatureCard = ({ title, desc, icon: Icon, children, accent = false }: any) => (
  <div className={`
    p-8 rounded-[2.5rem] border transition-all duration-500 group relative overflow-hidden
    ${accent ? 'bg-gradient-to-br from-electric/20 to-transparent border-white/10 shadow-[0_0_40px_rgba(59,130,246,0.1)]' : 'bg-white/5 border-white/5'}
  `}>
    <div className={`mb-6 p-3 rounded-2xl w-fit ${accent ? 'bg-electric text-white' : 'bg-electric/10 text-electric'}`}>
      <Icon className="w-6 h-6" />
    </div>
    
    <h3 className="text-2xl font-bold mb-3">{title}</h3>
    <p className="text-sm mb-8 leading-relaxed opacity-60">{desc}</p>
    
    <div className="relative z-10">{children}</div>
    
    {/* Decorative blur */}
    <div className="absolute -bottom-12 -right-12 w-32 h-32 bg-electric/5 blur-[60px] rounded-full group-hover:bg-electric/10 transition-all duration-700" />
  </div>
)

export default function Features() {
  const sectionRef = useRef(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from('.feature-card', {
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top 80%',
        },
        y: 60,
        opacity: 0,
        stagger: 0.15,
        duration: 1,
        ease: 'power3.out'
      })
    }, sectionRef)
    return () => ctx.revert()
  }, [])

  return (
    <section id="features" ref={sectionRef} className="py-32 px-12 md:px-24 overflow-hidden border-t border-white/5">
      <div className="max-w-7xl mx-auto">
        <div className="mb-20 space-y-4">
          <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.3em] text-electric font-bold font-jetbrains">
            <span className="w-8 h-[1px] bg-electric/40" />
            Core Capabilities
          </div>
          <h2 className="text-5xl md:text-6xl font-black tracking-tighter">
            Enterprise <span className="italic underline decoration-electric/40">Automation.</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="feature-card">
            <FeatureCard 
              title="Support Responder"
              desc="We replace operational bloat with agents that work 24/7/365 without friction or overhead."
              icon={Activity}
            >
              <DiagnosticShuffler />
            </FeatureCard>
          </div>
          
          <div className="feature-card">
            <FeatureCard 
              title="AI Engineer"
              desc="Bridging the gap between cutting-edge AI and your existing legacy operations."
              icon={TerminalIcon}
              accent
            >
              <TelemetryTypewriter />
            </FeatureCard>
          </div>

          <div className="feature-card">
            <FeatureCard 
              title="SEO Specialist"
              desc="Strategic architecture that hardens your infrastructure against administrative drag."
              icon={Shield}
            >
              <CursorScheduler />
            </FeatureCard>
          </div>
        </div>
      </div>
    </section>
  )
}
