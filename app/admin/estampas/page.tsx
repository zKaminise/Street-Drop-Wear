'use client'

import { useEffect, useRef, useState } from 'react'
import { AdminSidebar } from '@/components/admin/AdminSidebar'
import { Plus, Edit2, Trash2, X, Check, Upload, ImageIcon, Loader2 } from 'lucide-react'
import Image from 'next/image'
import { formatPrice } from '@/lib/utils'

type Stamp = {
  id: string
  name: string
  slug: string
  category?: string
  imageUrl: string
  extraPrice: number
  allowedFor: string
  active: boolean
}

const INITIAL: Omit<Stamp, 'id'> = {
  name: '', slug: '', category: '', imageUrl: '/stamps/placeholder.svg',
  extraPrice: 0, allowedFor: 'BOTH', active: true,
}

export default function EstampasPage() {
  const [stamps, setStamps] = useState<Stamp[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState<Stamp | null>(null)
  const [form, setForm] = useState({ ...INITIAL })
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [search, setSearch] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  async function load() {
    const data = await fetch('/api/admin/stamps').then(r => r.json())
    setStamps(data)
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  function openNew() {
    setEditing(null)
    setForm({ ...INITIAL })
    setShowModal(true)
  }

  function openEdit(s: Stamp) {
    setEditing(s)
    setForm({ name: s.name, slug: s.slug, category: s.category ?? '', imageUrl: s.imageUrl, extraPrice: s.extraPrice, allowedFor: s.allowedFor, active: s.active })
    setShowModal(true)
  }

  async function handleSave() {
    setSaving(true)
    const url = editing ? `/api/admin/stamps/${editing.id}` : '/api/admin/stamps'
    await fetch(url, { method: editing ? 'PUT' : 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
    await load()
    setShowModal(false)
    setSaving(false)
  }

  async function handleDelete(id: string) {
    if (!confirm('Deletar esta estampa?')) return
    await fetch(`/api/admin/stamps/${id}`, { method: 'DELETE' })
    await load()
  }

  async function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    try {
      const fd = new FormData()
      fd.append('file', file)
      fd.append('folder', 'stamps')
      const res = await fetch('/api/admin/upload', { method: 'POST', body: fd })
      const data = await res.json()
      if (data.url) {
        setForm(f => ({ ...f, imageUrl: data.url }))
      } else {
        alert(data.error ?? 'Erro ao fazer upload')
      }
    } catch {
      alert('Erro ao fazer upload da imagem')
    } finally {
      setUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  const filtered = stamps.filter(s => !search || s.name.toLowerCase().includes(search.toLowerCase()) || (s.category ?? '').toLowerCase().includes(search.toLowerCase()))

  return (
    <div className="flex">
      <AdminSidebar />
      <main className="lg:ml-64 flex-1 p-4 sm:p-8 min-h-screen pt-16 lg:pt-0">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-black text-white uppercase tracking-widest" style={{ fontFamily: 'var(--font-bebas)' }}>
              Estampas
            </h1>
            <p className="text-white/40 text-sm mt-1">{stamps.length} estampa(s) cadastrada(s)</p>
          </div>
          <button onClick={openNew} className="flex items-center gap-2 bg-[#E10600] hover:bg-[#B80000] text-white px-4 py-2 text-sm font-bold uppercase tracking-wider transition-colors cursor-pointer">
            <Plus size={16} /> Nova Estampa
          </button>
        </div>

        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Buscar estampa..."
          className="w-full max-w-sm bg-[#161616] border border-white/10 text-white placeholder-white/20 px-4 py-2 text-sm mb-6 focus:outline-none focus:border-[#E10600]/60"
        />

        {loading ? (
          <p className="text-white/40 text-sm">Carregando...</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {filtered.map(s => (
              <div key={s.id} className={`bg-[#161616] border p-4 ${s.active ? 'border-white/5' : 'border-white/5 opacity-60'}`}>
                <div className="aspect-square bg-black/40 border border-white/5 mb-3 flex items-center justify-center overflow-hidden">
                  <StampPreview stamp={s} />
                </div>
                <p className="text-sm text-white font-medium truncate">{s.name}</p>
                <p className="text-xs text-white/40 mb-1">{s.category ?? '–'} • {s.allowedFor}</p>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-[#E10600] font-bold">
                    {s.extraPrice > 0 ? `+${formatPrice(s.extraPrice)}` : 'Grátis'}
                  </span>
                  <div className="flex gap-1">
                    <button onClick={() => openEdit(s)} className="p-1.5 text-white/30 hover:text-white cursor-pointer"><Edit2 size={13} /></button>
                    <button onClick={() => handleDelete(s.id)} className="p-1.5 text-white/30 hover:text-red-400 cursor-pointer"><Trash2 size={13} /></button>
                  </div>
                </div>
              </div>
            ))}
            {filtered.length === 0 && <p className="text-white/30 text-sm col-span-full">Nenhuma estampa encontrada</p>}
          </div>
        )}

        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
            <div className="bg-[#161616] border border-white/10 w-full max-w-lg max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between p-5 border-b border-white/10">
                <h2 className="text-white font-bold">{editing ? 'Editar Estampa' : 'Nova Estampa'}</h2>
                <button onClick={() => setShowModal(false)} className="text-white/40 hover:text-white cursor-pointer"><X size={20} /></button>
              </div>
              <div className="p-5 space-y-4">
                <Field label="Nome"><input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value, slug: e.target.value.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') }))} className={INPUT} /></Field>
                <Field label="Slug"><input value={form.slug} onChange={e => setForm(f => ({ ...f, slug: e.target.value }))} className={INPUT} /></Field>
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Categoria"><input value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} className={INPUT} /></Field>
                  <Field label="Preço Extra">
                    <input type="number" step="0.01" min="0" value={form.extraPrice} onChange={e => setForm(f => ({ ...f, extraPrice: parseFloat(e.target.value) }))} className={INPUT} />
                  </Field>
                </div>
                <Field label="Permitida para">
                  <select value={form.allowedFor} onChange={e => setForm(f => ({ ...f, allowedFor: e.target.value }))} className={INPUT}>
                    <option value="BOTH">Ambos</option>
                    <option value="OVERSIZED">Somente Oversized</option>
                    <option value="CAMISETA">Somente Camiseta</option>
                  </select>
                </Field>
                {/* ── IMAGE UPLOAD ── */}
                <Field label="Imagem da Estampa">
                  <div className="space-y-2">
                    {/* Preview */}
                    <div className="flex items-start gap-3">
                      <div className="w-20 h-20 bg-black/40 border border-white/10 flex items-center justify-center overflow-hidden flex-shrink-0">
                        {form.imageUrl && form.imageUrl !== '/stamps/placeholder.svg' ? (
                          <Image
                            src={form.imageUrl}
                            alt="Preview"
                            width={80}
                            height={80}
                            className="w-full h-full object-contain"
                            unoptimized
                          />
                        ) : (
                          <ImageIcon size={24} className="text-white/20" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-white/40 mb-2 break-all">
                          {form.imageUrl || 'Nenhuma imagem selecionada'}
                        </p>
                        {/* Hidden file input */}
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/jpeg,image/png,image/webp,image/svg+xml,image/gif"
                          className="hidden"
                          onChange={handleFileSelect}
                        />
                        <button
                          type="button"
                          disabled={uploading}
                          onClick={() => fileInputRef.current?.click()}
                          className="flex items-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 text-white/70 hover:text-white text-xs px-3 py-2 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {uploading
                            ? <><Loader2 size={13} className="animate-spin" /> Enviando...</>
                            : <><Upload size={13} /> Escolher imagem</>
                          }
                        </button>
                        <p className="text-[10px] text-white/25 mt-1.5">JPG, PNG, WebP, SVG ou GIF · máx. 5 MB</p>
                      </div>
                    </div>
                  </div>
                </Field>
                <div className="flex items-center gap-2">
                  <input type="checkbox" id="active-stamp" checked={form.active} onChange={e => setForm(f => ({ ...f, active: e.target.checked }))} className="cursor-pointer" />
                  <label htmlFor="active-stamp" className="text-sm text-white/60 cursor-pointer">Ativa (visível na loja)</label>
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

function StampPreview({ stamp }: { stamp: Stamp }) {
  const isRealImage = stamp.imageUrl &&
    stamp.imageUrl !== '/stamps/placeholder.svg' &&
    !stamp.imageUrl.startsWith('data:')

  if (isRealImage) {
    return (
      <Image
        src={stamp.imageUrl}
        alt={stamp.name}
        width={64}
        height={64}
        className="w-16 h-16 object-contain"
        unoptimized
      />
    )
  }

  // SVG fallback for stamps without images
  const COLORS: Record<string, string> = {
    'urban-skull': '#FF4444', 'dragon-fire': '#FF6B35', 'tokyo-night': '#7C3AED',
    'neon-wave': '#06B6D4', 'mountain-peak': '#10B981', 'cyber-grid': '#3B82F6',
    'streetdrop-logo': '#E10600', 'sem-estampa': '#2A2A2A',
  }
  const color = COLORS[stamp.slug] ?? '#E10600'
  return (
    <svg viewBox="0 0 80 80" className="w-16 h-16" fill="none">
      <circle cx="40" cy="40" r="28" fill={color} opacity="0.18" />
      <circle cx="40" cy="40" r="16" fill={color} opacity="0.35" />
      <text x="40" y="45" textAnchor="middle" fill={color} fontSize="10" fontFamily="Arial" fontWeight="bold">
        {stamp.name.substring(0, 4).toUpperCase()}
      </text>
    </svg>
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

