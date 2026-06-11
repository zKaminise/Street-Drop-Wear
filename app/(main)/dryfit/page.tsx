'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { ProductCard } from '@/components/products/ProductCard'
import { ProductFilters } from '@/components/products/ProductFilters'
import { Zap, Shield, Droplets } from 'lucide-react'
import type { Product, ProductCategory } from '@/lib/types'

type ApiVariant = { id: string; color?: string; colorHex?: string; size?: string; stock: number; active: boolean }
type ApiProduct = {
  id: string; name: string; slug: string; type: string; description?: string
  price: number; originalPrice?: number; material?: string; isNew: boolean; isFeatured: boolean
  isFlashSale: boolean; flashSalePrice?: number
  rating: number; reviewCount: number; createdAt: string
  imageUrl?: string; hoverImageUrl?: string
  images: { id: string; url: string; alt?: string; isPrimary?: boolean }[]
  variants: ApiVariant[]
}

function apiToProduct(p: ApiProduct): Product {
  const colorsMap = new Map<string, { name: string; hex: string }>()
  const sizesMap = new Map<string, boolean>()
  let totalStock = 0
  for (const v of p.variants) {
    if (v.color && v.colorHex) colorsMap.set(v.color, { name: v.color, hex: v.colorHex })
    if (v.size) sizesMap.set(v.size, (sizesMap.get(v.size) ?? false) || v.stock > 0)
    totalStock += v.stock
  }
  const status = totalStock === 0 ? 'out_of_stock' : totalStock < 10 ? 'low_stock' : 'available'
  const effectivePrice = (p.isFlashSale && p.flashSalePrice) ? p.flashSalePrice : p.price
  const effectiveOriginal = (p.isFlashSale && p.flashSalePrice) ? p.price : (p.originalPrice ?? undefined)
  return {
    id: p.id, slug: p.slug, name: p.name,
    description: p.description ?? '', shortDescription: '',
    price: effectivePrice, originalPrice: effectiveOriginal,
    category: 'dryfit' as ProductCategory,
    imageUrl: p.imageUrl, hoverImageUrl: p.hoverImageUrl,
    images: p.images.map(img => ({ id: img.id, url: img.url, alt: img.alt ?? p.name, isPrimary: img.isPrimary })),
    colors: Array.from(colorsMap.values()),
    sizes: Array.from(sizesMap.entries()).map(([label, available]) => ({ label, available })),
    status, tags: [], rating: p.rating, reviewCount: p.reviewCount,
    isPersonalizable: false, isFeatured: p.isFeatured, isNew: p.isNew,
    stock: totalStock, sku: p.slug,
    material: p.material ?? undefined,
    createdAt: p.createdAt,
  }
}

const FEATURES = [
  { icon: Zap, label: 'Alta performance', desc: 'Tecido dry-fit 150g ultra leve' },
  { icon: Shield, label: 'Proteção UV50+', desc: 'Bloqueio solar profissional' },
  { icon: Droplets, label: 'Anti-odor', desc: 'Tecnologia antimicrobial' },
]

export default function DryfitPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/products?type=DRYFIT')
      .then(r => r.json())
      .then((data: ApiProduct[]) => setProducts(data.map(apiToProduct)))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="min-h-screen bg-brand-black">
      {/* Banner */}
      <div className="relative bg-brand-graphite border-b border-white/5 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-900/10 to-transparent" />
        <div className="container-brand py-14 relative">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <span className="text-blue-400 text-xs font-bold uppercase tracking-[0.3em]">Fitness</span>
            <h1 className="heading-display text-[clamp(3rem,7vw,6rem)] text-brand-white mt-2 leading-none">
              DRY<span className="text-blue-400">FIT</span>
            </h1>
            <p className="text-brand-gray-text mt-3 max-w-lg">
              Desenvolvido para quem não para. Tecido técnico premium para crossfit, musculação, corrida e qualquer treino intenso.
            </p>
            <div className="flex flex-wrap gap-6 mt-6">
              {FEATURES.map(f => (
                <div key={f.label} className="flex items-center gap-3">
                  <f.icon size={18} className="text-blue-400" strokeWidth={1.5} />
                  <div>
                    <p className="text-xs font-bold text-brand-white uppercase tracking-wide">{f.label}</p>
                    <p className="text-xs text-brand-gray-text">{f.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Note */}
      <div className="container-brand pt-6">
        <div className="bg-blue-400/5 border border-blue-400/20 px-5 py-3 text-sm text-blue-300/80 flex items-center gap-2">
          <span className="font-bold text-blue-400">Info:</span>
          Produtos dry-fit não possuem personalização de estampa. Escolha modelo, cor, tamanho e quantidade.
        </div>
      </div>

      {/* Content */}
      <div className="container-brand py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          <ProductFilters totalResults={products.length} />
          <div className="flex-1 min-w-0">
            <div className="hidden lg:flex items-center mb-6">
              <span className="text-sm text-brand-gray-text">
                <span className="text-brand-white font-semibold">{products.length}</span> produtos encontrados
              </span>
            </div>
            {loading ? (
              <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {[1, 2, 3].map(i => <div key={i} className="aspect-[4/5] bg-brand-graphite animate-pulse" />)}
              </div>
            ) : products.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {products.map(product => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            ) : (
              <div className="text-center py-20 text-brand-gray-text">
                Nenhum produto dry-fit cadastrado ainda.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
