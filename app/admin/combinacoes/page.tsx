'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { AdminSidebar } from '@/components/admin/AdminSidebar'
import { Plus, Edit2, Trash2, X, Check, Image as ImageIcon, Upload, Loader2 } from 'lucide-react'
import Image from 'next/image'

type Color = { id: string; name: string; hex: string }
type Base = { id: string; name: string; type: string; colors: Color[] }
type Stamp = { id: string; name: string; slug: string }

type Combination = {
  id: string
  baseId: string
  colorId: string
  stampId?: string
  imageFront?: string
  imageBack?: string
  active: boolean
  base: { id: string; name: string; type: string }
  color: { id: string; name: string; hex: string }
  stamp?: { id: string; name: string; slug: string }
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

function ImgPreview({ url, label }: { url?: string; label: string }) {
  if (!url) return (
    <div className="w-full aspect-square bg-black/30 border border-white/5 flex flex-col items-center justify-center gap-2">
      <ImageIcon size={20} className="text-white/20" />
      <span className="text-[10px] text-white/20">{label}</span>
    </div>
  )
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={url} alt={label} className="w-full aspect-square object-contain bg-black/30 border border-white/10" />
  )
}

export default function CombinacoesPage() {
  const [combinations, setCombinations] = useState<Combination[]>([])
  const [bases, setBases] = useState<Base[]>([])
  const [stamps, setStamps] = useState<Stamp[]>([])
  const [loading, setLoading] = useState(true)
  const [filterType, setFilterType] = useState('')

  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState<Combination | null>(null)
  const [form, setForm] = useState({
    baseId: '', colorId: '', stampId: '', imageFront: '', imageBack: '', active: true,
  })
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState<string | null>(null)
  const fileFrontRef = useRef<HTMLInputElement>(null)
  const fileBackRef  = useRef<HTMLInputElement>(null)

  async function handleFileUpload(file: File, field: 'imageFront' | 'imageBack') {
    setUploading(field)
    try {
      const fd = new FormData()
      fd.append('file', file)
      fd.append('folder', 'mockups')
      const res  = await fetch('/api/admin/upload', { method: 'POST', body: fd })
      const data = await res.json()
      if (data.url) setForm(f => ({ ...f, [field]: data.url }))
      else alert(data.error ?? 'Erro ao fazer upload')
    } catch { alert('Erro ao fazer upload') }
    finally { setUploading(null) }
  }

  const load = useCallback(async () => {
    const [combosData, basesData, stampsData] = await Promise.all([
      fetch(`/api/admin/combinations${filterType ? `?type=${filterType}` : ''}`).then(r => r.json()),
      fetch('/api/admin/bases').then(r => r.json()),
      fetch('/api/admin/stamps').then(r => r.json()),
    ])
    setCombinations(Array.isArray(combosData) ? combosData : [])
    setBases(Array.isArray(basesData) ? basesData : [])
    setStamps(Array.isArray(stampsData) ? stampsData : [])
    setLoading(false)
  }, [filterType])

  useEffect(() => { load() }, [load])

  function openNew() {
    const firstBase = bases[0]
    setEditing(null)
    setForm({
      baseId: firstBase?.id ?? '',
      colorId: '',
      stampId: '',
      imageFront: '',
      imageBack: '',
      active: true,
    })
    setShowModal(true)
  }

  function openEdit(c: Combination) {
    setEditing(c)
    setForm({
      baseId: c.baseId,
      colorId: c.colorId,
      stampId: c.stampId ?? '',
      imageFront: c.imageFront ?? '',
      imageBack: c.imageBack ?? '',
      active: c.active,
    })
    setShowModal(true)
  }

  async function handleSave() {
    setSaving(true)
    const payload = {
      ...form,
      stampId: form.stampId || null,
      imageFront: form.imageFront || null,
      imageBack: form.imageBack || null,
    }
    const url = editing ? `/api/admin/combinations/${editing.id}` : '/api/admin/combinations'
    await fetch(url, { method: editing ? 'PUT' : 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
    await load()
    setShowModal(false)
    setSaving(false)
  }

  async function handleDelete(id: string) {
    if (!confirm('Excluir esta combinação?')) return
    await fetch(`/api/admin/combinations/${id}`, { method: 'DELETE' })
    await load()
  }

  // Colors for selected base in modal
  const selectedBase = bases.find(b => b.id === form.baseId)
  const colorsForSelectedBase = selectedBase?.colors ?? []

  return (
    <div className="flex">
      <AdminSidebar />
      <main className="lg:ml-64 flex-1 p-4 sm:p-8 min-h-screen pt-16 lg:pt-0">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-black text-white uppercase tracking-widest" style={{ fontFamily: 'var(--font-bebas)' }}>
              Combinações
            </h1>
            <p className="text-white/40 text-sm mt-1">Mockups de frente/costas por Base + Cor + Estampa</p>
          </div>
          <button onClick={openNew} className="flex items-center gap-2 bg-[#E10600] hover:bg-[#B80000] text-white px-4 py-2 text-sm font-bold uppercase tracking-wider transition-colors cursor-pointer">
            <Plus size={16} /> Nova Combinação
          </button>
        </div>

        {/* Type filter */}
        <div className="flex gap-2 mb-6">
          {[{ value: '', label: 'Todas' }, { value: 'OVERSIZED', label: 'Oversized' }, { value: 'CAMISETA', label: 'Camiseta' }].map(t => (
            <button
              key={t.value}
              onClick={() => setFilterType(t.value)}
              className={`px-3 py-1.5 text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer ${filterType === t.value ? 'bg-[#E10600] text-white' : 'border border-white/10 text-white/50 hover:text-white'}`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Info */}
        <div className="bg-blue-500/5 border border-blue-500/20 p-4 mb-6 text-sm text-blue-300/70">
          <p className="font-semibold text-blue-300 mb-1">Como usar:</p>
          <p>Crie uma combinação para cada Base + Cor + Estampa que você tem foto do produto. As imagens serão exibidas no customizador em tempo real quando o cliente selecionar aquela combinação. Se não houver imagem cadastrada, o sistema exibe o preview SVG gerado.</p>
        </div>

        {loading ? (
          <p className="text-white/40 text-sm">Carregando...</p>
        ) : combinations.length === 0 ? (
          <div className="text-center py-16">
            <ImageIcon size={40} className="text-white/10 mx-auto mb-4" />
            <p className="text-white/30 text-sm">Nenhuma combinação cadastrada</p>
            <p className="text-white/20 text-xs mt-1">Crie combinações para exibir fotos reais no customizador</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {combinations.map(c => (
              <div key={c.id} className="bg-[#161616] border border-white/5 overflow-hidden">
                {/* Mockup previews */}
                <div className="grid grid-cols-2 gap-px bg-white/5">
                  <ImgPreview url={c.imageFront ?? undefined} label="Frente" />
                  <ImgPreview url={c.imageBack ?? undefined} label="Costas" />
                </div>

                {/* Info */}
                <div className="p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="w-3 h-3 rounded-full border border-white/20 flex-shrink-0" style={{ backgroundColor: c.color.hex }} />
                    <span className="text-xs text-white font-semibold truncate">{c.base.name}</span>
                  </div>
                  <p className="text-[11px] text-white/40">{c.color.name} · {c.stamp?.name ?? 'Sem estampa'}</p>
                  <p className="text-[10px] text-white/25 mt-0.5 uppercase tracking-wider">{c.base.type}</p>

                  <div className="flex items-center gap-2 mt-3">
                    <span className={`text-[10px] px-1.5 py-0.5 ${c.active ? 'bg-green-400/10 text-green-400' : 'bg-red-400/10 text-red-400'}`}>
                      {c.active ? 'Ativo' : 'Inativo'}
                    </span>
                    <span className={`text-[10px] px-1.5 py-0.5 border ${c.imageFront || c.imageBack ? 'border-blue-400/20 text-blue-400' : 'border-white/10 text-white/20'}`}>
                      {(c.imageFront ? 1 : 0) + (c.imageBack ? 1 : 0)} foto(s)
                    </span>
                    <div className="ml-auto flex gap-1">
                      <button onClick={() => openEdit(c)} className="p-1 text-white/30 hover:text-white cursor-pointer"><Edit2 size={13} /></button>
                      <button onClick={() => handleDelete(c.id)} className="p-1 text-white/30 hover:text-red-400 cursor-pointer"><Trash2 size={13} /></button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
            <div className="bg-[#161616] border border-white/10 w-full max-w-xl max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between p-5 border-b border-white/10">
                <h2 className="text-white font-bold">{editing ? 'Editar Combinação' : 'Nova Combinação'}</h2>
                <button onClick={() => setShowModal(false)} className="text-white/40 hover:text-white cursor-pointer"><X size={20} /></button>
              </div>
              <div className="p-5 space-y-4">

                <Field label="Base">
                  <select value={form.baseId} onChange={e => setForm(f => ({ ...f, baseId: e.target.value, colorId: '' }))} className={INPUT}>
                    <option value="">Selecione uma base...</option>
                    {bases.map(b => <option key={b.id} value={b.id}>{b.name} ({b.type})</option>)}
                  </select>
                </Field>

                <Field label="Cor">
                  <select value={form.colorId} onChange={e => setForm(f => ({ ...f, colorId: e.target.value }))} className={INPUT}>
                    <option value="">Selecione uma cor...</option>
                    {colorsForSelectedBase.map(c => <option key={c.id} value={c.id}>{c.name} ({c.hex})</option>)}
                  </select>
                </Field>

                <Field label="Estampa (opcional)">
                  <select value={form.stampId} onChange={e => setForm(f => ({ ...f, stampId: e.target.value }))} className={INPUT}>
                    <option value="">Sem estampa</option>
                    {stamps.map(s => <option key={s.id} value={s.id}>{s.name} ({s.slug})</option>)}
                  </select>
                </Field>

                {/* Image upload */}
                <div className="border border-white/5 p-4 space-y-4 bg-black/20">
                  <p className="text-xs text-white/40 uppercase tracking-wider flex items-center gap-2">
                    <ImageIcon size={12} /> Fotos do Produto (Mockups)
                  </p>

                  {/* Front image */}
                  <Field label="Foto — Frente">
                    <div className="flex items-start gap-3">
                      <div className="w-20 h-20 bg-black/40 border border-white/10 flex items-center justify-center overflow-hidden flex-shrink-0">
                        {form.imageFront ? (
                          <Image src={form.imageFront} alt="Frente" width={80} height={80} className="w-full h-full object-contain" unoptimized />
                        ) : (
                          <ImageIcon size={22} className="text-white/20" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <input ref={fileFrontRef} type="file" accept="image/*" className="hidden"
                          onChange={e => { const f = e.target.files?.[0]; if (f) handleFileUpload(f, 'imageFront'); if (fileFrontRef.current) fileFrontRef.current.value = '' }} />
                        <button type="button" disabled={uploading === 'imageFront'}
                          onClick={() => fileFrontRef.current?.click()}
                          className="flex items-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 text-white/70 hover:text-white text-xs px-3 py-2 transition-colors cursor-pointer disabled:opacity-50">
                          {uploading === 'imageFront' ? <><Loader2 size={13} className="animate-spin" /> Enviando...</> : <><Upload size={13} /> Escolher foto</>}
                        </button>
                        {form.imageFront && <p className="text-[10px] text-white/25 mt-1 truncate">{form.imageFront}</p>}
                      </div>
                    </div>
                  </Field>

                  {/* Back image */}
                  <Field label="Foto — Costas">
                    <div className="flex items-start gap-3">
                      <div className="w-20 h-20 bg-black/40 border border-white/10 flex items-center justify-center overflow-hidden flex-shrink-0">
                        {form.imageBack ? (
                          <Image src={form.imageBack} alt="Costas" width={80} height={80} className="w-full h-full object-contain" unoptimized />
                        ) : (
                          <ImageIcon size={22} className="text-white/20" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <input ref={fileBackRef} type="file" accept="image/*" className="hidden"
                          onChange={e => { const f = e.target.files?.[0]; if (f) handleFileUpload(f, 'imageBack'); if (fileBackRef.current) fileBackRef.current.value = '' }} />
                        <button type="button" disabled={uploading === 'imageBack'}
                          onClick={() => fileBackRef.current?.click()}
                          className="flex items-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 text-white/70 hover:text-white text-xs px-3 py-2 transition-colors cursor-pointer disabled:opacity-50">
                          {uploading === 'imageBack' ? <><Loader2 size={13} className="animate-spin" /> Enviando...</> : <><Upload size={13} /> Escolher foto</>}
                        </button>
                        {form.imageBack && <p className="text-[10px] text-white/25 mt-1 truncate">{form.imageBack}</p>}
                      </div>
                    </div>
                  </Field>
                  <p className="text-[10px] text-white/20">JPG, PNG, WebP ou SVG · máx. 5 MB · Será salvo em /public/images/mockups/</p>
                </div>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={form.active} onChange={e => setForm(f => ({ ...f, active: e.target.checked }))} />
                  <span className="text-sm text-white/60">Ativo</span>
                </label>

                <div className="flex gap-3 pt-2">
                  <button onClick={() => setShowModal(false)} className="flex-1 border border-white/10 text-white/60 hover:text-white py-2 text-sm transition-colors cursor-pointer">Cancelar</button>
                  <button
                    onClick={handleSave}
                    disabled={saving || !form.baseId || !form.colorId}
                    className="flex-1 bg-[#E10600] hover:bg-[#B80000] text-white py-2 text-sm font-bold transition-colors disabled:opacity-60 cursor-pointer flex items-center justify-center gap-2"
                  >
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

