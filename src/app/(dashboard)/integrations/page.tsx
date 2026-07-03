'use client'
import { useState, useEffect } from 'react'

const logoStyle = { width: '100%', height: '100%', objectFit: 'cover' } as any
const TGIC = () => <img src="/brk-mgmt/logos/telegram.png" alt="Telegram" style={logoStyle} />
const TYIC = () => <img src="/brk-mgmt/logos/trendyol.png" alt="Trendyol" style={logoStyle} />
const HBIC = () => <img src="/brk-mgmt/logos/hepsiburada.png" alt="Hepsiburada" style={logoStyle} />

const PLATFORMS = [
  { key: 'telegram', label: 'Telegram', color: '#0088cc', bg: 'rgba(0,136,204,0.1)', icon: TGIC, statusKey: 'telegram' },
  { key: 'trendyol', label: 'Trendyol', color: '#FF6000', bg: 'rgba(255,96,0,0.1)', icon: TYIC, statusKey: 'trendyol' },
  { key: 'hepsiburada', label: 'Hepsiburada', color: '#FF6000', bg: 'rgba(255,96,0,0.1)', icon: HBIC, statusKey: 'hepsiburada' },
]

type Tab = 'test' | 'send'

export default function IntegrationsPage() {
  const [statuses, setStatuses] = useState<Record<string, boolean>>({})
  const [activePlatform, setActivePlatform] = useState('telegram')
  const [tab, setTab] = useState<Tab>('test')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState('')

  const platform = PLATFORMS.find(p => p.key === activePlatform)!

  useEffect(() => {
    PLATFORMS.forEach(p => {
      fetch('/api/' + p.key + '/status', { credentials: 'include' })
        .then(r => r.json()).then(d => setStatuses(s => ({ ...s, [p.key]: d.configured }))).catch(() => {})
    })
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
    <div className="space-y-6 max-w-2xl mx-auto">
      <div className="text-center">
        <div>
          <h1 className="text-2xl font-bold text-white">API Entegrasyonlari</h1>
          <p className="text-sm text-gray-500 mt-1">Tum platform baglantilarinizi tek yerden yonetin</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3">
        {PLATFORMS.map(p => {
          const active = activePlatform === p.key
          const configured = statuses[p.key]
          const IconComp = p.icon
          return (
            <button key={p.key} onClick={() => { setActivePlatform(p.key); setResult(''); setTab('test') }}
              className={'relative text-left p-4 rounded-2xl border transition-all ' + (active ? 'ring-1' : 'border-[#1a2332] hover:border-gray-600')}
              style={{ backgroundColor: active ? p.bg : '#0d1117', borderColor: active ? p.color : undefined }}>
              <div className="flex items-center justify-between mb-3">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center p-2"
                  style={{ background: p.color }}>
                  <IconComp />
                </div>
                <div className={'w-2 h-2 rounded-full ' + (configured ? 'bg-green-400' : 'bg-yellow-400')} />
              </div>
              <p className="text-sm font-semibold text-white">{p.label}</p>
              <p className={'text-xs mt-0.5 ' + (configured ? 'text-green-400' : 'text-yellow-400')}>
                {configured ? 'Baglandi' : 'Ayarlanmadi'}
              </p>
            </button>
          )
        })}
      </div>

      <div className="bg-[#0d1117]/80 backdrop-blur-xl border border-[#1a2332] rounded-2xl p-6">
        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-[#1a2332]">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center p-2"
            style={{ background: platform.color }}>
            {platform.key === 'telegram' ? <TGIC /> : platform.key === 'trendyol' ? <TYIC /> : <HBIC />}
          </div>
          <div>
            <h2 className="text-white font-semibold">{platform.label}</h2>
            <p className={'text-xs ' + (statuses[platform.key] ? 'text-green-400' : 'text-yellow-400')}>
              {statuses[platform.key] ? 'Bagli' : 'Ayarlanmadi'}
            </p>
          </div>
        </div>

        <div className="flex gap-2 mb-6">
          <button onClick={() => setTab('test')}
            className={'px-5 py-2 rounded-xl text-sm font-medium transition-all '+(tab==='test'?'text-white border':'text-gray-400 bg-[#1a2332]/50')}
            style={tab==='test' ? { backgroundColor: platform.color + '20', borderColor: platform.color + '50', borderWidth: 1, color: platform.color } : {}}>
            Baglanti Test
          </button>
          <button onClick={() => setTab('send')}
            className={'px-5 py-2 rounded-xl text-sm font-medium transition-all '+(tab==='send'?'text-white border':'text-gray-400 bg-[#1a2332]/50')}
            style={tab==='send' ? { backgroundColor: platform.color + '20', borderColor: platform.color + '50', borderWidth: 1, color: platform.color } : {}}>
            Mesaj Gonder
          </button>
        </div>

        {tab === 'test' && platform.key === 'telegram' && (
          <TelegramTestForm platform={platform} loading={loading} callApi={callApi} result={result} />
        )}

        {tab === 'test' && platform.key === 'trendyol' && (
          <TrendyolTestForm platform={platform} loading={loading} callApi={callApi} result={result} />
        )}

        {tab === 'test' && platform.key === 'hepsiburada' && (
          <HepsiburadaTestForm platform={platform} loading={loading} callApi={callApi} result={result} />
        )}

        {tab === 'send' && (
          <SendMessageForm platform={platform} loading={loading} callApi={callApi} result={result} />
        )}
      </div>
    </div>
  )
}

function TelegramTestForm({ platform, loading, callApi, result }: any) {
  const [token, setToken] = useState('')
  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-500">Telegram Bot Token girin.</p>
      <input type="password" value={token} onChange={e => setToken(e.target.value)} placeholder="Bot Token"
        className="w-full bg-[#080b12] border border-[#1a2332] rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-600 font-mono" />
      <div className="flex gap-3">
        <button onClick={() => callApi('/api/telegram/test', { })} disabled={loading}
          className="px-6 py-2 rounded-xl text-sm font-medium text-white disabled:opacity-50" style={{ background: platform.color }}>{loading ? 'Test ediliyor...' : 'Test Et'}</button>
        <button onClick={() => callApi('/api/telegram/save-token', { token })} disabled={loading || !token}
          className="px-6 py-2 rounded-xl text-sm font-medium text-white disabled:opacity-50" style={{ background: platform.color }}>{loading ? 'Kaydediliyor...' : 'Kaydet'}</button>
      </div>
      {result && <pre className="bg-[#080b12] rounded-xl p-4 text-sm text-gray-300 font-mono border border-[#1a2332]">{result}</pre>}
    </div>
  )
}

function TrendyolTestForm({ platform, loading, callApi, result }: any) {
  const [apiKey, setApiKey] = useState('')
  const [apiSecret, setApiSecret] = useState('')
  const [supplierId, setSupplierId] = useState('')
  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-500">Trendyol API bilgilerinizi girin.</p>
      <input type="text" value={apiKey} onChange={e => setApiKey(e.target.value)} placeholder="API Key"
        className="w-full bg-[#080b12] border border-[#1a2332] rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-600 font-mono" />
      <input type="password" value={apiSecret} onChange={e => setApiSecret(e.target.value)} placeholder="API Secret"
        className="w-full bg-[#080b12] border border-[#1a2332] rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-600 font-mono" />
      <input type="text" value={supplierId} onChange={e => setSupplierId(e.target.value)} placeholder="Satici ID"
        className="w-full bg-[#080b12] border border-[#1a2332] rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-600 font-mono" />
      <div className="flex gap-3">
        <button onClick={() => callApi('/api/trendyol/test', { apiKey, apiSecret, supplierId })} disabled={loading}
          className="px-6 py-2 rounded-xl text-sm font-medium text-white disabled:opacity-50" style={{ background: platform.color }}>{loading ? 'Test ediliyor...' : 'Test Et'}</button>
        <button onClick={() => callApi('/api/trendyol/save-config', { apiKey, apiSecret, supplierId })} disabled={loading || !apiKey || !apiSecret || !supplierId}
          className="px-6 py-2 rounded-xl text-sm font-medium text-white disabled:opacity-50" style={{ background: platform.color }}>{loading ? 'Kaydediliyor...' : 'Kaydet'}</button>
      </div>
      {result && <pre className="bg-[#080b12] rounded-xl p-4 text-sm text-gray-300 font-mono border border-[#1a2332]">{result}</pre>}
    </div>
  )
}

