'use client'

import { useEffect, useState } from 'react'
import { AdminSidebar } from '@/components/admin/AdminSidebar'
import { Plus, Edit2, Trash2, X, Check } from 'lucide-react'
import { formatPrice } from '@/lib/utils'

type Kit = {
  id: string
  name: string
  slug: string
  description?: string
  minQty: number
  priceFrom: number
  audience?: string
  active: boolean
  items: Array<{ id: string; label: string }>
}

const INITIAL = { name: '', slug: '', description: '', minQty: 10, priceFrom: 49.90, audience: '', active: true, items: [] as string[] }

export default function KitsPage() {
  const [kits, setKits] = useState<Kit[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState<Kit | null>(null)
  const [form, setForm] = useState({ ...INITIAL })
  const [newItem, setNewItem] = useState('')
  const [saving, setSaving] = useState(false)

  async function load() {
    const data = await fetch('/api/admin/kits').then(r => r.json())
    setKits(data)
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  function openNew() {
    setEditing(null)
    setForm({ ...INITIAL })
    setShowModal(true)
  }

  function openEdit(k: Kit) {
    setEditing(k)
    setForm({ name: k.name, slug: k.slug, description: k.description ?? '', minQty: k.minQty, priceFrom: k.priceFrom, audience: k.audience ?? '', active: k.active, items: k.items.map(i => i.label) })
    setShowModal(true)
  }

  async function handleSave() {
    setSaving(true)
    const url = editing ? `/api/admin/kits/${editing.id}` : '/api/admin/kits'
    await fetch(url, { method: editing ? 'PUT' : 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
    await load()
    setShowModal(false)
    setSaving(false)
  }

  async function handleDelete(id: string) {
    if (!confirm('Deletar este kit?')) return
    await fetch(`/api/admin/kits/${id}`, { method: 'DELETE' })
    await load()
  }

  return (
    <div className="flex">
      <AdminSidebar />
      <main className="lg:ml-64 flex-1 p-4 sm:p-8 min-h-screen pt-16 lg:pt-0">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-black text-white uppercase tracking-widest" style={{ fontFamily: 'var(--font-bebas)' }}>
              Kits B2B
            </h1>
            <p className="text-white/40 text-sm mt-1">{kits.length} kit(s) cadastrado(s)</p>
          </div>
          <button onClick={openNew} className="flex items-center gap-2 bg-[#E10600] hover:bg-[#B80000] text-white px-4 py-2 text-sm font-bold uppercase tracking-wider transition-colors cursor-pointer">
            <Plus size={16} /> Novo Kit
          </button>
        </div>

        {loading ? (
          <p className="text-white/40 text-sm">Carregando...</p>
        ) : (
          <div className="grid gap-4">
            {kits.map(k => (
              <div key={k.id} className="bg-[#161616] border border-white/5 p-5">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className="text-white font-semibold">{k.name}</h3>
                      {k.audience && <span className="text-xs border border-white/10 px-2 py-0.5 text-white/40">{k.audience}</span>}
                      <span className={`text-xs px-2 py-0.5 ${k.active ? 'bg-green-400/10 text-green-400' : 'bg-red-400/10 text-red-400'}`}>
                        {k.active ? 'Ativo' : 'Inativo'}
                      </span>
                    </div>
                    <p className="text-sm text-white/50 mb-2">{k.description}</p>
                    <p className="text-[#E10600] font-bold text-sm">A partir de {formatPrice(k.priceFrom)} · Mín. {k.minQty} un.</p>
                    <ul className="mt-2 space-y-1">
                      {k.items.map(i => (
                        <li key={i.id} className="text-xs text-white/40 flex items-center gap-1.5">
                          <span className="w-1 h-1 bg-[#E10600] rounded-full flex-shrink-0" />
                          {i.label}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => openEdit(k)} className="p-2 text-white/40 hover:text-white cursor-pointer"><Edit2 size={16} /></button>
                    <button onClick={() => handleDelete(k.id)} className="p-2 text-white/40 hover:text-red-400 cursor-pointer"><Trash2 size={16} /></button>
                  </div>
                </div>
              </div>
            ))}
            {kits.length === 0 && <p className="text-white/30 text-sm">Nenhum kit cadastrado</p>}
          </div>
        )}

        {showModal && (
          <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
            <div className="bg-[#161616] border border-white/10 w-full max-w-lg max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between p-5 border-b border-white/10">
                <h2 className="text-white font-bold">{editing ? 'Editar Kit' : 'Novo Kit'}</h2>
                <button onClick={() => setShowModal(false)} className="text-white/40 hover:text-white cursor-pointer"><X size={20} /></button>
              </div>
              <div className="p-5 space-y-4">
                <Field label="Nome"><input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value, slug: e.target.value.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') }))} className={INPUT} /></Field>
                <Field label="Slug"><input value={form.slug} onChange={e => setForm(f => ({ ...f, slug: e.target.value }))} className={INPUT} /></Field>
                <Field label="Descrição"><textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={2} className={INPUT} /></Field>
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Público-alvo"><input value={form.audience} onChange={e => setForm(f => ({ ...f, audience: e.target.value }))} className={INPUT} /></Field>
                  <Field label="Qtd. Mínima"><input type="number" min="1" value={form.minQty} onChange={e => setForm(f => ({ ...f, minQty: parseInt(e.target.value) }))} className={INPUT} /></Field>
                </div>
                <Field label="Preço A Partir de">
                  <input type="number" step="0.01" value={form.priceFrom} onChange={e => setForm(f => ({ ...f, priceFrom: parseFloat(e.target.value) }))} className={INPUT} />
                </Field>
                <div className="flex items-center gap-2">
                  <input type="checkbox" checked={form.active} onChange={e => setForm(f => ({ ...f, active: e.target.checked }))} className="cursor-pointer" />
                  <span className="text-sm text-white/60">Ativo</span>
                </div>

                <div>
                  <p className="text-xs text-white/50 uppercase tracking-wider mb-2">Itens Inclusos</p>
                  <div className="space-y-2 mb-3">
                    {form.items.map((item, i) => (
                      <div key={i} className="flex items-center gap-2 bg-white/5 px-3 py-2">
                        <span className="text-sm text-white flex-1">{item}</span>
                        <button onClick={() => setForm(f => ({ ...f, items: f.items.filter((_, j) => j !== i) }))} className="text-white/30 hover:text-red-400 cursor-pointer"><X size={14} /></button>
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <input value={newItem} onChange={e => setNewItem(e.target.value)} onKeyDown={e => { if (e.key === 'Enter' && newItem) { setForm(f => ({ ...f, items: [...f.items, newItem] })); setNewItem('') } }} placeholder="Novo item..." className={`${INPUT} flex-1`} />
                    <button onClick={() => { if (newItem) { setForm(f => ({ ...f, items: [...f.items, newItem] })); setNewItem('') } }} className="px-3 bg-[#E10600] hover:bg-[#B80000] text-white cursor-pointer">
                      <Plus size={16} />
                    </button>
                  </div>
                </div>

                <div className="flex gap-3 pt-2">
                  <button onClick={() => setShowModal(false)} className="flex-1 border border-white/10 text-white/60 hover:text-white py-2 text-sm transition-colors cursor-pointer">Cancelar</button>
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

