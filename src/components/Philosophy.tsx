import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

export default function Philosophy() {
  const sectionRef = useRef(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      const lines = gsap.utils.toArray('.manifesto-line')
      
      lines.forEach((line: any) => {
        gsap.from(line, {
          scrollTrigger: {
            trigger: line,
            start: 'top 85%',
          },
          y: 30,
          opacity: 0,
          duration: 1,
          ease: 'power3.out'
        })
      })
    }, sectionRef)
    return () => ctx.revert()
  }, [])

  return (
    <section 
      id="philosophy" 
      ref={sectionRef} 
      className="relative py-48 px-12 md:px-24 overflow-hidden border-t border-white/5"
    >
      {/* Background Texture - now even more subtle and dark */}
      <div 
        className="absolute inset-0 opacity-5 pointer-events-none mix-blend-screen"
        style={{ 
          backgroundImage: 'url("https://images.unsplash.com/photo-1550684848-fac1c5b4e853?q=80&w=2070&auto=format&fit=crop")',
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      />

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="flex flex-col gap-24">
          <div className="manifesto-line space-y-4 max-w-2xl">
            <span className="text-xs font-jetbrains uppercase tracking-[0.4em] text-electric/60 font-bold">The Conventional Approach</span>
            <p className="text-xl md:text-3xl opacity-80 font-medium leading-relaxed dark:text-white text-slate-900">
              Most automation agencies focus on selling software licenses and generic templates that add to your digital noise.
            </p>
          </div>

          <div className="manifesto-line space-y-6 text-right ml-auto max-w-4xl">
            <span className="text-xs font-jetbrains uppercase tracking-[0.4em] text-white/30">The Vexis Protocol</span>
            <h2 className="text-5xl md:text-[7rem] font-black tracking-tighter leading-[0.95]">
              We focus on building <br />
              <span className="text-electric">Autonomous Systems.</span>
            </h2>
            <p className="opacity-40 text-sm md:text-base font-jetbrains uppercase tracking-widest font-black dark:text-white text-slate-900">
              Replacing operational bloat with absolute efficiency.
            </p>
          </div>
        </div>
      </div>
      
      {/* Bottom decorative line */}
      <div className="absolute bottom-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-electric/20 to-transparent" />
    </section>
  )
}
