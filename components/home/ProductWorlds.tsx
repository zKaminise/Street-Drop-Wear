'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowUpRight } from 'lucide-react'

const WORLDS = [
  {
    id: 'oversized',
    title: 'Oversized',
    subtitle: 'Camisetas',
    desc: 'Corte amplo streetwear com algodÃ£o premium 300g. Personalize com sua arte.',
    href: '/oversized',
    color: '#E10600',
    bg: 'from-[#1A0A0A] to-[#0B0B0D]',
    accent: 'bg-[#E10600]',
    tag: 'Mais vendido',
  },
  {
    id: 'camisetas',
    title: 'Classic',
    subtitle: 'Camisetas',
    desc: 'Corte regular e slim. AlgodÃ£o 180g para o dia a dia com personalizaÃ§Ã£o total.',
    href: '/camisetas',
    color: '#F5F5F2',
    bg: 'from-[#1A1A1A] to-[#0B0B0D]',
    accent: 'bg-[#F5F5F2]',
    tag: 'VersÃ¡til',
  },
  {
    id: 'dryfit',
    title: 'DryFit',
    subtitle: 'Fitness',
    desc: 'Tecido tÃ©cnico anti-odor, UV50+. Para crossfit, musculaÃ§Ã£o e corrida.',
    href: '/dryfit',
    color: '#60A5FA',
    bg: 'from-[#091426] to-[#0B0B0D]',
    accent: 'bg-blue-400',
    tag: 'Performance',
  },
  {
    id: 'produtos-3d',
    title: 'ImpressÃ£o',
    subtitle: '3D',
    desc: 'Chaveiros, medalhas, trofÃ©us e brindes personalizados em PLA premium.',
    href: '/produtos-3d',
    color: '#A78BFA',
    bg: 'from-[#0E0A1A] to-[#0B0B0D]',
    accent: 'bg-violet-400',
    tag: 'Exclusivo',
  },
  {
    id: 'geek',
    title: 'Geek',
    subtitle: 'Store',
    desc: 'PokÃ©mon TCG lacrados, cartas avulsas e produtos geek selecionados.',
    href: '/geek',
    color: '#FACC15',
    bg: 'from-[#1A1500] to-[#0B0B0D]',
    accent: 'bg-yellow-400',
    tag: 'ColecionÃ¡vel',
  },
  {
    id: 'kits',
    title: 'Kits',
    subtitle: 'B2B',
    desc: 'Uniformes para empresas, academias, escolas e eventos. Do design Ã  entrega.',
    href: '/kits',
    color: '#34D399',
    bg: 'from-[#081A11] to-[#0B0B0D]',
    accent: 'bg-emerald-400',
    tag: 'Empresas',
  },
]

const container = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.08 },
  },
}

const item = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
}

export function ProductWorlds() {
  return (
    <section className="section-padding bg-brand-black">
      <div className="container-brand">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <span className="text-brand-red text-xs font-bold uppercase tracking-[0.3em]">Universo StreetDrop</span>
          <h2 className="heading-display text-[clamp(2.5rem,5vw,4rem)] text-brand-white mt-3">
            EXPLORE NOSSOS MUNDOS
          </h2>
          <p className="text-brand-gray-text mt-4 max-w-xl mx-auto">
            De camisetas Ãºnicas a kits corporativos. Cada produto feito com propÃ³sito e qualidade.
          </p>
        </motion.div>

        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: '-50px' }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
        >
          {WORLDS.map(world => (
            <motion.div key={world.id} variants={item}>
              <Link
                href={world.href}
                className={`group block relative overflow-hidden bg-gradient-to-br ${world.bg} border border-white/5 hover:border-white/10 transition-all duration-300 p-6 h-full min-h-[200px] cursor-pointer`}
              >
                {/* Corner accent */}
                <div
                  className="absolute top-0 right-0 w-0 h-0 transition-all duration-300 group-hover:w-20 group-hover:h-20"
                  style={{
                    borderStyle: 'solid',
                    borderWidth: '0 80px 80px 0',
                    borderColor: `transparent ${world.color}15 transparent transparent`,
                  }}
                />

                <div className="relative">
                  <div className="flex items-start justify-between mb-4">
                    <span
                      className={`px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider`}
                      style={{ background: `${world.color}20`, color: world.color }}
                    >
                      {world.tag}
                    </span>
                    <ArrowUpRight
                      size={16}
                      className="text-brand-gray-text group-hover:text-brand-white group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all"
                    />
                  </div>

                  <div className="mt-2">
                    <p className="text-brand-gray-text text-xs uppercase tracking-wider font-medium">
                      {world.subtitle}
                    </p>
                    <h3
                      className="heading-display text-[clamp(2rem,4vw,2.8rem)] mt-0.5 transition-colors duration-200"
                      style={{ color: world.color }}
                    >
                      {world.title}
                    </h3>
                  </div>

                  <p className="text-sm text-brand-gray-text mt-3 leading-relaxed group-hover:text-brand-white/80 transition-colors">
                    {world.desc}
                  </p>

                  <div className="flex items-center gap-2 mt-5 text-xs font-semibold uppercase tracking-wider" style={{ color: world.color }}>
                    <span>Explorar</span>
                    <span className="w-4 h-px" style={{ backgroundColor: world.color }} />
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