function HepsiburadaTestForm({ platform, loading, callApi, result }: any) {
  const [apiKey, setApiKey] = useState('')
  const [apiSecret, setApiSecret] = useState('')
  const [merchantId, setMerchantId] = useState('')
  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-500">Hepsiburada API bilgilerinizi girin.</p>
      <input type="text" value={apiKey} onChange={e => setApiKey(e.target.value)} placeholder="API Key"
        className="w-full bg-[#080b12] border border-[#1a2332] rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-600 font-mono" />
      <input type="password" value={apiSecret} onChange={e => setApiSecret(e.target.value)} placeholder="API Secret"
        className="w-full bg-[#080b12] border border-[#1a2332] rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-600 font-mono" />
      <input type="text" value={merchantId} onChange={e => setMerchantId(e.target.value)} placeholder="Satici ID"
        className="w-full bg-[#080b12] border border-[#1a2332] rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-600 font-mono" />
      <div className="flex gap-3">
        <button onClick={() => callApi('/api/hepsiburada/test', { apiKey, apiSecret, merchantId })} disabled={loading}
          className="px-6 py-2 rounded-xl text-sm font-medium text-white disabled:opacity-50" style={{ background: platform.color }}>{loading ? 'Test ediliyor...' : 'Test Et'}</button>
        <button onClick={() => callApi('/api/hepsiburada/save-config', { apiKey, apiSecret, merchantId })} disabled={loading || !apiKey || !apiSecret || !merchantId}
          className="px-6 py-2 rounded-xl text-sm font-medium text-white disabled:opacity-50" style={{ background: platform.color }}>{loading ? 'Kaydediliyor...' : 'Kaydet'}</button>
      </div>
      {result && <pre className="bg-[#080b12] rounded-xl p-4 text-sm text-gray-300 font-mono border border-[#1a2332]">{result}</pre>}
    </div>
  )
}

function SendMessageForm({ platform, loading, callApi, result }: any) {
  const [to, setTo] = useState('')
  const [message, setMessage] = useState('')
  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-500">{platform.label} uzerinden mesaj gonderin.</p>
      <input type="text" value={to} onChange={e => setTo(e.target.value)} placeholder="Alici ID"
        className="w-full bg-[#080b12] border border-[#1a2332] rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-600" />
      <textarea value={message} onChange={e => setMessage(e.target.value)} rows={4} placeholder="Mesaj icerigi..."
        className="w-full bg-[#080b12] border border-[#1a2332] rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-600 resize-none" />
      <button onClick={() => callApi('/api/' + platform.key + '/send', { to, message })} disabled={loading || !to || !message}
        className="px-6 py-2 rounded-xl text-sm font-medium text-white disabled:opacity-50" style={{ background: platform.color }}>
        {loading ? 'Gonderiliyor...' : 'Gonder'}
      </button>
      {result && <pre className="bg-[#080b12] rounded-xl p-4 text-sm text-gray-300 font-mono border border-[#1a2332]">{result}</pre>}
    </div>
  )
}
