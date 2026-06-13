'use client'

import { useRef, useState } from 'react'
import Image from 'next/image'
import { motion, useScroll, useTransform, useMotionValueEvent, MotionValue } from 'framer-motion'

const STEPS = [
  {
    id: 1,
    label: 'Camiseta Lisa',
    desc: 'Algodão 300g premium, lavado e pré-encolhido. Corte oversized exclusivo.',
  },
  {
    id: 2,
    label: 'Escolha a Estampa',
    desc: 'Upload da sua arte ou escolha entre nossos designs exclusivos catalogados.',
  },
  {
    id: 3,
    label: 'Produto Final',
    desc: 'Impressão DTF de alta resolução com durabilidade premium lavagem após lavagem.',
  },
  {
    id: 4,
    label: 'Embalagem Premium',
    desc: 'Embalagem sustentável com identidade visual StreetDrop Wear.',
  },
  {
    id: 5,
    label: 'Entrega Expressa',
    desc: 'Rastreamento em tempo real. Do nosso ateliê até a sua porta.',
  },
]

const STEP_IMAGES = [
  { src: '/images/mockups/mockup-lisa.png', alt: 'Camiseta oversized lisa' },
  { src: '/images/mockups/mockup-estampa.png', alt: 'Arte de estampa exclusiva StreetDrop' },
  { src: '/images/mockups/9-costa-1781219160205.png', alt: 'Camiseta com estampa personalizada final' },
  { src: '/images/mockups/mockup-22.png', alt: 'Embalagem premium StreetDrop Wear' },
  { src: '/images/mockups/mockup-23.png', alt: 'Entrega expressa StreetDrop Wear' },
]

// [fadeIn_start, fadeIn_end, fadeOut_start, fadeOut_end]
const STEP_TIMINGS: [number, number, number, number][] = [
  [0.00, 0.00, 0.18, 0.23],
  [0.18, 0.23, 0.38, 0.43],
  [0.38, 0.43, 0.58, 0.63],
  [0.58, 0.63, 0.78, 0.83],
  [0.78, 0.83, 1.00, 1.00],
]

// ── Sub-component: one image layer driven by scroll progress
function StepImageLayer({
  src,
  alt,
  progress,
  timings,
  index,
}: {
  src: string
  alt: string
  progress: MotionValue<number>
  timings: [number, number, number, number]
  index: number
}) {
  const [fi0, fi1, fo0] = timings
  const isFirst = index === 0
  const isLast  = timings[2] >= 0.99

  const opacityInput  = isFirst ? [0, fo0, timings[3]]          : isLast ? [fi0, fi1, 1.0]        : [fi0, fi1, fo0, timings[3]]
  const opacityOutput = isFirst ? [1, 1, 0]                     : isLast ? [0, 1, 1]               : [0, 1, 1, 0]
  const scaleInput    = isFirst ? [0, fo0, timings[3]]          : isLast ? [fi0, fi1, 1.0]         : [fi0, fi1, fo0, timings[3]]
  const scaleOutput   = isFirst ? [1, 1, 0.94]                  : isLast ? [0.92, 1.0, 1.0]        : [0.92, 1.0, 1.0, 0.94]
  const yInput        = isFirst ? [0, fo0, timings[3]]          : isLast ? [fi0, fi1, 1.0]         : [fi0, fi1, fo0, timings[3]]
  const yOutput       = isFirst ? [0, 0, -20]                   : isLast ? [28, 0, 0]              : [28, 0, 0, -20]

  // eslint-disable-next-line react-hooks/rules-of-hooks
  const opacity = useTransform(progress, opacityInput,  opacityOutput)
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const scale   = useTransform(progress, scaleInput,    scaleOutput)
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const y       = useTransform(progress, yInput,        yOutput)

  return (
    <motion.div
      style={{ opacity, scale, y }}
      className="absolute inset-0 flex items-center justify-center"
    >
      <div className="relative w-full h-full">
        <Image
          src={src}
          alt={alt}
          fill
          className="object-contain"
          style={{ padding: '8%' }}
          sizes="(max-width: 640px) 300px, 380px"
        />
        {/* Vignette — fades white/grey image backgrounds into dark page 
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              'radial-gradient(ellipse at 50% 50%, transparent 40%, rgba(11,11,13,0.55) 62%, rgba(11,11,13,0.95) 80%)',
          }}
        />*/}
      </div>
    </motion.div>
  )
}

