'use client'

import { useState, useEffect, useMemo } from 'react'
import { motion } from 'framer-motion'
import { ProductCard } from '@/components/products/ProductCard'
import { ProductFilters, type FilterState } from '@/components/products/ProductFilters'
import type { Product, ProductCategory } from '@/lib/types'

type ApiVariant = { id: string; color?: string; colorHex?: string; size?: string; stock: number; active: boolean }
type ApiProduct = {
  id: string; name: string; slug: string; type: string; description?: string; subcategory?: string
  price: number; originalPrice?: number; material?: string; isNew: boolean; isFeatured: boolean
  isFlashSale: boolean; flashSalePrice?: number
  rating: number; reviewCount: number; createdAt: string
  imageUrl?: string; hoverImageUrl?: string
  images: { id: string; url: string; alt?: string; isPrimary?: boolean }[]
  variants: ApiVariant[]
}

function apiToProduct(p: ApiProduct): Product {
  let totalStock = 0
  for (const v of p.variants) totalStock += v.stock
  const status = totalStock === 0 ? 'out_of_stock' : totalStock < 10 ? 'low_stock' : 'available'
  const effectivePrice = (p.isFlashSale && p.flashSalePrice) ? p.flashSalePrice : p.price
  const effectiveOriginal = (p.isFlashSale && p.flashSalePrice) ? p.price : (p.originalPrice ?? undefined)
  return {
    id: p.id, slug: p.slug, name: p.name,
    description: p.description ?? '', shortDescription: '',
    price: effectivePrice, originalPrice: effectiveOriginal,
    category: 'produtos-3d' as ProductCategory,
    subcategory: p.subcategory,
    imageUrl: p.imageUrl, hoverImageUrl: p.hoverImageUrl,
    images: p.images.map(img => ({ id: img.id, url: img.url, alt: img.alt ?? p.name, isPrimary: img.isPrimary })),
    colors: [], sizes: [],
    status, tags: [], rating: p.rating, reviewCount: p.reviewCount,
    isPersonalizable: false, isFeatured: p.isFeatured, isNew: p.isNew,
    stock: totalStock, sku: p.slug,
    material: p.material ?? undefined,
    createdAt: p.createdAt,
  }
}

const PRICE_RANGES = [
  { label: 'Até R$ 60', min: 0, max: 60 },
  { label: 'R$ 60 - R$ 100', min: 60, max: 100 },
  { label: 'R$ 100 - R$ 150', min: 100, max: 150 },
  { label: 'Acima de R$ 150', min: 150, max: 9999 },
]

const SUBCATEGORIES = ['Chaveiros', 'Fitness', 'Geek', 'Decoração', 'Brindes', 'Medalhas', 'Troféus', 'Acessórios']

export default function Produtos3DPage() {
  const [allProducts, setAllProducts] = useState<Product[]>([])
  const [sub, setSub] = useState('')
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState<FilterState>({
    colors: [], sizes: [], priceRange: '',
    onlyInStock: false, onlyPersonalizable: false, onlyNew: false, sortBy: 'relevance',
  })

  useEffect(() => {
    fetch('/api/products?type=PRODUTO_3D')
      .then(r => r.json())
      .then((data: ApiProduct[]) => setAllProducts(data.map(apiToProduct)))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const products = useMemo(() => {
    const priceRange = PRICE_RANGES.find(r => r.label === filters.priceRange)
    return allProducts
      .filter(p => !sub || p.subcategory === sub)
      .filter(p => !priceRange || (p.price >= priceRange.min && p.price <= priceRange.max))
      .filter(p => !filters.onlyInStock || p.status !== 'out_of_stock')
      .filter(p => !filters.onlyNew || p.isNew)
      .sort((a, b) => {
        if (filters.sortBy === 'price_asc') return a.price - b.price
        if (filters.sortBy === 'price_desc') return b.price - a.price
        if (filters.sortBy === 'newest') return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        return 0
      })
  }, [allProducts, sub, filters])

  return (
    <div className="min-h-screen bg-brand-black">
      <div className="relative bg-brand-graphite border-b border-white/5 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-violet-900/10 to-transparent" />
        <div className="container-brand py-14 relative">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <span className="text-violet-400 text-xs font-bold uppercase tracking-[0.3em]">Impressão</span>
            <h1 className="heading-display text-[clamp(3rem,7vw,6rem)] text-brand-white mt-2 leading-none">
              PRODUTOS <span className="text-violet-400">3D</span>
            </h1>
            <p className="text-brand-gray-text mt-3 max-w-lg">
              Chaveiros, medalhas, troféus, brindes e decoração impressos em PLA premium. Personalize com seu logo, arte ou texto.
            </p>
            <div className="flex flex-wrap items-center gap-2 mt-5">
              {['PLA Premium', 'Multicolorido', 'Mín. 10 un.', 'Prazo 5-7 dias'].map(tag => (
                <span key={tag} className="text-xs text-violet-400/80 bg-violet-400/10 border border-violet-400/20 px-3 py-1">
                  {tag}
                </span>
              ))}
            </div>
          </motion.div>
        </div>
      </div>

      <div className="container-brand py-10">
        <div className="flex flex-col lg:flex-row gap-8">
          <ProductFilters
            totalResults={products.length}
            onFilterChange={setFilters}
            mode="3d"
            showSubcategories={SUBCATEGORIES}
            selectedSubcategory={sub}
            onSubcategoryChange={setSub}
          />
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
                {allProducts.length === 0
                  ? 'Nenhum produto 3D cadastrado ainda.'
                  : 'Nenhum produto encontrado com esses filtros.'}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
