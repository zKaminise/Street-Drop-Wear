import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Flash Sale – Ofertas por Tempo Limitado',
  description:
    'Aproveite as melhores ofertas da StreetDrop Wear com preços especiais por tempo limitado. Camisetas, produtos geek e muito mais com desconto.',
  keywords: [
    'flash sale camiseta',
    'oferta camiseta personalizada',
    'desconto streetwear',
    'promoção camiseta',
    'camiseta barata personalizada',
    'oferta relâmpago roupas',
  ],
  openGraph: {
    title: 'Flash Sale – Ofertas Relâmpago | StreetDrop Wear',
    description: 'Ofertas por tempo limitado na StreetDrop Wear. Aproveite antes que acabe!',
    url: 'https://www.streetdropwear.com.br/flash-sale',
  },
  alternates: { canonical: 'https://www.streetdropwear.com.br/flash-sale' },
  robots: { index: true, follow: true },
}

export default function FlashSaleLayout({ children }: { children: React.ReactNode }) {
  return children
}
