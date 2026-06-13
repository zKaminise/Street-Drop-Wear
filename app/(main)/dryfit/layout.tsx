import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Camisetas DryFit Fitness Personalizadas – Academia e Esporte',
  description:
    'Camisetas dry-fit personalizadas para academia, treino e esporte. Tecido que seca rápido, leve e resistente. Masculino e feminino. Entrega para todo o Brasil.',
  keywords: [
    'camiseta dry-fit personalizada',
    'camiseta fitness personalizada',
    'camiseta academia personalizada',
    'camiseta treino personalizada',
    'dry-fit esportiva',
    'camiseta corrida personalizada',
    'uniforme academia',
    'camiseta esportiva personalizada Uberlândia',
  ],
  openGraph: {
    title: 'Camisetas DryFit Fitness Personalizadas | StreetDrop Wear',
    description: 'Camisetas dry-fit para academia e esporte com sua personalização. Entrega em todo o Brasil.',
    url: 'https://www.streetdropwear.com.br/dryfit',
  },
  alternates: { canonical: 'https://www.streetdropwear.com.br/dryfit' },
}

export default function DryfitLayout({ children }: { children: React.ReactNode }) {
  return children
}
