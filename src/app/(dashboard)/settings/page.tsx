'use client'
import { useState, useEffect } from 'react'

export default function SettingsPage() {
  const [show2faSetup, setShow2faSetup] = useState(false)
  const [qrCode, setQrCode] = useState('')
  const [secret, setSecret] = useState('')
  const [verifyToken, setVerifyToken] = useState('')
  const [verified, setVerified] = useState(false)
  const [loading, setLoading] = useState(false)
  const [verifyLoading, setVerifyLoading] = useState(false)
  const [error, setError] = useState('')
  const [verifyError, setVerifyError] = useState('')

  const [show2faSection, setShow2faSection] = useState(false)
  const h = {'Content-Type': 'application/json'}

  useEffect(() => {
    if (sessionStorage.getItem('2fa_setup') === 'true') {
      setVerified(true)
      return
    }
    (async () => {
      try {
        let res = await fetch('/api/auth/2fa/status', { credentials: 'include' })
        if (res.status === 401) {
          await fetch('/api/auth/refresh', { method: 'POST', credentials: 'include' })
          res = await fetch('/api/auth/2fa/status', { credentials: 'include' })
        }
        const d = await res.json()
        if (d.setup) {
          sessionStorage.setItem('2fa_setup', 'true')
          setVerified(true)
        }
      } catch {}
    })()
  }, [])

  const handleSetup2fa = async () => {
    setLoading(true); setError('')
    try {
      const res = await fetch('/api/auth/2fa/setup', { method: 'POST', credentials: 'include', headers: h })
      if (res.ok) { const d = await res.json(); setQrCode(d.qrCode); setSecret(d.secret); setShow2faSetup(true) }
      else { const txt = await res.text(); setError('Setup: ' + res.status + ' ' + txt) }
    } catch { setError('Baglanti hatasi') }
    finally { setLoading(false) }
  }

  const handleVerify2fa = async () => {
    setVerifyLoading(true); setVerifyError('')
    try {
      let res = await fetch('/api/auth/2fa/verify', { method: 'POST', credentials: 'include', headers: h, body: JSON.stringify({ token: verifyToken }) })
      if (res.status === 401) {
        await fetch('/api/auth/refresh', { method: 'POST', credentials: 'include' })
        res = await fetch('/api/auth/2fa/verify', { method: 'POST', credentials: 'include', headers: h, body: JSON.stringify({ token: verifyToken }) })
      }
      if (res.ok) {
        sessionStorage.setItem('2fa_setup', 'true')
        sessionStorage.setItem('2fa_verified', 'true')
        setVerified(true)
      }
      else { const txt = await res.text(); setVerifyError('Hata ' + res.status + ': ' + txt) }
    } catch { setVerifyError('Baglanti hatasi') }
    finally { setVerifyLoading(false) }
  }

  const header = (
    <div className="text-center">
      <h1 className="text-2xl font-bold text-white">Ayarlar</h1>
      <p className="text-sm text-gray-500 mt-1">Sistem yapilandirmasi</p>
    </div>
  )

  if (verified) {
    return (
      <div className="space-y-6 max-w-lg mx-auto">
        {header}
        <div className="bg-[#0d1117]/80 backdrop-blur-xl border border-[#1a2332] rounded-2xl p-6 text-center">
          <div className="w-14 h-14 rounded-full bg-emerald-500/10 flex items-center justify-center mx-auto mb-3">
            <svg className="w-7 h-7 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </div>
          <h3 className="text-white font-semibold mb-1">2FA Aktif</h3>
          <p className="text-sm text-gray-500">Hesabiniz korunuyor.</p>
          <p className="text-xs text-gray-600 mt-2">Sonraki girislerde Google Authenticator kodu istenecek.</p>
          <button onClick={async () => {
            if (!confirm('2FA\'yi devre disi birakmak istediginize emin misiniz?')) return
            const r = await fetch('/api/auth/2fa/disable', { method: 'POST', credentials: 'include' })
            if (r.ok) { sessionStorage.removeItem('2fa_setup'); sessionStorage.removeItem('2fa_verified'); setVerified(false); setShow2faSetup(false) }
          }} className="mt-4 px-4 py-2 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl text-sm font-medium hover:bg-red-500/20 transition-all">2FA'yi Devre Disi Birak</button>
        </div>
      </div>
    )
  }

  if (show2faSetup) {
    return (
      <div className="space-y-6 max-w-lg mx-auto">
        {header}
        <div className="bg-[#0d1117]/80 backdrop-blur-xl border border-[#1a2332] rounded-2xl p-6">
          <h3 className="text-white font-semibold mb-4 text-center">2FA Kurulumu</h3>
          <p className="text-sm text-gray-500 mb-4 text-center">Google Authenticator uygulamasi ile asagidaki QR kodu taratin:</p>
          {qrCode && <div className="flex justify-center mb-4"><img src={qrCode} alt="QR" className="w-48 h-48 rounded-xl bg-white p-2" /></div>}
          {secret && <div className="mb-4"><p className="text-xs text-gray-500 mb-1">Yedek kod:</p><p className="text-sm font-mono text-blue-400 bg-[#080b12] p-2 rounded-xl text-center select-all">{secret}</p></div>}
          <p className="text-sm text-gray-500 mb-3 text-center">Google Authenticator uygulamasindaki 6 haneli kodu girin:</p>
          <div className="space-y-3">
            <input type="text" value={verifyToken} onChange={(e) => setVerifyToken(e.target.value.replace(/\D/g,'').slice(0,6))} placeholder="000 000" className="w-full text-center text-xl tracking-[0.5em] bg-[#080b12] border border-[#1a2332] rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-blue-500/50 transition-all font-mono" maxLength={6} inputMode="numeric" />
            {verifyError && <p className="text-red-400 text-xs break-all text-center">{verifyError}</p>}
            <button onClick={handleVerify2fa} disabled={verifyLoading || verifyToken.length < 6} className="w-full py-2.5 bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-xl text-sm font-medium hover:shadow-lg hover:shadow-blue-500/20 transition-all disabled:opacity-50">{verifyLoading ? 'Dogrulaniyor...' : 'Kodu Dogrula'}</button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-lg mx-auto">
      {header}
      <div className="bg-[#0d1117]/80 backdrop-blur-xl border border-[#1a2332] rounded-2xl p-6 text-center">
        <h3 className="text-white font-semibold mb-4">Iki Faktorlu Dogrulama</h3>
        <p className="text-sm text-gray-500 mb-4">Hesabinizi 2FA ile koruyun.</p>
        {error && <p className="text-red-400 text-xs mb-3 break-all">{error}</p>}
        <button onClick={handleSetup2fa} disabled={loading} className="w-full py-2.5 bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-xl text-sm font-medium hover:shadow-lg hover:shadow-blue-500/20 transition-all disabled:opacity-50">{loading ? 'Kuruluyor...' : '2FA Kur'}</button>
      </div>
    </div>
  )
}
