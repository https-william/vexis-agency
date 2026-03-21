import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

const ProtocolCard = ({ step, title, desc, icon: IconAnimation, index }: any) => {
  return (
    <div className="protocol-card sticky top-24 w-full h-[70vh] flex items-center justify-center p-4">
      <div className="w-full h-full glass-card rounded-[3rem] overflow-hidden flex flex-col md:flex-row items-center gap-12 p-8 md:p-16 relative shadow-2xl transition-all duration-500">
        {/* Animated Background Element */}
        <div className="w-full md:w-1/2 h-48 md:h-full flex items-center justify-center opacity-40">
           <IconAnimation />
        </div>

        <div className="w-full md:w-1/2 space-y-6">
          <div className="font-jetbrains text-electric text-sm tracking-[0.5em] uppercase opacity-60">Step {step}</div>
          <h3 className="text-4xl md:text-6xl font-black tracking-tighter">{title}</h3>
          <p className="opacity-50 text-base md:text-lg leading-relaxed max-w-md">{desc}</p>
        </div>

        {/* Decorative corner index */}
        <div className="absolute top-8 right-12 text-6xl md:text-9xl font-black opacity-5 font-inter select-none pointer-events-none">
          0{index}
        </div>
      </div>
    </div>
  )
}

const RotatingMotif = () => (
  <div className="relative w-48 h-48">
    {[...Array(8)].map((_, i) => (
      <div 
        key={i}
        className="absolute inset-0 border border-electric/20 rounded-full animate-[spin_10s_linear_infinite]"
        style={{ 
          transform: `scale(${1 - i * 0.1}) rotate(${i * 15}deg)`,
          animationDelay: `${i * -0.5}s`
        }} 
      />
    ))}
    <div className="absolute inset-0 flex items-center justify-center">
      <div className="w-4 h-4 bg-electric rounded-full animate-pulse shadow-[0_0_20px_#3B82F6]" />
    </div>
  </div>
)

const ScanningLaser = () => (
  <div className="relative w-64 h-48 border border-ivory/5 bg-ivory/2 overflow-hidden flex flex-wrap gap-2 p-4">
    {[...Array(40)].map((_, i) => (
      <div key={i} className="w-1 h-1 bg-ivory/10 rounded-full" />
    ))}
    <div className="absolute top-0 left-0 w-full h-[2px] bg-electric/50 shadow-[0_0_15px_#3B82F6] animate-[scan_3s_ease-in-out_infinite]" />
    <style>{`
      @keyframes scan {
        0%, 100% { top: 0% }
        50% { top: 100% }
      }
    `}</style>
  </div>
)

const PulsingWaveform = () => (
  <svg viewBox="0 0 200 100" className="w-full max-w-xs h-32">
    <path
      d="M0 50 L40 50 L50 20 L60 80 L70 50 L120 50 L130 10 L145 90 L160 50 L200 50"
      fill="none"
      stroke="#3B82F6"
      strokeWidth="2"
      className="animate-[wave_4s_linear_infinite]"
      style={{ strokeDasharray: 400, strokeDashoffset: 400 }}
    />
    <style>{`
      @keyframes wave {
        to { stroke-dashoffset: 0 }
      }
    `}</style>
  </svg>
)

export default function Protocol() {
  const containerRef = useRef(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      const cards = gsap.utils.toArray('.protocol-card') as HTMLElement[]
      
      cards.forEach((card, i) => {
        if (i < cards.length - 1) {
          ScrollTrigger.create({
            trigger: card,
            start: 'top top+=100',
            endTrigger: cards[i + 1],
            end: 'top top+=100',
            onEnter: () => {
              gsap.to(card.firstChild, { 
                scale: 0.9, 
                filter: 'blur(20px)', 
                opacity: 0.5,
                duration: 0.8
              })
            },
            onLeaveBack: () => {
              gsap.to(card.firstChild, { 
                scale: 1, 
                filter: 'blur(0px)', 
                opacity: 1,
                duration: 0.8
              })
            }
          })
        }
      })
    }, containerRef)

    return () => ctx.revert()
  }, [])

  return (
    <section id="protocol" ref={containerRef} className="relative py-32 px-4 md:px-24 border-t border-white/5">
      <div className="max-w-7xl mx-auto">
        <div className="mb-20">
          <h2 className="text-5xl md:text-8xl font-black tracking-tighter">
            The Vexis <span className="drama-italic text-electric">Protocol.</span>
          </h2>
        </div>

        <div className="space-y-[20vh] pb-[20vh]">
          <ProtocolCard 
            index={1}
            step="01"
            title="Discovery"
            desc="Mapping your operational drag and identifying high-leverage bottlenecks in your existing systems."
            icon={RotatingMotif}
          />
          <ProtocolCard 
            index={2}
            step="02"
            title="Extraction"
            desc="Surgically removing manual dependencies and replacing them with autonomous, single-tenant AI agents."
            icon={ScanningLaser}
          />
          <ProtocolCard 
            index={3}
            step="03"
            title="Hardening"
            desc="Securing your new invisible infrastructure and ensuring 24/7/365 operational continuity."
            icon={PulsingWaveform}
          />
        </div>
      </div>
    </section>
  )
}
