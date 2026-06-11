'use client'

import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'

export type TShirtView = 'front' | 'back'

type Props = {
  colorHex: string
  stampSlug?: string | null
  stampName?: string | null
  isOversized?: boolean
  view?: TShirtView
  imageFront?: string | null
  imageBack?: string | null
  // Override the dark tinted background with a specific color (e.g. off-white)
  previewBg?: string
}

const STAMP_COLORS: Record<string, string> = {
  'sem-estampa': 'transparent',
  'streetdrop-logo': '#E10600',
  'urban-skull': '#FF4444',
  'dragon-fire': '#FF6B35',
  'tokyo-night': '#7C3AED',
  'neon-wave': '#06B6D4',
  'mountain-peak': '#10B981',
  'cyber-grid': '#3B82F6',
}

function StampDesign({ slug, colorHex, onBack = false }: { slug: string; colorHex: string; onBack?: boolean }) {
  const accent = STAMP_COLORS[slug] ?? '#E10600'
  const isLight = ['#F5F5F2', '#F0EDE6', '#FFFFFF', '#EDE0CA'].includes(colorHex)
  const textColor = isLight ? 'rgba(0,0,0,0.7)' : 'rgba(255,255,255,0.9)'

  if (slug === 'sem-estampa') return null

  // Back view: stamp is larger and centered on the back
  const backScale = onBack ? 1.3 : 1
  const backOffsetY = onBack ? -10 : 0

  if (slug === 'streetdrop-logo') return (
    <g transform={`translate(0,${backOffsetY}) scale(1,${backScale})`}>
      <text x="150" y="165" textAnchor="middle" fill={accent} fontSize={onBack ? 24 : 22} fontFamily="Arial Black" fontWeight="900" letterSpacing="2">STREET</text>
      <text x="150" y={onBack ? 196 : 192} textAnchor="middle" fill={textColor} fontSize={onBack ? 18 : 16} fontFamily="Arial Black" fontWeight="900" letterSpacing="6">DROP</text>
      <line x1="110" y1={onBack ? 204 : 198} x2="190" y2={onBack ? 204 : 198} stroke={accent} strokeWidth="1.5" />
      <text x="150" y={onBack ? 218 : 212} textAnchor="middle" fill={textColor} fontSize="8" fontFamily="Arial" letterSpacing="5">WEAR</text>
    </g>
  )

  if (slug === 'urban-skull') return (
    <g transform={`translate(${onBack ? 108 : 115}, ${onBack ? 120 : 130}) scale(${onBack ? 0.26 : 0.23})`}>
      <ellipse cx="150" cy="120" rx="90" ry="100" fill={accent} />
      <ellipse cx="110" cy="130" rx="28" ry="28" fill={isLight ? '#fff' : '#111'} />
      <ellipse cx="190" cy="130" rx="28" ry="28" fill={isLight ? '#fff' : '#111'} />
      <path d="M105 200 L145 200 L145 230 L125 230 Z" fill={accent} />
      <path d="M155 200 L195 200 L175 230 Z" fill={accent} />
      <path d="M120 200 L150 200 L130 175 Z" fill={accent} />
      <text x="150" y="270" textAnchor="middle" fill={accent} fontSize="24" fontFamily="Arial Black" letterSpacing="3">URBAN</text>
    </g>
  )

  if (slug === 'dragon-fire') return (
    <g>
      <path d={`M${onBack ? 115 : 120} 140 Q150 ${onBack ? 115 : 120} ${onBack ? 185 : 180} 140 Q${onBack ? 205 : 200} 160 ${onBack ? 178 : 175} 185 Q150 200 ${onBack ? 122 : 125} 185 Q${onBack ? 95 : 100} 160 ${onBack ? 115 : 120} 140Z`} fill={accent} opacity="0.8" />
      <path d="M135 145 Q150 130 165 145 Q175 160 155 175 Q150 180 145 175 Q125 160 135 145Z" fill="rgba(255,200,0,0.8)" />
      <text x="150" y="215" textAnchor="middle" fill={accent} fontSize="12" fontFamily="Arial Black" letterSpacing="3">DRAGON</text>
    </g>
  )

  if (slug === 'tokyo-night') return (
    <g>
      <rect x={onBack ? 98 : 105} y="125" width={onBack ? 104 : 90} height={onBack ? 104 : 90} fill="transparent" stroke={accent} strokeWidth="1" strokeDasharray="3 3" />
      <text x="150" y="165" textAnchor="middle" fill={accent} fontSize={onBack ? 16 : 14} fontFamily="Arial Black" letterSpacing="2">æ±äº¬</text>
      <text x="150" y="183" textAnchor="middle" fill={textColor} fontSize="9" fontFamily="Arial" letterSpacing="4">TOKYO</text>
      <text x="150" y="198" textAnchor="middle" fill={accent} fontSize="9" fontFamily="Arial" letterSpacing="4">NIGHT</text>
    </g>
  )

  if (slug === 'neon-wave') return (
    <g>
      <path d="M105 155 Q120 140 135 155 Q150 170 165 155 Q180 140 195 155" stroke={accent} strokeWidth="3" fill="none" />
      <path d="M105 168 Q120 153 135 168 Q150 183 165 168 Q180 153 195 168" stroke={accent} strokeWidth="2" fill="none" opacity="0.6" />
      <path d="M105 181 Q120 166 135 181 Q150 196 165 181 Q180 166 195 181" stroke={accent} strokeWidth="1.5" fill="none" opacity="0.3" />
      <text x="150" y="210" textAnchor="middle" fill={accent} fontSize="10" fontFamily="Arial" letterSpacing="5">WAVE</text>
    </g>
  )

  if (slug === 'mountain-peak') return (
    <g>
      <path d={`M150 ${onBack ? 125 : 130} L${onBack ? 115 : 120} 185 L${onBack ? 185 : 180} 185 Z`} fill={accent} />
      <path d="M130 145 L110 185 L150 185 Z" fill={accent} opacity="0.5" />
      <path d="M165 140 L145 185 L185 185 Z" fill={accent} opacity="0.5" />
      <text x="150" y="205" textAnchor="middle" fill={accent} fontSize="9" fontFamily="Arial Black" letterSpacing="4">MOUNTAIN</text>
    </g>
  )

  if (slug === 'cyber-grid') return (
    <g>
      {[0, 1, 2, 3].map(i => (
        <line key={`h${i}`} x1="105" y1={140 + i * 18} x2="195" y2={140 + i * 18} stroke={accent} strokeWidth="0.8" opacity="0.5" />
      ))}
      {[0, 1, 2, 3, 4].map(i => (
        <line key={`v${i}`} x1={105 + i * 22} y1="140" x2={105 + i * 22} y2="194" stroke={accent} strokeWidth="0.8" opacity="0.5" />
      ))}
      <text x="150" y="170" textAnchor="middle" fill={accent} fontSize={onBack ? 15 : 13} fontFamily="Arial Black" letterSpacing="2">CYBER</text>
      <text x="150" y="188" textAnchor="middle" fill={textColor} fontSize="9" fontFamily="Arial" letterSpacing="5">GRID</text>
    </g>
  )

  return (
    <g>
      <rect x="110" y="130" width="80" height="80" fill="transparent" stroke={accent} strokeWidth="1.5" strokeDasharray="4 3" rx="1" />
      <text x="150" y="175" textAnchor="middle" fill={accent} fontSize="10" fontFamily="Arial">{slug.toUpperCase()}</text>
    </g>
  )
}

