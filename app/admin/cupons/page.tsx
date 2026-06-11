'use client'

import { useEffect, useState } from 'react'
import { AdminSidebar } from '@/components/admin/AdminSidebar'
import { Plus, Save, Trash2, X, Infinity, AlertCircle, Truck } from 'lucide-react'
import { formatPrice } from '@/lib/utils'

type Coupon = {
  id: string
  code: string
  description: string | null
  discount: number
  freeShipping: boolean
  maxUses: number | null
  usedCount: number
  active: boolean
  createdAt: string
}

const INPUT = 'w-full bg-black/40 border border-white/10 text-white px-3 py-2 text-sm focus:outline-none focus:border-white/30 transition-colors placeholder-white/20'

function StatusBadge({ coupon }: { coupon: Coupon }) {
  if (!coupon.active) return <span className="px-2 py-0.5 text-[10px] bg-red-400/10 border border-red-400/20 text-red-400">Inativo</span>
  if (coupon.maxUses !== null && coupon.usedCount >= coupon.maxUses) return (
    <span className="px-2 py-0.5 text-[10px] bg-yellow-400/10 border border-yellow-400/20 text-yellow-400">Esgotado</span>
  )
  return <span className="px-2 py-0.5 text-[10px] bg-green-400/10 border border-green-400/20 text-green-400">Ativo</span>
}

