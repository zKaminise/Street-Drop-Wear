'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ShoppingBag,
  Search,
  User,
  Menu,
  X,
  ChevronDown,
  Zap,
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
  const pathname = usePathname()
  const itemCount = useCartStore(s => s.getItemCount())
  const openCart = useCartStore(s => s.openCart)
  const { isAuthenticated } = useAuthStore()
  const { openSearch } = useSearchStore()
  const dropdownRef = useRef<HTMLDivElement>(null)

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
          'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
          isScrolled
            ? 'bg-brand-black/95 backdrop-blur-md border-b border-white/5 shadow-lg shadow-black/20'
            : 'bg-transparent'
        )}
      >
        <div className="container-brand flex items-center justify-between h-[72px]">
          {/* Logo */}
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
                    'flex items-center gap-1.5 px-4 py-2 text-sm font-medium uppercase tracking-wider transition-colors duration-200',
                    item.href === '/flash-sale'
                      ? 'text-brand-red hover:text-brand-red/80'
                      : pathname.startsWith(item.href) && item.href !== '/'
                      ? 'text-brand-red'
                      : 'text-brand-white/80 hover:text-brand-white'
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
                        'transition-transform duration-200',
                        activeDropdown === item.label ? 'rotate-180' : ''
                      )}
                    />
                  )}
                </Link>

                <AnimatePresence>
                  {item.children && activeDropdown === item.label && (
                    <motion.div
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 8 }}
                      transition={{ duration: 0.15 }}
                      className="absolute top-full left-0 mt-1 w-56 bg-brand-graphite border border-white/10 shadow-2xl shadow-black/50"
                    >
                      {item.children.map(child => (
                        <Link
                          key={child.href}
                          href={child.href}
                          className="block px-4 py-3 hover:bg-white/5 transition-colors border-b border-white/5 last:border-0 group"
                        >
                          <span className="block text-sm font-semibold text-brand-white group-hover:text-brand-red transition-colors">
                            {child.label}
                          </span>
                          <span className="block text-xs text-brand-gray-text mt-0.5">
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
              className="p-2.5 text-brand-white/70 hover:text-brand-white transition-colors cursor-pointer"
              aria-label="Buscar produtos"
            >
              <Search size={20} />
            </button>

            <Link
              href={isAuthenticated ? '/conta' : '/login'}
              className="p-2.5 text-brand-white/70 hover:text-brand-white transition-colors hidden sm:flex"
              aria-label={isAuthenticated ? 'Minha conta' : 'Login'}
            >
              <User size={20} />
            </Link>

            <button
              onClick={openCart}
              className="relative p-2.5 text-brand-white/70 hover:text-brand-white transition-colors cursor-pointer"
              aria-label={`Carrinho - ${itemCount} itens`}
            >
              <ShoppingBag size={20} />
              {itemCount > 0 && (
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
              className="lg:hidden p-2.5 text-brand-white/70 hover:text-brand-white transition-colors cursor-pointer ml-1"
              aria-label="Abrir menu"
            >
              <Menu size={22} />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Menu */}
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
                <LogoSVG small />
                <button
                  onClick={() => setMobileOpen(false)}
                  className="p-2 text-brand-white/70 hover:text-brand-white cursor-pointer"
                  aria-label="Fechar menu"
                >
                  <X size={22} />
                </button>
              </div>

              <nav className="flex-1 overflow-y-auto py-4">
                {NAV_ITEMS.map((item, i) => (
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
                <Link
                  href={isAuthenticated ? '/conta' : '/login'}
                  className="btn-secondary w-full text-center"
                >
                  <User size={16} />
                  {isAuthenticated ? 'Minha Conta' : 'Entrar / Cadastrar'}
                </Link>
                <button onClick={() => { openCart(); setMobileOpen(false) }} className="btn-primary w-full">
                  <ShoppingBag size={16} />
                  Carrinho {itemCount > 0 && `(${itemCount})`}
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}

function LogoSVG({ small = false }: { small?: boolean }) {
  return (
    <Image
      src="/logo-sdw.svg"
      alt="StreetDrop Wear"
      width={small ? 120 : 160}
      height={small ? 39 : 52}
      priority
      className="object-contain"
      style={{ filter: 'brightness(0) invert(1)' }}
    />
  )
}
