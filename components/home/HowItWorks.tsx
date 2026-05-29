'use client'

import { motion } from 'framer-motion'
import { Search, Palette, ShoppingCart, Package } from 'lucide-react'

const STEPS = [
  {
    number: '01',
    icon: Search,
    title: 'Escolha o produto',
    desc: 'Navegue pelo nosso catálogo e encontre a camiseta, produto 3D ou kit ideal para você ou sua empresa.',
  },
  {
    number: '02',
    icon: Palette,
    title: 'Personalize ou selecione',
    desc: 'Faça upload da sua arte, escolha uma estampa exclusiva ou monte do zero com nossas ferramentas.',
  },
  {
    number: '03',
    icon: ShoppingCart,
    title: 'Adicione ao carrinho',
    desc: 'Escolha tamanho, cor e quantidade. Pagamento seguro via PIX, cartão ou boleto com frete calculado.',
  },
  {
    number: '04',
    icon: Package,
    title: 'Acompanhe seu pedido',
    desc: 'Produção em até 7 dias úteis. Rastreamento em tempo real direto pelo painel ou WhatsApp.',
  },
]

export function HowItWorks() {
  return (
    <section id="como-funciona" className="section-padding bg-brand-graphite relative overflow-hidden">
      {/* Background accent */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-brand-red/30 to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/5 to-transparent" />

      <div className="container-brand">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-14"
        >
          <span className="text-brand-red text-xs font-bold uppercase tracking-[0.3em]">Simples assim</span>
          <h2 className="heading-display text-[clamp(2.5rem,5vw,4rem)] text-brand-white mt-3">
            COMO FUNCIONA
          </h2>
          <p className="text-brand-gray-text mt-4 max-w-md mx-auto">
            Do primeiro clique à entrega na sua porta. Rápido, fácil e com a qualidade StreetDrop.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 relative">
          {/* Connecting line (desktop) */}
          <div className="hidden lg:block absolute top-10 left-[12.5%] right-[12.5%] h-px bg-gradient-to-r from-transparent via-brand-red/20 to-transparent" />

          {STEPS.map((step, i) => (
            <motion.div
              key={step.number}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-30px' }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="relative flex flex-col items-center text-center p-6 group"
            >
              {/* Step number background */}
              <div className="relative mb-5">
                <span className="heading-display text-[80px] text-white/3 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 leading-none pointer-events-none">
                  {step.number}
                </span>
                <div className="relative w-16 h-16 border border-brand-red/30 group-hover:border-brand-red transition-colors duration-300 flex items-center justify-center bg-brand-black">
                  <step.icon size={24} className="text-brand-red" strokeWidth={1.5} />
                </div>
              </div>

              <span className="text-xs font-bold text-brand-red uppercase tracking-[0.2em] mb-2">
                Passo {step.number}
              </span>
              <h3 className="text-base font-bold text-brand-white mb-3 uppercase tracking-wide">
                {step.title}
              </h3>
              <p className="text-sm text-brand-gray-text leading-relaxed">
                {step.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
