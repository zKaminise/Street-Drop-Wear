'use client'

import { useSearchParams, useRouter } from 'next/navigation'
import { useEffect, useState, useCallback, useRef, Suspense } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Clock, Check, Package, Loader2, RefreshCw } from 'lucide-react'
import { useAuthStore } from '@/lib/store'

type OrderData = {
  id: string
  orderNumber: string
  status: string
  paymentStatus: string
  total: number
}

const MAX_POLLS = 24   // 24 × 5 s = 2 minutos
const POLL_MS   = 5000

function CheckoutPendingContent() {
  const searchParams = useSearchParams()
  const router       = useRouter()
  const { isAuthenticated } = useAuthStore()

  const orderId   = searchParams.get('order')
  // MP às vezes passa payment_id na URL de redirect — usamos como dica no sync
  const mpPaymentIdHint = searchParams.get('payment_id') ?? searchParams.get('paymentId') ?? null

  const [order, setOrder]           = useState<OrderData | null>(null)
  const [pollCount, setPollCount]   = useState(0)
  const [syncing, setSyncing]       = useState(false)
  const [approved, setApproved]     = useState(false)
  const redirected = useRef(false)

  useEffect(() => {
    if (!orderId) router.push('/')
  }, [orderId, router])

  // Chama o endpoint de sync — consulta o MP diretamente e atualiza o DB
  const syncOrder = useCallback(async () => {
    if (!orderId || redirected.current) return
    setSyncing(true)
    try {
      const res = await fetch(`/api/orders/${orderId}/sync`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paymentId: mpPaymentIdHint }),
      })
      if (res.ok) {
        const data = await res.json()
        const o: OrderData = data.order
        setOrder(o)
        if (o.paymentStatus === 'APPROVED' && !redirected.current) {
          redirected.current = true
          setApproved(true)
          // Redireciona para a página de sucesso após 1,5 s
          setTimeout(() => router.replace(`/checkout/success?order=${orderId}`), 1500)
        }
      }
    } catch { /* ignora erros transitórios */ }
    setSyncing(false)
  }, [orderId, mpPaymentIdHint, router])

  // Primeira chamada imediata ao montar
  useEffect(() => {
    syncOrder()
  }, [syncOrder])

  // Polling a cada POLL_MS até MAX_POLLS ou aprovação
  useEffect(() => {
    if (approved || pollCount >= MAX_POLLS) return
    const timer = setTimeout(() => {
      setPollCount(c => c + 1)
      syncOrder()
    }, POLL_MS)
    return () => clearTimeout(timer)
  }, [pollCount, approved, syncOrder])

  // Tela de transição enquanto redireciona
  if (approved) {
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
          <p className="text-brand-gray-text">Redirecionando para a confirmação do pedido…</p>
          <Loader2 size={20} className="animate-spin text-brand-red mx-auto mt-4" />
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
        {/* Ícone */}
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
          Seu PIX está sendo confirmado pelo Mercado Pago. A página atualiza sozinha assim que o pagamento for aprovado.
        </p>

        <div className="bg-brand-graphite border border-white/5 p-5 mb-8 text-left">
          <p className="text-xs font-bold text-white/40 uppercase tracking-wider mb-3">O que acontece agora</p>
          <div className="space-y-3">
            {[
              'O Mercado Pago está confirmando o seu PIX',
              'Esta página verifica o status automaticamente a cada 5 segundos',
              'Após aprovação, você é redirecionado e o pedido entra em produção',
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

        {/* Indicador de polling */}
        <div className="flex items-center justify-center gap-2 text-xs text-brand-gray-text mb-6">
          {syncing ? (
            <><Loader2 size={12} className="animate-spin text-yellow-400" /> Verificando pagamento…</>
          ) : pollCount < MAX_POLLS ? (
            <><RefreshCw size={12} className="text-white/20" /> Próxima verificação em instantes</>
          ) : (
            <span className="text-white/30">Verifique seus pedidos para acompanhar o status</span>
          )}
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          {isAuthenticated && (
            <Link href="/pedidos" className="btn-primary">
              <Package size={16} />
              Acompanhar pedido
            </Link>
          )}
          <Link href="/" className="btn-secondary">Ir para a loja</Link>
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
