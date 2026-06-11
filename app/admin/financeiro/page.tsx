'use client'

import { useEffect, useState } from 'react'
import { AdminSidebar } from '@/components/admin/AdminSidebar'
import { Plus, Trash2, TrendingUp, TrendingDown, DollarSign, ShoppingBag, AlertCircle, ChevronLeft, ChevronRight } from 'lucide-react'
import { formatPrice } from '@/lib/utils'

/* ─────────────────── types ──────────────────── */
type Expense = {
  id: string
  description: string
  category: string
  amount: number
  date: string
  notes: string | null
}

type OrderSummary = {
  id: string
  orderNumber: string
  guestName?: string
  customer?: { name: string }
  subtotal: number
  total: number
  couponDiscount: number
  createdAt: string
  paymentStatus: string
  items: { productName: string; quantity: number; unitPrice: number }[]
}

const CATEGORIES = ['Estoque', 'Marketing', 'Operacional', 'Logística', 'Equipamentos', 'Geral', 'Outro']
const INPUT = 'w-full bg-black/40 border border-white/10 text-white px-3 py-2 text-sm focus:outline-none focus:border-white/30 placeholder-white/20'

function fmt(d: string) {
  return new Date(d).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

/* ─────────────────── helpers ────────────────── */
function monthName(y: number, m: number) {
  return new Date(y, m - 1, 1).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })
}

