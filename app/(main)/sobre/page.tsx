import type { Metadata } from 'next'
import { SobreContent } from './SobreContent'

export const metadata: Metadata = {
  title: 'Sobre a StreetDrop Wear',
  description: 'Nossa história, valores e compromisso com qualidade e personalização.',
}

export default function SobrePage() {
  return <SobreContent />
}