export function TShirtPreview({
  colorHex,
  stampSlug,
  stampName,
  isOversized = true,
  view = 'back',
  imageFront,
  imageBack,
  previewBg,
}: Props) {
  const isLight = ['#F5F5F2', '#F0EDE6', '#FFFFFF', '#EDE0CA'].includes(colorHex)
  const strokeColor = isLight ? 'rgba(0,0,0,0.1)' : 'rgba(255,255,255,0.07)'

  const realImage = view === 'front' ? imageFront : imageBack

  // Oversized: wider body / Camiseta: regular fit
  const bodyPath = isOversized
    ? 'M85 65 L18 118 L52 136 L46 290 L254 290 L248 136 L282 118 L215 65 C198 78 178 85 150 85 C122 85 102 78 85 65Z'
    : 'M90 65 L25 115 L58 133 L52 285 L248 285 L242 133 L275 115 L210 65 C195 76 175 83 150 83 C125 83 105 76 90 65Z'

  const sleevePath = isOversized
    ? { left: 'M85 65 L18 118 L52 136', right: 'M215 65 L282 118 L248 136' }
    : { left: 'M90 65 L25 115 L58 133', right: 'M210 65 L275 115 L242 133' }

  const isBack = view === 'back'

  return (
    <motion.div
      key={`${colorHex}-${stampSlug}-${view}`}
      initial={{ opacity: 0.6, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.25 }}
      className="relative w-full aspect-[5/6] flex items-center justify-center overflow-hidden"
      style={{ backgroundColor: previewBg ?? `${colorHex}12` }}
    >
      {/* Subtle radial glow — hidden on light backgrounds */}
      {!previewBg && (
        <div
          className="absolute inset-0 opacity-25"
          style={{ background: `radial-gradient(circle at 50% 35%, ${colorHex}80 0%, transparent 65%)` }}
        />
      )}

      {/* If real photo available, show it */}
      {realImage ? (
        <div className="relative w-full h-full">
          <Image
            src={realImage}
            alt="Preview"
            fill
            className="object-contain p-1"
            quality={95}
            sizes="(max-width: 768px) 100vw, 50vw"
            unoptimized
          />
        </div>
      ) : (
        <svg viewBox="0 0 300 360" className="w-4/5 max-w-[280px] drop-shadow-2xl relative z-10" fill="none">
          {/* Shadow */}
          <ellipse cx="150" cy="348" rx="85" ry="7" fill="rgba(0,0,0,0.25)" />

          {/* Flip horizontally for back view */}
          <g transform={isBack ? 'translate(300,0) scale(-1,1)' : ''}>
            {/* Body */}
            <path d={bodyPath} fill={colorHex} stroke={strokeColor} strokeWidth="1.2" />
            {/* Sleeve shading */}
            <path d={sleevePath.left} fill="rgba(0,0,0,0.18)" />
            <path d={sleevePath.right} fill="rgba(0,0,0,0.18)" />
          </g>

          {/* Collar – front only */}
          {!isBack && (
            <path d="M116 65 Q150 94 184 65" fill="none" stroke={strokeColor} strokeWidth="1.5" />
          )}

          {/* Back seam indicator */}
          {isBack && (
            <line x1="150" y1="75" x2="150" y2="290" stroke={strokeColor} strokeWidth="0.8" strokeDasharray="4 4" />
          )}

          {/* Stamp: shown on back by default, on front if slug includes 'chest' or front override */}
          {stampSlug && stampSlug !== 'sem-estampa' && (
            <StampDesign slug={stampSlug} colorHex={colorHex} onBack={isBack} />
          )}

          {/* Placeholder for front when no stamp */}
          {(!stampSlug || stampSlug === 'sem-estampa') && !isBack && (
            <g opacity="0.15">
              <circle cx="125" cy="150" r="8" fill={colorHex === '#0B0B0D' ? '#fff' : '#000'} />
            </g>
          )}
        </svg>
      )}

      {/* View badge */}
      <div className="absolute top-3 left-3 bg-black/50 backdrop-blur-sm px-2 py-1">
        <p className="text-[9px] text-white/50 uppercase tracking-widest">{isBack ? 'Costas' : 'Frente'}</p>
      </div>

      {stampSlug && stampSlug !== 'sem-estampa' && stampName && (
        <div className="absolute bottom-3 right-3 bg-black/60 backdrop-blur-sm px-2 py-1">
          <p className="text-[10px] text-white/60 uppercase tracking-wider">{stampName}</p>
        </div>
      )}
    </motion.div>
  )
}
