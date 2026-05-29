import type { Metadata } from 'next'
import { KitsPageContent } from './KitsPageContent'

export const metadata: Metadata = {
  title: 'Kits Personalizados â€” StreetDrop Wear',
  description: 'Kits para empresas, academias, escolas e eventos. Solicite seu orÃ§amento.',
}

export default function KitsPage() {
  return <KitsPageContent />
}
