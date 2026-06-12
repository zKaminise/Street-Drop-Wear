'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
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

type UploadEntry = { imageFront: string; imageBack: string }

type FormState = {
  baseId: string
  colorIds: string[]
  stampId: string
  active: boolean
  uploads: Record<string, UploadEntry>
}

const INITIAL_FORM: FormState = {
  baseId: '',
  colorIds: [],
  stampId: '',
  active: true,
  uploads: {},
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

function UploadCell({
  label,
  value,
  uploading,
  onUpload,
}: {
  label: string
  value: string
  uploading: boolean
  onUpload: (file: File) => void
}) {
  const inputRef = useRef<HTMLInputElement>(null)
  return (
    <div className="space-y-1.5">
      <p className="text-[10px] text-white/40 uppercase tracking-wider">{label}</p>
      <div className="w-full aspect-square bg-black/40 border border-white/10 flex items-center justify-center overflow-hidden">
        {value ? (
          <Image src={value} alt={label} width={120} height={120} className="w-full h-full object-contain" unoptimized />
        ) : (
          <ImageIcon size={20} className="text-white/20" />
        )}
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/png,image/jpg,image/jpeg,image/webp"
        className="hidden"
        onChange={e => {
          const f = e.target.files?.[0]
          if (f) onUpload(f)
          if (inputRef.current) inputRef.current.value = ''
        }}
      />
      <button
        type="button"
        disabled={uploading}
        onClick={() => inputRef.current?.click()}
        className="flex items-center gap-1.5 bg-white/5 hover:bg-white/10 border border-white/10 text-white/60 hover:text-white text-[10px] px-2 py-1.5 transition-colors cursor-pointer disabled:opacity-50 w-full justify-center"
      >
        {uploading
          ? <><Loader2 size={11} className="animate-spin" /> Enviando...</>
          : <><Upload size={11} /> Escolher</>}
      </button>
      {value && <p className="text-[9px] text-green-400/60 text-center">✓ OK</p>}
    </div>
  )
}

export default function CombinacoesPage() {
  const [combinations, setCombinations] = useState<Combination[]>([])
  const [bases, setBases] = useState<Base[]>([])
  const [stamps, setStamps] = useState<Stamp[]>([])
  const [loading, setLoading] = useState(true)
  const [filterType, setFilterType] = useState('')
  const [filterColorId, setFilterColorId] = useState('')

  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState<Combination | null>(null)
  const [form, setForm] = useState<FormState>(INITIAL_FORM)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState<string | null>(null)

  async function handleFileUpload(file: File, colorId: string, field: 'imageFront' | 'imageBack') {
    setUploading(`${colorId}:${field}`)
    try {
      const fd = new FormData()
      fd.append('file', file)
      fd.append('folder', 'mockups')
      const res = await fetch('/api/admin/upload', { method: 'POST', body: fd })
      const data = await res.json()
      if (data.url) {
        setForm(f => ({
          ...f,
          uploads: {
            ...f.uploads,
            [colorId]: { ...(f.uploads[colorId] ?? { imageFront: '', imageBack: '' }), [field]: data.url },
          },
        }))
      } else alert(data.error ?? 'Erro ao fazer upload')
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
  useEffect(() => { setFilterColorId('') }, [filterType])

  const colorFilterOptions = useMemo(() => {
    const filteredBases = filterType ? bases.filter(b => b.type === filterType) : bases
    const seen = new Set<string>()
    const result: { id: string; name: string; hex: string }[] = []
    for (const base of filteredBases) {
      for (const color of base.colors) {
        if (!seen.has(color.id)) {
          seen.add(color.id)
          result.push({ id: color.id, name: color.name, hex: color.hex })
        }
      }
    }
    return result
  }, [bases, filterType])

  const displayedCombinations = filterColorId
    ? combinations.filter(c => c.colorId === filterColorId)
    : combinations

  const selectedBase = bases.find(b => b.id === form.baseId)
  const colorsForSelectedBase = selectedBase?.colors ?? []

  function toggleColor(colorId: string) {
    setForm(f => {
      const isSelected = f.colorIds.includes(colorId)
      const newIds = isSelected ? f.colorIds.filter(id => id !== colorId) : [...f.colorIds, colorId]
      const newUploads = { ...f.uploads }
      if (isSelected) delete newUploads[colorId]
      return { ...f, colorIds: newIds, uploads: newUploads }
    })
  }

  function openNew() {
    setEditing(null)
    setForm({ ...INITIAL_FORM, baseId: bases[0]?.id ?? '' })
    setShowModal(true)
  }

  function openEdit(c: Combination) {
    setEditing(c)
    setForm({
      baseId: c.baseId,
      colorIds: [c.colorId],
      stampId: c.stampId ?? '',
      active: c.active,
      uploads: {
        [c.colorId]: {
          imageFront: c.imageFront ?? '',
          imageBack: c.imageBack ?? '',
        },
      },
    })
    setShowModal(true)
  }

  async function handleSave() {
    setSaving(true)
    try {
      if (editing) {
        const colorId = form.colorIds[0]
        const upload = form.uploads[colorId] ?? { imageFront: '', imageBack: '' }
        await fetch(`/api/admin/combinations/${editing.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            baseId: form.baseId,
            colorId,
            stampId: form.stampId || null,
            imageFront: upload.imageFront || null,
            imageBack: upload.imageBack || null,
            active: form.active,
          }),
        })
      } else {
        await Promise.all(
          form.colorIds.map(colorId => {
            const upload = form.uploads[colorId] ?? { imageFront: '', imageBack: '' }
            return fetch('/api/admin/combinations', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                baseId: form.baseId,
                colorId,
                stampId: form.stampId || null,
                imageFront: upload.imageFront || null,
                imageBack: upload.imageBack || null,
                active: form.active,
              }),
            })
          })
        )
      }
      await load()
      setShowModal(false)
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Excluir esta combinação?')) return
    await fetch(`/api/admin/combinations/${id}`, { method: 'DELETE' })
    await load()
  }

  const canSave = !!form.baseId && form.colorIds.length > 0

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
        <div className="flex gap-2 mb-3">
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

        {/* Color filter */}
        {colorFilterOptions.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 mb-6 pb-4 border-b border-white/5">
            <span className="text-[10px] text-white/25 uppercase tracking-widest flex-shrink-0">Cor:</span>
            <button
              onClick={() => setFilterColorId('')}
              className={`px-3 py-1.5 text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer ${
                !filterColorId ? 'bg-[#E10600] text-white' : 'border border-white/10 text-white/40 hover:text-white hover:border-white/30'
              }`}
            >
              Todas
            </button>
            {colorFilterOptions.map(color => (
              <button
                key={color.id}
                onClick={() => setFilterColorId(filterColorId === color.id ? '' : color.id)}
                className={`flex items-center gap-2 px-3 py-1.5 text-xs font-semibold transition-colors cursor-pointer ${
                  filterColorId === color.id
                    ? 'bg-[#E10600]/10 border border-[#E10600] text-white'
                    : 'border border-white/10 text-white/50 hover:text-white hover:border-white/30'
                }`}
              >
                <span className="w-3 h-3 rounded-full border border-white/20 flex-shrink-0" style={{ backgroundColor: color.hex }} />
                {color.name}
              </button>
            ))}
          </div>
        )}

        {/* Info */}
        <div className="bg-blue-500/5 border border-blue-500/20 p-4 mb-6 text-sm text-blue-300/70">
          <p className="font-semibold text-blue-300 mb-1">Como usar:</p>
          <p>Crie uma combinação para cada Base + Cor + Estampa. Ao cadastrar, selecione múltiplas cores de uma vez para a mesma estampa — o sistema cria um card por cor automaticamente.</p>
        </div>

        {loading ? (
          <p className="text-white/40 text-sm">Carregando...</p>
        ) : displayedCombinations.length === 0 ? (
          <div className="text-center py-16">
            <ImageIcon size={40} className="text-white/10 mx-auto mb-4" />
            {combinations.length === 0 ? (
              <>
                <p className="text-white/30 text-sm">Nenhuma combinação cadastrada</p>
                <p className="text-white/20 text-xs mt-1">Crie combinações para exibir fotos reais no customizador</p>
              </>
            ) : (
              <p className="text-white/30 text-sm">Nenhuma combinação para esta cor</p>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {displayedCombinations.map(c => (
              <div key={c.id} className="bg-[#161616] border border-white/5 overflow-hidden">
                <div className="grid grid-cols-2 gap-px bg-white/5">
                  <ImgPreview url={c.imageFront ?? undefined} label="Frente" />
                  <ImgPreview url={c.imageBack ?? undefined} label="Costas" />
                </div>
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
            <div className="bg-[#161616] border border-white/10 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between p-5 border-b border-white/10">
                <div>
                  <h2 className="text-white font-bold">{editing ? 'Editar Combinação' : 'Nova Combinação'}</h2>
                  {!editing && (
                    <p className="text-[11px] text-white/30 mt-0.5">Selecione múltiplas cores para cadastrar de uma vez</p>
                  )}
                </div>
                <button onClick={() => setShowModal(false)} className="text-white/40 hover:text-white cursor-pointer"><X size={20} /></button>
              </div>

              <div className="p-5 space-y-5">
                {/* Base */}
                <Field label="Base">
                  <select
                    value={form.baseId}
                    onChange={e => setForm(f => ({ ...f, baseId: e.target.value, colorIds: [], uploads: {} }))}
                    className={INPUT}
                  >
                    <option value="">Selecione uma base...</option>
                    {bases.map(b => <option key={b.id} value={b.id}>{b.name} ({b.type})</option>)}
                  </select>
                </Field>

                {/* Stamp */}
                <Field label="Estampa (opcional)">
                  <select value={form.stampId} onChange={e => setForm(f => ({ ...f, stampId: e.target.value }))} className={INPUT}>
                    <option value="">Sem estampa</option>
                    {stamps.map(s => <option key={s.id} value={s.id}>{s.name} ({s.slug})</option>)}
                  </select>
                </Field>

                {/* Colors — multi-select pills */}
                <Field label={`Cores disponíveis${form.colorIds.length > 0 ? ` (${form.colorIds.length} selecionada${form.colorIds.length > 1 ? 's' : ''})` : ''}`}>
                  {colorsForSelectedBase.length === 0 ? (
                    <p className="text-xs text-white/20 py-2">Selecione uma base primeiro</p>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {colorsForSelectedBase.map(color => {
                        const selected = form.colorIds.includes(color.id)
                        return (
                          <button
                            key={color.id}
                            type="button"
                            disabled={!!editing}
                            onClick={() => toggleColor(color.id)}
                            className={`flex items-center gap-2 px-3 py-1.5 text-xs font-semibold transition-colors ${
                              editing ? 'cursor-default opacity-70' : 'cursor-pointer'
                            } ${
                              selected
                                ? 'bg-[#E10600]/10 border border-[#E10600] text-white'
                                : 'border border-white/10 text-white/50 hover:text-white hover:border-white/30'
                            }`}
                          >
                            <span className="w-3 h-3 rounded-full border border-white/20 flex-shrink-0" style={{ backgroundColor: color.hex }} />
                            {color.name}
                            {selected && <Check size={10} className="text-[#E10600]" />}
                          </button>
                        )
                      })}
                    </div>
                  )}
                </Field>

                {/* Per-color upload sections */}
                {form.colorIds.length > 0 && (
                  <div className="space-y-4">
                    {/* Quality guidance — shown once above all color sections */}
                    <div className="bg-amber-500/8 border border-amber-500/25 p-3 space-y-1">
                      <p className="text-[11px] text-amber-400 font-semibold">★ Tamanho ideal para melhor qualidade</p>
                      <p className="text-[10px] text-amber-300/70">Resolução: <span className="text-amber-300 font-semibold">1200×1200 px</span> (mínimo) · <span className="text-amber-300 font-semibold">2000×2000 px</span> (ideal)</p>
                      <p className="text-[10px] text-amber-300/70">Formato: <span className="text-amber-300 font-semibold">PNG com fundo transparente</span> · Proporção: <span className="text-amber-300 font-semibold">1:1</span> · Máx. <span className="text-amber-300 font-semibold">5 MB</span></p>
                    </div>

                    {form.colorIds.map(colorId => {
                      const color = colorsForSelectedBase.find(c => c.id === colorId)
                      if (!color) return null
                      const upload = form.uploads[colorId] ?? { imageFront: '', imageBack: '' }
                      return (
                        <div key={colorId} className="border border-white/10 overflow-hidden">
                          {/* Color header */}
                          <div className="flex items-center gap-2.5 px-4 py-2.5 bg-white/5 border-b border-white/5">
                            <span className="w-4 h-4 rounded-full border border-white/20 flex-shrink-0" style={{ backgroundColor: color.hex }} />
                            <span className="text-xs font-bold text-white uppercase tracking-wider">{color.name}</span>
                            <span className="text-[10px] text-white/30 ml-auto">{color.hex}</span>
                          </div>
                          {/* Upload grid */}
                          <div className="p-4 grid grid-cols-2 gap-4">
                            <UploadCell
                              label="Frente"
                              value={upload.imageFront}
                              uploading={uploading === `${colorId}:imageFront`}
                              onUpload={file => handleFileUpload(file, colorId, 'imageFront')}
                            />
                            <UploadCell
                              label="Costas"
                              value={upload.imageBack}
                              uploading={uploading === `${colorId}:imageBack`}
                              onUpload={file => handleFileUpload(file, colorId, 'imageBack')}
                            />
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}

                {/* Active toggle */}
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={form.active} onChange={e => setForm(f => ({ ...f, active: e.target.checked }))} />
                  <span className="text-sm text-white/60">Ativo</span>
                </label>

                {/* Actions */}
                <div className="flex gap-3 pt-2">
                  <button onClick={() => setShowModal(false)} className="flex-1 border border-white/10 text-white/60 hover:text-white py-2 text-sm transition-colors cursor-pointer">
                    Cancelar
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={saving || !canSave}
                    className="flex-1 bg-[#E10600] hover:bg-[#B80000] text-white py-2 text-sm font-bold transition-colors disabled:opacity-60 cursor-pointer flex items-center justify-center gap-2"
                  >
                    <Check size={16} />
                    {saving
                      ? 'Salvando...'
                      : editing
                      ? 'Salvar'
                      : form.colorIds.length > 1
                      ? `Criar ${form.colorIds.length} combinações`
                      : 'Criar combinação'}
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
