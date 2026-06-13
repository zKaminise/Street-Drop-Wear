import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Camisetas Personalizadas – Escolha a Estampa e o Estilo',
  description:
    'Camisetas personalizadas com estampas exclusivas. Tecido confortável, cores vivas e acabamento premium. Peça a sua online e receba em todo o Brasil.',
  keywords: [
    'camiseta personalizada',
    'camiseta com estampa',
    'camiseta personalizada online',
    'camiseta personalizada Uberlândia',
    'camiseta estampada',
    'comprar camiseta personalizada',
    'camiseta geek',
    'camiseta streetwear Brasil',
  ],
  openGraph: {
    title: 'Camisetas Personalizadas | StreetDrop Wear',
    description: 'Camisetas com estampas exclusivas. Peça a sua e receba em todo o Brasil.',
    url: 'https://www.streetdropwear.com.br/camisetas',
  },
  alternates: { canonical: 'https://www.streetdropwear.com.br/camisetas' },
}

export default function CamisetasLayout({ children }: { children: React.ReactNode }) {
  return children
}
