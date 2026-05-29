'use client'

import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { X, ShoppingBag, Plus, Minus, Trash2, ArrowRight, Palette } from 'lucide-react'
import { useCartStore } from '@/lib/store'
import { formatPrice } from '@/lib/utils'

export function CartDrawer() {
  const { items, isOpen, closeCart, removeItem, updateQuantity, getSubtotal, getShipping, getTotal } = useCartStore()

  const subtotal = getSubtotal()
  const shipping = getShipping()
  const total = getTotal()

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 z-50"
            onClick={closeCart}
          />
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed top-0 right-0 bottom-0 w-full max-w-md bg-brand-graphite z-50 flex flex-col shadow-2xl"
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
                        <div
                          className="w-16 h-20 flex-shrink-0 flex items-center justify-center relative overflow-hidden"
                          style={{ backgroundColor: preview ? 'transparent' : `${item.selectedColor.hex}33` }}
                        >
                          {preview ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={preview} alt={item.product.name} className="w-full h-full object-cover" />
                          ) : isCustom ? (
                            <Palette size={24} className="text-brand-red/60" />
                          ) : (
                            <TShirtIcon
                              className="w-10 h-10 opacity-30"
                              color={
                                item.selectedColor.hex === '#F0EDE6' || item.selectedColor.hex === '#F5F5F5'
                                  ? '#333'
                                  : '#fff'
                              }
                            />
                          )}
                        </div>

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
                <div className="space-y-2">
                  <div className="flex justify-between text-sm text-brand-gray-text">
                    <span>Subtotal</span>
                    <span>{formatPrice(subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-brand-gray-text">Frete estimado</span>
                    <span className={shipping === 0 ? 'text-green-400 font-semibold' : 'text-brand-white'}>
                      {shipping === 0 ? 'Grátis' : formatPrice(shipping)}
                    </span>
                  </div>
                  {shipping > 0 && (
                    <p className="text-xs text-brand-gray-text/70">
                      Frete grátis acima de R$ 199,90 · valor exato no checkout
                    </p>
                  )}
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
