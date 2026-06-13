'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import Link from 'next/link'
import Image from 'next/image'
import {
  ShoppingBag, Star, Plus, Minus,
  Shield, Truck, RotateCcw, Check, ZoomIn
} from 'lucide-react'
import { useCartStore } from '@/lib/store'
import { formatPrice } from '@/lib/utils'
import { ShirtBenefits } from '@/components/products/ShirtBenefits'
import { SizeTableDisplay } from '@/components/products/SizeTableDisplay'
import { RelatedExplore, type RelatedProduct } from '@/components/products/RelatedExplore'

// Slug redirects: oversized/camiseta go to their customizer pages
const SLUG_REDIRECTS: Record<string, string> = {
  'oversized': '/oversized',
  'camiseta':  '/camisetas',
  'camisetas': '/camisetas',
  'dryfit':    '/dryfit',
}

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
  sortOrder: number
  colorName?: string | null
}

type ApiProduct = {
  id: string
  name: string
  slug: string
  type: string
  gender?: string
  description?: string
  price: number
  originalPrice?: number
  material?: string
  subcategory?: string
  isNew: boolean
  isFeatured: boolean
  active: boolean
  rating: number
  reviewCount: number
  isFlashSale: boolean
  flashSalePrice?: number
  imageUrl?: string
  hoverImageUrl?: string
  images: ApiImage[]
  variants: ApiVariant[]
}

