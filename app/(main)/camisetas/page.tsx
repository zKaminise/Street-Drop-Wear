'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { ChevronLeft, Check, Zap, Plus, Minus, ZoomIn } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { TShirtPreview, type TShirtView } from '@/components/customizer/TShirtPreview'
import { useCartStore } from '@/lib/store'
import { formatPrice } from '@/lib/utils'
import { ShirtBenefits } from '@/components/products/ShirtBenefits'
import { SizeTableDisplay } from '@/components/products/SizeTableDisplay'
import { RelatedExplore } from '@/components/products/RelatedExplore'

type StockBySize = { size: string; quantity: number }
type ApiColor = { id: string; name: string; hex: string; active: boolean; stock: StockBySize[] }
type ApiBase = {
  id: string; name: string; type: string; basePrice: number
  description?: string; createdAt: string; colors: ApiColor[]
}
type ApiStamp = {
  id: string; name: string; slug: string; extraPrice: number
  allowedFor: string; category?: string; active: boolean
  imageUrl?: string
  categoryId?: string | null
  categoryName?: string | null
}

type ApiCategory = { id: string; name: string; slug: string }
type ApiCombination = {
  id: string; baseId: string; colorId: string; stampId?: string
  imageFront?: string; imageBack?: string
}

const SIZES = ['PP', 'P', 'M', 'G', 'GG', 'XGG']

