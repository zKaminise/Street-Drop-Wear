'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { Package, ChevronRight, X, Truck, Check, Clock, AlertCircle, RefreshCw, History } from 'lucide-react'
import { useAuthStore } from '@/lib/store'
import { formatPrice } from '@/lib/utils'
import { OrderTimeline } from '@/components/orders/OrderTimeline'

type DbOrderItem = {
  id: string; productName: string; colorName?: string; colorHex?: string
  size?: string; quantity: number; unitPrice: number; totalPrice: number
  productImage?: string; stampName?: string; isCustomShirt: boolean
}

type HistoryEntry = {
  id: string; status: string; note?: string | null; createdBy: string; createdAt: string
}

type DbPayment = {
  mpPaymentId?: string | null
  status: string
  paymentMethodId?: string | null
  paymentTypeId?: string | null
  approvedAt?: string | null
}

type DbOrder = {
  id: string; orderNumber: string; status: string; paymentStatus: string
  paymentMethod?: string | null
  subtotal: number; shippingCost: number; discount: number; total: number
  trackingCode?: string; carrier?: string; estimatedDelivery?: string
  createdAt: string; items: DbOrderItem[]
  statusHistory?: HistoryEntry[]
  payment?: DbPayment | null
}

const STATUS_ICONS: Record<string, React.ElementType> = {
  CREATED: Clock, PAYMENT_PENDING: Clock, PAYMENT_APPROVED: Check,
  IN_PREPARATION: Package, PRODUCED: Package, AWAITING_SHIPMENT: Truck,
  SHIPPED: Truck, IN_TRANSIT: Truck, DELIVERED: Check, CANCELLED: AlertCircle,
}

const STATUS_LABELS: Record<string, string> = {
  CREATED: 'Recebido', PAYMENT_PENDING: 'Ag. Pagamento', PAYMENT_APPROVED: 'Pago',
  IN_PREPARATION: 'Em Preparação', PRODUCED: 'Produzido', AWAITING_SHIPMENT: 'Ag. Envio',
  SHIPPED: 'Enviado', IN_TRANSIT: 'Em Trânsito', DELIVERED: 'Entregue', CANCELLED: 'Cancelado',
}

const STATUS_COLORS: Record<string, string> = {
  CREATED: 'bg-white/5 text-white/60', PAYMENT_PENDING: 'bg-yellow-400/10 text-yellow-400',
  PAYMENT_APPROVED: 'bg-green-400/10 text-green-400', IN_PREPARATION: 'bg-orange-400/10 text-orange-400',
  PRODUCED: 'bg-purple-400/10 text-purple-400', AWAITING_SHIPMENT: 'bg-cyan-400/10 text-cyan-400',
  SHIPPED: 'bg-blue-400/10 text-blue-400', IN_TRANSIT: 'bg-indigo-400/10 text-indigo-400',
  DELIVERED: 'bg-emerald-400/10 text-emerald-400', CANCELLED: 'bg-red-400/10 text-red-400',
}

const STATUS_PROGRESS: Record<string, number> = {
  CREATED: 10, PAYMENT_PENDING: 20, PAYMENT_APPROVED: 35,
  IN_PREPARATION: 50, PRODUCED: 65, AWAITING_SHIPMENT: 75,
  SHIPPED: 85, IN_TRANSIT: 92, DELIVERED: 100, CANCELLED: 0,
}

