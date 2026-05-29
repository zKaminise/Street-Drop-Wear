'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { notFound } from 'next/navigation'
import { motion } from 'framer-motion'
import Link from 'next/link'
import Image from 'next/image'
import {
  ShoppingBag, Star, ChevronLeft, Plus, Minus,
  Zap, Shield, Truck, RotateCcw, Check, MessageCircle
} from 'lucide-react'
import { useCartStore } from '@/lib/store'
import { formatPrice, getStockLabel, getWhatsAppLink } from '@/lib/utils'

// Slug redirects: oversized/camiseta go to their customizer pages
const SLUG_REDIRECTS: Record<string, string> = {
  'oversized': '/oversized',
  'camiseta': '/camisetas',
  'camisetas': '/camisetas',
  'dryfit': '/dryfit',
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
}

type ApiProduct = {
  id: string
  name: string
  slug: string
  type: string
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
  const router = useRouter()
  const addItem = useCartStore(s => s.addItem)
  const openCart = useCartStore(s => s.openCart)

  const [product, setProduct] = useState<ApiProduct | null>(null)
  const [loading, setLoading] = useState(true)
  const [notFoundState, setNotFoundState] = useState(false)

  const [selectedColor, setSelectedColor] = useState<{ name: string; hex: string } | null>(null)
  const [selectedVariant, setSelectedVariant] = useState<ApiVariant | null>(null)
  const [quantity, setQuantity] = useState(1)
  const [tab, setTab] = useState<'desc' | 'material' | 'entrega'>('desc')

  useEffect(() => {
    const slug = params.id

    // Redirect slug aliases
    if (SLUG_REDIRECTS[slug]) {
      router.replace(SLUG_REDIRECTS[slug])
      return
    }

    fetch(`/api/products?slug=${encodeURIComponent(slug)}`)
      .then(r => r.json())
      .then((data: ApiProduct[]) => {
        if (!data || data.length === 0) {
          setNotFoundState(true)
          return
        }
        const p = data[0]
        setProduct(p)
        // Pick first unique color
        const firstVariant = p.variants.find(v => v.stock > 0) ?? p.variants[0]
        if (firstVariant) {
          setSelectedVariant(firstVariant)
          if (firstVariant.color && firstVariant.colorHex) {
            setSelectedColor({ name: firstVariant.color, hex: firstVariant.colorHex })
          }
        }
      })
      .catch(() => setNotFoundState(true))
      .finally(() => setLoading(false))
  }, [params.id, router])

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
        <p className="text-brand-white text-xl font-bold">Produto não encontrado</p>
        <Link href="/" className="text-brand-red hover:underline text-sm">Voltar ao início</Link>
      </div>
    )
  }

  // Derive unique colors from variants
  const colorVariants = product.variants.filter(v => v.color && v.colorHex)
  const uniqueColors = colorVariants.reduce<{ name: string; hex: string }[]>((acc, v) => {
    if (!acc.find(c => c.name === v.color)) {
      acc.push({ name: v.color!, hex: v.colorHex! })
    }
    return acc
  }, [])

  // Sizes for selected color
  const selectedColorName = selectedColor?.name ?? null
  const sizesForColor = selectedColorName
    ? product.variants.filter(v => v.color === selectedColorName)
    : product.variants

  // Unique sizes
  const uniqueSizes = product.variants.reduce<string[]>((acc, v) => {
    if (v.size && !acc.includes(v.size)) acc.push(v.size)
    return acc
  }, [])

  const displayPrice = product.isFlashSale && product.flashSalePrice
    ? product.flashSalePrice
    : product.price

  const mainImage =
    product.images.find(i => i.isPrimary)?.url ??
    product.images[0]?.url ??
    product.imageUrl

  const isLight =
    selectedColor?.hex === '#F0EDE6' ||
    selectedColor?.hex === '#F5F5F5' ||
    selectedColor?.hex === '#FFFFFF' ||
    selectedColor?.hex === '#EDE0CA'

  const totalStock = sizesForColor.reduce((t, v) => t + v.stock, 0)

  function handleColorSelect(color: { name: string; hex: string }) {
    setSelectedColor(color)
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
    const size = selectedVariant?.size ?? 'Único'
    const color = selectedColor ?? { name: 'Padrão', hex: '#1A1A1A' }
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

          {/* Image Gallery */}
          <div className="space-y-4">
            <motion.div
              key={selectedColor?.name}
              initial={{ opacity: 0.5 }}
              animate={{ opacity: 1 }}
              className="aspect-square bg-brand-graphite border border-white/5 flex items-center justify-center relative overflow-hidden"
              style={{ backgroundColor: selectedColor ? `${selectedColor.hex}11` : undefined }}
            >
              {mainImage ? (
                <Image
                  src={mainImage}
                  alt={product.name}
                  fill
                  className="object-contain p-6"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                />
              ) : (
                <>
                  <div
                    className="absolute inset-0 opacity-20"
                    style={{
                      background: selectedColor
                        ? `radial-gradient(circle at 50% 40%, ${selectedColor.hex}60 0%, transparent 70%)`
                        : undefined,
                    }}
                  />
                  <svg
                    viewBox="0 0 300 350"
                    className="w-2/3 max-w-[250px] drop-shadow-2xl relative z-10"
                    fill="none"
                  >
                    <ellipse cx="150" cy="344" rx="80" ry="6" fill="rgba(0,0,0,0.3)" />
                    <path
                      d="M90 65 L25 115 L58 133 L52 285 L248 285 L242 133 L275 115 L210 65 C195 76 175 83 150 83 C125 83 105 76 90 65Z"
                      fill={selectedColor?.hex ?? '#1A1A1A'}
                      stroke={isLight ? 'rgba(0,0,0,0.08)' : 'rgba(255,255,255,0.06)'}
                      strokeWidth="1"
                    />
                    <path d="M90 65 L25 115 L58 133" fill="rgba(0,0,0,0.2)" />
                    <path d="M210 65 L275 115 L242 133" fill="rgba(0,0,0,0.2)" />
                    <path d="M116 65 Q150 92 184 65" fill="none" stroke={isLight ? 'rgba(0,0,0,0.1)' : 'rgba(255,255,255,0.06)'} strokeWidth="1.5" />
                    <text x="150" y="165" textAnchor="middle" fill="#E10600" fontSize="16" fontFamily="Impact" letterSpacing="2">STREET</text>
                    <text x="150" y="185" textAnchor="middle" fill={isLight ? '#1A1A1A' : '#F5F5F2'} fontSize="14" fontFamily="Impact" letterSpacing="2" opacity="0.7">DROP</text>
                  </svg>
                </>
              )}

              {/* Badges */}
              <div className="absolute top-4 left-4 flex flex-col gap-2 z-20">
                {product.isNew && <span className="badge bg-brand-red text-white text-[10px]">Novo</span>}
                {product.isFlashSale && product.flashSalePrice && (
                  <span className="badge bg-yellow-500 text-black text-[10px] font-black">🔥 FLASH SALE</span>
                )}
              </div>
            </motion.div>

            {/* Image thumbnails */}
            {product.images.length > 1 && (
              <div className="flex gap-2 flex-wrap">
                {product.images.map(img => (
                  <div
                    key={img.id}
                    className="w-16 h-16 relative border border-white/10 overflow-hidden flex-shrink-0"
                  >
                    <Image src={img.url} alt={img.alt ?? product.name} fill className="object-cover" />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div>
            <div className="flex items-start justify-between gap-4 mb-2">
              <h1 className="heading-display text-[clamp(2rem,4vw,3rem)] text-brand-white leading-tight">{product.name}</h1>
            </div>

            {product.reviewCount > 0 && (
              <div className="flex items-center gap-4 mb-5">
                <div className="flex items-center gap-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} size={14} className={i < Math.floor(product.rating) ? 'text-yellow-400 fill-yellow-400' : 'text-brand-gray-text'} />
                  ))}
                </div>
                <span className="text-sm text-brand-gray-text">{product.rating} ({product.reviewCount} avaliações)</span>
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
                <div className="flex items-center justify-between mb-2">
                  <p className="label-brand">Tamanho</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {uniqueSizes.map(size => {
                    const variant = product.variants.find(v =>
                      v.size === size && (selectedColorName ? v.color === selectedColorName : true)
                    )
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

            {/* Quantity + Add */}
            <div className="flex items-center gap-3 mb-6">
              <div className="flex items-center border border-white/10">
                <button
                  onClick={() => setQuantity(q => Math.max(1, q - 1))}
                  className="w-11 h-11 flex items-center justify-center text-brand-gray-text hover:text-brand-white transition-colors cursor-pointer"
                >
                  <Minus size={16} />
                </button>
                <span className="w-12 text-center text-base font-bold text-brand-white">{quantity}</span>
                <button
                  onClick={() => setQuantity(q => q + 1)}
                  className="w-11 h-11 flex items-center justify-center text-brand-gray-text hover:text-brand-white transition-colors cursor-pointer"
                >
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

            {/* Stock */}
            <p className={`text-sm mb-6 flex items-center gap-2 ${
              totalStock === 0 ? 'text-red-400' : totalStock < 5 ? 'text-yellow-400' : 'text-green-400'
            }`}>
              <span className="w-1.5 h-1.5 rounded-full bg-current" />
              {totalStock === 0 ? 'Esgotado' : totalStock < 5 ? `Últimas ${totalStock} unidades` : 'Em estoque'}
            </p>

            {/* Guarantees */}
            <div className="grid grid-cols-2 gap-3 mb-6">
              {[
                { icon: Shield, text: 'Pagamento seguro' },
                { icon: Truck, text: 'Frete grátis acima de R$ 200' },
                { icon: RotateCcw, text: '7 dias para troca' },
                { icon: Check, text: 'Produção garantida' },
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
                      tab === t
                        ? 'border-brand-red text-brand-red'
                        : 'border-transparent text-brand-gray-text hover:text-brand-white'
                    }`}
                  >
                    {t === 'desc' ? 'Descrição' : t === 'material' ? 'Material' : 'Entrega'}
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
                  {product.material && <p><span className="text-brand-white">Composição:</span> {product.material}</p>}
                  <p><span className="text-brand-white">Impressão:</span> DTF (Direct to Film) de alta resolução</p>
                  <p><span className="text-brand-white">Lavagem:</span> Lavar a frio, não usar secadora, não torcer</p>
                </div>
              )}
              {tab === 'entrega' && (
                <div className="text-sm text-brand-gray-text space-y-2">
                  <p><span className="text-brand-white">Produtos prontos:</span> 3-7 dias úteis</p>
                  <p><span className="text-brand-white">Personalizados:</span> 7-12 dias úteis</p>
                  <p><span className="text-brand-white">Frete grátis:</span> Compras acima de R$ 199,90</p>
                  <p><span className="text-brand-white">Rastreamento:</span> Disponível no painel e por WhatsApp</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
