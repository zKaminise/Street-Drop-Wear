'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Eye, EyeOff, Lock, Mail } from 'lucide-react'

export default function AdminLoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await fetch('/api/admin/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })
      if (!res.ok) {
        const data = await res.json()
        setError(data.error || 'Erro ao fazer login')
        return
      }
      router.push('/admin/dashboard')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#0B0B0D] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-black tracking-widest text-white uppercase" style={{ fontFamily: 'var(--font-bebas, sans-serif)' }}>
            STREET<span className="text-[#E10600]">DROP</span>
          </h1>
          <p className="text-white/40 text-sm mt-1 tracking-widest uppercase">Painel Administrativo</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-[#161616] border border-white/5 p-8 space-y-5">
          <div>
            <label className="text-xs text-white/50 uppercase tracking-wider mb-1.5 block">E-mail</label>
            <div className="relative">
              <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                placeholder="admin@streetdropwear.com"
                className="w-full bg-black/40 border border-white/10 text-white placeholder-white/20 pl-9 pr-4 py-3 text-sm focus:outline-none focus:border-[#E10600]/60"
              />
            </div>
          </div>

          <div>
            <label className="text-xs text-white/50 uppercase tracking-wider mb-1.5 block">Senha</label>
            <div className="relative">
              <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
              <input
                type={showPw ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                placeholder="••••••••"
                className="w-full bg-black/40 border border-white/10 text-white placeholder-white/20 pl-9 pr-10 py-3 text-sm focus:outline-none focus:border-[#E10600]/60"
              />
              <button
                type="button"
                onClick={() => setShowPw(v => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 cursor-pointer"
              >
                {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {error && (
            <p className="text-red-400 text-sm bg-red-400/10 border border-red-400/20 px-3 py-2">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#E10600] hover:bg-[#B80000] text-white font-bold uppercase tracking-widest py-3 text-sm transition-colors disabled:opacity-60 cursor-pointer"
          >
            {loading ? 'Entrando...' : 'Entrar'}
          </button>
        </form>

        <p className="text-center text-white/20 text-xs mt-6">
          Acesso restrito a administradores
        </p>
      </div>
    </div>
  )
}
