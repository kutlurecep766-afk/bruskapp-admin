'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Eye, EyeOff, Shield, KeyRound, ArrowRight } from 'lucide-react'

export default function LoginPage() {
  const router = useRouter()
  const [step, setStep] = useState(0)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [token2fa, setToken2fa] = useState('')
  const [qrCode, setQrCode] = useState('')
  const [secret, setSecret] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [verifyError, setVerifyError] = useState('')
  const [showPw, setShowPw] = useState(false)

  const h = { 'Content-Type': 'application/json' }

  useEffect(() => {
    fetch('/api/auth/status', { credentials: 'include' })
      .then(r => r.json())
      .then(d => {
        if (d.initialSetup) { setStep(1); return }
        if (d.loggedIn) {
          if (d.twoFactorRequired) {
            sessionStorage.setItem('2fa_setup', 'true')
            setStep(3)
          } else { router.push('/') }
          return
        }
        setStep(2)
      })
  }, [router])

  const handleSetup = async () => {
    setLoading(true); setError('')
    try {
      const res = await fetch('/api/auth/setup', { method: 'POST', headers: h, credentials: 'include', body: JSON.stringify({ email, password }) })
      if (res.ok) {
        const d = await res.json()
        setQrCode(d.qrCode); setSecret(d.secret); setStep(0); return
      }
      const txt = await res.text()
      setError(parseError(res.status, txt))
    } catch { setError('Bağlantı hatası') }
    finally { setLoading(false) }
  }

  const handleLogin = async () => {
    setLoading(true); setError('')
    try {
      const res = await fetch('/api/auth/login', { method: 'POST', headers: h, credentials: 'include', body: JSON.stringify({ email, password }) })
      if (res.ok) {
        const d = await res.json()
        if (d.twoFactorRequired) { sessionStorage.setItem('2fa_setup', 'true'); setStep(3); return }
        router.push('/'); return
      }
      if (res.status === 429) { setError('Çok fazla başarısız giriş denemesi. 1 dakika bekleyin.'); return }
      setError(parseError(res.status, await res.text()))
    } catch { setError('Bağlantı hatası') }
    finally { setLoading(false) }
  }

  const handleVerify2fa = async () => {
    setLoading(true); setVerifyError('')
    try {
      const res = await fetch('/api/auth/2fa/verify', { method: 'POST', headers: h, credentials: 'include', body: JSON.stringify({ token: token2fa, email }) })
      if (res.ok) { sessionStorage.setItem('2fa_setup', 'true'); sessionStorage.setItem('2fa_verified', 'true'); router.push('/'); return }
      if (res.status === 429) { setVerifyError('Çok fazla istek. 1 dakika bekleyin.'); return }
      setVerifyError(parseError(res.status, await res.text()))
    } catch { setVerifyError('Bağlantı hatası') }
    finally { setLoading(false) }
  }

  if (step === 1) {
    return (
      <div className="min-h-screen bg-[#020408] flex items-center justify-center p-4">
        <div className="relative w-full max-w-md">
          <div className="absolute -inset-4 bg-gradient-to-br from-blue-500/20 via-purple-500/10 to-transparent rounded-3xl blur-3xl" />
          <div className="relative bg-[#0d1117]/95 backdrop-blur-xl border border-[#1a2332] rounded-3xl p-8 shadow-2xl">
            <div className="flex flex-col items-center mb-8">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/20 mb-4"><Shield size={28} className="text-white" /></div>
              <h2 className="text-lg font-semibold text-white">Admin Kurulumu</h2>
              <p className="text-sm text-gray-500 mt-1">Yönetici hesabınızı oluşturun</p>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-xs text-gray-500 block mb-1.5 font-medium">E-posta</label>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="ornek@email.com" className="w-full bg-[#080b12]/80 border border-[#1a2332] rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20 placeholder-gray-600 transition-all" autoFocus />
              </div>
              <div>
                <label className="text-xs text-gray-500 block mb-1.5 font-medium">Parola</label>
                <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••" className="w-full bg-[#080b12]/80 border border-[#1a2332] rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20 placeholder-gray-600 transition-all" />
              </div>
              {error && <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3"><span className="text-red-400 text-xs">{error}</span></div>}
              <button onClick={handleSetup} disabled={loading || !email || !password} className="w-full py-3 bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-xl text-sm font-semibold hover:shadow-lg hover:shadow-blue-500/25 transition-all duration-300 disabled:opacity-50 flex items-center justify-center gap-2">
                {loading ? 'Kuruluyor...' : 'Admin Oluştur'}<ArrowRight size={16} />
              </button>
            </div>
            {qrCode && (
              <div className="mt-6 p-5 bg-[#080b12]/50 rounded-xl border border-[#1a2332] text-center animate-fadeIn">
                <p className="text-sm text-gray-500 mb-3">Google Authenticator ile taratın</p>
                <div className="flex justify-center mb-3"><img src={qrCode} alt="QR" className="w-44 h-44 rounded-xl bg-white p-2 shadow-lg" /></div>
                <p className="text-xs text-gray-600 mb-3">Yedek kod: <span className="text-blue-400 font-mono select-all text-sm bg-[#080b12] px-2 py-1 rounded">{secret}</span></p>
                <button onClick={() => router.push('/')} className="w-full py-2.5 bg-[#1a2332] text-white rounded-xl text-sm font-medium hover:bg-[#1f2a3a] transition-all">Paneli Aç</button>
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }

  if (step === 3) {
    return (
      <div className="min-h-screen bg-[#020408] flex items-center justify-center p-4">
        <div className="relative w-full max-w-md">
          <div className="absolute -inset-4 bg-gradient-to-br from-blue-500/20 via-purple-500/10 to-transparent rounded-3xl blur-3xl" />
          <div className="relative bg-[#0d1117]/95 backdrop-blur-xl border border-[#1a2332] rounded-3xl p-8 shadow-2xl">
            <div className="flex flex-col items-center mb-8">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center shadow-lg shadow-amber-500/20 mb-4"><KeyRound size={28} className="text-white" /></div>
              <h2 className="text-lg font-semibold text-white">İki Adımlı Doğrulama</h2>
              <p className="text-sm text-gray-500 mt-1 text-center">Google Authenticator uygulamasındaki 6 haneli kodu girin</p>
            </div>
            <div className="space-y-4">
              <div className="flex justify-center">
                <input type="text" value={token2fa} onChange={e => setToken2fa(e.target.value.replace(/\D/g, '').slice(0, 6))} placeholder="000000" className="w-48 text-center text-2xl tracking-[0.3em] bg-[#080b12]/80 border border-[#1a2332] rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20 transition-all font-mono" maxLength={6} inputMode="numeric" autoFocus />
              </div>
              {verifyError && <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3"><span className="text-red-400 text-xs">{verifyError}</span></div>}
              <button onClick={handleVerify2fa} disabled={loading || token2fa.length < 6} className="w-full py-3 bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-xl text-sm font-semibold hover:shadow-lg hover:shadow-blue-500/25 transition-all duration-300 disabled:opacity-50 flex items-center justify-center gap-2">
                {loading ? 'Doğrulanıyor...' : 'Giriş Yap'}<ArrowRight size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#020408] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute top-1/4 -left-20 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 -right-20 w-72 h-72 bg-purple-500/10 rounded-full blur-3xl" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-gradient-to-br from-blue-500/5 via-transparent to-purple-500/5" />
      
      <div className="relative w-full max-w-md">
        <div className="absolute -inset-4 bg-gradient-to-br from-blue-500/20 via-purple-500/10 to-transparent rounded-3xl blur-3xl opacity-70" />
        <div className="relative bg-[#0d1117]/95 backdrop-blur-xl border border-[#1a2332] rounded-3xl p-8 shadow-2xl shadow-black/50">
          {/* Logo */}
          <div className="flex items-center justify-center mb-8">
            <img src="/logo.svg" alt="BRUSKAPP" className="h-16 md:h-20" />
          </div>

          <div className="space-y-5">
            <div>
              <label className="text-xs text-gray-500 block mb-1.5 font-medium">E-posta</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="ornek@bruskapp.com" className="w-full bg-[#080b12]/80 border border-[#1a2332] rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20 placeholder-gray-600 transition-all" autoFocus />
            </div>
            <div>
              <label className="text-xs text-gray-500 block mb-1.5 font-medium">Parola</label>
              <div className="relative">
                <input type={showPw ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••" onKeyDown={e => e.key === 'Enter' && handleLogin()} className="w-full bg-[#080b12]/80 border border-[#1a2332] rounded-xl px-4 py-3 pr-11 text-white text-sm focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20 placeholder-gray-600 transition-all" />
                <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors">
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
            {error && (
              <div className="flex items-start gap-2 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
                <span className="text-red-400 text-xs leading-relaxed">{error}</span>
              </div>
            )}
            <button onClick={handleLogin} disabled={loading || !email || !password}
              className="group relative w-full py-3 bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-xl text-sm font-semibold hover:shadow-lg hover:shadow-blue-500/25 transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] disabled:opacity-50 flex items-center justify-center gap-2 active:scale-[0.98]">
              {loading ? (
                'Giriş yapılıyor...'
              ) : (
                <>Giriş Yap <ArrowRight size={16} className="group-hover:translate-x-0.5 transition-transform" /></>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

function parseError(status: number, body: string): string {
  if (status === 429) return 'Çok fazla istek. Lütfen 1 dakika bekleyin.'
  if (status >= 500) return 'Sunucu hatası. Lütfen tekrar deneyin.'
  try {
    const j = JSON.parse(body)
    if (j.message) return Array.isArray(j.message) ? j.message[0] : j.message
    if (j.error) return j.error
  } catch { }
  return 'Bilinmeyen hata (' + status + ')'
}
