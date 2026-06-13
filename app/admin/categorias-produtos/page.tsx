'use client'

import { useEffect, useState, useCallback } from 'react'
import { AdminSidebar } from '@/components/admin/AdminSidebar'
import { Plus, Trash2, GripVertical, Loader2 } from 'lucide-react'

type Subcategory = { id: string; name: string; sortOrder: number }

const TYPES = [
  {
    value: 'GEEK',
    label: 'Geek Store',
    color: 'text-yellow-400',
    border: 'border-yellow-400/20',
    bg: 'bg-yellow-400/5',
    badge: 'bg-yellow-400/10 text-yellow-400',
    suggested: ['Cards Avulsos', 'Booster Box', 'ETB', 'Starter Deck', 'Tin', 'Colecionáveis', 'Acessórios'],
  },
  {
    value: 'PRODUTO_3D',
    label: 'Produtos 3D',
    color: 'text-violet-400',
    border: 'border-violet-400/20',
    bg: 'bg-violet-400/5',
    badge: 'bg-violet-400/10 text-violet-400',
    suggested: ['Chaveiros', 'Fitness', 'Decoração', 'Brindes', 'Medalhas', 'Troféus', 'Acessórios'],
  },
]

function CategoryPanel({
  type,
}: {
  type: (typeof TYPES)[0]
}) {
  const [items, setItems] = useState<Subcategory[]>([])
  const [loading, setLoading] = useState(true)
  const [input, setInput] = useState('')
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    const data = await fetch(`/api/admin/product-subcategories?type=${type.value}`).then(r => r.json())
    setItems(Array.isArray(data) ? data : [])
    setLoading(false)
  }, [type.value])

  useEffect(() => { load() }, [load])

  async function handleAdd(name: string) {
    const trimmed = name.trim()
    if (!trimmed) return
    setSaving(true)
    const res = await fetch('/api/admin/product-subcategories', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ productType: type.value, name: trimmed }),
    })
    if (res.ok) {
      setInput('')
      await load()
    } else {
      const err = await res.json()
      alert(err.error ?? 'Erro ao criar categoria')
    }
    setSaving(false)
  }

  async function handleDelete(id: string, name: string) {
    if (!confirm(`Remover categoria "${name}"?`)) return
    setDeleting(id)
    await fetch(`/api/admin/product-subcategories/${id}`, { method: 'DELETE' })
    await load()
    setDeleting(null)
  }

  const missing = type.suggested.filter(s => !items.some(i => i.name === s))

  return (
    <div className={`border ${type.border} ${type.bg} p-6`}>
      <div className="flex items-center gap-3 mb-5">
        <span className={`text-xs font-bold uppercase tracking-[0.25em] ${type.color}`}>{type.label}</span>
        <span className={`text-[10px] px-2 py-0.5 font-bold ${type.badge}`}>
          {items.length} {items.length === 1 ? 'categoria' : 'categorias'}
        </span>
      </div>

      {/* Current categories */}
      {loading ? (
        <div className="flex items-center gap-2 text-white/30 text-sm py-4">
          <Loader2 size={14} className="animate-spin" /> Carregando...
        </div>
      ) : items.length === 0 ? (
        <p className="text-sm text-white/30 py-3 italic">Nenhuma categoria cadastrada ainda.</p>
      ) : (
        <ul className="space-y-1.5 mb-5">
          {items.map(item => (
            <li
              key={item.id}
              className="flex items-center gap-3 bg-black/30 border border-white/5 px-3 py-2.5 group"
            >
              <GripVertical size={13} className="text-white/15 flex-shrink-0" />
              <span className="flex-1 text-sm text-white/80">{item.name}</span>
              <button
                onClick={() => handleDelete(item.id, item.name)}
                disabled={deleting === item.id}
                className="opacity-0 group-hover:opacity-100 transition-opacity p-1 text-white/30 hover:text-red-400 cursor-pointer disabled:opacity-50"
                title="Remover categoria"
              >
                {deleting === item.id ? <Loader2 size={13} className="animate-spin" /> : <Trash2 size={13} />}
              </button>
            </li>
          ))}
        </ul>
      )}

      {/* Add new */}
      <div className="flex gap-2">
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleAdd(input)}
          placeholder="Nova categoria..."
          className="flex-1 bg-black/40 border border-white/10 text-white placeholder-white/20 px-3 py-2 text-sm focus:outline-none focus:border-white/30"
          disabled={saving}
        />
        <button
          onClick={() => handleAdd(input)}
          disabled={saving || !input.trim()}
          className="flex items-center gap-1.5 bg-[#E10600] hover:bg-[#B80000] text-white px-4 py-2 text-sm font-bold transition-colors disabled:opacity-50 cursor-pointer"
        >
          {saving ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
          Adicionar
        </button>
      </div>

      {/* Suggested missing categories */}
      {missing.length > 0 && (
        <div className="mt-4 pt-4 border-t border-white/5">
          <p className="text-[10px] text-white/30 uppercase tracking-wider mb-2">Sugestões para adicionar</p>
          <div className="flex flex-wrap gap-1.5">
            {missing.map(s => (
              <button
                key={s}
                onClick={() => handleAdd(s)}
                disabled={saving}
                className={`text-xs px-2.5 py-1 border cursor-pointer transition-colors hover:bg-white/10 disabled:opacity-50 ${type.border} text-white/40 hover:text-white/70`}
              >
                + {s}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default function CategoriasPage() {
  return (
    <div className="flex">
      <AdminSidebar />
      <main className="lg:ml-64 flex-1 p-4 sm:p-8 min-h-screen pt-16 lg:pt-8">
        <div className="mb-8">
          <p className="text-[#E10600] text-xs font-bold uppercase tracking-[0.3em] mb-1">Admin</p>
          <h1 className="text-4xl font-black text-white uppercase tracking-widest" style={{ fontFamily: 'var(--font-bebas)' }}>
            Categorias de Produtos
          </h1>
          <p className="text-sm text-white/40 mt-1">
            Gerencie as categorias que aparecem nos filtros das páginas Geek Store e Produtos 3D.
            As categorias cadastradas aqui são as únicas que aparecem na loja e no formulário de cadastro de produtos.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {TYPES.map(type => (
            <CategoryPanel key={type.value} type={type} />
          ))}
        </div>

        <div className="mt-8 border border-white/5 bg-white/2 p-5 text-sm text-white/40 leading-relaxed">
          <strong className="text-white/60">Como funciona:</strong> ao adicionar uma categoria aqui, ela aparece imediatamente
          no dropdown de &quot;Categoria / Subcategoria&quot; na hora de cadastrar ou editar um produto, e também nos filtros
          da lateral nas páginas da loja. Ao remover uma categoria, ela some dos filtros — mas produtos que já tinham
          essa categoria atribuída continuam com ela salva internamente.
        </div>
      </main>
    </div>
  )
}
