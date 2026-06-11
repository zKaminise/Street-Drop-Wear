'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { ShoppingBag, ChevronLeft, Check, Zap, Plus, Minus } from 'lucide-react'
import { TShirtPreview } from '@/components/customizer/TShirtPreview'
import { useCartStore } from '@/lib/store'
import { formatPrice } from '@/lib/utils'

type StockBySize = { size: string; quantity: number }
type BaseColor = { id: string; name: string; hex: string; active: boolean; stock: StockBySize[] }
type Base = { id: string; name: string; type: string; basePrice: number; colors: BaseColor[] }
type Stamp = { id: string; name: string; slug: string; extraPrice: number; allowedFor: string; category?: string }

const SIZES = ['PP', 'P', 'M', 'G', 'GG', 'XGG']

export default function PersonalizarPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const addItem = useCartStore(s => s.addItem)
  const openCart = useCartStore(s => s.openCart)

  // Data
  const [bases, setBases] = useState<Base[]>([])
  const [stamps, setStamps] = useState<Stamp[]>([])
  const [loading, setLoading] = useState(true)

  // Selections
  const [selectedBase, setSelectedBase] = useState<Base | null>(null)
  const [selectedColor, setSelectedColor] = useState<BaseColor | null>(null)
  const [selectedStamp, setSelectedStamp] = useState<Stamp | null>(null)
  const [selectedSize, setSelectedSize] = useState<string | null>(null)
  const [quantity, setQuantity] = useState(1)

  // Type from slug prefix
  const shirtType = params.id.startsWith('oversized') ? 'OVERSIZED' : 'CAMISETA'

  useEffect(() => {
    async function loadData() {
      try {
        const [basesData, stampsData] = await Promise.all([
          fetch(`/api/bases?type=${shirtType}`).then(r => r.json()),
          fetch(`/api/stamps?type=${shirtType}`).then(r => r.json()),
        ])
        setBases(basesData)
        setStamps(stampsData)
        if (basesData.length > 0) {
          setSelectedBase(basesData[0])
          if (basesData[0].colors.length > 0) setSelectedColor(basesData[0].colors[0])
        }
        const semEstampa = stampsData.find((s: Stamp) => s.slug === 'sem-estampa')
        if (semEstampa) setSelectedStamp(semEstampa)
      } catch (e) {
        // silently continue — user will see empty state
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [shirtType])

  function getStockForSize(size: string): number {
    if (!selectedColor) return 0
    return selectedColor.stock.find(s => s.size === size)?.quantity ?? 0
  }

  function handleColorSelect(color: BaseColor) {
    setSelectedColor(color)
    setSelectedSize(null)
  }

  function handleBaseSelect(base: Base) {
    setSelectedBase(base)
    setSelectedColor(base.colors[0] ?? null)
    setSelectedSize(null)
  }

  const totalPrice = (selectedBase?.basePrice ?? 0) + (selectedStamp?.extraPrice ?? 0)
  const maxQty = selectedSize ? getStockForSize(selectedSize) : 0
  const canAdd = selectedColor && selectedSize && maxQty > 0

  function handleAddToCart() {
    if (!canAdd || !selectedBase || !selectedColor || !selectedSize) return
    addItem(
      {
        id: `${selectedBase.id}-${selectedColor.id}-${selectedStamp?.slug ?? 'sem-estampa'}`,
        name: `${selectedBase.name}${selectedStamp && selectedStamp.slug !== 'sem-estampa' ? ` – ${selectedStamp.name}` : ''}`,
        slug: params.id,
        category: shirtType === 'OVERSIZED' ? 'oversized' : 'camisetas',
        price: totalPrice,
        colors: [{ name: selectedColor.name, hex: selectedColor.hex }],
        sizes: SIZES.map(s => ({ label: s, available: getStockForSize(s) > 0 })),
        images: [],
        stock: maxQty,
        status: (maxQty > 5 ? 'available' : maxQty > 0 ? 'low_stock' : 'out_of_stock') as 'available' | 'low_stock' | 'out_of_stock',
        rating: 5.0,
        reviewCount: 0,
        tags: [],
        isPersonalizable: true,
        isFeatured: false,
        isNew: false,
        description: '',
        shortDescription: '',
        sku: `custom-${selectedBase.id}`,
        createdAt: new Date().toISOString(),
      },
      { name: selectedColor.name, hex: selectedColor.hex },
      { label: selectedSize, available: true },
      quantity
    )
    openCart()
  }

  const stampGroups = stamps.reduce<Record<string, Stamp[]>>((acc, s) => {
    const cat = s.category ?? 'Outros'
    if (!acc[cat]) acc[cat] = []
    acc[cat].push(s)
    return acc
  }, {})

  if (loading) {
    return (
      <div className="min-h-screen bg-brand-black flex items-center justify-center">
        <p className="text-white/40">Carregando configurador...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-brand-black">
      {/* Header */}
      <div className="sticky top-0 z-30 bg-brand-black/95 backdrop-blur-md border-b border-white/5">
        <div className="container-brand flex items-center justify-between h-14">
          <Link href={`/${params.id.includes('oversized') ? 'oversized' : 'camisetas'}`} className="flex items-center gap-2 text-sm text-white/60 hover:text-white transition-colors">
            <ChevronLeft size={16} /> Voltar
          </Link>
          <h1 className="text-sm font-bold uppercase tracking-widest text-white">
            Monte sua {shirtType === 'OVERSIZED' ? 'Oversized' : 'Camiseta'}
          </h1>
          <div className="text-right">
            <p className="text-lg font-black text-white">{formatPrice(totalPrice)}</p>
          </div>
        </div>
      </div>

      <div className="container-brand py-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">

          {/* LEFT: Preview */}
          <div className="lg:sticky lg:top-20 self-start">
            <div className="bg-[#E8E8E6] border border-black/[0.06] overflow-hidden">
              <TShirtPreview
                colorHex={selectedColor?.hex ?? '#0B0B0D'}
                stampSlug={selectedStamp?.slug}
                stampName={selectedStamp?.name}
                isOversized={shirtType === 'OVERSIZED'}
                previewBg="#E8E8E6"
              />
            </div>

            {/* Price breakdown */}
            <div className="mt-4 bg-brand-graphite border border-white/5 p-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-white/50">Base ({selectedBase?.name ?? '–'})</span>
                <span className="text-white">{formatPrice(selectedBase?.basePrice ?? 0)}</span>
              </div>
              {selectedStamp && selectedStamp.extraPrice > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-white/50">Estampa ({selectedStamp.name})</span>
                  <span className="text-[#E10600]">+{formatPrice(selectedStamp.extraPrice)}</span>
                </div>
              )}
              <div className="flex justify-between font-bold border-t border-white/10 pt-2">
                <span className="text-white">Total</span>
                <span className="text-white text-lg">{formatPrice(totalPrice)}</span>
              </div>
            </div>
          </div>

          {/* RIGHT: Selectors */}
          <div className="space-y-6">

            {/* Step 1: Base */}
            {bases.length > 1 && (
              <Section step="1" title="Escolha a Base">
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
              </Section>
            )}

            {/* Step 2: Color */}
            <Section step={bases.length > 1 ? '2' : '1'} title="Escolha a Cor">
              <div className="flex flex-wrap gap-2">
                {(selectedBase?.colors ?? []).map(color => {
                  const hasStock = SIZES.some(s => (color.stock.find(st => st.size === s)?.quantity ?? 0) > 0)
                  return (
                    <button
                      key={color.id}
                      onClick={() => hasStock && handleColorSelect(color)}
                      disabled={!hasStock}
                      title={color.name}
                      className={`group relative flex items-center gap-2 px-3 py-2 border text-xs transition-all ${
                        !hasStock ? 'opacity-30 cursor-not-allowed border-white/5' :
                        selectedColor?.id === color.id
                          ? 'border-brand-red bg-brand-red/5 text-white cursor-pointer'
                          : 'border-white/10 text-white/50 hover:border-white/30 hover:text-white cursor-pointer'
                      }`}
                    >
                      <span className="w-3.5 h-3.5 rounded-full border border-white/20 flex-shrink-0" style={{ backgroundColor: color.hex }} />
                      {color.name}
                    </button>
                  )
                })}
              </div>
            </Section>

            {/* Step 3: Stamp */}
            <Section step={bases.length > 1 ? '3' : '2'} title="Escolha a Estampa">
              <div className="space-y-4">
                {Object.entries(stampGroups).map(([cat, catStamps]) => (
                  <div key={cat}>
                    <p className="text-xs text-white/30 uppercase tracking-widest mb-2">{cat}</p>
                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                      {catStamps.map(stamp => (
                        <button
                          key={stamp.id}
                          onClick={() => setSelectedStamp(stamp)}
                          className={`flex flex-col items-center gap-1.5 p-2 border text-center transition-all cursor-pointer ${
                            selectedStamp?.id === stamp.id
                              ? 'border-brand-red bg-brand-red/5'
                              : 'border-white/10 hover:border-white/25'
                          }`}
                        >
                          <StampThumb slug={stamp.slug} />
                          <span className="text-[10px] text-white/60 leading-tight">{stamp.name}</span>
                          {stamp.extraPrice > 0
                            ? <span className="text-[10px] text-brand-red">+{formatPrice(stamp.extraPrice)}</span>
                            : <span className="text-[10px] text-white/30">Grátis</span>
                          }
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </Section>

            {/* Step 4: Size */}
            <Section step={bases.length > 1 ? '4' : '3'} title="Escolha o Tamanho">
              <div className="flex flex-wrap gap-2">
                {SIZES.map(size => {
                  const stock = getStockForSize(size)
                  const isSelected = selectedSize === size
                  return (
                    <button
                      key={size}
                      onClick={() => stock > 0 && setSelectedSize(size)}
                      disabled={stock === 0}
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
              {selectedSize && (
                <p className="text-xs text-white/40 mt-2">
                  {getStockForSize(selectedSize)} unidade(s) disponível(is)
                </p>
              )}
              {!selectedSize && (
                <p className="text-xs text-brand-red mt-2">Selecione um tamanho para continuar</p>
              )}
            </Section>

            {/* Quantity + Add to cart */}
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
                <Check size={12} /> {formatPrice(totalPrice * quantity)} no total
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function Section({ step, title, children }: { step: string; title: string; children: React.ReactNode }) {
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

function StampThumb({ slug }: { slug: string }) {
  const colors: Record<string, string> = {
    'sem-estampa': '#2A2A2A', 'streetdrop-logo': '#E10600', 'urban-skull': '#FF4444',
    'dragon-fire': '#FF6B35', 'tokyo-night': '#7C3AED', 'neon-wave': '#06B6D4',
    'mountain-peak': '#10B981', 'cyber-grid': '#3B82F6',
  }
  const color = colors[slug] ?? '#E10600'
  return (
    <svg viewBox="0 0 48 48" className="w-10 h-10" fill="none">
      <rect width="48" height="48" rx="2" fill={`${color}20`} />
      <circle cx="24" cy="22" r="11" fill={`${color}40`} />
      <circle cx="24" cy="22" r="6" fill={color} opacity="0.7" />
      {slug === 'sem-estampa' && <line x1="8" y1="8" x2="40" y2="40" stroke="#555" strokeWidth="1.5" />}
    </svg>
  )
}
