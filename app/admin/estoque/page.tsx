'use client'

import { useEffect, useState } from 'react'
import { AdminSidebar } from '@/components/admin/AdminSidebar'
import { Save, ChevronDown, ChevronRight, Search } from 'lucide-react'

/* ─────────────────────────── types ──────────────────────────── */
type StockItem = {
  id: string
  size: string
  quantity: number
  color: {
    id: string
    name: string
    hex: string
    base: { id: string; name: string; type: string }
  }
}

type BaseGrouped = {
  baseId: string
  baseName: string
  baseType: string
  colors: {
    colorId: string
    colorName: string
    colorHex: string
    sizes: StockItem[]
  }[]
}

type ApiVariant = {
  id: string
  color: string | null
  colorHex: string | null
  size: string | null
  stock: number
  active: boolean
}

type ApiProduct = {
  id: string
  name: string
  type: string
  variants: ApiVariant[]
}

type ProdGroup = {
  productId: string
  productName: string
  productType: string
  expanded: boolean
  colorGroups: {
    color: string
    colorHex: string | null
    variants: ApiVariant[]
  }[]
}

const SIZES = ['PP', 'P', 'M', 'G', 'GG', 'XGG']
const TYPE_LABELS: Record<string, string> = { DRYFIT: 'DryFit', PRODUTO_3D: '3D', GEEK: 'Geek' }
const PRODUCT_TYPES = ['TODOS', 'DRYFIT', 'PRODUTO_3D', 'GEEK']

