import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Produtos 3D Personalizados – Impressão 3D sob Encomenda',
  description:
    'Produtos com impressão 3D personalizados sob encomenda. Brindes, decoração e peças únicas feitas para você ou sua empresa. Entrega em todo o Brasil.',
  keywords: [
    'produto 3d personalizado',
    'impressão 3d personalizada',
    'brinde 3d',
    'produto 3d sob encomenda',
    'impressão 3d Uberlândia',
    'peças 3d personalizadas',
    'miniatura 3d',
    'decoração 3d personalizada',
  ],
  openGraph: {
    title: 'Produtos 3D Personalizados | StreetDrop Wear',
    description: 'Impressão 3D personalizada sob encomenda para você ou sua empresa.',
    url: 'https://www.streetdropwear.com.br/produtos-3d',
  },
  alternates: { canonical: 'https://www.streetdropwear.com.br/produtos-3d' },
}

export default function Produtos3dLayout({ children }: { children: React.ReactNode }) {
  return children
}
