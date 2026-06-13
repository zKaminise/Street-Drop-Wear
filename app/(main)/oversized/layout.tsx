import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Camisetas Oversized Personalizadas – Monte a Sua',
  description:
    'Camisetas oversized com estampas personalizadas para você escolher. Tecido premium, caimento largo e moderno. Monte do jeito que quiser e receba em todo o Brasil.',
  keywords: [
    'camiseta oversized personalizada',
    'oversized estampada',
    'camiseta oversized streetwear',
    'camiseta oversized Uberlândia',
    'oversized premium',
    'camiseta larga personalizada',
    'camiseta streetwear',
  ],
  openGraph: {
    title: 'Camisetas Oversized Personalizadas | StreetDrop Wear',
    description: 'Monte a sua camiseta oversized com a estampa que quiser. Envio para todo o Brasil.',
    url: 'https://www.streetdropwear.com.br/oversized',
  },
  alternates: { canonical: 'https://www.streetdropwear.com.br/oversized' },
}

export default function OversizedLayout({ children }: { children: React.ReactNode }) {
  return children
}
