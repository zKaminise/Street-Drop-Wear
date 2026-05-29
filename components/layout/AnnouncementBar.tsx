'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'

type BarData = { messages: string[]; active: boolean; speed: number }

export function AnnouncementBar() {
  const [data, setData]         = useState<BarData | null>(null)
  const [current, setCurrent]   = useState(0)
  const [dismissed, setDismiss] = useState(false)

  useEffect(() => {
    fetch('/api/announcement-bar')
      .then(r => r.json())
      .then((d: BarData) => { if (d.active && d.messages?.length) setData(d) })
      .catch(() => {})
  }, [])

  useEffect(() => {
    if (!data || data.messages.length <= 1) return
    const t = setInterval(() => {
      setCurrent(i => (i + 1) % data.messages.length)
    }, data.speed)
    return () => clearInterval(t)
  }, [data])

  if (!data || !data.active || data.messages.length === 0 || dismissed) return null

  return (
    <div className="relative bg-brand-red overflow-hidden" style={{ height: '36px' }}>
      <div className="h-full flex items-center justify-center px-10">
        <AnimatePresence mode="wait">
          <motion.p
            key={current}
            initial={{ y: 18, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -18, opacity: 0 }}
            transition={{ duration: 0.35, ease: 'easeInOut' }}
            className="text-white text-xs font-semibold uppercase tracking-[0.15em] text-center leading-none"
          >
            {data.messages[current]}
          </motion.p>
        </AnimatePresence>
      </div>
      <button
        onClick={() => setDismiss(true)}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-white/70 hover:text-white transition-colors cursor-pointer"
        aria-label="Fechar aviso"
      >
        <X size={14} />
      </button>
    </div>
  )
}
