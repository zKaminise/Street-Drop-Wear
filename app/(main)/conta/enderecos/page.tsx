'use client'

import { useCallback, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  ChevronRight,
  MapPin,
  Plus,
  Edit2,
  Trash2,
  Star,
  X,
  Check,
  AlertCircle,
} from 'lucide-react'
import { useAuthStore } from '@/lib/store'

type Address = {
  id: string
  label: string
  zipCode: string
  street: string
  number: string
  complement?: string
  district: string
  city: string
  state: string
  isDefault: boolean
}

const INITIAL: Omit<Address, 'id'> = {
  label: 'Casa',
  zipCode: '',
  street: '',
  number: '',
  complement: '',
  district: '',
  city: '',
  state: 'SP',
  isDefault: false,
}

const STATES = [
  'AC',
  'AL',
  'AM',
  'AP',
  'BA',
  'CE',
  'DF',
  'ES',
  'GO',
  'MA',
  'MG',
  'MS',
  'MT',
  'PA',
  'PB',
  'PE',
  'PI',
  'PR',
  'RJ',
  'RN',
  'RO',
  'RR',
  'RS',
  'SC',
  'SE',
  'SP',
  'TO',
]

const INPUT =
  'w-full bg-black/40 border border-white/10 text-white placeholder-white/20 px-3 py-2 text-sm focus:outline-none focus:border-brand-red/60'

