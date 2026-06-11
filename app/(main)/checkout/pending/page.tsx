'use client'

import { useSearchParams, useRouter } from 'next/navigation'
import { useEffect, useState, useCallback, Suspense } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Clock, Check, Package, Loader2 } from 'lucide-react'
import { useAuthStore } from '@/lib/store'

type OrderData = {
  id: string
  orderNumber: string
  status: string
  paymentStatus: string
  total: number
}

function CheckoutPendingContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const { isAuthenticated } = useAuthStore()
  const orderId = searchParams.get('order')

  const [order, setOrder] = useState<OrderData | null>(null)
  const [pollCount, setPollCount] = useState(0)

  useEffect(() => {
    if (!orderId) router.push('/')
  }, [orderId, router])

  const fetchOrder = useCallback(async () => {
    if (!orderId) return
    try {
      const res = await fetch(`/api/orders/${orderId}`)
      if (res.ok) setOrder(await res.json())
    } catch { /* ignora */ }
  }, [orderId])

  useEffect(() => {
    fetchOrder()
  }, [fetchOrder])

  // Polling a cada 5 segundos (máximo 20 tentativas = 100s)
  useEffect(() => {
    if (!order || order.paymentStatus === 'APPROVED' || pollCount >= 20) return

    const timer = setTimeout(() => {
      setPollCount(c => c + 1)
      fetchOrder()
    }, 5000)

    return () => clearTimeout(timer)
  }, [order, pollCount, fetchOrder])

  const isApproved = order?.paymentStatus === 'APPROVED'

  if (isApproved) {
    return (
      <div className="min-h-screen bg-brand-black flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center max-w-md"
        >
          <div className="w-24 h-24 mx-auto mb-6 bg-green-400/10 border border-green-400/30 flex items-center justify-center">
            <Check size={40} className="text-green-400" />
          </div>
          <h1 className="heading-display text-4xl text-brand-white mb-3">PAGAMENTO APROVADO!</h1>
          <p className="text-brand-gray-text mb-8">Pedido <span className="text-brand-white font-mono font-bold">#{order?.orderNumber}</span> confirmado.</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            {isAuthenticated && (
              <Link href="/pedidos" className="btn-primary"><Package size={16} /> Ver meus pedidos</Link>
            )}
            <Link href="/" className="btn-secondary">Continuar comprando</Link>
          </div>
        </motion.div>
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
        {/* Ícone animado */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
          className="w-24 h-24 mx-auto mb-6 bg-yellow-400/10 border border-yellow-400/30 flex items-center justify-center"
        >
          <Clock size={40} className="text-yellow-400" />
        </motion.div>

        <h1 className="heading-display text-[clamp(2rem,6vw,3.5rem)] text-brand-white mb-3 leading-none">
          PAGAMENTO EM ANÁLISE
        </h1>

        {order && (
          <p className="text-brand-gray-text mb-2">
            Pedido <span className="text-brand-white font-bold font-mono">#{order.orderNumber}</span>
          </p>
        )}

        <p className="text-yellow-400/80 text-sm mb-8">
          Seu pagamento está sendo processado pelo Mercado Pago. Isso pode levar alguns minutos.
        </p>

        <div className="bg-brand-graphite border border-white/5 p-5 mb-8 text-left">
          <p className="text-xs font-bold text-white/40 uppercase tracking-wider mb-3">O que acontece agora</p>
          <div className="space-y-3">
            {[
              'O Mercado Pago está verificando seu pagamento',
              'Você receberá um e-mail quando a aprovação for confirmada',
              'Após aprovação, seu pedido entra em produção automaticamente',
            ].map((text, i) => (
              <div key={i} className="flex items-start gap-3">
                <div className="w-5 h-5 bg-yellow-400/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-yellow-400 text-[10px] font-bold">{i + 1}</span>
                </div>
                <p className="text-sm text-brand-gray-text">{text}</p>
              </div>
            ))}
          </div>
        </div>

        {pollCount < 20 && (
          <div className="flex items-center justify-center gap-2 text-xs text-brand-gray-text mb-6">
            <Loader2 size={12} className="animate-spin text-yellow-400" />
            Verificando status automaticamente...
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          {isAuthenticated && (
            <Link href="/pedidos" className="btn-primary">
              <Package size={16} />
              Acompanhar pedido
            </Link>
          )}
          <Link href="/" className="btn-secondary">
            Ir para a loja
          </Link>
        </div>
      </motion.div>
    </div>
  )
}

export default function CheckoutPendingPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-brand-black flex items-center justify-center">
        <Loader2 size={32} className="text-brand-red animate-spin" />
      </div>
    }>
      <CheckoutPendingContent />
    </Suspense>
  )
}
