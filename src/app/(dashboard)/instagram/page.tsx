'use client'
import { useState, useEffect } from 'react'

export default function InstagramPage() {
  const [tab, setTab] = useState<'config' | 'send'>('config')
  const [accessToken, setAccessToken] = useState('')
  const [igBusinessAccountId, setIgBusinessAccountId] = useState('')
  const [webhookToken, setWebhookToken] = useState('')
  const [active, setActive] = useState(false)
  const [to, setTo] = useState('')
  const [message, setMessage] = useState('')
  const [result, setResult] = useState('')
  const [loading, setLoading] = useState(false)
  const [saved, setSaved] = useState(false)
  const [webhookUrl, setWebhookUrl] = useState('')

  useEffect(() => {
    fetch('/api/instagram/config', { credentials: 'include' })
      .then(r => r.json()).then(d => {
        if (d.config) {
          setIgBusinessAccountId(d.config.igBusinessAccountId || '')
          setWebhookToken(d.config.webhookToken || '')
          setActive(d.config.active || false)
          setSaved(true)
        }
        if (d.webhookUrl) setWebhookUrl(d.webhookUrl)
      }).catch(() => {})
  }, [])

  const callApi = async (endpoint: string, body: object) => {
    setLoading(true); setResult('')
    try {
      const res = await fetch(endpoint, { method: 'POST', credentials: 'include', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
      const data = await res.json()
      setResult(JSON.stringify(data, null, 2))
      if (endpoint === '/api/instagram/config' && data.id) setSaved(true)
    } catch { setResult('Baglanti hatasi') }
    finally { setLoading(false) }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Instagram API</h1>
          <p className="text-sm text-gray-500 mt-1">Instagram Mesajlasma — per-tenant yapilandirma</p>
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

      <div className="flex gap-2">
        <button onClick={() => setTab('config')} className={'px-6 py-2 rounded-xl text-sm font-medium transition-all '+(tab==='config'?'bg-purple-500 text-white':'bg-[#0d1117]/80 border border-[#1a2332] text-gray-400 hover:text-white')}>Yapilandirma</button>
        <button onClick={() => setTab('send')} className={'px-6 py-2 rounded-xl text-sm font-medium transition-all '+(tab==='send'?'bg-purple-500 text-white':'bg-[#0d1117]/80 border border-[#1a2332] text-gray-400 hover:text-white')}>Mesaj Gonder</button>
      </div>

      <div className="bg-[#0d1117]/80 backdrop-blur-xl border border-[#1a2332] rounded-2xl p-6">
        {tab === 'config' ? (
          <div className="space-y-4">
            <div>
              <h3 className="text-white font-semibold">Instagram API Bilgileri</h3>
              <p className="text-sm text-gray-500 mt-1">Instagram Business hesabinizin bilgilerini girin. <a className="text-purple-400 hover:underline" href="https://developers.facebook.com" target="_blank">Meta Developers</a> panelinden alabilirsiniz.</p>
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1.5">Erisim Tokeni (instagram_manage_messages)</label>
              <input type="password" value={accessToken} onChange={(e) => setAccessToken(e.target.value)} placeholder="EAAx..."
                className="w-full bg-[#080b12] border border-[#1a2332] rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-purple-500/50 transition-all font-mono" />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1.5">Instagram Business Account ID</label>
              <input type="text" value={igBusinessAccountId} onChange={(e) => setIgBusinessAccountId(e.target.value)} placeholder="17841400000000000"
                className="w-full bg-[#080b12] border border-[#1a2332] rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-purple-500/50 transition-all font-mono" />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1.5">Webhook Dogrulama Tokeni (Verify Token)</label>
              <input type="text" value={webhookToken} onChange={(e) => setWebhookToken(e.target.value)} placeholder="kendiniz_belirleyin_ornek_123"
                className="w-full bg-[#080b12] border border-[#1a2332] rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-purple-500/50 transition-all font-mono" />
              <p className="text-xs text-gray-500 mt-1">Kendiniz bir dogrulama tokeni belirleyin. Meta webhook kurulumunda ayni degeri girin.</p>
            </div>
            <div className="flex items-center gap-3">
              <input type="checkbox" id="active" checked={active} onChange={(e) => setActive(e.target.checked)} className="w-4 h-4 rounded border-gray-600 bg-[#080b12]" />
              <label htmlFor="active" className="text-sm text-gray-300">Aktif (gelen mesajlari dinlemeye basla)</label>
            </div>
            <div className="flex gap-3">
              <button onClick={() => callApi('/api/instagram/test', {})} disabled={loading}
                className="px-6 py-2 bg-[#1a2332] text-gray-300 rounded-xl text-sm font-medium hover:bg-[#1f2a3a] border border-[#2a3a4a] transition-all disabled:opacity-50">
                {loading ? 'Test ediliyor...' : 'Baglantiyi Test Et'}
              </button>
              <button onClick={() => callApi('/api/instagram/config', { accessToken, igBusinessAccountId, webhookToken, active })} disabled={loading || !accessToken || !igBusinessAccountId || !webhookToken}
                className="px-6 py-2 bg-gradient-to-r from-purple-600 to-purple-500 text-white rounded-xl text-sm font-medium hover:shadow-lg hover:shadow-purple-500/20 transition-all disabled:opacity-50">
                {loading ? 'Kaydediliyor...' : 'Kaydet'}
              </button>
            </div>
            {result && <pre className="bg-[#080b12] rounded-xl p-4 text-sm text-gray-300 font-mono overflow-x-auto border border-[#1a2332]">{result}</pre>}
          </div>
        ) : (
          <div className="space-y-4">
            <h3 className="text-white font-semibold">Instagram DM Gonder</h3>
            <p className="text-sm text-gray-500">Bir Instagram kullanicisina ozel mesaj gonderin.</p>
            <div>
              <label className="block text-sm text-gray-400 mb-1.5">Alici ID (IG Scoped ID)</label>
              <input type="text" value={to} onChange={(e) => setTo(e.target.value)} placeholder="Kullanicinin Instagram ID'si"
                className="w-full bg-[#080b12] border border-[#1a2332] rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-purple-500/50 transition-all" />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1.5">Mesaj</label>
              <textarea value={message} onChange={(e) => setMessage(e.target.value)} rows={4} placeholder="Mesaj icerigi..."
                className="w-full bg-[#080b12] border border-[#1a2332] rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-purple-500/50 transition-all resize-none" />
            </div>
            <button onClick={() => callApi('/api/instagram/send', { to, message })} disabled={loading}
              className="px-6 py-2 bg-gradient-to-r from-purple-600 to-purple-500 text-white rounded-xl text-sm font-medium hover:shadow-lg hover:shadow-purple-500/20 transition-all disabled:opacity-50">
              {loading ? 'Gonderiliyor...' : 'Gonder'}
            </button>
            {result && <pre className="bg-[#080b12] rounded-xl p-4 text-sm text-gray-300 font-mono overflow-x-auto border border-[#1a2332]">{result}</pre>}
          </div>
        )}
      </div>
    </div>
  )
}