export default function EnderecosPage() {
  const { isAuthenticated } = useAuthStore()
  const router = useRouter()

  const [addresses, setAddresses] = useState<Address[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState<Address | null>(null)
  const [form, setForm] = useState<Omit<Address, 'id'>>({ ...INITIAL })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const load = useCallback(async () => {
    setLoading(true)

    try {
      const response = await fetch('/api/customer/addresses')
      const data = await response.json()

      setAddresses(Array.isArray(data) ? data : [])
    } catch {
      setAddresses([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login')
      return
    }

    load()
  }, [isAuthenticated, router, load])

  function openNew() {
    setEditing(null)
    setForm({ ...INITIAL })
    setError('')
    setShowModal(true)
  }

  function openEdit(address: Address) {
    setEditing(address)

    setForm({
      label: address.label,
      zipCode: address.zipCode,
      street: address.street,
      number: address.number,
      complement: address.complement ?? '',
      district: address.district,
      city: address.city,
      state: address.state,
      isDefault: address.isDefault,
    })

    setError('')
    setShowModal(true)
  }

  async function handleSave() {
    if (!form.zipCode || !form.street || !form.number || !form.district || !form.city) {
      setError('Preencha os campos obrigatÃ³rios.')
      return
    }

    setSaving(true)
    setError('')

    try {
      const url = editing
        ? `/api/customer/addresses/${editing.id}`
        : '/api/customer/addresses'

      const response = await fetch(url, {
        method: editing ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(form),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error ?? 'Erro ao salvar.')
        setSaving(false)
        return
      }

      await load()
      setShowModal(false)
    } catch {
      setError('Erro de conexÃ£o.')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Remover este endereÃ§o?')) return

    await fetch(`/api/customer/addresses/${id}`, {
      method: 'DELETE',
    })

    await load()
  }

  async function setDefault(id: string) {
    await fetch(`/api/customer/addresses/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ isDefault: true }),
    })

    await load()
  }

  return (
    <div className="min-h-screen bg-brand-black">
      <div className="container-brand py-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-3 text-sm text-brand-gray-text mb-2">
            <Link href="/conta" className="hover:text-brand-white transition-colors">
              Minha Conta
            </Link>
            <ChevronRight size={14} />
            <span className="text-brand-white">EndereÃ§os</span>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <span className="text-brand-red text-xs font-bold uppercase tracking-[0.3em]">
                Entrega
              </span>
              <h1 className="heading-display text-[clamp(2rem,4vw,3rem)] text-brand-white mt-1">
                ENDEREÃ‡OS
              </h1>
            </div>

            <button onClick={openNew} className="btn-primary text-sm">
              <Plus size={16} />
              Novo EndereÃ§o
            </button>
          </div>
        </motion.div>

        {loading ? (
          <p className="text-brand-gray-text">Carregando...</p>
        ) : addresses.length === 0 ? (
          <div className="text-center py-20">
            <MapPin
              size={48}
              className="text-brand-gray-text mx-auto mb-4"
              strokeWidth={1}
            />
            <p className="text-brand-gray-text mb-6">Nenhum endereÃ§o cadastrado.</p>
            <button onClick={openNew} className="btn-primary">
              Adicionar endereÃ§o
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {addresses.map((address, index) => (
              <motion.div
                key={address.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.06 }}
                className={`bg-brand-graphite border p-5 flex items-start justify-between gap-4 ${
                  address.isDefault ? 'border-brand-red/30' : 'border-white/5'
                }`}
              >
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  <MapPin size={18} className="text-brand-red mt-0.5 flex-shrink-0" />

                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-sm font-bold text-brand-white uppercase tracking-wide">
                        {address.label}
                      </p>

                      {address.isDefault && (
                        <span className="text-[10px] bg-brand-red/20 text-brand-red border border-brand-red/30 px-2 py-0.5 font-bold uppercase tracking-wider">
                          Principal
                        </span>
                      )}
                    </div>

                    <p className="text-sm text-brand-gray-text mt-0.5">
                      {address.street}, {address.number}
                      {address.complement ? `, ${address.complement}` : ''}
                    </p>

                    <p className="text-xs text-brand-gray-text">
                      {address.district} â€” {address.city}/{address.state} Â· CEP{' '}
                      {address.zipCode}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  {!address.isDefault && (
                    <button
                      onClick={() => setDefault(address.id)}
                      title="Definir como principal"
                      className="p-1.5 text-white/30 hover:text-yellow-400 transition-colors cursor-pointer"
                    >
                      <Star size={14} />
                    </button>
                  )}

                  <button
                    onClick={() => openEdit(address)}
                    className="p-1.5 text-white/30 hover:text-white transition-colors cursor-pointer"
                  >
                    <Edit2 size={14} />
                  </button>

                  <button
                    onClick={() => handleDelete(address.id)}
                    className="p-1.5 text-white/30 hover:text-red-400 transition-colors cursor-pointer"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {showModal && (
          <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-brand-graphite border border-white/10 w-full max-w-md max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between p-5 border-b border-white/10">
                <h2 className="text-white font-bold">
                  {editing ? 'Editar EndereÃ§o' : 'Novo EndereÃ§o'}
                </h2>

                <button
                  onClick={() => setShowModal(false)}
                  className="text-white/40 hover:text-white cursor-pointer"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="p-5 space-y-4">
                {error && (
                  <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/30 text-red-400 text-xs px-3 py-2">
                    <AlertCircle size={14} />
                    {error}
                  </div>
                )}

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-white/50 uppercase tracking-wider mb-1 block">
                      Label
                    </label>
                    <input
                      value={form.label}
                      onChange={(event) =>
                        setForm((previous) => ({
                          ...previous,
                          label: event.target.value,
                        }))
                      }
                      className={INPUT}
                      placeholder="Casa"
                    />
                  </div>

                  <div>
                    <label className="text-xs text-white/50 uppercase tracking-wider mb-1 block">
                      CEP *
                    </label>
                    <input
                      value={form.zipCode}
                      onChange={(event) =>
                        setForm((previous) => ({
                          ...previous,
                          zipCode: event.target.value,
                        }))
                      }
                      className={INPUT}
                      placeholder="00000-000"
                    />
                  </div>

                  <div className="col-span-2">
                    <label className="text-xs text-white/50 uppercase tracking-wider mb-1 block">
                      Rua *
                    </label>
                    <input
                      value={form.street}
                      onChange={(event) =>
                        setForm((previous) => ({
                          ...previous,
                          street: event.target.value,
                        }))
                      }
                      className={INPUT}
                      placeholder="Rua"
                    />
                  </div>

                  <div>
                    <label className="text-xs text-white/50 uppercase tracking-wider mb-1 block">
                      NÃºmero *
                    </label>
                    <input
                      value={form.number}
                      onChange={(event) =>
                        setForm((previous) => ({
                          ...previous,
                          number: event.target.value,
                        }))
                      }
                      className={INPUT}
                      placeholder="123"
                    />
                  </div>

                  <div>
                    <label className="text-xs text-white/50 uppercase tracking-wider mb-1 block">
                      Complemento
                    </label>
                    <input
                      value={form.complement}
                      onChange={(event) =>
                        setForm((previous) => ({
                          ...previous,
                          complement: event.target.value,
                        }))
                      }
                      className={INPUT}
                      placeholder="Apto"
                    />
                  </div>

                  <div>
                    <label className="text-xs text-white/50 uppercase tracking-wider mb-1 block">
                      Bairro *
                    </label>
                    <input
                      value={form.district}
                      onChange={(event) =>
                        setForm((previous) => ({
                          ...previous,
                          district: event.target.value,
                        }))
                      }
                      className={INPUT}
                      placeholder="Bairro"
                    />
                  </div>

                  <div>
                    <label className="text-xs text-white/50 uppercase tracking-wider mb-1 block">
                      Cidade *
                    </label>
                    <input
                      value={form.city}
                      onChange={(event) =>
                        setForm((previous) => ({
                          ...previous,
                          city: event.target.value,
                        }))
                      }
                      className={INPUT}
                      placeholder="Cidade"
                    />
                  </div>

                  <div className="col-span-2">
                    <label className="text-xs text-white/50 uppercase tracking-wider mb-1 block">
                      Estado *
                    </label>
                    <select
                      value={form.state}
                      onChange={(event) =>
                        setForm((previous) => ({
                          ...previous,
                          state: event.target.value,
                        }))
                      }
                      className={INPUT}
                    >
                      {STATES.map((state) => (
                        <option key={state} value={state}>
                          {state}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="col-span-2 flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="is-default"
                      checked={form.isDefault}
                      onChange={(event) =>
                        setForm((previous) => ({
                          ...previous,
                          isDefault: event.target.checked,
                        }))
                      }
                      className="cursor-pointer"
                    />
                    <label
                      htmlFor="is-default"
                      className="text-sm text-white/60 cursor-pointer"
                    >
                      Definir como endereÃ§o principal
                    </label>
                  </div>
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    onClick={() => setShowModal(false)}
                    className="flex-1 border border-white/10 text-white/60 hover:text-white py-2 text-sm transition-colors cursor-pointer"
                  >
                    Cancelar
                  </button>

                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="flex-1 bg-brand-red hover:bg-brand-dark-red text-white py-2 text-sm font-bold transition-colors disabled:opacity-60 cursor-pointer flex items-center justify-center gap-2"
                  >
                    <Check size={16} />
                    {saving ? 'Salvando...' : 'Salvar'}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  )
}
