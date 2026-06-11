'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { ArrowRight, ShoppingBag, Zap, Star } from 'lucide-react'
import { formatPrice } from '@/lib/utils'
import { useCartStore } from '@/lib/store'

type FeaturedProduct = {
  id: string
  name: string
  slug: string
  type: string
  price: number
  originalPrice?: number
  isFlashSale: boolean
  flashSalePrice?: number
  imageUrl?: string
  hoverImageUrl?: string
  isNew: boolean
  isFeatured: boolean
  rating: number
  reviewCount: number
  material?: string
  variants: Array<{ id: string; color?: string; colorHex?: string; size?: string; stock: number }>
  images: Array<{ id: string; url: string; isPrimary: boolean }>
}

function FeaturedCard({ product, priority = false }: { product: FeaturedProduct; priority?: boolean }) {
  const [hovered, setHovered] = useState(false)
  const addItem = useCartStore(s => s.addItem)
  const openCart = useCartStore(s => s.openCart)

  const displayPrice = product.isFlashSale && product.flashSalePrice ? product.flashSalePrice : product.price
  const mainImage = product.imageUrl ?? product.images?.find(i => i.isPrimary)?.url ?? product.images?.[0]?.url
  const hoverImage = product.hoverImageUrl ?? product.images?.[1]?.url
  const discount = displayPrice < product.price
    ? Math.round(((product.price - displayPrice) / product.price) * 100)
    : product.originalPrice ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100) : 0
  const totalStock = product.variants.reduce((t, v) => t + v.stock, 0)

  function handleQuickAdd(e: React.MouseEvent) {
    e.preventDefault()
    const v = product.variants.find(x => x.stock > 0)
    const color = v?.color ? { name: v.color, hex: v.colorHex ?? '#1A1A1A' } : { name: 'Padrão', hex: '#1A1A1A' }
    const size = { label: v?.size ?? 'Único', available: true }
    addItem(
      {
        id: product.id, slug: product.slug, name: product.name,
        category: product.type.toLowerCase() as any, price: displayPrice,
        originalPrice: product.originalPrice,
        colors: [color], sizes: [size],
        images: (product.images ?? []).map(i => ({ id: i.id, url: i.url, alt: product.name })),
        stock: totalStock, status: (totalStock > 0 ? 'available' : 'out_of_stock') as any,
        rating: product.rating, reviewCount: product.reviewCount, tags: product.isFlashSale ? ['sale'] : [],
        isPersonalizable: false, isFeatured: product.isFeatured, isNew: product.isNew,
        description: '', shortDescription: '', sku: product.id, material: product.material,
        createdAt: new Date().toISOString(),
      },
      color, size, 1
    )
    openCart()
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-30px' }}
      transition={{ duration: 0.4 }}
    >
      <Link
        href={`/produto/${product.slug}`}
        className="card-product block group"
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        <div className="relative aspect-[4/5] overflow-hidden bg-brand-black">
          {mainImage ? (
            <>
              <Image
                src={mainImage}
                alt={product.name}
                fill
                priority={priority}
                className={`object-cover transition-all duration-500 ${hovered && hoverImage ? 'opacity-0 scale-105' : 'opacity-100 scale-100'}`}
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              />
              {hoverImage && (
                <Image
                  src={hoverImage}
                  alt={`${product.name} detalhe`}
                  fill
                  className={`object-cover transition-all duration-500 ${hovered ? 'opacity-100 scale-100' : 'opacity-0 scale-105'}`}
                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                />
              )}
            </>
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-brand-graphite">
              <svg viewBox="0 0 300 350" className="w-3/4 max-w-[200px] drop-shadow-xl" fill="none">
                <path d="M90 65 L25 115 L58 133 L52 285 L248 285 L242 133 L275 115 L210 65 C195 76 175 83 150 83 C125 83 105 76 90 65Z"
                  fill="#1A1A1A" stroke="rgba(255,255,255,0.06)" strokeWidth="1" />
                <text x="150" y="175" textAnchor="middle" fill="#E10600" fontSize="18" fontFamily="Impact">STREET</text>
                <text x="150" y="195" textAnchor="middle" fill="rgba(245,245,242,0.7)" fontSize="14" fontFamily="Impact">DROP</text>
              </svg>
            </div>
          )}

          {/* Badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10">
            {product.isNew && <span className="badge bg-brand-red text-white text-[10px]">Novo</span>}
            {discount > 0 && <span className="badge bg-yellow-500 text-black text-[10px] font-black">-{discount}%</span>}
            {product.isFlashSale && <span className="badge bg-brand-red text-white text-[10px] font-black flex items-center gap-0.5"><Zap size={8} />Flash</span>}
          </div>

          {/* Quick add — mobile: sempre visível | desktop (lg+): aparece no hover */}
          {totalStock > 0 && (
            <div className="absolute bottom-0 left-0 right-0 translate-y-0 lg:translate-y-full lg:group-hover:translate-y-0 transition-transform duration-300 z-10">
              <button
                onClick={handleQuickAdd}
                className="w-full bg-brand-red text-white text-xs font-bold uppercase tracking-wider py-3 flex items-center justify-center gap-2 hover:bg-[#B80000] transition-colors cursor-pointer"
              >
                <ShoppingBag size={13} />
                <span className="hidden sm:inline">Adicionar ao carrinho</span>
                <span className="sm:hidden">Adicionar</span>
              </button>
            </div>
          )}
        </div>

        <div className="p-4">
          <h3 className="text-sm font-semibold text-brand-white group-hover:text-brand-red transition-colors leading-tight mb-1">
            {product.name}
          </h3>
          {product.material && <p className="text-[11px] text-brand-gray-text/60 mb-2">{product.material}</p>}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-base font-bold text-brand-white">{formatPrice(displayPrice)}</span>
              {displayPrice < product.price && (
                <span className="text-xs text-brand-gray-text line-through">{formatPrice(product.price)}</span>
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

export function FeaturedProducts() {
  const [products, setProducts] = useState<FeaturedProduct[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Fetch featured + flash sale products; combine and deduplicate
    Promise.all([
      fetch('/api/products?flashSale=true').then(r => r.json()).catch(() => []),
      fetch('/api/products').then(r => r.json()).catch(() => []),
    ]).then(([flashProds, allProds]) => {
      const allFeatured: FeaturedProduct[] = [
        ...(Array.isArray(flashProds) ? flashProds : []),
        ...(Array.isArray(allProds) ? allProds.filter((p: FeaturedProduct) => p.isFeatured) : []),
      ]
      // Deduplicate by id
      const seen = new Set<string>()
      const unique = allFeatured.filter(p => { if (seen.has(p.id)) return false; seen.add(p.id); return true })
      setProducts(unique.slice(0, 4))
    }).finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <section className="section-padding bg-brand-graphite">
        <div className="container-brand">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="aspect-[4/5] bg-brand-black animate-pulse" />
            ))}
          </div>
        </div>
      </section>
    )
  }

  if (products.length === 0) return null

  return (
    <section className="section-padding bg-brand-graphite">
      <div className="container-brand">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex items-end justify-between gap-4 mb-10"
        >
          <div>
            <span className="text-brand-red text-xs font-bold uppercase tracking-[0.3em]">Destaques</span>
            <h2 className="heading-display text-[clamp(2rem,4vw,3.5rem)] text-brand-white mt-2">
              DROPS QUENTES
            </h2>
          </div>
          <Link href="/flash-sale" className="btn-outline-red hidden sm:flex group">
            Ver todos
            <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </motion.div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {products.map((product, i) => (
            <FeaturedCard key={product.id} product={product} priority={i < 2} />
          ))}
        </div>

        <div className="sm:hidden mt-6">
          <Link href="/flash-sale" className="btn-outline-red w-full justify-center group">
            Ver todos os produtos
            <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>
    </section>
  )
}
