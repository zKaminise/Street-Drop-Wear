'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { motion } from 'framer-motion'
import { ShoppingBag, Star, Heart, Zap } from 'lucide-react'
import type { Product } from '@/lib/types'
import { formatPrice, formatDiscount } from '@/lib/utils'
import { useCartStore } from '@/lib/store'
import { cn } from '@/lib/utils'

interface ProductCardProps {
  product: Product
  priority?: boolean
}

export function ProductCard({ product }: ProductCardProps) {
  const router = useRouter()
  const addItem = useCartStore(s => s.addItem)
  const openCart = useCartStore(s => s.openCart)
  const [hovered, setHovered] = useState(false)

  const firstColor = product.colors[0]
  const firstAvailableSize = product.sizes.find(s => s.available)

  // Resolve images: DB imageUrl/hoverImageUrl or from images array
  const primaryImage =
    product.imageUrl ??
    product.images?.find((i: any) => i.isPrimary)?.url ??
    product.images?.[0]?.url ??
    null
  const hoverImage =
    product.hoverImageUrl ??
    product.images?.[1]?.url ??
    null

  function handleQuickAdd(e: React.MouseEvent) {
    e.preventDefault()
    if (!firstColor || !firstAvailableSize) return
    addItem(product, firstColor, firstAvailableSize)
    openCart()
  }

  const discount = product.originalPrice
    ? formatDiscount(product.originalPrice, product.price)
    : 0

  const isOutOfStock = product.status === 'out_of_stock'

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-20px' }}
      transition={{ duration: 0.4 }}
    >
      <Link
        href={`/produto/${product.slug}`}
        className="card-product block group"
        aria-label={product.name}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        {/* Image area */}
        <div className="relative aspect-[4/5] overflow-hidden bg-brand-black">
          {/* Real image with hover swap */}
          {primaryImage ? (
            <>
              <Image
                src={primaryImage}
                alt={product.name}
                fill
                className={`object-cover transition-all duration-500 ${hovered && hoverImage ? 'opacity-0 scale-105' : 'opacity-100 scale-100'}`}
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              />
              {hoverImage && (
                <Image
                  src={hoverImage}
                  alt={`${product.name} – detalhe`}
                  fill
                  className={`object-cover transition-all duration-500 ${hovered ? 'opacity-100 scale-100' : 'opacity-0 scale-105'}`}
                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                />
              )}
            </>
          ) : (
            /* SVG mockup fallback */
            <ProductMockup product={product} />
          )}

          {/* Overlay on hover */}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300" />

          {/* Badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10">
            {product.isNew && (
              <span className="badge bg-brand-red text-white text-[10px]">Novo</span>
            )}
            {discount > 0 && (
              <span className="badge bg-brand-white text-brand-black text-[10px]">
                -{discount}%
              </span>
            )}
            {product.status === 'low_stock' && (
              <span className="badge bg-yellow-500/20 text-yellow-400 text-[10px] border border-yellow-500/30">
                Últimas unidades
              </span>
            )}
            {product.tags.includes('bestseller') && (
              <span className="badge bg-white/5 text-brand-gray-text text-[10px] border border-white/10">
                Mais vendido
              </span>
            )}
          </div>

          {/* Wishlist */}
          <button
            onClick={e => e.preventDefault()}
            className="absolute top-3 right-3 w-8 h-8 bg-brand-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer z-10 hover:bg-brand-red/20"
            aria-label="Adicionar à lista de desejos"
          >
            <Heart size={14} className="text-brand-white" strokeWidth={1.5} />
          </button>

          {/* Quick add (bottom, on hover) */}
          {!isOutOfStock && product.isPersonalizable ? (
            <div className="absolute bottom-0 left-0 right-0 translate-y-full group-hover:translate-y-0 transition-transform duration-300 z-10">
              <button
                onClick={(e) => {
                  e.preventDefault()
                  router.push(`/produto/${product.slug}/personalizar`)
                }}
                className="w-full bg-brand-red text-white text-xs font-bold uppercase tracking-wider py-3 flex items-center justify-center gap-2 hover:bg-brand-red-dark transition-colors cursor-pointer"
              >
                <Zap size={13} />
                Personalizar
              </button>
            </div>
          ) : !isOutOfStock ? (
            <div className="absolute bottom-0 left-0 right-0 translate-y-full group-hover:translate-y-0 transition-transform duration-300 z-10">
              <button
                onClick={handleQuickAdd}
                className="w-full bg-brand-red text-white text-xs font-bold uppercase tracking-wider py-3 flex items-center justify-center gap-2 hover:bg-brand-red-dark transition-colors cursor-pointer"
              >
                <ShoppingBag size={13} />
                Adicionar ao carrinho
              </button>
            </div>
          ) : (
            <div className="absolute bottom-0 left-0 right-0 z-10">
              <div className="w-full bg-brand-graphite text-brand-gray-text text-xs font-bold uppercase tracking-wider py-3 text-center">
                Esgotado
              </div>
            </div>
          )}
        </div>

        {/* Info */}
        <div className="p-4">
          <div className="flex items-start justify-between gap-2 mb-2">
            <h3 className="text-sm font-semibold text-brand-white group-hover:text-brand-red transition-colors leading-tight">
              {product.name}
            </h3>
          </div>

          {/* Colors */}
          {product.colors.length > 0 && (
            <div className="flex items-center gap-1.5 mb-3">
              {product.colors.slice(0, 5).map(color => (
                <div
                  key={color.name}
                  className="w-3.5 h-3.5 rounded-full border border-white/20"
                  style={{ backgroundColor: color.hex }}
                  title={color.name}
                />
              ))}
              {product.colors.length > 5 && (
                <span className="text-[10px] text-brand-gray-text">+{product.colors.length - 5}</span>
              )}
            </div>
          )}

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-base font-bold text-brand-white">
                {formatPrice(product.price)}
              </span>
              {product.originalPrice && (
                <span className="text-xs text-brand-gray-text line-through">
                  {formatPrice(product.originalPrice)}
                </span>
              )}
            </div>

            {product.reviewCount > 0 && (
              <div className="flex items-center gap-1">
                <Star size={11} className="text-yellow-400 fill-yellow-400" />
                <span className="text-[11px] text-brand-gray-text">{product.rating}</span>
              </div>
            )}
          </div>

          {product.material && (
            <p className="text-[11px] text-brand-gray-text/60 mt-1.5">{product.material}</p>
          )}
        </div>
      </Link>
    </motion.div>
  )
}

