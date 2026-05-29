'use client'

import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, X, ArrowRight, Loader2 } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { useSearchStore } from '@/lib/store'
import { formatPrice } from '@/lib/utils'

type Result = {
  id: string
  name: string
  slug: string
  type: string
  price: number
  imageUrl?: string | null
}

const TYPE_LABEL: Record<string, string> = {
  DRYFIT: 'DryFit',
  PRODUTO_3D: 'Produto 3D',
  GEEK: 'Geek Store',
  OVERSIZED: 'Oversized',
  CAMISETA: 'Camiseta',
}

const QUICK_LINKS = [
  { label: 'Oversized', href: '/oversized' },
  { label: 'Flash Sale 🔥', href: '/flash-sale' },
  { label: 'Kits B2B', href: '/kits' },
  { label: 'DryFit', href: '/dryfit' },
  { label: 'Geek Store', href: '/geek' },
]

export function SearchModal() {
  const { isOpen, query, setQuery, closeSearch } = useSearchStore()
  const [results, setResults]   = useState<Result[]>([])
  const [loading, setLoading]   = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  // Focus input when modal opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 80)
    } else {
      setResults([])
    }
  }, [isOpen])

  // Debounced search
  useEffect(() => {
    if (!query || query.length < 2) { setResults([]); return }
    const t = setTimeout(async () => {
      setLoading(true)
      try {
        const res  = await fetch(`/api/products?search=${encodeURIComponent(query)}&limit=8`)
        const data = await res.json()
        setResults(Array.isArray(data) ? data : [])
      } catch { setResults([]) }
      finally { setLoading(false) }
    }, 300)
    return () => clearTimeout(t)
  }, [query])

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') closeSearch() }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [closeSearch])

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/75 backdrop-blur-sm z-[60]"
            onClick={closeSearch}
          />

          {/* Panel */}
          <motion.div
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="fixed top-0 left-0 right-0 z-[61] bg-brand-graphite border-b border-white/10 shadow-2xl"
          >
            {/* Search input */}
            <div className="container-brand py-4">
              <div className="flex items-center gap-3 bg-white/5 border border-white/10 px-4 py-3 focus-within:border-brand-red/60 transition-colors">
                <Search size={18} className="text-brand-gray-text flex-shrink-0" />
                <input
                  ref={inputRef}
                  type="search"
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                  placeholder="Buscar produtos, estampas, kits..."
                  className="flex-1 bg-transparent text-brand-white placeholder:text-brand-gray-text text-base outline-none"
                  autoComplete="off"
                />
                {loading && <Loader2 size={16} className="text-brand-gray-text animate-spin flex-shrink-0" />}
                <button
                  onClick={closeSearch}
                  className="p-1 text-brand-gray-text hover:text-brand-white transition-colors cursor-pointer flex-shrink-0"
                  aria-label="Fechar busca"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Results / Quick Links */}
            <div className="container-brand pb-6 max-h-[60vh] overflow-y-auto">
              {query.length >= 2 ? (
                results.length > 0 ? (
                  <div>
                    <p className="text-xs text-brand-gray-text uppercase tracking-widest mb-3">
                      {results.length} resultado(s)
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {results.map(r => (
                        <Link
                          key={r.id}
                          href={`/produto/${r.slug}`}
                          onClick={closeSearch}
                          className="flex items-center gap-3 p-3 hover:bg-white/5 transition-colors group"
                        >
                          <div className="w-12 h-12 bg-white/5 flex-shrink-0 flex items-center justify-center overflow-hidden">
                            {r.imageUrl ? (
                              <Image src={r.imageUrl} alt={r.name} width={48} height={48} className="w-full h-full object-cover" unoptimized />
                            ) : (
                              <div className="w-8 h-8 bg-brand-red/20 rounded-sm" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm text-brand-white font-medium truncate group-hover:text-brand-red transition-colors">
                              {r.name}
                            </p>
                            <p className="text-xs text-brand-gray-text">
                              {TYPE_LABEL[r.type] ?? r.type} · {formatPrice(r.price)}
                            </p>
                          </div>
                          <ArrowRight size={14} className="text-brand-gray-text group-hover:text-brand-red transition-colors flex-shrink-0" />
                        </Link>
                      ))}
                    </div>
                  </div>
                ) : !loading ? (
                  <div className="py-6 text-center">
                    <p className="text-brand-gray-text text-sm">
                      Nenhum resultado para <span className="text-brand-white font-semibold">&quot;{query}&quot;</span>
                    </p>
                    <p className="text-xs text-brand-gray-text/60 mt-1">Tente outro termo ou explore as categorias abaixo</p>
                  </div>
                ) : null
              ) : (
                <div>
                  <p className="text-xs text-brand-gray-text uppercase tracking-widest mb-3">Acesso rápido</p>
                  <div className="flex flex-wrap gap-2">
                    {QUICK_LINKS.map(l => (
                      <Link
                        key={l.href}
                        href={l.href}
                        onClick={closeSearch}
                        className="px-4 py-2 bg-white/5 hover:bg-brand-red/15 hover:border-brand-red/40 border border-white/10 text-sm text-brand-white/80 hover:text-brand-white transition-colors"
                      >
                        {l.label}
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
