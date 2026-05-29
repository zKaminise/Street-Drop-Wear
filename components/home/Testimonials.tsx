'use client'

import { motion } from 'framer-motion'
import { Star } from 'lucide-react'
import { TESTIMONIALS } from '@/lib/mock-data'

export function Testimonials() {
  return (
    <section className="section-padding bg-brand-graphite relative overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-brand-red/20 to-transparent" />

      <div className="container-brand">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <span className="text-brand-red text-xs font-bold uppercase tracking-[0.3em]">Prova social</span>
          <h2 className="heading-display text-[clamp(2.5rem,5vw,4rem)] text-brand-white mt-3">
            QUEM JÁ DROPOU
          </h2>
          <div className="flex items-center justify-center gap-2 mt-4">
            <div className="flex">
              {[1,2,3,4,5].map(i => (
                <Star key={i} size={16} className="text-yellow-400 fill-yellow-400" />
              ))}
            </div>
            <span className="text-brand-white font-bold">4.9</span>
            <span className="text-brand-gray-text text-sm">· +1.200 avaliações</span>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {TESTIMONIALS.map((t, i) => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-30px' }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
              className="bg-brand-black border border-white/5 hover:border-white/10 p-6 transition-colors"
            >
              <div className="flex items-center gap-1 mb-4">
                {Array.from({ length: t.rating }).map((_, j) => (
                  <Star key={j} size={13} className="text-yellow-400 fill-yellow-400" />
                ))}
              </div>
              <p className="text-sm text-brand-white/90 leading-relaxed mb-5">
                &ldquo;{t.text}&rdquo;
              </p>
              <div className="flex items-center justify-between pt-4 border-t border-white/5">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-brand-red/20 border border-brand-red/30 flex items-center justify-center">
                    <span className="text-brand-red font-bold text-sm">
                      {t.name.charAt(0)}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-brand-white">{t.name}</p>
                    <p className="text-xs text-brand-gray-text">{t.city}</p>
                  </div>
                </div>
                <span className="text-xs text-brand-gray-text/60 bg-white/5 px-2 py-1">
                  {t.product}
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
