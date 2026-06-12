'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { SlidersHorizontal, X, ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'

const PRICE_RANGES = [
  { label: 'Até R$ 60', min: 0, max: 60 },
  { label: 'R$ 60 - R$ 100', min: 60, max: 100 },
  { label: 'R$ 100 - R$ 150', min: 100, max: 150 },
  { label: 'Acima de R$ 150', min: 150, max: 9999 },
]

const SIZES_AVAILABLE = ['PP', 'P', 'M', 'G', 'GG', 'XGG']

export interface FilterState {
  colors: string[]
  sizes: string[]
  priceRange: string
  onlyInStock: boolean
  onlyPersonalizable: boolean
  onlyNew: boolean
  sortBy: string
}

interface ProductFiltersProps {
  onFilterChange?: (filters: FilterState) => void
  totalResults?: number
  showSubcategories?: string[]
  selectedSubcategory?: string
  onSubcategoryChange?: (sub: string) => void
  /** 'dryfit' = cores dinâmicas + tamanhos | '3d' | 'geek' = só preço + subcategorias */
  mode?: 'dryfit' | '3d' | 'geek'
  /** Cores extraídas dos produtos carregados (usada quando mode === 'dryfit') */
  availableColors?: { name: string; hex: string }[]
}

export function ProductFilters({
  onFilterChange,
  totalResults = 0,
  showSubcategories,
  selectedSubcategory,
  onSubcategoryChange,
  mode,
  availableColors,
}: ProductFiltersProps) {
  const [filters, setFilters] = useState<FilterState>({
    colors: [],
    sizes: [],
    priceRange: '',
    onlyInStock: false,
    onlyPersonalizable: false,
    onlyNew: false,
    sortBy: 'relevance',
  })
  const [mobileOpen, setMobileOpen] = useState(false)
  const [openSection, setOpenSection] = useState<string[]>(['cores', 'tamanhos', 'preco'])

  // Derived display flags
  const showColors = mode !== '3d' && mode !== 'geek'
  const showSizes  = mode !== '3d' && mode !== 'geek'
  const showPersonalizable = !mode
  const colorsToShow = (mode === 'dryfit' && availableColors?.length) ? availableColors : []

  function updateFilter<K extends keyof FilterState>(key: K, value: FilterState[K]) {
    const updated = { ...filters, [key]: value }
    setFilters(updated)
    onFilterChange?.(updated)
  }

  function toggleColor(color: string) {
    updateFilter('colors', filters.colors.includes(color)
      ? filters.colors.filter(c => c !== color)
      : [...filters.colors, color])
  }

  function toggleSize(size: string) {
    updateFilter('sizes', filters.sizes.includes(size)
      ? filters.sizes.filter(s => s !== size)
      : [...filters.sizes, size])
  }

  function toggleSection(id: string) {
    setOpenSection(prev =>
      prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]
    )
  }

  function clearAll() {
    const cleared: FilterState = {
      colors: [], sizes: [], priceRange: '',
      onlyInStock: false, onlyPersonalizable: false, onlyNew: false, sortBy: 'relevance',
    }
    setFilters(cleared)
    onFilterChange?.(cleared)
  }

  const activeCount =
    filters.colors.length +
    filters.sizes.length +
    (filters.priceRange ? 1 : 0) +
    (filters.onlyInStock ? 1 : 0) +
    (filters.onlyPersonalizable ? 1 : 0) +
    (filters.onlyNew ? 1 : 0)

  const FilterContent = () => (
    <div className="space-y-0">
      {/* Sort */}
      <div className="pb-4 border-b border-white/5 mb-4">
        <label className="label-brand">Ordenar por</label>
        <select
          value={filters.sortBy}
          onChange={e => updateFilter('sortBy', e.target.value)}
          className="input-brand text-sm cursor-pointer"
          aria-label="Ordenar produtos"
        >
          <option value="relevance">Relevância</option>
          <option value="newest">Mais novos</option>
          <option value="price_asc">Menor preço</option>
          <option value="price_desc">Maior preço</option>
          <option value="bestseller">Mais vendidos</option>
        </select>
      </div>

      {/* Subcategories */}
      {showSubcategories && showSubcategories.length > 0 && (
        <div className="pb-4 border-b border-white/5 mb-4">
          <p className="label-brand mb-3">Categoria</p>
          <div className="space-y-1.5">
            <button
              onClick={() => onSubcategoryChange?.('')}
              className={cn(
                'w-full text-left text-sm py-1.5 px-2 transition-colors cursor-pointer',
                !selectedSubcategory
                  ? 'text-brand-red bg-brand-red/5'
                  : 'text-brand-gray-text hover:text-brand-white'
              )}
            >
              Todos
            </button>
            {showSubcategories.map(sub => (
              <button
                key={sub}
                onClick={() => onSubcategoryChange?.(sub)}
                className={cn(
                  'w-full text-left text-sm py-1.5 px-2 transition-colors cursor-pointer',
                  selectedSubcategory === sub
                    ? 'text-brand-red bg-brand-red/5'
                    : 'text-brand-gray-text hover:text-brand-white'
                )}
              >
                {sub}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Colors — only for dryfit (dynamic) or default mode */}
      {showColors && colorsToShow.length > 0 && (
        <FilterSection
          id="cores"
          title="Cor"
          open={openSection.includes('cores')}
          onToggle={() => toggleSection('cores')}
        >
          <div className="flex flex-wrap gap-2">
            {colorsToShow.map(color => (
              <button
                key={color.name}
                onClick={() => toggleColor(color.name)}
                className={cn(
                  'flex items-center gap-2 px-3 py-1.5 border text-xs transition-all cursor-pointer',
                  filters.colors.includes(color.name)
                    ? 'border-brand-red bg-brand-red/10 text-brand-white'
                    : 'border-white/10 text-brand-gray-text hover:border-white/30'
                )}
                title={color.name}
                aria-pressed={filters.colors.includes(color.name)}
              >
                <span
                  className="w-3 h-3 rounded-full border border-white/20 flex-shrink-0"
                  style={{ backgroundColor: color.hex }}
                />
                {color.name}
              </button>
            ))}
          </div>
        </FilterSection>
      )}

      {/* Sizes — only for dryfit or default mode */}
      {showSizes && (
        <FilterSection
          id="tamanhos"
          title="Tamanho"
          open={openSection.includes('tamanhos')}
          onToggle={() => toggleSection('tamanhos')}
        >
          <div className="flex flex-wrap gap-2">
            {SIZES_AVAILABLE.map(size => (
              <button
                key={size}
                onClick={() => toggleSize(size)}
                className={cn(
                  'w-11 h-11 border text-xs font-bold uppercase transition-all cursor-pointer',
                  filters.sizes.includes(size)
                    ? 'border-brand-red bg-brand-red/10 text-brand-red'
                    : 'border-white/10 text-brand-gray-text hover:border-white/30 hover:text-brand-white'
                )}
                aria-pressed={filters.sizes.includes(size)}
              >
                {size}
              </button>
            ))}
          </div>
        </FilterSection>
      )}

      {/* Price — always shown */}
      <FilterSection
        id="preco"
        title="Faixa de Preço"
        open={openSection.includes('preco')}
        onToggle={() => toggleSection('preco')}
      >
        <div className="space-y-2">
          {PRICE_RANGES.map(range => (
            <button
              key={range.label}
              onClick={() => updateFilter('priceRange', filters.priceRange === range.label ? '' : range.label)}
              className={cn(
                'w-full text-left text-sm px-3 py-2 border transition-all cursor-pointer',
                filters.priceRange === range.label
                  ? 'border-brand-red bg-brand-red/10 text-brand-white'
                  : 'border-white/5 text-brand-gray-text hover:border-white/20 hover:text-brand-white'
              )}
              aria-pressed={filters.priceRange === range.label}
            >
              {range.label}
            </button>
          ))}
        </div>
      </FilterSection>

      {/* Toggles */}
      <div className="pt-4 space-y-3">
        {([
          { key: 'onlyInStock', label: 'Apenas em estoque', show: true },
          { key: 'onlyPersonalizable', label: 'Personalizáveis', show: showPersonalizable },
          { key: 'onlyNew', label: 'Novidades', show: true },
        ] as const).filter(t => t.show).map(toggle => (
          <label key={toggle.key} className="flex items-center justify-between cursor-pointer group">
            <span className="text-sm text-brand-gray-text group-hover:text-brand-white transition-colors">
              {toggle.label}
            </span>
            <div
              onClick={() => updateFilter(toggle.key, !filters[toggle.key])}
              className={cn(
                'w-10 h-5 rounded-full relative transition-colors',
                filters[toggle.key] ? 'bg-brand-red' : 'bg-white/10'
              )}
              role="switch"
              aria-checked={filters[toggle.key]}
            >
              <div
                className={cn(
                  'absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform',
                  filters[toggle.key] ? 'translate-x-5' : 'translate-x-0.5'
                )}
              />
            </div>
          </label>
        ))}
      </div>
    </div>
  )

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden lg:block w-60 flex-shrink-0">
        <div className="sticky top-24">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <SlidersHorizontal size={14} className="text-brand-red" />
              <span className="text-xs font-bold uppercase tracking-wider text-brand-white">Filtros</span>
            </div>
            {activeCount > 0 && (
              <button
                onClick={clearAll}
                className="text-xs text-brand-red hover:text-brand-white transition-colors cursor-pointer flex items-center gap-1"
              >
                <X size={12} />
                Limpar ({activeCount})
              </button>
            )}
          </div>
          <FilterContent />
        </div>
      </aside>

      {/* Mobile filter button */}
      <div className="lg:hidden mb-4 flex items-center gap-3">
        <button
          onClick={() => setMobileOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 border border-white/10 text-sm text-brand-white hover:border-white/30 transition-colors cursor-pointer"
          aria-label="Abrir filtros"
        >
          <SlidersHorizontal size={16} className="text-brand-red" />
          Filtros
          {activeCount > 0 && (
            <span className="w-5 h-5 bg-brand-red text-white text-[10px] font-bold rounded-full flex items-center justify-center">
              {activeCount}
            </span>
          )}
        </button>
        <span className="text-sm text-brand-gray-text">
          {totalResults} produtos
        </span>
      </div>

      {/* Mobile filter drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/70 z-50 lg:hidden"
              onClick={() => setMobileOpen(false)}
            />
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="fixed bottom-0 left-0 right-0 bg-brand-graphite z-50 lg:hidden max-h-[85vh] overflow-y-auto rounded-t-lg"
            >
              <div className="sticky top-0 bg-brand-graphite flex items-center justify-between p-4 border-b border-white/10 z-10">
                <div className="flex items-center gap-2">
                  <SlidersHorizontal size={14} className="text-brand-red" />
                  <span className="text-sm font-bold uppercase tracking-wider text-brand-white">Filtros</span>
                </div>
                <div className="flex items-center gap-3">
                  {activeCount > 0 && (
                    <button onClick={clearAll} className="text-xs text-brand-red cursor-pointer">
                      Limpar ({activeCount})
                    </button>
                  )}
                  <button
                    onClick={() => setMobileOpen(false)}
                    className="p-1 text-brand-gray-text hover:text-brand-white cursor-pointer"
                    aria-label="Fechar filtros"
                  >
                    <X size={18} />
                  </button>
                </div>
              </div>
              <div className="p-4">
                <FilterContent />
              </div>
              <div className="sticky bottom-0 bg-brand-graphite p-4 border-t border-white/10">
                <button
                  onClick={() => setMobileOpen(false)}
                  className="btn-primary w-full justify-center"
                >
                  Ver {totalResults} produtos
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}

function FilterSection({
  id,
  title,
  open,
  onToggle,
  children,
}: {
  id: string
  title: string
  open: boolean
  onToggle: () => void
  children: React.ReactNode
}) {
  return (
    <div className="border-b border-white/5 py-4">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between mb-3 cursor-pointer group"
        aria-expanded={open}
      >
        <span className="text-xs font-bold uppercase tracking-wider text-brand-white group-hover:text-brand-red transition-colors">
          {title}
        </span>
        <ChevronDown
          size={14}
          className={cn(
            'text-brand-gray-text transition-transform duration-200',
            open ? 'rotate-180' : ''
          )}
        />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
