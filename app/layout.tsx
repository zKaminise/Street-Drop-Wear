import type { Metadata, Viewport } from 'next'
import { Bebas_Neue, Space_Grotesk } from 'next/font/google'
import './globals.css'

const bebasNeue = Bebas_Neue({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-bebas',
  display: 'swap',
})

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-space',
  display: 'swap',
  weight: ['300', '400', '500', '600', '700'],
})

export const metadata: Metadata = {
  title: {
    default: 'StreetDrop Wear – Camisetas Personalizadas & Streetwear Premium',
    template: '%s | StreetDrop Wear',
  },
  description:
    'Camisetas oversized personalizadas, dry-fit fitness, produtos 3D, Geek Store e kits para empresas. Vista sua identidade com StreetDrop Wear.',
  keywords: [
    'camiseta personalizada',
    'oversized',
    'streetwear',
    'dry-fit',
    'kits para empresas',
    'pokémon tcg',
    'impressão 3d',
    'brindes',
  ],
  openGraph: {
    type: 'website',
    locale: 'pt_BR',
    siteName: 'StreetDrop Wear',
    title: 'StreetDrop Wear – Camisetas Personalizadas & Streetwear Premium',
    description: 'Vista sua identidade. Crie seu drop. Represente seu estilo.',
  },
  icons: {
    icon: '/icon-sdw.svg',
    apple: '/icon-sdw.svg',
    shortcut: '/icon-sdw.svg',
  },
  robots: { index: true, follow: true },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#0B0B0D',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={`${bebasNeue.variable} ${spaceGrotesk.variable}`}>
      <body>{children}</body>
    </html>
  )
}
