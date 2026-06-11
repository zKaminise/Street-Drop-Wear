'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  ChevronRight, Lock, Check, ShoppingBag,
  User, MapPin, Truck, ClipboardList, AlertCircle, Loader2, CreditCard,
} from 'lucide-react'
import { useCartStore, useAuthStore } from '@/lib/store'
import { formatPrice } from '@/lib/utils'

type Step = 'identity' | 'address' | 'shipping' | 'review'

type IdentityData = {
  name: string
  email: string
  cpf: string
  phone: string
}

type AddressData = {
  zipCode: string
  street: string
  number: string
  complement: string
  district: string
  city: string
  state: string
  label: string
}

type ShippingData = {
  cost: number
  isFree: boolean
  productionDays: number
  estimatedDeliveryDays: number
}

const STEPS: { id: Step; label: string; icon: React.ElementType }[] = [
  { id: 'identity', label: 'Identificação', icon: User },
  { id: 'address', label: 'Endereço', icon: MapPin },
  { id: 'shipping', label: 'Entrega', icon: Truck },
  { id: 'review', label: 'Revisão', icon: ClipboardList },
]

const STATES = ['AC','AL','AM','AP','BA','CE','DF','ES','GO','MA','MG','MS','MT','PA','PB','PE','PI','PR','RJ','RN','RO','RR','RS','SC','SE','SP','TO']

const INPUT = 'w-full bg-brand-black/60 border border-white/10 text-brand-white placeholder-white/20 px-3 py-2.5 text-sm focus:outline-none focus:border-brand-red/60 transition-colors'

function Field({ label, children, required }: { label: string; children: React.ReactNode; required?: boolean }) {
  return (
    <div>
      <label className="text-xs text-white/50 uppercase tracking-wider mb-1.5 block">
        {label}{required && <span className="text-brand-red ml-0.5">*</span>}
      </label>
      {children}
    </div>
  )
}

