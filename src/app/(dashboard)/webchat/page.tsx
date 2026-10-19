'use client'
import { useState, useEffect, useRef, useCallback } from 'react'
import { Bot, Send, RotateCcw, AlertTriangle, Loader2, Sparkles, RefreshCw, HelpCircle, Check, X, MessageCircle } from 'lucide-react'

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

interface UnknownQ {
  id: string
  question: string
  platform?: string
  count: number
  context?: string
  createdAt: string
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
  const [refreshing, setRefreshing] = useState(false)

  const [unknown, setUnknown] = useState<UnknownQ[]>([])
  const [unknownLoading, setUnknownLoading] = useState(true)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [savingId, setSavingId] = useState<string | null>(null)

  const scrollRef = useRef<HTMLDivElement>(null)
  const taRef = useRef<HTMLTextAreaElement>(null)

  const loadConfig = useCallback(async () => {
    try {
      const r = await fetch('/api/webchat/config', { credentials: 'include' })
      if (r.ok) setConfig(await r.json())
    } catch {}
  }, [])

  const loadUnknown = useCallback(async () => {
    setUnknownLoading(true)
    try {
      const r = await fetch('/api/webchat/unknown-questions', { credentials: 'include' })
      if (r.ok) setUnknown(await r.json())
    } catch {} finally { setUnknownLoading(false) }
  }, [])

  useEffect(() => { loadConfig(); loadUnknown() }, [loadConfig, loadUnknown])

  useEffect(() => {
    const t = setInterval(loadUnknown, 30000)
    return () => clearInterval(t)
  }, [loadUnknown])

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

  const refreshAll = async () => {
    setRefreshing(true)
    await Promise.all([loadConfig(), loadUnknown()])
    setRefreshing(false)
  }

