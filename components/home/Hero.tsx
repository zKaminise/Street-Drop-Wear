'use client'

import { useRef } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { motion, useScroll, useTransform } from 'framer-motion'
import { ArrowRight, Zap, Star, Sparkles } from 'lucide-react'

export function Hero() {
  const ref = useRef<HTMLElement>(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] })

  // Multi-layer parallax
  const textY      = useTransform(scrollYProgress, [0, 1], [0, 100])
  const textOpacity = useTransform(scrollYProgress, [0, 0.6], [1, 0])
  const shirtY     = useTransform(scrollYProgress, [0, 1], [0, 160])
  const shirtScale = useTransform(scrollYProgress, [0, 0.5, 1], [1, 1.04, 0.92])
  const shirtRotate = useTransform(scrollYProgress, [0, 0.5, 1], [0, -3, 2])
  const glowScale  = useTransform(scrollYProgress, [0, 1], [1, 2.2])
  const glowOpacity = useTransform(scrollYProgress, [0, 0.7], [0.07, 0])
  const gridY      = useTransform(scrollYProgress, [0, 1], [0, 60])

  return (
    <section ref={ref} className="relative min-h-[100svh] flex items-center overflow-hidden bg-brand-black">

      {/* Background grid – slow parallax */}
      <motion.div
        style={{
          y: gridY,
          backgroundImage:
            'linear-gradient(rgba(225,6,0,0.4) 1px, transparent 1px), linear-gradient(90deg, rgba(225,6,0,0.4) 1px, transparent 1px)',
          backgroundSize: '60px 60px',
        }}
        className="absolute inset-0 opacity-5 pointer-events-none"
      />

      {/* Red atmospheric glow – expands on scroll */}
      <motion.div
        style={{ scale: glowScale, opacity: glowOpacity }}
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-brand-red rounded-full blur-[140px] pointer-events-none"
      />
      {/* Secondary accent glow */}
      <div className="absolute top-[20%] right-[20%] w-[200px] h-[200px] bg-brand-red/3 rounded-full blur-[80px] pointer-events-none" />

      {/* ─── MAIN CONTENT ─── */}
      <div className="container-brand w-full py-24 flex flex-col lg:flex-row items-center justify-between gap-10 lg:gap-6">

        {/* Text Side */}
        <motion.div
          style={{ y: textY, opacity: textOpacity }}
          className="flex-1 max-w-xl order-2 lg:order-1 text-center lg:text-left"
        >
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="flex items-center gap-2 mb-6 justify-center lg:justify-start"
          >
            <span className="w-8 h-px bg-brand-red" />
            <span className="text-brand-red text-xs font-bold uppercase tracking-[0.3em]">
              New Drop 2025
            </span>
            <span className="w-8 h-px bg-brand-red" />
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="heading-display text-[clamp(3.2rem,7vw,6.5rem)] text-brand-white leading-[0.92]"
          >
            VISTA SUA<br />
            <span className="text-gradient-red">IDENTIDADE.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.35 }}
            className="text-[clamp(0.95rem,2vw,1.1rem)] text-brand-gray-text mt-6 max-w-lg leading-relaxed mx-auto lg:mx-0"
          >
            Crie seu drop. Represente seu estilo.
            Camisetas oversized, dry-fit, produtos 3D e kits personalizados para
            empresas, academias e eventos.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="flex flex-col sm:flex-row gap-3 mt-8 justify-center lg:justify-start"
          >
            <Link href="/oversized" className="btn-primary text-base px-8 py-4 group">
              <Zap size={18} />
              Montar minha camiseta
              <ArrowRight size={18} className="ml-1 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link href="/kits" className="btn-secondary text-base px-8 py-4">
              Ver kits personalizados
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.7 }}
            className="flex items-center gap-6 mt-10 justify-center lg:justify-start"
          >
            {[
              { value: '10k+', label: 'Clientes' },
              { value: '4.9★', label: 'Avaliação' },
              { value: '48h', label: 'Produção express' },
            ].map(stat => (
              <div key={stat.label} className="text-center">
                <p className="heading-display text-2xl text-brand-white">{stat.value}</p>
                <p className="text-xs text-brand-gray-text uppercase tracking-wider mt-0.5">{stat.label}</p>
              </div>
            ))}
          </motion.div>
        </motion.div>

        {/* T-Shirt Visual – stronger parallax */}
        <motion.div
          style={{ y: shirtY, scale: shirtScale, rotate: shirtRotate }}
          className="flex-1 flex items-center justify-center order-1 lg:order-2 w-full"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.85, x: 50 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            transition={{ duration: 0.9, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="relative w-full max-w-[340px] sm:max-w-[440px]"
          >
            {/* Decorative rings
            <div className="absolute inset-[-8%] border border-brand-red/8 rounded-full" />
            <div className="absolute inset-[-16%] border border-brand-red/4 rounded-full animate-pulse-slow" />*/}

            {/* Centered glow behind shirt
            <div className="absolute inset-[10%] bg-brand-red/6 rounded-full blur-3xl" />*/}

            {/* Oversized shirt back view */}
            <OversizedShirtBack />

            {/* Floating badges */}
            <motion.div
              animate={{ y: [-5, 5, -5] }}
              transition={{ duration: 3.2, repeat: Infinity, ease: 'easeInOut' }}
              className="absolute top-[8%] -left-4 sm:-left-8 glass-card px-3 py-2 text-xs whitespace-nowrap"
            >
              <span className="text-green-400 font-bold">●</span>
              <span className="text-brand-white ml-1.5">30.1g Premium</span>
            </motion.div>

            <motion.div
              animate={{ y: [5, -5, 5] }}
              transition={{ duration: 3.8, repeat: Infinity, ease: 'easeInOut', delay: 0.7 }}
              className="absolute bottom-[18%] -right-4 sm:-right-8 glass-card px-3 py-2 text-xs whitespace-nowrap"
            >
              <Star size={11} className="inline text-brand-red mr-1" />
              <span className="text-brand-white">Personalizável</span>
            </motion.div>

            <motion.div
              animate={{ y: [-3, 4, -3] }}
              transition={{ duration: 4.2, repeat: Infinity, ease: 'easeInOut', delay: 1.4 }}
              className="absolute top-[42%] -right-3 sm:-right-6 glass-card px-3 py-2 text-xs whitespace-nowrap"
            >
              <Sparkles size={11} className="inline text-yellow-400 mr-1" />
              <span className="text-brand-white">Drop Exclusivo</span>
            </motion.div>
          </motion.div>
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.4 }}
        style={{ opacity: textOpacity }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
      >
        <span className="text-[10px] text-brand-gray-text uppercase tracking-[0.3em]">Scroll</span>
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 1.6, repeat: Infinity }}
          className="w-px h-10 bg-gradient-to-b from-brand-gray-text to-transparent"
        />
      </motion.div>
    </section>
  )
}

/** Real product photo – back view of oversized tee with exclusive design */
function OversizedShirtBack() {
  return (
    <div className="relative w-full">
      <Image
        src="/images/mockups/mockup-19.png"
        alt="StreetDrop Wear camiseta oversized costas"
        width={600}
        height={680}
        className="w-full h-auto object-contain"
        priority
      />
      {/* Radial vignette — blends edges into the dark page background 
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse at 50% 48%, transparent 52%, rgba(11,11,13,0.85) 78%, #0B0B0D 100%)',
        }}
      />*/}
    </div>
  )
}