export default function CheckoutPage() {
  const { items, getSubtotal, getDiscount, hasCustomItem, clearCart, coupon } = useCartStore()
  const { user, isAuthenticated } = useAuthStore()
  const router = useRouter()

  const [step, setStep] = useState<Step>('identity')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [savedAddresses, setSavedAddresses] = useState<Array<{
    id: string; label: string; street: string; number: string; district: string; city: string; state: string; zipCode: string; isDefault: boolean
  }>>([])
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null)
  const [useNewAddress, setUseNewAddress] = useState(false)

  const [identity, setIdentity] = useState<IdentityData>({
    name: user?.name ?? '',
    email: user?.email ?? '',
    cpf: (user as any)?.cpf ?? '',
    phone: user?.phone ?? '',
  })

  const [address, setAddress] = useState<AddressData>({
    zipCode: '', street: '', number: '', complement: '',
    district: '', city: '', state: 'SP', label: 'Casa',
  })

  const [shipping, setShipping] = useState<ShippingData | null>(null)

  const subtotal  = getSubtotal()
  const discount  = getDiscount()

  // Redirect if cart is empty
  useEffect(() => {
    if (items.length === 0) router.push('/')
  }, [items.length, router])

  // Pre-fill identity from auth
  useEffect(() => {
    if (user) {
      setIdentity(prev => ({
        ...prev,
        name: prev.name || user.name,
        email: prev.email || user.email,
        phone: prev.phone || user.phone || '',
        cpf: prev.cpf || (user as any).cpf || '',
      }))
    }
  }, [user])

  // Load saved addresses if logged in
  useEffect(() => {
    if (isAuthenticated) {
      fetch('/api/customer/addresses')
        .then(r => r.json())
        .then(data => {
          if (Array.isArray(data) && data.length > 0) {
            setSavedAddresses(data)
            const def = data.find(a => a.isDefault) ?? data[0]
            setSelectedAddressId(def.id)
          } else {
            setUseNewAddress(true)
          }
        })
        .catch(() => setUseNewAddress(true))
    } else {
      setUseNewAddress(true)
    }
  }, [isAuthenticated])

  // Load shipping when address changes
  async function loadShipping() {
    try {
      const res = await fetch('/api/shipping/calculate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subtotal, hasCustomItem: hasCustomItem() }),
      })
      const data = await res.json()
      setShipping(data)
    } catch {
      setShipping({ cost: 19.9, isFree: false, productionDays: 7, estimatedDeliveryDays: 12 })
    }
  }

  function goToStep(s: Step) {
    setError('')
    setStep(s)
  }

  function handleIdentityNext() {
    if (!identity.name || !identity.email) { setError('Nome e e-mail são obrigatórios.'); return }
    goToStep('address')
  }

  async function handleAddressNext() {
    // Validate
    if (useNewAddress || !selectedAddressId) {
      if (!address.zipCode || !address.street || !address.number || !address.district || !address.city || !address.state) {
        setError('Preencha todos os campos obrigatórios do endereço.')
        return
      }
    }
    setError('')
    await loadShipping()
    goToStep('shipping')
  }

  function handleShippingNext() {
    goToStep('review')
  }

  async function handleSubmit() {
    setSubmitting(true)
    setError('')

    try {
      const selectedAddr = selectedAddressId && !useNewAddress
        ? savedAddresses.find(a => a.id === selectedAddressId)
        : null

      const payload = {
        items: items.map(item => ({
          productId: item.customization?.isCustomShirt ? null : (item.product.id.startsWith('custom-') ? null : item.product.id),
          shirtBaseId: item.customization?.baseId ?? null,
          shirtBaseName: item.customization?.baseName ?? null,
          stampId: item.customization?.stampId ?? null,
          stampName: item.customization?.stampName ?? null,
          stampSlug: item.customization?.stampSlug ?? null,
          isCustomShirt: item.customization?.isCustomShirt ?? false,
          previewImage: item.customization?.previewImageUrl ?? null,
          colorName: item.selectedColor.name,
          colorHex: item.selectedColor.hex,
          size: item.selectedSize.label,
          quantity: item.quantity,
          productName: item.product.name,
          productImage: item.product.imageUrl ?? item.product.images?.[0]?.url ?? null,
        })),
        couponCode: coupon?.code ?? null,
        // Address
        addressId: selectedAddr?.id ?? null,
        guestName: identity.name,
        guestEmail: identity.email,
        guestPhone: identity.phone || null,
        guestCpf: identity.cpf || null,
        guestZipCode: selectedAddr ? selectedAddr.zipCode : address.zipCode,
        guestStreet: selectedAddr ? selectedAddr.street : address.street,
        guestNumber: selectedAddr ? selectedAddr.number : address.number,
        guestComplement: address.complement || null,
        guestDistrict: selectedAddr ? selectedAddr.district : address.district,
        guestCity: selectedAddr ? selectedAddr.city : address.city,
        guestState: selectedAddr ? selectedAddr.state : address.state,
      }

      const res = await fetch('/api/checkout/mercadopago', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const data = await res.json()

      if (!res.ok) {
        setError(data.error ?? 'Erro ao criar pedido.')
        setSubmitting(false)
        return
      }

      // Limpar carrinho e redirecionar para o Mercado Pago
      clearCart()
      window.location.href = data.checkoutUrl
    } catch {
      setError('Erro de conexão. Tente novamente.')
      setSubmitting(false)
    }
  }

  const stepIndex = STEPS.findIndex(s => s.id === step)
  const total = subtotal + (shipping?.cost ?? 0) - discount

  return (
    <div className="min-h-screen bg-brand-black">
      <div className="container-brand py-10 max-w-5xl">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>

          <div className="mb-8">
            <span className="text-brand-red text-xs font-bold uppercase tracking-[0.3em]">Finalizar compra</span>
            <h1 className="heading-display text-[clamp(2.5rem,5vw,4rem)] text-brand-white mt-1">CHECKOUT</h1>
          </div>

          {/* Steps indicator */}
          <div className="flex items-center gap-0 mb-10 overflow-x-auto pb-2">
            {STEPS.map((s, i) => {
              const done = i < stepIndex
              const active = s.id === step
              return (
                <div key={s.id} className="flex items-center flex-shrink-0">
                  <button
                    onClick={() => done ? goToStep(s.id) : undefined}
                    className={`flex items-center gap-2 px-3 py-2 text-xs font-bold uppercase tracking-wider transition-colors ${
                      active ? 'text-brand-white bg-brand-red cursor-default' :
                      done ? 'text-brand-red cursor-pointer hover:text-brand-white' :
                      'text-brand-gray-text cursor-default'
                    }`}
                  >
                    <span className={`w-5 h-5 rounded-full border flex items-center justify-center text-[10px] flex-shrink-0 ${
                      active ? 'border-white bg-white/10' :
                      done ? 'border-brand-red' :
                      'border-white/20'
                    }`}>
                      {done ? <Check size={10} /> : i + 1}
                    </span>
                    <span className="hidden sm:block">{s.label}</span>
                  </button>
                  {i < STEPS.length - 1 && (
                    <ChevronRight size={14} className="text-brand-gray-text/40 mx-1 flex-shrink-0" />
                  )}
                </div>
              )
            })}
          </div>

          {/* Error banner */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-2 bg-red-500/10 border border-red-500/30 text-red-400 text-sm px-4 py-3 mb-6"
            >
              <AlertCircle size={16} className="flex-shrink-0" />
              {error}
            </motion.div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Form */}
            <div className="lg:col-span-2">
              <AnimatePresence mode="wait">

                {/* STEP 1: Identity */}
                {step === 'identity' && (
                  <motion.div key="identity" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }} className="space-y-5">
                    <h2 className="text-sm font-bold uppercase tracking-wider text-brand-white border-b border-white/5 pb-3">
                      Suas informações
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="sm:col-span-2">
                        <Field label="Nome completo" required>
                          <input value={identity.name} onChange={e => setIdentity(p => ({ ...p, name: e.target.value }))} placeholder="Seu nome" className={INPUT} required />
                        </Field>
                      </div>
                      <div className="sm:col-span-2">
                        <Field label="E-mail" required>
                          <input type="email" value={identity.email} onChange={e => setIdentity(p => ({ ...p, email: e.target.value }))} placeholder="seu@email.com" className={INPUT} required />
                        </Field>
                      </div>
                      <Field label="CPF">
                        <input value={identity.cpf} onChange={e => setIdentity(p => ({ ...p, cpf: e.target.value }))} placeholder="000.000.000-00" className={INPUT} />
                      </Field>
                      <Field label="Telefone / WhatsApp">
                        <input type="tel" value={identity.phone} onChange={e => setIdentity(p => ({ ...p, phone: e.target.value }))} placeholder="(11) 99999-9999" className={INPUT} />
                      </Field>
                    </div>
                    {!isAuthenticated && (
                      <p className="text-xs text-brand-gray-text bg-white/5 p-3">
                        Tem conta?{' '}
                        <Link href="/login" className="text-brand-red hover:text-brand-white transition-colors font-semibold">
                          Entre agora
                        </Link>{' '}
                        para ter acesso ao histórico de pedidos e endereços salvos.
                      </p>
                    )}
                    <button onClick={handleIdentityNext} className="btn-primary w-full justify-center group">
                      Continuar para Endereço
                      <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
                    </button>
                  </motion.div>
                )}

                {/* STEP 2: Address */}
                {step === 'address' && (
                  <motion.div key="address" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }} className="space-y-5">
                    <h2 className="text-sm font-bold uppercase tracking-wider text-brand-white border-b border-white/5 pb-3">
                      Endereço de Entrega
                    </h2>

                    {/* Saved addresses */}
                    {savedAddresses.length > 0 && (
                      <div className="space-y-2">
                        {savedAddresses.map(addr => (
                          <button
                            key={addr.id}
                            onClick={() => { setSelectedAddressId(addr.id); setUseNewAddress(false) }}
                            className={`w-full text-left p-4 border transition-all cursor-pointer ${
                              selectedAddressId === addr.id && !useNewAddress
                                ? 'border-brand-red bg-brand-red/5'
                                : 'border-white/10 hover:border-white/20'
                            }`}
                          >
                            <div className="flex items-start justify-between">
                              <div>
                                <p className="text-sm font-semibold text-brand-white">{addr.label}</p>
                                <p className="text-xs text-brand-gray-text mt-0.5">
                                  {addr.street}, {addr.number} – {addr.district}, {addr.city}/{addr.state}
                                </p>
                                <p className="text-xs text-brand-gray-text">CEP: {addr.zipCode}</p>
                              </div>
                              <div className={`w-4 h-4 rounded-full border-2 mt-0.5 flex-shrink-0 transition-colors ${
                                selectedAddressId === addr.id && !useNewAddress ? 'border-brand-red bg-brand-red' : 'border-white/20'
                              }`} />
                            </div>
                          </button>
                        ))}

                        <button
                          onClick={() => { setUseNewAddress(true); setSelectedAddressId(null) }}
                          className={`w-full text-left p-4 border transition-all cursor-pointer ${
                            useNewAddress ? 'border-brand-red bg-brand-red/5' : 'border-white/10 hover:border-white/20'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <p className="text-sm font-semibold text-brand-white">+ Novo endereço</p>
                            <div className={`w-4 h-4 rounded-full border-2 flex-shrink-0 transition-colors ${
                              useNewAddress ? 'border-brand-red bg-brand-red' : 'border-white/20'
                            }`} />
                          </div>
                        </button>
                      </div>
                    )}

                    {/* New address form */}
                    {(useNewAddress || savedAddresses.length === 0) && (
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Field label="Label (Casa, Trabalho...)" >
                            <input value={address.label} onChange={e => setAddress(p => ({ ...p, label: e.target.value }))} placeholder="Casa" className={INPUT} />
                          </Field>
                        </div>
                        <div>
                          <Field label="CEP" required>
                            <input value={address.zipCode} onChange={e => setAddress(p => ({ ...p, zipCode: e.target.value }))} placeholder="00000-000" className={INPUT} />
                          </Field>
                        </div>
                        <div className="col-span-2">
                          <Field label="Rua / Avenida" required>
                            <input value={address.street} onChange={e => setAddress(p => ({ ...p, street: e.target.value }))} placeholder="Nome da rua" className={INPUT} />
                          </Field>
                        </div>
                        <Field label="Número" required>
                          <input value={address.number} onChange={e => setAddress(p => ({ ...p, number: e.target.value }))} placeholder="Nº" className={INPUT} />
                        </Field>
                        <Field label="Complemento">
                          <input value={address.complement} onChange={e => setAddress(p => ({ ...p, complement: e.target.value }))} placeholder="Apto, sala..." className={INPUT} />
                        </Field>
                        <Field label="Bairro" required>
                          <input value={address.district} onChange={e => setAddress(p => ({ ...p, district: e.target.value }))} placeholder="Bairro" className={INPUT} />
                        </Field>
                        <Field label="Cidade" required>
                          <input value={address.city} onChange={e => setAddress(p => ({ ...p, city: e.target.value }))} placeholder="Cidade" className={INPUT} />
                        </Field>
                        <div className="col-span-2">
                          <Field label="Estado" required>
                            <select value={address.state} onChange={e => setAddress(p => ({ ...p, state: e.target.value }))} className={INPUT}>
                              {STATES.map(s => <option key={s} value={s}>{s}</option>)}
                            </select>
                          </Field>
                        </div>

                        {/* Save address option */}
                        {isAuthenticated && (
                          <div className="col-span-2 flex items-center gap-2">
                            <input type="checkbox" id="save-addr" className="cursor-pointer" />
                            <label htmlFor="save-addr" className="text-sm text-brand-gray-text cursor-pointer">
                              Salvar este endereço na minha conta
                            </label>
                          </div>
                        )}
                      </div>
                    )}

                    <div className="flex gap-3 pt-2">
                      <button onClick={() => goToStep('identity')} className="btn-secondary flex-1 justify-center">Voltar</button>
                      <button onClick={handleAddressNext} className="btn-primary flex-1 justify-center group">
                        Calcular Frete
                        <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
                      </button>
                    </div>
                  </motion.div>
                )}

                {/* STEP 3: Shipping */}
                {step === 'shipping' && (
                  <motion.div key="shipping" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }} className="space-y-5">
                    <h2 className="text-sm font-bold uppercase tracking-wider text-brand-white border-b border-white/5 pb-3">
                      Forma de Entrega
                    </h2>

                    {shipping && (
                      <div className={`p-5 border flex items-start gap-4 ${shipping.isFree ? 'border-green-400/30 bg-green-400/5' : 'border-brand-red/30 bg-brand-red/5'}`}>
                        <Truck size={20} className={shipping.isFree ? 'text-green-400 mt-0.5' : 'text-brand-red mt-0.5'} />
                        <div className="flex-1">
                          <p className="font-bold text-brand-white">
                            {shipping.isFree ? 'Frete Grátis' : `Frete Fixo – ${formatPrice(shipping.cost)}`}
                          </p>
                          <p className="text-xs text-brand-gray-text mt-1">
                            Produção: ~{shipping.productionDays} dias úteis · Envio: +5 dias úteis
                          </p>
                          <p className="text-xs text-brand-gray-text">
                            Estimativa total: ~{shipping.estimatedDeliveryDays} dias úteis após confirmação do pagamento
                          </p>
                        </div>
                        <p className={`text-lg font-bold flex-shrink-0 ${shipping.isFree ? 'text-green-400' : 'text-brand-white'}`}>
                          {shipping.isFree ? 'Grátis' : formatPrice(shipping.cost)}
                        </p>
                      </div>
                    )}

                    <div className="bg-brand-graphite/50 border border-white/5 p-4">
                      <p className="text-xs font-bold text-white/50 uppercase tracking-wider mb-3">Forma de Pagamento</p>
                      <div className="flex items-center gap-3 p-4 border border-[#009ee3]/20 bg-[#009ee3]/5">
                        <CreditCard size={20} className="text-[#009ee3] flex-shrink-0" />
                        <div>
                          <p className="text-sm font-bold text-brand-white">Mercado Pago</p>
                          <p className="text-xs text-brand-gray-text">PIX · Cartão de crédito · Boleto · e muito mais</p>
                        </div>
                      </div>
                      <p className="text-xs text-brand-gray-text/60 mt-3">
                        Você será redirecionado para o ambiente seguro do Mercado Pago para concluir o pagamento.
                      </p>
                    </div>

                    <div className="flex items-center gap-2 text-xs text-brand-gray-text bg-white/5 border border-white/5 p-3">
                      <Lock size={14} className="text-green-400 flex-shrink-0" />
                      Seus dados são protegidos com criptografia SSL
                    </div>

                    <div className="flex gap-3 pt-2">
                      <button onClick={() => goToStep('address')} className="btn-secondary flex-1 justify-center">Voltar</button>
                      <button onClick={handleShippingNext} className="btn-primary flex-1 justify-center group">
                        Revisar Pedido
                        <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
                      </button>
                    </div>
                  </motion.div>
                )}

                {/* STEP 4: Review */}
                {step === 'review' && (
                  <motion.div key="review" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }} className="space-y-5">
                    <h2 className="text-sm font-bold uppercase tracking-wider text-brand-white border-b border-white/5 pb-3">
                      Revisão Final
                    </h2>

                    {/* Identity summary */}
                    <div className="bg-brand-graphite/50 border border-white/5 p-4">
                      <p className="text-xs font-bold text-white/50 uppercase tracking-wider mb-2">Comprador</p>
                      <p className="text-sm text-brand-white font-semibold">{identity.name}</p>
                      <p className="text-xs text-brand-gray-text">{identity.email}</p>
                      {identity.phone && <p className="text-xs text-brand-gray-text">{identity.phone}</p>}
                    </div>

                    {/* Address summary */}
                    <div className="bg-brand-graphite/50 border border-white/5 p-4">
                      <p className="text-xs font-bold text-white/50 uppercase tracking-wider mb-2">Endereço de Entrega</p>
                      {(() => {
                        const addr = selectedAddressId && !useNewAddress
                          ? savedAddresses.find(a => a.id === selectedAddressId)
                          : null
                        const a = addr ?? (address as unknown as typeof addr)
                        if (!a) return null
                        return (
                          <>
                            <p className="text-sm text-brand-white">{a.street}, {a.number}</p>
                            <p className="text-xs text-brand-gray-text">{a.district} – {a.city}/{a.state}</p>
                            <p className="text-xs text-brand-gray-text">CEP {a.zipCode}</p>
                          </>
                        )
                      })()}
                    </div>

                    {/* Items */}
                    <div className="bg-brand-graphite/50 border border-white/5 p-4 space-y-3">
                      <p className="text-xs font-bold text-white/50 uppercase tracking-wider mb-3">Itens do Pedido</p>
                      {items.map(item => {
                        const imgSrc = item.customization?.previewImageUrl
                          ?? item.product.imageUrl
                          ?? item.product.images?.[0]?.url
                          ?? null
                        return (
                          <div key={`${item.product.id}-${item.selectedColor.name}-${item.selectedSize.label}`} className="flex items-center gap-3 text-sm">
                            <div
                              className="w-12 h-14 flex-shrink-0 overflow-hidden bg-black/30 flex items-center justify-center"
                              style={{ backgroundColor: imgSrc ? undefined : `${item.selectedColor.hex}33` }}
                            >
                              {imgSrc ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img src={imgSrc} alt={item.product.name} className="w-full h-full object-cover" />
                              ) : (
                                <svg viewBox="0 0 100 100" className="w-7 h-7 opacity-20" fill="#fff">
                                  <path d="M30 15 L10 30 L25 35 L20 85 L80 85 L75 35 L90 30 L70 15 L60 22 Q50 28 40 22 Z" />
                                </svg>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <span className="text-brand-white font-semibold block truncate">{item.product.name}</span>
                              <span className="text-brand-gray-text text-xs">
                                {item.selectedColor.name} · {item.selectedSize.label} · ×{item.quantity}
                              </span>
                              {item.customization?.stampName && (
                                <span className="text-brand-red/70 text-[10px] block">Estampa: {item.customization.stampName}</span>
                              )}
                            </div>
                            <span className="text-brand-white font-bold flex-shrink-0">
                              {formatPrice(item.product.price * item.quantity)}
                            </span>
                          </div>
                        )
                      })}
                    </div>

                    <div className="flex gap-3 pt-2">
                      <button onClick={() => goToStep('shipping')} className="btn-secondary flex-1 justify-center">Voltar</button>
                      <button
                        onClick={handleSubmit}
                        disabled={submitting}
                        className="btn-primary flex-1 justify-center group disabled:opacity-60"
                      >
                        {submitting ? (
                          <><Loader2 size={16} className="animate-spin" /> Redirecionando...</>
                        ) : (
                          <><ShoppingBag size={16} /> Pagar com Mercado Pago</>
                        )}
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Order summary sidebar */}
            <div>
              <div className="bg-brand-graphite border border-white/5 p-5 sticky top-24">
                <h2 className="text-sm font-bold uppercase tracking-wider text-brand-white mb-4">Resumo</h2>

                {/* Item thumbnails */}
                <div className="space-y-2 mb-4 max-h-56 overflow-y-auto">
                  {items.map(item => {
                    const imgSrc = item.customization?.previewImageUrl
                      ?? item.product.imageUrl
                      ?? item.product.images?.[0]?.url
                      ?? null
                    return (
                      <div key={`${item.product.id}-${item.selectedColor.name}-${item.selectedSize.label}`} className="flex items-center gap-2 text-xs">
                        <div
                          className="w-10 h-12 flex-shrink-0 overflow-hidden flex items-center justify-center"
                          style={{ backgroundColor: imgSrc ? undefined : `${item.selectedColor.hex}33` }}
                        >
                          {imgSrc ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={imgSrc} alt={item.product.name} className="w-full h-full object-cover" />
                          ) : (
                            <svg viewBox="0 0 100 100" className="w-6 h-6 opacity-20" fill="#fff">
                              <path d="M30 15 L10 30 L25 35 L20 85 L80 85 L75 35 L90 30 L70 15 L60 22 Q50 28 40 22 Z" />
                            </svg>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-brand-white truncate">{item.product.name}</p>
                          <p className="text-brand-gray-text">{item.selectedColor.name} · {item.selectedSize.label} × {item.quantity}</p>
                        </div>
                        <span className="text-brand-white font-semibold flex-shrink-0">{formatPrice(item.product.price * item.quantity)}</span>
                      </div>
                    )
                  })}
                </div>

                <div className="space-y-2 text-sm mb-4 border-t border-white/5 pt-3">
                  <div className="flex justify-between">
                    <span className="text-brand-gray-text">Subtotal</span>
                    <span className="text-brand-white">{formatPrice(subtotal)}</span>
                  </div>
                  {coupon && discount > 0 && (
                    <div className="flex justify-between">
                      <span className="text-green-400">Cupom {coupon.code} ({coupon.discountPct}%)</span>
                      <span className="text-green-400">- {formatPrice(discount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-brand-gray-text">Frete</span>
                    <span className={shipping?.isFree ? 'text-green-400' : 'text-brand-white'}>
                      {shipping
                        ? shipping.isFree ? 'Grátis' : formatPrice(shipping.cost)
                        : '–'
                      }
                    </span>
                  </div>
                </div>
                <div className="border-t border-white/5 pt-3 flex justify-between font-bold">
                  <span className="text-brand-white">Total</span>
                  <span className="heading-display text-xl text-brand-white">{formatPrice(total)}</span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
