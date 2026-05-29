export type ProductCategory =
  | 'oversized'
  | 'camisetas'
  | 'dryfit'
  | 'produtos-3d'
  | 'kits'
  | 'geek'

export type ProductStatus = 'available' | 'low_stock' | 'out_of_stock' | 'pre_order'

export type ProductTag = 'new' | 'sale' | 'bestseller' | 'exclusive' | 'limited'

export interface ProductColor {
  name: string
  hex: string
}

export interface ProductSize {
  label: string
  available: boolean
}

export interface ProductImage {
  id: string
  url: string
  alt: string
  color?: string
  isPrimary?: boolean
}

export interface Product {
  id: string
  slug: string
  name: string
  description: string
  shortDescription: string
  price: number
  originalPrice?: number
  category: ProductCategory
  subcategory?: string
  images: ProductImage[]
  /** Direct image URL from admin panel (card primary image) */
  imageUrl?: string
  /** Hover image URL for card hover swap effect */
  hoverImageUrl?: string
  colors: ProductColor[]
  sizes: ProductSize[]
  status: ProductStatus
  tags: ProductTag[]
  rating: number
  reviewCount: number
  isPersonalizable: boolean
  isFeatured: boolean
  isNew: boolean
  stock: number
  sku: string
  weight?: number
  material?: string
  createdAt: string
}

export interface CartCustomization {
  isCustomShirt?: boolean
  baseId?: string
  baseName?: string
  baseType?: string       // OVERSIZED | CAMISETA
  stampId?: string
  stampName?: string
  stampSlug?: string
  stampExtraPrice?: number
  previewImageUrl?: string
  productionDays?: number
  // legacy
  text?: string
  position?: string
}

export interface CartItem {
  product: Product
  quantity: number
  selectedColor: ProductColor
  selectedSize: ProductSize
  customization?: CartCustomization
}

export interface Cart {
  items: CartItem[]
  subtotal: number
  shipping: number
  total: number
}

export interface User {
  id: string
  name: string
  email: string
  phone?: string
  cpf?: string
  address?: Address
  createdAt: string
}

export interface Address {
  id: string
  label: string
  street: string
  number: string
  complement?: string
  neighborhood: string
  city: string
  state: string
  zipCode: string
  isDefault: boolean
}

export interface Order {
  id: string
  orderNumber: string
  userId: string
  items: CartItem[]
  subtotal: number
  shipping: number
  discount: number
  total: number
  status: OrderStatus
  paymentMethod: string
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded'
  shippingAddress: Address
  trackingCode?: string
  estimatedDelivery?: string
  createdAt: string
  updatedAt: string
}

export type OrderStatus =
  | 'pending'
  | 'confirmed'
  | 'in_production'
  | 'shipped'
  | 'delivered'
  | 'cancelled'

export interface KitProduct {
  id: string
  name: string
  slug: string
  description: string
  targetAudience: string
  minQuantity: number
  basePrice?: number
  items: string[]
  image?: string
  popular?: boolean
}

export interface FilterState {
  colors: string[]
  sizes: string[]
  priceRange: [number, number]
  status: ProductStatus[]
  tags: ProductTag[]
  subcategories: string[]
  sortBy: 'relevance' | 'price_asc' | 'price_desc' | 'newest' | 'bestseller'
}

export interface Testimonial {
  id: string
  name: string
  city: string
  rating: number
  text: string
  product: string
  avatar?: string
  date: string
}
