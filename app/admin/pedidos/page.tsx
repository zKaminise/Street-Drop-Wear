'use client'

import { useCallback, useEffect, useState } from 'react'
import { AdminSidebar } from '@/components/admin/AdminSidebar'
import { X, ChevronDown, History, Save, Search, CreditCard } from 'lucide-react'
import { formatPrice } from '@/lib/utils'

type OrderItem = {
  id: string; productName: string; quantity: number; unitPrice: number
  size?: string; colorName?: string; isCustomShirt?: boolean; stampName?: string
}

type HistoryEntry = {
  id: string; status: string; note?: string | null; createdBy: string; createdAt: string
}

type MpPayment = {
  mpPaymentId?: string | null
  mpPreferenceId?: string | null
  status: string
  paymentMethodId?: string | null
  paymentTypeId?: string | null
  amount: number
  approvedAt?: string | null
}

type Order = {
  id: string; orderNumber: string; status: string; paymentStatus: string
  paymentMethod?: string; paymentId?: string; mpPreferenceId?: string
  paymentApprovedAt?: string | null
  total: number; subtotal: number; shippingCost: number; discount: number
  createdAt: string; trackingCode?: string; carrier?: string; estimatedDelivery?: string
  notes?: string; internalNotes?: string
  customer?: { name: string; email: string }
  guestName?: string; guestEmail?: string; guestPhone?: string
  guestZipCode?: string; guestStreet?: string; guestNumber?: string
  guestDistrict?: string; guestCity?: string; guestState?: string
  items: OrderItem[]
  statusHistory?: HistoryEntry[]
  payment?: MpPayment | null
}

// Tab de visualização — filtra por paymentStatus
type PaymentTab = 'confirmed' | 'pending' | 'all'

const STATUS_FLOW = [
  'CREATED', 'PAYMENT_PENDING', 'PAYMENT_APPROVED', 'IN_PREPARATION',
  'PRODUCED', 'AWAITING_SHIPMENT', 'SHIPPED', 'IN_TRANSIT', 'DELIVERED', 'CANCELLED',
]

const STATUS_LABEL: Record<string, string> = {
  CREATED: 'Criado', PAYMENT_PENDING: 'Ag. Pagamento', PAYMENT_APPROVED: 'Pago',
  IN_PREPARATION: 'Em Preparação', PRODUCED: 'Produzido', AWAITING_SHIPMENT: 'Ag. Envio',
  SHIPPED: 'Enviado', IN_TRANSIT: 'Em Trânsito', DELIVERED: 'Entregue', CANCELLED: 'Cancelado',
}

const STATUS_COLOR: Record<string, string> = {
  CREATED: 'bg-blue-400/10 text-blue-400', PAYMENT_PENDING: 'bg-yellow-400/10 text-yellow-400',
  PAYMENT_APPROVED: 'bg-green-400/10 text-green-400', IN_PREPARATION: 'bg-orange-400/10 text-orange-400',
  PRODUCED: 'bg-purple-400/10 text-purple-400', AWAITING_SHIPMENT: 'bg-cyan-400/10 text-cyan-400',
  SHIPPED: 'bg-blue-300/10 text-blue-300', IN_TRANSIT: 'bg-indigo-400/10 text-indigo-400',
  DELIVERED: 'bg-emerald-400/10 text-emerald-400', CANCELLED: 'bg-red-400/10 text-red-400',
}

const PAYMENT_STATUS_LABEL: Record<string, string> = {
  PENDING: 'Pendente', IN_PROCESS: 'Em Análise', APPROVED: 'Aprovado',
  REJECTED: 'Rejeitado', CANCELLED: 'Cancelado', REFUNDED: 'Reembolsado', CHARGED_BACK: 'Estornado',
}
const PAYMENT_STATUS_COLOR: Record<string, string> = {
  PENDING: 'text-yellow-400', IN_PROCESS: 'text-blue-400', APPROVED: 'text-green-400',
  REJECTED: 'text-red-400', CANCELLED: 'text-red-400', REFUNDED: 'text-purple-400', CHARGED_BACK: 'text-orange-400',
}

const PAYMENT_METHOD_LABEL: Record<string, string> = {
  pix: 'PIX', bolbradesco: 'Boleto', bank_transfer: 'Transferência',
  credit_card: 'Cartão de Crédito', debit_card: 'Cartão de Débito', ticket: 'Boleto',
}

