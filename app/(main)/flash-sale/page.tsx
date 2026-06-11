'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import Image from 'next/image'
import { ShoppingBag, Zap, Star, Clock } from 'lucide-react'
import { formatPrice } from '@/lib/utils'
import { useCartStore } from '@/lib/store'

type ApiVariant = {
  id: string
  color?: string
  colorHex?: string
  size?: string
  stock: number
  active: boolean
}

type ApiImage = {
  id: string
  url: string
  alt?: string
  isPrimary: boolean
}

type FlashProduct = {
  id: string
  name: string
  slug: string
  type: string
  description?: string
  price: number
  originalPrice?: number
  flashSalePrice?: number
  flashSaleEndsAt?: string
  material?: string
  isNew: boolean
  rating: number
  reviewCount: number
  imageUrl?: string
  hoverImageUrl?: string
  images: ApiImage[]
  variants: ApiVariant[]
}

function useCountdown(endsAt?: string) {
  const [timeLeft, setTimeLeft] = useState({ h: 0, m: 0, s: 0 })

  useEffect(() => {
    if (!endsAt) return
    const target = new Date(endsAt).getTime()
    function update() {
      const diff = target - Date.now()
      if (diff <= 0) { setTimeLeft({ h: 0, m: 0, s: 0 }); return }
      const h = Math.floor(diff / 3600000)
      const m = Math.floor((diff % 3600000) / 60000)
      const s = Math.floor((diff % 60000) / 1000)
      setTimeLeft({ h, m, s })
    }
    update()
    const id = setInterval(update, 1000)
    return () => clearInterval(id)
  }, [endsAt])

  return timeLeft
}

function CountdownUnit({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex flex-col items-center">
      <div className="w-12 h-12 bg-brand-black border border-white/10 flex items-center justify-center">
        <span className="text-xl font-black text-white tabular-nums">
          {String(value).padStart(2, '0')}
        </span>
      </div>
      <span className="text-[9px] text-white/30 uppercase tracking-widest mt-1">{label}</span>
    </div>
  )
}