export default function ProductPage({ params }: { params: { id: string } }) {
  const router   = useRouter()
  const addItem  = useCartStore(s => s.addItem)
  const openCart = useCartStore(s => s.openCart)

  const [product, setProduct]           = useState<ApiProduct | null>(null)
  const [loading, setLoading]           = useState(true)
  const [notFoundState, setNotFoundState] = useState(false)

  const [selectedColor, setSelectedColor]   = useState<{ name: string; hex: string } | null>(null)
  const [selectedVariant, setSelectedVariant] = useState<ApiVariant | null>(null)
  const [activeImgIdx, setActiveImgIdx]     = useState(0)
  const [quantity, setQuantity]             = useState(1)
  const [tab, setTab]                       = useState<'desc' | 'material' | 'entrega'>('desc')
  const [relatedProducts, setRelatedProducts] = useState<RelatedProduct[]>([])

  // Zoom
  const [zoomPos, setZoomPos] = useState<{ x: number; y: number } | null>(null)

  useEffect(() => {
    const slug = params.id
    if (SLUG_REDIRECTS[slug]) { router.replace(SLUG_REDIRECTS[slug]); return }

    fetch(`/api/products?slug=${encodeURIComponent(slug)}`)
      .then(r => r.json())
      .then((data: ApiProduct[]) => {
        if (!data || data.length === 0) { setNotFoundState(true); return }
        const p = data[0]
        setProduct(p)
        const firstVariant = p.variants.find(v => v.stock > 0) ?? p.variants[0]
        if (firstVariant) {
          setSelectedVariant(firstVariant)
          if (firstVariant.color && firstVariant.colorHex) {
            setSelectedColor({ name: firstVariant.color, hex: firstVariant.colorHex })
          }
        }
        // Fetch related products of same type
        fetch(`/api/products?type=${p.type}`)
          .then(r => r.json())
          .then((all: ApiProduct[]) => {
            const others = all
              .filter(x => x.id !== p.id)
              .slice(0, 2)
              .map(x => ({
                id: x.id,
                name: x.name,
                slug: x.slug,
                price: (x.isFlashSale && x.flashSalePrice) ? x.flashSalePrice : x.price,
                imageUrl: x.imageUrl,
                type: x.type,
              }))
            setRelatedProducts(others)
          })
          .catch(() => {})
      })
      .catch(() => setNotFoundState(true))
      .finally(() => setLoading(false))
  }, [params.id, router])

  // Derive color images when selected color changes
  const colorImages = useCallback((imgs: ApiImage[], colorName: string | null): ApiImage[] => {
    if (!colorName) return imgs
    const specific = imgs.filter(img => img.colorName === colorName)
    const general  = imgs.filter(img => !img.colorName)
    // Show color-specific first, then general
    return specific.length > 0 ? [...specific, ...general] : general
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-brand-black flex items-center justify-center">
        <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}>
          <div className="w-8 h-8 border-2 border-brand-red border-t-transparent rounded-full" />
        </motion.div>
      </div>
    )
  }

  if (notFoundState || !product) {
    return (
      <div className="min-h-screen bg-brand-black flex flex-col items-center justify-center gap-4">
        <p className="text-brand-white text-xl font-bold">Produto nao encontrado</p>
        <Link href="/" className="text-brand-red hover:underline text-sm">Voltar ao inicio</Link>
      </div>
    )
  }

  // Unique colors from variants
  const colorVariants  = product.variants.filter(v => v.color && v.colorHex)
  const uniqueColors   = colorVariants.reduce<{ name: string; hex: string }[]>((acc, v) => {
    if (!acc.find(c => c.name === v.color)) acc.push({ name: v.color!, hex: v.colorHex! })
    return acc
  }, [])

  // Sizes for selected color
  const selectedColorName = selectedColor?.name ?? null
  const sizesForColor     = selectedColorName
    ? product.variants.filter(v => v.color === selectedColorName)
    : product.variants
  const uniqueSizes = product.variants.reduce<string[]>((acc, v) => {
    if (v.size && !acc.includes(v.size)) acc.push(v.size)
    return acc
  }, [])

  const displayPrice = product.isFlashSale && product.flashSalePrice
    ? product.flashSalePrice
    : product.price

  // Images to show in gallery (filtered by selected color)
  const galleryImages = colorImages(product.images, selectedColorName)
  const safeIdx       = Math.min(activeImgIdx, Math.max(0, galleryImages.length - 1))
  const activeImage   =
    galleryImages[safeIdx]?.url ??
    product.imageUrl ??
    null

  const isLight =
    selectedColor?.hex === '#F0EDE6' ||
    selectedColor?.hex === '#F5F5F5' ||
    selectedColor?.hex === '#FFFFFF' ||
    selectedColor?.hex === '#EDE0CA'

  const totalStock = sizesForColor.reduce((t, v) => t + v.stock, 0)

  function handleColorSelect(color: { name: string; hex: string }) {
    setSelectedColor(color)
    setActiveImgIdx(0)   // reset to first image of new color
    setZoomPos(null)
    const newVariant = product!.variants.find(v => v.color === color.name && (v.stock > 0 || true))
    setSelectedVariant(newVariant ?? null)
  }

  function handleSizeSelect(size: string) {
    const variant = product!.variants.find(v =>
      v.size === size && (selectedColorName ? v.color === selectedColorName : true)
    )
    setSelectedVariant(variant ?? null)
  }

  function handleAddToCart() {
    if (!product) return
    const size  = selectedVariant?.size ?? 'Unico'
    const color = selectedColor ?? { name: 'Padrao', hex: '#1A1A1A' }
    addItem(
      {
        id: product.id,
        slug: product.slug,
        name: product.name,
        category: product.type.toLowerCase() as any,
        price: displayPrice,
        originalPrice: product.originalPrice,
        colors: uniqueColors.length > 0 ? uniqueColors : [color],
        sizes: uniqueSizes.map(s => ({
          label: s,
          available: product.variants.some(v => v.size === s && v.stock > 0),
        })),
        images: product.images.map(i => ({ id: i.id, url: i.url, alt: i.alt ?? product.name })),
        stock: selectedVariant?.stock ?? totalStock,
        status: (totalStock === 0 ? 'out_of_stock' : totalStock < 5 ? 'low_stock' : 'available') as any,
        rating: product.rating,
        reviewCount: product.reviewCount,
        tags: [],
        isPersonalizable: false,
        isFeatured: product.isFeatured,
        isNew: product.isNew,
        description: product.description ?? '',
        shortDescription: '',
        sku: product.id,
        material: product.material,
        createdAt: new Date().toISOString(),
      },
      { name: color.name, hex: color.hex },
      { label: size, available: true },
      quantity
    )
    openCart()
  }

  const canAdd = totalStock > 0

  return (
    <div className="min-h-screen bg-brand-black">
      {/* Breadcrumb */}
      <div className="container-brand py-4 border-b border-white/5">
        <div className="flex items-center gap-2 text-xs text-brand-gray-text">
          <Link href="/" className="hover:text-brand-white transition-colors">Home</Link>
          <span>/</span>
          <Link href={`/${product.type.toLowerCase()}`} className="hover:text-brand-white transition-colors capitalize">
            {product.type === 'DRYFIT' ? 'DryFit' : product.type === 'PRODUTO_3D' ? 'Produtos 3D' : product.type === 'GEEK' ? 'Geek Store' : product.type}
          </Link>
          <span>/</span>
          <span className="text-brand-white/60">{product.name}</span>
        </div>
      </div>

      <div className="container-brand py-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">

          {/* ── Image Gallery ── */}
          <div className="space-y-3">
            {/* Main image with zoom */}
            <motion.div
              key={`${selectedColor?.name}-${safeIdx}`}
              initial={{ opacity: 0.5 }}
              animate={{ opacity: 1 }}
              className="aspect-square bg-[#E8E8E6] border border-black/[0.06] flex items-center justify-center relative overflow-hidden cursor-crosshair select-none"
              style={{ backgroundColor: '#E8E8E6' }}
              onMouseMove={e => {
                if (!activeImage) return
                const r = e.currentTarget.getBoundingClientRect()
                setZoomPos({
                  x: ((e.clientX - r.left) / r.width) * 100,
                  y: ((e.clientY - r.top) / r.height) * 100,
                })
              }}
              onMouseLeave={() => setZoomPos(null)}
            >
              {activeImage ? (
                <>
                  <Image
                    src={activeImage}
                    alt={product.name}
                    fill
                    className="object-contain p-6"
                    sizes="(max-width: 1024px) 100vw, 50vw"
                    priority
                    unoptimized
                  />
                  {/* Zoom overlay */}
                  {zoomPos && (
                    <div
                      className="absolute inset-0 pointer-events-none"
                      style={{
                        backgroundImage: `url(${activeImage})`,
                        backgroundSize: '280%',
                        backgroundPosition: `${zoomPos.x}% ${zoomPos.y}%`,
                        backgroundRepeat: 'no-repeat',
                      }}
                    />
                  )}
                  {/* Zoom hint (shows when not zooming) */}
                  <div
                    className="absolute bottom-3 right-3 flex items-center gap-1 text-white/25 text-[10px] pointer-events-none transition-opacity duration-150"
                    style={{ opacity: zoomPos ? 0 : 1 }}
                  >
                    <ZoomIn size={11} /> Ampliar
                  </div>
                </>
              ) : (
                <>
                  <div
                    className="absolute inset-0 opacity-20"
                    style={{ background: selectedColor ? `radial-gradient(circle at 50% 40%, ${selectedColor.hex}60 0%, transparent 70%)` : undefined }}
                  />
                  <svg viewBox="0 0 300 350" className="w-2/3 max-w-[250px] drop-shadow-2xl relative z-10" fill="none">
                    <ellipse cx="150" cy="344" rx="80" ry="6" fill="rgba(0,0,0,0.3)" />
                    <path d="M90 65 L25 115 L58 133 L52 285 L248 285 L242 133 L275 115 L210 65 C195 76 175 83 150 83 C125 83 105 76 90 65Z"
                      fill={selectedColor?.hex ?? '#1A1A1A'} stroke={isLight ? 'rgba(0,0,0,0.08)' : 'rgba(255,255,255,0.06)'} strokeWidth="1" />
                    <path d="M90 65 L25 115 L58 133" fill="rgba(0,0,0,0.2)" />
                    <path d="M210 65 L275 115 L242 133" fill="rgba(0,0,0,0.2)" />
                    <path d="M116 65 Q150 92 184 65" fill="none" stroke={isLight ? 'rgba(0,0,0,0.1)' : 'rgba(255,255,255,0.06)'} strokeWidth="1.5" />
                    <text x="150" y="165" textAnchor="middle" fill="#E10600" fontSize="16" fontFamily="Impact" letterSpacing="2">STREET</text>
                    <text x="150" y="185" textAnchor="middle" fill={isLight ? '#1A1A1A' : '#F5F5F2'} fontSize="14" fontFamily="Impact" letterSpacing="2" opacity="0.7">DROP</text>
                  </svg>
                </>
              )}

              {/* Badges */}
              <div className="absolute top-4 left-4 flex flex-col gap-2 z-20 pointer-events-none">
                {product.isNew && <span className="badge bg-brand-red text-white text-[10px]">Novo</span>}
                {product.isFlashSale && product.flashSalePrice && (
                  <span className="badge bg-yellow-500 text-black text-[10px] font-black">FLASH SALE</span>
                )}
              </div>
            </motion.div>

            {/* Thumbnail strip */}
            {galleryImages.length > 1 && (
              <div className="flex gap-2 flex-wrap">
                {galleryImages.map((img, i) => (
                  <button
                    key={img.id}
                    type="button"
                    onClick={() => { setActiveImgIdx(i); setZoomPos(null) }}
                    className={`w-16 h-16 relative border overflow-hidden flex-shrink-0 cursor-pointer transition-all ${
                      safeIdx === i
                        ? 'border-brand-red ring-1 ring-brand-red/40'
                        : 'border-white/10 hover:border-white/30'
                    }`}
                  >
                    <Image src={img.url} alt={img.alt ?? product.name} fill className="object-cover" unoptimized />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* ── Product Info ── */}
          <div>
            <h1 className="heading-display text-[clamp(2rem,4vw,3rem)] text-brand-white leading-tight mb-2">
              {product.name}
            </h1>

            {product.reviewCount > 0 && (
              <div className="flex items-center gap-4 mb-5">
                <div className="flex items-center gap-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} size={14} className={i < Math.floor(product.rating) ? 'text-yellow-400 fill-yellow-400' : 'text-brand-gray-text'} />
                  ))}
                </div>
                <span className="text-sm text-brand-gray-text">{product.rating} ({product.reviewCount} avaliacoes)</span>
              </div>
            )}

            {/* Price */}
            <div className="flex items-baseline gap-3 mb-6">
              <span className="heading-display text-4xl text-brand-white">{formatPrice(displayPrice)}</span>
              {product.isFlashSale && product.flashSalePrice && (
                <span className="text-lg text-brand-gray-text line-through">{formatPrice(product.price)}</span>
              )}
              {!product.isFlashSale && product.originalPrice && (
                <span className="text-lg text-brand-gray-text line-through">{formatPrice(product.originalPrice)}</span>
              )}
            </div>

            {/* Color Selector */}
            {uniqueColors.length > 0 && (
              <div className="mb-6">
                <p className="label-brand">
                  Cor: <span className="text-brand-white font-semibold normal-case tracking-normal">{selectedColor?.name ?? '–'}</span>
                </p>
                <div className="flex flex-wrap gap-2 mt-2">
                  {uniqueColors.map(color => (
                    <button
                      key={color.name}
                      onClick={() => handleColorSelect(color)}
                      className={`flex items-center gap-2 px-3 py-2 border text-xs transition-all cursor-pointer ${
                        selectedColor?.name === color.name
                          ? 'border-brand-red bg-brand-red/5 text-brand-white'
                          : 'border-white/10 text-brand-gray-text hover:border-white/30'
                      }`}
                    >
                      <span className="w-3.5 h-3.5 rounded-full border border-white/20 flex-shrink-0" style={{ backgroundColor: color.hex }} />
                      {color.name}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Size Selector */}
            {uniqueSizes.length > 0 && (
              <div className="mb-6">
                <p className="label-brand mb-2">Tamanho</p>
                <div className="flex flex-wrap gap-2">
                  {uniqueSizes.map(size => {
                    const variant  = product.variants.find(v => v.size === size && (selectedColorName ? v.color === selectedColorName : true))
                    const available = (variant?.stock ?? 0) > 0
                    const isSelected = selectedVariant?.size === size
                    return (
                      <button
                        key={size}
                        onClick={() => available && handleSizeSelect(size)}
                        disabled={!available}
                        className={`w-12 h-12 border text-sm font-bold uppercase transition-all ${
                          !available
                            ? 'border-white/5 text-white/20 cursor-not-allowed line-through'
                            : isSelected
                            ? 'border-brand-red bg-brand-red/10 text-brand-red cursor-pointer'
                            : 'border-white/10 text-brand-gray-text hover:border-white/30 hover:text-brand-white cursor-pointer'
                        }`}
                      >
                        {size}
                      </button>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Quantity + Add to Cart */}
            <div className="flex items-center gap-3 mb-6">
              <div className="flex items-center border border-white/10">
                <button onClick={() => setQuantity(q => Math.max(1, q - 1))} className="w-11 h-11 flex items-center justify-center text-brand-gray-text hover:text-brand-white transition-colors cursor-pointer">
                  <Minus size={16} />
                </button>
                <span className="w-12 text-center text-base font-bold text-brand-white">{quantity}</span>
                <button onClick={() => setQuantity(q => q + 1)} className="w-11 h-11 flex items-center justify-center text-brand-gray-text hover:text-brand-white transition-colors cursor-pointer">
                  <Plus size={16} />
                </button>
              </div>
              <button
                onClick={handleAddToCart}
                disabled={!canAdd}
                className="btn-primary flex-1 justify-center disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <ShoppingBag size={18} />
                {canAdd ? 'Adicionar ao Carrinho' : 'Esgotado'}
              </button>
            </div>

            {/* Stock indicator */}
            <p className={`text-sm mb-6 flex items-center gap-2 ${
              totalStock === 0 ? 'text-red-400' : totalStock < 5 ? 'text-yellow-400' : 'text-green-400'
            }`}>
              <span className="w-1.5 h-1.5 rounded-full bg-current" />
              {totalStock === 0 ? 'Esgotado' : totalStock < 5 ? `Ultimas ${totalStock} unidades` : 'Em estoque'}
            </p>

            {/* Guarantees */}
            <div className="grid grid-cols-2 gap-3 mb-6">
              {[
                { icon: Shield,   text: 'Pagamento seguro' },
                { icon: Truck,    text: 'Frete gratis acima de R$ 200' },
                { icon: RotateCcw, text: '7 dias para troca' },
                { icon: Check,    text: 'Producao garantida' },
              ].map(g => (
                <div key={g.text} className="flex items-center gap-2 text-xs text-brand-gray-text">
                  <g.icon size={14} className="text-brand-red flex-shrink-0" />
                  {g.text}
                </div>
              ))}
            </div>

            {/* Tabs */}
            <div className="border-t border-white/5 pt-6">
              <div className="flex gap-0 mb-4 border-b border-white/5">
                {(['desc', 'material', 'entrega'] as const).map(t => (
                  <button
                    key={t}
                    onClick={() => setTab(t)}
                    className={`px-4 py-2.5 text-xs font-bold uppercase tracking-wider border-b-2 transition-colors cursor-pointer -mb-px ${
                      tab === t ? 'border-brand-red text-brand-red' : 'border-transparent text-brand-gray-text hover:text-brand-white'
                    }`}
                  >
                    {t === 'desc' ? 'Descricao' : t === 'material' ? 'Material' : 'Entrega'}
                  </button>
                ))}
              </div>
              {tab === 'desc' && (
                <p className="text-sm text-brand-gray-text leading-relaxed">
                  {product.description ?? 'Produto premium StreetDrop Wear.'}
                </p>
              )}
              {tab === 'material' && (
                <div className="text-sm text-brand-gray-text space-y-2">
                  {product.material && <p><span className="text-brand-white">Composicao:</span> {product.material}</p>}
                  <p><span className="text-brand-white">Impressao:</span> DTF (Direct to Film) de alta resolucao</p>
                  <p><span className="text-brand-white">Lavagem:</span> Lavar a frio, nao usar secadora, nao torcer</p>
                </div>
              )}
              {tab === 'entrega' && (
                <div className="text-sm text-brand-gray-text space-y-2">
                  <p><span className="text-brand-white">Produtos prontos:</span> 3-7 dias uteis</p>
                  <p><span className="text-brand-white">Personalizados:</span> 7-12 dias uteis</p>
                  <p><span className="text-brand-white">Frete gratis:</span> Compras acima de R$ 199,90</p>
                  <p><span className="text-brand-white">Rastreamento:</span> Disponivel no painel e por WhatsApp</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Size table — DryFit only (oversized/camiseta tables shown on their respective category pages) */}
      {product.type === 'DRYFIT' && (
        <div className="container-brand">
          <SizeTableDisplay
            productType="DRYFIT"
            gender={product.gender ?? null}
            category={product.subcategory ?? null}
          />
        </div>
      )}

      {/* Quality benefits — shirt/dryfit types only */}
      {(product.type === 'DRYFIT' || product.type === 'OVERSIZED' || product.type === 'CAMISETA') && (() => {
        const dryfitPrefix = product.gender === 'FEMININO' ? 'dryfit-feminino' : 'dryfit-masculino'
        return (
          <ShirtBenefits
            type={product.type === 'DRYFIT' ? 'dryfit' : product.type === 'CAMISETA' ? 'camiseta' : 'oversized'}
            gender={product.gender}
            heroImageUrl={product.type === 'DRYFIT' ? `/images/benefits/${dryfitPrefix}-hero.png` : undefined}
            gallery1Url={product.type === 'DRYFIT' ? `/images/benefits/${dryfitPrefix}-gallery1.png` : undefined}
            gallery2Url={product.type === 'DRYFIT' ? `/images/benefits/${dryfitPrefix}-gallery2.png` : undefined}
          />
        )
      })()}

      {/* Related products & section cards */}
      <RelatedExplore currentType={product.type} relatedProducts={relatedProducts} />
    </div>
  )
}
