'use client'

import { useSearchParams, useRouter } from 'next/navigation'
import { useEffect, Suspense } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { XCircle, RefreshCw, ShoppingBag, Loader2 } from 'lucide-react'

function CheckoutFailureContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const orderId = searchParams.get('order')

  useEffect(() => {
    if (!orderId) router.push('/')
  }, [orderId, router])

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
          className="w-24 h-24 mx-auto mb-6 bg-red-500/10 border border-red-500/30 flex items-center justify-center"
        >
          <XCircle size={40} className="text-red-400" />
        </motion.div>

        <h1 className="heading-display text-[clamp(2rem,6vw,3.5rem)] text-brand-white mb-3 leading-none">
          PAGAMENTO NÃO CONCLUÍDO
        </h1>

        <p className="text-brand-gray-text mb-6 text-sm">
          Seu pagamento não foi aprovado. Não se preocupe — nenhuma cobrança foi realizada.
        </p>

        <div className="bg-brand-graphite border border-white/5 p-5 mb-8 text-left">
          <p className="text-xs font-bold text-white/40 uppercase tracking-wider mb-3">O que pode ter acontecido</p>
          <ul className="space-y-2 text-sm text-brand-gray-text">
            <li>• Dados do cartão incorretos ou expirado</li>
            <li>• Saldo insuficiente na conta</li>
            <li>• Pagamento recusado pelo banco emissor</li>
            <li>• Tempo de sessão expirado</li>
          </ul>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/checkout" className="btn-primary gap-2">
            <RefreshCw size={16} />
            Tentar novamente
          </Link>
          <Link href="/" className="btn-secondary gap-2">
            <ShoppingBag size={16} />
            Continuar comprando
          </Link>
        </div>

        <p className="text-xs text-brand-gray-text/50 mt-6">
          Dúvidas? Entre em contato pelo WhatsApp ou Instagram.
        </p>
      </motion.div>
    </div>
  )
}

export default function CheckoutFailurePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-brand-black flex items-center justify-center">
        <Loader2 size={32} className="text-brand-red animate-spin" />
      </div>
    }>
      <CheckoutFailureContent />
    </Suspense>
  )
}
