'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { AdminSidebar } from '@/components/admin/AdminSidebar'
import { Plus, Edit2, Trash2, X, Check, Zap, Upload, ImageIcon, Loader2 } from 'lucide-react'
import Image from 'next/image'
import { formatPrice } from '@/lib/utils'

type Product = {
  id: string
  name: string
  slug: string
  type: string
  price: number
  originalPrice?: number
  active: boolean
  isNew: boolean
  isFeatured: boolean
  rating: number
  reviewCount: number
  isFlashSale: boolean
  flashSalePrice?: number
  flashSaleEndsAt?: string
  imageUrl?: string
  hoverImageUrl?: string
  description?: string
  material?: string
}

const PRODUCT_TYPES = [
  { value: 'DRYFIT', label: 'DryFit' },
  { value: 'PRODUTO_3D', label: 'Produto 3D' },
  { value: 'GEEK', label: 'Geek Store' },
]

const INITIAL: Partial<Product> = {
  name: '', slug: '', type: 'DRYFIT', price: 79.90, originalPrice: undefined,
  description: '', material: '', isNew: false, isFeatured: false, active: true,
  isFlashSale: false, flashSalePrice: undefined, flashSaleEndsAt: '',
  imageUrl: '', hoverImageUrl: '',
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

export default function ProdutosPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [filterType, setFilterType] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState<Product | null>(null)
  const [form, setForm] = useState<Partial<Product>>({ ...INITIAL })
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState<string | null>(null)
  const fileMainRef  = useRef<HTMLInputElement>(null)
  const fileHoverRef = useRef<HTMLInputElement>(null)

  async function handleFileUpload(file: File, field: 'imageUrl' | 'hoverImageUrl') {
    setUploading(field)
    try {
      const fd = new FormData()
      fd.append('file', file)
      fd.append('folder', 'products')
      const res  = await fetch('/api/admin/upload', { method: 'POST', body: fd })
      const data = await res.json()
      if (data.url) setForm(f => ({ ...f, [field]: data.url }))
      else alert(data.error ?? 'Erro ao fazer upload')
    } catch { alert('Erro ao fazer upload') }
    finally { setUploading(null) }
  }

  const load = useCallback(async () => {
    const data = await fetch(`/api/admin/products${filterType ? `?type=${filterType}` : ''}`).then(r => r.json())
    setProducts((data as Product[]).filter(p => ['DRYFIT', 'PRODUTO_3D', 'GEEK'].includes(p.type)))
    setLoading(false)
  }, [filterType])

  useEffect(() => { load() }, [load])

  function openNew() {
    setEditing(null)
    setForm({ ...INITIAL })
    setShowModal(true)
  }

  function openEdit(p: Product) {
    setEditing(p)
    setForm({
      name: p.name, slug: p.slug, type: p.type, price: p.price,
      originalPrice: p.originalPrice, description: p.description ?? '',
      material: p.material ?? '', isNew: p.isNew, isFeatured: p.isFeatured, active: p.active,
      isFlashSale: p.isFlashSale,
      flashSalePrice: p.flashSalePrice,
      flashSaleEndsAt: p.flashSaleEndsAt ? p.flashSaleEndsAt.slice(0, 16) : '',
      imageUrl: p.imageUrl ?? '', hoverImageUrl: p.hoverImageUrl ?? '',
    })
    setShowModal(true)
  }

  async function handleSave() {
    setSaving(true)
    const payload = {
      ...form,
      originalPrice: form.originalPrice || null,
      flashSalePrice: form.flashSalePrice || null,
      flashSaleEndsAt: form.flashSaleEndsAt ? new Date(form.flashSaleEndsAt as string).toISOString() : null,
      imageUrl: form.imageUrl || null,
      hoverImageUrl: form.hoverImageUrl || null,
    }
    const url = editing ? `/api/admin/products/${editing.id}` : '/api/admin/products'
    await fetch(url, { method: editing ? 'PUT' : 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
    await load()
    setShowModal(false)
    setSaving(false)
  }

  async function handleDelete(id: string) {
    if (!confirm('Deletar este produto?')) return
    await fetch(`/api/admin/products/${id}`, { method: 'DELETE' })
    await load()
  }

  async function toggleFlashSale(p: Product) {
    await fetch(`/api/admin/products/${p.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...p, isFlashSale: !p.isFlashSale }),
    })
    await load()
  }

  const TYPE_LABEL: Record<string, string> = { DRYFIT: 'DryFit', PRODUTO_3D: '3D', GEEK: 'Geek' }

  return (
    <div className="flex">
      <AdminSidebar />
      <main className="lg:ml-64 flex-1 p-4 sm:p-8 min-h-screen pt-16 lg:pt-0">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-black text-white uppercase tracking-widest" style={{ fontFamily: 'var(--font-bebas)' }}>
              Produtos
            </h1>
            <p className="text-white/40 text-sm mt-1">DryFit, 3D e Geek Store · Gerenciar flash sales e imagens</p>
          </div>
          <button onClick={openNew} className="flex items-center gap-2 bg-[#E10600] hover:bg-[#B80000] text-white px-4 py-2 text-sm font-bold uppercase tracking-wider transition-colors cursor-pointer">
            <Plus size={16} /> Novo Produto
          </button>
        </div>

        {/* Type filter */}
        <div className="flex gap-2 mb-6">
          {[{ value: '', label: 'Todos' }, ...PRODUCT_TYPES].map(t => (
            <button
              key={t.value}
              onClick={() => setFilterType(t.value)}
              className={`px-3 py-1.5 text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer ${filterType === t.value ? 'bg-[#E10600] text-white' : 'border border-white/10 text-white/50 hover:text-white'}`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {loading ? (
          <p className="text-white/40 text-sm">Carregando...</p>
        ) : (
          <div className="bg-[#161616] border border-white/5">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/5">
                  {['Nome', 'Tipo', 'Preço', 'Flash Sale', 'Status', ''].map(h => (
                    <th key={h} className="text-left text-xs text-white/40 uppercase tracking-wider px-4 py-3">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {products.map(p => (
                  <tr key={p.id} className="border-b border-white/5 last:border-0 hover:bg-white/3 transition-colors">
                    <td className="px-4 py-3">
                      <p className="text-white font-medium">{p.name}</p>
                      <p className="text-xs text-white/30 font-mono">{p.slug}</p>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs border border-white/10 px-2 py-0.5 text-white/50">{TYPE_LABEL[p.type] ?? p.type}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-white font-semibold">{formatPrice(p.price)}</span>
                      {p.originalPrice && <span className="text-white/30 line-through text-xs ml-2">{formatPrice(p.originalPrice)}</span>}
                      {p.isFlashSale && p.flashSalePrice && (
                        <div className="flex items-center gap-1 mt-0.5">
                          <Zap size={10} className="text-yellow-400" />
                          <span className="text-yellow-400 text-xs font-bold">{formatPrice(p.flashSalePrice)}</span>
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => toggleFlashSale(p)}
                        className={`flex items-center gap-1.5 text-xs px-2 py-1 transition-colors cursor-pointer ${
                          p.isFlashSale
                            ? 'bg-yellow-500/20 text-yellow-400 hover:bg-yellow-500/30'
                            : 'border border-white/10 text-white/30 hover:border-yellow-400/40 hover:text-yellow-400/60'
                        }`}
                        title="Clique para alternar flash sale"
                      >
                        <Zap size={10} />
                        {p.isFlashSale ? 'Ativo' : 'Off'}
                      </button>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-0.5 ${p.active ? 'bg-green-400/10 text-green-400' : 'bg-red-400/10 text-red-400'}`}>
                        {p.active ? 'Ativo' : 'Inativo'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button onClick={() => openEdit(p)} className="p-1 text-white/30 hover:text-white cursor-pointer"><Edit2 size={14} /></button>
                        <button onClick={() => handleDelete(p.id)} className="p-1 text-white/30 hover:text-red-400 cursor-pointer"><Trash2 size={14} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
                {products.length === 0 && (
                  <tr><td colSpan={6} className="px-4 py-8 text-center text-white/30 text-sm">Nenhum produto cadastrado</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
            <div className="bg-[#161616] border border-white/10 w-full max-w-lg max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between p-5 border-b border-white/10">
                <h2 className="text-white font-bold">{editing ? 'Editar Produto' : 'Novo Produto'}</h2>
                <button onClick={() => setShowModal(false)} className="text-white/40 hover:text-white cursor-pointer"><X size={20} /></button>
              </div>
              <div className="p-5 space-y-4">
                <Field label="Nome">
                  <input
                    value={form.name ?? ''}
                    onChange={e => setForm(f => ({
                      ...f, name: e.target.value,
                      slug: editing ? f.slug : e.target.value.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
                    }))}
                    className={INPUT}
                    placeholder="Nome do produto"
                  />
                </Field>
                <Field label="Slug (URL)">
                  <input value={form.slug ?? ''} onChange={e => setForm(f => ({ ...f, slug: e.target.value }))} className={INPUT} placeholder="slug-do-produto" />
                </Field>
                <Field label="Tipo">
                  <select value={form.type ?? 'DRYFIT'} onChange={e => setForm(f => ({ ...f, type: e.target.value }))} className={INPUT}>
                    {PRODUCT_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                  </select>
                </Field>

                {/* Prices */}
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Preço Normal (R$)">
                    <input type="number" step="0.01" min="0" value={form.price ?? ''} onChange={e => setForm(f => ({ ...f, price: parseFloat(e.target.value) }))} className={INPUT} />
                  </Field>
                  <Field label="Preço Original / De (R$)">
                    <input type="number" step="0.01" min="0" value={form.originalPrice ?? ''} onChange={e => setForm(f => ({ ...f, originalPrice: e.target.value ? parseFloat(e.target.value) : undefined }))} className={INPUT} placeholder="Opcional" />
                  </Field>
                </div>

                {/* Flash Sale */}
                <div className="border border-yellow-500/20 bg-yellow-500/5 p-4 space-y-3">
                  <div className="flex items-center gap-3">
                    <Zap size={14} className="text-yellow-400" />
                    <span className="text-sm font-bold text-yellow-400 uppercase tracking-wider">Flash Sale</span>
                    <label className="ml-auto flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" checked={form.isFlashSale ?? false} onChange={e => setForm(f => ({ ...f, isFlashSale: e.target.checked }))} />
                      <span className="text-sm text-white/60">Ativar</span>
                    </label>
                  </div>
                  {form.isFlashSale && (
                    <div className="grid grid-cols-2 gap-3">
                      <Field label="Preço Flash Sale (R$)">
                        <input type="number" step="0.01" min="0" value={form.flashSalePrice ?? ''} onChange={e => setForm(f => ({ ...f, flashSalePrice: e.target.value ? parseFloat(e.target.value) : undefined }))} className={INPUT} />
                      </Field>
                      <Field label="Término da promoção">
                        <input type="datetime-local" value={(form.flashSaleEndsAt as string) ?? ''} onChange={e => setForm(f => ({ ...f, flashSaleEndsAt: e.target.value }))} className={INPUT} />
                      </Field>
                    </div>
                  )}
                </div>

                {/* Images */}
                <div className="border border-white/5 p-4 space-y-4">
                  <p className="text-xs text-white/40 uppercase tracking-wider">Imagens do Card</p>

                  {/* Main image upload */}
                  <Field label="Imagem principal">
                    <div className="flex items-start gap-3">
                      <div className="w-16 h-16 bg-black/40 border border-white/10 flex items-center justify-center overflow-hidden flex-shrink-0">
                        {form.imageUrl ? (
                          <Image src={form.imageUrl} alt="Preview" width={64} height={64} className="w-full h-full object-contain" unoptimized />
                        ) : (
                          <ImageIcon size={20} className="text-white/20" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <input ref={fileMainRef} type="file" accept="image/*" className="hidden"
                          onChange={e => { const f = e.target.files?.[0]; if (f) handleFileUpload(f, 'imageUrl'); if (fileMainRef.current) fileMainRef.current.value = '' }} />
                        <button type="button" disabled={uploading === 'imageUrl'}
                          onClick={() => fileMainRef.current?.click()}
                          className="flex items-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 text-white/70 hover:text-white text-xs px-3 py-2 transition-colors cursor-pointer disabled:opacity-50">
                          {uploading === 'imageUrl' ? <><Loader2 size={13} className="animate-spin" /> Enviando...</> : <><Upload size={13} /> Escolher imagem</>}
                        </button>
                        {form.imageUrl && <p className="text-[10px] text-white/25 mt-1 truncate">{form.imageUrl}</p>}
                      </div>
                    </div>
                  </Field>

                  {/* Hover image upload */}
                  <Field label="Imagem hover (ao passar o mouse)">
                    <div className="flex items-start gap-3">
                      <div className="w-16 h-16 bg-black/40 border border-white/10 flex items-center justify-center overflow-hidden flex-shrink-0">
                        {form.hoverImageUrl ? (
                          <Image src={form.hoverImageUrl} alt="Hover Preview" width={64} height={64} className="w-full h-full object-contain" unoptimized />
                        ) : (
                          <ImageIcon size={20} className="text-white/20" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <input ref={fileHoverRef} type="file" accept="image/*" className="hidden"
                          onChange={e => { const f = e.target.files?.[0]; if (f) handleFileUpload(f, 'hoverImageUrl'); if (fileHoverRef.current) fileHoverRef.current.value = '' }} />
                        <button type="button" disabled={uploading === 'hoverImageUrl'}
                          onClick={() => fileHoverRef.current?.click()}
                          className="flex items-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 text-white/70 hover:text-white text-xs px-3 py-2 transition-colors cursor-pointer disabled:opacity-50">
                          {uploading === 'hoverImageUrl' ? <><Loader2 size={13} className="animate-spin" /> Enviando...</> : <><Upload size={13} /> Escolher imagem</>}
                        </button>
                        {form.hoverImageUrl && <p className="text-[10px] text-white/25 mt-1 truncate">{form.hoverImageUrl}</p>}
                      </div>
                    </div>
                  </Field>
                  <p className="text-[10px] text-white/20">JPG, PNG, WebP ou SVG · máx. 5 MB</p>
                </div>

                <Field label="Descrição">
                  <textarea value={form.description ?? ''} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={2} className={INPUT} placeholder="Descrição do produto..." />
                </Field>
                <Field label="Material / Composição">
                  <input value={form.material ?? ''} onChange={e => setForm(f => ({ ...f, material: e.target.value }))} className={INPUT} placeholder="Ex: 100% Poliéster" />
                </Field>

                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={form.isNew ?? false} onChange={e => setForm(f => ({ ...f, isNew: e.target.checked }))} />
                    <span className="text-sm text-white/60">Novo</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={form.isFeatured ?? false} onChange={e => setForm(f => ({ ...f, isFeatured: e.target.checked }))} />
                    <span className="text-sm text-white/60">Destaque</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={form.active ?? true} onChange={e => setForm(f => ({ ...f, active: e.target.checked }))} />
                    <span className="text-sm text-white/60">Ativo</span>
                  </label>
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

