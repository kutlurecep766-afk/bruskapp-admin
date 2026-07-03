'use client'
import { useState } from 'react'

export default function WhatsAppPage() {
  const [tab, setTab] = useState<'test' | 'send'>('test')
  const [to, setTo] = useState('')
  const [message, setMessage] = useState('')
  const [result, setResult] = useState('')
  const [loading, setLoading] = useState(false)

  const callApi = async (endpoint: string, body: object) => {
    setLoading(true); setResult('')
    try {
      const res = await fetch(endpoint, { method: 'POST', credentials: 'include', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
      const data = await res.json()
      setResult(JSON.stringify(data, null, 2))
    } catch { setResult('Baglanti hatasi') }
    finally { setLoading(false) }
  }

  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-bold text-white">WhatsApp API</h1><p className="text-sm text-gray-500 mt-1">WhatsApp Business API entegrasyonu</p></div>
      <div className="flex gap-2">
        <button onClick={() => setTab('test')} className={'px-6 py-2 rounded-xl text-sm font-medium transition-all '+(tab==='test'?'bg-blue-500 text-white':'bg-[#0d1117]/80 border border-[#1a2332] text-gray-400 hover:text-white')}>Baglanti Testi</button>
        <button onClick={() => setTab('send')} className={'px-6 py-2 rounded-xl text-sm font-medium transition-all '+(tab==='send'?'bg-blue-500 text-white':'bg-[#0d1117]/80 border border-[#1a2332] text-gray-400 hover:text-white')}>Mesaj Gonder</button>
      </div>
      <div className="bg-[#0d1117]/80 backdrop-blur-xl border border-[#1a2332] rounded-2xl p-6">
        {tab === 'test' ? (
          <div className="space-y-4">
            <h3 className="text-white font-semibold">API Baglanti Testi</h3>
            <p className="text-sm text-gray-500">WhatsApp API baglantisini test edin.</p>
            <button onClick={() => callApi('/api/whatsapp/test', {})} disabled={loading} className="px-6 py-2 bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-xl text-sm font-medium hover:shadow-lg hover:shadow-blue-500/20 transition-all disabled:opacity-50">{loading ? 'Test ediliyor...' : 'Test Et'}</button>
            {result && <pre className="bg-[#080b12] rounded-xl p-4 text-sm text-gray-300 font-mono overflow-x-auto border border-[#1a2332]">{result}</pre>}
          </div>
        ) : (
          <div className="space-y-4">
            <h3 className="text-white font-semibold">WhatsApp Mesaji Gonder</h3>
            <p className="text-sm text-gray-500">WhatsApp uzerinden mesaj gonderin.</p>
            <div><label className="block text-sm text-gray-400 mb-1.5">Alici</label><input type="text" value={to} onChange={(e) => setTo(e.target.value)} placeholder="+905551111111" className="w-full bg-[#080b12] border border-[#1a2332] rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-blue-500/50 transition-all" /></div>
            <div><label className="block text-sm text-gray-400 mb-1.5">Mesaj</label><textarea value={message} onChange={(e) => setMessage(e.target.value)} rows={4} placeholder="Mesaj icerigi..." className="w-full bg-[#080b12] border border-[#1a2332] rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-blue-500/50 transition-all resize-none" /></div>
            <button onClick={() => callApi('/api/whatsapp/send', { to, message })} disabled={loading} className="px-6 py-2 bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-xl text-sm font-medium hover:shadow-lg hover:shadow-blue-500/20 transition-all disabled:opacity-50">{loading ? 'Gonderiliyor...' : 'Gonder'}</button>
            {result && <pre className="bg-[#080b12] rounded-xl p-4 text-sm text-gray-300 font-mono overflow-x-auto border border-[#1a2332]">{result}</pre>}
          </div>
        )}
      </div>
    </div>
  )
}