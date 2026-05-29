import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  // Admin user
  const hash = await bcrypt.hash('admin123', 10)
  await prisma.adminUser.upsert({
    where: { email: 'admin@streetdropwear.com' },
    update: {},
    create: {
      email: 'admin@streetdropwear.com',
      password: hash,
      name: 'Admin StreetDrop',
      role: 'SUPER_ADMIN',
    },
  })

  // Shirt bases
  const oversizedBase = await prisma.shirtBase.upsert({
    where: { id: 'base-oversized-premium' },
    update: {},
    create: {
      id: 'base-oversized-premium',
      name: 'Oversized Premium',
      type: 'OVERSIZED',
      basePrice: 89.90,
      description: 'Camiseta oversized de algodÃ£o 100% premium, corte amplo streetwear',
      active: true,
    },
  })

  const camisetaBase = await prisma.shirtBase.upsert({
    where: { id: 'base-camiseta-classic' },
    update: {},
    create: {
      id: 'base-camiseta-classic',
      name: 'Camiseta Classic',
      type: 'CAMISETA',
      basePrice: 59.90,
      description: 'Camiseta regular fit, algodÃ£o penteado 30.1',
      active: true,
    },
  })

  // Colors for oversized
  const colors = [
    { id: 'color-preto', name: 'Preto', hex: '#0B0B0D' },
    { id: 'color-branco', name: 'Branco', hex: '#F5F5F2' },
    { id: 'color-cinza', name: 'Cinza Mescla', hex: '#6B6B6B' },
    { id: 'color-off-white', name: 'Off White', hex: '#F0EDE6' },
    { id: 'color-azul-navy', name: 'Azul Navy', hex: '#1B2D4F' },
    { id: 'color-verde', name: 'Verde Militar', hex: '#3A4A2F' },
  ]

  const oversizedColors: typeof colors = []
  const camisetaColors: typeof colors = []

  for (const c of colors) {
    const oc = await prisma.baseColor.upsert({
      where: { id: `os-${c.id}` },
      update: {},
      create: {
        id: `os-${c.id}`,
        baseId: oversizedBase.id,
        name: c.name,
        hex: c.hex,
        active: true,
      },
    })
    oversizedColors.push({ ...c, id: oc.id })

    const cc = await prisma.baseColor.upsert({
      where: { id: `cs-${c.id}` },
      update: {},
      create: {
        id: `cs-${c.id}`,
        baseId: camisetaBase.id,
        name: c.name,
        hex: c.hex,
        active: true,
      },
    })
    camisetaColors.push({ ...c, id: cc.id })
  }

  // Stock for each color
  const sizes = ['PP', 'P', 'M', 'G', 'GG', 'XGG']
  for (const color of [...oversizedColors, ...camisetaColors]) {
    for (const size of sizes) {
      const existing = await prisma.stockItem.findFirst({
        where: { colorId: color.id, size },
      })
      if (!existing) {
        await prisma.stockItem.create({
          data: { colorId: color.id, size, quantity: Math.floor(Math.random() * 30) + 5 },
        })
      }
    }
  }

  // Stamps
  const stampsData = [
    { slug: 'sem-estampa', name: 'Sem Estampa', imageUrl: '/stamps/sem-estampa.svg', extraPrice: 0, allowedFor: 'BOTH', category: 'BÃ¡sico' },
    { slug: 'streetdrop-logo', name: 'Logo StreetDrop', imageUrl: '/stamps/logo-streetdrop.svg', extraPrice: 20, allowedFor: 'BOTH', category: 'Marca' },
    { slug: 'urban-skull', name: 'Urban Skull', imageUrl: '/stamps/urban-skull.svg', extraPrice: 30, allowedFor: 'OVERSIZED', category: 'Urban' },
    { slug: 'dragon-fire', name: 'Dragon Fire', imageUrl: '/stamps/dragon-fire.svg', extraPrice: 35, allowedFor: 'BOTH', category: 'Urban' },
    { slug: 'tokyo-night', name: 'Tokyo Night', imageUrl: '/stamps/tokyo-night.svg', extraPrice: 25, allowedFor: 'BOTH', category: 'Geek' },
    { slug: 'neon-wave', name: 'Neon Wave', imageUrl: '/stamps/neon-wave.svg', extraPrice: 25, allowedFor: 'CAMISETA', category: 'Arte' },
    { slug: 'mountain-peak', name: 'Mountain Peak', imageUrl: '/stamps/mountain-peak.svg', extraPrice: 20, allowedFor: 'BOTH', category: 'Nature' },
    { slug: 'cyber-grid', name: 'Cyber Grid', imageUrl: '/stamps/cyber-grid.svg', extraPrice: 30, allowedFor: 'OVERSIZED', category: 'Tech' },
  ]

  for (const s of stampsData) {
    await prisma.stamp.upsert({
      where: { slug: s.slug },
      update: {},
      create: s,
    })
  }

  // DryFit products
  const dryfitProducts = [
    {
      name: 'DryFit Performance Pro',
      slug: 'dryfit-performance-pro',
      type: 'DRYFIT',
      description: 'Camiseta DryFit de alta performance para treinos intensos. Tecnologia de absorÃ§Ã£o rÃ¡pida de umidade.',
      price: 79.90,
      material: 'PoliÃ©ster 100% com tecnologia DryFit',
      isNew: true,
      active: true,
    },
    {
      name: 'DryFit Slim Fit',
      slug: 'dryfit-slim-fit',
      type: 'DRYFIT',
      description: 'Corte slim para uma silhueta mais definida. Ideal para musculaÃ§Ã£o e atividades fÃ­sicas em geral.',
      price: 69.90,
      originalPrice: 89.90,
      material: 'Elastano 10% + PoliÃ©ster 90%',
      active: true,
    },
  ]

  for (const p of dryfitProducts) {
    const product = await prisma.product.upsert({
      where: { slug: p.slug },
      update: {},
      create: p,
    })
    // Add variants
    const dfColors = [
      { color: 'Preto', colorHex: '#0B0B0D' },
      { color: 'Branco', colorHex: '#F5F5F2' },
      { color: 'Azul Royal', colorHex: '#2B4EAD' },
    ]
    for (const c of dfColors) {
      for (const size of sizes) {
        await prisma.productVariant.upsert({
          where: { id: `${product.id}-${c.color}-${size}` },
          update: {},
          create: {
            id: `${product.id}-${c.color}-${size}`,
            productId: product.id,
            color: c.color,
            colorHex: c.colorHex,
            size,
            stock: Math.floor(Math.random() * 20) + 3,
            active: true,
          },
        })
      }
    }
  }

  // 3D Products
  const products3d = [
    {
      name: 'Camiseta 3D DragÃ£o LendÃ¡rio',
      slug: 'camiseta-3d-dragao-lendario',
      type: 'PRODUTO_3D',
      description: 'Estampa 3D exclusiva com efeito visual impressionante. DragÃ£o com detalhes em relevo digital.',
      price: 119.90,
      material: 'PoliÃ©ster + lycra, impressÃ£o sublimaÃ§Ã£o total',
      isNew: true,
      active: true,
    },
    {
      name: 'Camiseta 3D Galaxy Wolf',
      slug: 'camiseta-3d-galaxy-wolf',
      type: 'PRODUTO_3D',
      description: 'Lobo uivando para a lua em galÃ¡xia estrelada. Efeito 3D realista em sublimaÃ§Ã£o.',
      price: 109.90,
      active: true,
    },
  ]

  for (const p of products3d) {
    await prisma.product.upsert({
      where: { slug: p.slug },
      update: {},
      create: p,
    })
  }

  // Geek products
  const geekProducts = [
    {
      name: 'Booster PokÃ©mon TCG EV07',
      slug: 'booster-pokemon-tcg-ev07',
      type: 'GEEK',
      description: 'Booster oficial PokÃ©mon TCG - ExpansÃ£o Coroa Estelar. 10 cartas por pacote.',
      price: 39.90,
      isNew: true,
      active: true,
    },
    {
      name: 'Display PokÃ©mon EV07 (36 boosters)',
      slug: 'display-pokemon-ev07',
      type: 'GEEK',
      description: 'Display completo com 36 boosters da expansÃ£o EV07. Produto lacrado e original.',
      price: 1199.90,
      originalPrice: 1440.00,
      active: true,
    },
  ]

  for (const p of geekProducts) {
    const product = await prisma.product.upsert({
      where: { slug: p.slug },
      update: {},
      create: p,
    })
    const variantExists = await prisma.productVariant.findFirst({ where: { productId: product.id } })
    if (!variantExists) {
      await prisma.productVariant.upsert({
        where: { id: `${product.id}-unico` },
        update: {},
        create: {
          id: `${product.id}-unico`,
          productId: product.id,
          size: 'Ãšnico',
          stock: 50,
          active: true,
        },
      })
    }
  }

  // Kits
  const kitsData = [
    {
      name: 'Kit Empresa BÃ¡sico',
      slug: 'kit-empresa-basico',
      description: 'Camisetas personalizadas para sua equipe com logo e identidade visual da empresa',
      minQty: 10,
      priceFrom: 49.90,
      audience: 'Empresas',
      items: ['Camiseta personalizada com logo', 'OpÃ§Ãµes de cores da marca', 'Tamanhos PP ao GG', 'Entrega em todo Brasil'],
    },
    {
      name: 'Kit Academia Premium',
      slug: 'kit-academia-premium',
      description: 'Uniformes DryFit para academias e times esportivos',
      minQty: 20,
      priceFrom: 39.90,
      audience: 'Academias',
      items: ['DryFit com logo bordado', 'NumeraÃ§Ã£o personalizada', 'Cores Ã  escolha', 'Entrega expressa'],
    },
    {
      name: 'Kit Evento/Corrida',
      slug: 'kit-evento-corrida',
      description: 'Camisetas para eventos, corridas e festivais',
      minQty: 50,
      priceFrom: 29.90,
      audience: 'Eventos',
      items: ['Camiseta tÃ©cnica DryFit', 'NÃºmero de peito incluso', 'Data e nome do evento', 'PreÃ§o especial por volume'],
    },
  ]

  for (const k of kitsData) {
    const kit = await prisma.kit.upsert({
      where: { slug: k.slug },
      update: {},
      create: {
        name: k.name,
        slug: k.slug,
        description: k.description,
        minQty: k.minQty,
        priceFrom: k.priceFrom,
        audience: k.audience,
        active: true,
      },
    })
    for (const label of k.items) {
      const existing = await prisma.kitItem.findFirst({ where: { kitId: kit.id, label } })
      if (!existing) {
        await prisma.kitItem.create({ data: { kitId: kit.id, label } })
      }
    }
  }

  console.log('âœ… Seed completed!')
}

main()
  .catch(e => { console.error(e); process.exit(1) })
  .finally(() => prisma.$disconnect())
