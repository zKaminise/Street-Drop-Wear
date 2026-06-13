import type { Metadata, Viewport } from 'next'
import { Bebas_Neue, Space_Grotesk } from 'next/font/google'
import Script from 'next/script'
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

const SITE_URL = 'https://www.streetdropwear.com.br'

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'StreetDrop Wear – Camisetas Personalizadas & Streetwear em Uberlândia',
    template: '%s | StreetDrop Wear',
  },
  description:
    'Camisetas oversized, dry-fit fitness e camisetas personalizadas em Uberlândia e para todo Brasil. Kits para empresas, eventos e academias. PIX com 5% de desconto. Frete fixo.',
  keywords: [
    'camiseta personalizada',
    'camiseta personalizada Uberlândia',
    'oversized personalizada',
    'streetwear',
    'dry-fit personalizado',
    'kits para empresas',
    'kit camiseta empresa',
    'camiseta personalizada academia',
    'camiseta personalizada evento',
    'street drop wear',
    'streetdropwear',
    'camiseta oversized',
    'camiseta fitness',
    'produtos 3d',
    'geek store',
    'brindes personalizados',
    'uniformes personalizados',
  ],
  openGraph: {
    type: 'website',
    locale: 'pt_BR',
    url: SITE_URL,
    siteName: 'StreetDrop Wear',
    title: 'StreetDrop Wear – Camisetas Personalizadas & Streetwear',
    description: 'Vista sua identidade. Crie seu drop. Represente seu estilo. Camisetas oversized, dry-fit e personalizadas para todo o Brasil.',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'StreetDrop Wear – Camisetas Personalizadas',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'StreetDrop Wear – Camisetas Personalizadas & Streetwear',
    description: 'Vista sua identidade. Crie seu drop. Represente seu estilo.',
    images: ['/og-image.png'],
  },
  alternates: {
    canonical: SITE_URL,
  },
  icons: [
    { rel: 'icon', url: '/icon-sdw.svg', type: 'image/svg+xml' },
    { rel: 'apple-touch-icon', url: '/icon-sdw.svg' },
    { rel: 'shortcut icon', url: '/icon-sdw.svg' },
  ],
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, 'max-snippet': -1, 'max-image-preview': 'large', 'max-video-preview': -1 },
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#0B0B0D',
}

const orgJsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Organization',
      '@id': `${SITE_URL}/#organization`,
      name: 'StreetDrop Wear',
      url: SITE_URL,
      logo: {
        '@type': 'ImageObject',
        url: `${SITE_URL}/logo-sdw.svg`,
      },
      sameAs: [
        'https://www.instagram.com/streetdrop_wear',
        'https://www.tiktok.com/@streetdropwear',
      ],
      contactPoint: {
        '@type': 'ContactPoint',
        telephone: '+55-34-99827-5292',
        contactType: 'customer service',
        areaServed: 'BR',
        availableLanguage: 'Portuguese',
      },
      address: {
        '@type': 'PostalAddress',
        addressLocality: 'Uberlândia',
        addressRegion: 'MG',
        addressCountry: 'BR',
      },
    },
    {
      '@type': 'WebSite',
      '@id': `${SITE_URL}/#website`,
      url: SITE_URL,
      name: 'StreetDrop Wear',
      publisher: { '@id': `${SITE_URL}/#organization` },
      potentialAction: {
        '@type': 'SearchAction',
        target: { '@type': 'EntryPoint', urlTemplate: `${SITE_URL}/busca?q={search_term_string}` },
        'query-input': 'required name=search_term_string',
      },
    },
    {
      '@type': 'LocalBusiness',
      '@id': `${SITE_URL}/#localbusiness`,
      name: 'StreetDrop Wear',
      url: SITE_URL,
      image: `${SITE_URL}/og-image.png`,
      telephone: '+55-34-99827-5292',
      email: 'streetdropwear@gmail.com',
      address: {
        '@type': 'PostalAddress',
        addressLocality: 'Uberlândia',
        addressRegion: 'MG',
        addressCountry: 'BR',
      },
      priceRange: '$$',
      openingHours: 'Mo-Fr 09:00-18:00',
      currenciesAccepted: 'BRL',
      paymentAccepted: 'PIX, Cartão de Crédito, Boleto',
    },
  ],
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={`${bebasNeue.variable} ${spaceGrotesk.variable}`}>
      <head>
        <link rel="icon" href="/icon-sdw.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/icon-sdw.svg" />
      </head>
      <body>
        {children}
        <Script
          id="org-jsonld"
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(orgJsonLd) }}
          strategy="afterInteractive"
        />
      </body>
    </html>
  )
}