export default function CuponsPage() {
  const [coupons, setCoupons] = useState<Coupon[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const [form, setForm] = useState({
    code: '',
    description: '',
    discount: 10,
    freeShipping: false,
    maxUses: '',   // empty = unlimited
    active: true,
  })

  async function load() {
    const data = await fetch('/api/admin/coupons').then(r => r.json())
    setCoupons(Array.isArray(data) ? data : [])
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  function openCreate() {
    setEditId(null)
    setForm({ code: '', description: '', discount: 10, freeShipping: false, maxUses: '', active: true })
    setError('')
    setShowForm(true)
  }

  function openEdit(c: Coupon) {
    setEditId(c.id)
    setForm({
      code: c.code,
      description: c.description ?? '',
      discount: c.discount,
      freeShipping: c.freeShipping ?? false,
      maxUses: c.maxUses !== null ? String(c.maxUses) : '',
      active: c.active,
    })
    setError('')
    setShowForm(true)
  }

  async function handleSave() {
    if (!form.code.trim()) { setError('Código obrigatório.'); return }
    if (form.discount < 0 || form.discount > 100) { setError('Desconto deve ser entre 0 e 100%.'); return }
    if (form.discount === 0 && !form.freeShipping) { setError('Informe um desconto ou ative o frete grátis.'); return }

    setSaving(true)
    setError('')
    try {
      const body = {
        code: form.code.trim().toUpperCase(),
        description: form.description || null,
        discount: form.discount,
        freeShipping: form.freeShipping,
        maxUses: form.maxUses ? parseInt(form.maxUses) : null,
        active: form.active,
      }
      const url = editId ? `/api/admin/coupons/${editId}` : '/api/admin/coupons'
      const method = editId ? 'PUT' : 'POST'
      const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
      const data = await res.json()
      if (!res.ok) { setError(data.error ?? 'Erro ao salvar.'); return }
      await load()
      setShowForm(false)
    } catch {
      setError('Erro de conexão.')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(id: string, code: string) {
    if (!confirm(`Excluir o cupom "${code}"? Esta ação não pode ser desfeita.`)) return
    await fetch(`/api/admin/coupons/${id}`, { method: 'DELETE' })
    await load()
  }

  async function toggleActive(coupon: Coupon) {
    await fetch(`/api/admin/coupons/${coupon.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ active: !coupon.active }),
    })
    await load()
  }

  return (
    <div className="flex">
      <AdminSidebar />
      <main className="lg:ml-64 flex-1 p-4 sm:p-8 min-h-screen pt-16 lg:pt-0">
        {/* Header */}
        <div className="flex items-start justify-between mb-8">
          <div>
            <h1 className="text-2xl font-black text-white uppercase tracking-widest" style={{ fontFamily: 'var(--font-bebas)' }}>
              Cupons de Desconto
            </h1>
            <p className="text-white/40 text-sm mt-1">Gerencie códigos de desconto para os clientes</p>
          </div>
          <button
            onClick={openCreate}
            className="flex items-center gap-2 bg-brand-red text-white text-sm font-bold px-4 py-2.5 hover:bg-brand-red-dark transition-colors cursor-pointer"
          >
            <Plus size={16} />
            Novo Cupom
          </button>
        </div>

        {/* Create/Edit form */}
        {showForm && (
          <div className="bg-[#161616] border border-white/5 p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-bold text-white uppercase tracking-wider">
                {editId ? 'Editar Cupom' : 'Novo Cupom'}
              </h2>
              <button onClick={() => setShowForm(false)} className="p-1 text-white/40 hover:text-white cursor-pointer">
                <X size={16} />
              </button>
            </div>

            {error && (
              <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/30 text-red-400 text-sm px-3 py-2 mb-4">
                <AlertCircle size={14} />
                {error}
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="text-xs text-white/40 uppercase tracking-wider block mb-1.5">Código *</label>
                <input
                  value={form.code}
                  onChange={e => setForm(f => ({ ...f, code: e.target.value.toUpperCase() }))}
                  placeholder="EX: CAMISETAS10"
                  className={INPUT}
                  style={{ textTransform: 'uppercase' }}
                />
              </div>
              <div>
                <label className="text-xs text-white/40 uppercase tracking-wider block mb-1.5">
                  Desconto (%)
                  {form.freeShipping && form.discount === 0 && <span className="ml-1 text-white/30 normal-case">(0 = sem desconto)</span>}
                </label>
                <input
                  type="number" min="0" max="100"
                  value={form.discount}
                  onChange={e => setForm(f => ({ ...f, discount: parseFloat(e.target.value) || 0 }))}
                  className={INPUT}
                />
              </div>
              <div>
                <label className="text-xs text-white/40 uppercase tracking-wider block mb-1.5">Máx. usos (vazio = ilimitado)</label>
                <input
                  type="number" min="1"
                  value={form.maxUses}
                  onChange={e => setForm(f => ({ ...f, maxUses: e.target.value }))}
                  placeholder="Ilimitado"
                  className={INPUT}
                />
              </div>
              <div className="sm:col-span-2">
                <label className="text-xs text-white/40 uppercase tracking-wider block mb-1.5">Descrição (opcional)</label>
                <input
                  value={form.description}
                  onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                  placeholder="Breve descrição do cupom"
                  className={INPUT}
                />
              </div>

              {/* Frete Grátis toggle */}
              <div className="flex flex-col gap-2 justify-end">
                <label className="flex items-center gap-2.5 cursor-pointer group">
                  <div
                    onClick={() => setForm(f => ({ ...f, freeShipping: !f.freeShipping }))}
                    className={`w-9 h-5 rounded-full transition-colors cursor-pointer relative flex-shrink-0 ${form.freeShipping ? 'bg-cyan-500' : 'bg-white/10'}`}
                  >
                    <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${form.freeShipping ? 'translate-x-4' : 'translate-x-0.5'}`} />
                  </div>
                  <div>
                    <span className={`text-sm font-medium transition-colors ${form.freeShipping ? 'text-cyan-400' : 'text-white/60 group-hover:text-white/80'}`}>
                      Frete Grátis
                    </span>
                    <p className="text-[10px] text-white/30 mt-0.5 leading-tight">O cupom zera o frete do pedido</p>
                  </div>
                </label>
              </div>

              <div className="flex items-end">
                <label className="flex items-center gap-2 cursor-pointer">
                  <div
                    onClick={() => setForm(f => ({ ...f, active: !f.active }))}
                    className={`w-9 h-5 rounded-full transition-colors cursor-pointer relative ${form.active ? 'bg-green-500' : 'bg-white/10'}`}
                  >
                    <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform ${form.active ? 'translate-x-4' : 'translate-x-0.5'}`} />
                  </div>
                  <span className="text-sm text-white/70">Cupom ativo</span>
                </label>
              </div>
            </div>

            <div className="flex gap-3 mt-4">
              <button
                onClick={() => setShowForm(false)}
                className="px-4 py-2 text-sm border border-white/10 text-white/50 hover:text-white hover:border-white/20 transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex items-center gap-2 px-5 py-2 bg-brand-red text-white text-sm font-bold hover:bg-brand-red-dark transition-colors cursor-pointer disabled:opacity-50"
              >
                {saving ? (
                  <span className="animate-pulse">Salvando...</span>
                ) : (
                  <><Save size={14} /> Salvar Cupom</>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Coupons table */}
        {loading ? (
          <p className="text-white/40 text-sm">Carregando cupons...</p>
        ) : coupons.length === 0 ? (
          <div className="text-center py-16 text-white/20">
            <p className="text-4xl mb-3">🏷️</p>
            <p className="font-semibold">Nenhum cupom cadastrado</p>
            <p className="text-sm mt-1">Crie o primeiro cupom de desconto</p>
          </div>
        ) : (
          <div className="bg-[#161616] border border-white/5 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/5">
                    <th className="text-left text-xs text-white/40 uppercase tracking-wider px-5 py-3">Código</th>
                    <th className="text-left text-xs text-white/40 uppercase tracking-wider px-4 py-3">Benefícios</th>
                    <th className="text-left text-xs text-white/40 uppercase tracking-wider px-4 py-3">Usos</th>
                    <th className="text-left text-xs text-white/40 uppercase tracking-wider px-4 py-3">Limite</th>
                    <th className="text-left text-xs text-white/40 uppercase tracking-wider px-4 py-3">Status</th>
                    <th className="text-left text-xs text-white/40 uppercase tracking-wider px-4 py-3">Descrição</th>
                    <th className="text-center text-xs text-white/40 uppercase tracking-wider px-4 py-3">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {coupons.map(coupon => {
                    const pct = coupon.maxUses ? (coupon.usedCount / coupon.maxUses) * 100 : 0
                    return (
                      <tr key={coupon.id} className="border-b border-white/5 last:border-0 hover:bg-white/2 transition-colors">
                        <td className="px-5 py-3">
                          <span className="font-mono font-bold text-white tracking-wider">{coupon.code}</span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex flex-col gap-1">
                            {coupon.discount > 0 && (
                              <span className="text-brand-red font-bold">{coupon.discount}% off</span>
                            )}
                            {coupon.freeShipping && (
                              <span className="flex items-center gap-1 text-cyan-400 text-xs font-semibold">
                                <Truck size={11} /> Frete Grátis
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div>
                            <span className="text-white">{coupon.usedCount}</span>
                            {coupon.maxUses !== null && (
                              <div className="w-20 h-1 bg-white/10 mt-1">
                                <div
                                  className="h-full"
                                  style={{
                                    width: `${Math.min(pct, 100)}%`,
                                    backgroundColor: pct >= 100 ? '#EF4444' : pct >= 80 ? '#F59E0B' : '#4ade80'
                                  }}
                                />
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-white/50">
                          {coupon.maxUses !== null ? coupon.maxUses : (
                            <Infinity size={14} className="text-white/30" />
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <StatusBadge coupon={coupon} />
                        </td>
                        <td className="px-4 py-3 text-white/40 text-xs max-w-[160px] truncate">
                          {coupon.description ?? '—'}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2 justify-center">
                            <button
                              onClick={() => openEdit(coupon)}
                              className="text-xs text-white/50 hover:text-white border border-white/10 hover:border-white/20 px-2 py-1 transition-colors cursor-pointer"
                            >
                              Editar
                            </button>
                            <button
                              onClick={() => toggleActive(coupon)}
                              className={`text-xs border px-2 py-1 transition-colors cursor-pointer ${
                                coupon.active
                                  ? 'text-yellow-400/70 border-yellow-400/20 hover:text-yellow-400 hover:border-yellow-400/40'
                                  : 'text-green-400/70 border-green-400/20 hover:text-green-400 hover:border-green-400/40'
                              }`}
                            >
                              {coupon.active ? 'Desativar' : 'Ativar'}
                            </button>
                            <button
                              onClick={() => handleDelete(coupon.id, coupon.code)}
                              className="p-1 text-white/20 hover:text-red-400 transition-colors cursor-pointer"
                              aria-label="Excluir"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Summary */}
        {coupons.length > 0 && (
          <div className="mt-4 text-xs text-white/30">
            Total de cupons: {coupons.length} ·{' '}
            Ativos: {coupons.filter(c => c.active && (c.maxUses === null || c.usedCount < c.maxUses)).length} ·{' '}
            Usos totais: {coupons.reduce((s, c) => s + c.usedCount, 0)}
          </div>
        )}
      </main>
    </div>
  )
}
