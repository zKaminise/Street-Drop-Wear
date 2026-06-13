import type { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/admin/',
          '/api/',
          '/checkout/',
          '/carrinho',
          '/conta/',
          '/pedidos',
          '/login',
        ],
      },
    ],
    sitemap: 'https://www.streetdropwear.com.br/sitemap.xml',
    host: 'https://www.streetdropwear.com.br',
  }
}