export default function PedidosPage() {
  const { isAuthenticated, user } = useAuthStore()
  const router = useRouter()
  const [orders, setOrders] = useState<DbOrder[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedOrder, setSelectedOrder] = useState<DbOrder | null>(null)
  const [showTimeline, setShowTimeline] = useState(false)

  useEffect(() => {
    if (!isAuthenticated) { router.push('/login'); return }
    if (!user?.id) { setLoading(false); return }

    fetch(`/api/orders?customerId=${encodeURIComponent(user.id)}`)
      .then(r => r.json())
      .then(data => setOrders(Array.isArray(data) ? data : []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [isAuthenticated, user, router])

  async function openOrder(order: DbOrder) {
    // Load full order with status history
    try {
      const data = await fetch(`/api/orders/${order.id}`).then(r => r.json())
      setSelectedOrder({ ...order, ...data })
    } catch {
      setSelectedOrder(order)
    }
    setShowTimeline(false)
  }

  if (!isAuthenticated) return null

  return (
    <div className="min-h-screen bg-brand-black">
      <div className="container-brand py-10">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <div className="flex items-center gap-3 text-sm text-brand-gray-text mb-2">
            <Link href="/conta" className="hover:text-brand-white transition-colors">Minha Conta</Link>
            <ChevronRight size={14} />
            <span className="text-brand-white">Pedidos</span>
          </div>
          <span className="text-brand-red text-xs font-bold uppercase tracking-[0.3em]">Histórico</span>
          <h1 className="heading-display text-[clamp(2.5rem,5vw,4rem)] text-brand-white mt-1">MEUS PEDIDOS</h1>
        </motion.div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}>
              <RefreshCw size={24} className="text-brand-red" />
            </motion.div>
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-20">
            <Package size={48} className="text-brand-gray-text mx-auto mb-4" strokeWidth={1} />
            <p className="text-brand-gray-text mb-6">Você ainda não fez nenhum pedido.</p>
            <Link href="/oversized" className="btn-primary">Explorar produtos</Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order, i) => {
              const StatusIcon = STATUS_ICONS[order.status] ?? Package
              const statusColor = STATUS_COLORS[order.status] ?? 'bg-white/5 text-white/60'
              const progress = STATUS_PROGRESS[order.status] ?? 0

              return (
                <motion.div
                  key={order.id}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.08 }}
                  className="bg-brand-graphite border border-white/5 hover:border-white/10 transition-colors cursor-pointer"
                  onClick={() => openOrder(order)}
                >
                  <div className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 border border-white/10 flex items-center justify-center flex-shrink-0">
                        <StatusIcon size={18} className="text-brand-red" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-brand-white font-mono">#{order.orderNumber}</p>
                        <p className="text-xs text-brand-gray-text mt-0.5">
                          {new Date(order.createdAt).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}
                        </p>
                        <p className="text-xs text-brand-gray-text">
                          {order.items.length} {order.items.length === 1 ? 'produto' : 'produtos'}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between sm:flex-col sm:items-end gap-2">
                      <span className={`text-xs font-bold uppercase tracking-wider px-2.5 py-1 ${statusColor}`}>
                        {STATUS_LABELS[order.status] ?? order.status}
                      </span>
                      <span className="heading-display text-xl text-brand-white">{formatPrice(order.total)}</span>
                    </div>

                    <ChevronRight size={18} className="text-brand-gray-text hidden sm:block flex-shrink-0" />
                  </div>

                  <div className="h-0.5 bg-white/5">
                    <div className="h-full bg-brand-red transition-all duration-700" style={{ width: `${progress}%` }} />
                  </div>
                </motion.div>
              )
            })}
          </div>
        )}

        {/* Order Detail Modal */}
        <AnimatePresence>
          {selectedOrder && (
            <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4">
              {/* Backdrop */}
              <motion.div
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="absolute inset-0 bg-black/80"
                onClick={() => setSelectedOrder(null)}
              />
              {/* Panel */}
              <motion.div
                initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
                transition={{ type: 'spring', damping: 30, stiffness: 300 }}
                className="relative w-full sm:max-w-lg bg-brand-graphite sm:border sm:border-white/10 overflow-hidden flex flex-col max-h-[92dvh] sm:max-h-[90vh] rounded-t-2xl sm:rounded-none"
              >
                {/* Header */}
                <div className="sticky top-0 bg-brand-graphite border-b border-white/10 px-5 py-4 flex items-center justify-between z-10">
                  <div>
                    <p className="text-xs text-brand-gray-text">Pedido</p>
                    <p className="font-bold text-brand-white font-mono text-sm">#{selectedOrder.orderNumber}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {selectedOrder.statusHistory && selectedOrder.statusHistory.length > 0 && (
                      <button
                        onClick={(e) => { e.stopPropagation(); setShowTimeline(s => !s) }}
                        className={`p-2 transition-colors cursor-pointer ${showTimeline ? 'text-brand-red' : 'text-brand-gray-text hover:text-brand-white'}`}
                        title="Histórico do pedido"
                      >
                        <History size={16} />
                      </button>
                    )}
                    <button onClick={() => setSelectedOrder(null)} className="p-2 text-brand-gray-text hover:text-brand-white cursor-pointer">
                      <X size={18} />
                    </button>
                  </div>
                </div>

                <div className="p-5 space-y-5 overflow-y-auto flex-1">
                  {/* Status */}
                  <div className={`flex items-center gap-2 px-4 py-3 ${STATUS_COLORS[selectedOrder.status] ?? 'bg-white/5 text-white/60'}`}>
                    <span className="text-sm font-bold uppercase tracking-wider">
                      {STATUS_LABELS[selectedOrder.status] ?? selectedOrder.status}
                    </span>
                    {selectedOrder.trackingCode && (
                      <span className="text-xs ml-auto opacity-70 font-mono">
                        {selectedOrder.carrier ? `${selectedOrder.carrier}: ` : 'Rastreio: '}
                        {selectedOrder.trackingCode}
                      </span>
                    )}
                  </div>

                  {selectedOrder.estimatedDelivery && (
                    <p className="text-xs text-brand-gray-text flex items-center gap-1.5">
                      <Truck size={12} className="text-brand-red" />
                      Previsão de entrega: <span className="text-brand-white">{selectedOrder.estimatedDelivery}</span>
                    </p>
                  )}

                  {/* Timeline */}
                  {showTimeline && selectedOrder.statusHistory && (
                    <div className="bg-black/20 border border-white/5 p-4">
                      <p className="text-xs font-bold text-white/40 uppercase tracking-wider mb-4">Histórico</p>
                      <OrderTimeline history={selectedOrder.statusHistory} />
                    </div>
                  )}

                  {/* Items */}
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-brand-gray-text mb-3">Produtos</p>
                    <div className="space-y-3">
                      {selectedOrder.items.map(item => (
                        <div key={item.id} className="flex items-center gap-3 text-sm">
                          <div
                            className="w-10 h-10 flex-shrink-0 flex items-center justify-center"
                            style={{ backgroundColor: item.colorHex ? `${item.colorHex}33` : '#1A1A1A' }}
                          >
                            {item.colorHex && (
                              <div className="w-4 h-4 rounded-full border border-white/20" style={{ backgroundColor: item.colorHex }} />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-brand-white font-semibold truncate">{item.productName}</p>
                            <p className="text-brand-gray-text text-xs">
                              {[item.colorName, item.size, item.stampName ? `Estampa: ${item.stampName}` : '', `×${item.quantity}`]
                                .filter(Boolean).join(' · ')}
                            </p>
                          </div>
                          <span className="text-brand-white font-bold flex-shrink-0">{formatPrice(item.totalPrice)}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* MP Payment info */}
                  {selectedOrder.payment && (
                    <div className="bg-black/20 border border-white/5 p-4">
                      <p className="text-xs font-bold uppercase tracking-wider text-brand-gray-text mb-3">Pagamento</p>
                      <div className="space-y-1.5 text-xs">
                        {selectedOrder.payment.paymentMethodId && (
                          <div className="flex justify-between">
                            <span className="text-brand-gray-text">Método</span>
                            <span className="text-brand-white capitalize">
                              {selectedOrder.payment.paymentMethodId === 'pix' ? 'PIX'
                                : selectedOrder.payment.paymentMethodId === 'bolbradesco' ? 'Boleto'
                                : selectedOrder.payment.paymentMethodId}
                            </span>
                          </div>
                        )}
                        {selectedOrder.payment.mpPaymentId && (
                          <div className="flex justify-between">
                            <span className="text-brand-gray-text">ID do pagamento</span>
                            <span className="text-brand-white/70 font-mono">{selectedOrder.payment.mpPaymentId}</span>
                          </div>
                        )}
                        {selectedOrder.payment.approvedAt && (
                          <div className="flex justify-between">
                            <span className="text-brand-gray-text">Aprovado em</span>
                            <span className="text-green-400">{new Date(selectedOrder.payment.approvedAt).toLocaleString('pt-BR')}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Total */}
                  <div className="border-t border-white/10 pt-4 space-y-2">
                    {[
                      { label: 'Subtotal', value: formatPrice(selectedOrder.subtotal) },
                      { label: 'Frete', value: selectedOrder.shippingCost === 0 ? 'Grátis' : formatPrice(selectedOrder.shippingCost) },
                      ...(selectedOrder.discount > 0 ? [{ label: 'Desconto', value: `-${formatPrice(selectedOrder.discount)}`, red: true }] : []),
                      { label: 'Total', value: formatPrice(selectedOrder.total), bold: true },
                    ].map(row => (
                      <div key={row.label} className={`flex justify-between text-sm ${(row as any).bold ? 'font-bold text-brand-white' : 'text-brand-gray-text'}`}>
                        <span>{row.label}</span>
                        <span className={(row as any).bold ? 'text-brand-white' : (row as any).red ? 'text-green-400' : ''}>{row.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
