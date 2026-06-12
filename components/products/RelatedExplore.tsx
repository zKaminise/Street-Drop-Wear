'use client'

import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight, Shirt, Box, Gamepad2, Package, Zap } from 'lucide-react'
import { formatPrice } from '@/lib/utils'

export type RelatedProduct = {
  id: string
  name: string
  slug: string
  price: number
  imageUrl?: string
  type: string
}

type PromoCard = {
  href: string
  title: string
  subtitle: string
  accentHex: string
  gradFrom: string
  Icon: React.ElementType
}

const ALL_PROMOS: Record<string, PromoCard> = {
  OVERSIZED: {
    href: '/oversized',
    title: 'Oversized Premium',
    subtitle: 'Monte sua camiseta personalizada',
    accentHex: '#E10600',
    gradFrom: 'from-red-950/60',
    Icon: Shirt,
  },
  CAMISETA: {
    href: '/camisetas',
    title: 'Camiseta Personalizada',
    subtitle: 'Escolha estampa, cor e tamanho',
    accentHex: '#E10600',
    gradFrom: 'from-red-950/40',
    Icon: Shirt,
  },
  DRYFIT: {
    href: '/dryfit',
    title: 'DryFit Performance',
    subtitle: 'Camisetas técnicas esportivas',
    accentHex: '#3B82F6',
    gradFrom: 'from-blue-950/60',
    Icon: Zap,
  },
  PRODUTO_3D: {
    href: '/produtos-3d',
    title: 'Produtos 3D',
    subtitle: 'Estampas exclusivas em relevo',
    accentHex: '#8B5CF6',
    gradFrom: 'from-purple-950/60',
    Icon: Box,
  },
  GEEK: {
    href: '/geek',
    title: 'Geek Store',
    subtitle: 'Pokémon TCG e colecionáveis',
    accentHex: '#F59E0B',
    gradFrom: 'from-yellow-950/60',
    Icon: Gamepad2,
  },
  KITS: {
    href: '/kits',
    title: 'Kits Exclusivos',
    subtitle: 'Combos com desconto especial',
    accentHex: '#10B981',
    gradFrom: 'from-emerald-950/60',
    Icon: Package,
  },
}

// Pick 4 promo cards excluding current type
function getPromos(currentType: string): PromoCard[] {
  const order = ['OVERSIZED', 'DRYFIT', 'PRODUTO_3D', 'GEEK', 'CAMISETA', 'KITS']
  return order.filter(k => k !== currentType).slice(0, 4).map(k => ALL_PROMOS[k])
}

function ProductCard({ product }: { product: RelatedProduct }) {
  return (
    <Link
      href={`/produto/${product.slug}`}
      className="group bg-[#111] border border-white/5 hover:border-white/20 transition-all overflow-hidden flex flex-col"
    >
      {/* Image */}
      <div className="aspect-square bg-[#E8E8E6] relative overflow-hidden">
        {product.imageUrl ? (
          <Image
            src={product.imageUrl}
            alt={product.name}
            fill
            className="object-contain p-4 group-hover:scale-105 transition-transform duration-300"
            unoptimized
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <Shirt size={48} className="text-black/10" />
          </div>
        )}
      </div>
      {/* Info */}
      <div className="p-4 flex flex-col gap-1 flex-1">
        <p className="text-white text-sm font-semibold leading-snug line-clamp-2 group-hover:text-[#E10600] transition-colors">
          {product.name}
        </p>
        <p className="text-[#E10600] font-bold text-base mt-auto pt-2">{formatPrice(product.price)}</p>
      </div>
    </Link>
  )
}

function PromoCard({ card }: { card: PromoCard }) {
  return (
    <Link
      href={card.href}
      className="group relative overflow-hidden border border-white/5 hover:border-white/20 transition-all flex flex-col min-h-[220px]"
    >
      {/* Background */}
      <div className={`absolute inset-0 bg-gradient-to-br ${card.gradFrom} to-[#0D0D0D]`} />
      {/* Grid pattern */}
      <div
        className="absolute inset-0 opacity-[0.035]"
        style={{
          backgroundImage:
            'linear-gradient(rgba(255,255,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)',
          backgroundSize: '28px 28px',
        }}
      />
      {/* Glow */}
      <div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        style={{ background: `radial-gradient(ellipse at 30% 50%, ${card.accentHex}15 0%, transparent 60%)` }}
      />

      {/* Content */}
      <div className="relative z-10 flex flex-col justify-between p-6 h-full flex-1">
        <div
          className="w-12 h-12 rounded-full flex items-center justify-center mb-4"
          style={{ background: `${card.accentHex}15`, border: `1px solid ${card.accentHex}30` }}
        >
          <card.Icon size={22} style={{ color: card.accentHex }} />
        </div>
        <div>
          <p className="text-white font-bold text-base leading-snug mb-1">{card.title}</p>
          <p className="text-white/40 text-xs leading-relaxed">{card.subtitle}</p>
        </div>
        <div
          className="flex items-center gap-1.5 mt-4 text-xs font-semibold transition-all group-hover:gap-2.5"
          style={{ color: card.accentHex }}
        >
          Ver produtos <ArrowRight size={13} />
        </div>
      </div>
    </Link>
  )
}

interface RelatedExploreProps {
  currentType: string
  relatedProducts?: RelatedProduct[]
}

export function RelatedExplore({ currentType, relatedProducts = [] }: RelatedExploreProps) {
  // Take up to 2 real products, fill rest with promo cards
  const realSlots = relatedProducts.slice(0, 2)
  const promoCount = 4 - realSlots.length
  const promos = getPromos(currentType).slice(0, promoCount)

  return (
    <section className="border-t border-white/5 bg-brand-black">
      <div className="container-brand py-16">
        <div className="mb-8">
          <span className="text-[#E10600] text-xs font-bold uppercase tracking-[0.3em]">Descubra mais</span>
          <h2
            className="text-[clamp(1.6rem,3.5vw,2.4rem)] font-black text-white uppercase tracking-widest mt-1"
            style={{ fontFamily: 'var(--font-bebas)' }}
          >
            Produtos que podem te interessar
          </h2>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {realSlots.map(p => (
            <ProductCard key={p.id} product={p} />
          ))}
          {promos.map(card => (
            <PromoCard key={card.href} card={card} />
          ))}
        </div>
      </div>
    </section>
  )
}
