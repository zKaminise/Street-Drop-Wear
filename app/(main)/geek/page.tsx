'use client'

import { useState, useEffect, useMemo } from 'react'
import { motion } from 'framer-motion'
import { Search, X } from 'lucide-react'
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
    category: 'geek' as ProductCategory,
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

export default function GeekPage() {
  const [allProducts, setAllProducts] = useState<Product[]>([])
  const [subcategories, setSubcategories] = useState<string[]>([])
  const [sub, setSub] = useState('')
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState<FilterState>({
    colors: [], sizes: [], priceRange: '',
    onlyInStock: false, onlyPersonalizable: false, onlyNew: false, sortBy: 'relevance',
  })

  useEffect(() => {
    fetch('/api/products?type=GEEK')
      .then(r => r.json())
      .then((data: ApiProduct[]) => setAllProducts(data.map(apiToProduct)))
      .catch(() => {})
      .finally(() => setLoading(false))

    fetch('/api/product-subcategories?type=GEEK')
      .then(r => r.json())
      .then((data: { id: string; name: string }[]) => setSubcategories(data.map(d => d.name)))
      .catch(() => {})
  }, [])

  const products = useMemo(() => {
    const q = search.trim().toLowerCase()
    const priceRange = PRICE_RANGES.find(r => r.label === filters.priceRange)
    return allProducts
      .filter(p => !sub || p.subcategory === sub)
      .filter(p => !q || p.name.toLowerCase().includes(q) || (p.description ?? '').toLowerCase().includes(q))
      .filter(p => !priceRange || (p.price >= priceRange.min && p.price <= priceRange.max))
      .filter(p => !filters.onlyInStock || p.status !== 'out_of_stock')
      .filter(p => !filters.onlyNew || p.isNew)
      .sort((a, b) => {
        if (filters.sortBy === 'price_asc') return a.price - b.price
        if (filters.sortBy === 'price_desc') return b.price - a.price
        if (filters.sortBy === 'newest') return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        return 0
      })
  }, [allProducts, sub, search, filters])

  return (
    <div className="min-h-screen bg-brand-black">
      {/* Banner */}
      <div className="relative bg-brand-graphite border-b border-white/5 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-yellow-900/10 to-transparent" />
        <div className="container-brand py-14 relative">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <span className="text-yellow-400 text-xs font-bold uppercase tracking-[0.3em]">Colecionáveis & TCG</span>
            <h1 className="heading-display text-[clamp(3rem,7vw,6rem)] text-brand-white mt-2 leading-none">
              GEEK <span className="text-yellow-400">STORE</span>
            </h1>
            <p className="text-brand-gray-text mt-3 max-w-lg">
              Pokémon TCG oficial lacrado, cartas avulsas originais e produtos geek selecionados. Estoque verificado e nota fiscal garantida.
            </p>
            <div className="flex flex-wrap gap-2 mt-5">
              {['Produtos 100% Originais', 'Nota Fiscal Garantida', 'Estoque Verificado', 'Embalagem Premium'].map(tag => (
                <span key={tag} className="text-xs text-yellow-400/80 bg-yellow-400/10 border border-yellow-400/20 px-3 py-1">
                  {tag}
                </span>
              ))}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Legal notice */}
      <div className="container-brand pt-6">
        <div className="bg-yellow-400/5 border border-yellow-400/20 px-5 py-3 text-sm text-yellow-300/80">
          <span className="font-bold text-yellow-400">Aviso legal: </span>
          Todos os produtos Pokémon TCG são originais, adquiridos de distribuidores autorizados. A StreetDrop Wear é revendedora e não afiliada à The Pokémon Company.
        </div>
      </div>

      <div className="container-brand py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          <ProductFilters
            totalResults={products.length}
            onFilterChange={setFilters}
            mode="geek"
            showSubcategories={subcategories}
            selectedSubcategory={sub}
            onSubcategoryChange={setSub}
          />
          <div className="flex-1 min-w-0">
            {/* Inline search bar */}
            <div className="relative mb-5">
              <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30 pointer-events-none" />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Buscar produto (ex: Pikachu, Booster Box, ETB...)"
                className="w-full bg-brand-graphite border border-white/10 text-white text-sm pl-10 pr-10 py-3 focus:outline-none focus:border-white/25 transition-colors"
              />
              {search && (
                <button
                  onClick={() => setSearch('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white cursor-pointer transition-colors"
                  aria-label="Limpar busca"
                >
                  <X size={14} />
                </button>
              )}
            </div>

            <div className="hidden lg:flex items-center mb-4">
              <span className="text-sm text-brand-gray-text">
                <span className="text-brand-white font-semibold">{products.length}</span> produtos encontrados
                {search && (
                  <span className="ml-1 text-yellow-400/70">para &quot;{search}&quot;</span>
                )}
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
                  ? 'Nenhum produto geek cadastrado ainda.'
                  : search
                  ? `Nenhum resultado para "${search}".`
                  : 'Nenhum produto encontrado com esses filtros.'}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
