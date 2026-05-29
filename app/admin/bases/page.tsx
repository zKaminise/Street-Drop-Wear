'use client'

import { useEffect, useState } from 'react'
import { AdminSidebar } from '@/components/admin/AdminSidebar'
import { Plus, Edit2, Trash2, X, Check } from 'lucide-react'
import { formatPrice } from '@/lib/utils'

type ColorEntry = { id?: string; name: string; hex: string; active?: boolean }
type Base = {
  id: string
  name: string
  type: string
  basePrice: number
  active: boolean
  description?: string
  colors: Array<ColorEntry & { id: string; stock?: Array<{ size: string; quantity: number }> }>
}

const INITIAL_FORM = { name: '', type: 'OVERSIZED', basePrice: 89.90, description: '', active: true, colors: [] as ColorEntry[] }

export default function BasesPage() {
  const [bases, setBases] = useState<Base[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState<Base | null>(null)
  const [form, setForm] = useState(INITIAL_FORM)
  const [newColor, setNewColor] = useState({ name: '', hex: '#000000' })
  const [saving, setSaving] = useState(false)

  async function load() {
    const data = await fetch('/api/admin/bases').then(r => r.json())
    setBases(data)
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  function openNew() {
    setEditing(null)
    setForm(INITIAL_FORM)
    setShowModal(true)
  }

  function openEdit(base: Base) {
    setEditing(base)
    setForm({
      name: base.name, type: base.type, basePrice: base.basePrice,
      description: base.description ?? '', active: base.active,
      colors: base.colors.map(c => ({ id: c.id, name: c.name, hex: c.hex, active: c.active ?? true })),
    })
    setShowModal(true)
  }

  function addColor() {
    if (!newColor.name) return
    setForm(f => ({ ...f, colors: [...f.colors, { ...newColor }] }))
    setNewColor({ name: '', hex: '#000000' })
  }

  function removeColor(i: number) {
    setForm(f => ({ ...f, colors: f.colors.filter((_, j) => j !== i) }))
  }

  async function handleSave() {
    setSaving(true)
    const url = editing ? `/api/admin/bases/${editing.id}` : '/api/admin/bases'
    const method = editing ? 'PUT' : 'POST'
    await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
    await load()
    setShowModal(false)
    setSaving(false)
  }

  async function handleDelete(id: string) {
    if (!confirm('Deletar esta base? Todas as combinações serão removidas.')) return
    await fetch(`/api/admin/bases/${id}`, { method: 'DELETE' })
    await load()
  }

  return (
    <div className="flex">
      <AdminSidebar />
      <main className="lg:ml-64 flex-1 p-4 sm:p-8 min-h-screen pt-16 lg:pt-0">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-black text-white uppercase tracking-widest" style={{ fontFamily: 'var(--font-bebas)' }}>
              Bases de Camisetas
            </h1>
            <p className="text-white/40 text-sm mt-1">Gerencie modelos base para personalização</p>
          </div>
          <button onClick={openNew} className="flex items-center gap-2 bg-[#E10600] hover:bg-[#B80000] text-white px-4 py-2 text-sm font-bold uppercase tracking-wider transition-colors cursor-pointer">
            <Plus size={16} /> Nova Base
          </button>
        </div>

        {loading ? (
          <p className="text-white/40 text-sm">Carregando...</p>
        ) : (
          <div className="grid gap-4">
            {bases.map(base => (
              <div key={base.id} className="bg-[#161616] border border-white/5 p-5">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className="text-white font-semibold">{base.name}</h3>
                      <span className="text-xs px-2 py-0.5 border border-white/10 text-white/40">{base.type}</span>
                      <span className={`text-xs px-2 py-0.5 ${base.active ? 'bg-green-400/10 text-green-400' : 'bg-red-400/10 text-red-400'}`}>
                        {base.active ? 'Ativo' : 'Inativo'}
                      </span>
                    </div>
                    <p className="text-[#E10600] font-bold">{formatPrice(base.basePrice)}</p>
                    {base.description && <p className="text-white/40 text-sm mt-1">{base.description}</p>}
                    <div className="flex flex-wrap gap-2 mt-3">
                      {base.colors.map(c => (
                        <div key={c.id} className="flex items-center gap-1.5 bg-white/5 px-2 py-1 text-xs text-white/60">
                          <span className="w-3 h-3 rounded-full border border-white/20" style={{ backgroundColor: c.hex }} />
                          {c.name}
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => openEdit(base)} className="p-2 text-white/40 hover:text-white transition-colors cursor-pointer">
                      <Edit2 size={16} />
                    </button>
                    <button onClick={() => handleDelete(base.id)} className="p-2 text-white/40 hover:text-red-400 transition-colors cursor-pointer">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
            {bases.length === 0 && <p className="text-white/30 text-sm">Nenhuma base cadastrada</p>}
          </div>
        )}

        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
            <div className="bg-[#161616] border border-white/10 w-full max-w-xl max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between p-5 border-b border-white/10">
                <h2 className="text-white font-bold">{editing ? 'Editar Base' : 'Nova Base'}</h2>
                <button onClick={() => setShowModal(false)} className="text-white/40 hover:text-white cursor-pointer"><X size={20} /></button>
              </div>
              <div className="p-5 space-y-4">
                <Field label="Nome">
                  <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className={INPUT} />
                </Field>
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Tipo">
                    <select value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))} className={INPUT}>
                      <option value="OVERSIZED">OVERSIZED</option>
                      <option value="CAMISETA">CAMISETA</option>
                    </select>
                  </Field>
                  <Field label="Preço Base">
                    <input type="number" step="0.01" value={form.basePrice} onChange={e => setForm(f => ({ ...f, basePrice: parseFloat(e.target.value) }))} className={INPUT} />
                  </Field>
                </div>
                <Field label="Descrição">
                  <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={2} className={INPUT} />
                </Field>
                <div className="flex items-center gap-2">
                  <input type="checkbox" id="active" checked={form.active} onChange={e => setForm(f => ({ ...f, active: e.target.checked }))} className="cursor-pointer" />
                  <label htmlFor="active" className="text-sm text-white/60 cursor-pointer">Ativo</label>
                </div>

                {/* Colors */}
                <div>
                  <p className="text-xs text-white/50 uppercase tracking-wider mb-2">Cores</p>
                  <div className="space-y-2 mb-3">
                    {form.colors.map((c, i) => (
                      <div key={i} className="flex items-center gap-2 bg-white/5 px-3 py-2">
                        <span className="w-4 h-4 rounded-full border border-white/20 flex-shrink-0" style={{ backgroundColor: c.hex }} />
                        <span className="text-sm text-white flex-1">{c.name}</span>
                        <span className="text-xs text-white/30">{c.hex}</span>
                        <button onClick={() => removeColor(i)} className="text-white/30 hover:text-red-400 cursor-pointer"><X size={14} /></button>
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <input placeholder="Nome da cor" value={newColor.name} onChange={e => setNewColor(n => ({ ...n, name: e.target.value }))} className={`${INPUT} flex-1`} />
                    <input type="color" value={newColor.hex} onChange={e => setNewColor(n => ({ ...n, hex: e.target.value }))} className="w-10 h-10 border border-white/10 bg-black/40 cursor-pointer p-0.5" />
                    <button onClick={addColor} className="px-3 bg-[#E10600] hover:bg-[#B80000] text-white cursor-pointer">
                      <Plus size={16} />
                    </button>
                  </div>
                </div>

                <div className="flex gap-3 pt-2">
                  <button onClick={() => setShowModal(false)} className="flex-1 border border-white/10 text-white/60 hover:text-white py-2 text-sm transition-colors cursor-pointer">
                    Cancelar
                  </button>
                  <button onClick={handleSave} disabled={saving} className="flex-1 bg-[#E10600] hover:bg-[#B80000] text-white py-2 text-sm font-bold transition-colors disabled:opacity-60 cursor-pointer flex items-center justify-center gap-2">
                    <Check size={16} /> {saving ? 'Salvando...' : 'Salvar'}
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

const INPUT = 'w-full bg-black/40 border border-white/10 text-white placeholder-white/20 px-3 py-2 text-sm focus:outline-none focus:border-[#E10600]/60'

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="text-xs text-white/50 uppercase tracking-wider mb-1 block">{label}</label>
      {children}
    </div>
  )
}