function ProductMockup({ product }: { product: Product }) {
  const mainColor = product.colors[0]?.hex ?? '#1A1A1A'
  const isLight =
    mainColor === '#F0EDE6' || mainColor === '#F5F5F5' || mainColor === '#FFFFFF' || mainColor === '#EDE0CA'
  const textColor = isLight ? '#1A1A1A' : '#F5F5F2'
  const accentColor = isLight ? '#E10600' : '#E10600'

  return (
    <div
      className="w-full h-full flex items-center justify-center relative"
      style={{ backgroundColor: `${mainColor}22` }}
    >
      {/* Background glow */}
      <div
        className="absolute inset-0 opacity-20"
        style={{
          background: `radial-gradient(circle at 50% 40%, ${mainColor}60 0%, transparent 70%)`,
        }}
      />

      <svg viewBox="0 0 300 350" className="w-3/4 max-w-[220px] drop-shadow-xl relative z-10" fill="none">
        <ellipse cx="150" cy="345" rx="80" ry="5" fill="rgba(0,0,0,0.3)" />
        <path
          d="M90 65 L25 115 L58 133 L52 285 L248 285 L242 133 L275 115 L210 65 C195 76 175 83 150 83 C125 83 105 76 90 65Z"
          fill={mainColor}
          stroke={isLight ? 'rgba(0,0,0,0.08)' : 'rgba(255,255,255,0.06)'}
          strokeWidth="1"
        />
        <path d="M90 65 L25 115 L58 133" fill={isLight ? 'rgba(0,0,0,0.05)' : 'rgba(0,0,0,0.2)'} />
        <path d="M210 65 L275 115 L242 133" fill={isLight ? 'rgba(0,0,0,0.05)' : 'rgba(0,0,0,0.2)'} />
        <path d="M116 65 Q150 92 184 65" fill="none" stroke={isLight ? 'rgba(0,0,0,0.1)' : 'rgba(255,255,255,0.06)'} strokeWidth="1.5" />

        {product.isPersonalizable ? (
          <g>
            <rect x="110" y="135" width="80" height="80" fill={`${accentColor}15`} stroke={`${accentColor}40`} strokeWidth="1" strokeDasharray="3 2" rx="1" />
            <text x="150" y="172" textAnchor="middle" fill={accentColor} fontSize="10" fontFamily="Arial" fontWeight="bold" letterSpacing="1">SUA ARTE</text>
            <text x="150" y="188" textAnchor="middle" fill={`${accentColor}80`} fontSize="8" fontFamily="Arial" letterSpacing="2">AQUI</text>
          </g>
        ) : (
          <g>
            <text x="150" y="168" textAnchor="middle" fill={accentColor} fontSize="16" fontFamily="Impact" letterSpacing="2">STREET</text>
            <text x="150" y="188" textAnchor="middle" fill={textColor} fontSize="16" fontFamily="Impact" letterSpacing="2" opacity="0.8">DROP</text>
            <line x1="115" y1="196" x2="185" y2="196" stroke={accentColor} strokeWidth="1" opacity="0.4" />
          </g>
        )}
      </svg>
    </div>
  )
}
