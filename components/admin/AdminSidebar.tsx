'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  LayoutDashboard, Package, Shirt, Stamp, BarChart3,
  ShoppingBag, FolderOpen, LogOut, ChevronRight, Box, Layers, Truck,
  Menu, X, Megaphone, Tag, Ticket, DollarSign, Ruler, Tags
} from 'lucide-react'
import { cn } from '@/lib/utils'

const NAV = [
  { href: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/pedidos', label: 'Pedidos', icon: ShoppingBag },
  { href: '/admin/bases', label: 'Bases (Camisetas)', icon: Shirt },
  { href: '/admin/estampas', label: 'Estampas', icon: Stamp },
  { href: '/admin/categorias-estampas', label: 'Categorias de Estampas', icon: Tag },
  { href: '/admin/estoque', label: 'Estoque', icon: BarChart3 },
  { href: '/admin/combinacoes', label: 'Combinações (Mockups)', icon: Layers },
  { href: '/admin/produtos', label: 'Produtos (DryFit/3D/Geek)', icon: Package },
  { href: '/admin/kits', label: 'Kits B2B', icon: FolderOpen },
  { href: '/admin/frete', label: 'Frete & Prazos', icon: Truck },
  { href: '/admin/avisos', label: 'Barra de Avisos', icon: Megaphone },
  { href: '/admin/cupons', label: 'Cupons de Desconto', icon: Ticket },
  { href: '/admin/financeiro', label: 'Financeiro', icon: DollarSign },
  { href: '/admin/categorias-produtos', label: 'Categorias de Produtos', icon: Tags },
  { href: '/admin/tabelas-medidas', label: 'Tabelas de Medidas', icon: Ruler },
]

export function AdminSidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const [mobileOpen, setMobileOpen] = useState(false)

  async function handleLogout() {
    await fetch('/api/admin/auth', { method: 'DELETE' })
    router.push('/admin/login')
  }

  const SidebarContent = (
    <aside className="w-64 min-h-screen bg-[#111111] border-r border-white/5 flex flex-col h-full">
      {/* Logo */}
      <div className="p-6 border-b border-white/5 flex items-center justify-between">
        <Link href="/admin/dashboard" className="block" onClick={() => setMobileOpen(false)}>
          <span className="text-2xl font-black tracking-widest text-white uppercase block" style={{ fontFamily: 'var(--font-bebas, sans-serif)' }}>
            STREET<span className="text-[#E10600]">DROP</span>
          </span>
          <span className="text-[10px] text-white/30 uppercase tracking-[0.3em]">Admin Panel</span>
        </Link>
        {/* Close button – only on mobile */}
        <button
          onClick={() => setMobileOpen(false)}
          className="lg:hidden p-1.5 text-white/40 hover:text-white transition-colors cursor-pointer"
          aria-label="Fechar menu"
        >
          <X size={18} />
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 py-4 overflow-y-auto">
        {NAV.map(item => {
          const active = pathname.startsWith(item.href)
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className={cn(
                'flex items-center gap-3 px-5 py-3 text-sm font-medium transition-colors group relative',
                active
                  ? 'text-white bg-[#E10600]/10 border-r-2 border-[#E10600]'
                  : 'text-white/50 hover:text-white hover:bg-white/5'
              )}
            >
              <item.icon size={16} className={active ? 'text-[#E10600]' : 'text-white/40 group-hover:text-white/70'} />
              {item.label}
              {active && <ChevronRight size={14} className="ml-auto text-[#E10600]" />}
            </Link>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-white/5 space-y-2">
        <Link
          href="/"
          target="_blank"
          className="flex items-center gap-2 text-xs text-white/30 hover:text-white/60 transition-colors px-1"
        >
          <Box size={13} />
          Ver loja
        </Link>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 text-xs text-white/30 hover:text-red-400 transition-colors cursor-pointer px-1 w-full"
        >
          <LogOut size={13} />
          Sair
        </button>
      </div>
    </aside>
  )

  return (
    <>
      {/* ── Mobile hamburger button ── */}
      <button
        onClick={() => setMobileOpen(true)}
        className="lg:hidden fixed top-3 left-3 z-50 w-10 h-10 bg-[#111111] border border-white/10 flex items-center justify-center text-white/70 hover:text-white transition-colors cursor-pointer shadow-lg"
        aria-label="Abrir menu admin"
      >
        <Menu size={20} />
      </button>

      {/* ── Mobile backdrop ── */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/70 z-40 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* ── Desktop sidebar (always visible) ── */}
      <div className="hidden lg:block fixed top-0 left-0 bottom-0 z-40 w-64">
        {SidebarContent}
      </div>

      {/* ── Mobile sidebar (slide-in drawer) ── */}
      <div
        className={cn(
          'fixed top-0 left-0 bottom-0 z-50 w-64 lg:hidden transition-transform duration-300 ease-in-out',
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {SidebarContent}
      </div>
    </>
  )
}
