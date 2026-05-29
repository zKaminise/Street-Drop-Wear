'use client'

import { useRef } from 'react'
import Image from 'next/image'
import { motion, useScroll, useTransform } from 'framer-motion'

const STEPS = [
  {
    id: 1,
    label: 'Camiseta Lisa',
    desc: 'AlgodÃ£o 300g premium, lavado e prÃ©-encolhido. Corte oversized exclusivo.',
  },
  {
    id: 2,
    label: 'Escolha a Estampa',
    desc: 'Upload da sua arte ou escolha entre nossos designs exclusivos catalogados.',
  },
  {
    id: 3,
    label: 'Produto Final',
    desc: 'ImpressÃ£o DTF de alta resoluÃ§Ã£o com durabilidade premium lavagem apÃ³s lavagem.',
  },
  {
    id: 4,
    label: 'Embalagem Premium',
    desc: 'Embalagem sustentÃ¡vel com identidade visual StreetDrop Wear.',
  },
  {
    id: 5,
    label: 'Entrega Expressa',
    desc: 'Rastreamento em tempo real. Do nosso ateliÃª atÃ© a sua porta.',
  },
]

export function ScrollShowcase() {
  const containerRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end end'],
  })

  const shirtY      = useTransform(scrollYProgress, [0, 0.6], [0, -24])
  const shirtScale  = useTransform(scrollYProgress, [0, 0.3, 0.6, 0.8], [1, 1.06, 1, 0.88])
  const shirtRotate = useTransform(scrollYProgress, [0, 0.5, 1], [0, 2.5, 0])

  const designOpacity1 = useTransform(scrollYProgress, [0.14, 0.28], [0, 1])
  const designOpacity2 = useTransform(scrollYProgress, [0.28, 0.44], [0, 1])
  const boxOpacity     = useTransform(scrollYProgress, [0.54, 0.68], [0, 1])
  const truckX         = useTransform(scrollYProgress, [0.70, 0.94], [70, 0])
  const truckOpacity   = useTransform(scrollYProgress, [0.70, 0.84], [0, 1])

  return (
    <section ref={containerRef} className="relative" style={{ height: '500vh' }}>
      <div className="sticky top-0 h-screen overflow-hidden bg-brand-black flex flex-col">

        {/* Section header */}
        <div className="container-brand pt-12 sm:pt-16 pb-6 sm:pb-8 text-center">
          <span className="text-brand-red text-xs font-bold uppercase tracking-[0.3em]">Do tecido ao drop</span>
          <h2 className="heading-display text-[clamp(1.8rem,4vw,3.5rem)] text-brand-white mt-2">
            COMO NASCE SEU DROP
          </h2>
        </div>

        <div className="flex-1 flex items-center justify-center px-4 overflow-hidden">
          <div className="w-full max-w-5xl flex flex-col lg:flex-row items-center gap-6 lg:gap-16">

            {/* â”€â”€ VISUAL AREA â”€â”€ */}
            <div className="flex-shrink-0 flex items-center justify-center relative w-full max-w-[280px] sm:max-w-[360px] h-[240px] sm:h-[320px]">

              {/* Ambient glow */}
              <div className="absolute inset-0 bg-brand-red/4 rounded-full blur-[70px]" />

              {/* â”€â”€ STEP 1-3: T-SHIRT â”€â”€ */}
              <motion.div
                style={{ y: shirtY, scale: shirtScale, rotate: shirtRotate }}
                className="relative z-10"
              >
                <div className="relative">
                  <svg
                    viewBox="0 0 300 340"
                    className="w-[200px] sm:w-[260px] drop-shadow-2xl"
                    fill="none"
                    aria-hidden="true"
                  >
                    {/* Shadow */}
                    <ellipse cx="150" cy="333" rx="92" ry="7" fill="rgba(0,0,0,0.6)" />

                    {/* Shirt body */}
                    <path
                      d="M 120,58 C 106,60 88,68 76,76 L 18,80 L 10,160 L 60,157 L 62,296 L 238,296 L 240,157 L 290,160 L 282,80 L 224,76 C 212,68 194,60 180,58 Q 150,46 120,58 Z"
                      fill="#1A1A1A"
                      stroke="rgba(255,255,255,0.08)"
                      strokeWidth="1"
                    />

                    {/* Neck */}
                    <path d="M 120,58 Q 150,76 180,58" fill="#0E0E0E" stroke="rgba(255,255,255,0.1)" strokeWidth="1.5" />

                    {/* Sleeve panels */}
                    <path d="M 76,76 L 18,80 L 10,160 L 60,157" fill="#141414" stroke="rgba(255,255,255,0.04)" strokeWidth="0.5" />
                    <path d="M 224,76 L 282,80 L 290,160 L 240,157" fill="#141414" stroke="rgba(255,255,255,0.04)" strokeWidth="0.5" />

                    {/* Shoulder highlight */}
                    <path d="M 76,76 Q 113,71 150,71 Q 187,71 224,76" fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth="1" />

                    {/* Fabric texture */}
                    <line x1="62" y1="190" x2="238" y2="190" stroke="rgba(255,255,255,0.025)" strokeWidth="1" />
                    <line x1="62" y1="230" x2="238" y2="230" stroke="rgba(255,255,255,0.025)" strokeWidth="1" />
                    <line x1="62" y1="270" x2="238" y2="270" stroke="rgba(255,255,255,0.025)" strokeWidth="1" />

                    {/* Step 2: dashed upload area */}
                    <motion.g style={{ opacity: designOpacity1 }}>
                      <rect x="97" y="105" width="106" height="90" fill="none" stroke="#E10600" strokeWidth="1.5" strokeDasharray="5 3" rx="3" />
                      {/* Upload arrow */}
                      <path d="M 150,133 L 150,153" stroke="#E10600" strokeWidth="1.5" strokeLinecap="round" />
                      <path d="M 143,139 L 150,132 L 157,139" stroke="#E10600" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                      <line x1="140" y1="165" x2="160" y2="165" stroke="rgba(225,6,0,0.5)" strokeWidth="1" />
                      <text x="150" y="179" textAnchor="middle" fill="rgba(225,6,0,0.7)" fontSize="7" fontFamily="Arial" letterSpacing="3" fontWeight="bold">SUA ARTE</text>
                    </motion.g>

                    {/* Step 3: full print with actual logo */}
                    <motion.g style={{ opacity: designOpacity2 }}>
                      <rect x="96" y="102" width="108" height="94" rx="3" fill="#E10600" opacity="0.08" />
                      <rect x="96" y="102" width="108" height="94" rx="3" fill="none" stroke="rgba(225,6,0,0.3)" strokeWidth="0.5" />
                    </motion.g>
                  </svg>

                  {/* Logo overlay on step 3 */}
                  <motion.div
                    style={{
                      opacity: designOpacity2,
                      left: '29%',
                      top: '31%',
                      width: '42%',
                    }}
                    className="absolute pointer-events-none"
                  >
                    <Image
                      src="/logo-sdw.svg"
                      alt="StreetDrop Wear"
                      width={120}
                      height={48}
                      className="w-full h-auto"
                      style={{ filter: 'brightness(0) invert(1)', opacity: 0.9 }}
                    />
                  </motion.div>
                </div>
              </motion.div>

              {/* â”€â”€ STEP 4: BOX â”€â”€ */}
              <motion.div
                style={{ opacity: boxOpacity }}
                className="absolute inset-0 flex items-center justify-center z-20"
              >
                <div className="relative">
                  <svg
                    viewBox="0 0 280 260"
                    className="w-[190px] sm:w-[250px] drop-shadow-2xl"
                    aria-hidden="true"
                  >
                    <ellipse cx="140" cy="252" rx="98" ry="8" fill="rgba(0,0,0,0.45)" />

                    {/* Box base face */}
                    <path d="M 40,120 L 140,90 L 240,120 L 240,225 L 140,255 L 40,225 Z" fill="#161616" stroke="rgba(255,255,255,0.08)" strokeWidth="1" />
                    {/* Box top face */}
                    <path d="M 40,120 L 140,90 L 240,120 L 140,150 Z" fill="#1E1E1E" stroke="rgba(255,255,255,0.07)" strokeWidth="1" />
                    {/* Box left face */}
                    <path d="M 40,120 L 140,150 L 140,255 L 40,225 Z" fill="#111111" stroke="rgba(255,255,255,0.05)" strokeWidth="1" />

                    {/* Red ribbon stripe */}
                    <line x1="140" y1="90" x2="140" y2="255" stroke="#E10600" strokeWidth="3" opacity="0.35" />
                    <line x1="40" y1="172" x2="240" y2="172" stroke="#E10600" strokeWidth="2" opacity="0.2" />

                    {/* Logo placeholder on box right face */}
                    <rect x="148" y="148" width="78" height="42" rx="2" fill="rgba(225,6,0,0.05)" />
                  </svg>

                  {/* Logo on box right face */}
                  <div
                    className="absolute pointer-events-none"
                    style={{
                      left: '52%',
                      top: '55%',
                      width: '28%',
                      transform: 'skewX(-22deg)',
                    }}
                  >
                    <Image
                      src="/logo-sdw.svg"
                      alt="StreetDrop Wear"
                      width={80}
                      height={32}
                      className="w-full h-auto"
                      style={{ filter: 'brightness(0) invert(1)', opacity: 0.6 }}
                    />
                  </div>
                </div>
              </motion.div>

              {/* â”€â”€ STEP 5: TRUCK â”€â”€ */}
              <motion.div
                style={{ opacity: truckOpacity, x: truckX }}
                className="absolute inset-0 flex items-center justify-center z-30"
              >
                <div className="relative">
                  <svg
                    viewBox="0 0 320 200"
                    className="w-[210px] sm:w-[290px] drop-shadow-2xl"
                    aria-hidden="true"
                  >
                    {/* Ground shadow */}
                    <ellipse cx="160" cy="193" rx="136" ry="7" fill="rgba(0,0,0,0.4)" />

                    {/* Truck body */}
                    <rect x="18" y="58" width="204" height="114" rx="4" fill="#161616" stroke="rgba(255,255,255,0.09)" strokeWidth="1" />
                    {/* Truck cab */}
                    <path d="M 222,95 L 222,172 L 294,172 L 303,152 L 303,108 Z" fill="#1A1A1A" stroke="rgba(255,255,255,0.09)" strokeWidth="1" />
                    {/* Window */}
                    <path d="M 229,100 L 229,142 L 298,142 L 298,108 Z" fill="#0D1F3A" stroke="rgba(255,255,255,0.05)" strokeWidth="0.5" />

                    {/* Wheels */}
                    <circle cx="68" cy="176" r="22" fill="#0D0D0D" stroke="#2A2A2A" strokeWidth="2" />
                    <circle cx="68" cy="176" r="11" fill="#1A1A1A" />
                    <circle cx="68" cy="176" r="4" fill="#E10600" />

                    <circle cx="218" cy="176" r="22" fill="#0D0D0D" stroke="#2A2A2A" strokeWidth="2" />
                    <circle cx="218" cy="176" r="11" fill="#1A1A1A" />
                    <circle cx="218" cy="176" r="4" fill="#E10600" />

                    <circle cx="268" cy="176" r="18" fill="#0D0D0D" stroke="#2A2A2A" strokeWidth="2" />
                    <circle cx="268" cy="176" r="9" fill="#1A1A1A" />
                    <circle cx="268" cy="176" r="3" fill="#E10600" />

                    {/* Truck logo area */}
                    <rect x="36" y="88" width="160" height="54" rx="2" fill="rgba(225,6,0,0.04)" />

                    {/* Headlight */}
                    <rect x="299" y="126" width="9" height="14" rx="2" fill="#FFEE80" opacity="0.9" />
                  </svg>

                  {/* Logo on truck side */}
                  <div
                    className="absolute pointer-events-none"
                    style={{
                      left: '10%',
                      top: '42%',
                      width: '52%',
                    }}
                  >
                    <Image
                      src="/logo-sdw.svg"
                      alt="StreetDrop Wear"
                      width={160}
                      height={48}
                      className="w-full h-auto"
                      style={{ filter: 'brightness(0) invert(1)', opacity: 0.55 }}
                    />
                  </div>
                </div>
              </motion.div>
            </div>

            {/* â”€â”€ STEP LIST â”€â”€ */}
            <div className="flex-1 w-full max-w-sm lg:max-w-none">
              <div className="space-y-0.5">
                {STEPS.map((step, i) => (
                  <motion.div
                    key={step.id}
                    className="flex items-start gap-4 p-3 sm:p-4"
                    initial={{ opacity: 0.25 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: false, margin: '-20%' }}
                    transition={{ duration: 0.4 }}
                  >
                    <div className="flex-shrink-0 w-8 h-8 border border-white/10 flex items-center justify-center">
                      <span className="heading-display text-sm text-brand-red">{step.id}</span>
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs sm:text-sm font-bold text-brand-white uppercase tracking-wider">{step.label}</p>
                      <p className="text-[11px] sm:text-xs text-brand-gray-text mt-0.5 leading-relaxed">{step.desc}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
