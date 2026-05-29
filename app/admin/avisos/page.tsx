'use client'

import { useEffect, useState } from 'react'
import { AdminSidebar } from '@/components/admin/AdminSidebar'
import { Plus, Trash2, Check, Megaphone } from 'lucide-react'

const INPUT = 'w-full bg-black/40 border border-white/10 text-white placeholder-white/20 px-3 py-2 text-sm focus:outline-none focus:border-[#E10600]/60'

export default function AvisosPage() {
  const [messages, setMessages]   = useState<string[]>([])
  const [newMsg, setNewMsg]       = useState('')
  const [active, setActive]       = useState(false)
  const [speed, setSpeed]         = useState(5000)
  const [saving, setSaving]       = useState(false)
  const [loading, setLoading]     = useState(true)
  const [saved, setSaved]         = useState(false)

  useEffect(() => {
    fetch('/api/admin/announcement-bar')
      .then(r => r.json())
      .then(d => {
        setMessages(Array.isArray(d.messages) ? d.messages : [])
        setActive(Boolean(d.active))
        setSpeed(Number(d.speed) || 5000)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  function addMessage() {
    const trimmed = newMsg.trim()
    if (!trimmed) return
    setMessages(m => [...m, trimmed])
    setNewMsg('')
  }

  function removeMessage(i: number) {
    setMessages(m => m.filter((_, j) => j !== i))
  }

  async function handleSave() {
    setSaving(true)
    try {
      await fetch('/api/admin/announcement-bar', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages, active, speed }),
      })
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } catch { alert('Erro ao salvar') }
    finally { setSaving(false) }
  }

  return (
    <div className="flex">
      <AdminSidebar />
      <main className="lg:ml-64 flex-1 p-4 sm:p-8 min-h-screen pt-16 lg:pt-0">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-black text-white uppercase tracking-widest flex items-center gap-3" style={{ fontFamily: 'var(--font-bebas)' }}>
              <Megaphone size={22} className="text-[#E10600]" />
              Barra de Avisos
            </h1>
            <p className="text-white/40 text-sm mt-1">Mensagens animadas exibidas no topo do site</p>
          </div>
        </div>

        {loading ? (
          <p className="text-white/40 text-sm">Carregando...</p>
        ) : (
          <div className="max-w-2xl space-y-6">
            {/* Toggle */}
            <div className="bg-[#161616] border border-white/5 p-5 flex items-center justify-between">
              <div>
                <p className="text-white font-semibold text-sm">Ativar barra de avisos</p>
                <p className="text-white/40 text-xs mt-0.5">A barra aparece acima do menu principal</p>
              </div>
              <button
                onClick={() => setActive(a => !a)}
                className={`relative w-12 h-6 rounded-full transition-colors cursor-pointer ${active ? 'bg-[#E10600]' : 'bg-white/10'}`}
              >
                <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all ${active ? 'left-6' : 'left-0.5'}`} />
              </button>
            </div>

            {/* Speed */}
            <div className="bg-[#161616] border border-white/5 p-5 space-y-2">
              <label className="text-xs text-white/50 uppercase tracking-wider block">Duração de cada mensagem (ms)</label>
              <input
                type="number"
                min={1500}
                max={15000}
                step={500}
                value={speed}
                onChange={e => setSpeed(Number(e.target.value))}
                className={INPUT}
              />
              <p className="text-[11px] text-white/30">Sugestão: 4000–6000ms. Atual: {speed / 1000}s por mensagem</p>
            </div>

            {/* Messages */}
            <div className="bg-[#161616] border border-white/5 p-5 space-y-4">
              <div>
                <p className="text-xs text-white/50 uppercase tracking-wider mb-3">Mensagens ({messages.length})</p>
                <div className="space-y-2 mb-3">
                  {messages.map((msg, i) => (
                    <div key={i} className="flex items-center gap-2 bg-white/5 px-3 py-2.5">
                      <span className="w-5 h-5 text-[10px] bg-[#E10600]/20 text-[#E10600] font-bold flex items-center justify-center flex-shrink-0">
                        {i + 1}
                      </span>
                      <span className="flex-1 text-sm text-white truncate">{msg}</span>
                      <button onClick={() => removeMessage(i)} className="text-white/30 hover:text-red-400 transition-colors cursor-pointer">
                        <Trash2 size={13} />
                      </button>
                    </div>
                  ))}
                  {messages.length === 0 && (
                    <p className="text-white/20 text-xs py-2">Nenhuma mensagem ainda. Adicione abaixo.</p>
                  )}
                </div>
                <div className="flex gap-2">
                  <input
                    value={newMsg}
                    onChange={e => setNewMsg(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addMessage() } }}
                    className={`${INPUT} flex-1`}
                    placeholder="Ex: Frete grátis acima de R$ 199! 🚀"
                  />
                  <button onClick={addMessage} className="px-3 bg-[#E10600] hover:bg-[#B80000] text-white cursor-pointer">
                    <Plus size={16} />
                  </button>
                </div>
                <p className="text-[10px] text-white/20 mt-1.5">Pressione Enter ou clique + para adicionar. As mensagens se alternam em loop.</p>
              </div>
            </div>

            {/* Preview */}
            {messages.length > 0 && active && (
              <div className="border border-white/10 p-4">
                <p className="text-xs text-white/40 uppercase tracking-wider mb-2">Prévia</p>
                <div className="bg-[#E10600] py-2 px-4 text-center">
                  <p className="text-white text-xs font-semibold uppercase tracking-[0.15em]">
                    {messages[0]}{messages.length > 1 ? ` (+ ${messages.length - 1} mensagens em loop)` : ''}
                  </p>
                </div>
              </div>
            )}

            {/* Save */}
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 bg-[#E10600] hover:bg-[#B80000] text-white px-6 py-3 text-sm font-bold uppercase tracking-wider transition-colors cursor-pointer disabled:opacity-60"
            >
              <Check size={16} />
              {saving ? 'Salvando...' : saved ? 'Salvo!' : 'Salvar Configurações'}
            </button>
          </div>
        )}
      </main>
    </div>
  )
}
