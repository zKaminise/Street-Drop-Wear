'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { AdminSidebar } from '@/components/admin/AdminSidebar'
import {
  Plus, Edit2, Trash2, X, Check, Zap, Upload, ImageIcon,
  Loader2, Palette, Images, ChevronDown, ChevronUp
} from 'lucide-react'
import Image from 'next/image'
import { formatPrice } from '@/lib/utils'

// ── Types ────────────────────────────────────────────────────────────────────

type ProductImageData = {
  id: string
  url: string
  alt?: string
  isPrimary: boolean
  sortOrder: number
  colorName?: string | null
}

type ProductVariantData = {
  id: string
  color?: string | null
  colorHex?: string | null
  size?: string | null
  stock: number
  active: boolean
}

type Product = {
  id: string
  name: string
  slug: string
  type: string
  gender: string
  subcategory?: string
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
  images: ProductImageData[]
  variants: ProductVariantData[]
}

type CImgEntry   = { tempId: string; id?: string; url: string }
type CVariantEntry = { tempId: string; id?: string; name: string; hex: string; images: CImgEntry[] }
type GalleryEntry  = { tempId: string; id?: string; url: string }

// ── Constants ────────────────────────────────────────────────────────────────

const PRODUCT_TYPES = [
  { value: 'DRYFIT',     label: 'DryFit' },
  { value: 'PRODUTO_3D', label: 'Produto 3D' },
  { value: 'GEEK',       label: 'Geek Store' },
]

const DRYFIT_SUBCATEGORIES = ['Regular', 'Slim', 'Regata', 'Top Academia']

const INITIAL: Partial<Product> = {
  name: '', slug: '', type: 'DRYFIT', gender: 'UNISEX', subcategory: '',
  price: 79.90, originalPrice: undefined,
  description: '', material: '', isNew: false, isFeatured: false, active: true,
  isFlashSale: false, flashSalePrice: undefined, flashSaleEndsAt: '',
  imageUrl: '', hoverImageUrl: '',
  images: [], variants: [],
}

const INPUT = 'w-full bg-black/40 border border-white/10 text-white placeholder-white/20 px-3 py-2 text-sm focus:outline-none focus:border-[#E10600]/60'
const MAX_COLOR_IMAGES = 5
const MAX_GALLERY = 5

function uid() { return `t-${Date.now()}-${Math.random().toString(36).slice(2)}` }

