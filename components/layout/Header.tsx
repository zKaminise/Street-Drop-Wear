'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ShoppingBag,
  Search,
  User,
  Menu,
  X,
  ChevronDown,
  LogOut,
  Package,
  UserCircle,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useCartStore, useAuthStore, useSearchStore } from '@/lib/store'

const NAV_ITEMS = [
  {
    label: 'Camisetas',
    href: '/oversized',
    children: [
      { label: 'Oversized', href: '/oversized', desc: 'Corte amplo streetwear premium' },
      { label: 'Camisetas Normais', href: '/camisetas', desc: 'Regular e slim fit personalizada' },
      { label: 'DryFit Fitness', href: '/dryfit', desc: 'Performance UV50+' },
    ],
  },
  {
    label: 'Flash Sale',
    href: '/flash-sale',
    children: null,
    badge: 'HOT',
  },
  {
    label: 'Produtos 3D',
    href: '/produtos-3d',
    children: null,
  },
  {
    label: 'Geek Store',
    href: '/geek',
    children: null,
  },
  {
    label: 'Kits',
    href: '/kits',
    children: null,
  },
]

export function Header() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null)
  const [profileOpen, setProfileOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const pathname = usePathname()
  const router = useRouter()
  const itemCount = useCartStore(s => s.getItemCount())
  const openCart = useCartStore(s => s.openCart)
  const { isAuthenticated, logout } = useAuthStore()
  const { openSearch } = useSearchStore()
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => { setMounted(true) }, [])

  async function handleLogout() {
    try {
      await fetch('/api/auth/logout', { method: 'POST' })
    } catch { /* ignora erro de rede */ }
    logout()
    setProfileOpen(false)
    router.push('/')
  }

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    setMobileOpen(false)
    setActiveDropdown(null)
  }, [pathname])

  useEffect(() => {
    if (mobileOpen) document.body.style.overflow = 'hidden'
    else document.body.style.overflow = ''
    return () => { document.body.style.overflow = '' }
  }, [mobileOpen])

  return (
    <>
      <header
        className={cn(
          'fixed left-0 right-0 z-50',
          isScrolled
            ? 'bg-white/80 backdrop-blur-lg border-b border-gray-200/60 shadow-sm shadow-black/5'
            : 'bg-white border-b border-gray-100 shadow-sm'
        )}
        style={{
          top: 'var(--announcement-bar-h, 0px)',
          transition: 'top 0.3s ease, background-color 0.4s ease, backdrop-filter 0.4s ease, box-shadow 0.4s ease, border-color 0.4s ease',
        }}
      >
        <div className="container-brand flex items-center justify-between h-[72px]">

          {/* Logo — cores originais no navbar */}
          <Link href="/" className="flex items-center gap-2 flex-shrink-0" aria-label="StreetDrop Wear - Página Inicial">
            <LogoSVG />
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center gap-1" ref={dropdownRef}>
            {NAV_ITEMS.map(item => (
              <div
                key={item.label}
                className="relative"
                onMouseEnter={() => item.children && setActiveDropdown(item.label)}
                onMouseLeave={() => setActiveDropdown(null)}
              >
                <Link
                  href={item.href}
                  className={cn(
                    'flex items-center gap-1.5 px-4 py-2 text-sm font-semibold uppercase tracking-wider transition-colors duration-200',
                    item.href === '/flash-sale'
                      ? 'text-brand-red hover:text-brand-red/75'
                      : pathname.startsWith(item.href) && item.href !== '/'
                      ? 'text-brand-red'
                      : 'text-gray-700 hover:text-brand-red'
                  )}
                >
                  {item.label}
                  {(item as any).badge && (
                    <span className="px-1.5 py-0.5 bg-brand-red text-white text-[9px] font-black tracking-widest rounded-sm animate-pulse">
                      {(item as any).badge}
                    </span>
                  )}
                  {item.children && (
                    <ChevronDown
                      size={14}
                      className={cn(
                        'text-gray-400 transition-transform duration-200',
                        activeDropdown === item.label ? 'rotate-180' : ''
                      )}
                    />
                  )}
                </Link>

                {/* Dropdown */}
                <AnimatePresence>
                  {item.children && activeDropdown === item.label && (
                    <motion.div
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 8 }}
                      transition={{ duration: 0.15 }}
                      className="absolute top-full left-0 mt-1 w-56 bg-white border border-gray-100 shadow-xl shadow-gray-200/60 rounded-sm"
                    >
                      {item.children.map(child => (
                        <Link
                          key={child.href}
                          href={child.href}
                          className="block px-4 py-3 hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-0 group"
                        >
                          <span className="block text-sm font-semibold text-gray-800 group-hover:text-brand-red transition-colors">
                            {child.label}
                          </span>
                          <span className="block text-xs text-gray-400 mt-0.5">
                            {child.desc}
                          </span>
                        </Link>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-1">
            <button
              onClick={openSearch}
              className="p-2.5 text-gray-500 hover:text-gray-900 transition-colors cursor-pointer"
              aria-label="Buscar produtos"
            >
              <Search size={20} />
            </button>

            {/* Profile hover dropdown */}
            <div
              className="relative hidden sm:flex"
              onMouseEnter={() => setProfileOpen(true)}
              onMouseLeave={() => setProfileOpen(false)}
            >
              <button
                className="p-2.5 text-gray-500 hover:text-gray-900 transition-colors cursor-pointer"
                aria-label={isAuthenticated ? 'Minha conta' : 'Login'}
                onClick={() => router.push(isAuthenticated ? '/conta' : '/login')}
              >
                <User size={20} />
              </button>

              <AnimatePresence>
                {profileOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 6 }}
                    transition={{ duration: 0.15 }}
                    className="absolute top-full right-0 pt-1.5 z-50"
                  >
                    <div className="w-52 bg-white border border-gray-100 shadow-xl shadow-gray-200/60 rounded-sm overflow-hidden">
                      {isAuthenticated ? (
                        <>
                          <Link
                            href="/conta"
                            className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors border-b border-gray-50 group"
                            onClick={() => setProfileOpen(false)}
                          >
                            <UserCircle size={15} className="text-gray-400 group-hover:text-brand-red transition-colors flex-shrink-0" />
                            <span className="text-sm font-semibold text-gray-800 group-hover:text-brand-red transition-colors">
                              Ver Perfil
                            </span>
                          </Link>
                          <Link
                            href="/pedidos"
                            className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors border-b border-gray-50 group"
                            onClick={() => setProfileOpen(false)}
                          >
                            <Package size={15} className="text-gray-400 group-hover:text-brand-red transition-colors flex-shrink-0" />
                            <span className="text-sm font-semibold text-gray-800 group-hover:text-brand-red transition-colors">
                              Meus Pedidos
                            </span>
                          </Link>
                          <button
                            onClick={handleLogout}
                            className="w-full flex items-center gap-3 px-4 py-3 hover:bg-red-50 transition-colors group cursor-pointer"
                          >
                            <LogOut size={15} className="text-gray-400 group-hover:text-brand-red transition-colors flex-shrink-0" />
                            <span className="text-sm font-semibold text-gray-800 group-hover:text-brand-red transition-colors">
                              Sair da Conta
                            </span>
                          </button>
                        </>
                      ) : (
                        <>
                          <Link
                            href="/login"
                            className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors border-b border-gray-50 group"
                            onClick={() => setProfileOpen(false)}
                          >
                            <User size={15} className="text-gray-400 group-hover:text-brand-red transition-colors flex-shrink-0" />
                            <span className="text-sm font-semibold text-gray-800 group-hover:text-brand-red transition-colors">
                              Entrar
                            </span>
                          </Link>
                          <Link
                            href="/cadastro"
                            className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors group"
                            onClick={() => setProfileOpen(false)}
                          >
                            <UserCircle size={15} className="text-gray-400 group-hover:text-brand-red transition-colors flex-shrink-0" />
                            <span className="text-sm font-semibold text-gray-800 group-hover:text-brand-red transition-colors">
                              Cadastrar
                            </span>
                          </Link>
                        </>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <button
              onClick={openCart}
              className="relative p-2.5 text-gray-500 hover:text-gray-900 transition-colors cursor-pointer"
              aria-label={`Carrinho${mounted && itemCount > 0 ? ` - ${itemCount} itens` : ''}`}
            >
              <ShoppingBag size={20} />
              {mounted && itemCount > 0 && (
                <motion.span
                  key={itemCount}
                  initial={{ scale: 0.5 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-brand-red text-white text-[10px] font-bold rounded-full flex items-center justify-center"
                >
                  {itemCount > 9 ? '9+' : itemCount}
                </motion.span>
              )}
            </button>

            <button
              onClick={() => setMobileOpen(true)}
              className="lg:hidden p-2.5 text-gray-500 hover:text-gray-900 transition-colors cursor-pointer ml-1"
              aria-label="Abrir menu"
            >
              <Menu size={22} />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Menu — painel escuro (mantém logo branca) */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/80 z-50 lg:hidden"
              onClick={() => setMobileOpen(false)}
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="fixed top-0 right-0 bottom-0 w-[85vw] max-w-sm bg-brand-graphite z-50 lg:hidden flex flex-col"
            >
              <div className="flex items-center justify-between p-5 border-b border-white/10">
                {/* Logo branca no menu mobile (fundo escuro) */}
                <LogoSVG small white />
                <button
                  onClick={() => setMobileOpen(false)}
                  className="p-2 text-brand-white/70 hover:text-brand-white cursor-pointer"
                  aria-label="Fechar menu"
                >
                  <X size={22} />
                </button>
              </div>

              <nav className="flex-1 overflow-y-auto py-4">
                {NAV_ITEMS.map((item) => (
                  <div key={item.label}>
                    <Link
                      href={item.href}
                      className={cn(
                        'flex items-center justify-between px-6 py-3.5 text-sm font-semibold uppercase tracking-wider transition-colors',
                        pathname.startsWith(item.href) && item.href !== '/'
                          ? 'text-brand-red bg-brand-red/5'
                          : 'text-brand-white hover:text-brand-red hover:bg-white/5'
                      )}
                    >
                      {item.label}
                      {(item as any).badge && (
                        <span className="px-1.5 py-0.5 bg-brand-red text-white text-[9px] font-black tracking-widest rounded-sm animate-pulse">
                          {(item as any).badge}
                        </span>
                      )}
                    </Link>
                    {item.children && (
                      <div className="bg-black/30">
                        {item.children.map(child => (
                          <Link
                            key={child.href}
                            href={child.href}
                            className="flex items-center px-8 py-2.5 text-sm text-brand-gray-text hover:text-brand-white transition-colors"
                          >
                            <span className="w-1.5 h-1.5 bg-brand-red rounded-full mr-3 flex-shrink-0" />
                            {child.label}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </nav>

              <div className="p-5 border-t border-white/10 space-y-3">
                {isAuthenticated ? (
                  <>
                    <Link
                      href="/conta"
                      onClick={() => setMobileOpen(false)}
                      className="btn-secondary w-full text-center"
                    >
                      <UserCircle size={16} />
                      Ver Perfil
                    </Link>
                    <Link
                      href="/pedidos"
                      onClick={() => setMobileOpen(false)}
                      className="flex items-center justify-center gap-2 w-full py-3 border border-white/10 text-brand-gray-text hover:text-brand-white hover:border-white/30 text-sm font-semibold uppercase tracking-wider transition-colors"
                    >
                      <Package size={16} />
                      Meus Pedidos
                    </Link>
                    <button
                      onClick={() => { handleLogout(); setMobileOpen(false) }}
                      className="flex items-center justify-center gap-2 w-full py-3 border border-brand-red/30 text-brand-red hover:bg-brand-red/10 text-sm font-semibold uppercase tracking-wider transition-colors cursor-pointer"
                    >
                      <LogOut size={16} />
                      Sair da Conta
                    </button>
                  </>
                ) : (
                  <Link
                    href="/login"
                    onClick={() => setMobileOpen(false)}
                    className="btn-secondary w-full text-center"
                  >
                    <User size={16} />
                    Entrar / Cadastrar
                  </Link>
                )}
                <button onClick={() => { openCart(); setMobileOpen(false) }} className="btn-primary w-full">
                  <ShoppingBag size={16} />
                  Carrinho {mounted && itemCount > 0 && `(${itemCount})`}
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}

/* ─── Logo ───────────────────────────────────────────────────────────────── */
function LogoSVG({ small = false, white = false }: { small?: boolean; white?: boolean }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src="/logo-sdw.svg"
      alt="StreetDrop Wear"
      className={`w-auto object-contain ${small ? 'h-10' : 'h-14'}`}
      style={white ? { filter: 'brightness(0) invert(1)' } : undefined}
    />
  )
}
