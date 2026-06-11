'use client'

import { useEffect, useState } from 'react'
import { AdminSidebar } from '@/components/admin/AdminSidebar'
import { Save, Truck, Package, Gift } from 'lucide-react'

type Config = {
  id: string
  originZipCode: string
  fixedShippingEnabled: boolean
  fixedShippingValue: number
  freeShippingAbove: number
  globalFreeShipping: boolean
  productionDaysStd: number
  productionDaysCustom: number
  updatedAt: string
}

const INPUT = 'w-full bg-black/40 border border-white/10 text-white placeholder-white/20 px-3 py-2 text-sm focus:outline-none focus:border-[#E10600]/60'

export default function FreteConfigPage() {
  const [cfg, setCfg] = useState<Config | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => { load() }, [])

  async function load() {
    const data = await fetch('/api/admin/shipping-config').then(r => r.json())
    setCfg(data)
    setLoading(false)
  }

  async function handleSave() {
    if (!cfg) return
    setSaving(true)
    setSaved(false)
    await fetch('/api/admin/shipping-config', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(cfg),
    })
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  if (loading || !cfg) {
    return (
      <div className="flex">
        <AdminSidebar />
        <main className="lg:ml-64 flex-1 p-4 sm:p-8 min-h-screen pt-16 lg:pt-0 flex items-center justify-center">
          <p className="text-white/40">Carregando...</p>
        </main>
      </div>
    )
  }

  return (
    <div className="flex">
      <AdminSidebar />
      <main className="lg:ml-64 flex-1 p-4 sm:p-8 min-h-screen pt-16 lg:pt-0">
        <div className="mb-8">
          <h1 className="text-2xl font-black text-white uppercase tracking-widest" style={{ fontFamily: 'var(--font-bebas)' }}>
            Configuração de Frete
          </h1>
          <p className="text-white/40 text-sm mt-1">
            Valores usados no cálculo automático do frete · Última atualização:{' '}
            {new Date(cfg.updatedAt).toLocaleString('pt-BR')}
          </p>
        </div>

        <div className="max-w-xl space-y-6">
          {/* Global Free Shipping Banner */}
          <section className={`border p-5 transition-colors ${cfg.globalFreeShipping ? 'bg-green-400/10 border-green-400/30' : 'bg-[#161616] border-white/5'}`}>
            <div className="flex items-start gap-4">
              <div className={`w-10 h-10 flex-shrink-0 flex items-center justify-center rounded-full ${cfg.globalFreeShipping ? 'bg-green-400/20' : 'bg-white/5'}`}>
                <Gift size={18} className={cfg.globalFreeShipping ? 'text-green-400' : 'text-white/40'} />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className={`text-sm font-bold uppercase tracking-wider ${cfg.globalFreeShipping ? 'text-green-400' : 'text-white/70'}`}>
                      Frete Grátis Global
                    </p>
                    <p className="text-xs text-white/40 mt-0.5">
                      Quando ativado, <strong className="text-white/60">todos os clientes</strong> recebem frete grátis independente do valor do pedido.
                    </p>
                    {cfg.globalFreeShipping && (
                      <p className="text-xs text-green-400/80 mt-1 font-semibold">
                        ✓ Ativado — todos os pedidos estão com frete grátis agora
                      </p>
                    )}
                  </div>
                  {/* Toggle switch */}
                  <button
                    type="button"
                    onClick={() => setCfg(c => c ? { ...c, globalFreeShipping: !c.globalFreeShipping } : c)}
                    className={`relative flex-shrink-0 w-12 h-6 rounded-full transition-colors cursor-pointer focus:outline-none ${cfg.globalFreeShipping ? 'bg-green-400' : 'bg-white/10'}`}
                    aria-label="Toggle frete grátis global"
                  >
                    <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${cfg.globalFreeShipping ? 'translate-x-6' : 'translate-x-0'}`} />
                  </button>
                </div>
              </div>
            </div>
          </section>

          {/* Shipping */}
          <section className={`bg-[#161616] border border-white/5 p-6 transition-opacity ${cfg.globalFreeShipping ? 'opacity-40 pointer-events-none select-none' : ''}`}>
            <div className="flex items-center gap-2 mb-5">
              <Truck size={16} className="text-[#E10600]" />
              <h2 className="text-sm font-bold text-white uppercase tracking-wider">
                Frete
                {cfg.globalFreeShipping && <span className="ml-2 text-[10px] text-green-400/70 font-normal normal-case tracking-normal">(sobrescrito pelo Frete Grátis Global)</span>}
              </h2>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-xs text-white/50 uppercase tracking-wider mb-1 block">CEP de Origem</label>
                <input
                  value={cfg.originZipCode}
                  onChange={e => setCfg(c => c ? { ...c, originZipCode: e.target.value } : c)}
                  className={INPUT}
                  placeholder="01001000"
                />
              </div>

              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="fixed-enabled"
                  checked={cfg.fixedShippingEnabled}
                  onChange={e => setCfg(c => c ? { ...c, fixedShippingEnabled: e.target.checked } : c)}
                  className="cursor-pointer"
                />
                <label htmlFor="fixed-enabled" className="text-sm text-white/70 cursor-pointer">
                  Usar frete fixo para todo Brasil
                </label>
              </div>

              {cfg.fixedShippingEnabled && (
                <div>
                  <label className="text-xs text-white/50 uppercase tracking-wider mb-1 block">Valor do Frete Fixo (R$)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={cfg.fixedShippingValue}
                    onChange={e => setCfg(c => c ? { ...c, fixedShippingValue: parseFloat(e.target.value) } : c)}
                    className={INPUT}
                  />
                </div>
              )}

              <div>
                <label className="text-xs text-white/50 uppercase tracking-wider mb-1 block">Frete Grátis Acima de (R$)</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={cfg.freeShippingAbove}
                  onChange={e => setCfg(c => c ? { ...c, freeShippingAbove: parseFloat(e.target.value) } : c)}
                  className={INPUT}
                />
                <p className="text-xs text-white/30 mt-1">Pedidos acima deste valor recebem frete grátis automaticamente.</p>
              </div>
            </div>
          </section>

          {/* Production time */}
          <section className="bg-[#161616] border border-white/5 p-6">
            <div className="flex items-center gap-2 mb-5">
              <Package size={16} className="text-[#E10600]" />
              <h2 className="text-sm font-bold text-white uppercase tracking-wider">Prazo de Produção</h2>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-white/50 uppercase tracking-wider mb-1 block">Produtos Padrão (dias úteis)</label>
                <input
                  type="number"
                  min="1"
                  max="60"
                  value={cfg.productionDaysStd}
                  onChange={e => setCfg(c => c ? { ...c, productionDaysStd: parseInt(e.target.value) } : c)}
                  className={INPUT}
                />
                <p className="text-xs text-white/30 mt-1">DryFit, 3D, Geek</p>
              </div>
              <div>
                <label className="text-xs text-white/50 uppercase tracking-wider mb-1 block">Itens Personalizados (dias úteis)</label>
                <input
                  type="number"
                  min="1"
                  max="60"
                  value={cfg.productionDaysCustom}
                  onChange={e => setCfg(c => c ? { ...c, productionDaysCustom: parseInt(e.target.value) } : c)}
                  className={INPUT}
                />
                <p className="text-xs text-white/30 mt-1">Oversized / Camiseta com estampa</p>
              </div>
            </div>
            <div className="mt-4 bg-white/5 border border-white/5 p-3 text-xs text-white/40">
              Ao prazo de produção, adiciona-se automaticamente +5 dias úteis para envio/trânsito.
            </div>
          </section>

          {/* Preview */}
          <section className="bg-[#161616] border border-white/5 p-4">
            <p className="text-xs text-white/40 uppercase tracking-wider mb-3">Pré-visualização das regras</p>
            <div className="space-y-1 text-xs">
              <div className="flex justify-between text-white/60">
                <span>Frete para pedido de R$50</span>
                <span className={cfg.globalFreeShipping ? 'text-green-400' : cfg.fixedShippingEnabled ? 'text-white' : 'text-green-400'}>
                  {cfg.globalFreeShipping ? '🎁 Grátis (global)' : cfg.fixedShippingEnabled ? `R$ ${cfg.fixedShippingValue.toFixed(2)}` : 'Grátis'}
                </span>
              </div>
              <div className="flex justify-between text-white/60">
                <span>Frete para pedido de R${cfg.freeShippingAbove.toFixed(2)}</span>
                <span className="text-green-400">
                  {cfg.globalFreeShipping ? '🎁 Grátis (global)' : 'Grátis'}
                </span>
              </div>
              <div className="flex justify-between text-white/60">
                <span>Prazo item padrão</span>
                <span className="text-white">~{cfg.productionDaysStd + 5} dias úteis</span>
              </div>
              <div className="flex justify-between text-white/60">
                <span>Prazo item personalizado</span>
                <span className="text-white">~{cfg.productionDaysCustom + 5} dias úteis</span>
              </div>
            </div>
          </section>

          <button
            onClick={handleSave}
            disabled={saving}
            className="w-full bg-[#E10600] hover:bg-[#B80000] text-white py-3 text-sm font-bold uppercase tracking-wider transition-colors disabled:opacity-60 cursor-pointer flex items-center justify-center gap-2"
          >
            <Save size={16} />
            {saving ? 'Salvando...' : saved ? '✓ Salvo!' : 'Salvar Configurações'}
          </button>
        </div>
      </main>
    </div>
  )
}

