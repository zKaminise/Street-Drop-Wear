'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { User, Package, MapPin, Settings, LogOut, ChevronRight, ShoppingBag } from 'lucide-react'
import { useAuthStore, useCartStore } from '@/lib/store'

const MENU = [
  { icon: Package, label: 'Meus Pedidos', href: '/pedidos', desc: 'Acompanhe seus pedidos' },
  { icon: MapPin, label: 'Endereços', href: '/conta/enderecos', desc: 'Gerenciar endereços salvos' },
  { icon: Settings, label: 'Perfil', href: '/conta/perfil', desc: 'Dados e senha' },
]

export default function ContaPage() {
  const { user, isAuthenticated, logout } = useAuthStore()
  const { items } = useCartStore()
  const router = useRouter()
  const [orderCount, setOrderCount] = useState<number | null>(null)

  useEffect(() => {
    if (!isAuthenticated) { router.push('/login'); return }
  }, [isAuthenticated, router])

  useEffect(() => {
    if (user?.id) {
      fetch(`/api/orders?customerId=${encodeURIComponent(user.id)}`)
        .then(r => r.json())
        .then(data => setOrderCount(Array.isArray(data) ? data.length : 0))
        .catch(() => setOrderCount(0))
    }
  }, [user?.id])

  async function handleLogout() {
    try { await fetch('/api/auth/logout', { method: 'POST' }) } catch {}
    logout()
    router.push('/')
  }

  if (!isAuthenticated || !user) return null

  return (
    <div className="min-h-screen bg-brand-black">
      <div className="container-brand py-10">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <span className="text-brand-red text-xs font-bold uppercase tracking-[0.3em]">Bem-vindo(a)</span>
          <h1 className="heading-display text-[clamp(2.5rem,5vw,4rem)] text-brand-white mt-1">MINHA CONTA</h1>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-10">
          {/* Profile Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-brand-graphite border border-white/5 p-6"
          >
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 bg-brand-red/20 border border-brand-red/30 flex items-center justify-center">
                <span className="heading-display text-3xl text-brand-red">
                  {user.name.charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="min-w-0">
                <h2 className="text-base font-bold text-brand-white truncate">{user.name}</h2>
                <p className="text-sm text-brand-gray-text truncate">{user.email}</p>
              </div>
            </div>

            <div className="space-y-3 text-sm">
              {user.phone && (
                <div className="flex justify-between">
                  <span className="text-brand-gray-text">WhatsApp</span>
                  <span className="text-brand-white">{user.phone}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-brand-gray-text">Membro desde</span>
                <span className="text-brand-white">
                  {new Date(user.createdAt).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
                </span>
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="w-full mt-6 flex items-center justify-center gap-2 py-2.5 border border-white/10 text-xs text-brand-gray-text hover:text-red-400 hover:border-red-400/30 transition-colors cursor-pointer uppercase tracking-wider font-semibold"
            >
              <LogOut size={14} />
              Sair da conta
            </button>
          </motion.div>

          {/* Menu + Stats */}
          <div className="lg:col-span-2 space-y-3">
            {MENU.map((item, i) => (
              <motion.div
                key={item.href}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 + i * 0.08 }}
              >
                <Link
                  href={item.href}
                  className="flex items-center justify-between p-5 bg-brand-graphite border border-white/5 hover:border-white/10 transition-colors group"
                >
                  <div className="flex items-center gap-4">
                    <item.icon size={20} className="text-brand-red" strokeWidth={1.5} />
                    <div>
                      <p className="text-sm font-bold text-brand-white group-hover:text-brand-red transition-colors uppercase tracking-wide">
                        {item.label}
                      </p>
                      <p className="text-xs text-brand-gray-text mt-0.5">{item.desc}</p>
                    </div>
                  </div>
                  <ChevronRight size={16} className="text-brand-gray-text group-hover:text-brand-white group-hover:translate-x-1 transition-all" />
                </Link>
              </motion.div>
            ))}

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="grid grid-cols-2 gap-3"
            >
              <Link href="/pedidos" className="bg-brand-graphite border border-white/5 hover:border-brand-red/20 transition-colors p-4 text-center group">
                <p className="heading-display text-2xl text-brand-white group-hover:text-brand-red transition-colors">
                  {orderCount === null ? '–' : orderCount}
                </p>
                <p className="text-xs text-brand-gray-text mt-1 flex items-center justify-center gap-1">
                  <Package size={12} /> Pedidos
                </p>
              </Link>
              <div className="bg-brand-graphite border border-white/5 p-4 text-center">
                <p className="heading-display text-2xl text-brand-white">{items.length}</p>
                <p className="text-xs text-brand-gray-text mt-1 flex items-center justify-center gap-1">
                  <ShoppingBag size={12} /> No Carrinho
                </p>
              </div>
            </motion.div>

            {/* Profile quick info */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="bg-brand-graphite border border-white/5 p-5"
            >
              <div className="flex items-center gap-2 mb-3">
                <User size={14} className="text-brand-red" />
                <span className="text-xs font-bold text-white/50 uppercase tracking-wider">Dados da Conta</span>
              </div>
              <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                <span className="text-brand-gray-text">Nome</span>
                <span className="text-brand-white truncate">{user.name}</span>
                <span className="text-brand-gray-text">E-mail</span>
                <span className="text-brand-white truncate">{user.email}</span>
                {user.phone && <>
                  <span className="text-brand-gray-text">Telefone</span>
                  <span className="text-brand-white">{user.phone}</span>
                </>}
              </div>
              <Link
                href="/conta/perfil"
                className="mt-4 text-xs text-brand-red hover:text-brand-white transition-colors font-semibold flex items-center gap-1"
              >
                Editar perfil <ChevronRight size={12} />
              </Link>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  )
}
