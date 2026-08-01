'use client'
import { useState, useEffect, useRef } from 'react'
import { MessageSquare, Search, Send, ChevronLeft, ChevronUp, Phone, User, Calendar, Bot, CheckCircle2, Filter, Sparkles, Inbox, PhoneCall, TrendingUp, Target, XCircle, Headphones, X, Mail, MessageSquareText, MessageCircle, Globe } from 'lucide-react'

function WAIcon({ className }: { className?: string }) {
  return <svg className={className} viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
}
function IGAcon({ className }: { className?: string }) {
  return <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="2" y="2" width="20" height="20" rx="5"/><circle cx="12" cy="12" r="5"/><circle cx="17.5" cy="6.5" r="1.5" fill="currentColor" stroke="none"/></svg>
}
function TGIcon({ className }: { className?: string }) {
  return <svg className={className} viewBox="0 0 24 24" fill="currentColor"><path d="M11.944 0A12 12 0 000 12a12 12 0 0012 12 12 12 0 0012-12A12 12 0 0012 0a12 12 0 00-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 01.171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/></svg>
}

const PLATFORM_MAP: Record<string, any> = {
  whatsapp: { label: 'WhatsApp', icon: WAIcon, color: 'text-green-400', bg: 'bg-green-500/10', border: 'border-green-500/20', dot: 'bg-green-400' },
  instagram: { label: 'Instagram', icon: IGAcon, color: 'text-pink-400', bg: 'bg-pink-500/10', border: 'border-pink-500/20', dot: 'bg-pink-400' },
  telegram: { label: 'Telegram', icon: TGIcon, color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/20', dot: 'bg-blue-400' },
  messenger: { label: 'Messenger', color: 'text-sky-400', bg: 'bg-sky-500/10', border: 'border-sky-500/20', dot: 'bg-sky-400' },
  webchat: { label: 'Web Chat', color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', dot: 'bg-emerald-400' },
}

const ps = (p: string) => PLATFORM_MAP[p] || { label: p, color: 'text-gray-400', bg: 'bg-gray-500/10', icon: null, dot: 'bg-gray-400' }

function timeAgo(d: string) {
  const s = Math.floor((Date.now() - new Date(d).getTime()) / 1000)
  if (s < 60) return 'şimdi'
  if (s < 3600) return Math.floor(s / 60) + 'dk'
  if (s < 86400) return Math.floor(s / 3600) + 's'
  return new Date(d).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' })
}

export default function MessagesPage() {
  const [tab, setTab] = useState<string|'leads'>('messages')
  const [convos, setConvos] = useState<any[]>([])
  const [selected, setSelected] = useState<any>(null)
  const [msgs, setMsgs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('')
  const [search, setSearch] = useState('')
  const [newMsg, setNewMsg] = useState('')
  const [mobileView, setMobileView] = useState('list')
  const [aiEnabled, setAiEnabled] = useState(true)
  const [aiConvOverride, setAiConvOverride] = useState<Record<string, boolean>>({})
  const [connectedPlatforms, setConnectedPlatforms] = useState<string[]>([])
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    Promise.all([
      fetch('/api/tenant/ai-toggle', { credentials: 'include' }).then(r => r.ok ? r.json() : null),
      fetch('/api/messages/conversations', { credentials: 'include' }).then(r => r.ok ? r.json() : []),
      fetch('/api/tenant/platforms', { credentials: 'include' }).then(r => r.ok ? r.json() : ['webchat']),
    ]).then(([aiData, convosData, platformsData]) => {
      if (aiData?.aiEnabled !== undefined) {
        setAiEnabled(aiData.aiEnabled)
        localStorage.setItem('bruskapp_ai_global', aiData.aiEnabled.toString())
      } else {
        const saved = localStorage.getItem('bruskapp_ai_global')
        if (saved === 'false') setAiEnabled(false)
      }
      setConvos(convosData)
      setConnectedPlatforms(Array.isArray(platformsData) ? platformsData : ['webchat'])
    }).catch(() => {})
    fetch('/api/tenant/ai-override', { credentials: 'include' })
      .then(r => r.ok ? r.json() : { overrides: {} })
      .then(data => setAiConvOverride(data.overrides || {}))
      .catch(() => {})
      .finally(() => setLoading(false))
    const evtSource = new EventSource('/api/messages/events')
    evtSource.onmessage = (e) => {
      try {
        const msg = JSON.parse(e.data)
        fetch('/api/messages/conversations', { credentials: 'include' })
          .then(r => r.ok ? r.json() : []).then(d => setConvos(d)).catch(() => {})
        setSelected((prev: any) => {
          if (prev && msg.from === prev.from && msg.platform === prev.platform) {
            setMsgs(p => [...p, msg])
          }
          return prev
        })
      } catch {}
    }
    evtSource.onerror = () => {}
    return () => evtSource.close()
  }, [])

  const toggleAiGlobal = async (val: boolean) => {
    setAiEnabled(val)
    localStorage.setItem('bruskapp_ai_global', val ? 'true' : 'false')
    const res = await fetch('/api/tenant/ai-toggle', { method: 'POST', credentials: 'include', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ enabled: val }) })
    if (!res.ok) { setAiEnabled(!val); localStorage.setItem('bruskapp_ai_global', (!val).toString()) }
  }

  const toggleAiConv = async (convId: string, platform: string, from: string, active: boolean) => {
    setAiConvOverride(prev => ({ ...prev, [convId]: active }))
    const res = await fetch('/api/tenant/ai-override', {
      method: 'POST', credentials: 'include', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ platform, from, aiEnabled: active }),
    })
    if (!res.ok) setAiConvOverride(prev => ({ ...prev, [convId]: !active }))
  }

  useEffect(() => {
    const el = scrollRef.current
    if (el) el.scrollTop = el.scrollHeight
  }, [msgs])

  const selectConv = async (c: any) => {
    setSelected(c); setMobileView('chat')
    const res = await fetch('/api/messages?from=' + encodeURIComponent(c.from) + '&limit=50', { credentials: 'include' })
    if (res.ok) { const d = await res.json(); setMsgs((d.messages || []).reverse()) }
    await fetch('/api/messages/read?platform=' + encodeURIComponent(c.platform) + '&from=' + encodeURIComponent(c.from), { method: 'POST', credentials: 'include' }).catch(() => {})
    fetch('/api/messages/conversations', { credentials: 'include' }).then(r => r.ok ? r.json() : []).then(d => setConvos(d)).catch(() => {})
  }

  const sendMsg = async () => {
    if (!newMsg.trim() || !selected) return
    await fetch('/api/messages/send', { method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'include', body: JSON.stringify({ to: selected.from, content: newMsg, platform: selected.platform }) })
    setNewMsg('')
    const res = await fetch('/api/messages?from=' + encodeURIComponent(selected.from) + '&limit=50', { credentials: 'include' })
    if (res.ok) { const d = await res.json(); setMsgs((d.messages || []).reverse()) }
    fetch('/api/messages/conversations', { credentials: 'include' }).then(r => r.ok ? r.json() : []).then(d => setConvos(d)).catch(() => {})
  }

  const platformTabs: any[] = [{ key: '', label: 'Tümü' }]
  for (const p of connectedPlatforms) {
    if (PLATFORM_MAP[p]) platformTabs.push({ key: p, ...PLATFORM_MAP[p] })
  }
  const filteredConvos = convos.filter((c: any) =>
    (!filter || c.platform === filter) &&
    (!search || c.from?.toLowerCase().includes(search.toLowerCase()) || c.fromName?.toLowerCase().includes(search.toLowerCase()))
  )

  const T = (k: string, l: string) => (
    <button key={k} onClick={() => setTab(k)}
      className={'relative flex-1 px-4 py-2 rounded-xl text-xs font-semibold transition-all duration-300 ' + (tab === k ? 'bg-gradient-to-r from-blue-500/20 to-indigo-500/20 text-blue-300 shadow-inner ring-1 ring-blue-500/20' : 'text-gray-500 hover:text-white hover:bg-white/[0.03]')}>{l}</button>
  )

  if (tab !== 'messages') {
    return (
      <div className="space-y-6 pb-12">
        <div className="relative overflow-hidden rounded-3xl border border-white/[0.06] bg-gradient-to-br from-[#101a30] via-[#0d1117] to-[#0a0e14] p-6 lg:p-8 shadow-2xl shadow-black/20">
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
          <div className="absolute -bottom-32 -left-16 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl" />
          <div className="absolute top-0 right-1/4 w-44 h-px bg-gradient-to-r from-transparent via-blue-400/40 to-transparent" />
          <div className="relative flex items-center gap-4">
            <div className="relative">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-xl shadow-blue-500/30 ring-1 ring-white/10"><MessageSquare size={26} className="text-white" /></div>
              <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-400 ring-4 ring-[#0d1117]" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-white">Mesajlar</h1>
              <p className="text-sm text-gray-500 mt-0.5">Tüm kanallardan gelen mesajları tek panelde yönetin</p>
            </div>
          </div>
        </div>
        <div className="flex gap-1 bg-[#0d1117]/80 backdrop-blur-xl border border-white/[0.06] rounded-xl p-1 max-w-[300px] shadow-lg shadow-black/20">
          {T('messages', 'Mesajlar')}{T('leads', 'Lead Yönetimi')}
        </div>
        {tab === 'leads' && <LeadsView />}
      </div>
    )
  }

  if (loading) return (
    <div className="flex items-center justify-center h-[60vh]">
      <div className="flex flex-col items-center gap-3">
        <div className="w-10 h-10 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
        <span className="text-sm text-gray-600">Mesajlar yükleniyor...</span>
      </div>
    </div>
  )

  return (
    <div className="h-[calc(100vh-5rem)] flex gap-0 relative overflow-hidden rounded-3xl border border-white/[0.06] bg-[#0a0e14]/80 backdrop-blur-xl shadow-2xl shadow-black/40">
      <div className="pointer-events-none absolute -top-32 -left-32 w-96 h-96 bg-blue-500/[0.04] rounded-full blur-3xl" />
      <div className="pointer-events-none absolute -bottom-32 -right-32 w-96 h-96 bg-violet-500/[0.04] rounded-full blur-3xl" />
      {/* Sidebar */}
      <div className={'relative w-full md:w-[360px] md:flex-shrink-0 border-r border-white/[0.06] flex flex-col bg-[#0d1117]/70 backdrop-blur-xl ' + (mobileView === 'chat' ? 'hidden md:flex' : 'flex')}>
        <div className="p-4 border-b border-white/[0.06] space-y-3 bg-gradient-to-b from-white/[0.02] to-transparent">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/20 ring-1 ring-white/10 flex-shrink-0"><MessageSquare size={16} className="text-white" /></div>
              <div className="min-w-0">
                <p className="text-sm font-bold tracking-tight text-white leading-none">Mesajlar</p>
                <p className="text-[10px] text-gray-500 mt-1 flex items-center gap-1"><span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />Canlı akış</p>
              </div>
              <span className="ml-1 text-[10px] font-semibold text-gray-400 bg-white/[0.04] px-2 py-0.5 rounded-full border border-white/[0.06] flex-shrink-0">{convos.length}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <button onClick={() => setTab('leads')}
                className="px-2.5 py-1.5 rounded-lg text-[10px] font-semibold transition-all text-gray-500 hover:text-white hover:bg-white/5 border border-transparent hover:border-white/[0.06]">
                Lead
              </button>
              <div className="flex items-center gap-2 ml-0.5 pl-2.5 border-l border-white/[0.06]">
                <span className="flex items-center gap-1 text-[9px] text-gray-500 uppercase tracking-widest"><Sparkles size={10} className="text-indigo-400" />AI</span>
                <button onClick={() => toggleAiGlobal(!aiEnabled)}
                  className={'relative inline-flex h-[20px] w-[36px] items-center rounded-full transition-all duration-300 shadow-inner ' + (aiEnabled ? 'bg-gradient-to-r from-emerald-500 to-emerald-400' : 'bg-gray-700')}>
                  <span className={'inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-all duration-300 shadow-md ' + (aiEnabled ? 'translate-x-[18px]' : 'translate-x-[2px]')} />
                </button>
              </div>
            </div>
          </div>
          <div className="relative">
            <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-600" />
            <input value={search} onChange={e => setSearch(e.target.value)}
              className="w-full bg-[#080b12]/70 border border-white/[0.06] rounded-xl pl-9 pr-4 py-2.5 text-white text-sm focus:outline-none focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/10 placeholder-gray-600 transition-all" placeholder="Konuşma ara..." />
          </div>
          <div className="flex gap-1.5 overflow-x-auto pb-0.5 scrollbar-thin">
            {platformTabs.map(p => {
              const Icon = p.icon
              const active = filter === p.key
              return (
                <button key={p.key} onClick={() => setFilter(active ? '' : p.key)}
                  className={'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-semibold transition-all border whitespace-nowrap ' + (active ? (p.bg + ' ' + p.border + ' ' + p.color + ' shadow-sm') : 'border-white/[0.06] text-gray-500 hover:text-white hover:border-white/20')}>
                  {Icon && <Icon className="w-3.5 h-3.5" />}
                  {p.label}
                </button>
              )
            })}
          </div>
        </div>
        <div className="flex-1 overflow-y-auto scrollbar-thin">
          {filteredConvos.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
              <div className="w-16 h-16 rounded-2xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-center mb-4 shadow-inner"><Inbox size={24} className="text-gray-700" /></div>
              <p className="text-sm text-gray-500 font-medium mb-1">Henüz konuşma yok</p>
              <p className="text-[11px] text-gray-600">Müşterilerinizden mesaj geldiğinde burada görünecek</p>
            </div>
          ) : filteredConvos.map((c: any) => {
            const p = ps(c.platform)
            const Icon = p.icon
            const convId = c.platform + ':' + c.from
            const isAiActive = aiEnabled && (aiConvOverride[convId] ?? true)
            const isSelected = selected?.from === c.from
            return (
              <div key={c.from} onClick={() => selectConv(c)}
                className={'relative flex items-start gap-3 px-4 py-3.5 cursor-pointer transition-all border-b border-white/[0.03] hover:bg-white/[0.03] group ' + (isSelected ? 'bg-gradient-to-r from-blue-500/[0.08] to-transparent' : '')}>
                {isSelected && <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-gradient-to-b from-blue-500 to-indigo-500 rounded-r-full" />}
                <div className="relative flex-shrink-0 mt-0.5">
                  <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-blue-500/80 to-indigo-600/80 flex items-center justify-center text-white text-sm font-bold shadow-lg shadow-blue-500/10 ring-1 ring-white/10">{(c.fromName?.[0] || c.from?.[0] || '?').toUpperCase()}</div>
                  {Icon && <div className="absolute -bottom-1 -right-1 w-[18px] h-[18px] rounded-full bg-[#0d1117] flex items-center justify-center ring-[3px] ring-[#0d1117]"><Icon className={'w-2.5 h-2.5 ' + p.color} /></div>}
                  {c.count > 0 && <div className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-gradient-to-br from-red-500 to-rose-600 flex items-center justify-center text-white text-[8px] font-bold ring-[3px] ring-[#0d1117] shadow-lg shadow-red-500/30">{c.count > 99 ? '99+' : c.count}</div>}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm text-white font-medium truncate">{c.fromName || c.from}</span>
                    <span className={'text-[10px] flex-shrink-0 font-mono ' + (c.count > 0 ? 'text-blue-400 font-semibold' : 'text-gray-600')}>{timeAgo(c.lastMessageAt)}</span>
                  </div>
                  <p className={'text-xs truncate mt-0.5 leading-relaxed ' + (c.count > 0 ? 'text-gray-300 font-medium' : 'text-gray-500')}>{c.lastContent || ''}</p>
                  <div className="flex items-center gap-2 mt-1.5">
                    <span className="flex items-center gap-1"><Icon className={'w-2.5 h-2.5 ' + p.color} /><span className={'text-[9px] font-medium ' + p.color}>{p.label}</span></span>
                    {!isAiActive && (
                      <span className="flex items-center gap-1 text-[9px] text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded-full border border-amber-500/20"><Bot size={8} />Devralındı</span>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Chat Area */}
      <div className={'relative flex-1 flex flex-col min-w-0 ' + (mobileView === 'list' ? 'hidden md:flex' : 'flex')}>
        {selected ? (
          <>
            <div className="flex items-center gap-3 px-5 py-3.5 border-b border-white/[0.06] bg-[#0d1117]/60 backdrop-blur-xl">
              <button onClick={() => setMobileView('list')} className="md:hidden p-1.5 rounded-lg text-gray-500 hover:text-white hover:bg-white/5 transition-all"><ChevronLeft size={18} /></button>
              <div className="relative flex-shrink-0">
                <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-blue-500/80 to-indigo-600/80 flex items-center justify-center text-white text-sm font-bold shadow-lg ring-1 ring-white/10">{(selected.fromName?.[0] || selected.from?.[0] || '?').toUpperCase()}</div>
                {(() => { const p = ps(selected.platform); const Icon = p.icon; return Icon ? <div className="absolute -bottom-1 -right-1 w-[18px] h-[18px] rounded-full bg-[#0d1117] flex items-center justify-center ring-[3px] ring-[#0d1117]"><Icon className={'w-2.5 h-2.5 ' + p.color} /></div> : null })()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-white font-medium truncate">{selected.fromName || selected.from}</p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className={'inline-block w-1.5 h-1.5 rounded-full ' + ps(selected.platform).dot} />
                  <span className="text-[10px] text-gray-500">{ps(selected.platform).label}</span>
                  <span className="w-0.5 h-3 bg-white/[0.08] mx-1" />
                  <span className="text-[10px] text-gray-600">AI sohbeti</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {(() => {
                  const convId = selected.platform + ':' + selected.from
                  const isAiActive = aiEnabled && (aiConvOverride[convId] ?? true)
                  return (
                    <button onClick={() => toggleAiConv(convId, selected.platform, selected.from, !isAiActive)}
                      className={'px-3 py-1.5 rounded-lg text-[10px] font-semibold border transition-all flex items-center gap-1.5 shadow-sm ' + (isAiActive ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20' : 'bg-amber-500/10 text-amber-400 border-amber-500/20 hover:bg-amber-500/20')}>
                      <Bot size={12} />
                      {isAiActive ? 'AI Aktif' : 'Devralındı'}
                    </button>
                  )
                })()}
              </div>
            </div>
            <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 md:px-6 py-6 space-y-4 relative" style={{ backgroundImage: 'radial-gradient(ellipse at 20% 20%, rgba(99,102,241,0.05) 0%, transparent 50%), radial-gradient(ellipse at 80% 80%, rgba(168,85,247,0.04) 0%, transparent 50%), url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23918dff\' fill-opacity=\'0.03\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")' }}>
              {msgs.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <div className="w-16 h-16 rounded-2xl bg-white/[0.04] border border-white/[0.06] flex items-center justify-center mb-4 shadow-inner"><MessageSquare size={26} className="text-gray-600" /></div>
                  <p className="text-sm text-gray-400 font-medium">Henüz mesaj yok</p>
                  <p className="text-[11px] text-gray-600 mt-1">Bu sohbetteki mesajlar burada görünecek</p>
                </div>
              ) : msgs.map((m: any, i: number) => {
                const prev = msgs[i - 1]
                const showAvatar = !prev || prev.direction !== m.direction || prev.from !== m.from
                const isOutgoing = m.direction === 'outgoing'
                const showDateSep = !prev || new Date(prev.createdAt).toDateString() !== new Date(m.createdAt).toDateString()
                return (
                  <div key={m.id}>
                    {showDateSep && (
                      <div className="flex justify-center my-2">
                        <span className="text-[9px] font-semibold text-gray-500 bg-white/[0.06] border border-white/[0.08] px-3 py-1 rounded-full backdrop-blur uppercase tracking-wider">{new Date(m.createdAt).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                      </div>
                    )}
                    <div className={'flex items-end gap-2.5 ' + (isOutgoing ? 'justify-end' : 'justify-start')}>
                      {!isOutgoing && showAvatar && (
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-[9px] font-bold flex-shrink-0 shadow-md ring-2 ring-white/10">{(m.fromName?.[0] || m.from?.[0] || '?').toUpperCase()}</div>
                      )}
                      {!isOutgoing && !showAvatar && <div className="w-8 flex-shrink-0" />}
                      <div className={'max-w-[75%] px-4 py-3 rounded-2xl text-sm leading-relaxed shadow-lg transition-all ' + (isOutgoing ? 'bg-gradient-to-br from-blue-600 via-blue-500 to-indigo-500 text-white rounded-br-sm shadow-blue-500/30 ring-1 ring-white/10' : 'bg-[#1a2332] text-gray-100 rounded-bl-sm ring-1 ring-white/[0.06]')}>
                        <p className="whitespace-pre-wrap break-words">{m.content}</p>
                        <p className={'text-[9px] mt-2 flex items-center justify-end gap-1 ' + (isOutgoing ? 'text-blue-100/80' : 'text-gray-500')}>
                          {new Date(m.createdAt).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
                          {isOutgoing && <CheckCircle2 size={10} className="opacity-70" />}
                        </p>
                      </div>
                      {isOutgoing && showAvatar && (
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white flex-shrink-0 shadow-md ring-2 ring-white/10">
                          <Bot size={14} />
                        </div>
                      )}
                      {isOutgoing && !showAvatar && <div className="w-8 flex-shrink-0" />}
                    </div>
                  </div>
                )
              })}
            </div>
            <div className="p-4 border-t border-white/[0.06] bg-[#0d1117]/60 backdrop-blur-xl">
              <div className="flex gap-3 items-end">
                <div className="flex-1 relative">
                  <input value={newMsg} onChange={e => setNewMsg(e.target.value)} onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMsg() } }}
                    className="w-full bg-[#080b12]/70 border border-white/[0.06] rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/10 placeholder-gray-600 transition-all pr-10" placeholder="Mesaj yazın..." />
                </div>
                <button onClick={sendMsg} disabled={!newMsg.trim()}
                  className="px-5 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl text-sm font-semibold hover:shadow-lg hover:shadow-blue-500/25 transition-all duration-200 disabled:opacity-40 flex items-center gap-2 active:scale-[0.96] hover:from-blue-500 hover:to-indigo-500"><Send size={15} /></button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center relative" style={{ backgroundImage: 'radial-gradient(ellipse at 50% 50%, rgba(99,102,241,0.06) 0%, transparent 60%)' }}>
            <div className="text-center max-w-xs">
              <div className="w-20 h-20 mx-auto rounded-3xl bg-gradient-to-br from-[#1a2332] to-[#0d1117] flex items-center justify-center mb-5 shadow-inner border border-white/[0.06]"><MessageSquare size={32} className="text-gray-600" /></div>
              <h3 className="text-white/30 text-sm font-medium mb-1.5">Mesajlar</h3>
              <p className="text-white/15 text-xs leading-relaxed">Soldan bir konuşma seçin veya müşteri mesajı bekleyin</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// ====== CRM Lead Yönetimi ======
const CRM_STAGES = [
  { key: 'yeni', label: 'Yeni Lead', Icon: Sparkles, desc: 'AI yanıt vermedi, bekliyor', color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/20', bar: 'bg-blue-500' },
  { key: 'gorusuldu', label: 'İletişime Geçildi', Icon: Headphones, desc: 'AI yanıt verdi veya manuel görüşüldü', color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/20', bar: 'bg-amber-500' },
  { key: 'mql', label: 'MQL', Icon: TrendingUp, desc: 'Pazarlama onaylı aday', color: 'text-sky-400', bg: 'bg-sky-500/10', border: 'border-sky-500/20', bar: 'bg-sky-500' },
  { key: 'sql', label: 'SQL', Icon: Target, desc: 'Satışa hazır aday', color: 'text-violet-400', bg: 'bg-violet-500/10', border: 'border-violet-500/20', bar: 'bg-violet-500' },
  { key: 'musteri', label: 'Müşteri', Icon: CheckCircle2, desc: 'Satış tamamlandı', color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', bar: 'bg-emerald-500' },
  { key: 'lost', label: 'Kayıp', Icon: XCircle, desc: 'Satış gerçekleşmedi', color: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/20', bar: 'bg-red-500' },
]

const stageInfo = (key: string) => CRM_STAGES.find(s => s.key === key) || CRM_STAGES[0]
const stageIndex = (key: string) => CRM_STAGES.findIndex(s => s.key === key)

function LeadsView() {
  const [leads, setLeads] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [viewMode, setViewMode] = useState('pipeline')
  const [selectedStage, setSelectedStage] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [detailLead, setDetailLead] = useState<any>(null)

  useEffect(() => {
    fetch('/api/leads', { credentials: 'include' }).then(r => r.ok ? r.json() : []).then(d => {
      setLeads(d.map((l: any) => {
        if (l.status === 'yeni' && l.hasAiReply) return { ...l, status: 'gorusuldu' }
        return l
      })); setLoading(false)
    }).catch(() => setLoading(false))
  }, [])

  const updateStatus = async (id: number, status: string) => {
    await fetch('/api/leads/' + id + '/status', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, credentials: 'include', body: JSON.stringify({ status }) })
    setLeads(prev => prev.map(l => l.id === id ? { ...l, status } : l))
  }

  const filtered = leads.filter((l: any) => {
    if (selectedStage && l.status !== selectedStage) return false
    if (searchTerm) {
      const s = searchTerm.toLowerCase()
      return (l.name?.toLowerCase().includes(s) || l.phone?.includes(s) || l.needs?.toLowerCase().includes(s))
    }
    return true
  })

  const stageCounts = CRM_STAGES.reduce((acc: any, s) => { acc[s.key] = leads.filter((l: any) => l.status === s.key).length; return acc }, {})

  if (loading) return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" /></div>

  return (
    <div className="space-y-6 pb-8">
      <div className="relative overflow-hidden rounded-3xl border border-white/[0.06] bg-gradient-to-br from-[#0f1c1a] via-[#0d1117] to-[#0a0e14] p-6 lg:p-8 shadow-2xl shadow-black/20">
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-32 -left-16 w-80 h-80 bg-teal-500/10 rounded-full blur-3xl" />
        <div className="absolute top-0 left-1/3 w-44 h-px bg-gradient-to-r from-transparent via-emerald-400/40 to-transparent" />
        <div className="relative">
          <div className="flex items-center gap-3 mb-2">
            <div className="relative">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-xl shadow-emerald-500/30 ring-1 ring-white/10"><User size={26} className="text-white" /></div>
              <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-400 ring-4 ring-[#0d1117]" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-white">CRM Lead Yönetimi</h1>
              <p className="text-sm text-gray-500 mt-0.5">Müşteri adaylarını yönetin, puanlayın ve satışa dönüştürün</p>
            </div>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {CRM_STAGES.map(s => {
          const Icon = s.Icon
          const count = stageCounts[s.key] || 0
          return (
            <div key={s.key} onClick={() => setSelectedStage(selectedStage === s.key ? '' : s.key)}
              className={'relative overflow-hidden rounded-2xl border p-4 cursor-pointer transition-all duration-300 hover:scale-[1.02] hover:shadow-xl group ' + s.bg + ' ' + s.border + (selectedStage === s.key ? ' ring-2 ring-white/20 shadow-xl' : '')}>
              <div className="absolute -top-8 -right-8 w-24 h-24 rounded-full bg-white/[0.03] group-hover:scale-150 transition-transform duration-500" />
              <div className="flex items-center justify-between mb-2">
                <div className={'w-8 h-8 rounded-lg flex items-center justify-center ' + s.bg + ' ' + s.color}><Icon size={16} /></div>
                <span className={'text-xl font-bold tracking-tight ' + s.color}>{count}</span>
              </div>
              <p className="text-xs text-white font-semibold">{s.label}</p>
              <p className="text-[10px] text-gray-500 mt-0.5 leading-relaxed">{s.desc}</p>
              <div className="mt-3 h-1.5 bg-white/[0.04] rounded-full overflow-hidden">
                <div className={'h-full rounded-full transition-all duration-700 ' + s.bar} style={{ width: Math.min(100, (count / Math.max(...Object.values(stageCounts).map((v: any) => v), 1)) * 100) + '%' }} />
              </div>
            </div>
          )
        })}
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[240px]">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-600" />
          <input value={searchTerm} onChange={e => setSearchTerm(e.target.value)} placeholder="Müşteri adı, telefon veya ihtiyaç ile ara..." className="w-full bg-[#0d1117]/70 backdrop-blur-xl border border-white/[0.06] rounded-xl pl-9 pr-4 py-2.5 text-white text-sm focus:outline-none focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/10 placeholder-gray-600 transition-all" />
        </div>
        <div className="flex gap-1 bg-[#0d1117]/80 backdrop-blur-xl border border-white/[0.06] rounded-xl p-1 shadow-lg shadow-black/20">
          <button onClick={() => setViewMode('pipeline')} className={'px-3.5 py-2 rounded-lg text-xs font-semibold transition-all ' + (viewMode === 'pipeline' ? 'bg-gradient-to-r from-emerald-500/20 to-teal-500/20 text-emerald-300 shadow-sm ring-1 ring-emerald-500/20' : 'text-gray-500 hover:text-white')}>Pipeline</button>
          <button onClick={() => setViewMode('list')} className={'px-3.5 py-2 rounded-lg text-xs font-semibold transition-all ' + (viewMode === 'list' ? 'bg-gradient-to-r from-emerald-500/20 to-teal-500/20 text-emerald-300 shadow-sm ring-1 ring-emerald-500/20' : 'text-gray-500 hover:text-white')}>Liste</button>
        </div>
      </div>
      {viewMode === 'pipeline' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3">
          {CRM_STAGES.map(stage => {
            const Icon = stage.Icon
            const stageLeads = leads.filter((l: any) => l.status === stage.key && (!searchTerm || l.name?.toLowerCase().includes(searchTerm.toLowerCase()) || l.phone?.includes(searchTerm) || l.needs?.toLowerCase().includes(searchTerm.toLowerCase())))
            return (
              <div key={stage.key} className={'rounded-2xl border p-3 ' + stage.bg + ' ' + stage.border}>
                <div className="flex items-center justify-between mb-3 px-1">
                  <div className="flex items-center gap-2">
                    <span className={'w-5 h-5 rounded-md flex items-center justify-center ' + stage.bg + ' ' + stage.color}><Icon size={12} /></span>
                    <span className={'text-xs font-semibold ' + stage.color}>{stage.label}</span>
                  </div>
                  <span className={'text-xs font-bold ' + stage.color}>{stageLeads.length}</span>
                </div>
                <div className="space-y-2 max-h-[400px] overflow-y-auto scrollbar-thin">
                  {stageLeads.length === 0 ? (
                    <div className="text-center py-6 text-gray-600 text-[10px]">Henüz kayıt yok</div>
                  ) : stageLeads.map((l: any) => (
                    <div key={l.id} onClick={() => setDetailLead(l)} className="group bg-[#0d1117]/80 backdrop-blur-sm rounded-xl p-3 border border-white/[0.06] hover:border-white/20 hover:shadow-xl hover:shadow-black/40 hover:-translate-y-0.5 transition-all duration-300 cursor-pointer">
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-2 min-w-0">
                          <div className="relative flex-shrink-0">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white text-[10px] font-bold shadow-md ring-1 ring-white/10">{l.name?.[0] || (l.source === 'webchat' ? 'W' : l.source?.[0]?.toUpperCase() || '?')}</div>
                            {l.source && PLATFORM_MAP[l.source] && PLATFORM_MAP[l.source].icon && (() => { const Pi = PLATFORM_MAP[l.source].icon; return <div className="absolute -bottom-1 -right-1 w-[16px] h-[16px] rounded-full bg-[#0d1117] flex items-center justify-center ring-2 ring-[#0d1117]"><Pi className={'w-2 h-2 ' + PLATFORM_MAP[l.source].color} /></div> })()}
                          </div>
                          <span className="text-xs text-white font-semibold truncate">{l.name || (l.source === 'webchat' ? 'Web Chat Ziyaretçisi' : (l.phone ? l.phone : (l.source || 'Bilinmeyen')))}</span>
                        </div>
                        <select value={l.status} onClick={e => e.stopPropagation()} onChange={e => updateStatus(l.id, e.target.value)}
                          className="text-[9px] px-1.5 py-0.5 rounded-lg border bg-[#0d1117]/80 cursor-pointer text-gray-400 border-white/[0.06] hover:text-white hover:border-white/20 transition-all">
                          {CRM_STAGES.map(s => <option key={s.key} value={s.key}>{s.label}</option>)}
                        </select>
                      </div>
                      {l.needs && <div className="text-[10px] text-gray-500 line-clamp-2 leading-relaxed mb-2 bg-[#0a0e14]/60 rounded-lg px-2.5 py-1.5 border border-white/[0.04]">{l.needs}</div>}
                      <div className="flex items-center justify-between text-[10px] text-gray-600">
                        <div className="flex items-center gap-2.5">
                          {l.phone && <span className="flex items-center gap-1"><Phone size={9} />{l.phone}</span>}
                          <span className="flex items-center gap-1"><Calendar size={9} />{new Date(l.createdAt).toLocaleDateString('tr-TR')}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          {l.hasAiReply && <span className="text-[8px] text-emerald-500 bg-emerald-500/10 px-1.5 py-0.5 rounded-full">AI</span>}
                          <span className="text-[9px] text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-0.5 font-semibold">Detay <ChevronUp size={9} className="rotate-45" /></span>
                        </div>
                      </div>
                      <div className="mt-2 flex gap-0.5">
                        {CRM_STAGES.map((s, i) => {
                          const idx = stageIndex(l.status)
                          return <div key={s.key} className={'flex-1 h-1 rounded-full transition-all duration-300 ' + (i <= idx ? s.bar : 'bg-white/[0.05]')} />
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      )}
      {viewMode === 'list' && (
        <div className="bg-[#0d1117]/60 backdrop-blur-xl border border-white/[0.06] rounded-2xl overflow-hidden shadow-xl shadow-black/20">
          <div className="p-4 border-b border-white/[0.06] flex items-center justify-between bg-[#0a0e14]/60">
            <p className="text-sm text-gray-400 font-medium">{filtered.length} kayıt</p>
            {selectedStage && <button onClick={() => setSelectedStage('')} className="text-xs text-gray-500 hover:text-white px-3 py-1.5 rounded-lg hover:bg-white/5 transition-all border border-white/[0.06]">Filtreyi Temizle</button>}
          </div>
          {filtered.length === 0 ? (
            <div className="text-center py-16"><User size={40} className="mx-auto text-gray-700 mb-3" /><p className="text-gray-500 text-sm">Eşleşen kayıt bulunamadı</p></div>
          ) : (
            <div className="divide-y divide-white/[0.04]">
              {filtered.map((l: any) => {
                const si = stageInfo(l.status)
                const idx = stageIndex(l.status)
                const Icon = si.Icon
                return (
                  <div key={l.id} onClick={() => setDetailLead(l)} className="flex items-start gap-4 p-5 hover:bg-white/[0.02] transition-all duration-300 group cursor-pointer">
                    <div className="relative flex-shrink-0">
                      <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white text-sm font-bold shadow-lg shadow-emerald-500/10 ring-1 ring-white/10">{l.name?.[0] || (l.source === 'webchat' ? 'W' : l.source?.[0]?.toUpperCase() || '?')}</div>
                      {l.source && PLATFORM_MAP[l.source] && PLATFORM_MAP[l.source].icon && (() => { const Pi = PLATFORM_MAP[l.source].icon; return <div className="absolute -bottom-1 -right-1 w-[18px] h-[18px] rounded-full bg-[#0d1117] flex items-center justify-center ring-[3px] ring-[#0d1117]"><Pi className={'w-2.5 h-2.5 ' + PLATFORM_MAP[l.source].color} /></div> })()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3 flex-wrap">
                          <h3 className="text-white font-bold text-sm">{l.name || (l.source === 'webchat' ? 'Web Chat Ziyaretçisi' : (l.phone ? l.phone : (l.source || 'Bilinmeyen')))}</h3>
                          {l.phone && <span onClick={e => e.stopPropagation()} className="flex items-center gap-1 text-[10px] text-gray-500 bg-white/[0.03] px-2.5 py-1 rounded-lg border border-white/[0.06] group-hover:border-white/10"><Phone size={10} />{l.phone}</span>}
                          {l.hasAiReply && <span className="text-[8px] text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">AI Yanıtlandı</span>}
                        </div>
                        <select onClick={e => e.stopPropagation()} value={l.status} onChange={e => updateStatus(l.id, e.target.value)}
                          className={'text-xs px-3 py-1.5 rounded-lg border font-semibold cursor-pointer transition-all ' + si.bg + ' ' + si.color + ' ' + si.border}>
                          {CRM_STAGES.map(s => <option key={s.key} value={s.key} className="bg-[#0d1117]">{s.label}</option>)}
                        </select>
                      </div>
                      <div className="flex items-start gap-6">
                        <div className="flex-1">
                          {l.needs ? (
                            <p className="text-xs text-gray-400 leading-relaxed bg-white/[0.02] rounded-xl px-3.5 py-2.5 border border-white/[0.06]">{l.needs}</p>
                          ) : (
                            <p className="text-xs text-gray-600 italic">İhtiyaç bilgisi yok</p>
                          )}
                        </div>
                        <div className="flex-shrink-0 space-y-1.5 text-right">
                          <div className="flex items-center gap-1.5 text-[10px] text-gray-600"><Calendar size={11} className="text-gray-500" />{new Date(l.createdAt).toLocaleDateString('tr-TR')}</div>
                          <div className="flex items-center gap-1.5 text-[10px] text-gray-600">
                            {l.source && PLATFORM_MAP[l.source] && (() => { const Icon = PLATFORM_MAP[l.source].icon; return Icon ? <Icon className={'w-3 h-3 ' + PLATFORM_MAP[l.source].color} /> : <Filter size={11} className="text-gray-500" /> })()}
                            {l.source && PLATFORM_MAP[l.source] ? PLATFORM_MAP[l.source].label : (l.source || 'Web Chat')}
                          </div>
                          <div className="flex items-center gap-1.5 text-[10px] text-gray-600"><span className={'inline-block w-2 h-2 rounded-full ' + si.bar} />{si.label}</div>
                        </div>
                      </div>
                      <div className="mt-3 flex gap-1">
                        {CRM_STAGES.map((s, i) => (
                          <div key={s.key} className={'flex-1 h-1.5 rounded-full transition-all duration-300 ' + (i <= idx ? s.bar : 'bg-white/[0.05]')} />
                        ))}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}
      {detailLead && <LeadDetailModal lead={detailLead} onClose={() => setDetailLead(null)} onStatus={(id, s) => { updateStatus(id, s); setDetailLead((p: any) => p && p.id === id ? { ...p, status: s } : p) }} />}
    </div>
  )
}

function LeadDetailModal({ lead, onClose, onStatus }: { lead: any; onClose: () => void; onStatus: (id: number, status: string) => void }) {
  const si = stageInfo(lead.status)
  const Icon = si.Icon
  const p = ps(lead.source)
  const SrcIcon = p.icon
  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn" onClick={onClose}>
      <div onClick={e => e.stopPropagation()} className="relative w-full max-w-lg max-h-[88vh] overflow-y-auto rounded-3xl border border-white/[0.1] bg-[#0d1117]/95 backdrop-blur-2xl shadow-2xl shadow-black/60 animate-slide-in">
        <div className="h-1.5 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 rounded-t-3xl" />
        <div className="relative p-6">
          <div className="absolute -top-24 -right-16 w-64 h-64 bg-blue-500/[0.06] rounded-full blur-3xl pointer-events-none" />
          <button onClick={onClose} className="absolute top-5 right-5 p-2 rounded-xl text-gray-500 hover:text-white hover:bg-white/5 transition-all z-10"><X size={18} /></button>
          <div className="relative flex items-center gap-4 mb-6">
            <div className="relative flex-shrink-0">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white text-lg font-bold shadow-lg shadow-emerald-500/20 ring-1 ring-white/10">{lead.name?.[0] || (lead.source === 'webchat' ? 'W' : lead.source?.[0]?.toUpperCase() || '?')}</div>
              {SrcIcon && <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-[#0d1117] flex items-center justify-center ring-[3px] ring-[#0d1117]"><SrcIcon className={'w-3 h-3 ' + p.color} /></div>}
            </div>
            <div className="min-w-0">
              <h3 className="text-xl font-bold text-white tracking-tight truncate">{lead.name || (lead.source === 'webchat' ? 'Web Chat Ziyaretçisi' : (lead.phone ? lead.phone : (lead.source || 'Bilinmeyen')))}</h3>
              <div className="flex items-center gap-2 mt-1 flex-wrap">
                {lead.phone && <span className="flex items-center gap-1 text-xs text-gray-400"><Phone size={11} />{lead.phone}</span>}
                {lead.email && <span className="flex items-center gap-1 text-xs text-gray-500"><Mail size={11} />{lead.email}</span>}
              </div>
            </div>
          </div>
          <div className="relative flex flex-wrap items-center gap-2 mb-5">
            <span className={'flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full border font-semibold ' + si.bg + ' ' + si.color + ' ' + si.border}><Icon size={13} />{si.label}</span>
            {lead.source && PLATFORM_MAP[lead.source] && (
              <span className={'flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full border ' + PLATFORM_MAP[lead.source].bg + ' ' + PLATFORM_MAP[lead.source].color + ' ' + PLATFORM_MAP[lead.source].border}>
                {SrcIcon && <SrcIcon className="w-3 h-3" />}{PLATFORM_MAP[lead.source].label}
              </span>
            )}
            {lead.hasAiReply && <span className="text-xs text-emerald-500 bg-emerald-500/10 px-3 py-1.5 rounded-full border border-emerald-500/20 flex items-center gap-1.5"><Bot size={12} />AI Yanıtlandı</span>}
          </div>
          <div className="relative grid grid-cols-3 gap-2 mb-5">
            <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-3 text-center">
              <p className="text-lg font-bold text-white">{new Date(lead.createdAt).toLocaleDateString('tr-TR', { day: 'numeric' })}</p>
              <p className="text-[10px] text-gray-500 mt-0.5">{new Date(lead.createdAt).toLocaleDateString('tr-TR', { month: 'short', year: 'numeric' })}</p>
            </div>
            <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-3 text-center">
              <p className="text-lg font-bold text-white">{lead.conversation?.length || 0}</p>
              <p className="text-[10px] text-gray-500 mt-0.5">Mesaj</p>
            </div>
            <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-3 text-center">
              <p className="text-lg font-bold text-white">{lead.sessionId ? lead.sessionId.slice(0, 6) : '-'}</p>
              <p className="text-[10px] text-gray-500 mt-0.5">Oturum</p>
            </div>
          </div>
          {lead.needs && (
            <div className="relative mb-5">
              <h4 className="text-[11px] text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-1.5"><MessageSquareText size={11} /> Müşteri İhtiyacı</h4>
              <p className="text-sm text-gray-200 bg-white/[0.02] rounded-xl p-3.5 border border-white/[0.06] leading-relaxed">{lead.needs}</p>
            </div>
          )}
          {lead.conversation && lead.conversation.length > 0 && (
            <div className="relative mb-6">
              <h4 className="text-[11px] text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-1.5"><MessageCircle size={11} /> Sohbet Geçmişi</h4>
              <div className="bg-white/[0.02] rounded-2xl border border-white/[0.06] max-h-52 overflow-y-auto p-3 space-y-2 scrollbar-thin">
                {lead.conversation.map((msg: any, i: number) => (
                  <div key={i} className={'flex ' + (msg.role === 'user' ? 'justify-end' : 'justify-start')}>
                    <div className={'max-w-[80%] rounded-xl px-3 py-2 text-sm ' + (msg.role === 'user' ? 'bg-gradient-to-br from-blue-500/30 to-indigo-500/30 text-blue-100 border border-blue-500/20' : 'bg-[#1a2332]/80 text-gray-300 border border-white/[0.04]')}>{msg.content}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
          <div className="relative flex flex-wrap gap-2">
            <select value={lead.status} onChange={e => onStatus(lead.id, e.target.value)}
              className={'text-xs px-3 py-2 rounded-xl border font-semibold cursor-pointer transition-all bg-[#0d1117] ' + si.bg + ' ' + si.color + ' ' + si.border}>
              {CRM_STAGES.map(s => <option key={s.key} value={s.key} className="bg-[#0d1117]">{s.label}</option>)}
            </select>
            {lead.phone && (
              <a href={'tel:' + lead.phone} className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl hover:shadow-lg hover:shadow-blue-500/25 transition-all border border-white/10"><Phone size={13} /> Ara</a>
            )}
            {lead.phone && (
              <a href={'https://wa.me/' + lead.phone.replace(/[^0-9]/g, '')} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded-xl hover:bg-emerald-500/20 transition-all"><MessageCircle size={13} /> WhatsApp</a>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
