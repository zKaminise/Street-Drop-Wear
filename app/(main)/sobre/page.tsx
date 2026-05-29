import type { Metadata } from 'next'
import { SobreContent } from './SobreContent'

export const metadata: Metadata = {
  title: 'Sobre a StreetDrop Wear',
  description: 'Nossa histÃ³ria, valores e compromisso com qualidade e personalizaÃ§Ã£o.',
}

export default function SobrePage() {
  return <SobreContent />
}
