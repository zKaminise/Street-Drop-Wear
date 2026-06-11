'use client'

import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { X, ShoppingBag, Plus, Minus, Trash2, ArrowRight, Palette, Truck, Gift, Tag, Check, Loader2 } from 'lucide-react'
import { useState, useEffect } from 'react'
import { useCartStore } from '@/lib/store'
import { formatPrice } from '@/lib/utils'

function ShippingProgressBar({
  subtotal,
  globalFree,
  threshold,
  couponFreeShipping,
}: {
  subtotal: number
  globalFree: boolean
  threshold: number
  couponFreeShipping: boolean
}) {
  const isFree = globalFree || couponFreeShipping || subtotal >= threshold
  const pct = isFree ? 1 : Math.min(subtotal / threshold, 1)
  const missing = isFree ? 0 : Math.max(threshold - subtotal, 0)

  return (
    <div className="bg-white/3 border border-white/8 p-3 space-y-2">
      <div className="flex items-center justify-between text-xs">
        <div className="flex items-center gap-1.5">
          <Truck size={12} className={isFree ? 'text-green-400' : 'text-brand-gray-text'} />
          {isFree ? (
            <span className="text-green-400 font-semibold flex items-center gap-1">
              <Gift size={11} />
              {couponFreeShipping ? 'Frete grátis pelo cupom!' : 'Frete grátis desbloqueado!'}
            </span>
          ) : (
            <span className="text-brand-gray-text">
              Falta <span className="text-brand-white font-semibold">{formatPrice(missing)}</span> para frete grátis
            </span>
          )}
        </div>
        {!isFree && <span className="text-brand-gray-text/60">{Math.round(pct * 100)}%</span>}
      </div>
      <div className="h-1.5 bg-white/8 rounded-full overflow-hidden">
        <motion.div
          className="h-full rounded-full"
          style={{ background: isFree ? '#4ade80' : 'linear-gradient(90deg, #E10600, #FF3300)' }}
          initial={{ width: 0 }}
          animate={{ width: `${pct * 100}%` }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        />
      </div>
    </div>
  )
}

export function CartDrawer() {
  const {
    items, isOpen, closeCart, removeItem, updateQuantity,
    getSubtotal, getShipping, getTotal, getDiscount,
    coupon, applyCoupon, removeCoupon,
    shippingCache, setShippingCache, hasCustomItem,
  } = useCartStore()
  const [couponInput, setCouponInput] = useState('')
  const [couponLoading, setCouponLoading] = useState(false)
  const [couponError, setCouponError] = useState('')

  const subtotal = getSubtotal()
  const shipping = getShipping()
  const discount = getDiscount()
  const total    = getTotal()

  // Busca configuração de frete do servidor sempre que o carrinho abre
  useEffect(() => {
    if (!isOpen || items.length === 0) return
    const now = Date.now()
    // Refrescar a cada 2 minutos ou se ainda não carregou
    if (shippingCache && now - shippingCache.fetchedAt < 120_000) return

    fetch('/api/shipping/calculate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ subtotal, hasCustomItem: hasCustomItem() }),
    })
      .then(r => r.json())
      .then(data => {
        if (typeof data.cost === 'number') {
          setShippingCache({
            cost: coupon?.freeShipping ? 0 : data.cost,
            isFree: data.isFree || coupon?.freeShipping || false,
            freeShippingAbove: data.freeShippingAbove ?? 199.9,
            globalFreeShipping: data.globalFreeShipping ?? false,
            fetchedAt: Date.now(),
          })
        }
      })
      .catch(() => { /* usa fallback do store */ })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, subtotal])

  async function handleApplyCoupon() {
    if (!couponInput.trim()) return
    setCouponLoading(true)
    setCouponError('')
    try {
      const res = await fetch(`/api/coupons/validate?code=${encodeURIComponent(couponInput.trim())}`)
      const data = await res.json()
      if (data.valid) {
        applyCoupon(data.code, data.discount, data.description, data.freeShipping)
        setCouponInput('')
        // Invalidar cache de frete para forçar recalculo
        setShippingCache(shippingCache ? { ...shippingCache, fetchedAt: 0 } : null as any)
      } else {
        setCouponError(data.message ?? 'Cupom inválido.')
      }
    } catch {
      setCouponError('Erro ao validar cupom.')
    } finally {
      setCouponLoading(false)
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 z-[65]"
            onClick={closeCart}
          />
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed top-0 right-0 bottom-0 w-full max-w-md bg-brand-graphite z-[70] flex flex-col shadow-2xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-5 border-b border-white/10">
              <div className="flex items-center gap-3">
                <ShoppingBag size={20} className="text-brand-red" />
                <span className="font-bold text-brand-white uppercase tracking-wider text-sm">
                  Carrinho ({items.length} {items.length === 1 ? 'item' : 'itens'})
                </span>
              </div>
              <button
                onClick={closeCart}
                className="p-2 text-brand-gray-text hover:text-brand-white transition-colors cursor-pointer"
                aria-label="Fechar carrinho"
              >
                <X size={20} />
              </button>
            </div>

            {/* Items */}
            <div className="flex-1 overflow-y-auto">
              {items.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full gap-4 p-8 text-center">
                  <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center">
                    <ShoppingBag size={32} className="text-brand-gray-text" />
                  </div>
                  <div>
                    <p className="text-brand-white font-semibold mb-1">Carrinho vazio</p>
                    <p className="text-brand-gray-text text-sm">Adicione produtos para continuar</p>
                  </div>
                  <button onClick={closeCart} className="btn-primary mt-2">
                    Explorar produtos
                  </button>
                </div>
              ) : (
                <div className="divide-y divide-white/5">
                  {items.map((item) => {
                    const stampId = item.customization?.stampId
                    const isCustom = item.customization?.isCustomShirt
                    const preview = item.customization?.previewImageUrl

                    return (
                      <div
                        key={`${item.product.id}-${item.selectedColor.name}-${item.selectedSize.label}-${stampId ?? ''}`}
                        className="p-4 flex gap-4"
                      >
                        {/* Thumbnail */}
                        {(() => {
                          const productImg = item.product.imageUrl ?? item.product.images?.[0]?.url ?? null
                          const bg = (preview || productImg) ? undefined : `${item.selectedColor.hex}33`
                          return (
                            <div
                              className="w-16 h-20 flex-shrink-0 flex items-center justify-center relative overflow-hidden flex-shrink-0"
                              style={{ backgroundColor: bg }}
                            >
                              {preview ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img src={preview} alt={item.product.name} className="w-full h-full object-cover" />
                              ) : productImg ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img src={productImg} alt={item.product.name} className="w-full h-full object-cover" />
                              ) : isCustom ? (
                                <Palette size={24} className="text-brand-red/60" />
                              ) : (
                                <TShirtIcon
                                  className="w-10 h-10 opacity-30"
                                  color={item.selectedColor.hex === '#F0EDE6' || item.selectedColor.hex === '#F5F5F5' ? '#333' : '#fff'}
                                />
                              )}
                            </div>
                          )
                        })()}

                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <p className="text-sm font-semibold text-brand-white leading-tight">{item.product.name}</p>
                              <p className="text-xs text-brand-gray-text mt-0.5">
                                {item.selectedColor.name} · {item.selectedSize.label}
                              </p>
                              {item.customization?.stampName && (
                                <p className="text-xs text-brand-red/80 mt-0.5">
                                  Estampa: {item.customization.stampName}
                                </p>
                              )}
                              {isCustom && item.customization?.productionDays && (
                                <p className="text-[10px] text-brand-gray-text/60 mt-0.5">
                                  Prazo: ~{item.customization.productionDays} dias úteis
                                </p>
                              )}
                            </div>
                            <button
                              onClick={() => removeItem(item.product.id, item.selectedColor.name, item.selectedSize.label, stampId)}
                              className="p-1 text-brand-gray-text hover:text-red-400 transition-colors cursor-pointer flex-shrink-0"
                              aria-label="Remover item"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>

                          <div className="flex items-center justify-between mt-3">
                            <div className="flex items-center border border-white/10">
                              <button
                                onClick={() => updateQuantity(item.product.id, item.selectedColor.name, item.selectedSize.label, item.quantity - 1, stampId)}
                                className="w-7 h-7 flex items-center justify-center text-brand-gray-text hover:text-brand-white transition-colors cursor-pointer"
                                aria-label="Diminuir quantidade"
                              >
                                <Minus size={12} />
                              </button>
                              <span className="w-8 text-center text-sm font-medium text-brand-white">
                                {item.quantity}
                              </span>
                              <button
                                onClick={() => updateQuantity(item.product.id, item.selectedColor.name, item.selectedSize.label, item.quantity + 1, stampId)}
                                className="w-7 h-7 flex items-center justify-center text-brand-gray-text hover:text-brand-white transition-colors cursor-pointer"
                                aria-label="Aumentar quantidade"
                              >
                                <Plus size={12} />
                              </button>
                            </div>
                            <span className="text-sm font-bold text-brand-white">
                              {formatPrice(item.product.price * item.quantity)}
                            </span>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>

            {/* Summary */}
            {items.length > 0 && (
              <div className="border-t border-white/10 p-5 space-y-4">
                {/* Shipping progress bar */}
                <ShippingProgressBar
                  subtotal={subtotal}
                  globalFree={shippingCache?.globalFreeShipping ?? false}
                  threshold={shippingCache?.freeShippingAbove ?? 199.9}
                  couponFreeShipping={coupon?.freeShipping ?? false}
                />

                {/* Coupon section */}
                <div className="space-y-2">
                  {coupon ? (
                    <div className="flex items-center justify-between bg-green-400/10 border border-green-400/20 px-3 py-2">
                      <div className="flex items-center gap-2">
                        <Check size={12} className="text-green-400" />
                        <div>
                          <p className="text-[11px] font-bold text-green-400">
                            {coupon.code}
                            {coupon.discountPct > 0 && ` — ${coupon.discountPct}% off`}
                            {coupon.freeShipping && ` + Frete Grátis`}
                          </p>
                          {coupon.description && <p className="text-[10px] text-green-400/70">{coupon.description}</p>}
                        </div>
                      </div>
                      <button onClick={removeCoupon} className="p-1 text-white/30 hover:text-red-400 cursor-pointer transition-colors">
                        <X size={12} />
                      </button>
                    </div>
                  ) : (
                    <div>
                      <p className="text-[10px] text-white/30 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                        <Tag size={10} /> Cupom de desconto
                      </p>
                      <div className="flex gap-2">
                        <input
                          value={couponInput}
                          onChange={e => { setCouponInput(e.target.value); setCouponError('') }}
                          onKeyDown={e => e.key === 'Enter' && handleApplyCoupon()}
                          placeholder="Código do cupom"
                          className="flex-1 bg-black/40 border border-white/10 text-white text-xs px-2.5 py-1.5 placeholder-white/20 focus:outline-none focus:border-white/25 uppercase"
                          style={{ textTransform: 'uppercase' }}
                        />
                        <button
                          onClick={handleApplyCoupon}
                          disabled={couponLoading || !couponInput.trim()}
                          className="px-3 py-1.5 bg-brand-graphite border border-white/15 text-xs text-white/70 hover:text-white hover:border-white/30 transition-colors cursor-pointer disabled:opacity-40"
                        >
                          {couponLoading ? <Loader2 size={12} className="animate-spin" /> : 'Aplicar'}
                        </button>
                      </div>
                      {couponError && <p className="text-[10px] text-red-400 mt-1">{couponError}</p>}
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm text-brand-gray-text">
                    <span>Subtotal</span>
                    <span>{formatPrice(subtotal)}</span>
                  </div>
                  {discount > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-green-400">Desconto ({coupon?.discountPct}%)</span>
                      <span className="text-green-400">- {formatPrice(discount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm">
                    <span className="text-brand-gray-text">Frete estimado</span>
                    <span className={shipping === 0 ? 'text-green-400 font-semibold' : 'text-brand-white'}>
                      {shipping === 0 ? '🎁 Grátis' : formatPrice(shipping)}
                    </span>
                  </div>
                  <div className="flex justify-between text-base font-bold text-brand-white pt-2 border-t border-white/10">
                    <span>Total estimado</span>
                    <span>{formatPrice(total)}</span>
                  </div>
                </div>

                <Link
                  href="/checkout"
                  onClick={closeCart}
                  className="btn-primary w-full justify-center group"
                >
                  Finalizar Pedido
                  <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                </Link>
                <button
                  onClick={closeCart}
                  className="block w-full text-center text-xs text-brand-gray-text hover:text-brand-white transition-colors py-1"
                >
                  Continuar comprando
                </button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

function TShirtIcon({ className, color = '#fff' }: { className?: string; color?: string }) {
  return (
    <svg viewBox="0 0 100 100" className={className} fill={color}>
      <path d="M30 15 L10 30 L25 35 L20 85 L80 85 L75 35 L90 30 L70 15 L60 22 Q50 28 40 22 Z" />
    </svg>
  )
}
