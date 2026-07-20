'use client'
import { useState, useEffect } from 'react'
import { Shield, Bell, Send, Clock, Settings, CheckCircle, XCircle, Link2, Unlink, MessageCircle, Calendar, Download, RefreshCw, Eye, EyeOff, Smartphone, Lock, KeyRound } from 'lucide-react'

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

  // Telegram
  const [tgConnected, setTgConnected] = useState(false)
  const [tgBotName, setTgBotName] = useState('')
  const [tgLoading, setTgLoading] = useState(false)
  const [showTgModal, setShowTgModal] = useState(false)
  const [tgToken, setTgToken] = useState('')
  const [tgError, setTgError] = useState('')
  const [tgTesting, setTgTesting] = useState(false)

  // Password Change
  const [pwCurrent, setPwCurrent] = useState('')
  const [pwNew, setPwNew] = useState('')
  const [pwConfirm, setPwConfirm] = useState('')
  const [pwSaving, setPwSaving] = useState(false)
  const [pwMsg, setPwMsg] = useState('')
  const [pwShow, setPwShow] = useState(false)

  // Report Schedule
  const [reportEnabled, setReportEnabled] = useState(false)
  const [reportTime, setReportTime] = useState('20:00')
  const [reportSending, setReportSending] = useState(false)
  const [reportResult, setReportResult] = useState('')

  const h = { 'Content-Type': 'application/json' }

  useEffect(() => {
    if (sessionStorage.getItem('2fa_setup') === 'true') { setVerified(true) }
    ;(async () => {
      try {
        let res = await fetch('/api/auth/2fa/status', { credentials: 'include' })
        if (res.status === 401) { await fetch('/api/auth/refresh', { method: 'POST', credentials: 'include' }); res = await fetch('/api/auth/2fa/status', { credentials: 'include' }) }
        const d = await res.json()
        if (d.setup) { sessionStorage.setItem('2fa_setup', 'true'); setVerified(true) }
      } catch {}
    })()
    // Load telegram config (with localStorage fallback)
    const cachedTg = localStorage.getItem('bruskapp_tg_connected')
    const cachedBot = localStorage.getItem('bruskapp_tg_botname')
    if (cachedTg === 'true') { setTgConnected(true); if (cachedBot) setTgBotName(cachedBot) }
    fetch('/api/telegram/tenant-status', { credentials: 'include' }).then(r => r.ok ? r.json() : null).then(d => {
      if (d) {
        setTgConnected(d.connected); setTgBotName(d.botInfo?.username || '')
        localStorage.setItem('bruskapp_tg_connected', d.connected ? 'true' : 'false')
        if (d.botInfo?.username) localStorage.setItem('bruskapp_tg_botname', d.botInfo.username)
      }
    }).catch(() => {})
    // Load report schedule
    fetch('/api/report-schedule', { credentials: 'include' }).then(r => r.ok ? r.json() : null).then(d => { if (d) { setReportEnabled(d.enabled); setReportTime(d.time || '20:00') } }).catch(() => {})
  }, [])

  const handleSetup2fa = async () => {
    setLoading(true); setError('')
    try {
      const res = await fetch('/api/auth/2fa/setup', { method: 'POST', credentials: 'include', headers: h })
      if (res.ok) { const d = await res.json(); setQrCode(d.qrCode); setSecret(d.secret); setShow2faSetup(true) }
      else setError('Hata ' + res.status)
    } catch { setError('Bağlantı hatası') }
    finally { setLoading(false) }
  }

  const handleVerify2fa = async () => {
    setVerifyLoading(true); setVerifyError('')
    try {
      let res = await fetch('/api/auth/2fa/verify', { method: 'POST', credentials: 'include', headers: h, body: JSON.stringify({ token: verifyToken }) })
      if (res.status === 401) { await fetch('/api/auth/refresh', { method: 'POST', credentials: 'include' }); res = await fetch('/api/auth/2fa/verify', { method: 'POST', credentials: 'include', headers: h, body: JSON.stringify({ token: verifyToken }) }) }
      if (res.ok) { sessionStorage.setItem('2fa_setup', 'true'); sessionStorage.setItem('2fa_verified', 'true'); setVerified(true) }
      else setVerifyError('Hata ' + res.status)
    } catch { setVerifyError('Bağlantı hatası') }
    finally { setVerifyLoading(false) }
  }

  const connectTelegram = async () => {
    if (!tgToken.trim()) return
    setTgTesting(true); setTgError('')
    try {
      const res = await fetch('/api/telegram/tenant-connect', { method: 'POST', credentials: 'include', headers: h, body: JSON.stringify({ token: tgToken }) })
      if (res.ok) {
        setTgConnected(true); setShowTgModal(false); setTgToken('')
        localStorage.setItem('bruskapp_tg_connected', 'true')
        fetch('/api/telegram/tenant-status', { credentials: 'include' }).then(r => r.ok ? r.json() : null).then(d => { if (d) { setTgBotName(d.botInfo?.username || ''); if (d.botInfo?.username) localStorage.setItem('bruskapp_tg_botname', d.botInfo.username) } })
      } else {
        const txt = await res.text()
        setTgError(txt.includes('Unauthorized') ? 'Geçersiz bot token' : txt.slice(0, 100))
      }
    } catch { setTgError('Bağlantı hatası') }
    finally { setTgTesting(false) }
  }

  const disconnectTelegram = async () => {
    await fetch('/api/telegram/tenant-disconnect', { method: 'POST', credentials: 'include', headers: h })
    setTgConnected(false)
    localStorage.removeItem('bruskapp_tg_connected')
    localStorage.removeItem('bruskapp_tg_botname')
  }

  const changePassword = async () => {
    if (!pwCurrent || !pwNew) { setPwMsg('Mevcut ve yeni sifre gerekli'); return }
    if (pwNew.length < 6) { setPwMsg('Yeni sifre en az 6 karakter olmali'); return }
    if (pwNew !== pwConfirm) { setPwMsg('Yeni sifreler eslesmiyor'); return }
    setPwSaving(true); setPwMsg('')
    try {
      const res = await fetch('/api/auth/change-password', { method: 'POST', credentials: 'include', headers: h, body: JSON.stringify({ currentPassword: pwCurrent, newPassword: pwNew }) })
      if (res.ok) { setPwMsg('Sifre basariyla degistirildi!'); setPwCurrent(''); setPwNew(''); setPwConfirm('') }
      else { const t = await res.text(); setPwMsg(t.includes('Unauthorized') || res.status === 401 ? 'Mevcut sifre yanlis' : 'Hata: ' + res.status) }
    } catch { setPwMsg('Baglanti hatasi') }
    finally { setPwSaving(false) }
  }

  const saveReportSchedule = async () => {
    await fetch('/api/report-schedule', { method: 'POST', credentials: 'include', headers: h, body: JSON.stringify({ enabled: reportEnabled, time: reportTime }) })
  }

  const sendReportNow = async () => {
    setReportSending(true); setReportResult('')
    try {
      const res = await fetch('/api/analytics/report', { method: 'POST', credentials: 'include' })
      const json = await res.json()
      setReportResult(json.message || (json.success ? 'Rapor gönderildi' : 'Gönderilemedi'))
    } catch { setReportResult('Bağlantı hatası') }
    finally { setReportSending(false); setTimeout(() => setReportResult(''), 4000) }
  }

  function Section({ icon, title, desc, children }: any) {
    return (
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#0f1420] to-[#0d1117] border border-[#1a2332] p-6 transition-all duration-300 hover:border-blue-500/20">
        <div className="absolute top-0 right-0 w-48 h-48 bg-blue-500/5 rounded-full blur-2xl" />
        <div className="relative">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/20">{icon}</div>
            <div><h3 className="text-white font-semibold">{title}</h3><p className="text-xs text-gray-500 mt-0.5">{desc}</p></div>
          </div>
          {children}
        </div>
      </div>
    )
  }

  function Toggle({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) {
    return (
      <button onClick={() => onChange(!value)}
        className={'relative inline-flex h-6 w-11 items-center rounded-full transition-all flex-shrink-0 ' + (value ? 'bg-blue-500' : 'bg-gray-600')}>
        <span className={'inline-block h-4 w-4 transform rounded-full bg-white transition-all ' + (value ? 'translate-x-6' : 'translate-x-1')} />
      </button>
    )
  }

  if (show2faSetup) {
    return (
      <div className="space-y-6 max-w-2xl mx-auto pb-12">
        <Section icon={<Shield size={20} className="text-white" />} title="İki Adımlı Doğrulama Kurulumu" desc="Google Authenticator ile QR kodu taratın">
          {qrCode && <div className="flex justify-center mb-4"><img src={qrCode} alt="QR" className="w-48 h-48 rounded-xl bg-white p-2 shadow-lg" /></div>}
          {secret && <div className="mb-4 bg-[#080b12]/60 border border-[#1a2332] rounded-xl p-3"><p className="text-xs text-gray-500 mb-1">Yedek kod:</p><p className="text-sm font-mono text-blue-400 select-all text-center">{secret}</p></div>}
          <p className="text-sm text-gray-500 mb-3">6 haneli kodu girin:</p>
          <div className="flex gap-3 items-center">
            <input type="text" value={verifyToken} onChange={e => setVerifyToken(e.target.value.replace(/\D/g, '').slice(0, 6))} placeholder="000000" className="flex-1 text-center text-xl tracking-[0.5em] bg-[#080b12] border border-[#1a2332] rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-blue-500/50 font-mono" maxLength={6} inputMode="numeric" />
            <button onClick={handleVerify2fa} disabled={verifyLoading || verifyToken.length < 6} className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-xl text-sm font-semibold hover:shadow-lg hover:shadow-blue-500/25 transition-all disabled:opacity-50">{verifyLoading ? 'Doğrulanıyor...' : 'Doğrula'}</button>
          </div>
          {verifyError && <p className="text-red-400 text-xs mt-2">{verifyError}</p>}
        </Section>
      </div>
    )
  }

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#0f1420] via-[#0d1117] to-[#0a0e14] border border-[#1a2332] p-6 lg:p-8">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl" />
        <div className="relative flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/20"><Settings size={24} className="text-white" /></div>
          <div><h1 className="text-xl font-bold text-white">Ayarlar</h1><p className="text-sm text-gray-500 mt-0.5">Sistem yapılandırması ve bildirimler</p></div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Telegram Bildirimleri */}
        <Section icon={<Send size={20} className="text-white" />} title="Telegram Bildirimleri" desc="Anlık bildirimleri Telegram üzerinden alın">
          {tgConnected ? (
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
                <CheckCircle size={18} className="text-emerald-400 flex-shrink-0" />
                <div>
                  <p className="text-sm text-white font-medium">Telegram bağlı</p>
                  <p className="text-xs text-gray-500 mt-0.5">{tgBotName ? '@' + tgBotName : 'Bot aktif'}</p>
                </div>
              </div>
              <button onClick={disconnectTelegram} className="flex items-center gap-2 px-4 py-2 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl text-sm font-medium hover:bg-red-500/20 transition-all"><Unlink size={14} />Bağlantıyı Kes</button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl">
                <p className="text-sm text-amber-400 font-medium">Telegram bağlı değil</p>
                <p className="text-xs text-gray-500 mt-2">Bağlantı için kendi Telegram botunuzu oluşturmanız gerekiyor:</p>
                <ol className="text-xs text-gray-400 mt-2 space-y-1.5 list-decimal list-inside">
                  <li>Telegram'da <strong className="text-white">@BotFather</strong> hesabını aratın</li>
                  <li><strong className="text-white">/newbot</strong> komutunu gönderin</li>
                  <li>Botunuz için bir ad ve kullanıcı adı belirleyin</li>
                  <li>BotFather size bir <strong className="text-white">token</strong> verecek</li>
                  <li>Bu token'ı aşağıya yapıştırın ve bağlanın</li>
                </ol>
              </div>
              <button onClick={() => setShowTgModal(true)} disabled={tgLoading} className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-sky-500 to-blue-500 text-white rounded-xl text-sm font-semibold hover:shadow-lg hover:shadow-sky-500/25 transition-all disabled:opacity-50">
                {tgLoading ? 'Bağlanıyor...' : <><Link2 size={16} />Telegram'ı Bağla</>}
              </button>
            </div>
          )}
        </Section>

        {/* Gün Sonu Rapor & Analiz */}
        <Section icon={<Download size={20} className="text-white" />} title="Gün Sonu Rapor & Analiz" desc="Otomatik rapor gönderimi ve analiz">
          <div className="space-y-4">
            {!tgConnected && (
              <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl flex items-start gap-2">
                <XCircle size={16} className="text-amber-400 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-amber-400">Rapor gönderimi için Telegram bağlantısı gereklidir.</p>
              </div>
            )}

            <div className="flex items-center justify-between p-3 bg-[#080b12]/60 border border-[#1a2332] rounded-xl">
              <div className="flex items-center gap-3">
                <Calendar size={16} className="text-blue-400" />
                <div>
                  <p className="text-sm text-white font-medium">Otomatik Rapor</p>
                  <p className="text-xs text-gray-500">Her gün belirtilen saatte Telegram'a gönder</p>
                </div>
              </div>
              <Toggle value={reportEnabled} onChange={v => { setReportEnabled(v); setTimeout(() => saveReportSchedule(), 100) }} />
            </div>

            {reportEnabled && (
              <div className="flex items-center gap-3 p-3 bg-[#080b12]/60 border border-[#1a2332] rounded-xl">
                <Clock size={16} className="text-purple-400" />
                <span className="text-sm text-gray-400">Gönderim saati:</span>
                <input type="time" value={reportTime} onChange={e => { setReportTime(e.target.value); setTimeout(() => saveReportSchedule(), 100) }} className="bg-[#1a2332] border border-[#2a3a4a] rounded-lg px-3 py-1.5 text-sm text-white" />
              </div>
            )}

            <div className="p-3 bg-blue-500/5 border border-blue-500/10 rounded-xl">
              <p className="text-xs text-gray-400 leading-relaxed">
                Rapor içeriği: <strong className="text-white">Bugünkü mesaj istatistikleri (gelen/giden), kredi kullanımı, platform bazlı dağılım ve analiz özeti</strong> — Türkçe olarak Telegram'a gönderilir.
              </p>
            </div>

            <button onClick={sendReportNow} disabled={reportSending || !tgConnected}
              className={'w-full flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-sm font-semibold transition-all duration-300 ' + (tgConnected ? 'bg-gradient-to-r from-emerald-600 to-emerald-500 text-white hover:shadow-lg hover:shadow-emerald-500/25' : 'bg-[#1a2332] text-gray-500 cursor-not-allowed')}>
              {reportSending ? <RefreshCw size={16} className="animate-spin" /> : <Send size={16} />}
              {reportSending ? 'Gönderiliyor...' : 'Şimdi Rapor Gönder'}
            </button>

            {reportResult && (
              <div className={'text-xs text-center py-2 px-3 rounded-lg ' + (reportResult.includes('gönderildi') || reportResult.includes('başarılı') ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400')}>{reportResult}</div>
            )}
          </div>
        </Section>

        {/* Şifre Değiştir */}
        <Section icon={<Lock size={20} className="text-white" />} title="Şifre Değiştir" desc="Hesap şifrenizi güncelleyin">
          <div className="space-y-4">
            <div className="relative">
              <input type={pwShow ? 'text' : 'password'} value={pwCurrent} onChange={e => setPwCurrent(e.target.value)} placeholder="Mevcut şifre" className="w-full bg-[#080b12]/80 border border-[#1a2332] rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-blue-500/50 placeholder-gray-600 pr-10" />
              <button onClick={() => setPwShow(!pwShow)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white"><Eye size={16} /></button>
            </div>
            <input type="password" value={pwNew} onChange={e => setPwNew(e.target.value)} placeholder="Yeni şifre (en az 6 karakter)" className="w-full bg-[#080b12]/80 border border-[#1a2332] rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-blue-500/50 placeholder-gray-600" />
            <input type="password" value={pwConfirm} onChange={e => setPwConfirm(e.target.value)} placeholder="Yeni şifre tekrar" className="w-full bg-[#080b12]/80 border border-[#1a2332] rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-blue-500/50 placeholder-gray-600" />
            {pwMsg && (
              <div className={'text-xs py-2 px-3 rounded-lg ' + (pwMsg.includes('başarıyla') || pwMsg.includes('degistirildi') ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400')}>{pwMsg}</div>
            )}
            <button onClick={changePassword} disabled={pwSaving || !pwCurrent || !pwNew || !pwConfirm}
              className="w-full flex items-center justify-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-xl text-sm font-semibold hover:shadow-lg hover:shadow-blue-500/25 transition-all disabled:opacity-50">
              {pwSaving ? <RefreshCw size={16} className="animate-spin" /> : <KeyRound size={16} />}
              {pwSaving ? 'Değiştiriliyor...' : 'Şifreyi Değiştir'}
            </button>
          </div>
        </Section>

        {/* İki Adımlı Doğrulama */}
        <Section icon={<Shield size={20} className="text-white" />} title="İki Adımlı Doğrulama" desc="Hesap güvenliğini artırın">
          {verified ? (
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
                <CheckCircle size={18} className="text-emerald-400 flex-shrink-0" />
                <div><p className="text-sm text-white font-medium">2FA Aktif</p><p className="text-xs text-gray-500">Google Authenticator ile korunuyor</p></div>
              </div>
              <button onClick={async () => {
                if (!confirm('2FA\'yı devre dışı bırakmak istediğinize emin misiniz?')) return
                const r = await fetch('/api/auth/2fa/disable', { method: 'POST', credentials: 'include' })
                if (r.ok) { sessionStorage.removeItem('2fa_setup'); sessionStorage.removeItem('2fa_verified'); setVerified(false) }
              }} className="flex items-center gap-2 px-4 py-2 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl text-sm font-medium hover:bg-red-500/20 transition-all"><XCircle size={14} />2FA'yı Devre Dışı Bırak</button>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-sm text-gray-500">Hesabınızı iki adımlı doğrulama ile koruyun.</p>
              {error && <p className="text-red-400 text-xs">{error}</p>}
              <button onClick={handleSetup2fa} disabled={loading} className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-xl text-sm font-semibold hover:shadow-lg hover:shadow-blue-500/25 transition-all disabled:opacity-50">
                {loading ? 'Kuruluyor...' : <><Shield size={16} />2FA Kur</>}
              </button>
            </div>
          )}
        </Section>

        {/* Bildirim Tercihleri */}
        <Section icon={<Bell size={20} className="text-white" />} title="Bildirim Tercihleri" desc="Hangi bildirimleri almak istediğinizi seçin">
          <div className="space-y-4">
            {[
              { key: 'newOrder', label: 'Yeni Sipariş', desc: 'Yeni sipariş alındığında Telegram bildirimi gönder' },
              { key: 'newMessage', label: 'Yeni Mesaj', desc: 'WhatsApp/Instagram/Telegram\'dan yeni mesaj geldiğinde bildirim' },
            ].map(item => (
              <div key={item.key} className="flex items-center justify-between p-3 bg-[#080b12]/60 border border-[#1a2332] rounded-xl">
                <div><p className="text-sm text-white">{item.label}</p><p className="text-xs text-gray-500 mt-0.5">{item.desc}</p></div>
                <div className="w-9 h-6 bg-gray-600 rounded-full" />
              </div>
            ))}
          </div>
        </Section>
      </div>

      {/* Telegram Token Modal */}
      {showTgModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowTgModal(false)} />
          <div className="relative w-full max-w-md bg-[#0d1117] border border-[#1a2332] rounded-2xl shadow-2xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-sky-500 to-blue-600 flex items-center justify-center shadow-lg shadow-sky-500/20"><Send size={20} className="text-white" /></div>
              <div><h3 className="text-white font-semibold">Telegram Bağlantısı</h3><p className="text-xs text-gray-500">Bot token'ınızı girin</p></div>
            </div>
            <p className="text-xs text-gray-500 mb-3">BotFather'da oluşturduğunuz botun token'ını girin: <a href="https://t.me/BotFather" target="_blank" className="text-blue-400 hover:text-blue-300">@BotFather</a></p>
            <input value={tgToken} onChange={e => setTgToken(e.target.value)} placeholder="123456:ABC-DEF1234ghIkl-zyx57W2v1u123ew11" className="w-full bg-[#080b12]/80 border border-[#1a2332] rounded-xl px-4 py-3 text-white text-sm font-mono focus:outline-none focus:border-sky-500/50" />
            {tgError && <p className="text-red-400 text-xs mt-2">{tgError}</p>}
            <div className="flex gap-3 mt-4">
              <button onClick={connectTelegram} disabled={tgTesting || !tgToken.trim()} className="flex-1 py-2.5 bg-gradient-to-r from-sky-500 to-blue-500 text-white rounded-xl text-sm font-semibold hover:shadow-lg hover:shadow-sky-500/25 transition-all disabled:opacity-50">
                {tgTesting ? 'Doğrulanıyor...' : 'Bağlan'}
              </button>
              <button onClick={() => setShowTgModal(false)} className="px-5 py-2.5 border border-[#1a2332] text-gray-400 rounded-xl text-sm hover:text-white transition-all">İptal</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