export default function CamisetasPage() {
  const addItem = useCartStore(s => s.addItem)
  const openCart = useCartStore(s => s.openCart)

  const [bases, setBases] = useState<ApiBase[]>([])
  const [stamps, setStamps] = useState<ApiStamp[]>([])
  const [categories, setCategories] = useState<ApiCategory[]>([])
  const [combinations, setCombinations] = useState<ApiCombination[]>([])
  const [loading, setLoading] = useState(true)

  const [selectedBase, setSelectedBase] = useState<ApiBase | null>(null)
  const [selectedColor, setSelectedColor] = useState<ApiColor | null>(null)
  const [selectedStamp, setSelectedStamp] = useState<ApiStamp | null>(null)
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [selectedSize, setSelectedSize] = useState<string | null>(null)
  const [quantity, setQuantity] = useState(1)
  const [view, setView] = useState<TShirtView>('front')
  const [previewZoom, setPreviewZoom] = useState<{ x: number; y: number } | null>(null)

  useEffect(() => {
    Promise.all([
      fetch('/api/bases?type=CAMISETA').then(r => r.json()),
      fetch('/api/stamps?type=CAMISETA').then(r => r.json()),
      fetch('/api/combinations?type=CAMISETA').then(r => r.json()).catch(() => []),
      fetch('/api/stamp-categories').then(r => r.json()).catch(() => []),
    ]).then(([basesData, stampsData, combosData, catsData]) => {
      setBases(basesData)
      setStamps(stampsData)
      setCombinations(Array.isArray(combosData) ? combosData : [])
      setCategories(Array.isArray(catsData) ? catsData : [])
      if (basesData.length > 0) {
        setSelectedBase(basesData[0])
        if (basesData[0].colors.length > 0) setSelectedColor(basesData[0].colors[0])
      }
      const noStamp = stampsData.find((s: ApiStamp) => s.slug === 'sem-estampa')
      if (noStamp) setSelectedStamp(noStamp)
    }).catch(() => {}).finally(() => setLoading(false))
  }, [])

  function getStock(size: string) {
    if (!selectedColor) return 0
    return selectedColor.stock.find(s => s.size === size)?.quantity ?? 0
  }

  function handleColorSelect(color: ApiColor) {
    setSelectedColor(color)
    setSelectedSize(null)
  }

  function handleBaseSelect(base: ApiBase) {
    setSelectedBase(base)
    setSelectedColor(base.colors[0] ?? null)
    setSelectedSize(null)
  }

  const currentCombo = combinations.find(c =>
    c.baseId === selectedBase?.id &&
    c.colorId === selectedColor?.id &&
    (selectedStamp?.slug === 'sem-estampa' ? !c.stampId : c.stampId === selectedStamp?.id)
  )

  // Image that is actually shown in TShirtPreview (for zoom)
  const previewImage = view === 'front'
    ? (currentCombo?.imageFront ?? currentCombo?.imageBack ?? null)
    : (currentCombo?.imageBack ?? currentCombo?.imageFront ?? null)

  const totalPrice = (selectedBase?.basePrice ?? 0) + (selectedStamp?.extraPrice ?? 0)
  const maxQty = selectedSize ? getStock(selectedSize) : 0
  const canAdd = !!selectedColor && !!selectedSize && maxQty > 0

  function handleAddToCart() {
    if (!canAdd || !selectedBase || !selectedColor || !selectedSize) return
    const hasStamp = selectedStamp && selectedStamp.slug !== 'sem-estampa'
    addItem(
      {
        id: `camiseta-${selectedBase.id}-${selectedColor.id}-${selectedStamp?.slug ?? 'sem-estampa'}`,
        name: `${selectedBase.name}${hasStamp ? ` – ${selectedStamp!.name}` : ''}`,
        slug: 'camisetas',
        category: 'camisetas',
        price: totalPrice,
        colors: [{ name: selectedColor.name, hex: selectedColor.hex }],
        sizes: SIZES.map(s => ({ label: s, available: getStock(s) > 0 })),
        images: [],
        stock: maxQty,
        status: (maxQty > 5 ? 'available' : maxQty > 0 ? 'low_stock' : 'out_of_stock') as 'available' | 'low_stock' | 'out_of_stock',
        rating: 5.0, reviewCount: 0, tags: [], isPersonalizable: true, isFeatured: false, isNew: false,
        description: '', shortDescription: '', sku: `custom-camiseta-${selectedBase.id}`,
        createdAt: new Date().toISOString(),
      },
      { name: selectedColor.name, hex: selectedColor.hex },
      { label: selectedSize, available: true },
      quantity,
      {
        isCustomShirt: true,
        baseId: selectedBase.id,
        baseName: selectedBase.name,
        baseType: 'CAMISETA',
        stampId: hasStamp ? selectedStamp!.id : undefined,
        stampName: hasStamp ? selectedStamp!.name : undefined,
        stampSlug: hasStamp ? selectedStamp!.slug : undefined,
        stampExtraPrice: selectedStamp?.extraPrice,
        previewImageUrl: currentCombo ? (view === 'front' ? currentCombo.imageFront : currentCombo.imageBack) ?? undefined : undefined,
        productionDays: 12,
      }
    )
    openCart()
  }

  // (category grouping handled inline in JSX)

  if (loading) {
    return (
      <div className="min-h-screen bg-brand-black flex items-center justify-center">
        <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}>
          <div className="w-8 h-8 border-2 border-brand-red border-t-transparent rounded-full" />
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-brand-black">
      {/* Header strip */}
      <div className="sticky z-30 bg-brand-black/95 backdrop-blur-md border-b border-white/5" style={{ top: 'calc(72px + var(--announcement-bar-h, 0px))' }}>
        <div className="container-brand flex items-center justify-between h-14">
          <Link href="/" className="flex items-center gap-2 text-sm text-white/50 hover:text-white transition-colors">
            <ChevronLeft size={16} /> Início
          </Link>
          <h1 className="text-sm font-black uppercase tracking-widest text-white">Monte sua Camiseta</h1>
          <div className="text-right">
            <p className="text-lg font-black text-white">{formatPrice(totalPrice)}</p>
          </div>
        </div>
      </div>

      <div className="container-brand py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">

          {/* LEFT – Preview */}
          <div className="lg:sticky self-start space-y-4" style={{ top: 'calc(144px + var(--announcement-bar-h, 0px))' }}>
            {/* Front/Back toggle */}
            <div className="flex gap-2">
              {(['front', 'back'] as TShirtView[]).map(v => (
                <button
                  key={v}
                  onClick={() => setView(v)}
                  className={`flex-1 py-2 text-xs font-bold uppercase tracking-wider border transition-all cursor-pointer ${
                    view === v
                      ? 'border-brand-red bg-brand-red/10 text-white'
                      : 'border-white/10 text-white/40 hover:border-white/25 hover:text-white/70'
                  }`}
                >
                  {v === 'front' ? '↪ Frente' : '↩ Costas'}
                </button>
              ))}
            </div>

            {/* T-Shirt Preview */}
            <div
              className="bg-[#E8E8E6] border border-black/[0.06] overflow-hidden relative"
              style={previewImage ? { cursor: 'crosshair' } : undefined}
              onMouseMove={previewImage ? e => {
                const r = e.currentTarget.getBoundingClientRect()
                setPreviewZoom({ x: ((e.clientX - r.left) / r.width) * 100, y: ((e.clientY - r.top) / r.height) * 100 })
              } : undefined}
              onMouseLeave={previewImage ? () => setPreviewZoom(null) : undefined}
            >
              <TShirtPreview
                colorHex={selectedColor?.hex ?? '#0B0B0D'}
                stampSlug={selectedStamp?.slug}
                stampName={selectedStamp?.name}
                isOversized={false}
                view={view}
                imageFront={currentCombo?.imageFront}
                imageBack={currentCombo?.imageBack}
                previewBg="#E8E8E6"
              />
              {previewImage && previewZoom && (
                <div
                  className="absolute inset-0 pointer-events-none"
                  style={{
                    backgroundImage: `url(${previewImage})`,
                    backgroundSize: '280%',
                    backgroundPosition: `${previewZoom.x}% ${previewZoom.y}%`,
                    backgroundRepeat: 'no-repeat',
                  }}
                />
              )}
              {previewImage && !previewZoom && (
                <div className="absolute bottom-2 right-2 flex items-center gap-1 text-white/25 text-[10px] pointer-events-none select-none">
                  <ZoomIn size={11} /> Ampliar
                </div>
              )}
            </div>

            {/* Price breakdown */}
            <div className="bg-brand-graphite border border-white/5 p-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-white/50">Base ({selectedBase?.name ?? '–'})</span>
                <span className="text-white">{formatPrice(selectedBase?.basePrice ?? 0)}</span>
              </div>
              {selectedStamp && selectedStamp.extraPrice > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-white/50">Estampa ({selectedStamp.name})</span>
                  <span className="text-brand-red">+{formatPrice(selectedStamp.extraPrice)}</span>
                </div>
              )}
              <div className="flex justify-between font-bold border-t border-white/10 pt-2">
                <span className="text-white">Total</span>
                <span className="text-white text-lg">{formatPrice(totalPrice)}</span>
              </div>
            </div>
          </div>

          {/* RIGHT – Options */}
          <div className="space-y-7">
            <div>
              <h2 className="heading-display text-3xl text-white">Monte sua Camiseta</h2>
              <p className="text-sm text-white/40 mt-1">Algodão 180g · Regular &amp; Slim fit · Impressão DTF · Prazo 7-12 dias</p>
            </div>

            {/* Step 1: Base */}
            {bases.length > 1 && (
              <StepSection step="1" title="Escolha a Base">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {bases.map(base => (
                    <button
                      key={base.id}
                      onClick={() => handleBaseSelect(base)}
                      className={`flex items-center justify-between px-4 py-3 border text-sm transition-all cursor-pointer ${
                        selectedBase?.id === base.id
                          ? 'border-brand-red bg-brand-red/5 text-white'
                          : 'border-white/10 text-white/60 hover:border-white/30 hover:text-white'
                      }`}
                    >
                      <span className="font-medium">{base.name}</span>
                      <span className="text-xs text-brand-red">{formatPrice(base.basePrice)}</span>
                    </button>
                  ))}
                </div>
              </StepSection>
            )}

            {/* Step 2: Color */}
            <StepSection step={bases.length > 1 ? '2' : '1'} title="Escolha a Cor">
              {selectedColor && (
                <p className="text-xs text-white/50 mb-2">Selecionada: <span className="text-white font-semibold">{selectedColor.name}</span></p>
              )}
              <div className="flex flex-wrap gap-2">
                {(selectedBase?.colors ?? []).map(color => {
                  const hasStock = SIZES.some(s => (color.stock.find(st => st.size === s)?.quantity ?? 0) > 0)
                  return (
                    <button
                      key={color.id}
                      onClick={() => hasStock && handleColorSelect(color)}
                      disabled={!hasStock}
                      title={color.name}
                      className={`flex items-center gap-2 px-3 py-2 border text-xs transition-all ${
                        !hasStock ? 'opacity-30 cursor-not-allowed border-white/5' :
                        selectedColor?.id === color.id
                          ? 'border-brand-red bg-brand-red/5 text-white cursor-pointer'
                          : 'border-white/10 text-white/50 hover:border-white/30 hover:text-white cursor-pointer'
                      }`}
                    >
                      <span className="w-3.5 h-3.5 rounded-full border border-white/20 flex-shrink-0" style={{ backgroundColor: color.hex }} />
                      {color.name}
                      {!hasStock && <span className="text-[9px] text-white/30">Esgotado</span>}
                    </button>
                  )
                })}
              </div>
            </StepSection>

            {/* Step 3: Stamp */}
            <StepSection step={bases.length > 1 ? '3' : '2'} title="Escolha a Estampa">
              <div className="space-y-3">
                {/* Category filter pills */}
                {categories.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    <button
                      onClick={() => setSelectedCategory(null)}
                      className={`px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider transition-all cursor-pointer ${
                        !selectedCategory
                          ? 'bg-brand-red text-white'
                          : 'border border-white/15 text-white/50 hover:border-white/30 hover:text-white'
                      }`}
                    >
                      Todas
                    </button>
                    {categories.map(cat => (
                      <button
                        key={cat.id}
                        onClick={() => setSelectedCategory(selectedCategory === cat.id ? null : cat.id)}
                        className={`px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider transition-all cursor-pointer ${
                          selectedCategory === cat.id
                            ? 'bg-brand-red text-white'
                            : 'border border-white/15 text-white/50 hover:border-white/30 hover:text-white'
                        }`}
                      >
                        {cat.name}
                      </button>
                    ))}
                  </div>
                )}

                {(() => {
                  const visible = selectedCategory
                    ? stamps.filter(s => s.categoryId === selectedCategory)
                    : stamps

                  if (visible.length === 0) {
                    return <p className="text-xs text-white/30 py-4 text-center">Nenhuma estampa nesta categoria ainda.</p>
                  }

                  if (selectedCategory) {
                    return (
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                        {visible.map(stamp => (
                          <StampCard key={stamp.id} stamp={stamp} selected={selectedStamp?.id === stamp.id} onSelect={setSelectedStamp} />
                        ))}
                      </div>
                    )
                  }

                  const groups = visible.reduce<Record<string, ApiStamp[]>>((acc, s) => {
                    const cat = s.categoryName ?? 'Outros'
                    if (!acc[cat]) acc[cat] = []
                    acc[cat].push(s)
                    return acc
                  }, {})

                  return (
                    <div className="space-y-4">
                      {Object.entries(groups).map(([cat, catStamps]) => (
                        <div key={cat}>
                          <p className="text-xs text-white/30 uppercase tracking-widest mb-2">{cat}</p>
                          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                            {catStamps.map(stamp => (
                              <StampCard key={stamp.id} stamp={stamp} selected={selectedStamp?.id === stamp.id} onSelect={setSelectedStamp} />
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  )
                })()}
              </div>
            </StepSection>

            {/* Step 4: Size */}
            <StepSection step={bases.length > 1 ? '4' : '3'} title="Escolha o Tamanho">
              <div className="flex flex-wrap gap-2">
                {SIZES.map(size => {
                  const stock = getStock(size)
                  const isSelected = selectedSize === size
                  return (
                    <button
                      key={size}
                      onClick={() => stock > 0 && setSelectedSize(size)}
                      disabled={stock === 0}
                      title={stock === 0 ? 'Esgotado' : `${stock} disponíveis`}
                      className={`w-12 h-12 border text-sm font-bold uppercase transition-all ${
                        stock === 0
                          ? 'border-white/5 text-white/20 cursor-not-allowed line-through'
                          : isSelected
                          ? 'border-brand-red bg-brand-red/10 text-brand-red cursor-pointer'
                          : 'border-white/10 text-white/60 hover:border-white/30 hover:text-white cursor-pointer'
                      }`}
                    >
                      {size}
                    </button>
                  )
                })}
              </div>
              {selectedSize ? (
                <p className="text-xs text-white/40 mt-2">{getStock(selectedSize)} unidade(s) disponível(is)</p>
              ) : (
                <p className="text-xs text-brand-red mt-2">Selecione um tamanho para continuar</p>
              )}
            </StepSection>

            {/* Qty + Add to cart */}
            <div className="space-y-3 pt-2 border-t border-white/5">
              <div className="flex items-center gap-3">
                <div className="flex items-center border border-white/10">
                  <button onClick={() => setQuantity(q => Math.max(1, q - 1))} className="w-11 h-11 flex items-center justify-center text-white/50 hover:text-white transition-colors cursor-pointer">
                    <Minus size={16} />
                  </button>
                  <span className="w-12 text-center text-base font-bold text-white">{quantity}</span>
                  <button onClick={() => setQuantity(q => Math.min(q + 1, maxQty || 99))} className="w-11 h-11 flex items-center justify-center text-white/50 hover:text-white transition-colors cursor-pointer">
                    <Plus size={16} />
                  </button>
                </div>

                <button
                  onClick={handleAddToCart}
                  disabled={!canAdd}
                  className="btn-primary flex-1 justify-center disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <Zap size={18} />
                  Adicionar ao Carrinho
                </button>
              </div>

              {canAdd && (
                <p className="text-xs text-green-400 flex items-center gap-1">
                  <Check size={12} /> {formatPrice(totalPrice * quantity)} no total · Prazo 7-12 dias úteis
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Size table */}
      <div className="container-brand">
        <SizeTableDisplay productType="CAMISETA" />
      </div>

      {/* Quality benefits */}
      <ShirtBenefits type="camiseta" />

      {/* Related sections */}
      <RelatedExplore currentType="CAMISETA" />
    </div>
  )
}

function StepSection({ step, title, children }: { step: string; title: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="flex items-center gap-3 mb-3">
        <span className="w-6 h-6 bg-brand-red text-white text-xs font-bold flex items-center justify-center flex-shrink-0">{step}</span>
        <h3 className="text-sm font-bold text-white uppercase tracking-wider">{title}</h3>
      </div>
      {children}
    </div>
  )
}

function StampCard({ stamp, selected, onSelect }: { stamp: ApiStamp; selected: boolean; onSelect: (s: ApiStamp) => void }) {
  return (
    <button
      onClick={() => onSelect(stamp)}
      className={`flex flex-col items-center gap-2 p-2.5 border text-center transition-all cursor-pointer ${
        selected
          ? 'border-brand-red bg-brand-red/5'
          : 'border-white/10 hover:border-white/30 hover:bg-white/[0.03]'
      }`}
    >
      <div className="w-full">
        <StampThumb stamp={stamp} selected={selected} />
      </div>
      <span className="text-[11px] text-white/70 leading-tight font-medium w-full text-center">{stamp.name}</span>
      {stamp.extraPrice > 0
        ? <span className="text-[10px] text-brand-red font-semibold">+{formatPrice(stamp.extraPrice)}</span>
        : <span className="text-[10px] text-white/30">Gratis</span>
      }
    </button>
  )
}

function StampThumb({ stamp, selected }: { stamp: ApiStamp; selected?: boolean }) {
  const hasImage =
    stamp.imageUrl &&
    stamp.imageUrl !== '/stamps/placeholder.svg' &&
    !stamp.imageUrl.startsWith('data:')

  if (hasImage) {
    return (
      <div className="w-full aspect-square relative overflow-hidden bg-black/30">
        <Image
          src={stamp.imageUrl!}
          alt={stamp.name}
          fill
          className="object-contain p-1"
          quality={90}
          unoptimized
        />
      </div>
    )
  }

  const COLORS: Record<string, string> = {
    'sem-estampa': '#2A2A2A', 'streetdrop-logo': '#E10600', 'urban-skull': '#FF4444',
    'dragon-fire': '#FF6B35', 'tokyo-night': '#7C3AED', 'neon-wave': '#06B6D4',
    'mountain-peak': '#10B981', 'cyber-grid': '#3B82F6',
  }
  const color = COLORS[stamp.slug] ?? '#E10600'
  return (
    <div className="w-full aspect-square flex items-center justify-center" style={{ backgroundColor: `${color}12` }}>
      <svg viewBox="0 0 48 48" className="w-3/4 h-3/4" fill="none">
        <circle cx="24" cy="22" r="13" fill={`${color}30`} />
        <circle cx="24" cy="22" r="7" fill={color} opacity={selected ? 1 : 0.65} />
        {stamp.slug === 'sem-estampa' && (
          <line x1="8" y1="8" x2="40" y2="40" stroke="#555" strokeWidth="2" />
        )}
      </svg>
    </div>
  )
}