/* ─────────────────────────── page ───────────────────────────── */
export default function EstoquePage() {
  /* shirt-base stock */
  const [stock, setStock] = useState<StockItem[]>([])
  const [baseLoading, setBaseLoading] = useState(true)
  const [baseEdits, setBaseEdits] = useState<Record<string, number>>({})
  const [baseSaving, setBaseSaving] = useState<string | null>(null)
  const [baseSearch, setBaseSearch] = useState('')

  /* product-variant stock */
  const [products, setProducts] = useState<ProdGroup[]>([])
  const [prodLoading, setProdLoading] = useState(true)
  const [prodEdits, setProdEdits] = useState<Record<string, number>>({})
  const [prodSaving, setProdSaving] = useState<string | null>(null)
  const [prodSearch, setProdSearch] = useState('')
  const [prodTypeFilter, setProdTypeFilter] = useState('TODOS')

  /* simple-stock (Geek/3D without variants) */
  const [simpleStockEdits, setSimpleStockEdits] = useState<Record<string, number>>({})
  const [simpleStockSaving, setSimpleStockSaving] = useState<string | null>(null)

  /* dryfit size-matrix edits — key: `${productId}|${color}|${size}` */
  const [dryfitEdits, setDryfitEdits] = useState<Record<string, number>>({})
  const [dryfitSaving, setDryfitSaving] = useState<string | null>(null)

  /* ── loaders ── */
  async function loadBase() {
    const data = await fetch('/api/admin/stock').then(r => r.json())
    setStock(data)
    setBaseLoading(false)
  }

  async function loadProducts() {
    const [dryfit, p3d, geek] = await Promise.all([
      fetch('/api/admin/products?type=DRYFIT').then(r => r.json()).catch(() => []),
      fetch('/api/admin/products?type=PRODUTO_3D').then(r => r.json()).catch(() => []),
      fetch('/api/admin/products?type=GEEK').then(r => r.json()).catch(() => []),
    ])

    const all: ApiProduct[] = [
      ...(Array.isArray(dryfit) ? dryfit : []),
      ...(Array.isArray(p3d) ? p3d : []),
      ...(Array.isArray(geek) ? geek : []),
    ]

    const seen = new Set<string>()
    const unique = all.filter(p => { if (seen.has(p.id)) return false; seen.add(p.id); return true })

    const grouped: ProdGroup[] = unique.map(p => {
      const colorMap = new Map<string, { hex: string | null; variants: ApiVariant[] }>()
      for (const v of p.variants) {
        const key = v.color ?? 'Padrão'
        if (!colorMap.has(key)) colorMap.set(key, { hex: v.colorHex, variants: [] })
        colorMap.get(key)!.variants.push(v)
      }
      return {
        productId: p.id,
        productName: p.name,
        productType: p.type,
        expanded: false,
        colorGroups: Array.from(colorMap.entries()).map(([color, val]) => ({
          color,
          colorHex: val.hex,
          variants: val.variants,
        })),
      }
    })

    // Preserve expanded state across reloads
    setProducts(prev => {
      const expandedMap = new Map(prev.map(p => [p.productId, p.expanded]))
      return grouped.map(p => ({ ...p, expanded: expandedMap.get(p.productId) ?? false }))
    })
    setProdLoading(false)
  }

  useEffect(() => { loadBase(); loadProducts() }, [])

  /* ── save all pending edits for a shirt-base color row ── */
  async function saveBaseRow(colorId: string, items: StockItem[]) {
    const toSave = items.filter(item => baseEdits[item.id] !== undefined)
    if (toSave.length === 0) return
    setBaseSaving(colorId)
    await Promise.all(toSave.map(item =>
      fetch('/api/admin/stock', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: item.id, quantity: baseEdits[item.id] }),
      })
    ))
    setBaseEdits(e => {
      const n = { ...e }
      toSave.forEach(item => delete n[item.id])
      return n
    })
    await loadBase()
    setBaseSaving(null)
  }

  /* ── save all pending DryFit edits for one product ── */
  async function saveDryfitProduct(prod: ProdGroup) {
    const keysToSave = Object.keys(dryfitEdits).filter(k => k.startsWith(`${prod.productId}|`))
    if (keysToSave.length === 0) return
    setDryfitSaving(prod.productId)
    await Promise.all(keysToSave.map(cellKey => {
      const parts = cellKey.split('|')
      const color = parts[1]
      const size = parts[2]
      const cg = prod.colorGroups.find(c => c.color === color)
      return fetch('/api/admin/product-variants', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: prod.productId,
          color,
          colorHex: cg?.colorHex ?? null,
          size,
          stock: dryfitEdits[cellKey],
        }),
      })
    }))
    setDryfitEdits(e => {
      const n = { ...e }
      keysToSave.forEach(k => delete n[k])
      return n
    })
    await loadProducts()
    setDryfitSaving(null)
  }

  /* ── save all pending prodEdits for one product ── */
  async function saveProdVariantsAll(prod: ProdGroup) {
    const toSave = prod.colorGroups
      .flatMap(cg => cg.variants)
      .filter(v => prodEdits[v.id] !== undefined)
    if (toSave.length === 0) return
    setProdSaving(prod.productId)
    await Promise.all(toSave.map(v =>
      fetch(`/api/admin/product-variants/${v.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stock: prodEdits[v.id] }),
      })
    ))
    setProdEdits(e => {
      const n = { ...e }
      toSave.forEach(v => delete n[v.id])
      return n
    })
    await loadProducts()
    setProdSaving(null)
  }

  /* ── save simple stock (Geek/3D with no variants) ── */
  async function saveSimpleStock(productId: string) {
    const stockVal = simpleStockEdits[productId]
    if (stockVal === undefined) return
    setSimpleStockSaving(productId)
    await fetch('/api/admin/product-variants', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ productId, stock: stockVal }),
    })
    setSimpleStockEdits(e => { const n = { ...e }; delete n[productId]; return n })
    await loadProducts()
    setSimpleStockSaving(null)
  }

  /* ── toggle product expansion ── */
  function toggleExpand(productId: string) {
    setProducts(prev => prev.map(p =>
      p.productId === productId ? { ...p, expanded: !p.expanded } : p
    ))
  }

  /* ── group shirt-base stock ── */
  const baseGrouped: BaseGrouped[] = []
  const baseMap = new Map<string, BaseGrouped>()
  for (const item of stock) {
    const b = item.color.base
    if (!baseMap.has(b.id)) {
      const g: BaseGrouped = { baseId: b.id, baseName: b.name, baseType: b.type, colors: [] }
      baseMap.set(b.id, g)
      baseGrouped.push(g)
    }
    const group = baseMap.get(b.id)!
    let colorGroup = group.colors.find(c => c.colorId === item.color.id)
    if (!colorGroup) {
      colorGroup = { colorId: item.color.id, colorName: item.color.name, colorHex: item.color.hex, sizes: [] }
      group.colors.push(colorGroup)
    }
    colorGroup.sizes.push(item)
  }

  const filteredBases = baseSearch
    ? baseGrouped.filter(b => b.baseName.toLowerCase().includes(baseSearch.toLowerCase()))
    : baseGrouped

  const filteredProducts = products.filter(p => {
    const matchType = prodTypeFilter === 'TODOS' || p.productType === prodTypeFilter
    const matchSearch = !prodSearch || p.productName.toLowerCase().includes(prodSearch.toLowerCase())
    return matchType && matchSearch
  })

  /* ─────────────────────────── render ───────────────────────── */
  return (
    <div className="flex">
      <AdminSidebar />
      <main className="lg:ml-64 flex-1 p-4 sm:p-8 min-h-screen pt-16 lg:pt-0">
        <div className="mb-8">
          <h1 className="text-2xl font-black text-white uppercase tracking-widest" style={{ fontFamily: 'var(--font-bebas)' }}>
            Controle de Estoque
          </h1>
          <p className="text-white/40 text-sm mt-1">Atualize as quantidades por cor e tamanho</p>
        </div>

        {/* ════ SECTION 1: Shirt Bases ════ */}
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xs font-bold uppercase tracking-widest text-white/30">
            Bases de Camisetas (Oversized / Camiseta)
          </h2>
          <div className="relative">
            <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-white/30" />
            <input
              value={baseSearch}
              onChange={e => setBaseSearch(e.target.value)}
              placeholder="Buscar base..."
              className="bg-black/40 border border-white/10 text-white text-xs pl-8 pr-3 py-1.5 w-40 focus:outline-none focus:border-white/25"
            />
          </div>
        </div>

        {baseLoading ? (
          <p className="text-white/40 text-sm mb-8">Carregando bases...</p>
        ) : (
          <div className="space-y-6 mb-12">
            {filteredBases.length === 0 && (
              <p className="text-white/30 text-sm">Nenhuma base encontrada.</p>
            )}
            {filteredBases.map(base => (
              <div key={base.baseId} className="bg-[#161616] border border-white/5">
                <div className="flex items-center justify-between px-5 py-3 border-b border-white/5">
                  <h3 className="text-white font-semibold">{base.baseName}</h3>
                  <span className="text-xs text-white/40 border border-white/10 px-2 py-0.5">{base.baseType}</span>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-white/5">
                        <th className="text-left text-xs text-white/40 uppercase tracking-wider px-5 py-2 w-40">Cor</th>
                        {SIZES.map(s => (
                          <th key={s} className="text-center text-xs text-white/40 uppercase tracking-wider px-2 py-2 w-20">{s}</th>
                        ))}
                        <th className="w-20" />
                      </tr>
                    </thead>
                    <tbody>
                      {base.colors.map(color => {
                        const rowHasChanges = color.sizes.some(item => baseEdits[item.id] !== undefined)
                        const rowSaving = baseSaving === color.colorId
                        return (
                          <tr key={color.colorId} className="border-b border-white/5 last:border-0">
                            <td className="px-5 py-2">
                              <div className="flex items-center gap-2">
                                <span className="w-3 h-3 rounded-full border border-white/20 flex-shrink-0" style={{ backgroundColor: color.colorHex }} />
                                <span className="text-white/70">{color.colorName}</span>
                              </div>
                            </td>
                            {SIZES.map(size => {
                              const item = color.sizes.find(s => s.size === size)
                              if (!item) return <td key={size} className="px-2 py-2 text-center text-white/20">–</td>
                              const val = baseEdits[item.id] ?? item.quantity
                              return (
                                <td key={size} className="px-2 py-2">
                                  <input
                                    type="number" min="0" value={val}
                                    onChange={e => setBaseEdits(prev => ({ ...prev, [item.id]: parseInt(e.target.value) || 0 }))}
                                    className={`w-14 text-center bg-black/40 border py-1 text-sm focus:outline-none ${
                                      val <= 0 ? 'border-red-400/50 text-red-400' :
                                      val <= 5 ? 'border-yellow-400/50 text-yellow-400' :
                                      'border-white/10 text-white'
                                    }`}
                                  />
                                </td>
                              )
                            })}
                            {/* Per-row save button */}
                            <td className="px-2 py-2">
                              {rowHasChanges && (
                                <button
                                  onClick={() => saveBaseRow(color.colorId, color.sizes)}
                                  disabled={rowSaving}
                                  className="flex items-center gap-1.5 px-3 py-1.5 bg-green-600/20 border border-green-400/30 text-green-400 text-xs cursor-pointer hover:bg-green-600/30 transition-colors disabled:opacity-40 whitespace-nowrap"
                                >
                                  <Save size={11} />
                                  {rowSaving ? 'Salvando...' : 'Salvar'}
                                </button>
                              )}
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ════ SECTION 2: DryFit / 3D / Geek Products ════ */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
          <h2 className="text-xs font-bold uppercase tracking-widest text-white/30">
            Produtos Cadastrados (DryFit / 3D / Geek)
          </h2>
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex gap-1">
              {PRODUCT_TYPES.map(t => (
                <button
                  key={t}
                  onClick={() => setProdTypeFilter(t)}
                  className={`px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider border transition-colors cursor-pointer ${
                    prodTypeFilter === t
                      ? 'border-brand-red bg-brand-red/10 text-white'
                      : 'border-white/10 text-white/40 hover:text-white/70 hover:border-white/20'
                  }`}
                >
                  {t === 'TODOS' ? 'Todos' : TYPE_LABELS[t] ?? t}
                </button>
              ))}
            </div>
            <div className="relative">
              <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-white/30" />
              <input
                value={prodSearch}
                onChange={e => setProdSearch(e.target.value)}
                placeholder="Buscar produto..."
                className="bg-black/40 border border-white/10 text-white text-xs pl-8 pr-3 py-1.5 w-44 focus:outline-none focus:border-white/25"
              />
            </div>
          </div>
        </div>

        {prodLoading ? (
          <p className="text-white/40 text-sm">Carregando produtos...</p>
        ) : filteredProducts.length === 0 ? (
          <p className="text-white/30 text-sm">
            {products.length === 0 ? 'Nenhum produto DryFit, 3D ou Geek cadastrado.' : 'Nenhum produto encontrado com esse filtro.'}
          </p>
        ) : (
          <div className="space-y-3">
            {filteredProducts.map(prod => {
              const totalStockAll = prod.colorGroups.reduce((s, cg) => s + cg.variants.reduce((ss, v) => ss + v.stock, 0), 0)
              const hasNoVariants = prod.colorGroups.length === 0
              const simpleVal = simpleStockEdits[prod.productId]
              const simpleChanged = simpleVal !== undefined
              const isDryfit = prod.productType === 'DRYFIT'

              /* pending change counts */
              const dryfitPending = Object.keys(dryfitEdits).filter(k => k.startsWith(`${prod.productId}|`)).length
              const prodPending = prod.colorGroups.flatMap(cg => cg.variants).filter(v => prodEdits[v.id] !== undefined).length

              return (
                <div key={prod.productId} className="bg-[#161616] border border-white/5">
                  {/* Product header */}
                  <button
                    onClick={() => toggleExpand(prod.productId)}
                    className="w-full flex items-center justify-between px-5 py-3 border-b border-white/5 hover:bg-white/[0.02] transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      {prod.expanded
                        ? <ChevronDown size={14} className="text-white/40" />
                        : <ChevronRight size={14} className="text-white/40" />
                      }
                      <span className="text-white font-semibold text-sm">{prod.productName}</span>
                      {hasNoVariants && !isDryfit && (
                        <span className="text-[9px] text-yellow-400/70 border border-yellow-400/20 px-1.5 py-0.5">Sem variantes</span>
                      )}
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-white/30">{totalStockAll} unid. total</span>
                      <span className="text-xs text-white/40 border border-white/10 px-2 py-0.5">
                        {TYPE_LABELS[prod.productType] ?? prod.productType}
                      </span>
                    </div>
                  </button>

                  {prod.expanded && (
                    <div className="p-4">

                      {/* ── DryFit: color × size matrix ── */}
                      {isDryfit && (
                        prod.colorGroups.length === 0 ? (
                          <p className="text-xs text-yellow-400/70 bg-yellow-400/5 border border-yellow-400/15 px-4 py-3">
                            Sem cores cadastradas. Adicione variantes de cor no cadastro do produto para gerenciar o estoque por tamanho.
                          </p>
                        ) : (
                          <>
                            <div className="overflow-x-auto">
                              <p className="text-[10px] text-white/30 uppercase tracking-widest mb-3">Estoque por Cor × Tamanho</p>
                              <table className="w-full text-sm min-w-[480px]">
                                <thead>
                                  <tr className="border-b border-white/5">
                                    <th className="text-left text-xs text-white/40 uppercase tracking-wider px-3 py-2 w-36">Cor</th>
                                    {SIZES.map(s => (
                                      <th key={s} className="text-center text-xs text-white/40 uppercase tracking-wider px-2 py-2 w-20">{s}</th>
                                    ))}
                                  </tr>
                                </thead>
                                <tbody>
                                  {prod.colorGroups.map(cg => (
                                    <tr key={cg.color} className="border-b border-white/5 last:border-0">
                                      <td className="px-3 py-2">
                                        <div className="flex items-center gap-2">
                                          {cg.colorHex && (
                                            <span className="w-3 h-3 rounded-full border border-white/20 flex-shrink-0" style={{ backgroundColor: cg.colorHex }} />
                                          )}
                                          <span className="text-white/70 text-xs">{cg.color}</span>
                                        </div>
                                      </td>
                                      {SIZES.map(size => {
                                        const existing = cg.variants.find(v => v.size === size)
                                        const cellKey = `${prod.productId}|${cg.color}|${size}`
                                        const currentVal = dryfitEdits[cellKey] ?? existing?.stock ?? 0
                                        return (
                                          <td key={size} className="px-2 py-2">
                                            <input
                                              type="number" min="0" value={currentVal}
                                              onChange={e => setDryfitEdits(prev => ({ ...prev, [cellKey]: parseInt(e.target.value) || 0 }))}
                                              className={`w-14 text-center bg-black/40 border py-1 text-sm focus:outline-none ${
                                                currentVal <= 0 ? 'border-red-400/50 text-red-400' :
                                                currentVal <= 5 ? 'border-yellow-400/50 text-yellow-400' :
                                                'border-white/10 text-white'
                                              }`}
                                            />
                                          </td>
                                        )
                                      })}
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>

                            {/* Batch save button for DryFit */}
                            <div className="flex items-center justify-end mt-4 pt-3 border-t border-white/5">
                              {dryfitPending > 0 ? (
                                <button
                                  onClick={() => saveDryfitProduct(prod)}
                                  disabled={dryfitSaving === prod.productId}
                                  className="flex items-center gap-2 px-4 py-2 bg-green-600/20 border border-green-400/30 text-green-400 text-sm font-semibold cursor-pointer hover:bg-green-600/30 transition-colors disabled:opacity-40"
                                >
                                  <Save size={14} />
                                  {dryfitSaving === prod.productId
                                    ? 'Salvando...'
                                    : `Salvar ${dryfitPending} alteraç${dryfitPending === 1 ? 'ão' : 'ões'}`}
                                </button>
                              ) : (
                                <span className="text-xs text-white/20">Sem alterações pendentes</span>
                              )}
                            </div>
                          </>
                        )
                      )}

                      {/* ── 3D / Geek: simple or color-only variants ── */}
                      {!isDryfit && (
                        hasNoVariants ? (
                          <div>
                            <p className="text-xs text-white/40 mb-2">
                              Produto sem variantes. Defina o estoque total:
                            </p>
                            <div className="flex items-center gap-3">
                              <input
                                type="number"
                                min="0"
                                placeholder="Qtd. em estoque"
                                value={simpleVal ?? ''}
                                onChange={e => setSimpleStockEdits(prev => ({ ...prev, [prod.productId]: parseInt(e.target.value) || 0 }))}
                                className={`w-24 text-center border py-1.5 text-sm focus:outline-none bg-black/40 ${
                                  (simpleVal ?? 0) === 0 ? 'border-white/10 text-white/40' : 'border-white/20 text-white'
                                }`}
                              />
                              {simpleChanged && (
                                <button
                                  onClick={() => saveSimpleStock(prod.productId)}
                                  disabled={simpleStockSaving === prod.productId}
                                  className="flex items-center gap-1.5 px-3 py-1.5 bg-green-600/20 border border-green-400/30 text-green-400 text-xs cursor-pointer hover:bg-green-600/30 transition-colors disabled:opacity-40"
                                >
                                  <Save size={11} />
                                  Salvar
                                </button>
                              )}
                              <p className="text-xs text-white/30">
                                Após salvar, aparecerá como variante &quot;Padrão&quot;.
                              </p>
                            </div>
                          </div>
                        ) : (
                          <>
                            <div className="space-y-4">
                              {prod.colorGroups.map(cg => (
                                <div key={cg.color}>
                                  <div className="flex items-center gap-2 mb-2">
                                    {cg.colorHex && (
                                      <span className="w-3 h-3 rounded-full border border-white/20 flex-shrink-0" style={{ backgroundColor: cg.colorHex }} />
                                    )}
                                    <span className="text-xs font-semibold text-white/60 uppercase tracking-wider">{cg.color}</span>
                                  </div>
                                  <div className="flex flex-wrap gap-3">
                                    {cg.variants.map(v => {
                                      const currentVal = prodEdits[v.id] ?? v.stock
                                      return (
                                        <div key={v.id} className="flex flex-col items-center gap-1">
                                          {v.size && (
                                            <span className="text-[10px] text-white/40 uppercase">{v.size}</span>
                                          )}
                                          <input
                                            type="number" min="0" value={currentVal}
                                            onChange={e => setProdEdits(prev => ({ ...prev, [v.id]: parseInt(e.target.value) || 0 }))}
                                            className={`w-16 text-center bg-black/40 border py-1 text-sm focus:outline-none ${
                                              currentVal <= 0 ? 'border-red-400/50 text-red-400' :
                                              currentVal <= 5 ? 'border-yellow-400/50 text-yellow-400' :
                                              'border-white/10 text-white'
                                            }`}
                                          />
                                          {!v.active && <span className="text-[9px] text-yellow-400/60">Inativo</span>}
                                        </div>
                                      )
                                    })}
                                  </div>
                                </div>
                              ))}
                            </div>

                            {/* Batch save button for 3D/Geek variants */}
                            <div className="flex items-center justify-end mt-4 pt-3 border-t border-white/5">
                              {prodPending > 0 ? (
                                <button
                                  onClick={() => saveProdVariantsAll(prod)}
                                  disabled={prodSaving === prod.productId}
                                  className="flex items-center gap-2 px-4 py-2 bg-green-600/20 border border-green-400/30 text-green-400 text-sm font-semibold cursor-pointer hover:bg-green-600/30 transition-colors disabled:opacity-40"
                                >
                                  <Save size={14} />
                                  {prodSaving === prod.productId
                                    ? 'Salvando...'
                                    : `Salvar ${prodPending} alteraç${prodPending === 1 ? 'ão' : 'ões'}`}
                                </button>
                              ) : (
                                <span className="text-xs text-white/20">Sem alterações pendentes</span>
                              )}
                            </div>
                          </>
                        )
                      )}

                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </main>
    </div>
  )
}
