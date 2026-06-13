import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Geek Store – Produtos Pokémon TCG, Anime e Games',
  description:
    'Loja geek com Pokémon TCG, camisetas de anime, games e cultura pop. Encontre itens exclusivos para colecionadores e fãs de cultura geek.',
  keywords: [
    'geek store',
    'pokémon tcg',
    'carta pokémon',
    'camiseta anime',
    'camiseta game',
    'loja geek',
    'camiseta geek personalizada',
    'cultura pop',
    'produto geek Brasil',
    'pokémon Uberlândia',
  ],
  openGraph: {
    title: 'Geek Store – Pokémon TCG e Produtos Geek | StreetDrop Wear',
    description: 'Pokémon TCG, camisetas de anime e games. Loja geek online com entrega para todo o Brasil.',
    url: 'https://www.streetdropwear.com.br/geek',
  },
  alternates: { canonical: 'https://www.streetdropwear.com.br/geek' },
}

export default function GeekLayout({ children }: { children: React.ReactNode }) {
  return children
}