/* ─────────────────── page ───────────────────── */
export default function FinanceiroPage() {
  const now = new Date()
  const [year, setYear] = useState(now.getFullYear())
  const [month, setMonth] = useState(now.getMonth() + 1) // 1-based

  const [expenses, setExpenses] = useState<Expense[]>([])
  const [orders, setOrders] = useState<OrderSummary[]>([])
  const [loadingExp, setLoadingExp] = useState(true)
  const [loadingOrd, setLoadingOrd] = useState(true)

  const [tab, setTab] = useState<'overview' | 'expenses' | 'revenue'>('overview')
  const [expenseError, setExpenseError] = useState('')
  const [addingSaving, setAddingSaving] = useState(false)

  const [newExpense, setNewExpense] = useState({
    description: '',
    category: 'Geral',
    amount: '',
    date: new Date().toISOString().split('T')[0],
    notes: '',
  })

  const monthStr = `${year}-${String(month).padStart(2, '0')}`

  /* ── loaders ── */
  async function loadExpenses() {
    setLoadingExp(true)
    const data = await fetch(`/api/admin/expenses?month=${monthStr}`).then(r => r.json()).catch(() => [])
    setExpenses(Array.isArray(data) ? data : [])
    setLoadingExp(false)
  }

  async function loadOrders() {
    setLoadingOrd(true)
    const data = await fetch('/api/admin/orders').then(r => r.json()).catch(() => [])
    if (Array.isArray(data)) {
      // Filter by month + payment approved
      const [y, m] = monthStr.split('-').map(Number)
      const start = new Date(y, m - 1, 1).getTime()
      const end   = new Date(y, m, 1).getTime()
      setOrders(data.filter((o: OrderSummary) => {
        const t = new Date(o.createdAt).getTime()
        return t >= start && t < end && o.paymentStatus === 'APPROVED'
      }))
    }
    setLoadingOrd(false)
  }

  useEffect(() => { loadExpenses(); loadOrders() }, [monthStr])

  /* ── navigation ── */
  function prevMonth() {
    if (month === 1) { setYear(y => y - 1); setMonth(12) }
    else setMonth(m => m - 1)
  }
  function nextMonth() {
    if (month === 12) { setYear(y => y + 1); setMonth(1) }
    else setMonth(m => m + 1)
  }

  /* ── financials ── */
  const revenue  = orders.reduce((s, o) => s + o.total, 0)
  const totalExp = expenses.reduce((s, e) => s + e.amount, 0)
  const profit   = revenue - totalExp

  /* ── add expense ── */
  async function handleAddExpense() {
    if (!newExpense.description.trim()) { setExpenseError('Descrição obrigatória.'); return }
    const amt = parseFloat(newExpense.amount)
    if (!amt || amt <= 0) { setExpenseError('Valor inválido.'); return }

    setAddingSaving(true)
    setExpenseError('')
    try {
      await fetch('/api/admin/expenses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          description: newExpense.description.trim(),
          category: newExpense.category,
          amount: amt,
          date: newExpense.date,
          notes: newExpense.notes || null,
        }),
      })
      setNewExpense(p => ({ ...p, description: '', amount: '', notes: '' }))
      await loadExpenses()
    } catch { setExpenseError('Erro ao salvar.') }
    finally { setAddingSaving(false) }
  }

  async function deleteExpense(id: string, desc: string) {
    if (!confirm(`Excluir "${desc}"?`)) return
    await fetch(`/api/admin/expenses/${id}`, { method: 'DELETE' })
    await loadExpenses()
  }

  /* ─────────── render ─────────── */
  const loading = loadingExp || loadingOrd

  return (
    <div className="flex">
      <AdminSidebar />
      <main className="lg:ml-64 flex-1 p-4 sm:p-8 min-h-screen pt-16 lg:pt-0">
        {/* Header + month nav */}
        <div className="flex flex-wrap items-start justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-black text-white uppercase tracking-widest" style={{ fontFamily: 'var(--font-bebas)' }}>
              Financeiro
            </h1>
            <p className="text-white/40 text-sm mt-1">Receitas, despesas e lucro do período</p>
          </div>
          {/* Month selector */}
          <div className="flex items-center gap-2 bg-[#161616] border border-white/5 px-3 py-2">
            <button onClick={prevMonth} className="p-1 text-white/40 hover:text-white cursor-pointer transition-colors">
              <ChevronLeft size={16} />
            </button>
            <span className="text-sm font-semibold text-white w-36 text-center capitalize">{monthName(year, month)}</span>
            <button onClick={nextMonth} className="p-1 text-white/40 hover:text-white cursor-pointer transition-colors">
              <ChevronRight size={16} />
            </button>
          </div>
        </div>

        {/* Summary cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          {[
            {
              label: 'Receita (vendas aprovadas)',
              value: revenue,
              sub: `${orders.length} pedido${orders.length !== 1 ? 's' : ''}`,
              icon: TrendingUp,
              color: 'text-green-400',
              bg: 'bg-green-400/8',
              border: 'border-green-400/15',
            },
            {
              label: 'Despesas',
              value: totalExp,
              sub: `${expenses.length} lançamento${expenses.length !== 1 ? 's' : ''}`,
              icon: TrendingDown,
              color: 'text-red-400',
              bg: 'bg-red-400/8',
              border: 'border-red-400/15',
            },
            {
              label: 'Lucro Bruto',
              value: profit,
              sub: revenue > 0 ? `${((profit / revenue) * 100).toFixed(1)}% margem` : '—',
              icon: DollarSign,
              color: profit >= 0 ? 'text-white' : 'text-red-400',
              bg: profit >= 0 ? 'bg-white/5' : 'bg-red-400/8',
              border: profit >= 0 ? 'border-white/5' : 'border-red-400/15',
            },
          ].map(card => (
            <div key={card.label} className={`${card.bg} border ${card.border} p-5`}>
              <div className="flex items-start justify-between mb-3">
                <p className="text-xs text-white/40 uppercase tracking-wider">{card.label}</p>
                <card.icon size={16} className={card.color} />
              </div>
              <p className={`text-2xl font-black ${card.color}`} style={{ fontFamily: 'var(--font-bebas)' }}>
                {formatPrice(Math.abs(card.value))}{profit < 0 && card.label.includes('Lucro') ? ' (negativo)' : ''}
              </p>
              <p className="text-xs text-white/30 mt-1">{card.sub}</p>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-6 border-b border-white/5">
          {([['overview', 'Visão Geral'], ['expenses', 'Despesas'], ['revenue', 'Receitas']] as const).map(([id, label]) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              className={`px-4 py-2.5 text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer border-b-2 ${
                tab === id ? 'text-white border-brand-red' : 'text-white/40 border-transparent hover:text-white/70'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {loading ? <p className="text-white/40 text-sm">Carregando...</p> : (
          <>
            {/* ── Overview ── */}
            {tab === 'overview' && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Revenue mini-list */}
                <div>
                  <h3 className="text-xs font-bold text-white/40 uppercase tracking-wider mb-3 flex items-center gap-2">
                    <ShoppingBag size={12} /> Últimas vendas do mês
                  </h3>
                  {orders.length === 0 ? (
                    <p className="text-white/20 text-sm">Nenhuma venda aprovada neste período.</p>
                  ) : (
                    <div className="space-y-2">
                      {orders.slice(0, 8).map(o => (
                        <div key={o.id} className="flex items-center justify-between text-sm bg-[#161616] border border-white/5 px-4 py-2.5">
                          <div>
                            <p className="text-white font-mono text-xs">{o.orderNumber}</p>
                            <p className="text-white/40 text-[11px]">{o.guestName ?? o.customer?.name ?? 'Cliente'} · {fmt(o.createdAt)}</p>
                          </div>
                          <span className="text-green-400 font-bold">{formatPrice(o.total)}</span>
                        </div>
                      ))}
                      {orders.length > 8 && (
                        <p className="text-xs text-white/30 text-center">... e mais {orders.length - 8} pedidos</p>
                      )}
                    </div>
                  )}
                </div>

                {/* Expense mini-list */}
                <div>
                  <h3 className="text-xs font-bold text-white/40 uppercase tracking-wider mb-3 flex items-center gap-2">
                    <TrendingDown size={12} /> Últimas despesas do mês
                  </h3>
                  {expenses.length === 0 ? (
                    <p className="text-white/20 text-sm">Nenhuma despesa neste período.</p>
                  ) : (
                    <div className="space-y-2">
                      {expenses.slice(0, 8).map(e => (
                        <div key={e.id} className="flex items-center justify-between text-sm bg-[#161616] border border-white/5 px-4 py-2.5">
                          <div>
                            <p className="text-white/80 text-sm">{e.description}</p>
                            <p className="text-white/30 text-[11px]">{e.category} · {fmt(e.date)}</p>
                          </div>
                          <span className="text-red-400 font-bold">- {formatPrice(e.amount)}</span>
                        </div>
                      ))}
                      {expenses.length > 8 && (
                        <p className="text-xs text-white/30 text-center">... e mais {expenses.length - 8} despesas</p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ── Expenses tab ── */}
            {tab === 'expenses' && (
              <div className="space-y-6">
                {/* Add expense form */}
                <div className="bg-[#161616] border border-white/5 p-5">
                  <h3 className="text-xs font-bold text-white/50 uppercase tracking-wider mb-4 flex items-center gap-2">
                    <Plus size={12} /> Lançar Despesa
                  </h3>

                  {expenseError && (
                    <div className="flex items-center gap-2 text-red-400 text-xs bg-red-400/10 border border-red-400/20 px-3 py-2 mb-3">
                      <AlertCircle size={12} />
                      {expenseError}
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-3">
                    <div className="sm:col-span-2">
                      <label className="text-[10px] text-white/30 uppercase tracking-wider block mb-1">Descrição *</label>
                      <input
                        value={newExpense.description}
                        onChange={e => setNewExpense(p => ({ ...p, description: e.target.value }))}
                        placeholder="Ex: Lote camisetas premium"
                        className={INPUT}
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-white/30 uppercase tracking-wider block mb-1">Categoria</label>
                      <select
                        value={newExpense.category}
                        onChange={e => setNewExpense(p => ({ ...p, category: e.target.value }))}
                        className={INPUT}
                      >
                        {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="text-[10px] text-white/30 uppercase tracking-wider block mb-1">Valor (R$) *</label>
                      <input
                        type="number" min="0.01" step="0.01"
                        value={newExpense.amount}
                        onChange={e => setNewExpense(p => ({ ...p, amount: e.target.value }))}
                        placeholder="0,00"
                        className={INPUT}
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-white/30 uppercase tracking-wider block mb-1">Data</label>
                      <input
                        type="date"
                        value={newExpense.date}
                        onChange={e => setNewExpense(p => ({ ...p, date: e.target.value }))}
                        className={INPUT}
                      />
                    </div>
                    <div className="sm:col-span-2 lg:col-span-3">
                      <label className="text-[10px] text-white/30 uppercase tracking-wider block mb-1">Observações</label>
                      <input
                        value={newExpense.notes}
                        onChange={e => setNewExpense(p => ({ ...p, notes: e.target.value }))}
                        placeholder="Notas internas (opcional)"
                        className={INPUT}
                      />
                    </div>
                    <div className="flex items-end">
                      <button
                        onClick={handleAddExpense}
                        disabled={addingSaving}
                        className="w-full flex items-center justify-center gap-2 py-2 bg-brand-red text-white text-sm font-bold hover:bg-brand-red-dark transition-colors cursor-pointer disabled:opacity-50"
                      >
                        <Plus size={14} />
                        {addingSaving ? 'Salvando...' : 'Adicionar'}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Expense list */}
                {expenses.length === 0 ? (
                  <p className="text-white/30 text-sm">Nenhuma despesa neste período.</p>
                ) : (
                  <div className="bg-[#161616] border border-white/5 overflow-hidden">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-white/5">
                          {['Data', 'Descrição', 'Categoria', 'Valor', 'Obs.', ''].map(h => (
                            <th key={h} className="text-left text-xs text-white/40 uppercase tracking-wider px-5 py-3 last:text-center">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {expenses.map(e => (
                          <tr key={e.id} className="border-b border-white/5 last:border-0 hover:bg-white/2 transition-colors">
                            <td className="px-5 py-3 text-white/50 whitespace-nowrap">{fmt(e.date)}</td>
                            <td className="px-5 py-3 text-white">{e.description}</td>
                            <td className="px-5 py-3">
                              <span className="text-[10px] border border-white/10 text-white/50 px-2 py-0.5">{e.category}</span>
                            </td>
                            <td className="px-5 py-3 text-red-400 font-bold whitespace-nowrap">- {formatPrice(e.amount)}</td>
                            <td className="px-5 py-3 text-white/30 text-xs max-w-[150px] truncate">{e.notes ?? '—'}</td>
                            <td className="px-5 py-3 text-center">
                              <button onClick={() => deleteExpense(e.id, e.description)}
                                className="p-1 text-white/20 hover:text-red-400 transition-colors cursor-pointer">
                                <Trash2 size={13} />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot>
                        <tr className="border-t border-white/10">
                          <td colSpan={3} className="px-5 py-3 text-xs text-white/40 font-bold uppercase tracking-wider">
                            Total de despesas
                          </td>
                          <td className="px-5 py-3 font-black text-red-400">- {formatPrice(totalExp)}</td>
                          <td colSpan={2} />
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                )}
              </div>
            )}

            {/* ── Revenue tab ── */}
            {tab === 'revenue' && (
              <div>
                {orders.length === 0 ? (
                  <p className="text-white/30 text-sm">Nenhuma venda com pagamento aprovado neste período.</p>
                ) : (
                  <div className="bg-[#161616] border border-white/5 overflow-hidden">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-white/5">
                          {['Data', 'Pedido', 'Cliente', 'Itens', 'Desconto', 'Total'].map(h => (
                            <th key={h} className="text-left text-xs text-white/40 uppercase tracking-wider px-5 py-3">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {orders.map(o => (
                          <tr key={o.id} className="border-b border-white/5 last:border-0 hover:bg-white/2 transition-colors">
                            <td className="px-5 py-3 text-white/50 whitespace-nowrap">{fmt(o.createdAt)}</td>
                            <td className="px-5 py-3 font-mono text-white text-xs">{o.orderNumber}</td>
                            <td className="px-5 py-3 text-white/70">{o.guestName ?? o.customer?.name ?? 'Cliente'}</td>
                            <td className="px-5 py-3 text-white/50 text-xs">
                              {o.items?.slice(0, 2).map(i => `${i.productName} ×${i.quantity}`).join(', ')}
                              {(o.items?.length ?? 0) > 2 && ` +${o.items.length - 2} mais`}
                            </td>
                            <td className="px-5 py-3">
                              {o.couponDiscount > 0 ? (
                                <span className="text-green-400 text-xs">- {formatPrice(o.couponDiscount)}</span>
                              ) : <span className="text-white/20">—</span>}
                            </td>
                            <td className="px-5 py-3 text-green-400 font-bold whitespace-nowrap">{formatPrice(o.total)}</td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot>
                        <tr className="border-t border-white/10">
                          <td colSpan={5} className="px-5 py-3 text-xs text-white/40 font-bold uppercase tracking-wider">
                            Total de receita ({orders.length} pedidos)
                          </td>
                          <td className="px-5 py-3 font-black text-green-400">{formatPrice(revenue)}</td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </main>
    </div>
  )
}