export function ScrollShowcase() {
  const containerRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end end'],
  })

  const [currentStep, setCurrentStep] = useState(1)

  useMotionValueEvent(scrollYProgress, 'change', (v) => {
    if      (v < 0.20) setCurrentStep(1)
    else if (v < 0.40) setCurrentStep(2)
    else if (v < 0.60) setCurrentStep(3)
    else if (v < 0.80) setCurrentStep(4)
    else               setCurrentStep(5)
  })

  return (
    <section ref={containerRef} className="relative" style={{ height: '500vh' }}>
      <div className="sticky top-0 h-screen overflow-hidden bg-brand-black flex flex-col">

        {/* Section header */}
        <div className="container-brand pt-10 sm:pt-14 pb-2 sm:pb-4 text-center">
          <span className="text-brand-red text-xs font-bold uppercase tracking-[0.3em]">
            Do tecido ao drop
          </span>
          <h2 className="heading-display text-[clamp(1.8rem,4vw,3.5rem)] text-brand-white mt-1">
            COMO NASCE SEU DROP
          </h2>
          {/* Scroll hint — visible at top, fades out as user scrolls */}
          <motion.p
            style={{ opacity: useTransform(scrollYProgress, [0, 0.08], [1, 0]) }}
            className="text-[11px] text-brand-gray-text/70 mt-2 flex items-center justify-center gap-1.5"
          >
            <motion.span
              animate={{ y: [0, 4, 0] }}
              transition={{ duration: 1.4, repeat: Infinity, ease: 'easeInOut' }}
            >
              ↓
            </motion.span>
            Role para ver cada etapa
            <motion.span
              animate={{ y: [0, 4, 0] }}
              transition={{ duration: 1.4, repeat: Infinity, ease: 'easeInOut' }}
            >
              ↓
            </motion.span>
          </motion.p>
        </div>

        <div className="flex-1 flex items-center justify-center px-4 overflow-hidden">
          <div className="w-full max-w-5xl flex flex-col lg:flex-row items-center gap-6 lg:gap-16">

            {/* ── VISUAL AREA ── */}
            <div className="flex-shrink-0 relative w-full max-w-[300px] sm:max-w-[380px] h-[260px] sm:h-[360px]">

              {/* Ambient red glow */}
              <div className="absolute inset-[15%] bg-brand-red/6 rounded-full blur-[60px] pointer-events-none" />

              {/* Stacked image layers — each animates in/out based on scroll */}
              {STEP_IMAGES.map((img, i) => (
                <StepImageLayer
                  key={i}
                  src={img.src}
                  alt={img.alt}
                  progress={scrollYProgress}
                  timings={STEP_TIMINGS[i]}
                  index={i}
                />
              ))}

              {/* Progress dots */}
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 flex gap-1.5 z-20 pb-1">
                {STEPS.map((s) => (
                  <div
                    key={s.id}
                    className="h-[3px] rounded-full transition-all duration-500"
                    style={{
                      width: currentStep === s.id ? '22px' : '6px',
                      backgroundColor:
                        currentStep === s.id ? '#E10600' : 'rgba(255,255,255,0.18)',
                    }}
                  />
                ))}
              </div>
            </div>

            {/* ── STEP LIST ── */}
            <div className="flex-1 w-full max-w-sm lg:max-w-none">
              <div className="space-y-0.5">
                {STEPS.map((step) => {
                  const active = currentStep === step.id
                  return (
                    <div
                      key={step.id}
                      className="flex items-start gap-4 p-3 sm:p-4 transition-all duration-500"
                      style={{ opacity: active ? 1 : 0.28 }}
                    >
                      <div
                        className="flex-shrink-0 w-8 h-8 border flex items-center justify-center transition-all duration-500"
                        style={{
                          borderColor: active ? '#E10600' : 'rgba(255,255,255,0.1)',
                          backgroundColor: active ? 'rgba(225,6,0,0.12)' : 'transparent',
                        }}
                      >
                        <span className="heading-display text-sm text-brand-red">{step.id}</span>
                      </div>
                      <div className="min-w-0">
                        <p
                          className="text-xs sm:text-sm font-bold uppercase tracking-wider transition-colors duration-500"
                          style={{ color: active ? '#F5F5F2' : 'rgba(255,255,255,0.65)' }}
                        >
                          {step.label}
                        </p>
                        <p className="text-[11px] sm:text-xs text-brand-gray-text mt-0.5 leading-relaxed">
                          {step.desc}
                        </p>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

          </div>
        </div>
      </div>
    </section>
  )
}
