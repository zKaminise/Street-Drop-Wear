'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Eye, EyeOff, User, Mail, Lock, Phone, ArrowRight, AlertCircle } from 'lucide-react'
import { useAuthStore } from '@/lib/store'

export default function LoginPage() {
  const [mode, setMode] = useState<'login' | 'register'>('login')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Login
  const [loginEmail, setLoginEmail] = useState('')
  const [loginPassword, setLoginPassword] = useState('')

  // Register
  const [regName, setRegName] = useState('')
  const [regEmail, setRegEmail] = useState('')
  const [regPhone, setRegPhone] = useState('')
  const [regPassword, setRegPassword] = useState('')
  const [regConfirm, setRegConfirm] = useState('')

  const router = useRouter()
  const login = useAuthStore(s => s.login)

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: loginEmail, password: loginPassword }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error ?? 'Erro ao fazer login.'); return }
      login({
        id: data.id,
        name: data.name,
        email: data.email,
        phone: data.phone ?? undefined,
        cpf: data.cpf ?? undefined,
        createdAt: data.createdAt,
      })
      router.push('/conta')
    } catch {
      setError('Erro de conexão. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    if (regPassword !== regConfirm) { setError('As senhas não conferem.'); return }
    if (regPassword.length < 6) { setError('A senha deve ter no mínimo 6 caracteres.'); return }
    setLoading(true)
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: regName, email: regEmail, phone: regPhone, password: regPassword }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error ?? 'Erro ao criar conta.'); return }
      login({
        id: data.id,
        name: data.name,
        email: data.email,
        phone: data.phone ?? undefined,
        createdAt: data.createdAt,
      })
      router.push('/conta')
    } catch {
      setError('Erro de conexão. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-brand-black flex items-center justify-center px-4 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-radial from-brand-red/5 via-transparent to-transparent" />
      <div
        className="absolute inset-0 opacity-[0.025]"
        style={{
          backgroundImage: 'linear-gradient(rgba(225,6,0,0.4) 1px, transparent 1px), linear-gradient(90deg, rgba(225,6,0,0.4) 1px, transparent 1px)',
          backgroundSize: '50px 50px',
        }}
      />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md relative z-10"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/">
            <span className="heading-display text-4xl text-brand-white">
              STREET<span className="text-brand-red">DROP</span>
            </span>
            <p className="text-[9px] text-brand-gray-text uppercase tracking-[0.4em] mt-1">WEAR</p>
          </Link>
        </div>

        {/* Toggle */}
        <div className="flex mb-6 border border-white/10">
          {(['login', 'register'] as const).map(m => (
            <button
              key={m}
              onClick={() => { setMode(m); setError('') }}
              className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer ${
                mode === m ? 'bg-brand-red text-brand-white' : 'text-brand-gray-text hover:text-brand-white'
              }`}
            >
              {m === 'login' ? 'Entrar' : 'Criar Conta'}
            </button>
          ))}
        </div>

        {/* Error */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-2 bg-red-500/10 border border-red-500/30 text-red-400 text-sm px-4 py-3 mb-4"
          >
            <AlertCircle size={16} className="flex-shrink-0" />
            {error}
          </motion.div>
        )}

        <div className="bg-brand-graphite border border-white/5 p-8">
          <AnimatePresence mode="wait">
            {mode === 'login' ? (
              <motion.form
                key="login"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                onSubmit={handleLogin}
                className="space-y-4"
              >
                <div>
                  <label className="label-brand" htmlFor="login-email">E-mail</label>
                  <div className="relative">
                    <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-gray-text pointer-events-none" />
                    <input
                      id="login-email"
                      type="email"
                      value={loginEmail}
                      onChange={e => setLoginEmail(e.target.value)}
                      placeholder="seu@email.com"
                      className="input-brand pl-9"
                      required
                      autoComplete="email"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="label-brand mb-0" htmlFor="login-password">Senha</label>
                  </div>
                  <div className="relative">
                    <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-gray-text pointer-events-none" />
                    <input
                      id="login-password"
                      type={showPassword ? 'text' : 'password'}
                      value={loginPassword}
                      onChange={e => setLoginPassword(e.target.value)}
                      placeholder="••••••••"
                      className="input-brand pl-9 pr-10"
                      required
                      autoComplete="current-password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(s => !s)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-brand-gray-text hover:text-brand-white transition-colors cursor-pointer"
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary w-full justify-center mt-2 group disabled:opacity-60"
                >
                  {loading ? 'Entrando...' : 'Entrar na Conta'}
                  {!loading && <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />}
                </button>
              </motion.form>
            ) : (
              <motion.form
                key="register"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                onSubmit={handleRegister}
                className="space-y-4"
              >
                <div>
                  <label className="label-brand" htmlFor="reg-name">Nome completo</label>
                  <div className="relative">
                    <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-gray-text pointer-events-none" />
                    <input
                      id="reg-name"
                      type="text"
                      value={regName}
                      onChange={e => setRegName(e.target.value)}
                      placeholder="Seu nome"
                      className="input-brand pl-9"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="label-brand" htmlFor="reg-phone">Telefone / WhatsApp</label>
                  <div className="relative">
                    <Phone size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-gray-text pointer-events-none" />
                    <input
                      id="reg-phone"
                      type="tel"
                      value={regPhone}
                      onChange={e => setRegPhone(e.target.value)}
                      placeholder="(11) 99999-9999"
                      className="input-brand pl-9"
                    />
                  </div>
                </div>

                <div>
                  <label className="label-brand" htmlFor="reg-email">E-mail</label>
                  <div className="relative">
                    <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-gray-text pointer-events-none" />
                    <input
                      id="reg-email"
                      type="email"
                      value={regEmail}
                      onChange={e => setRegEmail(e.target.value)}
                      placeholder="seu@email.com"
                      className="input-brand pl-9"
                      required
                      autoComplete="email"
                    />
                  </div>
                </div>

                <div>
                  <label className="label-brand" htmlFor="reg-password">Senha</label>
                  <div className="relative">
                    <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-gray-text pointer-events-none" />
                    <input
                      id="reg-password"
                      type={showPassword ? 'text' : 'password'}
                      value={regPassword}
                      onChange={e => setRegPassword(e.target.value)}
                      placeholder="••••••••"
                      className="input-brand pl-9 pr-10"
                      required
                      minLength={6}
                      autoComplete="new-password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(s => !s)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-brand-gray-text hover:text-brand-white transition-colors cursor-pointer"
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="label-brand" htmlFor="reg-confirm">Confirmar Senha</label>
                  <div className="relative">
                    <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-gray-text pointer-events-none" />
                    <input
                      id="reg-confirm"
                      type={showPassword ? 'text' : 'password'}
                      value={regConfirm}
                      onChange={e => setRegConfirm(e.target.value)}
                      placeholder="••••••••"
                      className="input-brand pl-9"
                      required
                      autoComplete="new-password"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary w-full justify-center mt-2 group disabled:opacity-60"
                >
                  {loading ? 'Criando conta...' : 'Criar Conta Grátis'}
                  {!loading && <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />}
                </button>

                <p className="text-xs text-brand-gray-text text-center pt-1">
                  Ao criar conta você concorda com nossos{' '}
                  <Link href="/sobre" className="text-brand-red hover:text-brand-white transition-colors">
                    Termos de Uso
                  </Link>
                </p>
              </motion.form>
            )}
          </AnimatePresence>
        </div>

        <p className="text-center text-sm text-brand-gray-text mt-6">
          {mode === 'login' ? 'Não tem conta?' : 'Já tem conta?'}{' '}
          <button
            onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setError('') }}
            className="text-brand-red hover:text-brand-white transition-colors font-semibold cursor-pointer"
          >
            {mode === 'login' ? 'Criar conta grátis' : 'Entrar'}
          </button>
        </p>
      </motion.div>
    </div>
  )
}
