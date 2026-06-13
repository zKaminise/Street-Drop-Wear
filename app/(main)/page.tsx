import type { Metadata } from 'next'
import Script from 'next/script'
import { Hero } from '@/components/home/Hero'
import { ProductWorlds } from '@/components/home/ProductWorlds'
import { ScrollShowcase } from '@/components/home/ScrollShowcase'
import { HowItWorks } from '@/components/home/HowItWorks'
import { KitsSection } from '@/components/home/KitsSection'
import { Testimonials } from '@/components/home/Testimonials'
import { FAQ } from '@/components/home/FAQ'
import { FeaturedProducts } from '@/components/home/FeaturedProducts'

const BASE = 'https://www.streetdropwear.com.br'

export const metadata: Metadata = {
  title: 'StreetDrop Wear – Camisetas Personalizadas & Streetwear em Uberlândia',
  description:
    'Camisetas oversized, dry-fit e personalizadas com estampas exclusivas. Kits para empresas, academias e eventos. PIX com 5% de desconto. Entrega para todo o Brasil.',
  alternates: { canonical: BASE },
  openGraph: { url: BASE },
}

const breadcrumbJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'ItemList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Oversized', item: `${BASE}/oversized` },
    { '@type': 'ListItem', position: 2, name: 'Camisetas', item: `${BASE}/camisetas` },
    { '@type': 'ListItem', position: 3, name: 'DryFit Fitness', item: `${BASE}/dryfit` },
    { '@type': 'ListItem', position: 4, name: 'Geek Store', item: `${BASE}/geek` },
    { '@type': 'ListItem', position: 5, name: 'Kits', item: `${BASE}/kits` },
  ],
}

export default function HomePage() {
  return (
    <>
      <Hero />
      <ProductWorlds />
      <FeaturedProducts />
      <ScrollShowcase />
      <HowItWorks />
      <KitsSection />
      <Testimonials />
      <FAQ />
      <Script
        id="home-jsonld"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
        strategy="afterInteractive"
      />
    </>
  )
}
