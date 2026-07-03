'use client'
import { useState, useEffect } from 'react'

export default function InstagramPage() {
  const [tab, setTab] = useState<'config' | 'send'>('config')
  const [userId, setUserId] = useState('')
  const [token, setToken] = useState('')
  const [to, setTo] = useState('')
  const [message, setMessage] = useState('')
  const [result, setResult] = useState('')
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState<any>(null)

  useEffect(() => {
    fetch('/api/instagram/status', { credentials: 'include' })
      .then(r => r.json()).then(setStatus).catch(() => {})
  }, [])

  const callApi = async (endpoint: string, body: object) => {
    setLoading(true); setResult('')
    try {
      const res = await fetch(endpoint, { method: 'POST', credentials: 'include', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
      setResult(JSON.stringify(await res.json(), null, 2))
    } catch { setResult('Baglanti hatasi') }
    finally { setLoading(false) }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Instagram API</h1>
          <p className="text-sm text-gray-500 mt-1">Instagram Mesajlasma — gelen mesajlari goruntuleyin ve yanitlayin</p>
        </div>
        {status && (
          <div className={'flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-medium ' + (status.configured ? 'bg-purple-500/10 text-purple-400' : 'bg-yellow-500/10 text-yellow-400')}>
            <div className={'w-2 h-2 rounded-full ' + (status.configured ? 'bg-purple-400' : 'bg-yellow-400')} />
            {status.configured ? 'Bagli' : 'Ayarlanmadi'}
          </div>
        )}
      </div>

      <div className="flex gap-2">
        <button onClick={() => setTab('config')}
          className={'px-6 py-2 rounded-xl text-sm font-medium transition-all '+(tab==='config'?'bg-purple-500 text-white':'bg-[#0d1117]/80 border border-[#1a2332] text-gray-400 hover:text-white')}>
          API Ayarlari
        </button>
        <button onClick={() => setTab('send')}
          className={'px-6 py-2 rounded-xl text-sm font-medium transition-all '+(tab==='send'?'bg-purple-500 text-white':'bg-[#0d1117]/80 border border-[#1a2332] text-gray-400 hover:text-white')}>
          Mesaj Gonder
        </button>
      </div>

      <div className="bg-[#0d1117]/80 backdrop-blur-xl border border-[#1a2332] rounded-2xl p-6">
        {tab === 'config' ? (
          <div className="space-y-4">
            <div>
              <h3 className="text-white font-semibold">Instagram API Bilgileri</h3>
              <p className="text-sm text-gray-500 mt-1">Instagram Business hesabinizin ID'sini ve uzun omurlu sayfa erisim token'ini girin.</p>
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1.5">Instagram Business Account ID</label>
              <input type="text" value={userId} onChange={(e) => setUserId(e.target.value)}
                placeholder="17841400000000000"
                className="w-full bg-[#080b12] border border-[#1a2332] rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-purple-500/50 transition-all font-mono" />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1.5">Erisim Tokeni</label>
              <input type="password" value={token} onChange={(e) => setToken(e.target.value)}
                placeholder="EAAx..."
                className="w-full bg-[#080b12] border border-[#1a2332] rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-purple-500/50 transition-all font-mono" />
            </div>
            <div className="flex gap-3">
              <button onClick={() => callApi('/api/instagram/test', { userId, token })} disabled={loading || !userId || !token}
                className="px-6 py-2 bg-[#1a2332] text-gray-300 rounded-xl text-sm font-medium hover:bg-[#1f2a3a] border border-[#2a3a4a] transition-all disabled:opacity-50">
                {loading ? 'Test ediliyor...' : 'Baglantiyi Test Et'}
              </button>
              <button onClick={() => callApi('/api/instagram/save-config', { userId, token })} disabled={loading || !userId || !token}
                className="px-6 py-2 bg-gradient-to-r from-purple-600 to-purple-500 text-white rounded-xl text-sm font-medium hover:shadow-lg hover:shadow-purple-500/20 transition-all disabled:opacity-50">
                {loading ? 'Kaydediliyor...' : 'Kaydet ve Aktif Et'}
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
