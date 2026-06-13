'use client'

import { motion } from 'framer-motion'
import { Heart, Zap, Shield, Users, MessageCircle, ArrowRight, Ruler, Clock, RefreshCw, CheckCircle, Package } from 'lucide-react'
import Link from 'next/link'
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
  { value: '1k+', label: 'Clientes atendidos' },
  { value: '1k+', label: 'Produtos entregues' },
  { value: '5+', label: 'Empresas parceiras' },
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
              Acreditamos que cada peça deve representar algo real – sua marca, sua paixão, seu time.
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
              DO CONCEITO<br />AO DROP
            </h2>
            <div className="space-y-4 text-brand-gray-text">
              <p>
                A StreetDrop Wear nasceu da vontade de criar uma marca que unisse estilo, personalização e produtos com identidade própria.</p>
              <p>
                Mais do que vender camisetas, queremos entregar peças e produtos que façam sentido para quem usa: desde camisetas oversized e dry-fit até itens personalizados, produtos geek, impressões 3D e kits para empresas.</p>
              <p>
                Nosso foco é criar uma experiência completa, com atenção ao detalhe, qualidade no acabamento e compromisso em cada etapa — da escolha da arte até o produto final.</p>
              <p>
                Atendemos pessoas que querem uma peça única, marcas que buscam produtos personalizados e empresas que precisam de soluções sob medida. Em todos os casos, nosso compromisso é o mesmo: entregar algo bem-feito, com identidade e propósito.</p>  
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
                { year: '2025', event: 'Início da StreetDrop Wear com foco em camisetas personalizadas e identidade streetwear.' },
                { year: '2026', event: 'Criação das primeiras peças oversized, dry-fit e estampas autorais da marca.' },
                { year: '2026', event: 'Entrada de novos segmentos como produtos geek, itens personalizados e impressões 3D.' },
                { year: '2027', event: 'Desenvolvimento de kits personalizados para empresas, eventos, academias e marcas parceiras.' },
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

        {/* Tabela de Medidas */}
        <section id="medidas" className="mb-16 scroll-mt-24">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-10"
          >
            <span className="text-brand-red text-xs font-bold uppercase tracking-[0.3em]">Guia de tamanhos</span>
            <h2 className="heading-display text-[clamp(2rem,4vw,3rem)] text-brand-white mt-3">
              TABELA DE MEDIDAS
            </h2>
            <p className="text-brand-gray-text mt-3 max-w-xl mx-auto text-sm leading-relaxed">
              Cada linha de produto possui medidas específicas. Acesse a tabela diretamente na página da categoria que deseja.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              {
                href: '/oversized#tabela-medidas',
                label: 'Oversized',
                desc: 'Camisetas oversized drop shoulder — corte amplo e caixão.',
                icon: Ruler,
              },
              {
                href: '/camisetas#tabela-medidas',
                label: 'Camisetas',
                desc: 'Camisetas regular, slim e regata — tabela por categoria.',
                icon: Ruler,
              },
              {
                href: '/dryfit#tabela-medidas',
                label: 'DryFit',
                desc: 'Roupas técnicas masculinas e femininas — tabela por gênero.',
                icon: Ruler,
              },
            ].map((item, i) => (
              <motion.div
                key={item.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <Link
                  href={item.href}
                  className="flex flex-col items-start gap-3 bg-brand-graphite border border-white/5 hover:border-brand-red/30 p-6 transition-colors group h-full"
                >
                  <item.icon size={22} className="text-brand-red" strokeWidth={1.5} />
                  <div>
                    <h3 className="text-sm font-bold text-brand-white uppercase tracking-wide mb-1 group-hover:text-brand-red transition-colors">
                      {item.label}
                    </h3>
                    <p className="text-xs text-brand-gray-text leading-relaxed">{item.desc}</p>
                  </div>
                  <span className="text-[11px] text-brand-red/70 font-semibold uppercase tracking-wider mt-auto">
                    Ver tabela →
                  </span>
                </Link>
              </motion.div>
            ))}
          </div>
          <p className="text-[11px] text-white/30 mt-3">* Medidas em centímetros (cm). Variações de ±1 cm são normais.</p>
        </section>

        {/* Prazo de Entrega */}
        <section id="entregas" className="mb-16 scroll-mt-24">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-10"
          >
            <span className="text-brand-red text-xs font-bold uppercase tracking-[0.3em]">Logística</span>
            <h2 className="heading-display text-[clamp(2rem,4vw,3rem)] text-brand-white mt-3">
              PRAZO DE ENTREGA
            </h2>
            <p className="text-brand-gray-text mt-3 max-w-xl mx-auto text-sm leading-relaxed">
              Trabalhamos com produtos sob encomenda. O prazo é composto pelo tempo de produção mais o frete.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
            {[
              {
                icon: Package,
                title: 'Produção',
                value: '5–10 dias úteis',
                desc: 'Cada peça é produzida sob encomenda após a confirmação do pagamento.',
              },
              {
                icon: Clock,
                title: 'Frete padrão (PAC/Sedex)',
                value: '3–12 dias úteis',
                desc: 'Calculado no checkout com base no CEP de destino. Enviado pelos Correios.',
              },
              {
                icon: CheckCircle,
                title: 'Prazo total estimado',
                value: '8–22 dias úteis',
                desc: 'Da aprovação do pagamento até a entrega na sua porta, dependendo da região.',
              },
            ].map((item, i) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bg-brand-graphite border border-white/5 p-6"
              >
                <item.icon size={22} className="text-brand-red mb-3" strokeWidth={1.5} />
                <p className="text-xl font-black text-brand-white mb-1">{item.value}</p>
                <h3 className="text-xs font-bold uppercase tracking-wide text-white/60 mb-2">{item.title}</h3>
                <p className="text-xs text-brand-gray-text leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </div>

          <div className="bg-brand-graphite border border-white/5 p-5 text-sm text-brand-gray-text leading-relaxed">
            <strong className="text-brand-white">Importante:</strong> O código de rastreio é enviado por e-mail assim que o pedido é postado.
            Você também pode acompanhar o status diretamente em <strong className="text-brand-white">Meus Pedidos</strong> na sua conta.
            Em casos de feriados ou alta temporada, o prazo de produção pode ser estendido em até 3 dias úteis.
          </div>
        </section>

        {/* Política de Troca */}
        <section id="trocas" className="mb-16 scroll-mt-24">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-10"
          >
            <span className="text-brand-red text-xs font-bold uppercase tracking-[0.3em]">Pós-venda</span>
            <h2 className="heading-display text-[clamp(2rem,4vw,3rem)] text-brand-white mt-3">
              POLÍTICA DE TROCA
            </h2>
            <p className="text-brand-gray-text mt-3 max-w-xl mx-auto text-sm leading-relaxed">
              Ficou com alguma dúvida sobre sua compra? Nossa equipe está pronta para te ajudar.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="bg-brand-graphite border border-white/5 p-6"
            >
              <h3 className="text-sm font-bold text-brand-white uppercase tracking-wide mb-4 flex items-center gap-2">
                <RefreshCw size={16} className="text-brand-red" />
                Como solicitar uma troca ou reembolso
              </h3>
              <ol className="space-y-3">
                {[
                  'Entre em contato via WhatsApp com o número do seu pedido.',
                  'Informe o motivo: defeito, tamanho errado, produto diferente do pedido etc.',
                  'Nossa equipe irá analisar e retornar em até 2 dias úteis.',
                  'Caso aprovado, passaremos o passo a passo para realizar a troca ou reembolso.',
                ].map((step, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm text-brand-gray-text">
                    <span className="flex-shrink-0 w-5 h-5 rounded-full bg-brand-red/10 border border-brand-red/30 text-brand-red text-[11px] font-bold flex items-center justify-center mt-0.5">
                      {i + 1}
                    </span>
                    {step}
                  </li>
                ))}
              </ol>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="space-y-4"
            >
              <div className="bg-brand-graphite border border-white/5 p-5">
                <h4 className="text-xs font-bold text-brand-white uppercase tracking-wide mb-2">Aceitos para troca</h4>
                <ul className="space-y-1.5 text-xs text-brand-gray-text">
                  {[
                    'Produto com defeito de fabricação',
                    'Item diferente do pedido realizado',
                    'Tamanho errado enviado pela loja',
                    'Produto danificado na entrega',
                  ].map(item => (
                    <li key={item} className="flex items-center gap-2">
                      <CheckCircle size={13} className="text-green-500 flex-shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="bg-brand-graphite border border-white/5 p-5">
                <h4 className="text-xs font-bold text-brand-white uppercase tracking-wide mb-2">Não aceitos</h4>
                <ul className="space-y-1.5 text-xs text-brand-gray-text">
                  {[
                    'Produto personalizado com dados fornecidos pelo cliente',
                    'Tamanho errado por escolha do próprio cliente',
                    'Produto usado, lavado ou danificado pelo cliente',
                    'Solicitação fora do prazo de 7 dias após recebimento',
                  ].map(item => (
                    <li key={item} className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full border border-white/20 flex-shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="border border-brand-red/20 bg-brand-red/5 p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
          >
            <div>
              <p className="text-sm font-bold text-brand-white mb-1">Precisa abrir uma solicitação?</p>
              <p className="text-xs text-brand-gray-text">Fale com nossa equipe diretamente pelo WhatsApp — resposta rápida, sem burocracia.</p>
            </div>
            <a
              href={getWhatsAppLink('Olá! Preciso solicitar uma troca/reembolso. Meu número de pedido é: ')}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary whitespace-nowrap flex-shrink-0"
            >
              <MessageCircle size={16} />
              Falar no WhatsApp
            </a>
          </motion.div>
        </section>

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
