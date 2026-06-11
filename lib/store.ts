'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { CartItem, CartCustomization, Product, ProductColor, ProductSize, User } from './types'

// â”€â”€â”€ Cart â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

interface ShippingConfigCache {
  cost: number
  isFree: boolean
  freeShippingAbove: number
  globalFreeShipping: boolean
  fetchedAt: number // timestamp
}

interface CartStore {
  items: CartItem[]
  isOpen: boolean
  coupon: { code: string; discountPct: number; description?: string; freeShipping: boolean } | null
  shippingCache: ShippingConfigCache | null
  addItem: (
    product: Product,
    color: ProductColor,
    size: ProductSize,
    quantity?: number,
    customization?: CartCustomization
  ) => void
  removeItem: (productId: string, colorName: string, sizeLabel: string, stampId?: string) => void
  updateQuantity: (productId: string, colorName: string, sizeLabel: string, quantity: number, stampId?: string) => void
  clearCart: () => void
  toggleCart: () => void
  openCart: () => void
  closeCart: () => void
  applyCoupon: (code: string, discountPct: number, description?: string, freeShipping?: boolean) => void
  removeCoupon: () => void
  setShippingCache: (cfg: ShippingConfigCache) => void
  getTotal: () => number
  getSubtotal: () => number
  getDiscount: () => number
  getShipping: () => number
  getItemCount: () => number
  hasCustomItem: () => boolean
}

function itemKey(productId: string, colorName: string, sizeLabel: string, stampId?: string) {
  return `${productId}__${colorName}__${sizeLabel}__${stampId ?? ''}`
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,
      coupon: null,
      shippingCache: null,

      addItem: (product, color, size, quantity = 1, customization) => {
        set(state => {
          const key = itemKey(product.id, color.name, size.label, customization?.stampId)
          const existingIndex = state.items.findIndex(
            item => itemKey(item.product.id, item.selectedColor.name, item.selectedSize.label, item.customization?.stampId) === key
          )

          if (existingIndex >= 0) {
            const updated = [...state.items]
            updated[existingIndex] = {
              ...updated[existingIndex],
              quantity: updated[existingIndex].quantity + quantity,
            }
            return { items: updated }
          }

          return {
            items: [...state.items, { product, quantity, selectedColor: color, selectedSize: size, customization }],
          }
        })
      },

      removeItem: (productId, colorName, sizeLabel, stampId) => {
        set(state => ({
          items: state.items.filter(
            item => itemKey(item.product.id, item.selectedColor.name, item.selectedSize.label, item.customization?.stampId)
              !== itemKey(productId, colorName, sizeLabel, stampId)
          ),
        }))
      },

      updateQuantity: (productId, colorName, sizeLabel, quantity, stampId) => {
        if (quantity <= 0) {
          get().removeItem(productId, colorName, sizeLabel, stampId)
          return
        }
        set(state => ({
          items: state.items.map(item =>
            itemKey(item.product.id, item.selectedColor.name, item.selectedSize.label, item.customization?.stampId)
              === itemKey(productId, colorName, sizeLabel, stampId)
              ? { ...item, quantity }
              : item
          ),
        }))
      },

      clearCart: () => set({ items: [], coupon: null }),

      toggleCart: () => set(state => ({ isOpen: !state.isOpen })),
      openCart: () => set({ isOpen: true }),
      closeCart: () => set({ isOpen: false }),

      applyCoupon: (code, discountPct, description, freeShipping = false) =>
        set({ coupon: { code, discountPct, description, freeShipping } }),
      removeCoupon: () => set({ coupon: null }),

      setShippingCache: (cfg) => set({ shippingCache: cfg }),

      getSubtotal: () => get().items.reduce((sum, item) => sum + item.product.price * item.quantity, 0),

      getDiscount: () => {
        const { coupon } = get()
        if (!coupon || coupon.discountPct <= 0) return 0
        return get().getSubtotal() * (coupon.discountPct / 100)
      },

      getShipping: () => {
        const { coupon, shippingCache } = get()
        // Coupon com frete grátis
        if (coupon?.freeShipping) return 0
        // Config carregada do servidor
        if (shippingCache) return shippingCache.cost
        // Fallback enquanto não carregou (será atualizado pelo CartDrawer)
        const subtotal = get().getSubtotal()
        return subtotal >= 199.9 ? 0 : 19.9
      },

      getTotal: () => get().getSubtotal() + get().getShipping() - get().getDiscount(),

      getItemCount: () => get().items.reduce((sum, item) => sum + item.quantity, 0),

      hasCustomItem: () => get().items.some(item => item.customization?.isCustomShirt),
    }),
    {
      name: 'streetdrop-cart',
      partialize: state => ({ items: state.items, coupon: state.coupon }),
      // shippingCache não é persistido — é sempre refrescado ao abrir o carrinho
    }
  )
)

// â”€â”€â”€ Auth â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

interface AuthStore {
  user: User | null
  isAuthenticated: boolean
  login: (user: User) => void
  logout: () => void
  updateUser: (data: Partial<User>) => void
}

export const useAuthStore = create<AuthStore>()(
  persist(
    set => ({
      user: null,
      isAuthenticated: false,

      login: user => set({ user, isAuthenticated: true }),

      logout: () => set({ user: null, isAuthenticated: false }),

      updateUser: data =>
        set(state => ({
          user: state.user ? { ...state.user, ...data } : null,
        })),
    }),
    { name: 'streetdrop-auth' }
  )
)

// â”€â”€â”€ Search â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

interface SearchStore {
  query: string
  isOpen: boolean
  setQuery: (q: string) => void
  openSearch: () => void
  closeSearch: () => void
}

export const useSearchStore = create<SearchStore>()(set => ({
  query: '',
  isOpen: false,
  setQuery: query => set({ query }),
  openSearch: () => set({ isOpen: true }),
  closeSearch: () => set({ isOpen: false, query: '' }),
}))
