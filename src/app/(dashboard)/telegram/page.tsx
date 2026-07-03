'use client'
import { useState, useEffect } from 'react'
import { Power, Brain, Send, Settings, Key, RefreshCw, Activity } from 'lucide-react'

export default function TelegramPage() {
  const [tab, setTab] = useState<'config' | 'send'>('config')
  const [token, setToken] = useState('')
  const [chatId, setChatId] = useState('')
  const [message, setMessage] = useState('')
  const [result, setResult] = useState('')
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState<any>(null)
  const [polling, setPolling] = useState<any>(null)
  const [deepseek, setDeepSeek] = useState<any>(null)

  const fetchStatus = () => {
    fetch('/api/telegram/status', { credentials: 'include' })
      .then(r => r.json()).then(setStatus).catch(() => {})
    fetch('/api/telegram/polling-status', { credentials: 'include' })
      .then(r => r.json()).then(setPolling).catch(() => {})
    fetch('/api/telegram/deepseek-status', { credentials: 'include' })
      .then(r => r.json()).then(setDeepSeek).catch(() => {})
  }

  useEffect(() => { fetchStatus() }, [])

  const callApi = async (endpoint: string, body?: object) => {
    setLoading(true); setResult('')
    try {
      const opts: any = { method: 'POST', credentials: 'include', headers: { 'Content-Type': 'application/json' } }
      if (body) opts.body = JSON.stringify(body)
      const res = await fetch(endpoint, opts)
      const data = await res.json()
      setResult(JSON.stringify(data, null, 2))
      return data
    } catch { setResult('Bağlantı hatası') }
    finally { setLoading(false) }
  }

  const toggleBot = async () => {
    const data = await callApi('/api/telegram/toggle')
    if (data) {
      const endpoint = data.active ? '/bot-api/resume' : '/bot-api/pause'
      fetch(endpoint, { method: 'POST', credentials: 'include' }).catch(() => {})
    }
    if (data) fetchStatus()
  }

  const toggleDeepSeek = async () => {
    const data = await callApi('/api/telegram/deepseek-toggle')
    if (data) fetchStatus()
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col items-center text-center gap-2 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Sistem Kontrol</h1>
          <p className="text-sm text-gray-500 mt-1">Telegram bot ve AI servis yönetimi</p>
        </div>
        {polling && (
          <div className={'flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-medium w-28 justify-center ' + (polling.active ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400')}>
            <Activity size={14} />
            {polling.active ? 'Aktif' : 'Devre Dışı'}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 gap-6">
        {/* Telegram Bot Toggle */}
        <div className="bg-[#0d1117]/80 backdrop-blur-xl border border-[#1a2332] rounded-2xl p-6 hover:border-[#2a3a4a] transition-all text-center max-w-md mx-auto w-full">
          <div className={'w-12 h-12 mx-auto rounded-xl flex items-center justify-center mb-3 ' + (polling?.active ? 'bg-green-500/20 text-green-400' : 'bg-[#1a2332] text-gray-500')}>
            <Power size={24} />
          </div>
          <h3 className="text-white font-semibold">Telegram Bot</h3>
          <p className="text-xs text-gray-500 mt-1">
            {polling?.active ? 'Mesajları dinliyor' :
             polling?.paused ? 'Durduruldu' :
             'Yapılandırılmamış'}
          </p>
          <div className="mt-4 flex justify-center">
            <button
              onClick={toggleBot}
              disabled={loading || !polling?.configured}
              className={'flex items-center justify-center gap-2 px-5 py-2 rounded-xl text-sm font-medium transition-all duration-200 disabled:opacity-40 w-28 ' +
                (polling?.active
                  ? 'bg-green-500/20 text-green-400 hover:bg-green-500/30 border border-green-500/30'
                  : 'bg-[#1a2332] text-gray-400 hover:bg-[#2a3a4a] border border-[#2a3a4a]')}
            >
              <div className={'w-2 h-2 rounded-full ' + (polling?.active ? 'bg-green-400 animate-pulse' : 'bg-gray-500')} />
              {polling?.active ? 'Aktif' : 'Kapalı'}
            </button>
          </div>
          <div className="flex items-center justify-center gap-4 pt-4 mt-4 border-t border-[#1a2332] text-xs text-gray-500">
            <div className="flex items-center gap-1.5">
              <span className={'w-1.5 h-1.5 rounded-full ' + (polling?.configured ? 'bg-green-400' : 'bg-red-400')} />
              Bot {polling?.configured ? 'ayarlı' : 'ayarsız'}
            </div>
            <div className="flex items-center gap-1.5">
              <span className={'w-1.5 h-1.5 rounded-full ' + (polling?.polling ? 'bg-blue-400' : 'bg-gray-500')} />
              Polling {polling?.polling ? 'çalışıyor' : 'kapalı'}
            </div>
          </div>
        </div>

        {/* DeepSeek AI Toggle */}
        <div className="bg-[#0d1117]/80 backdrop-blur-xl border border-[#1a2332] rounded-2xl p-6 hover:border-[#2a3a4a] transition-all text-center max-w-md mx-auto w-full">
          <div className={'w-12 h-12 mx-auto rounded-xl flex items-center justify-center mb-3 ' + (deepseek?.active ? 'bg-purple-500/20 text-purple-400' : 'bg-[#1a2332] text-gray-500')}>
            <Brain size={24} />
          </div>
          <h3 className="text-white font-semibold">DeepSeek AI</h3>
          <p className="text-xs text-gray-500 mt-1">
            {deepseek?.active ? 'Token tüketimi aktif' :
             deepseek?.paused ? 'Durduruldu' :
             'API anahtarı tanımlanmamış'}
          </p>
          <div className="mt-4 flex justify-center">
            <button
              onClick={toggleDeepSeek}
              disabled={loading || !deepseek?.configured}
              className={'flex items-center justify-center gap-2 px-5 py-2 rounded-xl text-sm font-medium transition-all duration-200 disabled:opacity-40 w-28 ' +
                (deepseek?.active
                  ? 'bg-purple-500/20 text-purple-400 hover:bg-purple-500/30 border border-purple-500/30'
                  : 'bg-[#1a2332] text-gray-400 hover:bg-[#2a3a4a] border border-[#2a3a4a]')}
            >
              <div className={'w-2 h-2 rounded-full ' + (deepseek?.active ? 'bg-purple-400 animate-pulse' : 'bg-gray-500')} />
              {deepseek?.active ? 'Aktif' : 'Kapalı'}
            </button>
          </div>
          <div className="flex items-center justify-center gap-4 pt-4 mt-4 border-t border-[#1a2332] text-xs text-gray-500">
            <div className="flex items-center gap-1.5">
              <span className={'w-1.5 h-1.5 rounded-full ' + (deepseek?.configured ? 'bg-purple-400' : 'bg-red-400')} />
              API {deepseek?.configured ? 'ayarlı' : 'ayarsız'}
            </div>
            <div className="flex items-center gap-1.5">
              <span className={'w-1.5 h-1.5 rounded-full ' + (deepseek?.active ? 'bg-green-400' : 'bg-gray-500')} />
              {deepseek?.active ? 'Aktif' : 'Kapalı'}
            </div>
          </div>
        </div>
      </div>

      {/* Tab buttons */}
      <div className="flex gap-2 justify-center">
        <button onClick={() => setTab('config')}
          className={'flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all w-40 '+(tab==='config'?'bg-blue-500 text-white shadow-lg shadow-blue-500/20':'bg-[#0d1117]/80 border border-[#1a2332] text-gray-400 hover:text-white hover:border-[#2a3a4a]')}>
          <Settings size={16} />
          Bot Ayarları
        </button>
        <button onClick={() => setTab('send')}
          className={'flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all w-40 '+(tab==='send'?'bg-blue-500 text-white shadow-lg shadow-blue-500/20':'bg-[#0d1117]/80 border border-[#1a2332] text-gray-400 hover:text-white hover:border-[#2a3a4a]')}>
          <Send size={16} />
          Mesaj Gönder
        </button>
      </div>

      <div className="bg-[#0d1117]/80 backdrop-blur-xl border border-[#1a2332] rounded-2xl p-6 max-w-md mx-auto w-full">
        {tab === 'config' ? (
          <div className="space-y-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center">
                <Key size={20} />
              </div>
              <div>
                <h3 className="text-white font-semibold">Bot Token</h3>
                <p className="text-sm text-gray-500">@BotFather token'i buraya gir, otomatik bağlanır ve polling başlar.</p>
              </div>
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1.5">Bot Token</label>
              <input type="password" value={token} onChange={(e) => setToken(e.target.value)}
                placeholder="0000000000:xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                className="w-full bg-[#080b12] border border-[#1a2332] rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-blue-500/50 transition-all font-mono" />
            </div>
            <div className="flex gap-3 flex-wrap">
              <button onClick={() => callApi('/api/telegram/test', { token })} disabled={loading || !token}
                className="flex items-center justify-center gap-2 px-5 py-2 bg-[#1a2332] text-gray-300 rounded-xl text-sm font-medium hover:bg-[#2a3a4a] border border-[#2a3a4a] transition-all disabled:opacity-50 w-36">
                <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
                {loading ? 'Test ediliyor...' : 'Token Test'}
              </button>
              <button onClick={() => callApi('/api/telegram/save-token', { token })} disabled={loading || !token}
                className="flex items-center justify-center gap-2 px-5 py-2 bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-xl text-sm font-medium hover:shadow-lg hover:shadow-blue-500/20 transition-all disabled:opacity-50 w-44">
                <Key size={16} />
                {loading ? 'Kaydediliyor...' : 'Kaydet ve Aktif Et'}
              </button>
            </div>
            {result && (
              <div>
                <pre className="bg-[#080b12] rounded-xl p-4 text-sm text-gray-300 font-mono overflow-x-auto border border-[#1a2332]">{result}</pre>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                <Send size={20} />
              </div>
              <div>
                <h3 className="text-white font-semibold">Mesaj Gönder</h3>
                <p className="text-sm text-gray-500">Telegram üzerinden kullanıcıya mesaj gönder.</p>
              </div>
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1.5">Chat ID</label>
              <input type="text" value={chatId} onChange={(e) => setChatId(e.target.value)} placeholder="-1000000000000"
                className="w-full bg-[#080b12] border border-[#1a2332] rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-blue-500/50 transition-all" />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1.5">Mesaj</label>
              <textarea value={message} onChange={(e) => setMessage(e.target.value)} rows={4} placeholder="Mesaj içeriği..."
                className="w-full bg-[#080b12] border border-[#1a2332] rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-blue-500/50 transition-all resize-none" />
            </div>
            <button onClick={() => callApi('/api/telegram/send', { chatId, message })} disabled={loading}
              className="flex items-center justify-center gap-2 px-5 py-2 bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-xl text-sm font-medium hover:shadow-lg hover:shadow-blue-500/20 transition-all disabled:opacity-50 w-32">
              <Send size={16} />
              {loading ? 'Gönderiliyor...' : 'Gönder'}
            </button>
            {result && (
              <div>
                <pre className="bg-[#080b12] rounded-xl p-4 text-sm text-gray-300 font-mono overflow-x-auto border border-[#1a2332]">{result}</pre>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
