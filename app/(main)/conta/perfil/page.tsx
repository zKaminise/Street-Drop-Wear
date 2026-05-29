'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { ChevronRight, Check, AlertCircle, Eye, EyeOff } from 'lucide-react'
import { useAuthStore } from '@/lib/store'

const INPUT = 'w-full bg-black/40 border border-white/10 text-white placeholder-white/20 px-3 py-2.5 text-sm focus:outline-none focus:border-brand-red/60 transition-colors'

export default function PerfilPage() {
  const { isAuthenticated, user, updateUser } = useAuthStore()
  const router = useRouter()

  const [name, setName] = useState(user?.name ?? '')
  const [phone, setPhone] = useState(user?.phone ?? '')
  const [cpf, setCpf] = useState((user as any)?.cpf ?? '')
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    if (!isAuthenticated) router.push('/login')
  }, [isAuthenticated, router])

  if (!isAuthenticated || !user) return null

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (newPassword) {
      if (newPassword !== confirmPassword) { setError('As senhas não conferem.'); return }
      if (newPassword.length < 6) { setError('Nova senha deve ter no mínimo 6 caracteres.'); return }
      if (!currentPassword) { setError('Informe a senha atual.'); return }
    }

    setSaving(true)
    try {
      const res = await fetch('/api/customer/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name || undefined,
          phone: phone || undefined,
          cpf: cpf || undefined,
          currentPassword: currentPassword || undefined,
          newPassword: newPassword || undefined,
        }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error ?? 'Erro ao salvar.'); setSaving(false); return }

      updateUser({ name: data.name, phone: data.phone, email: data.email })
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
      setSuccess('Perfil atualizado com sucesso!')
    } catch {
      setError('Erro de conexão.')
    }
    setSaving(false)
  }

  return (
    <div className="min-h-screen bg-brand-black">
      <div className="container-brand py-10 max-w-xl">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <div className="flex items-center gap-3 text-sm text-brand-gray-text mb-2">
            <Link href="/conta" className="hover:text-brand-white transition-colors">Minha Conta</Link>
            <ChevronRight size={14} />
            <span className="text-brand-white">Perfil</span>
          </div>
          <span className="text-brand-red text-xs font-bold uppercase tracking-[0.3em]">Configurações</span>
          <h1 className="heading-display text-[clamp(2rem,4vw,3rem)] text-brand-white mt-1">MEU PERFIL</h1>
        </motion.div>

        <form onSubmit={handleSave} className="space-y-6">
          {/* Feedback */}
          {error && (
            <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/30 text-red-400 text-sm px-4 py-3">
              <AlertCircle size={16} /> {error}
            </div>
          )}
          {success && (
            <div className="flex items-center gap-2 bg-green-500/10 border border-green-500/30 text-green-400 text-sm px-4 py-3">
              <Check size={16} /> {success}
            </div>
          )}

          {/* Personal data */}
          <div className="bg-brand-graphite border border-white/5 p-6 space-y-4">
            <p className="text-xs font-bold text-white/40 uppercase tracking-wider">Dados Pessoais</p>
            <div>
              <label className="text-xs text-white/50 uppercase tracking-wider mb-1.5 block">Nome completo</label>
              <input value={name} onChange={e => setName(e.target.value)} className={INPUT} placeholder="Seu nome" />
            </div>
            <div>
              <label className="text-xs text-white/50 uppercase tracking-wider mb-1.5 block">E-mail</label>
              <input value={user.email} className={`${INPUT} opacity-50 cursor-not-allowed`} disabled />
              <p className="text-[11px] text-brand-gray-text/60 mt-1">O e-mail não pode ser alterado.</p>
            </div>
            <div>
              <label className="text-xs text-white/50 uppercase tracking-wider mb-1.5 block">WhatsApp / Telefone</label>
              <input type="tel" value={phone} onChange={e => setPhone(e.target.value)} className={INPUT} placeholder="(11) 99999-9999" />
            </div>
            <div>
              <label className="text-xs text-white/50 uppercase tracking-wider mb-1.5 block">CPF</label>
              <input value={cpf} onChange={e => setCpf(e.target.value)} className={INPUT} placeholder="000.000.000-00" />
            </div>
          </div>

          {/* Password change */}
          <div className="bg-brand-graphite border border-white/5 p-6 space-y-4">
            <p className="text-xs font-bold text-white/40 uppercase tracking-wider">Alterar Senha</p>
            <p className="text-xs text-brand-gray-text">Deixe em branco se não quiser alterar a senha.</p>
            <div className="relative">
              <label className="text-xs text-white/50 uppercase tracking-wider mb-1.5 block">Senha atual</label>
              <input
                type={showPw ? 'text' : 'password'}
                value={currentPassword}
                onChange={e => setCurrentPassword(e.target.value)}
                className={`${INPUT} pr-10`}
                placeholder="••••••••"
                autoComplete="current-password"
              />
              <button type="button" onClick={() => setShowPw(s => !s)} className="absolute right-3 bottom-2.5 text-brand-gray-text hover:text-brand-white cursor-pointer">
                {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            <div>
              <label className="text-xs text-white/50 uppercase tracking-wider mb-1.5 block">Nova senha</label>
              <input
                type={showPw ? 'text' : 'password'}
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                className={INPUT}
                placeholder="••••••••"
                autoComplete="new-password"
              />
            </div>
            <div>
              <label className="text-xs text-white/50 uppercase tracking-wider mb-1.5 block">Confirmar nova senha</label>
              <input
                type={showPw ? 'text' : 'password'}
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                className={INPUT}
                placeholder="••••••••"
                autoComplete="new-password"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={saving}
            className="btn-primary w-full justify-center disabled:opacity-60"
          >
            <Check size={16} /> {saving ? 'Salvando...' : 'Salvar Alterações'}
          </button>
        </form>
      </div>
    </div>
  )
}
