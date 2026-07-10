'use client'
import { useState, useEffect } from 'react'

export default function WhatsAppPage() {
  const [tab, setTab] = useState<'config' | 'send' | 'profile'>('config')
  const [accessToken, setAccessToken] = useState('')
  const [phoneNumberId, setPhoneNumberId] = useState('')
  const [webhookToken, setWebhookToken] = useState('')
  const [active, setActive] = useState(false)
  const [to, setTo] = useState('')
  const [message, setMessage] = useState('')
  const [result, setResult] = useState('')
  const [loading, setLoading] = useState(false)
  const [saved, setSaved] = useState(false)
  const [webhookUrl, setWebhookUrl] = useState('')

  // profile state
  const [profile, setProfile] = useState<any>(null)
  const [about, setAbout] = useState('')
  const [description, setDescription] = useState('')
  const [email, setEmail] = useState('')
  const [websites, setWebsites] = useState('')

  useEffect(() => {
    fetch('/api/whatsapp/config', { credentials: 'include' })
      .then(r => r.json()).then(d => {
        if (d.config) {
          setPhoneNumberId(d.config.phoneNumberId || '')
          setWebhookToken(d.config.webhookToken || '')
          setActive(d.config.active || false)
          setSaved(true)
        }
        if (d.webhookUrl) setWebhookUrl(d.webhookUrl)
      }).catch(() => {})
    loadProfile()
  }, [])

  const loadProfile = async () => {
    try {
      const res = await fetch('/api/whatsapp/profile', { credentials: 'include' })
      if (res.ok) {
        const d = await res.json()
        if (d.success && d.data) {
          setProfile(d.data)
          setAbout(d.data.about || '')
          setDescription(d.data.description || '')
          setEmail(d.data.email || '')
          setWebsites(d.data.websites?.join('\n') || '')
        }
      }
    } catch {}
  }

  const callApi = async (endpoint: string, body: object) => {
    setLoading(true); setResult('')
    try {
      const res = await fetch(endpoint, { method: 'POST', credentials: 'include', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
      const data = await res.json()
      setResult(JSON.stringify(data, null, 2))
      if (endpoint === '/api/whatsapp/config' && data.id) setSaved(true)
    } catch { setResult('Baglanti hatasi') }
    finally { setLoading(false) }
  }

  const saveProfile = async () => {
    setLoading(true)
    setResult('')
    try {
      const body: any = {}
      if (about.trim()) body.about = about.trim()
      if (description.trim()) body.description = description.trim()
      if (email.trim()) body.email = email.trim()
      const sites = websites.split('\n').map(s => s.trim()).filter(Boolean)
      if (sites.length > 0) body.websites = sites
      const res = await fetch('/api/whatsapp/profile', {
        method: 'POST', credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      const data = await res.json()
      if (data.success) {
        loadProfile()
        setResult(JSON.stringify(data, null, 2))
      } else {
        setResult(JSON.stringify(data, null, 2))
      }
    } catch {} finally { setLoading(false) }
  }

  const uploadProfilePicture = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setLoading(true)
    setResult('')
    try {
      const form = new FormData()
      form.append('file', file)
      const res = await fetch('/api/whatsapp/profile/picture', {
        method: 'POST', credentials: 'include',
        body: form,
      })
      const data = await res.json()
      setResult(JSON.stringify(data, null, 2))
      if (data.success) loadProfile()
    } catch {} finally { setLoading(false) }
    // reset input
    e.target.value = ''
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">WhatsApp API</h1>
          <p className="text-sm text-gray-500 mt-1">WhatsApp Business API — per-tenant yapilandirma</p>
        </div>
        <div className={'flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-medium ' + (saved && active ? 'bg-green-500/10 text-green-400' : 'bg-yellow-500/10 text-yellow-400')}>
          <div className={'w-2 h-2 rounded-full ' + (saved && active ? 'bg-green-400' : 'bg-yellow-400')} />
          {saved && active ? 'Aktif' : 'Ayarlanmadi'}
        </div>
      </div>

      {webhookUrl && (
        <div className="bg-[#0d1117]/80 backdrop-blur-xl border border-[#1a2332] rounded-2xl p-4">
          <label className="block text-sm text-gray-400 mb-1.5">Webhook URL (Meta tarafina bunu girin)</label>
          <div className="flex gap-2">
            <input type="text" readOnly value={webhookUrl} className="flex-1 bg-[#080b12] border border-[#1a2332] rounded-xl px-4 py-2.5 text-sm text-green-400 font-mono focus:outline-none" />
            <button onClick={() => { navigator.clipboard.writeText(webhookUrl); setResult('Kopyalandi!') }} className="px-4 py-2 bg-[#1a2332] text-gray-300 rounded-xl text-sm hover:bg-[#1f2a3a] border border-[#2a3a4a]">Kopyala</button>
          </div>
        </div>
      )}

      {profile && profile.verified_name && (
        <div className="bg-[#0d1117]/80 backdrop-blur-xl border border-[#1a2332] rounded-2xl p-4 flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
            {profile.verified_name.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white font-semibold text-lg truncate">{profile.verified_name}</p>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-gray-500 text-xs">{profile.display_phone_number || phoneNumberId}</span>
              {profile.name_status === 'APPROVED' ? (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-500/10 text-emerald-400 rounded-lg text-xs font-medium">
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7"/></svg>
                  Onayli
                </span>
              ) : profile.name_status === 'PENDING' ? (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-500/10 text-amber-400 rounded-lg text-xs font-medium">
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                  Onay Bekliyor
                </span>
              ) : profile.name_status === 'DECLINED' ? (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-red-500/10 text-red-400 rounded-lg text-xs font-medium">
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/></svg>
                  Reddedildi
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-gray-500/10 text-gray-400 rounded-lg text-xs font-medium">Bilinmiyor</span>
              )}
            </div>
          </div>
          <a href="https://business.facebook.com/wa/manage" target="_blank" className="px-4 py-2 bg-[#1a2332] text-gray-300 rounded-xl text-sm font-medium hover:bg-[#243040] transition-all border border-[#2a3a4a] whitespace-nowrap flex-shrink-0">
            Meta Panel
          </a>
        </div>
      )}

      <div className="flex gap-2">
        <button onClick={() => setTab('config')} className={'px-6 py-2 rounded-xl text-sm font-medium transition-all '+(tab==='config'?'bg-blue-500 text-white':'bg-[#0d1117]/80 border border-[#1a2332] text-gray-400 hover:text-white')}>Yapilandirma</button>
        <button onClick={() => setTab('profile')} className={'px-6 py-2 rounded-xl text-sm font-medium transition-all '+(tab==='profile'?'bg-blue-500 text-white':'bg-[#0d1117]/80 border border-[#1a2332] text-gray-400 hover:text-white')}>Profil</button>
        <button onClick={() => setTab('send')} className={'px-6 py-2 rounded-xl text-sm font-medium transition-all '+(tab==='send'?'bg-blue-500 text-white':'bg-[#0d1117]/80 border border-[#1a2332] text-gray-400 hover:text-white')}>Mesaj Gonder</button>
      </div>

      <div className="bg-[#0d1117]/80 backdrop-blur-xl border border-[#1a2332] rounded-2xl p-6">
        {tab === 'config' ? (
          <div className="space-y-4">
            <div>
              <h3 className="text-white font-semibold">WhatsApp API Bilgileri</h3>
              <p className="text-sm text-gray-500 mt-1">WhatsApp Business hesabinizin bilgilerini girin. <a className="text-blue-400 hover:underline" href="https://developers.facebook.com" target="_blank">Meta Developers</a> panelinden alabilirsiniz.</p>
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1.5">Sistem Kullanici Tokeni (Permanent)</label>
              <input type="password" value={accessToken} onChange={(e) => setAccessToken(e.target.value)} placeholder="EAAx..."
                className="w-full bg-[#080b12] border border-[#1a2332] rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-blue-500/50 transition-all font-mono" />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1.5">Telefon Numarasi ID (Phone Number ID)</label>
              <input type="text" value={phoneNumberId} onChange={(e) => setPhoneNumberId(e.target.value)} placeholder="123456789012345"
                className="w-full bg-[#080b12] border border-[#1a2332] rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-blue-500/50 transition-all font-mono" />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1.5">Webhook Dogrulama Tokeni (Verify Token)</label>
              <input type="text" value={webhookToken} onChange={(e) => setWebhookToken(e.target.value)} placeholder="kendiniz_belirleyin_ornek_123"
                className="w-full bg-[#080b12] border border-[#1a2332] rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-blue-500/50 transition-all font-mono" />
              <p className="text-xs text-gray-500 mt-1">Kendiniz bir dogrulama tokeni belirleyin. Meta webhook kurulumunda ayni degeri girin.</p>
            </div>
            <div className="flex items-center gap-3">
              <input type="checkbox" id="active" checked={active} onChange={(e) => setActive(e.target.checked)} className="w-4 h-4 rounded border-gray-600 bg-[#080b12]" />
              <label htmlFor="active" className="text-sm text-gray-300">Aktif (gelen mesajlari dinlemeye basla)</label>
            </div>
            <div className="flex gap-3">
              <button onClick={() => callApi('/api/whatsapp/test', {})} disabled={loading}
                className="px-6 py-2 bg-[#1a2332] text-gray-300 rounded-xl text-sm font-medium hover:bg-[#1f2a3a] border border-[#2a3a4a] transition-all disabled:opacity-50">
                {loading ? 'Test ediliyor...' : 'Baglantiyi Test Et'}
              </button>
              <button onClick={() => callApi('/api/whatsapp/config', { accessToken, phoneNumberId, webhookToken, active })} disabled={loading || !accessToken || !phoneNumberId || !webhookToken}
                className="px-6 py-2 bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-xl text-sm font-medium hover:shadow-lg hover:shadow-blue-500/20 transition-all disabled:opacity-50">
                {loading ? 'Kaydediliyor...' : 'Kaydet'}
              </button>
            </div>
            {result && <pre className="bg-[#080b12] rounded-xl p-4 text-sm text-gray-300 font-mono overflow-x-auto border border-[#1a2332]">{result}</pre>}
          </div>
        ) : tab === 'profile' ? (
          <div className="space-y-4">
                <div>
                  <h3 className="text-white font-semibold">WhatsApp Profil</h3>
                  <p className="text-sm text-gray-500 mt-1">WhatsApp Business hesabinizin profil bilgilerini duzenleyin.</p>
                </div>

            {profile && profile.verified_name && (
              <div className="bg-[#080b12]/50 rounded-xl p-4 border border-[#1a2332] space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-gray-500 text-xs uppercase tracking-wider">Isletme Adi (Display Name)</span>
                  {profile.name_status === 'APPROVED' ? (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-500/10 text-emerald-400 rounded-lg text-xs font-medium">
                      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7"/></svg>
                      Onayli
                    </span>
                  ) : profile.name_status === 'PENDING' ? (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-500/10 text-amber-400 rounded-lg text-xs font-medium">
                      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                      Onay Bekliyor
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-red-500/10 text-red-400 rounded-lg text-xs font-medium">Onayli Degil</span>
                  )}
                </div>
                <p className="text-white font-semibold text-lg">{profile.verified_name}</p>
                <p className="text-gray-500 text-xs">Musterilerin WhatsApp'ta gordugu isim. Meta panelinden degistirebilirsiniz.</p>
              </div>
            )}

            {profile && profile.display_phone_number && (
              <div className="bg-[#080b12]/50 rounded-xl p-4 border border-[#1a2332] flex items-center gap-3">
                <span className="text-gray-500 text-xs uppercase tracking-wider">Telefon:</span>
                <span className="text-white font-medium">{profile.display_phone_number}</span>
              </div>
            )}

            <div className="flex items-center gap-4">
              {profile?.profile_picture_url ? (
                <img src={profile.profile_picture_url} alt="Profil" className="w-16 h-16 rounded-full border-2 border-[#1a2332] object-cover" />
              ) : (
                <div className="w-16 h-16 rounded-full border-2 border-[#1a2332] bg-[#1a2332] flex items-center justify-center">
                  <svg className="w-6 h-6 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                </div>
              )}
              <div>
                <p className="text-white text-sm font-medium">Profil Fotografi</p>
                <p className="text-gray-500 text-xs mt-1">WhatsApp Cloud API profil fotografi degistirmeyi desteklemez. <a className="text-blue-400 hover:underline" href="https://business.facebook.com/wa/manage" target="_blank">Meta panelinden</a> guncelleyin.</p>
              </div>
            </div>

            <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-4">
              <p className="text-yellow-400 text-sm font-medium">WhatsApp Cloud API Profil Guncellemesini Desteklemiyor</p>
              <p className="text-gray-400 text-xs mt-2">Profil bilgilerinizi (hakkinda, aciklama, e-posta, web sitesi, profil fotografi) degistirmek icin Meta panelini kullanin:</p>
              <a href="https://business.facebook.com/wa/manage" target="_blank"
                className="inline-block mt-3 px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-medium hover:bg-blue-500 transition-all">
                Meta Paneline Git
              </a>
            </div>

            {profile && (
              <div className="space-y-3 bg-[#080b12]/50 rounded-xl p-4 border border-[#1a2332]">
                <p className="text-white text-sm font-medium mb-2">Mevcut Profil Bilgileri (Sadece goruntuleme)</p>
                {profile.description && <div><span className="text-gray-500 text-xs">Hakkinda / Aciklama:</span><p className="text-white text-sm whitespace-pre-wrap">{profile.description}</p></div>}
                {profile.email && <div><span className="text-gray-500 text-xs">E-posta:</span><p className="text-white text-sm">{profile.email}</p></div>}
                {profile.websites?.length > 0 && <div><span className="text-gray-500 text-xs">Web Siteleri:</span><p className="text-white text-sm">{profile.websites.join(', ')}</p></div>}
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            <h3 className="text-white font-semibold">WhatsApp Mesaji Gonder</h3>
            <p className="text-sm text-gray-500">WhatsApp uzerinden mesaj gonderin.</p>
            <div><label className="block text-sm text-gray-400 mb-1.5">Alici</label><input type="text" value={to} onChange={(e) => setTo(e.target.value)} placeholder="+905551111111" className="w-full bg-[#080b12] border border-[#1a2332] rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-blue-500/50 transition-all" /></div>
            <div><label className="block text-sm text-gray-400 mb-1.5">Mesaj</label><textarea value={message} onChange={(e) => setMessage(e.target.value)} rows={4} placeholder="Mesaj icerigi..." className="w-full bg-[#080b12] border border-[#1a2332] rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-blue-500/50 transition-all resize-none" /></div>
            <button onClick={() => callApi('/api/whatsapp/send', { to, message })} disabled={loading}
              className="px-6 py-2 bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-xl text-sm font-medium hover:shadow-lg hover:shadow-blue-500/20 transition-all disabled:opacity-50">
              {loading ? 'Gonderiliyor...' : 'Gonder'}
            </button>
            {result && <pre className="bg-[#080b12] rounded-xl p-4 text-sm text-gray-300 font-mono overflow-x-auto border border-[#1a2332]">{result}</pre>}
          </div>
        )}
      </div>
    </div>
  )
}
