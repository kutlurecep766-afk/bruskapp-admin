'use client'
import { useState, useEffect, useRef, useCallback } from 'react'
import { Bot, Send, RotateCcw, AlertTriangle, Loader2, Sparkles } from 'lucide-react'

type Msg = { role: 'user' | 'assistant'; content: string }

interface Config {
  businessName?: string
  description?: string
  knowledgeBase?: string
  systemPrompt?: string
  products?: any[]
  services?: any[]
  faqs?: any[]
  welcomeMessage?: string
}

const GREETING: Msg = {
  role: 'assistant',
  content: 'Merhaba! Ben işletmenizin yapay zeka asistanıyım.\n\nBuradan her şeyi benimle yönetebilirsiniz: işletmenizi tanıtın, ürün/hizmet ve fiyatlarınızı ekleyin, çalışma saatleri, adres, teslimat/kampanya kuralları ve sık sorduğunuz soruları anlatın — hepsini otomatik ayarlarım.\n\nMüşterilerinizin sorularını da bana sorabilirsiniz; kısa ve net özetlerim.',
}

const QUICK = [
  'İşletmemi tanıtayım',
  'Ürün ve fiyatlarımızı ekle',
  'Çalışma saatleri ve adres',
  'Sık sorulan soruları ekle',
  'Kampanya kuralı ekle',
]

