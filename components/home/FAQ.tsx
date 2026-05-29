'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Minus } from 'lucide-react'
import { FAQS } from '@/lib/mock-data'

export function FAQ() {
  const [openId, setOpenId] = useState<string | null>(null)

  return (
    <section id="faq" className="section-padding bg-brand-black">
      <div className="container-brand max-w-3xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <span className="text-brand-red text-xs font-bold uppercase tracking-[0.3em]">Dúvidas</span>
          <h2 className="heading-display text-[clamp(2.5rem,5vw,4rem)] text-brand-white mt-3">
            PERGUNTAS FREQUENTES
          </h2>
        </motion.div>

        <div className="space-y-2">
          {FAQS.map((faq, i) => (
            <motion.div
              key={faq.id}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
              className={`border transition-colors duration-200 ${
                openId === faq.id
                  ? 'border-brand-red/30 bg-brand-red/3'
                  : 'border-white/5 bg-brand-graphite'
              }`}
            >
              <button
                onClick={() => setOpenId(openId === faq.id ? null : faq.id)}
                className="w-full flex items-center justify-between p-5 text-left cursor-pointer"
                aria-expanded={openId === faq.id}
              >
                <span className="text-sm font-semibold text-brand-white pr-4">
                  {faq.question}
                </span>
                <div className="flex-shrink-0 w-6 h-6 border border-white/10 flex items-center justify-center">
                  {openId === faq.id ? (
                    <Minus size={14} className="text-brand-red" />
                  ) : (
                    <Plus size={14} className="text-brand-gray-text" />
                  )}
                </div>
              </button>

              <AnimatePresence>
                {openId === faq.id && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25, ease: 'easeInOut' }}
                    className="overflow-hidden"
                  >
                    <p className="px-5 pb-5 text-sm text-brand-gray-text leading-relaxed">
                      {faq.answer}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>

        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center text-sm text-brand-gray-text mt-8"
        >
          Ainda tem dúvidas?{' '}
          <a
            href="https://wa.me/5511999999999"
            target="_blank"
            rel="noopener noreferrer"
            className="text-brand-red hover:text-brand-white transition-colors font-semibold"
          >
            Fale com a gente no WhatsApp
          </a>
        </motion.p>
      </div>
    </section>
  )
}
