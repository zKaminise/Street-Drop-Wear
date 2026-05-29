'use client'

import { Check, Clock, Package, Truck, AlertCircle, CreditCard, Box, Send, MapPin } from 'lucide-react'

type HistoryEntry = {
  id: string
  status: string
  note?: string | null
  createdBy: string
  createdAt: string
}

const STATUS_META: Record<string, { label: string; icon: React.ElementType; color: string }> = {
  CREATED:            { label: 'Pedido recebido',        icon: Clock,        color: 'text-blue-400' },
  PAYMENT_PENDING:    { label: 'Aguardando pagamento',   icon: CreditCard,   color: 'text-yellow-400' },
  PAYMENT_APPROVED:   { label: 'Pagamento aprovado',     icon: Check,        color: 'text-green-400' },
  IN_PREPARATION:     { label: 'Em preparação',          icon: Package,      color: 'text-orange-400' },
  PRODUCED:           { label: 'Produzido',              icon: Box,          color: 'text-purple-400' },
  AWAITING_SHIPMENT:  { label: 'Aguardando envio',       icon: Send,         color: 'text-cyan-400' },
  SHIPPED:            { label: 'Enviado',                icon: Truck,        color: 'text-blue-300' },
  IN_TRANSIT:         { label: 'Em trânsito',            icon: MapPin,       color: 'text-indigo-400' },
  DELIVERED:          { label: 'Entregue',               icon: Check,        color: 'text-emerald-400' },
  CANCELLED:          { label: 'Cancelado',              icon: AlertCircle,  color: 'text-red-400' },
}

interface OrderTimelineProps {
  history: HistoryEntry[]
}

export function OrderTimeline({ history }: OrderTimelineProps) {
  if (!history || history.length === 0) return null

  return (
    <div className="space-y-0">
      {history.map((entry, i) => {
        const meta = STATUS_META[entry.status] ?? { label: entry.status, icon: Clock, color: 'text-white/40' }
        const Icon = meta.icon
        const isLast = i === history.length - 1

        return (
          <div key={entry.id} className="flex gap-3">
            {/* Line + dot */}
            <div className="flex flex-col items-center">
              <div className={`w-7 h-7 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                isLast ? 'border-brand-red bg-brand-red/10' : 'border-white/10 bg-brand-graphite'
              }`}>
                <Icon size={13} className={isLast ? 'text-brand-red' : meta.color} />
              </div>
              {!isLast && <div className="w-px flex-1 bg-white/10 my-1" />}
            </div>

            {/* Content */}
            <div className={`pb-5 ${isLast ? '' : ''}`}>
              <p className={`text-sm font-semibold ${isLast ? 'text-brand-white' : 'text-brand-white/70'}`}>
                {meta.label}
              </p>
              {entry.note && (
                <p className="text-xs text-brand-gray-text mt-0.5">{entry.note}</p>
              )}
              <p className="text-[11px] text-brand-gray-text/60 mt-1">
                {new Date(entry.createdAt).toLocaleString('pt-BR', {
                  day: '2-digit', month: '2-digit', year: 'numeric',
                  hour: '2-digit', minute: '2-digit',
                })}
                {entry.createdBy !== 'system' && (
                  <span className="ml-1 opacity-50">· {entry.createdBy}</span>
                )}
              </p>
            </div>
          </div>
        )
      })}
    </div>
  )
}