const INPUT = 'w-full bg-black/40 border border-white/10 text-white placeholder-white/20 px-3 py-2 text-sm focus:outline-none focus:border-[#E10600]/60'

const HISTORY_STATUS_LABELS: Record<string, string> = { ...STATUS_LABEL }

export default function AdminPedidosPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState<Order | null>(null)
  const [filterStatus, setFilterStatus] = useState('')
  const [paymentTab, setPaymentTab] = useState<PaymentTab>('confirmed')
  const [search, setSearch] = useState('')
  const [searchInput, setSearchInput] = useState('')

  // Edit fields
  const [newStatus, setNewStatus] = useState('')
  const [paymentStatus, setPaymentStatus] = useState('')
  const [tracking, setTracking] = useState('')
  const [carrier, setCarrier] = useState('')
  const [estimatedDelivery, setEstimatedDelivery] = useState('')
  const [internalNotes, setInternalNotes] = useState('')
  const [statusNote, setStatusNote] = useState('')
  const [saving, setSaving] = useState(false)
  const [showHistory, setShowHistory] = useState(false)

  const load = useCallback(async () => {
    const params = new URLSearchParams()
    if (filterStatus) params.set('status', filterStatus)
    if (search) params.set('search', search)
    // Filtro por tab de pagamento
    if (paymentTab === 'confirmed') params.set('paymentStatus', 'APPROVED')
    else if (paymentTab === 'pending') params.set('paymentStatus', 'PENDING,IN_PROCESS')
    const data = await fetch(`/api/admin/orders?${params}`).then(r => r.json())
    setOrders(Array.isArray(data) ? data : [])
    setLoading(false)
  }, [filterStatus, search, paymentTab])

  useEffect(() => { load() }, [load])

  async function openOrder(o: Order) {
    // Load full order with history
    try {
      const full = await fetch(`/api/admin/orders/${o.id}`).then(r => r.json())
      setSelected(full)
      setNewStatus(full.status)
      setPaymentStatus(full.paymentStatus)
      setTracking(full.trackingCode ?? '')
      setCarrier(full.carrier ?? '')
      setEstimatedDelivery(full.estimatedDelivery ?? '')
      setInternalNotes(full.internalNotes ?? '')
      setStatusNote('')
      setShowHistory(false)
    } catch {
      setSelected(o)
      setNewStatus(o.status)
      setPaymentStatus(o.paymentStatus)
      setTracking(o.trackingCode ?? '')
      setCarrier(o.carrier ?? '')
      setEstimatedDelivery(o.estimatedDelivery ?? '')
      setInternalNotes(o.internalNotes ?? '')
      setStatusNote('')
      setShowHistory(false)
    }
  }

  async function saveOrder() {
    if (!selected) return
    setSaving(true)
    await fetch(`/api/admin/orders/${selected.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        status: newStatus,
        paymentStatus,
        trackingCode: tracking,
        carrier,
        estimatedDelivery,
        internalNotes,
        statusNote: statusNote || undefined,
      }),
    })
    await load()
    setSelected(null)
    setSaving(false)
  }

  function getCustomerName(o: Order) { return o.customer?.name ?? o.guestName ?? 'Guest' }
  function getCustomerEmail(o: Order) { return o.customer?.email ?? o.guestEmail ?? '–' }

  return (
    <div className="flex">
      <AdminSidebar />
      <main className="lg:ml-64 flex-1 p-4 sm:p-8 min-h-screen pt-16 lg:pt-0">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-black text-white uppercase tracking-widest" style={{ fontFamily: 'var(--font-bebas)' }}>
              Pedidos
            </h1>
            <p className="text-white/40 text-sm mt-1">{orders.length} pedido(s)</p>
          </div>
        </div>

        {/* Payment tabs */}
        <div className="flex gap-0 mb-5 border-b border-white/10 overflow-x-auto">
          {([
            { id: 'confirmed' as PaymentTab, label: 'Pagos', color: 'text-green-400' },
            { id: 'pending' as PaymentTab, label: 'Aguardando Pgto.', color: 'text-yellow-400' },
            { id: 'all' as PaymentTab, label: 'Todos', color: 'text-white/50' },
          ] as const).map(tab => (
            <button
              key={tab.id}
              onClick={() => { setPaymentTab(tab.id); setLoading(true) }}
              className={`px-5 py-2.5 text-sm font-bold uppercase tracking-wider whitespace-nowrap transition-colors cursor-pointer border-b-2 -mb-px ${
                paymentTab === tab.id
                  ? `border-[#E10600] ${tab.color}`
                  : 'border-transparent text-white/30 hover:text-white/60'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Filters */}
        <div className="flex gap-3 mb-6 flex-wrap">
          <div className="flex flex-1 min-w-[200px] max-w-sm">
            <input
              value={searchInput}
              onChange={e => setSearchInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && setSearch(searchInput)}
              placeholder="Número, e-mail, nome..."
              className="flex-1 bg-[#161616] border border-white/10 text-white placeholder-white/20 px-4 py-2 text-sm focus:outline-none focus:border-[#E10600]/60"
            />
            <button
              onClick={() => setSearch(searchInput)}
              className="bg-[#E10600] px-3 text-white hover:bg-[#B80000] transition-colors cursor-pointer"
            >
              <Search size={14} />
            </button>
          </div>
          <div className="relative">
            <select
              value={filterStatus}
              onChange={e => setFilterStatus(e.target.value)}
              className="bg-[#161616] border border-white/10 text-white px-4 py-2 text-sm pr-8 appearance-none focus:outline-none cursor-pointer"
            >
              <option value="">Todos os status</option>
              {STATUS_FLOW.map(s => <option key={s} value={s}>{STATUS_LABEL[s]}</option>)}
            </select>
            <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 pointer-events-none" />
          </div>
        </div>

        {loading ? (
          <p className="text-white/40 text-sm">Carregando...</p>
        ) : (
          <div className="bg-[#161616] border border-white/5 overflow-x-auto">
            <table className="w-full text-sm min-w-[700px]">
              <thead>
                <tr className="border-b border-white/5">
                  {['Número', 'Cliente', 'Status', 'Pagamento', 'Total', 'Data', ''].map(h => (
                    <th key={h} className="text-left text-xs text-white/40 uppercase tracking-wider px-4 py-3">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {orders.map(o => (
                  <tr key={o.id} className="border-b border-white/5 last:border-0 hover:bg-white/[0.03] transition-colors">
                    <td className="px-4 py-3 font-mono text-white text-xs">#{o.orderNumber}</td>
                    <td className="px-4 py-3">
                      <p className="text-white/70 text-sm">{getCustomerName(o)}</p>
                      <p className="text-white/30 text-xs">{getCustomerEmail(o)}</p>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-0.5 ${STATUS_COLOR[o.status] ?? 'text-white/40'}`}>
                        {STATUS_LABEL[o.status] ?? o.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-medium ${PAYMENT_STATUS_COLOR[o.paymentStatus] ?? 'text-white/40'}`}>
                        {PAYMENT_STATUS_LABEL[o.paymentStatus] ?? o.paymentStatus}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-white font-semibold">{formatPrice(o.total)}</td>
                    <td className="px-4 py-3 text-white/40 text-xs">{new Date(o.createdAt).toLocaleDateString('pt-BR')}</td>
                    <td className="px-4 py-3">
                      <button onClick={() => openOrder(o)} className="text-xs text-[#E10600] hover:text-white transition-colors cursor-pointer font-semibold">
                        Detalhes
                      </button>
                    </td>
                  </tr>
                ))}
                {orders.length === 0 && (
                  <tr><td colSpan={7} className="px-4 py-8 text-center text-white/30 text-sm">Nenhum pedido encontrado</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Order Detail Side Panel */}
        {selected && (
          <div className="fixed inset-0 bg-black/80 z-50 flex items-start justify-end">
            <div className="bg-[#161616] border-l border-white/10 w-full max-w-lg h-full overflow-y-auto">
              {/* Header */}
              <div className="flex items-center justify-between p-5 border-b border-white/10 sticky top-0 bg-[#161616] z-10">
                <div>
                  <h2 className="text-white font-bold font-mono">#{selected.orderNumber}</h2>
                  <p className="text-xs text-white/40">{new Date(selected.createdAt).toLocaleString('pt-BR')}</p>
                </div>
                <div className="flex items-center gap-2">
                  {selected.statusHistory && selected.statusHistory.length > 0 && (
                    <button
                      onClick={() => setShowHistory(s => !s)}
                      className={`p-2 transition-colors cursor-pointer ${showHistory ? 'text-[#E10600]' : 'text-white/40 hover:text-white'}`}
                      title="Histórico"
                    >
                      <History size={16} />
                    </button>
                  )}
                  <button onClick={() => setSelected(null)} className="text-white/40 hover:text-white cursor-pointer"><X size={20} /></button>
                </div>
              </div>

              <div className="p-5 space-y-6">
                {/* Customer info */}
                <div>
                  <p className="text-xs text-white/40 uppercase tracking-wider mb-2">Cliente</p>
                  <p className="text-sm text-white font-semibold">{getCustomerName(selected)}</p>
                  <p className="text-xs text-white/50">{getCustomerEmail(selected)}</p>
                  {selected.guestPhone && <p className="text-xs text-white/50">{selected.guestPhone}</p>}
                </div>

                {/* Address */}
                {(selected.guestZipCode || selected.guestStreet) && (
                  <div>
                    <p className="text-xs text-white/40 uppercase tracking-wider mb-2">Endereço de Entrega</p>
                    <p className="text-xs text-white/60">
                      {selected.guestStreet}{selected.guestNumber ? `, ${selected.guestNumber}` : ''} — {selected.guestDistrict}
                    </p>
                    <p className="text-xs text-white/60">{selected.guestCity}/{selected.guestState} · CEP {selected.guestZipCode}</p>
                  </div>
                )}

                {/* Items */}
                <div>
                  <p className="text-xs text-white/40 uppercase tracking-wider mb-2">Itens</p>
                  <div className="space-y-2">
                    {selected.items.map(item => (
                      <div key={item.id} className="flex items-center justify-between bg-black/30 px-3 py-2">
                        <div>
                          <p className="text-sm text-white">{item.productName}</p>
                          <p className="text-xs text-white/40">
                            {[item.size, item.colorName, item.stampName ? `Estampa: ${item.stampName}` : ''].filter(Boolean).join(' / ')} × {item.quantity}
                            {item.isCustomShirt && <span className="ml-1 text-brand-red text-[10px]">[Custom]</span>}
                          </p>
                        </div>
                        <p className="text-sm text-white">{formatPrice(item.unitPrice * item.quantity)}</p>
                      </div>
                    ))}
                  </div>
                  <div className="space-y-1 mt-3 pt-3 border-t border-white/10">
                    <div className="flex justify-between text-xs text-white/50"><span>Subtotal</span><span>{formatPrice(selected.subtotal)}</span></div>
                    <div className="flex justify-between text-xs text-white/50"><span>Frete</span><span>{selected.shippingCost === 0 ? 'Grátis' : formatPrice(selected.shippingCost)}</span></div>
                    {selected.discount > 0 && <div className="flex justify-between text-xs text-green-400"><span>Desconto</span><span>-{formatPrice(selected.discount)}</span></div>}
                    <div className="flex justify-between text-sm font-bold text-white mt-1"><span>Total</span><span>{formatPrice(selected.total)}</span></div>
                  </div>
                </div>

                {/* MP Payment details */}
                {(selected.payment || selected.paymentId) && (
                  <div>
                    <p className="text-xs text-white/40 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                      <CreditCard size={11} /> Mercado Pago
                    </p>
                    <div className="bg-black/20 border border-white/5 px-3 py-2.5 space-y-1.5">
                      {(selected.payment?.mpPaymentId ?? selected.paymentId) && (
                        <div className="flex justify-between text-xs">
                          <span className="text-white/40">ID do Pagamento</span>
                          <span className="text-white font-mono">{selected.payment?.mpPaymentId ?? selected.paymentId}</span>
                        </div>
                      )}
                      {selected.payment?.paymentMethodId && (
                        <div className="flex justify-between text-xs">
                          <span className="text-white/40">Método</span>
                          <span className="text-white capitalize">
                            {PAYMENT_METHOD_LABEL[selected.payment.paymentMethodId] ?? selected.payment.paymentMethodId}
                          </span>
                        </div>
                      )}
                      {selected.payment?.approvedAt && (
                        <div className="flex justify-between text-xs">
                          <span className="text-white/40">Aprovado em</span>
                          <span className="text-green-400">
                            {new Date(selected.payment.approvedAt).toLocaleString('pt-BR')}
                          </span>
                        </div>
                      )}
                      {(selected.mpPreferenceId ?? selected.payment?.mpPreferenceId) && (
                        <div className="flex justify-between text-xs">
                          <span className="text-white/40">Preference ID</span>
                          <span className="text-white/50 font-mono truncate max-w-[160px]">
                            {selected.mpPreferenceId ?? selected.payment?.mpPreferenceId}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Customer notes */}
                {selected.notes && (
                  <div>
                    <p className="text-xs text-white/40 uppercase tracking-wider mb-1">Obs. do cliente</p>
                    <p className="text-xs text-white/60 bg-black/20 px-3 py-2">{selected.notes}</p>
                  </div>
                )}

                {/* Status history */}
                {showHistory && selected.statusHistory && selected.statusHistory.length > 0 && (
                  <div>
                    <p className="text-xs text-white/40 uppercase tracking-wider mb-3">Histórico de Status</p>
                    <div className="space-y-0">
                      {selected.statusHistory.map((h, i) => (
                        <div key={h.id} className="flex gap-3">
                          <div className="flex flex-col items-center">
                            <div className={`w-6 h-6 rounded-full border flex items-center justify-center text-[10px] flex-shrink-0 ${
                              i === selected.statusHistory!.length - 1
                                ? 'border-[#E10600] text-[#E10600]'
                                : 'border-white/20 text-white/40'
                            }`}>
                              {i + 1}
                            </div>
                            {i < selected.statusHistory!.length - 1 && (
                              <div className="w-px flex-1 bg-white/10 my-1" />
                            )}
                          </div>
                          <div className="pb-4">
                            <p className="text-xs font-semibold text-white">{HISTORY_STATUS_LABELS[h.status] ?? h.status}</p>
                            {h.note && <p className="text-xs text-white/40 mt-0.5">{h.note}</p>}
                            <p className="text-[11px] text-white/30 mt-0.5">
                              {new Date(h.createdAt).toLocaleString('pt-BR')} · {h.createdBy}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Update section */}
                <div className="border-t border-white/5 pt-5 space-y-4">
                  <p className="text-xs text-white/40 uppercase tracking-wider">Atualizar Pedido</p>

                  <div>
                    <label className="text-xs text-white/40 uppercase tracking-wider mb-1 block">Status do Pedido</label>
                    <div className="relative">
                      <select value={newStatus} onChange={e => setNewStatus(e.target.value)} className={INPUT + ' appearance-none'}>
                        {STATUS_FLOW.map(s => <option key={s} value={s}>{STATUS_LABEL[s]}</option>)}
                      </select>
                      <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 pointer-events-none" />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs text-white/40 uppercase tracking-wider mb-1 block">Nota de Status (opcional)</label>
                    <input
                      value={statusNote}
                      onChange={e => setStatusNote(e.target.value)}
                      placeholder="Ex: Produto separado para envio"
                      className={INPUT}
                    />
                  </div>

                  <div>
                    <label className="text-xs text-white/40 uppercase tracking-wider mb-1 block">Status do Pagamento</label>
                    <div className="relative">
                      <select value={paymentStatus} onChange={e => setPaymentStatus(e.target.value)} className={INPUT + ' appearance-none'}>
                        {['PENDING', 'APPROVED', 'REJECTED', 'REFUNDED'].map(s => (
                          <option key={s} value={s}>{PAYMENT_STATUS_LABEL[s]}</option>
                        ))}
                      </select>
                      <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 pointer-events-none" />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs text-white/40 uppercase tracking-wider mb-1 block">Transportadora</label>
                      <input value={carrier} onChange={e => setCarrier(e.target.value)} placeholder="Ex: Correios, J&T" className={INPUT} />
                    </div>
                    <div>
                      <label className="text-xs text-white/40 uppercase tracking-wider mb-1 block">Código de Rastreio</label>
                      <input value={tracking} onChange={e => setTracking(e.target.value)} placeholder="BR123456789" className={INPUT} />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs text-white/40 uppercase tracking-wider mb-1 block">Previsão de Entrega</label>
                    <input value={estimatedDelivery} onChange={e => setEstimatedDelivery(e.target.value)} placeholder="Ex: 20/06/2026" className={INPUT} />
                  </div>

                  <div>
                    <label className="text-xs text-white/40 uppercase tracking-wider mb-1 block">Notas Internas (não visível ao cliente)</label>
                    <textarea
                      value={internalNotes}
                      onChange={e => setInternalNotes(e.target.value)}
                      rows={2}
                      placeholder="Anotações internas..."
                      className={INPUT}
                    />
                  </div>

                  <button
                    onClick={saveOrder}
                    disabled={saving}
                    className="w-full bg-[#E10600] hover:bg-[#B80000] text-white py-2.5 text-sm font-bold transition-colors disabled:opacity-60 cursor-pointer flex items-center justify-center gap-2"
                  >
                    <Save size={15} /> {saving ? 'Salvando...' : 'Salvar Alterações'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}

