'use client'

import { useEffect, useState } from 'react'
import { AdminSidebar } from '@/components/admin/AdminSidebar'
import { Save } from 'lucide-react'

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

type Grouped = {
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

const SIZES = ['PP', 'P', 'M', 'G', 'GG', 'XGG']

export default function EstoquePage() {
  const [stock, setStock] = useState<StockItem[]>([])
  const [loading, setLoading] = useState(true)
  const [edits, setEdits] = useState<Record<string, number>>({})
  const [saving, setSaving] = useState<string | null>(null)

  async function load() {
    const data = await fetch('/api/admin/stock').then(r => r.json())
    setStock(data)
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  async function saveItem(id: string) {
    if (edits[id] === undefined) return
    setSaving(id)
    await fetch('/api/admin/stock', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, quantity: edits[id] }),
    })
    setEdits(e => { const n = { ...e }; delete n[id]; return n })
    await load()
    setSaving(null)
  }

  // Group stock by base > color
  const grouped: Grouped[] = []
  const baseMap = new Map<string, Grouped>()

  for (const item of stock) {
    const b = item.color.base
    if (!baseMap.has(b.id)) {
      const g: Grouped = { baseId: b.id, baseName: b.name, baseType: b.type, colors: [] }
      baseMap.set(b.id, g)
      grouped.push(g)
    }
    const group = baseMap.get(b.id)!
    let colorGroup = group.colors.find(c => c.colorId === item.color.id)
    if (!colorGroup) {
      colorGroup = { colorId: item.color.id, colorName: item.color.name, colorHex: item.color.hex, sizes: [] }
      group.colors.push(colorGroup)
    }
    colorGroup.sizes.push(item)
  }

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

        {loading ? (
          <p className="text-white/40 text-sm">Carregando...</p>
        ) : (
          <div className="space-y-6">
            {grouped.map(base => (
              <div key={base.baseId} className="bg-[#161616] border border-white/5">
                <div className="flex items-center justify-between px-5 py-3 border-b border-white/5">
                  <h2 className="text-white font-semibold">{base.baseName}</h2>
                  <span className="text-xs text-white/40 border border-white/10 px-2 py-0.5">{base.baseType}</span>
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-white/5">
                        <th className="text-left text-xs text-white/40 uppercase tracking-wider px-5 py-2 w-40">Cor</th>
                        {SIZES.map(s => (
                          <th key={s} className="text-center text-xs text-white/40 uppercase tracking-wider px-2 py-2 w-20">{s}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {base.colors.map(color => (
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
                            const val = edits[item.id] ?? item.quantity
                            const changed = edits[item.id] !== undefined
                            return (
                              <td key={size} className="px-2 py-2">
                                <div className="flex items-center gap-1 justify-center">
                                  <input
                                    type="number"
                                    min="0"
                                    value={val}
                                    onChange={e => setEdits(prev => ({ ...prev, [item.id]: parseInt(e.target.value) || 0 }))}
                                    className={`w-14 text-center bg-black/40 border py-1 text-sm focus:outline-none ${
                                      val <= 0 ? 'border-red-400/50 text-red-400' :
                                      val <= 5 ? 'border-yellow-400/50 text-yellow-400' :
                                      'border-white/10 text-white'
                                    }`}
                                  />
                                  {changed && (
                                    <button
                                      onClick={() => saveItem(item.id)}
                                      disabled={saving === item.id}
                                      className="p-1 text-green-400 hover:text-green-300 cursor-pointer disabled:opacity-40"
                                    >
                                      <Save size={12} />
                                    </button>
                                  )}
                                </div>
                              </td>
                            )
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}