export default function WebchatPage() {
  const [config, setConfig] = useState<Config | null>(null)
  const [chat, setChat] = useState<Msg[]>([GREETING])
  const [input, setInput] = useState('')
  const [busy, setBusy] = useState(false)
  const [showReset, setShowReset] = useState(false)
  const [resetBusy, setResetBusy] = useState(false)

  const scrollRef = useRef<HTMLDivElement>(null)
  const taRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    fetch('/api/webchat/config', { credentials: 'include' })
      .then(r => r.ok ? r.json() : null)
      .then(d => { if (d) setConfig(d) })
      .catch(() => {})
  }, [])

  useEffect(() => {
    const el = scrollRef.current
    if (el) el.scrollTop = el.scrollHeight
  }, [chat, busy])

  useEffect(() => {
    const el = taRef.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = Math.min(el.scrollHeight, 140) + 'px'
  }, [input])

  const configured = !!(config && ((config.products && config.products.length > 0) || (config.services && config.services.length > 0) || (config.faqs && config.faqs.length > 0) || (config.knowledgeBase && config.knowledgeBase.trim()) || (config.systemPrompt && config.systemPrompt.trim())))

  const send = useCallback(async (textArg?: string) => {
    const text = (textArg ?? input).trim()
    if (!text || busy) return
    const msgs: Msg[] = [...chat, { role: 'user', content: text }]
    setChat(msgs); setInput(''); setBusy(true)
    try {
      const res = await fetch('/api/webchat/train', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ messages: msgs }),
      })
      if (res.ok) {
        const d = await res.json()
        setChat([...msgs, { role: 'assistant', content: d.reply || '...' }])
        if (d.config) setConfig(d.config)
      } else {
        setChat([...msgs, { role: 'assistant', content: 'Bağlantı hatası. Lütfen tekrar deneyin.' }])
      }
    } catch {
      setChat([...msgs, { role: 'assistant', content: 'Bağlantı hatası. Lütfen tekrar deneyin.' }])
    } finally { setBusy(false) }
  }, [input, busy, chat])

  const onKey = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send() }
  }

  const doReset = async () => {
    setResetBusy(true)
    try {
      const res = await fetch('/api/webchat/reset', { method: 'POST', credentials: 'include' })
      if (res.ok) {
        const d = await res.json()
        setConfig(d)
        setChat([{ role: 'assistant', content: 'Tüm bilgiler sıfırlandı. Baştan başlayalım — işletmenizi tanıtın.' }])
        setShowReset(false)
      }
    } catch {} finally { setResetBusy(false) }
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex flex-col h-[calc(100dvh-8.5rem)] min-h-[520px] rounded-3xl border border-[#1a2332] overflow-hidden shadow-2xl shadow-black/40 bg-gradient-to-b from-[#0f1420] to-[#0a0e14]">

        {/* Header */}
        <div className="relative flex items-center justify-between px-4 sm:px-5 py-3.5 border-b border-[#1a2332] bg-[#0d1117]/70">
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-blue-500/40 to-transparent" />
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/25 flex-shrink-0">
              <Bot size={20} className="text-white" />
            </div>
            <div className="min-w-0">
              <h1 className="text-white font-semibold text-sm sm:text-base leading-tight truncate">Yapay Zeka Asistanı</h1>
              <p className="text-[11px] text-gray-500 flex items-center gap-1.5 mt-0.5">
                <span className={'w-1.5 h-1.5 rounded-full ' + (configured ? 'bg-emerald-400' : 'bg-amber-400 animate-pulse')} />
                {configured ? 'Eğitildi · işletmenizi tanıyor' : 'Henüz eğitilmedi · sohbetle başlayın'}
              </p>
            </div>
          </div>
          <button onClick={() => setShowReset(true)} title="Sıfırla" className="w-9 h-9 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 hover:scale-105 active:scale-95 flex items-center justify-center transition-all flex-shrink-0">
            <RotateCcw size={16} />
          </button>
        </div>

        {/* Messages */}
        <div ref={scrollRef} className="flex-1 min-h-0 overflow-y-auto px-4 sm:px-5 py-5 space-y-4">
          {chat.map((m, i) => (
            m.role === 'user' ? (
              <div key={i} className="flex justify-end">
                <div className="max-w-[82%] px-4 py-2.5 rounded-2xl rounded-tr-md bg-gradient-to-br from-blue-600 to-blue-500 text-white text-sm leading-relaxed whitespace-pre-wrap break-words shadow-lg shadow-blue-500/20">
                  {m.content}
                </div>
              </div>
            ) : (
              <div key={i} className="flex gap-2.5 justify-start">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center flex-shrink-0 shadow-lg shadow-blue-500/20 mt-0.5">
                  <Bot size={15} className="text-white" />
                </div>
                <div className="max-w-[82%] px-4 py-2.5 rounded-2xl rounded-tl-md bg-[#151b26] border border-[#232f42] text-gray-100 text-sm leading-relaxed whitespace-pre-wrap break-words">
                  {m.content}
                </div>
              </div>
            )
          ))}

          {busy && (
            <div className="flex gap-2.5 justify-start">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center flex-shrink-0 shadow-lg shadow-blue-500/20">
                <Bot size={15} className="text-white" />
              </div>
              <div className="px-4 py-3 rounded-2xl rounded-tl-md bg-[#151b26] border border-[#232f42] flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          )}

          {chat.length === 1 && !busy && (
            <div className="flex flex-wrap gap-2 pt-1">
              {QUICK.map(q => (
                <button key={q} onClick={() => send(q)} className="px-3 py-1.5 rounded-full text-xs font-medium bg-blue-500/10 text-blue-300 border border-blue-500/20 hover:bg-blue-500/20 hover:border-blue-500/40 active:scale-95 transition-all">
                  {q}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Input */}
        <div className="p-3 sm:p-4 border-t border-[#1a2332] bg-[#0d1117]/70">
          <div className="flex items-end gap-2 rounded-2xl bg-[#080b12] border border-[#1a2332] focus-within:border-blue-500/50 p-1.5 pl-3 transition-colors">
            <textarea
              ref={taRef}
              rows={1}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={onKey}
              placeholder="İşletmenizle ilgili yazın veya bir soru sorun..."
              className="flex-1 bg-transparent text-white text-sm resize-none focus:outline-none placeholder-gray-600 py-2 max-h-36 leading-relaxed"
            />
            <button
              onClick={() => send()}
              disabled={busy || !input.trim()}
              className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-blue-500 text-white flex items-center justify-center hover:shadow-lg hover:shadow-blue-500/30 active:scale-95 transition-all disabled:opacity-40 disabled:hover:shadow-none flex-shrink-0"
            >
              {busy ? <Loader2 size={17} className="animate-spin" /> : <Send size={17} />}
            </button>
          </div>
          <p className="text-[10px] text-gray-600 mt-2 text-center flex items-center justify-center gap-1.5">
            <Sparkles size={11} /> Enter ile gönder · Shift+Enter alt satır
          </p>
        </div>
      </div>

      {showReset && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4" onClick={() => !resetBusy && setShowReset(false)}>
          <div className="w-full max-w-sm rounded-3xl bg-[#0d1117] border border-red-500/30 p-6 shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-11 h-11 rounded-2xl bg-red-500/10 flex items-center justify-center"><AlertTriangle className="w-5 h-5 text-red-400" /></div>
              <h3 className="text-white font-semibold text-lg">Emin misiniz?</h3>
            </div>
            <p className="text-sm text-gray-400 mb-6 leading-relaxed">Tüm bilgiler silinecek (işletme bilgileri, ürünler, hizmetler, SSS, promptlar ve bilgi havuzu). Yapay zeka baştan eğitilecek. Bu işlem geri alınamaz.</p>
            <div className="flex gap-2">
              <button onClick={doReset} disabled={resetBusy} className="flex-1 px-4 py-2.5 bg-gradient-to-r from-red-600 to-red-500 text-white rounded-xl text-sm font-semibold hover:shadow-lg hover:shadow-red-500/25 active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-2">
                {resetBusy ? <><Loader2 className="w-4 h-4 animate-spin" /> Sıfırlanıyor...</> : <><RotateCcw size={16} /> Evet, Sıfırla</>}
              </button>
              <button onClick={() => setShowReset(false)} disabled={resetBusy} className="px-4 py-2.5 border border-[#1a2332] text-gray-400 rounded-xl text-sm hover:text-white hover:border-[#2a3a4a] transition-all disabled:opacity-50">Vazgeç</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