  const saveAnswer = async (id: string) => {
    const ans = (answers[id] || '').trim()
    if (!ans || savingId) return
    setSavingId(id)
    try {
      const res = await fetch('/api/webchat/unknown-questions/answer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ id, answer: ans }),
      })
      if (res.ok) {
        const d = await res.json()
        if (d.success) {
          setUnknown(prev => prev.filter(x => x.id !== id))
          setAnswers(prev => { const n = { ...prev }; delete n[id]; return n })
          if (d.config) setConfig(d.config)
        }
      }
    } catch {} finally { setSavingId(null) }
  }

  const dismissQ = async (id: string) => {
    try {
      const res = await fetch('/api/webchat/unknown-questions/dismiss', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ id }),
      })
      if (res.ok) setUnknown(prev => prev.filter(x => x.id !== id))
    } catch {}
  }

  const doReset = async () => {
    setResetBusy(true)
    try {
      const res = await fetch('/api/webchat/reset', { method: 'POST', credentials: 'include' })
      if (res.ok) {
        const d = await res.json()
        setConfig(d)
        setUnknown([])
        setChat([{ role: 'assistant', content: 'Tüm bilgiler sıfırlandı. Baştan başlayalım — işletmenizi tanıtın.' }])
        setShowReset(false)
      }
    } catch {} finally { setResetBusy(false) }
  }

  const stats = [
    { label: 'Durum', value: configured ? 'Eğitildi' : 'Eğitilmedi', grad: configured ? 'from-emerald-500 to-teal-600' : 'from-amber-500 to-orange-500', icon: Sparkles },
    { label: 'Ürün / Hizmet', value: (config?.products?.length || 0) + (config?.services?.length || 0), grad: 'from-blue-600 to-blue-700', icon: MessageCircle },
    { label: 'SSS', value: config?.faqs?.length || 0, grad: 'from-indigo-500 to-purple-600', icon: Check },
    { label: 'Bilmediğim Soru', value: unknown.length, grad: 'from-rose-500 to-pink-600', icon: HelpCircle },
  ]

  return (
    <div className="space-y-5 pb-12">
      {/* Header */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-700 via-blue-600 to-blue-500 p-6 lg:p-8 shadow-lg shadow-blue-600/20">
        <div className="absolute -top-16 -right-16 w-64 h-64 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute -bottom-20 -left-10 w-72 h-72 rounded-full bg-blue-900/20 blur-3xl" />
        <div className="relative flex items-start justify-between flex-wrap gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-white/15 backdrop-blur flex items-center justify-center shadow-inner">
              <Bot className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-xl lg:text-2xl font-bold text-white tracking-tight">Chatbot Asistanı</h1>
              <p className="text-sm text-blue-100 mt-0.5">İşletmenizi sohbetle eğitin, her şeyi buradan yönetin</p>
              <span className="inline-flex items-center gap-1.5 mt-2 px-2.5 py-1 rounded-full bg-white/15 text-white text-[11px] font-semibold">
                <span className={'w-1.5 h-1.5 rounded-full ' + (configured ? 'bg-emerald-300' : 'bg-amber-300 animate-pulse')} />
                {configured ? 'İşletmenizi tanıyor' : 'Henüz eğitilmedi'}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={refreshAll} disabled={refreshing}
              className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-white/15 text-white text-xs font-bold backdrop-blur hover:bg-white/25 active:scale-95 transition-all disabled:opacity-50">
              <RefreshCw size={14} className={refreshing ? 'animate-spin' : ''} /> Yenile
            </button>
            <button onClick={() => setShowReset(true)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-white text-blue-700 text-xs font-bold shadow-md hover:shadow-lg hover:scale-105 active:scale-95 transition-all">
              <RotateCcw size={14} /> Sıfırla
            </button>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {stats.map(s => {
          const Icon = s.icon
          return (
            <div key={s.label} className="relative overflow-hidden rounded-2xl bg-white border border-blue-100 p-5 shadow-sm hover:shadow-lg hover:shadow-blue-600/10 hover:-translate-y-0.5 transition-all duration-300">
              <div className="absolute -top-8 -right-8 w-20 h-20 rounded-full bg-blue-50" />
              <div className="relative">
                <div className={'w-9 h-9 rounded-full bg-gradient-to-br ' + s.grad + ' flex items-center justify-center mb-3 shadow-md'}>
                  <Icon className="w-4 h-4 text-white" />
                </div>
                <p className="text-lg font-bold text-gray-900 tracking-tight truncate">{s.value}</p>
                <p className="text-[10px] text-gray-500 uppercase tracking-wider font-semibold mt-1">{s.label}</p>
              </div>
            </div>
          )
        })}
      </div>

      {/* Chat + Unknown questions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 items-start">
        {/* Chat */}
        <div className="lg:col-span-2 flex flex-col h-[600px] rounded-2xl bg-white border border-blue-100 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-4 sm:px-5 py-3.5 border-b border-blue-50">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-md flex-shrink-0">
                <Bot size={17} className="text-white" />
              </div>
              <div className="min-w-0">
                <p className="text-gray-900 font-semibold text-sm leading-tight truncate">Yapay Zeka Asistanı</p>
                <p className="text-[11px] text-gray-400 flex items-center gap-1.5 mt-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Çevrimiçi
                </p>
              </div>
            </div>
          </div>

          <div ref={scrollRef} className="flex-1 min-h-0 overflow-y-auto px-4 sm:px-5 py-5 space-y-4 bg-slate-50/40">
            {chat.map((m, i) => (
              m.role === 'user' ? (
                <div key={i} className="flex justify-end">
                  <div className="max-w-[82%] px-4 py-2.5 rounded-2xl rounded-tr-md bg-gradient-to-br from-blue-600 to-blue-500 text-white text-sm leading-relaxed whitespace-pre-wrap break-words shadow-md shadow-blue-500/20">
                    {m.content}
                  </div>
                </div>
              ) : (
                <div key={i} className="flex gap-2.5 justify-start">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center flex-shrink-0 shadow-md mt-0.5">
                    <Bot size={15} className="text-white" />
                  </div>
                  <div className="max-w-[82%] px-4 py-2.5 rounded-2xl rounded-tl-md bg-white border border-blue-100 text-gray-800 text-sm leading-relaxed whitespace-pre-wrap break-words shadow-sm">
                    {m.content}
                  </div>
                </div>
              )
            ))}

            {busy && (
              <div className="flex gap-2.5 justify-start">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center flex-shrink-0 shadow-md">
                  <Bot size={15} className="text-white" />
                </div>
                <div className="px-4 py-3 rounded-2xl rounded-tl-md bg-white border border-blue-100 flex items-center gap-1.5 shadow-sm">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            )}

            {chat.length === 1 && !busy && (
              <div className="flex flex-wrap gap-2 pt-1">
                {QUICK.map(q => (
                  <button key={q} onClick={() => send(q)} className="px-3 py-1.5 rounded-full text-xs font-medium bg-blue-50 text-blue-600 border border-blue-100 hover:bg-blue-100 active:scale-95 transition-all">
                    {q}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="p-3 sm:p-4 border-t border-blue-50 bg-white">
            <div className="flex items-end gap-2 rounded-2xl bg-slate-50 border border-blue-100 focus-within:border-blue-400 focus-within:ring-2 focus-within:ring-blue-100 p-1.5 pl-3 transition-all">
              <textarea
                ref={taRef}
                rows={1}
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={onKey}
                placeholder="İşletmenizle ilgili yazın veya bir soru sorun..."
                className="flex-1 bg-transparent text-gray-900 text-sm resize-none focus:outline-none placeholder-gray-400 py-2 max-h-36 leading-relaxed"
              />
              <button
                onClick={() => send()}
                disabled={busy || !input.trim()}
                className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-blue-500 text-white flex items-center justify-center hover:shadow-lg hover:shadow-blue-500/30 active:scale-95 transition-all disabled:opacity-40 disabled:hover:shadow-none flex-shrink-0"
              >
                {busy ? <Loader2 size={17} className="animate-spin" /> : <Send size={17} />}
              </button>
            </div>
            <p className="text-[10px] text-gray-400 mt-2 text-center flex items-center justify-center gap-1.5">
              <Sparkles size={11} /> Enter ile gönder · Shift+Enter alt satır
            </p>
          </div>
        </div>

        {/* Unknown questions */}
        <div className="flex flex-col h-[600px] rounded-2xl bg-white border border-blue-100 shadow-sm overflow-hidden">
          <div className="px-4 sm:px-5 py-3.5 border-b border-blue-50">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-rose-500 to-pink-600 flex items-center justify-center shadow-md flex-shrink-0">
                <HelpCircle size={17} className="text-white" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-gray-900 font-semibold text-sm leading-tight">Bilmediğim Sorular</p>
                <p className="text-[11px] text-gray-400 mt-0.5">Cevaplayın, kendimi eğiteyim</p>
              </div>
              {unknown.length > 0 && (
                <span className="px-2 py-0.5 rounded-full bg-rose-50 text-rose-600 border border-rose-100 text-[11px] font-bold">{unknown.length}</span>
              )}
            </div>
          </div>

          <div className="flex-1 min-h-0 overflow-y-auto p-3 sm:p-4 space-y-3">
            {unknownLoading ? (
              <div className="flex items-center justify-center h-32"><Loader2 className="w-5 h-5 text-blue-500 animate-spin" /></div>
            ) : unknown.length === 0 ? (
              <div className="flex flex-col items-center justify-center text-center h-full py-10">
                <div className="w-14 h-14 rounded-full bg-blue-50 flex items-center justify-center mb-3">
                  <Bot className="w-7 h-7 text-blue-300" />
                </div>
                <p className="text-sm font-semibold text-gray-700">Şimdilik her şeyi biliyorum</p>
                <p className="text-xs text-gray-400 mt-1 max-w-[220px]">Müşteriler cevabını bilmediğim bir soru sorduğunda burada görünecek; siz cevaplayınca öğreneceğim.</p>
              </div>
            ) : (
              unknown.map(q => (
                <div key={q.id} className="rounded-xl border border-blue-100 bg-slate-50/60 p-3">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <p className="text-sm text-gray-800 font-medium leading-snug break-words">{q.question}</p>
                    <button onClick={() => dismissQ(q.id)} title="Gördüm, kapat" className="p-1 rounded-md text-gray-400 hover:text-gray-600 hover:bg-white transition-all flex-shrink-0">
                      <X size={14} />
                    </button>
                  </div>
                  {q.context && (
                    <div className="mb-2 rounded-lg bg-white border border-blue-100 px-3 py-2">
                      <p className="text-[10px] font-semibold text-blue-500 uppercase tracking-wide mb-1">Konuşma özeti</p>
                      <p className="text-[11px] text-gray-500 whitespace-pre-wrap leading-relaxed break-words">{q.context}</p>
                    </div>
                  )}
                  <div className="flex flex-wrap items-center gap-1.5 mb-2">
                    <span className="px-2 py-0.5 rounded-full bg-white border border-blue-100 text-[10px] text-blue-600 font-semibold">{q.count || 1} kez soruldu</span>
                    {q.platform && <span className="px-2 py-0.5 rounded-full bg-white border border-blue-100 text-[10px] text-gray-500">{q.platform}</span>}
                  </div>
                  <textarea
                    value={answers[q.id] || ''}
                    onChange={e => setAnswers(prev => ({ ...prev, [q.id]: e.target.value }))}
                    rows={2}
                    placeholder="Doğru cevabı yazın..."
                    className="w-full px-3 py-2 rounded-lg bg-white border border-blue-100 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 resize-none transition-all"
                  />
                  <button
                    onClick={() => saveAnswer(q.id)}
                    disabled={savingId === q.id || !(answers[q.id] || '').trim()}
                    className="mt-2 w-full flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-gradient-to-r from-blue-600 to-blue-500 text-white text-xs font-semibold hover:shadow-md hover:shadow-blue-500/20 active:scale-[0.98] transition-all disabled:opacity-40"
                  >
                    {savingId === q.id ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
                    {savingId === q.id ? 'Kaydediliyor...' : 'Cevapla ve Öğret'}
                  </button>
                </div>
              ))
            )}
          </div>

          <div className="px-4 py-3 border-t border-blue-50 bg-slate-50/40">
            <p className="text-[10px] text-gray-400 text-center leading-relaxed">Cevaplarınız bilgi havuzuna ve SSS'ye eklenir; yapay zeka bir daha aynı soruyu bilemezlik yapmaz.</p>
          </div>
        </div>
      </div>

      {showReset && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4" onClick={() => !resetBusy && setShowReset(false)}>
          <div className="w-full max-w-sm rounded-3xl bg-white border border-red-100 p-6 shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-11 h-11 rounded-2xl bg-red-50 flex items-center justify-center"><AlertTriangle className="w-5 h-5 text-red-500" /></div>
              <h3 className="text-gray-900 font-bold text-lg">Emin misiniz?</h3>
            </div>
            <p className="text-sm text-gray-500 mb-6 leading-relaxed">Tüm bilgiler silinecek (işletme bilgileri, ürünler, hizmetler, SSS, promptlar ve bilgi havuzu). Yapay zeka baştan eğitilecek. Bu işlem geri alınamaz.</p>
            <div className="flex gap-2">
              <button onClick={doReset} disabled={resetBusy} className="flex-1 px-4 py-2.5 bg-gradient-to-r from-red-600 to-red-500 text-white rounded-xl text-sm font-semibold hover:shadow-lg hover:shadow-red-500/25 active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-2">
                {resetBusy ? <><Loader2 className="w-4 h-4 animate-spin" /> Sıfırlanıyor...</> : <><RotateCcw size={16} /> Evet, Sıfırla</>}
              </button>
              <button onClick={() => setShowReset(false)} disabled={resetBusy} className="px-4 py-2.5 border border-blue-100 text-gray-500 rounded-xl text-sm font-medium hover:bg-slate-50 transition-all disabled:opacity-50">Vazgeç</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
