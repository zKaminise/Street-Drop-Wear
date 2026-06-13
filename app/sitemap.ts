import type { MetadataRoute } from 'next'
import { prisma } from '@/lib/prisma'

const BASE = 'https://www.streetdropwear.com.br'

const STATIC_PAGES: MetadataRoute.Sitemap = [
  { url: BASE,                    lastModified: new Date(), changeFrequency: 'daily',   priority: 1.0 },
  { url: `${BASE}/oversized`,     lastModified: new Date(), changeFrequency: 'weekly',  priority: 0.9 },
  { url: `${BASE}/camisetas`,     lastModified: new Date(), changeFrequency: 'weekly',  priority: 0.9 },
  { url: `${BASE}/dryfit`,        lastModified: new Date(), changeFrequency: 'weekly',  priority: 0.9 },
  { url: `${BASE}/produtos-3d`,   lastModified: new Date(), changeFrequency: 'weekly',  priority: 0.8 },
  { url: `${BASE}/geek`,          lastModified: new Date(), changeFrequency: 'weekly',  priority: 0.8 },
  { url: `${BASE}/kits`,          lastModified: new Date(), changeFrequency: 'monthly', priority: 0.8 },
  { url: `${BASE}/flash-sale`,    lastModified: new Date(), changeFrequency: 'daily',   priority: 0.7 },
  { url: `${BASE}/sobre`,         lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
]

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  let productPages: MetadataRoute.Sitemap = []

  try {
    const products = await prisma.product.findMany({
      where: { active: true },
      select: { id: true, slug: true, updatedAt: true },
    })

    productPages = products.map(p => ({
      url: `${BASE}/produto/${p.slug ?? p.id}`,
      lastModified: p.updatedAt,
      changeFrequency: 'weekly' as const,
      priority: 0.85,
    }))
  } catch {
    // DB unavailable at build time — return static pages only
  }

  return [...STATIC_PAGES, ...productPages]
}