function FlashCard({ product }: { product: FlashProduct }) {
  const addItem = useCartStore(s => s.addItem)
  const openCart = useCartStore(s => s.openCart)
  const [hovered, setHovered] = useState(false)
  const timeLeft = useCountdown(product.flashSaleEndsAt)

  const displayPrice = product.flashSalePrice ?? product.price
  const mainImage = product.images.find(i => i.isPrimary)?.url ?? product.images[0]?.url ?? product.imageUrl
  const hoverImage = product.hoverImageUrl ?? product.images[1]?.url

  const totalStock = product.variants.reduce((t, v) => t + v.stock, 0)
  const discount = product.originalPrice
    ? Math.round(((product.originalPrice - displayPrice) / product.originalPrice) * 100)
    : product.price !== displayPrice
    ? Math.round(((product.price - displayPrice) / product.price) * 100)
    : 0

  function handleQuickAdd(e: React.MouseEvent) {
    e.preventDefault()
    const firstVariant = product.variants.find(v => v.stock > 0)
    const color = firstVariant?.color
      ? { name: firstVariant.color, hex: firstVariant.colorHex ?? '#1A1A1A' }
      : { name: 'Padrão', hex: '#1A1A1A' }
    const size = { label: firstVariant?.size ?? 'Único', available: true }
    addItem(
      {
        id: product.id, slug: product.slug, name: product.name,
        category: product.type.toLowerCase() as any,
        price: displayPrice, originalPrice: product.price,
        imageUrl: mainImage ?? undefined,
        hoverImageUrl: hoverImage ?? undefined,
        colors: [color],
        sizes: [size],
        images: product.images.map(i => ({ id: i.id, url: i.url, alt: i.alt ?? product.name })),
        stock: totalStock,
        status: (totalStock === 0 ? 'out_of_stock' : 'available') as any,
        rating: product.rating, reviewCount: product.reviewCount,
        tags: ['sale'], isPersonalizable: false, isFeatured: false, isNew: product.isNew,
        description: product.description ?? '', shortDescription: '', sku: product.id,
        material: product.material, createdAt: new Date().toISOString(),
      },
      color, size, 1
    )
    openCart()
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4 }}
    >
      <Link href={`/produto/${product.slug}`} className="card-product block group" onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}>
        {/* Image area */}
        <div className="relative aspect-[4/5] overflow-hidden bg-brand-black">
          {mainImage ? (
            <>
              <Image
                src={mainImage}
                alt={product.name}
                fill
                className={`object-cover transition-all duration-500 ${hovered && hoverImage ? 'opacity-0' : 'opacity-100'}`}
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              />
              {hoverImage && (
                <Image
                  src={hoverImage}
                  alt={`${product.name} – detalhe`}
                  fill
                  className={`object-cover transition-all duration-500 ${hovered ? 'opacity-100' : 'opacity-0'}`}
                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                />
              )}
            </>
          ) : (
            <div
              className="w-full h-full flex items-center justify-center"
              style={{ backgroundColor: `${product.variants[0]?.colorHex ?? '#1A1A1A'}22` }}
            >
              <svg viewBox="0 0 300 350" className="w-3/4 max-w-[200px] drop-shadow-xl" fill="none">
                <path d="M90 65 L25 115 L58 133 L52 285 L248 285 L242 133 L275 115 L210 65 C195 76 175 83 150 83 C125 83 105 76 90 65Z"
                  fill={product.variants[0]?.colorHex ?? '#1A1A1A'} stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
                <text x="150" y="175" textAnchor="middle" fill="#E10600" fontSize="18" fontFamily="Impact">STREET</text>
                <text x="150" y="195" textAnchor="middle" fill="rgba(255,255,255,0.7)" fontSize="14" fontFamily="Impact">DROP</text>
              </svg>
            </div>
          )}

          {/* Badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10">
            {discount > 0 && (
              <span className="badge bg-brand-red text-white text-[10px] font-black">-{discount}%</span>
            )}
            {product.isNew && (
              <span className="badge bg-brand-white text-brand-black text-[10px]">Novo</span>
            )}
          </div>

          {/* Countdown if has end date */}
          {product.flashSaleEndsAt && (
            <div className="absolute bottom-10 left-0 right-0 flex justify-center z-10">
              <div className="flex items-center gap-1.5 bg-black/80 backdrop-blur-sm px-2 py-1">
                <Clock size={10} className="text-brand-red" />
                <span className="text-[10px] text-white/70 font-mono tabular-nums">
                  {String(timeLeft.h).padStart(2, '0')}:{String(timeLeft.m).padStart(2, '0')}:{String(timeLeft.s).padStart(2, '0')}
                </span>
              </div>
            </div>
          )}

          {/* Quick add */}
          {totalStock > 0 && (
            <div className="absolute bottom-0 left-0 right-0 translate-y-full group-hover:translate-y-0 transition-transform duration-300 z-10">
              <button
                onClick={handleQuickAdd}
                className="w-full bg-brand-red text-white text-xs font-bold uppercase tracking-wider py-3 flex items-center justify-center gap-2 hover:bg-brand-red-dark transition-colors cursor-pointer"
              >
                <ShoppingBag size={13} />
                Adicionar ao carrinho
              </button>
            </div>
          )}
          {totalStock === 0 && (
            <div className="absolute bottom-0 left-0 right-0 z-10">
              <div className="w-full bg-brand-graphite text-brand-gray-text text-xs font-bold uppercase tracking-wider py-3 text-center">Esgotado</div>
            </div>
          )}
        </div>

        {/* Info */}
        <div className="p-4">
          <h3 className="text-sm font-semibold text-brand-white group-hover:text-brand-red transition-colors leading-tight mb-1">{product.name}</h3>
          {product.material && <p className="text-[11px] text-brand-gray-text/60 mb-2">{product.material}</p>}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-base font-bold text-brand-white">{formatPrice(displayPrice)}</span>
              {(product.flashSalePrice || product.originalPrice) && (
                <span className="text-xs text-brand-gray-text line-through">
                  {formatPrice(product.flashSalePrice ? product.price : product.originalPrice!)}
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
        </div>
      </Link>
    </motion.div>
  )
}

