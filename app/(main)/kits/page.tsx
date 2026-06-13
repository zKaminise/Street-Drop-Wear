import type { Metadata } from 'next'
import { KitsPageContent } from './KitsPageContent'

export const metadata: Metadata = {
  title: 'Kits Personalizados para Empresas, Academia e Eventos',
  description:
    'Kits de camisetas personalizadas para empresas, academias, escolas, eventos e corridas. Orçamento rápido, alta qualidade e entrega para todo o Brasil. Fale agora no WhatsApp.',
  keywords: [
    'kit camiseta personalizada empresa',
    'kit uniforme academia',
    'kit camiseta evento',
    'brinde personalizado empresa',
    'uniforme personalizado',
    'camiseta personalizada em quantidade',
    'kit interclasse personalizado',
    'kit corrida personalizado',
    'kit camiseta Uberlândia',
  ],
  openGraph: {
    title: 'Kits Personalizados para Empresas e Eventos | StreetDrop Wear',
    description: 'Kits de camisetas para empresas, academias, escolas e eventos. Orçamento rápido no WhatsApp.',
    url: 'https://www.streetdropwear.com.br/kits',
  },
  alternates: { canonical: 'https://www.streetdropwear.com.br/kits' },
}

export default function KitsPage() {
  return <KitsPageContent />
}
