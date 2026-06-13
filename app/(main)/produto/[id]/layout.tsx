import type { Metadata } from 'next'
import { prisma } from '@/lib/prisma'

const BASE = 'https://www.streetdropwear.com.br'

export async function generateMetadata(
  { params }: { params: { id: string } }
): Promise<Metadata> {
  try {
    const product = await (prisma as any).product.findFirst({
      where: {
        OR: [{ id: params.id }, { slug: params.id }],
        active: true,
      },
      select: {
        name: true,
        description: true,
        price: true,
        imageUrl: true,
        slug: true,
        id: true,
        type: true,
      },
    })

    if (!product) {
      return { title: 'Produto não encontrado | StreetDrop Wear' }
    }

    const url = `${BASE}/produto/${product.slug ?? product.id}`
    const typeLabel: Record<string, string> = {
      OVERSIZED: 'Camiseta Oversized',
      CAMISETA: 'Camiseta',
      DRYFIT: 'Camiseta DryFit',
      KIT: 'Kit Personalizado',
    }
    const label = typeLabel[product.type] ?? 'Produto'
    const title = `${product.name} – ${label} Personalizado`
    const description = product.description
      ? product.description.slice(0, 155)
      : `${product.name} — ${label} personalizado com qualidade premium. Compre na StreetDrop Wear.`

    const images = product.imageUrl
      ? [{ url: product.imageUrl.startsWith('http') ? product.imageUrl : `${BASE}${product.imageUrl}`, width: 800, height: 800, alt: product.name }]
      : []

    return {
      title,
      description,
      openGraph: {
        title,
        description,
        url,
        type: 'website',
        images,
      },
      twitter: {
        card: 'summary_large_image',
        title,
        description,
        images: images.map(i => i.url),
      },
      alternates: { canonical: url },
    }
  } catch {
    return { title: 'Produto | StreetDrop Wear' }
  }
}

export default function ProductLayout({ children }: { children: React.ReactNode }) {
  return children
}
