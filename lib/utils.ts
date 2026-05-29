import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatPrice(price: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(price)
}

export function formatDiscount(original: number, current: number): number {
  return Math.round(((original - current) / original) * 100)
}

export function slugify(text: string) {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim()
}

export function getProductBgColor(colorHex: string): string {
  return colorHex
}

export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength).trim() + '...'
}

export function getStockLabel(stock: number): string {
  if (stock === 0) return 'Esgotado'
  if (stock <= 5) return `Últimas ${stock} unidades`
  if (stock <= 10) return 'Poucas unidades'
  return 'Em estoque'
}

export function getStatusColor(status: string): string {
  switch (status) {
    case 'available': return 'text-green-400'
    case 'low_stock': return 'text-yellow-400'
    case 'out_of_stock': return 'text-red-400'
    case 'pre_order': return 'text-blue-400'
    default: return 'text-gray-400'
  }
}

export function getOrderStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    pending: 'Aguardando confirmação',
    confirmed: 'Confirmado',
    in_production: 'Em produção',
    shipped: 'Enviado',
    delivered: 'Entregue',
    cancelled: 'Cancelado',
  }
  return labels[status] || status
}

export function getOrderStatusColor(status: string): string {
  const colors: Record<string, string> = {
    pending: 'text-yellow-400 bg-yellow-400/10',
    confirmed: 'text-blue-400 bg-blue-400/10',
    in_production: 'text-purple-400 bg-purple-400/10',
    shipped: 'text-cyan-400 bg-cyan-400/10',
    delivered: 'text-green-400 bg-green-400/10',
    cancelled: 'text-red-400 bg-red-400/10',
  }
  return colors[status] || 'text-gray-400 bg-gray-400/10'
}

export const WHATSAPP_NUMBER = '5511999999999'
export const WHATSAPP_BASE = `https://wa.me/${WHATSAPP_NUMBER}`

export function getWhatsAppLink(message: string): string {
  return `${WHATSAPP_BASE}?text=${encodeURIComponent(message)}`
}
