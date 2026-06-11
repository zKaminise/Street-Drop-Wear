'use client'

import { useEffect, useState, useCallback, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Check, Package, Loader2, AlertCircle } from 'lucide-react'
import { useAuthStore } from '@/lib/store'
import { formatPrice } from '@/lib/utils'

type OrderData = {
  id: string
  orderNumber: string
  status: string
  paymentStatus: string
  total: number
  guestEmail?: string
  customer?: { email: string }
}

function CheckoutSuccessContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const { isAuthenticated } = useAuthStore()
  const orderId = searchParams.get('order')

  const [order, setOrder] = useState<OrderData | null>(null)
  const [loading, setLoading] = useState(true)
  const [pollCount, setPollCount] = useState(0)

  const fetchOrder = useCallback(async () => {
    if (!orderId) { setLoading(false); return }
    try {
      const res = await fetch(`/api/orders/${orderId}`)
      if (res.ok) {
        const data = await res.json()
        setOrder(data)
      }
    } catch { /* ignora */ }
    setLoading(false)
  }, [orderId])

  useEffect(() => {
    if (!orderId) { router.push('/'); return }
    fetchOrder()
  }, [orderId, fetchOrder, router])

  // Polling: se ainda PAYMENT_PENDING, aguarda webhook (máximo 10 tentativas)
  useEffect(() => {
    if (!order || order.paymentStatus === 'APPROVED' || order.paymentStatus === 'REJECTED') return
    if (pollCount >= 10) return

    const timer = setTimeout(() => {
      setPollCount(c => c + 1)
      fetchOrder()
    }, 3000)

    return () => clearTimeout(timer)
  }, [order, pollCount, fetchOrder])

  const email = order?.customer?.email ?? order?.guestEmail ?? ''
  const isApproved = order?.paymentStatus === 'APPROVED'

  if (loading) {
    return (
      <div className="min-h-screen bg-brand-black flex items-center justify-center">
        <Loader2 size={32} className="text-brand-red animate-spin" />
      </div>
    )
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-brand-black flex items-center justify-center px-4">
        <div className="text-center">
          <AlertCircle size={48} className="text-brand-gray-text mx-auto mb-4" />
          <p className="text-brand-gray-text">Pedido não encontrado.</p>
          <Link href="/" className="btn-primary mt-6 inline-flex">Ir para a loja</Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-brand-black flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center max-w-md w-full"
      >
        {/* Ícone */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
          className={`w-24 h-24 mx-auto mb-6 border flex items-center justify-center ${
            isApproved
              ? 'bg-green-400/10 border-green-400/30'
              : 'bg-yellow-400/10 border-yellow-400/30'
          }`}
        >
          {isApproved ? (
            <Check size={40} className="text-green-400" />
          ) : (
            <Loader2 size={40} className="text-yellow-400 animate-spin" />
          )}
        </motion.div>

        {/* Título */}
        <h1 className="heading-display text-[clamp(2rem,6vw,3.5rem)] text-brand-white mb-3 leading-none">
          {isApproved ? 'PEDIDO CONFIRMADO!' : 'PROCESSANDO PAGAMENTO'}
        </h1>

        <p className="text-brand-gray-text mb-2">
          Pedido{' '}
          <span className="text-brand-white font-bold font-mono">#{order.orderNumber}</span>
        </p>

        {isApproved ? (
          <>
            <p className="text-green-400 font-semibold mb-1">
              Pagamento aprovado — {formatPrice(order.total)}
            </p>
            {email && (
              <p className="text-brand-gray-text text-sm mb-6">
                Confirmação enviada para{' '}
                <span className="text-brand-white">{email}</span>
              </p>
            )}
            <div className="bg-brand-graphite border border-white/5 p-5 mb-8 text-left">
              <p className="text-xs font-bold text-white/40 uppercase tracking-wider mb-3">Próximos passos</p>
              <div className="space-y-3">
                {[
                  { icon: Check, text: 'Pagamento confirmado pelo Mercado Pago' },
                  { icon: Package, text: 'Seu pedido entra em produção nos próximos dias úteis' },
                  { icon: Package, text: 'Você receberá o código de rastreio por e-mail quando o pedido for enviado' },
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <div className="w-5 h-5 bg-green-400/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <item.icon size={11} className="text-green-400" />
                    </div>
                    <p className="text-sm text-brand-gray-text">{item.text}</p>
                  </div>
                ))}
              </div>
            </div>
          </>
        ) : (
          <p className="text-yellow-400/80 text-sm mb-8">
            Seu pagamento está sendo processado. Aguarde a confirmação.
            {pollCount < 10 && <span className="block mt-1 text-xs text-brand-gray-text">Verificando automaticamente...</span>}
          </p>
        )}

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          {isAuthenticated && (
            <Link href="/pedidos" className="btn-primary">
              <Package size={16} />
              Ver meus pedidos
            </Link>
          )}
          <Link href="/" className="btn-secondary">
            Continuar comprando
          </Link>
        </div>
      </motion.div>
    </div>
  )
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-brand-black flex items-center justify-center">
        <Loader2 size={32} className="text-brand-red animate-spin" />
      </div>
    }>
      <CheckoutSuccessContent />
    </Suspense>
  )
}
