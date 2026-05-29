'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { ShoppingBag, Trash2, Plus, Minus, ArrowRight, Tag } from 'lucide-react'
import { useCartStore } from '@/lib/store'
import { formatPrice } from '@/lib/utils'

export default function CarrinhoPage() {
  const { items, removeItem, updateQuantity, getSubtotal, getShipping, getTotal, clearCart } = useCartStore()

  const subtotal = getSubtotal()
  const shipping = getShipping()
  const total = getTotal()

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-brand-black flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center max-w-sm px-4"
        >
          <div className="w-24 h-24 bg-brand-graphite border border-white/5 flex items-center justify-center mx-auto mb-6">
            <ShoppingBag size={36} className="text-brand-gray-text" strokeWidth={1} />
          </div>
          <h1 className="heading-display text-4xl text-brand-white mb-3">CARRINHO VAZIO</h1>
          <p className="text-brand-gray-text mb-8">Você ainda não adicionou nenhum produto.</p>
          <Link href="/oversized" className="btn-primary group">
            <ShoppingBag size={18} />
            Explorar produtos
            <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-brand-black">
      <div className="container-brand py-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 flex items-center justify-between"
        >
          <div>
            <span className="text-brand-red text-xs font-bold uppercase tracking-[0.3em]">Revisão</span>
            <h1 className="heading-display text-[clamp(2.5rem,5vw,4rem)] text-brand-white mt-1">
              MEU CARRINHO
            </h1>
          </div>
          <button
            onClick={clearCart}
            className="text-xs text-brand-gray-text hover:text-red-400 transition-colors cursor-pointer"
          >
            Limpar carrinho
          </button>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Items */}
          <div className="lg:col-span-2 space-y-4">
            {items.map(item => (
              <motion.div
                key={`${item.product.id}-${item.selectedColor.name}-${item.selectedSize.label}`}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="bg-brand-graphite border border-white/5 p-5 flex gap-5"
              >
                {/* Color preview */}
                <div
                  className="w-20 h-24 flex-shrink-0 flex items-center justify-center"
                  style={{ backgroundColor: `${item.selectedColor.hex}22` }}
                >
                  <svg viewBox="0 0 100 120" className="w-14 h-14">
                    <path
                      d="M30 20 L8 38 L22 44 L20 100 L80 100 L78 44 L92 38 L70 20 C63 26 55 29 50 29 C45 29 37 26 30 20Z"
                      fill={item.selectedColor.hex}
                      stroke="rgba(255,255,255,0.05)"
                    />
                  </svg>
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <Link
                        href={`/produto/${item.product.slug}`}
                        className="text-sm font-bold text-brand-white hover:text-brand-red transition-colors"
                      >
                        {item.product.name}
                      </Link>
                      <p className="text-xs text-brand-gray-text mt-1">
                        {item.selectedColor.name} · Tamanho {item.selectedSize.label}
                      </p>
                      {item.customization?.stampName && (
                        <p className="text-xs text-brand-red/80 mt-0.5">
                          Estampa: {item.customization.stampName}
                        </p>
                      )}
                      {item.product.material && (
                        <p className="text-xs text-brand-gray-text/60 mt-0.5">{item.product.material}</p>
                      )}
                    </div>
                    <button
                      onClick={() => removeItem(item.product.id, item.selectedColor.name, item.selectedSize.label)}
                      className="p-1.5 text-brand-gray-text hover:text-red-400 transition-colors cursor-pointer flex-shrink-0"
                      aria-label="Remover produto"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>

                  <div className="flex items-center justify-between mt-4">
                    <div className="flex items-center border border-white/10">
                      <button
                        onClick={() => updateQuantity(item.product.id, item.selectedColor.name, item.selectedSize.label, item.quantity - 1)}
                        className="w-9 h-9 flex items-center justify-center text-brand-gray-text hover:text-brand-white transition-colors cursor-pointer"
                        aria-label="Diminuir quantidade"
                      >
                        <Minus size={14} />
                      </button>
                      <span className="w-10 text-center text-sm font-bold text-brand-white">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.product.id, item.selectedColor.name, item.selectedSize.label, item.quantity + 1)}
                        className="w-9 h-9 flex items-center justify-center text-brand-gray-text hover:text-brand-white transition-colors cursor-pointer"
                        aria-label="Aumentar quantidade"
                      >
                        <Plus size={14} />
                      </button>
                    </div>
                    <div className="text-right">
                      <span className="text-base font-bold text-brand-white">
                        {formatPrice(item.product.price * item.quantity)}
                      </span>
                      {item.quantity > 1 && (
                        <p className="text-xs text-brand-gray-text">{formatPrice(item.product.price)} cada</p>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Summary */}
          <div className="lg:col-span-1">
            <div className="bg-brand-graphite border border-white/5 p-6 sticky top-24">
              <h2 className="text-sm font-bold uppercase tracking-wider text-brand-white mb-5">Resumo do Pedido</h2>

              {/* Coupon */}
              <div className="flex gap-2 mb-5">
                <div className="relative flex-1">
                  <Tag size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-gray-text" />
                  <input
                    type="text"
                    placeholder="Cupom de desconto"
                    className="input-brand pl-9 text-sm"
                    aria-label="Código de cupom"
                  />
                </div>
                <button className="btn-outline-red px-4 text-xs flex-shrink-0">Aplicar</button>
              </div>

              <div className="divider mb-4" />

              <div className="space-y-3 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-brand-gray-text">Subtotal ({items.reduce((s, i) => s + i.quantity, 0)} itens)</span>
                  <span className="text-brand-white">{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-brand-gray-text">Frete</span>
                  <span className={shipping === 0 ? 'text-green-400 font-semibold' : 'text-brand-white'}>
                    {shipping === 0 ? 'Grátis' : formatPrice(shipping)}
                  </span>
                </div>
                {shipping > 0 && (
                  <p className="text-xs text-brand-gray-text/70 bg-white/5 px-3 py-2 border border-white/5">
                    Faltam <span className="text-brand-white font-semibold">{formatPrice(199.9 - subtotal)}</span> para frete grátis
                  </p>
                )}
              </div>

              <div className="divider mb-4" />

              <div className="flex justify-between items-center mb-6">
                <span className="text-base font-bold text-brand-white">Total</span>
                <span className="heading-display text-2xl text-brand-white">{formatPrice(total)}</span>
              </div>

              <Link href="/checkout" className="btn-primary w-full justify-center group mb-3">
                Finalizar Pedido
                <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </Link>

              <Link href="/oversized" className="btn-secondary w-full justify-center text-sm">
                Continuar Comprando
              </Link>

              {/* Accepted payments */}
              <div className="mt-5 pt-4 border-t border-white/5">
                <p className="text-[10px] text-brand-gray-text/60 uppercase tracking-wider mb-2 text-center">Formas de pagamento</p>
                <div className="flex justify-center gap-2">
                  {['PIX', 'Visa', 'Master', 'Elo', 'Boleto'].map(m => (
                    <span key={m} className="text-[9px] text-brand-gray-text bg-white/5 px-1.5 py-1 uppercase tracking-wider">
                      {m}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
