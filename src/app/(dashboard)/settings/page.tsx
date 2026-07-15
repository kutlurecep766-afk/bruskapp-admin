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

  const [prefs, setPrefs] = useState<{ newOrder: boolean; lowStock: boolean; newMessage: boolean }>({ newOrder: true, lowStock: true, newMessage: true })
  const [prefResult, setPrefResult] = useState<{ ok: boolean; msg: string } | null>(null)

  const h = { 'Content-Type': 'application/json' }

  useEffect(() => {
    if (sessionStorage.getItem('2fa_setup') === 'true') {
      setVerified(true)
      return
    }
    ;(async () => {
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

    // Load notification preferences
    fetch('/api/notifications/preferences', { credentials: 'include' })
      .then(r => r.json())
      .then(d => { if (d) setPrefs(d) })
      .catch(() => {})
  }, [])

  const savePreference = async (key: string, value: boolean) => {
    setPrefResult(null)
    try {
      const updated = { ...prefs, [key]: value }
      const res = await fetch('/api/notifications/preferences', { method: 'POST', credentials: 'include', headers: h, body: JSON.stringify(updated) })
      if (res.ok) {
        setPrefs(updated)
        setPrefResult({ ok: true, msg: 'Kaydedildi' })
      } else {
        setPrefResult({ ok: false, msg: 'Kaydedilemedi' })
      }
    } catch { setPrefResult({ ok: false, msg: 'Hata' }) } finally {
      setTimeout(() => setPrefResult(null), 2000)
    }
  }

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

  if (show2faSetup) {
    return (
      <div className="space-y-6 max-w-lg mx-auto">
        {header}
        <div className="bg-[#0d1117]/80 backdrop-blur-xl border border-[#1a2332] rounded-2xl p-6">
          <h3 className="text-white font-semibold mb-4 text-center">2FA Kurulumu</h3>
          <p className="text-sm text-gray-500 mb-4 text-center">Google Authenticator ile QR kodu taratin:</p>
          {qrCode && <div className="flex justify-center mb-4"><img src={qrCode} alt="QR" className="w-48 h-48 rounded-xl bg-white p-2" /></div>}
          {secret && <div className="mb-4"><p className="text-xs text-gray-500 mb-1">Yedek kod:</p><p className="text-sm font-mono text-blue-400 bg-[#080b12] p-2 rounded-xl text-center select-all">{secret}</p></div>}
          <p className="text-sm text-gray-500 mb-3 text-center">6 haneli kodu girin:</p>
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


      {/* Bildirim Tercihleri */}
      <div className="bg-[#0d1117]/80 backdrop-blur-xl border border-[#1a2332] rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 rounded-full bg-indigo-400" />
            <h3 className="text-white font-semibold">Bildirim Tercihleri</h3>
          </div>
          {prefResult && <span className={'text-xs ' + (prefResult.ok ? 'text-green-400' : 'text-red-400')}>{prefResult.msg}</span>}
        </div>
        <div className="space-y-3">
          {[
            { key: 'newOrder', label: 'Yeni Sipariş', desc: 'Yeni sipariş alındığında bildirim gönder' },
            { key: 'lowStock', label: 'Düşük Stok Uyarısı', desc: 'Stok eşik değerin altına düştüğünde uyarı' },
            { key: 'newMessage', label: 'Yeni Mesaj', desc: 'WhatsApp/Instagram/Telegram\'dan yeni mesaj geldiğinde bildirim' },
          ].map(item => (
            <div key={item.key} className="flex items-center justify-between py-2">
              <div>
                <p className="text-sm text-white">{item.label}</p>
                <p className="text-xs text-gray-500">{item.desc}</p>
              </div>
              <button onClick={() => savePreference(item.key, !(prefs as any)[item.key])}
                className={'relative inline-flex h-5 w-9 items-center rounded-full transition-all ' + ((prefs as any)[item.key] ? 'bg-indigo-500' : 'bg-gray-600')}>
                <span className={'inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-all ' + ((prefs as any)[item.key] ? 'translate-x-4.5' : 'translate-x-1')} />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* 2FA */}
      <div className="bg-[#0d1117]/80 backdrop-blur-xl border border-[#1a2332] rounded-2xl p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className={'w-3 h-3 rounded-full ' + (verified ? 'bg-emerald-400' : 'bg-gray-500')} />
          <h3 className="text-white font-semibold">Iki Faktorlu Dogrulama</h3>
          {verified && <span className="text-xs text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">Aktif</span>}
        </div>
        {verified ? (
          <div>
            <p className="text-sm text-gray-500 mb-4">Google Authenticator ile korunuyor.</p>
            <button onClick={async () => {
              if (!confirm('2FA\'yi devre disi birakmak istediginize emin misiniz?')) return
              const r = await fetch('/api/auth/2fa/disable', { method: 'POST', credentials: 'include' })
              if (r.ok) { sessionStorage.removeItem('2fa_setup'); sessionStorage.removeItem('2fa_verified'); setVerified(false) }
            }} className="px-4 py-2 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl text-sm font-medium hover:bg-red-500/20 transition-all">2FA'yi Devre Disi Birak</button>
          </div>
        ) : (
          <div className="text-center">
            <p className="text-sm text-gray-500 mb-4">Hesabinizi 2FA ile koruyun.</p>
            {error && <p className="text-red-400 text-xs mb-3 break-all">{error}</p>}
            <button onClick={handleSetup2fa} disabled={loading} className="w-full py-2.5 bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-xl text-sm font-medium hover:shadow-lg hover:shadow-blue-500/20 transition-all disabled:opacity-50">{loading ? 'Kuruluyor...' : '2FA Kur'}</button>
          </div>
        )}
      </div>
    </div>
  )
}
