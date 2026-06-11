'use client'

import { useCallback, useEffect, useState } from 'react'
import { AdminSidebar } from '@/components/admin/AdminSidebar'
import { Plus, Edit2, Trash2, X, Check, Tag, Stamp } from 'lucide-react'

type Category = {
  id: string
  name: string
  slug: string
  active: boolean
  sortOrder: number
  _count: { stamps: number }
}

const INPUT = 'w-full bg-black/40 border border-white/10 text-white placeholder-white/20 px-3 py-2 text-sm focus:outline-none focus:border-[#E10600]/60'

export default function CategoriasEstampasPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState<Category | null>(null)
  const [form, setForm] = useState({ name: '', slug: '', active: true, sortOrder: 0 })
  const [saving, setSaving] = useState(false)

  const load = useCallback(async () => {
    const data = await fetch('/api/admin/stamp-categories').then(r => r.json())
    setCategories(Array.isArray(data) ? data : [])
    setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

  function openNew() {
    setEditing(null)
    setForm({ name: '', slug: '', active: true, sortOrder: categories.length * 10 })
    setShowModal(true)
  }

  function openEdit(c: Category) {
    setEditing(c)
    setForm({ name: c.name, slug: c.slug, active: c.active, sortOrder: c.sortOrder })
    setShowModal(true)
  }

  function handleNameChange(name: string) {
    const slug = name.toLowerCase()
      .normalize('NFD').replace(/[̀-ͯ]/g, '')
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9-]/g, '')
    setForm(f => ({ ...f, name, ...(editing ? {} : { slug }) }))
  }

  async function handleSave() {
    if (!form.name.trim() || !form.slug.trim()) return
    setSaving(true)
    try {
      const url = editing ? `/api/admin/stamp-categories/${editing.id}` : '/api/admin/stamp-categories'
      const res = await fetch(url, {
        method: editing ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (!res.ok) {
        const err = await res.json()
        alert(err.error ?? 'Erro ao salvar')
        return
      }
      await load()
      setShowModal(false)
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(c: Category) {
    if (c._count.stamps > 0) {
      if (!confirm(`Esta categoria tem ${c._count.stamps} estampa(s) vinculada(s). Ao excluir, as estampas ficarao sem categoria. Continuar?`)) return
    } else {
      if (!confirm(`Excluir categoria "${c.name}"?`)) return
    }
    await fetch(`/api/admin/stamp-categories/${c.id}`, { method: 'DELETE' })
    await load()
  }

  async function toggleActive(c: Category) {
    await fetch(`/api/admin/stamp-categories/${c.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...c, active: !c.active, _count: undefined }),
    })
    await load()
  }

  return (
    <div className="flex">
      <AdminSidebar />
      <main className="lg:ml-64 flex-1 p-4 sm:p-8 min-h-screen pt-16 lg:pt-0">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-black text-white uppercase tracking-widest flex items-center gap-3" style={{ fontFamily: 'var(--font-bebas)' }}>
              <Tag size={22} className="text-[#E10600]" />
              Categorias de Estampas
            </h1>
            <p className="text-white/40 text-sm mt-1">
              Organize as estampas em grupos para facilitar a escolha do cliente
            </p>
          </div>
          <button
            onClick={openNew}
            className="flex items-center gap-2 bg-[#E10600] hover:bg-[#B80000] text-white px-4 py-2 text-sm font-bold uppercase tracking-wider transition-colors cursor-pointer"
          >
            <Plus size={16} /> Nova Categoria
          </button>
        </div>

        {/* How it works */}
        <div className="bg-blue-500/5 border border-blue-500/20 p-4 mb-6 text-sm text-blue-300/70 max-w-2xl">
          <p className="font-semibold text-blue-300 mb-1">Como funciona:</p>
          <ul className="space-y-0.5 list-disc list-inside text-[12px]">
            <li>Crie categorias aqui (ex: Anime, Grecia Antiga, Streetwear, Minimalista)</li>
            <li>Ao cadastrar ou editar uma estampa, selecione a categoria dela</li>
            <li>No site, o cliente primeiro escolhe a categoria, depois ve apenas as estampas daquela categoria</li>
            <li>Isso evita uma lista enorme de estampas e melhora a experiencia do cliente</li>
          </ul>
        </div>

        {loading ? (
          <p className="text-white/40 text-sm">Carregando...</p>
        ) : categories.length === 0 ? (
          <div className="text-center py-16">
            <Tag size={40} className="text-white/10 mx-auto mb-4" />
            <p className="text-white/30 text-sm">Nenhuma categoria criada ainda</p>
            <p className="text-white/20 text-xs mt-1">Clique em "Nova Categoria" para comecar</p>
          </div>
        ) : (
          <div className="space-y-2 max-w-2xl">
            {categories.map((c, i) => (
              <div
                key={c.id}
                className={`flex items-center gap-4 p-4 border transition-colors ${
                  c.active ? 'bg-[#161616] border-white/5' : 'bg-[#111]/60 border-white/5 opacity-60'
                }`}
              >
                {/* Sort order badge */}
                <span className="w-7 h-7 flex items-center justify-center bg-white/5 text-white/30 text-xs font-mono flex-shrink-0">
                  {i + 1}
                </span>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-white font-semibold text-sm">{c.name}</p>
                    <span className="text-[10px] text-white/25 font-mono">{c.slug}</span>
                  </div>
                  <div className="flex items-center gap-3 mt-0.5">
                    <span className="flex items-center gap-1 text-[11px] text-white/40">
                      <Stamp size={11} />
                      {c._count.stamps} estampa{c._count.stamps !== 1 ? 's' : ''}
                    </span>
                    <span className={`text-[10px] px-1.5 py-0.5 ${c.active ? 'bg-green-400/10 text-green-400' : 'bg-white/5 text-white/25'}`}>
                      {c.active ? 'Ativa' : 'Inativa'}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 flex-shrink-0">
                  <button
                    onClick={() => toggleActive(c)}
                    title={c.active ? 'Desativar' : 'Ativar'}
                    className={`w-8 h-8 flex items-center justify-center text-xs transition-colors cursor-pointer border ${
                      c.active
                        ? 'border-green-400/20 text-green-400 hover:bg-green-400/10'
                        : 'border-white/10 text-white/30 hover:text-white'
                    }`}
                  >
                    <Check size={13} />
                  </button>
                  <button
                    onClick={() => openEdit(c)}
                    className="w-8 h-8 flex items-center justify-center text-white/30 hover:text-white border border-white/10 cursor-pointer transition-colors"
                  >
                    <Edit2 size={13} />
                  </button>
                  <button
                    onClick={() => handleDelete(c)}
                    className="w-8 h-8 flex items-center justify-center text-white/30 hover:text-red-400 border border-white/10 cursor-pointer transition-colors"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
            <div className="bg-[#161616] border border-white/10 w-full max-w-md">
              <div className="flex items-center justify-between p-5 border-b border-white/10">
                <h2 className="text-white font-bold">
                  {editing ? 'Editar Categoria' : 'Nova Categoria'}
                </h2>
                <button onClick={() => setShowModal(false)} className="text-white/40 hover:text-white cursor-pointer">
                  <X size={20} />
                </button>
              </div>
              <div className="p-5 space-y-4">
                <div>
                  <label className="text-xs text-white/50 uppercase tracking-wider mb-1 block">Nome da Categoria</label>
                  <input
                    value={form.name}
                    onChange={e => handleNameChange(e.target.value)}
                    placeholder="Ex: Anime, Grecia Antiga, Streetwear..."
                    className={INPUT}
                    autoFocus
                  />
                </div>

                <div>
                  <label className="text-xs text-white/50 uppercase tracking-wider mb-1 block">Slug (URL)</label>
                  <input
                    value={form.slug}
                    onChange={e => setForm(f => ({ ...f, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '') }))}
                    placeholder="anime"
                    className={INPUT}
                  />
                  <p className="text-[10px] text-white/20 mt-1">Gerado automaticamente do nome. Nao altere sem necessidade.</p>
                </div>

                <div>
                  <label className="text-xs text-white/50 uppercase tracking-wider mb-1 block">Ordem de exibicao</label>
                  <input
                    type="number"
                    min={0}
                    step={10}
                    value={form.sortOrder}
                    onChange={e => setForm(f => ({ ...f, sortOrder: Number(e.target.value) }))}
                    className={INPUT}
                  />
                  <p className="text-[10px] text-white/20 mt-1">Numeros menores aparecem primeiro. Use multiplos de 10 (0, 10, 20...).</p>
                </div>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.active}
                    onChange={e => setForm(f => ({ ...f, active: e.target.checked }))}
                  />
                  <span className="text-sm text-white/60">Ativa (visivel no site)</span>
                </label>

                <div className="flex gap-3 pt-2">
                  <button
                    onClick={() => setShowModal(false)}
                    className="flex-1 border border-white/10 text-white/60 hover:text-white py-2 text-sm transition-colors cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={saving || !form.name.trim() || !form.slug.trim()}
                    className="flex-1 bg-[#E10600] hover:bg-[#B80000] text-white py-2 text-sm font-bold transition-colors disabled:opacity-60 cursor-pointer flex items-center justify-center gap-2"
                  >
                    <Check size={16} />
                    {saving ? 'Salvando...' : 'Salvar'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
