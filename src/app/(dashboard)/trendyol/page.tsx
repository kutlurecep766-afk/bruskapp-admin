'use client'
import { useState, useEffect } from 'react'

export default function TrendyolPage() {
  const [tab, setTab] = useState<'config' | 'send'>('config')
  const [apiKey, setApiKey] = useState('')
  const [apiSecret, setApiSecret] = useState('')
  const [supplierId, setSupplierId] = useState('')
  const [to, setTo] = useState('')
  const [message, setMessage] = useState('')
  const [result, setResult] = useState('')
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState<any>(null)

  useEffect(() => {
    fetch('/api/trendyol/status', { credentials: 'include' })
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
          <h1 className="text-2xl font-bold text-white">Trendyol Entegrasyonu</h1>
          <p className="text-sm text-gray-500 mt-1">Trendyol satici mesajlasma - musteri mesajlarini goruntuleyin ve yanitlayin</p>
        </div>
        {status && (
          <div className={'flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-medium ' + (status.configured ? 'bg-orange-500/10 text-orange-400' : 'bg-yellow-500/10 text-yellow-400')}>
            <div className={'w-2 h-2 rounded-full ' + (status.configured ? 'bg-orange-400' : 'bg-yellow-400')} />
            {status.configured ? 'Bagli' : 'Ayarlanmadi'}
          </div>
        )}
      </div>

      <div className="flex gap-2">
        <button onClick={() => setTab('config')}
          className={'px-6 py-2 rounded-xl text-sm font-medium transition-all '+(tab==='config'?'bg-orange-500 text-white':'bg-[#0d1117]/80 border border-[#1a2332] text-gray-400 hover:text-white')}>
          API Ayarlari
        </button>
        <button onClick={() => setTab('send')}
          className={'px-6 py-2 rounded-xl text-sm font-medium transition-all '+(tab==='send'?'bg-orange-500 text-white':'bg-[#0d1117]/80 border border-[#1a2332] text-gray-400 hover:text-white')}>
          Mesaj Gonder
        </button>
      </div>

      <div className="bg-[#0d1117]/80 backdrop-blur-xl border border-[#1a2332] rounded-2xl p-6">
        {tab === 'config' ? (
          <div className="space-y-4">
            <div>
              <h3 className="text-white font-semibold">Trendyol API Bilgileri</h3>
              <p className="text-sm text-gray-500 mt-1">Trendyol satici panelinden (Satici &gt; Entegrasyon &gt; API) aldiginiz API Key, API Secret ve Satici ID bilgilerini girin.</p>
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1.5">API Key</label>
              <input type="text" value={apiKey} onChange={(e) => setApiKey(e.target.value)}
                placeholder="api-key"
                className="w-full bg-[#080b12] border border-[#1a2332] rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-orange-500/50 transition-all font-mono" />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1.5">API Secret</label>
              <input type="password" value={apiSecret} onChange={(e) => setApiSecret(e.target.value)}
                placeholder="api-secret"
                className="w-full bg-[#080b12] border border-[#1a2332] rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-orange-500/50 transition-all font-mono" />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1.5">Satici ID (Supplier ID)</label>
              <input type="text" value={supplierId} onChange={(e) => setSupplierId(e.target.value)}
                placeholder="123456"
                className="w-full bg-[#080b12] border border-[#1a2332] rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-orange-500/50 transition-all font-mono" />
            </div>
            <div className="flex gap-3">
              <button onClick={() => callApi('/api/trendyol/test', { apiKey, apiSecret, supplierId })} disabled={loading || !apiKey || !apiSecret || !supplierId}
                className="px-6 py-2 bg-[#1a2332] text-gray-300 rounded-xl text-sm font-medium hover:bg-[#1f2a3a] border border-[#2a3a4a] transition-all disabled:opacity-50">
                {loading ? 'Test ediliyor...' : 'Baglantiyi Test Et'}
              </button>
              <button onClick={() => callApi('/api/trendyol/save-config', { apiKey, apiSecret, supplierId })} disabled={loading || !apiKey || !apiSecret || !supplierId}
                className="px-6 py-2 bg-gradient-to-r from-orange-600 to-orange-500 text-white rounded-xl text-sm font-medium hover:shadow-lg hover:shadow-orange-500/20 transition-all disabled:opacity-50">
                {loading ? 'Kaydediliyor...' : 'Kaydet ve Aktif Et'}
              </button>
            </div>
            {result && <pre className="bg-[#080b12] rounded-xl p-4 text-sm text-gray-300 font-mono overflow-x-auto border border-[#1a2332]">{result}</pre>}
          </div>
        ) : (
          <div className="space-y-4">
            <h3 className="text-white font-semibold">Trendyol Mesaj Gonder</h3>
            <p className="text-sm text-gray-500">Bir musteriye Trendyol uzerinden mesaj gonderin.</p>
            <div>
              <label className="block text-sm text-gray-400 mb-1.5">Alici ID (Musteri no)</label>
              <input type="text" value={to} onChange={(e) => setTo(e.target.value)} placeholder="Musteri ID"
                className="w-full bg-[#080b12] border border-[#1a2332] rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-orange-500/50 transition-all" />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1.5">Mesaj</label>
              <textarea value={message} onChange={(e) => setMessage(e.target.value)} rows={4} placeholder="Mesaj icerigi..."
                className="w-full bg-[#080b12] border border-[#1a2332] rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-orange-500/50 transition-all resize-none" />
            </div>
            <button onClick={() => callApi('/api/trendyol/send', { to, message })} disabled={loading}
              className="px-6 py-2 bg-gradient-to-r from-orange-600 to-orange-500 text-white rounded-xl text-sm font-medium hover:shadow-lg hover:shadow-orange-500/20 transition-all disabled:opacity-50">
              {loading ? 'Gonderiliyor...' : 'Gonder'}
            </button>
            {result && <pre className="bg-[#080b12] rounded-xl p-4 text-sm text-gray-300 font-mono overflow-x-auto border border-[#1a2332]">{result}</pre>}
          </div>
        )}
      </div>
    </div>
  )
}
