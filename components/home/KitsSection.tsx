'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { Building2, Dumbbell, GraduationCap, Star, ArrowRight, MessageCircle } from 'lucide-react'
import { getWhatsAppLink } from '@/lib/utils'

const AUDIENCES = [
  {
    icon: Building2,
    title: 'Empresas e Startups',
    desc: 'Uniformize sua equipe com camisetas personalizadas de alta qualidade. Fortaleça a identidade da sua marca.',
    minQty: '10 unidades',
    from: 'R$ 79,90/un',
    color: 'text-blue-400',
    bg: 'bg-blue-400/10 border-blue-400/20',
  },
  {
    icon: Dumbbell,
    title: 'Academias e Studios',
    desc: 'Dry-fit técnico personalizado para sua equipe e alunos. Crossfit, musculação, pilates e artes marciais.',
    minQty: '20 unidades',
    from: 'R$ 89,90/un',
    color: 'text-brand-red',
    bg: 'bg-brand-red/10 border-brand-red/20',
  },
  {
    icon: GraduationCap,
    title: 'Escolas e Eventos',
    desc: 'Interclasse, excursões, formaturas e eventos. Cores por turma, numeração individual e prazos cumpridos.',
    minQty: '30 unidades',
    from: 'R$ 49,90/un',
    color: 'text-yellow-400',
    bg: 'bg-yellow-400/10 border-yellow-400/20',
  },
  {
    icon: Star,
    title: 'Corridas e Festivais',
    desc: 'Camiseta técnica para corredores, item colecionável para festivais e lançamentos. Volume com desconto.',
    minQty: '50 unidades',
    from: 'R$ 39,90/un',
    color: 'text-emerald-400',
    bg: 'bg-emerald-400/10 border-emerald-400/20',
  },
]

export function KitsSection() {
  const whatsappLink = getWhatsAppLink('Olá! Quero solicitar um orçamento para kit personalizado.')

  return (
    <section className="section-padding bg-brand-black relative overflow-hidden">
      {/* Background texture */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: 'repeating-linear-gradient(45deg, #E10600 0, #E10600 1px, transparent 0, transparent 50%)',
          backgroundSize: '20px 20px',
        }}
      />

      <div className="container-brand relative">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-12"
        >
          <div>
            <span className="text-brand-red text-xs font-bold uppercase tracking-[0.3em]">Soluções B2B</span>
            <h2 className="heading-display text-[clamp(2.5rem,5vw,4rem)] text-brand-white mt-3">
              KITS PARA EMPRESAS,<br />
              <span className="text-gradient-red">ACADEMIAS E EVENTOS</span>
            </h2>
            <p className="text-brand-gray-text mt-4 max-w-xl">
              Mais de 500 empresas e organizações confiam na StreetDrop para seus uniformes e brindes.
              Do design à entrega, cuidamos de tudo.
            </p>
          </div>
          <Link href="/kits" className="btn-outline-red flex-shrink-0 group">
            Ver todos os kits
            <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
          {AUDIENCES.map((audience, i) => (
            <motion.div
              key={audience.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-30px' }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className={`border ${audience.bg} p-5 group hover:scale-[1.01] transition-transform duration-300`}
            >
              <audience.icon size={24} className={`${audience.color} mb-4`} strokeWidth={1.5} />
              <h3 className="text-sm font-bold text-brand-white uppercase tracking-wide mb-2">
                {audience.title}
              </h3>
              <p className="text-xs text-brand-gray-text leading-relaxed mb-4">
                {audience.desc}
              </p>
              <div className="border-t border-white/5 pt-4 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-brand-gray-text">Mínimo</span>
                  <span className={`text-xs font-bold ${audience.color}`}>{audience.minQty}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-brand-gray-text">A partir de</span>
                  <span className="text-xs font-bold text-brand-white">{audience.from}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="bg-brand-graphite border border-white/5 p-8 flex flex-col sm:flex-row items-center justify-between gap-6"
        >
          <div>
            <h3 className="heading-display text-2xl text-brand-white">
              PRONTO PARA SOLICITAR SEU ORÇAMENTO?
            </h3>
            <p className="text-brand-gray-text text-sm mt-1">
              Resposta em até 2 horas. Sem burocracia.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 flex-shrink-0">
            <a
              href={whatsappLink}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary group"
            >
              <MessageCircle size={18} />
              WhatsApp
              <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </a>
            <Link href="/kits" className="btn-secondary">
              Ver modelos de kits
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
