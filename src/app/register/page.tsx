'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

function BruskLogo() {
  return (
    <div className="flex items-center justify-center gap-2.5 mb-8">
      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white font-bold text-base shadow-lg shadow-blue-500/20">B</div>
      <span className="text-white font-bold text-2xl tracking-tight">BRUSK<span className="text-blue-400">APP</span></span>
    </div>
  )
}

export default function RegisterPage() {
  const router = useRouter()
  const [businessName, setBusinessName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const handleRegister = async () => {
    setLoading(true); setError(''); setSuccess('')
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ businessName, email, password }),
      })
      if (res.ok) {
        const d = await res.json()
        setSuccess('Hesabiniz olusturuldu!')
        setTimeout(() => router.push('/login'), 2000)
        return
      }
      const txt = await res.text()
      let msg = ''
      if (res.status === 429) msg = 'Cok fazla istek. Lutfen bekleyin.'
      else if (res.status >= 500) msg = 'Sunucu hatasi.'
      else { try { const j = JSON.parse(txt); msg = j.message ? (Array.isArray(j.message) ? j.message[0] : j.message) : j.error || 'Hata' } catch { msg = 'Hata' } }
      setError(msg)
    } catch { setError('Baglanti hatasi') }
    finally { setLoading(false) }
  }

  return (
    <div className="min-h-screen bg-[#020408] flex items-center justify-center p-4">
      <div className="relative w-full max-w-md">
        <div className="absolute -top-20 -left-20 w-40 h-40 bg-blue-500/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-20 -right-20 w-40 h-40 bg-blue-500/10 rounded-full blur-3xl" />
        <div className="relative bg-[#0d1117]/90 backdrop-blur-xl border border-[#1a2332] rounded-2xl p-8 shadow-2xl">
          <BruskLogo />
          <h2 className="text-lg font-semibold text-white mb-2 text-center">Hesap Olustur</h2>
          <p className="text-sm text-gray-500 mb-6 text-center">Isletmeniz icin ucretsiz hesap acin</p>
          <div className="space-y-4">
            <div>
              <label className="text-xs text-gray-500 block mb-1.5">Firma Adi</label>
              <input type="text" value={businessName} onChange={(e) => setBusinessName(e.target.value)} placeholder="Isletme adiniz" className="w-full bg-[#080b12]/80 border border-[#1a2332] rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-blue-500/50 placeholder-gray-600 transition-all" autoFocus />
            </div>
            <div>
              <label className="text-xs text-gray-500 block mb-1.5">E-posta</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="ornek@email.com" className="w-full bg-[#080b12]/80 border border-[#1a2332] rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-blue-500/50 placeholder-gray-600 transition-all" />
            </div>
            <div>
              <label className="text-xs text-gray-500 block mb-1.5">Parola</label>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="En az 6 karakter" onKeyDown={(e) => e.key === 'Enter' && handleRegister()} className="w-full bg-[#080b12]/80 border border-[#1a2332] rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-blue-500/50 placeholder-gray-600 transition-all" />
            </div>
            {error && <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3"><p className="text-red-400 text-xs">{error}</p></div>}
            {success && <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl px-4 py-3"><p className="text-emerald-400 text-xs">{success}</p></div>}
            <button onClick={handleRegister} disabled={loading || !businessName || !email || !password} className="w-full py-2.5 bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-xl text-sm font-medium hover:shadow-lg hover:shadow-blue-500/25 transition-all disabled:opacity-50">{loading ? 'Olusturuluyor...' : 'Hesap Olustur'}</button>
            <p className="text-xs text-gray-600 text-center">Zaten hesabiniz var mi? <a href="/brk-mgmt/login" className="text-blue-400 hover:text-blue-300">Giris Yap</a></p>
          </div>
        </div>
      </div>
    </div>
  )
}