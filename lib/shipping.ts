import { prisma } from './prisma'

export interface ShippingConfig {
  fixedShippingEnabled: boolean
  fixedShippingValue: number
  freeShippingAbove: number
  globalFreeShipping: boolean
  productionDaysStd: number
  productionDaysCustom: number
}

export interface ShippingResult {
  cost: number
  isFree: boolean
  productionDays: number
  estimatedDeliveryDays: number
  // Exposed so clients can display the progress bar correctly
  freeShippingAbove: number
  globalFreeShipping: boolean
}

const DEFAULTS: ShippingConfig = {
  fixedShippingEnabled: true,
  fixedShippingValue: 19.9,
  freeShippingAbove: 199.9,
  globalFreeShipping: false,
  productionDaysStd: 7,
  productionDaysCustom: 12,
}

export async function getShippingConfig(): Promise<ShippingConfig> {
  try {
    const cfg = await (prisma as any).shippingConfig.findFirst()
    if (cfg) return cfg
  } catch { /* ignora */ }
  return DEFAULTS
}

export async function calculateShipping(
  subtotal: number,
  hasCustomItem = false
): Promise<ShippingResult> {
  const cfg = await getShippingConfig()

  // Frete grátis global tem prioridade total
  const isFree = cfg.globalFreeShipping || subtotal >= cfg.freeShippingAbove
  const cost = isFree ? 0 : cfg.fixedShippingEnabled ? cfg.fixedShippingValue : 0
  const productionDays = hasCustomItem ? cfg.productionDaysCustom : cfg.productionDaysStd
  const estimatedDeliveryDays = productionDays + 5

  return {
    cost,
    isFree,
    productionDays,
    estimatedDeliveryDays,
    freeShippingAbove: cfg.freeShippingAbove,
    globalFreeShipping: cfg.globalFreeShipping,
  }
}
