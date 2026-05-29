import type { Metadata } from 'next'
import { Hero } from '@/components/home/Hero'
import { ProductWorlds } from '@/components/home/ProductWorlds'
import { ScrollShowcase } from '@/components/home/ScrollShowcase'
import { HowItWorks } from '@/components/home/HowItWorks'
import { KitsSection } from '@/components/home/KitsSection'
import { Testimonials } from '@/components/home/Testimonials'
import { FAQ } from '@/components/home/FAQ'
import { FeaturedProducts } from '@/components/home/FeaturedProducts'

export const metadata: Metadata = {
  title: 'StreetDrop Wear â€” Camisetas Personalizadas & Streetwear Premium',
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
    </>
  )
}
