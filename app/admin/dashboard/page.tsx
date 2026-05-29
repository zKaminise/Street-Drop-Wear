'use client'

import { useEffect, useState } from 'react'
import { AdminSidebar } from '@/components/admin/AdminSidebar'
import { formatPrice } from '@/lib/utils'
import { ShoppingBag, Package, Shirt, Stamp, TrendingUp, AlertTriangle, Clock } from 'lucide-react'

type DashboardData = {
  totalOrders: number
  pendingOrders: number
  totalProducts: number
  totalBases: number
  totalStamps: number
  totalRevenue: number
  recentOrders: Array<{
    id: string
    orderNumber: string
    status: string
    total: number
    createdAt: string
    guestName?: string
    customer?: { name: string }
  }>
  lowStock: Array<{
    id: string
    size: string
    quantity: number
    color: {
      name: string
      hex: string
      base: { name: string }
    }
  }>
}

const STATUS_LABEL: Record<string, string> = {
  CREATED: 'Criado',
  PAYMENT_PENDING: 'Aguard. Pagamento',
  PAYMENT_APPROVED: 'Pago',
  IN_PREPARATION: 'Em Preparação',
  PRODUCED: 'Produzido',
  AWAITING_SHIPMENT: 'Aguard. Envio',
  SHIPPED: 'Enviado',
  IN_TRANSIT: 'Em Trânsito',
  DELIVERED: 'Entregue',
  CANCELLED: 'Cancelado',
}

const STATUS_COLOR: Record<string, string> = {
  CREATED: 'text-blue-400',
  PAYMENT_PENDING: 'text-yellow-400',
  PAYMENT_APPROVED: 'text-green-400',
  IN_PREPARATION: 'text-orange-400',
  DELIVERED: 'text-emerald-400',
  CANCELLED: 'text-red-400',
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null)

  useEffect(() => {
    fetch('/api/admin/dashboard').then(r => r.json()).then(setData)
  }, [])

  return (
    <div className="flex">
      <AdminSidebar />
      <main className="lg:ml-64 flex-1 p-4 sm:p-8 min-h-screen pt-16 lg:pt-0">
        <div className="mb-8">
          <h1 className="text-2xl font-black text-white uppercase tracking-widest" style={{ fontFamily: 'var(--font-bebas)' }}>
            Dashboard
          </h1>
          <p className="text-white/40 text-sm mt-1">Visão geral do negócio</p>
        </div>

        {!data ? (
          <div className="text-white/40 text-sm">Carregando...</div>
        ) : (
          <>
            {/* Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <StatCard icon={TrendingUp} label="Receita Aprovada" value={formatPrice(data.totalRevenue)} color="text-green-400" />
              <StatCard icon={ShoppingBag} label="Total de Pedidos" value={String(data.totalOrders)} color="text-blue-400" />
              <StatCard icon={Clock} label="Pedidos Pendentes" value={String(data.pendingOrders)} color="text-yellow-400" />
              <StatCard icon={Package} label="Produtos Ativos" value={String(data.totalProducts + data.totalBases)} color="text-white" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Recent Orders */}
              <div className="bg-[#161616] border border-white/5 p-5">
                <h2 className="text-sm font-bold text-white uppercase tracking-wider mb-4">Pedidos Recentes</h2>
                {data.recentOrders.length === 0 ? (
                  <p className="text-white/30 text-sm">Nenhum pedido ainda</p>
                ) : (
                  <div className="space-y-2">
                    {data.recentOrders.slice(0, 6).map(order => (
                      <div key={order.id} className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
                        <div>
                          <p className="text-sm text-white font-mono">#{order.orderNumber}</p>
                          <p className="text-xs text-white/40">{order.customer?.name ?? order.guestName ?? 'Guest'}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-white">{formatPrice(order.total)}</p>
                          <p className={`text-xs ${STATUS_COLOR[order.status] ?? 'text-white/40'}`}>
                            {STATUS_LABEL[order.status] ?? order.status}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Low Stock */}
              <div className="bg-[#161616] border border-white/5 p-5">
                <h2 className="text-sm font-bold text-white uppercase tracking-wider mb-4 flex items-center gap-2">
                  <AlertTriangle size={14} className="text-yellow-400" />
                  Estoque Baixo
                </h2>
                {data.lowStock.length === 0 ? (
                  <p className="text-white/30 text-sm">Nenhum item com estoque baixo</p>
                ) : (
                  <div className="space-y-2">
                    {data.lowStock.map(item => (
                      <div key={item.id} className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
                        <div className="flex items-center gap-2">
                          <span className="w-3 h-3 rounded-full border border-white/20 flex-shrink-0" style={{ backgroundColor: item.color.hex }} />
                          <div>
                            <p className="text-xs text-white">{item.color.base.name}</p>
                            <p className="text-xs text-white/40">{item.color.name} / {item.size}</p>
                          </div>
                        </div>
                        <span className={`text-sm font-bold ${item.quantity === 0 ? 'text-red-400' : 'text-yellow-400'}`}>
                          {item.quantity} un.
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  )
}

function StatCard({ icon: Icon, label, value, color }: { icon: React.ElementType; label: string; value: string; color: string }) {
  return (
    <div className="bg-[#161616] border border-white/5 p-5">
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs text-white/40 uppercase tracking-wider">{label}</p>
        <Icon size={16} className={color} />
      </div>
      <p className={`text-2xl font-bold ${color}`}>{value}</p>
    </div>
  )
}

