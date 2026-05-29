'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { MessageCircle, Check, ArrowRight, Timer, Truck, Award, Send, AlertCircle } from 'lucide-react'
import { KITS } from '@/lib/mock-data'
import { formatPrice, getWhatsAppLink } from '@/lib/utils'

const INPUT = 'w-full bg-black/40 border border-white/10 text-white placeholder-white/30 px-4 py-3 text-sm focus:outline-none focus:border-brand-red/60 transition-colors'

export function KitsPageContent() {
  const [selectedKit, setSelectedKit] = useState('')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [qty, setQty] = useState('')
  const [msg, setMsg] = useState('')
  const [error, setError] = useState('')

  function buildWhatsAppMsg() {
    const lines = [
      'ðŸ‘• *SolicitaÃ§Ã£o de OrÃ§amento â€” StreetDrop Wear*',
      '',
      selectedKit ? `*Kit:* ${selectedKit}` : '',
      `*Nome:* ${name}`,
      email ? `*E-mail:* ${email}` : '',
      `*Telefone:* ${phone}`,
      qty ? `*Quantidade:* ${qty} unidades` : '',
      msg ? `*Mensagem:* ${msg}` : '',
    ].filter(Boolean).join('\n')
    return lines
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name || !phone) { setError('Nome e telefone sÃ£o obrigatÃ³rios.'); return }
    setError('')
    window.open(getWhatsAppLink(buildWhatsAppMsg()), '_blank', 'noopener,noreferrer')
  }

  return (
    <div className="min-h-screen bg-brand-black">
      {/* Banner */}
      <div className="relative bg-brand-graphite border-b border-white/5 overflow-hidden">
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: 'repeating-linear-gradient(45deg, #E10600 0, #E10600 1px, transparent 0, transparent 50%)',
            backgroundSize: '20px 20px',
          }}
        />
        <div className="container-brand py-16 relative">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <span className="text-brand-red text-xs font-bold uppercase tracking-[0.3em]">B2B</span>
            <h1 className="heading-display text-[clamp(3rem,7vw,6rem)] text-brand-white mt-2 leading-none">
              KITS<br />
              <span className="text-gradient-red">PERSONALIZADOS</span>
            </h1>
            <p className="text-brand-gray-text mt-4 max-w-xl text-base">
              Uniforme completo para sua empresa, academia, escola ou evento. Do design Ã  entrega, cuidamos de tudo com qualidade StreetDrop.
            </p>
            <div className="flex flex-wrap gap-4 mt-6">
              <a href="#orcamento" className="btn-primary group">
                <MessageCircle size={18} />
                Solicitar orÃ§amento
                <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </a>
            </div>
          </motion.div>
        </div>
      </div>

      <div className="container-brand py-10">
        {/* Diferenciais */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-14">
          {[
            { icon: Timer, label: 'Prazo garantido', desc: '7 a 15 dias Ãºteis' },
            { icon: Award, label: 'Qualidade premium', desc: 'AlgodÃ£o e dry-fit' },
            { icon: Truck, label: 'Entrega nacional', desc: 'Para todo o Brasil' },
            { icon: MessageCircle, label: 'Suporte dedicado', desc: 'Via WhatsApp' },
          ].map(item => (
            <motion.div
              key={item.label}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="bg-brand-graphite border border-white/5 p-5 text-center"
            >
              <item.icon size={24} className="text-brand-red mx-auto mb-3" strokeWidth={1.5} />
              <p className="text-sm font-bold text-brand-white uppercase tracking-wide">{item.label}</p>
              <p className="text-xs text-brand-gray-text mt-1">{item.desc}</p>
            </motion.div>
          ))}
        </div>

        {/* Kits Grid */}
        <div className="mb-14">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mb-8">
            <span className="text-brand-red text-xs font-bold uppercase tracking-[0.3em]">Modelos</span>
            <h2 className="heading-display text-[clamp(2rem,4vw,3rem)] text-brand-white mt-2">ESCOLHA SEU KIT</h2>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {KITS.map((kit, i) => (
              <motion.div
                key={kit.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className={`bg-brand-graphite border ${kit.popular ? 'border-brand-red/40' : 'border-white/5'} p-6 relative flex flex-col`}
              >
                {kit.popular && (
                  <span className="absolute -top-3 left-6 bg-brand-red text-white text-[10px] font-bold uppercase tracking-wider px-3 py-1">
                    Mais popular
                  </span>
                )}
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <span className="text-xs text-brand-gray-text uppercase tracking-wider font-medium">{kit.targetAudience}</span>
                    <h3 className="heading-display text-2xl text-brand-white mt-1">{kit.name}</h3>
                  </div>
                  {kit.basePrice && (
                    <div className="text-right flex-shrink-0">
                      <p className="text-xs text-brand-gray-text">a partir de</p>
                      <p className="text-lg font-bold text-brand-white">{formatPrice(kit.basePrice)}<span className="text-xs text-brand-gray-text">/un</span></p>
                    </div>
                  )}
                </div>
                <p className="text-sm text-brand-gray-text leading-relaxed mb-5">{kit.description}</p>
                <div className="space-y-2 mb-6 flex-1">
                  {kit.items.map(item => (
                    <div key={item} className="flex items-start gap-2.5 text-sm">
                      <Check size={14} className="text-brand-red mt-0.5 flex-shrink-0" />
                      <span className="text-brand-white/80">{item}</span>
                    </div>
                  ))}
                </div>
                <div className="flex items-center justify-between pt-4 border-t border-white/5">
                  <span className="text-xs text-brand-gray-text">
                    MÃ­n. <span className="text-brand-white font-semibold">{kit.minQuantity} unidades</span>
                  </span>
                  <a
                    href="#orcamento"
                    onClick={() => setSelectedKit(kit.name)}
                    className="btn-primary text-xs px-4 py-2.5 group"
                  >
                    <MessageCircle size={14} />
                    Solicitar orÃ§amento
                  </a>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* â”€â”€â”€ Quote Form â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
        <motion.div
          id="orcamento"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="bg-brand-graphite border border-white/5 p-8 mb-12"
        >
          <div className="max-w-xl mx-auto">
            <div className="text-center mb-8">
              <span className="text-brand-red text-xs font-bold uppercase tracking-[0.3em]">OrÃ§amento RÃ¡pido</span>
              <h2 className="heading-display text-[clamp(1.8rem,4vw,3rem)] text-brand-white mt-2">
                SOLICITE SEU ORÃ‡AMENTO
              </h2>
              <p className="text-brand-gray-text text-sm mt-2">
                Preencha o formulÃ¡rio e vamos te responder no WhatsApp em atÃ© 1 hora Ãºtil.
              </p>
            </div>

            {error && (
              <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/30 text-red-400 text-sm px-4 py-3 mb-6">
                <AlertCircle size={16} /> {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-white/50 uppercase tracking-wider mb-1.5 block">Nome *</label>
                  <input value={name} onChange={e => setName(e.target.value)} className={INPUT} placeholder="Seu nome" required />
                </div>
                <div>
                  <label className="text-xs text-white/50 uppercase tracking-wider mb-1.5 block">WhatsApp *</label>
                  <input type="tel" value={phone} onChange={e => setPhone(e.target.value)} className={INPUT} placeholder="(11) 99999-9999" required />
                </div>
              </div>

              <div>
                <label className="text-xs text-white/50 uppercase tracking-wider mb-1.5 block">E-mail</label>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} className={INPUT} placeholder="seu@email.com" />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-white/50 uppercase tracking-wider mb-1.5 block">Kit de interesse</label>
                  <select value={selectedKit} onChange={e => setSelectedKit(e.target.value)} className={INPUT}>
                    <option value="">Selecione ou descreva</option>
                    {KITS.map(k => <option key={k.id} value={k.name}>{k.name}</option>)}
                    <option value="Personalizado">Personalizado (outros)</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs text-white/50 uppercase tracking-wider mb-1.5 block">Quantidade estimada</label>
                  <input type="number" min="1" value={qty} onChange={e => setQty(e.target.value)} className={INPUT} placeholder="Ex: 50 unidades" />
                </div>
              </div>

              <div>
                <label className="text-xs text-white/50 uppercase tracking-wider mb-1.5 block">Mensagem / Detalhes</label>
                <textarea
                  value={msg}
                  onChange={e => setMsg(e.target.value)}
                  className={INPUT}
                  rows={3}
                  placeholder="Conte sobre seu projeto: evento, empresa, academia, arte/logo, cores, prazo..."
                />
              </div>

              <button type="submit" className="btn-primary w-full justify-center group">
                <Send size={18} />
                Enviar via WhatsApp
                <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </button>
              <p className="text-xs text-brand-gray-text text-center">
                Ao clicar, vocÃª serÃ¡ redirecionado para o WhatsApp com a mensagem preenchida.
              </p>
            </form>
          </div>
        </motion.div>

        {/* Process */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="bg-brand-graphite border border-white/5 p-8"
        >
          <h2 className="heading-display text-[clamp(1.8rem,3vw,2.5rem)] text-brand-white mb-8 text-center">
            COMO FUNCIONA O PROCESSO
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
            {[
              { num: '01', title: 'Solicite o orÃ§amento', desc: 'Fale com a gente pelo WhatsApp com quantidade e modelo desejado.' },
              { num: '02', title: 'Escolha e aprove a arte', desc: 'Envie seu logo ou nossa equipe cria. VocÃª aprova antes de produzir.' },
              { num: '03', title: 'ConfirmaÃ§Ã£o e pagamento', desc: 'Pix, boleto ou cartÃ£o. ProduÃ§Ã£o comeÃ§a apÃ³s confirmaÃ§Ã£o.' },
              { num: '04', title: 'Entrega garantida', desc: 'Rastreamento em tempo real. SatisfaÃ§Ã£o garantida ou refazemos.' },
            ].map(step => (
              <div key={step.num} className="text-center">
                <span className="heading-display text-4xl text-brand-red/30">{step.num}</span>
                <h3 className="text-sm font-bold text-brand-white uppercase tracking-wide mt-2 mb-2">{step.title}</h3>
                <p className="text-xs text-brand-gray-text leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  )
}
