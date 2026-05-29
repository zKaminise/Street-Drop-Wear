'use client'

import { motion } from 'framer-motion'
import { Heart, Zap, Shield, Users, MessageCircle, ArrowRight } from 'lucide-react'
import { getWhatsAppLink } from '@/lib/utils'

const VALUES = [
  {
    icon: Zap,
    title: 'Qualidade sem compromisso',
    desc: 'Algodão premium 300g, dry-fit técnico e impressão DTF de alta resolução. Nada de atalhos.',
  },
  {
    icon: Heart,
    title: 'Feito com propósito',
    desc: 'Cada peça conta uma história. Seja a sua marca, sua academia ou seu personagem favorito.',
  },
  {
    icon: Shield,
    title: 'Transparência total',
    desc: 'Prazo cumprido, nota fiscal em tudo, produtos originais e comunicação direta.',
  },
  {
    icon: Users,
    title: 'Comunidade primeiro',
    desc: 'Atendemos desde o cliente individual até corporações com centenas de uniformes.',
  },
]

const NUMBERS = [
  { value: '10k+', label: 'Clientes atendidos' },
  { value: '50k+', label: 'Produtos entregues' },
  { value: '500+', label: 'Empresas parceiras' },
  { value: '4.9★', label: 'Avaliação média' },
]

export function SobreContent() {
  return (
    <div className="min-h-screen bg-brand-black">
      {/* Hero */}
      <div className="relative bg-brand-graphite border-b border-white/5 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-brand-red/5 to-transparent" />
        <div className="container-brand py-20 relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-2xl"
          >
            <span className="text-brand-red text-xs font-bold uppercase tracking-[0.3em]">Nossa história</span>
            <h1 className="heading-display text-[clamp(3rem,7vw,5.5rem)] text-brand-white mt-3 leading-none">
              SOMOS A<br />
              <span className="text-gradient-red">STREETDROP</span>
            </h1>
            <p className="text-brand-white/80 mt-5 text-lg leading-relaxed">
              Nascemos da necessidade de unir qualidade, personalização e identidade em um só lugar.
              Acreditamos que cada peça deve representar algo real — sua marca, sua paixão, seu time.
            </p>
          </motion.div>
        </div>
      </div>

      {/* Numbers */}
      <div className="container-brand py-14">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 mb-16">
          {NUMBERS.map((n, i) => (
            <motion.div
              key={n.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="text-center"
            >
              <p className="heading-display text-[clamp(2.5rem,5vw,4rem)] text-brand-red leading-none">{n.value}</p>
              <p className="text-sm text-brand-gray-text mt-2">{n.label}</p>
            </motion.div>
          ))}
        </div>

        {/* Story */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16 items-center">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <span className="text-brand-red text-xs font-bold uppercase tracking-[0.3em]">Origem</span>
            <h2 className="heading-display text-[clamp(2rem,4vw,3rem)] text-brand-white mt-3 mb-5">
              DE SÃO PAULO<br />PARA O MUNDO
            </h2>
            <div className="space-y-4 text-brand-gray-text">
              <p>
                A StreetDrop Wear surgiu em São Paulo, movida pela vontade de criar algo diferente no mercado de personalização. Não apenas imprimir uma arte em tecido, mas entregar uma experiência completa — do conceito ao produto final.
              </p>
              <p>
                Começamos com camisetas oversized personalizadas e crescemos para produtos 3D, dry-fit fitness, Geek Store e kits para empresas. Cada expansão veio da necessidade real dos nossos clientes.
              </p>
              <p>
                Hoje atendemos desde o cliente individual que quer sua arte única até corporações que precisam de centenas de uniformes padronizados. Em todos os casos, o compromisso é o mesmo: qualidade e prazo.
              </p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="bg-brand-graphite border border-white/5 p-8"
          >
            <div className="space-y-6">
              {[
                { year: '2021', event: 'Fundação com foco em oversized personalizadas' },
                { year: '2022', event: 'Expansão para dry-fit fitness e kits B2B' },
                { year: '2023', event: 'Lançamento da linha de produtos 3D e Geek Store' },
                { year: '2024', event: 'Mais de 10.000 clientes e 500 empresas parceiras' },
              ].map(item => (
                <div key={item.year} className="flex items-start gap-4">
                  <span className="heading-display text-xl text-brand-red flex-shrink-0 w-12">{item.year}</span>
                  <p className="text-sm text-brand-white/80 pt-1">{item.event}</p>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Values */}
        <div className="mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-10"
          >
            <span className="text-brand-red text-xs font-bold uppercase tracking-[0.3em]">Nossos valores</span>
            <h2 className="heading-display text-[clamp(2rem,4vw,3rem)] text-brand-white mt-3">
              O QUE NOS MOVE
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {VALUES.map((v, i) => (
              <motion.div
                key={v.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bg-brand-graphite border border-white/5 p-6 flex items-start gap-4"
              >
                <v.icon size={22} className="text-brand-red flex-shrink-0 mt-0.5" strokeWidth={1.5} />
                <div>
                  <h3 className="text-sm font-bold text-brand-white uppercase tracking-wide mb-2">{v.title}</h3>
                  <p className="text-sm text-brand-gray-text leading-relaxed">{v.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="bg-brand-graphite border border-brand-red/20 p-8 text-center"
        >
          <h2 className="heading-display text-3xl text-brand-white mb-3">
            VAMOS CRIAR ALGO JUNTOS?
          </h2>
          <p className="text-brand-gray-text mb-6">Fale com nossa equipe pelo WhatsApp</p>
          <a
            href={getWhatsAppLink('Olá! Quero saber mais sobre a StreetDrop Wear.')}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-primary group"
          >
            <MessageCircle size={18} />
            Falar no WhatsApp
            <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
          </a>
        </motion.div>
      </div>
    </div>
  )
}