// Safe slug generator using explicit unicode escapes (works regardless of file encoding)
const COMBINING_MARKS = /[̀-ͯ]/g
function generateSlug(name: string) {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(COMBINING_MARKS, '')  // strip combining diacritics
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="text-xs text-white/50 uppercase tracking-wider mb-1 block">{label}</label>
      {children}
    </div>
  )
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function ProdutosPage() {
  const [products, setProducts]       = useState<Product[]>([])
  const [loading, setLoading]         = useState(true)
  const [filterType, setFilterType]   = useState('')
  const [showModal, setShowModal]     = useState(false)
  const [editing, setEditing]         = useState<Product | null>(null)
  const [form, setForm]               = useState<Partial<Product>>({ ...INITIAL })
  const [saving, setSaving]           = useState(false)
  const [subcategoryOptions, setSubcategoryOptions] = useState<string[]>([])

  // Image upload state (card images)
  const [uploading, setUploading]     = useState<string | null>(null)
  const fileMainRef   = useRef<HTMLInputElement>(null)
  const fileHoverRef  = useRef<HTMLInputElement>(null)

  // Color variants state
  const [colorVariants, setColorVariants]   = useState<CVariantEntry[]>([])
  const [galleryImages, setGalleryImages]   = useState<GalleryEntry[]>([])
  const [uploadingSlot, setUploadingSlot]   = useState<string | null>(null) // key: 'color-tempId' | 'gallery-idx'

  // Single shared hidden file input for color/gallery uploads
  const uploadCtxRef  = useRef<{ kind: 'color'; cvTempId: string } | { kind: 'gallery' } | null>(null)
  const sharedFileRef = useRef<HTMLInputElement>(null)

  // Collapsible sections
  const [colorSectionOpen, setColorSectionOpen]   = useState(true)
  const [gallerySectionOpen, setGallerySectionOpen] = useState(true)

  // ── Load ──────────────────────────────────────────────────────────────────

  const load = useCallback(async () => {
    const data = await fetch(`/api/admin/products${filterType ? `?type=${filterType}` : ''}`).then(r => r.json())
    setProducts((data as Product[]).filter(p => ['DRYFIT', 'PRODUTO_3D', 'GEEK'].includes(p.type)))
    setLoading(false)
  }, [filterType])

  useEffect(() => { load() }, [load])

  const loadSubcategories = useCallback(async (type: string) => {
    if (type === 'DRYFIT') {
      setSubcategoryOptions(DRYFIT_SUBCATEGORIES)
      return
    }
    const data = await fetch(`/api/admin/product-subcategories?type=${type}`).then(r => r.json())
    setSubcategoryOptions(Array.isArray(data) ? data.map((d: { name: string }) => d.name) : [])
  }, [])

  useEffect(() => {
    if (showModal) loadSubcategories(form.type ?? 'DRYFIT')
  }, [showModal, form.type, loadSubcategories])

  // ── Modal helpers ─────────────────────────────────────────────────────────

  function openNew() {
    setEditing(null)
    setForm({ ...INITIAL })
    setColorVariants([])
    setGalleryImages([])
    setShowModal(true)
  }

  function openEdit(p: Product) {
    setEditing(p)
    setForm({
      name: p.name, slug: p.slug, type: p.type, price: p.price,
      originalPrice: p.originalPrice, description: p.description ?? '',
      material: p.material ?? '', isNew: p.isNew, isFeatured: p.isFeatured, active: p.active,
      gender: p.gender ?? 'UNISEX',
      subcategory: p.subcategory ?? '',
      isFlashSale: p.isFlashSale, flashSalePrice: p.flashSalePrice,
      flashSaleEndsAt: p.flashSaleEndsAt ? p.flashSaleEndsAt.slice(0, 16) : '',
      imageUrl: p.imageUrl ?? '', hoverImageUrl: p.hoverImageUrl ?? '',
    })

    // Build color variants from existing variants + images
    const colorMap = new Map<string, { hex: string; variantId: string }>()
    for (const v of p.variants) {
      if (v.color && !colorMap.has(v.color)) {
        colorMap.set(v.color, { hex: v.colorHex ?? '#1A1A1A', variantId: v.id })
      }
    }

    const cvs: CVariantEntry[] = Array.from(colorMap.entries()).map(([name, data]) => ({
      tempId: data.variantId,
      id: data.variantId,
      name,
      hex: data.hex,
      images: p.images
        .filter(img => img.colorName === name)
        .sort((a, b) => a.sortOrder - b.sortOrder)
        .map(img => ({ tempId: img.id, id: img.id, url: img.url })),
    }))

    setColorVariants(cvs)
    setGalleryImages(
      p.images
        .filter(img => !img.colorName)
        .sort((a, b) => a.sortOrder - b.sortOrder)
        .map(img => ({ tempId: img.id, id: img.id, url: img.url }))
    )
    setShowModal(true)
  }

  // ── Save ──────────────────────────────────────────────────────────────────

  async function handleSave() {
    if (!form.name?.trim()) return
    setSaving(true)
    try {
      const payload = {
        ...form,
        originalPrice: form.originalPrice || null,
        flashSalePrice: form.flashSalePrice || null,
        flashSaleEndsAt: form.flashSaleEndsAt
          ? new Date(form.flashSaleEndsAt as string).toISOString()
          : null,
        imageUrl: form.imageUrl || null,
        hoverImageUrl: form.hoverImageUrl || null,
        colorVariants: colorVariants.map(cv => ({
          name: cv.name,
          hex: cv.hex,
          images: cv.images.map(img => img.url).filter(Boolean),
        })),
        galleryImages: galleryImages.map(img => img.url).filter(Boolean),
      }
      const url    = editing ? `/api/admin/products/${editing.id}` : '/api/admin/products'
      const method = editing ? 'PUT' : 'POST'
      await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
      await load()
      setShowModal(false)
    } finally {
      setSaving(false)
    }
  }

  // ── Delete ────────────────────────────────────────────────────────────────

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

  // ── Card image upload ─────────────────────────────────────────────────────

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

  // ── Color / Gallery image upload ──────────────────────────────────────────

  function triggerColorUpload(cvTempId: string) {
    uploadCtxRef.current = { kind: 'color', cvTempId }
    sharedFileRef.current?.click()
  }

  function triggerGalleryUpload() {
    uploadCtxRef.current = { kind: 'gallery' }
    sharedFileRef.current?.click()
  }

  async function handleSharedFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    const ctx  = uploadCtxRef.current
    if (!file || !ctx) return

    const slotKey = ctx.kind === 'color' ? `color-${ctx.cvTempId}` : 'gallery'
    setUploadingSlot(slotKey)

    try {
      const fd = new FormData()
      fd.append('file', file)
      fd.append('folder', 'products')
      const res  = await fetch('/api/admin/upload', { method: 'POST', body: fd })
      const data = await res.json()

      if (data.url) {
        if (ctx.kind === 'color') {
          setColorVariants(prev => prev.map(cv =>
            cv.tempId !== ctx.cvTempId ? cv : {
              ...cv,
              images: [...cv.images, { tempId: uid(), url: data.url }],
            }
          ))
        } else {
          setGalleryImages(prev => [...prev, { tempId: uid(), url: data.url }])
        }
      } else {
        alert(data.error ?? 'Erro ao fazer upload')
      }
    } catch { alert('Erro ao fazer upload') }
    finally {
      setUploadingSlot(null)
      uploadCtxRef.current = null
      if (sharedFileRef.current) sharedFileRef.current.value = ''
    }
  }

  // ── Colour variant helpers ─────────────────────────────────────────────────

  function addColorVariant() {
    setColorVariants(prev => [
      ...prev,
      { tempId: uid(), name: '', hex: '#1A1A1A', images: [] },
    ])
  }

  function removeColorVariant(tempId: string) {
    setColorVariants(prev => prev.filter(cv => cv.tempId !== tempId))
  }

  function updateColorVariant(tempId: string, patch: Partial<Omit<CVariantEntry, 'tempId'>>) {
    setColorVariants(prev => prev.map(cv => cv.tempId !== tempId ? cv : { ...cv, ...patch }))
  }

  function removeColorImage(cvTempId: string, imgTempId: string) {
    setColorVariants(prev => prev.map(cv =>
      cv.tempId !== cvTempId ? cv : { ...cv, images: cv.images.filter(i => i.tempId !== imgTempId) }
    ))
  }

  function removeGalleryImage(tempId: string) {
    setGalleryImages(prev => prev.filter(img => img.tempId !== tempId))
  }

  const TYPE_LABEL: Record<string, string> = { DRYFIT: 'DryFit', PRODUTO_3D: '3D', GEEK: 'Geek' }

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="flex">
      <AdminSidebar />
      <main className="lg:ml-64 flex-1 p-4 sm:p-8 min-h-screen pt-16 lg:pt-0">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-black text-white uppercase tracking-widest" style={{ fontFamily: 'var(--font-bebas)' }}>
              Produtos
            </h1>
            <p className="text-white/40 text-sm mt-1">DryFit, 3D e Geek Store · Gerenciar cores, imagens e flash sales</p>
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
              className={`px-3 py-1.5 text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer ${
                filterType === t.value ? 'bg-[#E10600] text-white' : 'border border-white/10 text-white/50 hover:text-white'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Table */}
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
                      {p.variants.length > 0 && (
                        <div className="flex gap-1 mt-1 flex-wrap">
                          {Array.from(new Set(p.variants.filter(v => v.color).map(v => v.color))).map(c => (
                            <span key={c} className="text-[10px] text-white/30 border border-white/10 px-1">{c}</span>
                          ))}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs border border-white/10 px-2 py-0.5 text-white/50">{TYPE_LABEL[p.type] ?? p.type}</span>
                      {p.subcategory && (
                        <span className="block text-[10px] text-white/30 mt-1">{p.subcategory}</span>
                      )}
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

        {/* ── Modal ── */}
        {showModal && (
          <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
            {/* Shared hidden file input for color/gallery uploads */}
            <input
              ref={sharedFileRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleSharedFileChange}
            />

            <div className="bg-[#161616] border border-white/10 w-full max-w-2xl max-h-[92vh] overflow-y-auto">
              {/* Modal header */}
              <div className="flex items-center justify-between p-5 border-b border-white/10 sticky top-0 bg-[#161616] z-10">
                <h2 className="text-white font-bold">{editing ? 'Editar Produto' : 'Novo Produto'}</h2>
                <button onClick={() => setShowModal(false)} className="text-white/40 hover:text-white cursor-pointer"><X size={20} /></button>
              </div>

              <div className="p-5 space-y-6">

                {/* ── Basic Info ── */}
                <section className="space-y-4">
                  <Field label="Nome">
                    <input
                      value={form.name ?? ''}
                      onChange={e => setForm(f => ({
                        ...f,
                        name: e.target.value,
                        // Auto-generate slug only for new products
                        slug: editing ? f.slug : generateSlug(e.target.value),
                      }))}
                      className={INPUT}
                      placeholder="Nome do produto"
                      autoFocus
                    />
                  </Field>

                  <Field label="Slug (URL)">
                    <div className="relative">
                      <input
                        value={form.slug ?? ''}
                        onChange={e => setForm(f => ({ ...f, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '') }))}
                        className={INPUT}
                        placeholder="slug-do-produto"
                      />
                      {!editing && (
                        <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-white/20 pointer-events-none">
                          auto
                        </span>
                      )}
                    </div>
                  </Field>

                  <Field label="Tipo">
                    <select
                      value={form.type ?? 'DRYFIT'}
                      onChange={e => setForm(f => ({ ...f, type: e.target.value, subcategory: '' }))}
                      className={INPUT}
                    >
                      {PRODUCT_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                    </select>
                  </Field>

                  <Field label="Categoria / Subcategoria">
                    <select
                      value={form.subcategory ?? ''}
                      onChange={e => setForm(f => ({ ...f, subcategory: e.target.value }))}
                      className={INPUT}
                    >
                      <option value="">— Sem categoria —</option>
                      {subcategoryOptions.map(opt => (
                        <option key={opt} value={opt}>{opt}</option>
                      ))}
                    </select>
                    <p className="text-[10px] text-white/25 mt-1">
                      Define em qual filtro o produto aparece na loja.{' '}
                      {form.type !== 'DRYFIT' && (
                        <a href="/admin/categorias-produtos" target="_blank" className="text-[#E10600]/60 hover:text-[#E10600] underline">
                          Gerenciar categorias →
                        </a>
                      )}
                    </p>
                  </Field>

                  <Field label="Público-alvo">
                    <div className="flex gap-1">
                      {[
                        { value: 'MASCULINO', label: '♂ Masculino' },
                        { value: 'FEMININO',  label: '♀ Feminino' },
                        { value: 'UNISEX',    label: 'Unisex' },
                      ].map(opt => (
                        <button
                          key={opt.value}
                          type="button"
                          onClick={() => setForm(f => ({ ...f, gender: opt.value }))}
                          className={`flex-1 py-2 text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer border ${
                            (form.gender ?? 'UNISEX') === opt.value
                              ? 'bg-[#E10600] border-[#E10600] text-white'
                              : 'border-white/10 text-white/40 hover:text-white hover:border-white/30'
                          }`}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  </Field>

                  {/* Prices */}
                  <div className="grid grid-cols-2 gap-3">
                    <Field label="Preco Normal (R$)">
                      <input type="number" step="0.01" min="0" value={form.price ?? ''} onChange={e => setForm(f => ({ ...f, price: parseFloat(e.target.value) }))} className={INPUT} />
                    </Field>
                    <Field label="Preco Original / De (R$)">
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
                        <Field label="Preco Flash Sale (R$)">
                          <input type="number" step="0.01" min="0" value={form.flashSalePrice ?? ''} onChange={e => setForm(f => ({ ...f, flashSalePrice: e.target.value ? parseFloat(e.target.value) : undefined }))} className={INPUT} />
                        </Field>
                        <Field label="Termino da promocao">
                          <input type="datetime-local" value={(form.flashSaleEndsAt as string) ?? ''} onChange={e => setForm(f => ({ ...f, flashSaleEndsAt: e.target.value }))} className={INPUT} />
                        </Field>
                      </div>
                    )}
                  </div>
                </section>

                {/* ── Card Images ── */}
                <section className="border border-white/5 p-4 space-y-4">
                  <p className="text-xs text-white/50 uppercase tracking-wider flex items-center gap-2">
                    <ImageIcon size={13} /> Imagens do Card (listagem)
                  </p>

                  {[
                    { field: 'imageUrl' as const, label: 'Imagem principal', ref: fileMainRef },
                    { field: 'hoverImageUrl' as const, label: 'Imagem hover (ao passar o mouse)', ref: fileHoverRef },
                  ].map(({ field, label, ref }) => (
                    <Field key={field} label={label}>
                      <div className="flex items-start gap-3">
                        <div className="w-16 h-16 bg-black/40 border border-white/10 flex items-center justify-center overflow-hidden flex-shrink-0">
                          {form[field] ? (
                            <Image src={form[field]!} alt="Preview" width={64} height={64} className="w-full h-full object-contain" unoptimized />
                          ) : (
                            <ImageIcon size={20} className="text-white/20" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0 space-y-1">
                          <input ref={ref} type="file" accept="image/*" className="hidden"
                            onChange={e => { const f = e.target.files?.[0]; if (f) handleFileUpload(f, field); if (ref.current) ref.current.value = '' }} />
                          <button type="button" disabled={uploading === field}
                            onClick={() => ref.current?.click()}
                            className="flex items-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 text-white/70 hover:text-white text-xs px-3 py-2 transition-colors cursor-pointer disabled:opacity-50">
                            {uploading === field ? <><Loader2 size={13} className="animate-spin" /> Enviando...</> : <><Upload size={13} /> Escolher imagem</>}
                          </button>
                          {form[field] && (
                            <div className="flex items-center gap-2">
                              <p className="text-[10px] text-white/25 truncate flex-1">{form[field]}</p>
                              <button onClick={() => setForm(f => ({ ...f, [field]: '' }))} className="text-white/20 hover:text-red-400 cursor-pointer flex-shrink-0">
                                <X size={11} />
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </Field>
                  ))}
                  <p className="text-[10px] text-white/20">JPG, PNG, WebP · max. 5 MB</p>
                </section>

                {/* ── Color Variants + Images ── */}
                <section className="border border-white/5">
                  <button
                    type="button"
                    onClick={() => setColorSectionOpen(o => !o)}
                    className="w-full flex items-center justify-between p-4 text-left cursor-pointer hover:bg-white/3 transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <Palette size={14} className="text-[#E10600]" />
                      <span className="text-xs text-white/70 uppercase tracking-wider font-semibold">
                        Cores e Imagens do Produto
                      </span>
                      {colorVariants.length > 0 && (
                        <span className="bg-[#E10600]/20 text-[#E10600] text-[10px] px-1.5 py-0.5 font-bold">
                          {colorVariants.length}
                        </span>
                      )}
                    </div>
                    {colorSectionOpen ? <ChevronUp size={14} className="text-white/30" /> : <ChevronDown size={14} className="text-white/30" />}
                  </button>

                  {colorSectionOpen && (
                    <div className="p-4 pt-0 space-y-4">
                      <p className="text-[11px] text-white/30">
                        Adicione cores e suba fotos para cada uma. O cliente vera as fotos da cor que selecionou.
                      </p>

                      {colorVariants.map(cv => (
                        <div key={cv.tempId} className="border border-white/10 p-4 space-y-3 bg-black/20">
                          {/* Color name + hex */}
                          <div className="flex items-center gap-3">
                            <div className="flex items-center gap-2 flex-1 min-w-0">
                              <input
                                type="color"
                                value={cv.hex}
                                onChange={e => updateColorVariant(cv.tempId, { hex: e.target.value })}
                                className="w-8 h-8 rounded-none border-0 cursor-pointer bg-transparent p-0"
                                title="Escolher cor"
                              />
                              <input
                                value={cv.name}
                                onChange={e => updateColorVariant(cv.tempId, { name: e.target.value })}
                                placeholder="Nome da cor (ex: Preto)"
                                className={`${INPUT} flex-1`}
                              />
                              <input
                                value={cv.hex}
                                onChange={e => updateColorVariant(cv.tempId, { hex: e.target.value })}
                                placeholder="#1A1A1A"
                                className="bg-black/40 border border-white/10 text-white placeholder-white/20 px-2 py-2 text-xs w-24 font-mono focus:outline-none focus:border-[#E10600]/60"
                              />
                            </div>
                            <button
                              type="button"
                              onClick={() => removeColorVariant(cv.tempId)}
                              className="p-1.5 text-white/30 hover:text-red-400 cursor-pointer flex-shrink-0"
                              title="Remover cor"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>

                          {/* Color images */}
                          <div>
                            <p className="text-[10px] text-white/30 mb-2 uppercase tracking-wider">
                              Imagens — {cv.images.length}/{MAX_COLOR_IMAGES}
                            </p>
                            <div className="flex flex-wrap gap-2">
                              {cv.images.map(img => (
                                <div key={img.tempId} className="relative w-16 h-16 border border-white/10 overflow-hidden group/img flex-shrink-0">
                                  <Image src={img.url} alt="" fill className="object-cover" unoptimized />
                                  <button
                                    type="button"
                                    onClick={() => removeColorImage(cv.tempId, img.tempId)}
                                    className="absolute inset-0 bg-black/60 opacity-0 group-hover/img:opacity-100 flex items-center justify-center cursor-pointer transition-opacity"
                                  >
                                    <X size={14} className="text-white" />
                                  </button>
                                </div>
                              ))}

                              {cv.images.length < MAX_COLOR_IMAGES && (
                                <button
                                  type="button"
                                  disabled={uploadingSlot === `color-${cv.tempId}`}
                                  onClick={() => triggerColorUpload(cv.tempId)}
                                  className="w-16 h-16 border border-dashed border-white/20 flex flex-col items-center justify-center text-white/30 hover:text-white hover:border-white/40 cursor-pointer transition-colors disabled:opacity-50 flex-shrink-0"
                                >
                                  {uploadingSlot === `color-${cv.tempId}` ? (
                                    <Loader2 size={16} className="animate-spin" />
                                  ) : (
                                    <>
                                      <Upload size={14} />
                                      <span className="text-[9px] mt-0.5">Add</span>
                                    </>
                                  )}
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}

                      <button
                        type="button"
                        onClick={addColorVariant}
                        className="flex items-center gap-2 border border-dashed border-white/20 text-white/40 hover:text-white hover:border-white/40 px-4 py-2 text-xs cursor-pointer transition-colors w-full justify-center"
                      >
                        <Plus size={13} /> Adicionar Cor
                      </button>
                    </div>
                  )}
                </section>

                {/* ── Gallery Images ── */}
                <section className="border border-white/5">
                  <button
                    type="button"
                    onClick={() => setGallerySectionOpen(o => !o)}
                    className="w-full flex items-center justify-between p-4 text-left cursor-pointer hover:bg-white/3 transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <Images size={14} className="text-[#E10600]" />
                      <span className="text-xs text-white/70 uppercase tracking-wider font-semibold">
                        Galeria Geral
                      </span>
                      {galleryImages.length > 0 && (
                        <span className="bg-white/10 text-white/50 text-[10px] px-1.5 py-0.5">
                          {galleryImages.length}/{MAX_GALLERY}
                        </span>
                      )}
                    </div>
                    {gallerySectionOpen ? <ChevronUp size={14} className="text-white/30" /> : <ChevronDown size={14} className="text-white/30" />}
                  </button>

                  {gallerySectionOpen && (
                    <div className="p-4 pt-0 space-y-3">
                      <p className="text-[11px] text-white/30">
                        Fotos extras exibidas na pagina do produto para todas as cores. Max. {MAX_GALLERY} imagens.
                      </p>

                      <div className="flex flex-wrap gap-2">
                        {galleryImages.map((img, i) => (
                          <div key={img.tempId} className="relative w-16 h-16 border border-white/10 overflow-hidden group/img flex-shrink-0">
                            <Image src={img.url} alt="" fill className="object-cover" unoptimized />
                            {i === 0 && (
                              <span className="absolute top-0.5 left-0.5 text-[8px] bg-[#E10600] text-white px-1 leading-tight">P</span>
                            )}
                            <button
                              type="button"
                              onClick={() => removeGalleryImage(img.tempId)}
                              className="absolute inset-0 bg-black/60 opacity-0 group-hover/img:opacity-100 flex items-center justify-center cursor-pointer transition-opacity"
                            >
                              <X size={14} className="text-white" />
                            </button>
                          </div>
                        ))}

                        {galleryImages.length < MAX_GALLERY && (
                          <button
                            type="button"
                            disabled={uploadingSlot === 'gallery'}
                            onClick={triggerGalleryUpload}
                            className="w-16 h-16 border border-dashed border-white/20 flex flex-col items-center justify-center text-white/30 hover:text-white hover:border-white/40 cursor-pointer transition-colors disabled:opacity-50 flex-shrink-0"
                          >
                            {uploadingSlot === 'gallery' ? (
                              <Loader2 size={16} className="animate-spin" />
                            ) : (
                              <>
                                <Upload size={14} />
                                <span className="text-[9px] mt-0.5">Add</span>
                              </>
                            )}
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </section>

                {/* ── Description + Material ── */}
                <section className="space-y-4">
                  <Field label="Descricao">
                    <textarea value={form.description ?? ''} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={3} className={INPUT} placeholder="Descricao do produto..." />
                  </Field>
                  <Field label="Material / Composicao">
                    <input value={form.material ?? ''} onChange={e => setForm(f => ({ ...f, material: e.target.value }))} className={INPUT} placeholder="Ex: 100% Poliester" />
                  </Field>

                  <div className="flex items-center gap-4">
                    {([['isNew', 'Novo'], ['isFeatured', 'Destaque'], ['active', 'Ativo']] as const).map(([key, label]) => (
                      <label key={key} className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" checked={!!(form as any)[key]} onChange={e => setForm(f => ({ ...f, [key]: e.target.checked }))} />
                        <span className="text-sm text-white/60">{label}</span>
                      </label>
                    ))}
                  </div>
                </section>

                {/* ── Footer ── */}
                <div className="flex gap-3 pt-2 border-t border-white/5">
                  <button onClick={() => setShowModal(false)} className="flex-1 border border-white/10 text-white/60 hover:text-white py-2.5 text-sm transition-colors cursor-pointer">
                    Cancelar
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={saving || !form.name?.trim()}
                    className="flex-1 bg-[#E10600] hover:bg-[#B80000] text-white py-2.5 text-sm font-bold transition-colors disabled:opacity-60 cursor-pointer flex items-center justify-center gap-2"
                  >
                    <Check size={16} /> {saving ? 'Salvando...' : 'Salvar Produto'}
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
