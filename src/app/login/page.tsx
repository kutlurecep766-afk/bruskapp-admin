'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

function BruskLogo() {
  return (
    <div className="flex items-center justify-center mb-10">
      <img src="/logo.svg" alt="BRUSKAPP" className="h-16 md:h-20" />
    </div>
  )
}

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

  const h = {'Content-Type': 'application/json'}

  useEffect(() => {
    fetch('/api/auth/status', { credentials: 'include' })
      .then(r => r.json())
      .then(d => {
        if (d.initialSetup) { setStep(1); return }
        if (d.loggedIn) {
          if (d.twoFactorRequired) {
            sessionStorage.setItem('2fa_setup', 'true')
            setStep(3)
          } else {
            router.push('/')
          }
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
        setQrCode(d.qrCode)
        setSecret(d.secret)
        setStep(0)
        return
      }
      const txt = await res.text()
      setError(parseError(res.status, txt))
    } catch { setError('Baglanti hatasi') }
    finally { setLoading(false) }
  }

  const handleLogin = async () => {
    setLoading(true); setError('')
    try {
      const res = await fetch('/api/auth/login', { method: 'POST', headers: h, credentials: 'include', body: JSON.stringify({ email, password }) })
      if (res.ok) {
        const d = await res.json()
        if (d.twoFactorRequired) {
          sessionStorage.setItem('2fa_setup', 'true')
          setStep(3)
          return
        }
        router.push('/')
        return
      }
      if (res.status === 429) {
        setError('Cok fazla basarisiz giris denemesi. 1 dakika bekleyin.')
        return
      }
      const txt = await res.text()
      const msg = parseError(res.status, txt)
      setError(msg)
    } catch { setError('Baglanti hatasi') }
    finally { setLoading(false) }
  }

  const handleVerify2fa = async () => {
    setLoading(true); setVerifyError('')
    try {
      const res = await fetch('/api/auth/2fa/verify', { method: 'POST', headers: h, credentials: 'include', body: JSON.stringify({ token: token2fa, email }) })
      if (res.ok) {
        sessionStorage.setItem('2fa_setup', 'true')
        sessionStorage.setItem('2fa_verified', 'true')
        router.push('/')
        return
      }
      if (res.status === 429) {
        setVerifyError('Cok fazla istek. 1 dakika bekleyin.')
        return
      }
      const txt = await res.text()
      setVerifyError(parseError(res.status, txt))
    } catch { setVerifyError('Baglanti hatasi') }
    finally { setLoading(false) }
  }

  if (step === 1) {
    return (
      <div className="min-h-screen bg-[#020408] flex items-center justify-center p-4">
        <div className="relative w-full max-w-md">
          <div className="absolute -top-20 -left-20 w-40 h-40 bg-blue-500/10 rounded-full blur-3xl" />
          <div className="absolute -bottom-20 -right-20 w-40 h-40 bg-blue-500/10 rounded-full blur-3xl" />
          <div className="relative bg-[#0d1117]/90 backdrop-blur-xl border border-[#1a2332] rounded-2xl p-8 shadow-2xl">
            <BruskLogo />
            <h2 className="text-lg font-semibold text-white mb-6 text-center">Admin Kurulumu</h2>
            <p className="text-sm text-gray-500 mb-6 text-center">Yonetici hesabinizi olusturun</p>
            <div className="space-y-4">
              <div>
                <label className="text-xs text-gray-500 block mb-1.5">E-posta</label>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="ornek@email.com" className="w-full bg-[#080b12]/80 border border-[#1a2332] rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-blue-500/50 placeholder-gray-600 transition-all" autoFocus />
              </div>
              <div>
                <label className="text-xs text-gray-500 block mb-1.5">Parola</label>
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••" className="w-full bg-[#080b12]/80 border border-[#1a2332] rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-blue-500/50 placeholder-gray-600 transition-all" />
              </div>
              {error && <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3"><p className="text-red-400 text-xs">{error}</p></div>}
              <button onClick={handleSetup} disabled={loading || !email || !password} className="w-full py-2.5 bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-xl text-sm font-medium hover:shadow-lg hover:shadow-blue-500/25 transition-all disabled:opacity-50">{loading ? 'Kuruluyor...' : 'Admin Olustur'}</button>
            </div>
            {qrCode && (
              <div className="mt-6 p-4 bg-[#080b12]/50 rounded-xl border border-[#1a2332] text-center animate-fade-in">
                <p className="text-sm text-gray-500 mb-3">Google Authenticator ile taratin</p>
                <div className="flex justify-center mb-3"><img src={qrCode} alt="QR" className="w-44 h-44 rounded-xl bg-white p-2 shadow-lg" /></div>
                <p className="text-xs text-gray-600 mb-3">Yedek: <span className="text-blue-400 font-mono select-all text-sm">{secret}</span></p>
                <button onClick={() => router.push('/')} className="w-full py-2.5 bg-[#1a2332] text-white rounded-xl text-sm font-medium hover:bg-[#1f2a3a] transition-all">Paneli Ac</button>
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
          <div className="absolute -top-20 -left-20 w-40 h-40 bg-blue-500/10 rounded-full blur-3xl" />
          <div className="absolute -bottom-20 -right-20 w-40 h-40 bg-blue-500/10 rounded-full blur-3xl" />
          <div className="relative bg-[#0d1117]/90 backdrop-blur-xl border border-[#1a2332] rounded-2xl p-8 shadow-2xl">
            <BruskLogo />
            <h2 className="text-lg font-semibold text-white mb-2 text-center">2FA Dogrulama</h2>
            <p className="text-sm text-gray-500 mb-6 text-center">Google Authenticator uygulamasindaki 6 haneli kodu girin</p>
            <div className="space-y-4">
              <div className="flex justify-center">
                <input type="text" value={token2fa} onChange={(e) => setToken2fa(e.target.value.replace(/\D/g,'').slice(0,6))} placeholder="000000" className="w-48 text-center text-2xl tracking-[0.3em] bg-[#080b12]/80 border border-[#1a2332] rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500/50 transition-all font-mono" maxLength={6} inputMode="numeric" autoFocus />
              </div>
              {verifyError && <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3"><p className="text-red-400 text-xs text-center">{verifyError}</p></div>}
              <button onClick={handleVerify2fa} disabled={loading || token2fa.length < 6} className="w-full py-2.5 bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-xl text-sm font-medium hover:shadow-lg hover:shadow-blue-500/25 transition-all disabled:opacity-50">{loading ? 'Dogrulaniyor...' : 'Giris Yap'}</button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#020408] flex items-center justify-center p-4">
      <div className="relative w-full max-w-md">
        <div className="absolute -top-20 -left-20 w-40 h-40 bg-blue-500/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-20 -right-20 w-40 h-40 bg-blue-500/10 rounded-full blur-3xl" />
        <div className="relative bg-[#0d1117]/90 backdrop-blur-xl border border-[#1a2332] rounded-2xl p-8 shadow-2xl">
          <BruskLogo />
          <h2 className="text-lg font-semibold text-white mb-6 text-center">Yonetici Girisi</h2>
          <div className="space-y-4">
            <div>
              <label className="text-xs text-gray-500 block mb-1.5">E-posta</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="ornek@bruskapp.com" className="w-full bg-[#080b12]/80 border border-[#1a2332] rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-blue-500/50 placeholder-gray-600 transition-all" autoFocus />
            </div>
            <div>
              <label className="text-xs text-gray-500 block mb-1.5">Parola</label>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••" onKeyDown={(e) => e.key === 'Enter' && handleLogin()} className="w-full bg-[#080b12]/80 border border-[#1a2332] rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-blue-500/50 placeholder-gray-600 transition-all" />
            </div>
            {error && <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3"><p className="text-red-400 text-xs">{error}</p></div>}
            <button onClick={handleLogin} disabled={loading || !email || !password} className="w-full py-2.5 bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-xl text-sm font-medium hover:shadow-lg hover:shadow-blue-500/25 transition-all disabled:opacity-50">{loading ? 'Giris yapiliyor...' : 'Giris Yap'}</button>
          </div>
          <p className="text-xs text-gray-600 text-center mt-6">Hesabiniz yok mu? <a href="/brk-mgmt/register" className="text-blue-400 hover:text-blue-300">Kayit Ol</a></p>
        </div>
      </div>
    </div>
  )
}

function parseError(status: number, body: string): string {
  if (status === 429) return 'Cok fazla istek. Lutfen 1 dakika bekleyin.'
  if (status >= 500) return 'Sunucu hatasi. Lutfen tekrar deneyin.'
  try {
    const j = JSON.parse(body)
    if (j.message) return Array.isArray(j.message) ? j.message[0] : j.message
    if (j.error) return j.error
  } catch {}
  return 'Bilinmeyen hata (' + status + ')'
}