export default function FlashSalePage() {
  const [products, setProducts] = useState<FlashProduct[]>([])
  const [loading, setLoading] = useState(true)

  // Earliest end date for the main countdown
  const nextEnd = products
    .filter(p => p.flashSaleEndsAt)
    .sort((a, b) => new Date(a.flashSaleEndsAt!).getTime() - new Date(b.flashSaleEndsAt!).getTime())[0]
    ?.flashSaleEndsAt

  const mainCountdown = useCountdown(nextEnd)

  useEffect(() => {
    fetch('/api/products?flashSale=true')
      .then(r => r.json())
      .then(data => setProducts(Array.isArray(data) ? data : []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="min-h-screen bg-brand-black">
      {/* Hero */}
      <div className="relative bg-brand-red overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className="absolute border border-white/20"
              style={{
                width: `${80 + i * 30}px`, height: `${80 + i * 30}px`,
                left: `${10 + i * 12}%`, top: '50%',
                transform: 'translateY(-50%) rotate(45deg)',
              }}
            />
          ))}
        </div>

        <div className="container-brand py-16 relative flex flex-col lg:flex-row items-center justify-between gap-8">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Zap size={20} className="text-yellow-300 fill-yellow-300" />
              <span className="text-yellow-300 text-xs font-black uppercase tracking-[0.3em]">Oferta Relâmpago</span>
            </div>
            <h1 className="heading-display text-[clamp(3rem,8vw,7rem)] text-white leading-none">
              FLASH<br />SALE
            </h1>
            <p className="text-white/80 mt-3 max-w-sm">
              Promoções por tempo limitado. Garanta antes que acabe!
            </p>
          </div>

          {nextEnd && (
            <div className="flex flex-col items-center gap-3">
              <p className="text-white/60 text-xs uppercase tracking-widest">Termina em</p>
              <div className="flex items-center gap-2">
                <CountdownUnit value={mainCountdown.h} label="Horas" />
                <span className="text-white/40 text-2xl font-black mb-4">:</span>
                <CountdownUnit value={mainCountdown.m} label="Min" />
                <span className="text-white/40 text-2xl font-black mb-4">:</span>
                <CountdownUnit value={mainCountdown.s} label="Seg" />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Products grid */}
      <div className="container-brand py-12">
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="aspect-[4/5] bg-brand-graphite animate-pulse" />
            ))}
          </div>
        ) : products.length > 0 ? (
          <>
            <div className="flex items-center gap-3 mb-8">
              <h2 className="heading-display text-2xl text-white">OFERTAS ATIVAS</h2>
              <span className="px-2 py-0.5 bg-brand-red text-white text-xs font-black rounded-sm">
                {products.length} itens
              </span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {products.map(p => (
                <FlashCard key={p.id} product={p} />
              ))}
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center py-24 gap-6">
            <div className="w-16 h-16 bg-brand-graphite border border-white/5 flex items-center justify-center">
              <Zap size={28} className="text-brand-gray-text" />
            </div>
            <div className="text-center">
              <p className="text-brand-white font-bold text-lg">Nenhuma oferta ativa no momento</p>
              <p className="text-brand-gray-text text-sm mt-1">Fique atento! Novos flash sales toda semana.</p>
            </div>
            <Link href="/" className="btn-primary">
              Ver todos os produtos
            </Link>
          </div>
        )}
      </div>

      {/* Info strip */}
      <div className="border-t border-white/5 bg-brand-graphite">
        <div className="container-brand py-8 grid grid-cols-1 sm:grid-cols-3 gap-6">
          {[
            { icon: Zap, title: 'Promoção real', desc: 'Descontos diretos no preço, sem artifícios.' },
            { icon: Clock, title: 'Tempo limitado', desc: 'As ofertas expiram. Não deixe para depois.' },
            { icon: ShoppingBag, title: 'Mesmo prazo', desc: 'Produção e entrega nos prazos habituais.' },
          ].map(item => (
            <div key={item.title} className="flex items-start gap-3">
              <div className="w-8 h-8 bg-brand-red/10 flex items-center justify-center flex-shrink-0">
                <item.icon size={16} className="text-brand-red" />
              </div>
              <div>
                <p className="text-sm font-bold text-brand-white">{item.title}</p>
                <p className="text-xs text-brand-gray-text mt-0.5">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
