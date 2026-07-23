'use client'
import { useState, useEffect, useRef } from 'react'
import { MessageSquare, Search, Send, ChevronLeft, Phone, User, Calendar, Bot, CheckCircle2, Filter } from 'lucide-react'

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
  if (s < 60) return 'simdi'
  if (s < 3600) return Math.floor(s / 60) + 'dk'
  if (s < 86400) return Math.floor(s / 3600) + 's'
  return new Date(d).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' })
}

export default function MessagesPage() {
  const [tab, setTab] = useState('messages')
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
  const endRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const saved = localStorage.getItem('bruskapp_ai_global')
    if (saved === 'false') setAiEnabled(false)
    Promise.all([
      fetch('/api/messages/conversations', { credentials: 'include' }).then(r => r.ok ? r.json() : []),
      fetch('/api/tenant/platforms', { credentials: 'include' }).then(r => r.ok ? r.json() : ['webchat']),
      fetch('/api/tenant/ai-override', { credentials: 'include' }).then(r => r.ok ? r.json() : { overrides: {} }),
    ]).then(([convosData, platformsData, overridesData]) => {
      setConvos(convosData)
      setConnectedPlatforms(Array.isArray(platformsData) ? platformsData : ['webchat'])
      setAiConvOverride(overridesData.overrides || {})
      setLoading(false)
    }).catch(() => setLoading(false))
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
    await fetch('/api/tenant/ai-toggle', { method: 'POST', credentials: 'include', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ enabled: val }) }).catch(() => {})
  }

  const toggleAiConv = async (convId: string, platform: string, from: string, active: boolean) => {
    setAiConvOverride(prev => ({ ...prev, [convId]: active }))
    await fetch('/api/tenant/ai-override', {
      method: 'POST', credentials: 'include', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ platform, from, aiEnabled: active }),
    }).catch(() => {})
  }

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [msgs])

  const selectConv = async (c: any) => {
    setSelected(c); setMobileView('chat')
    const res = await fetch('/api/messages?from=' + encodeURIComponent(c.from) + '&limit=50', { credentials: 'include' })
    if (res.ok) { const d = await res.json(); setMsgs((d.messages || []).reverse()) }
    await fetch('/api/messages/read?platform=' + encodeURIComponent(c.platform) + '&from=' + encodeURIComponent(c.from), { method: 'POST', credentials: 'include' }).catch(() => {})
  }

  const sendMsg = async () => {
    if (!newMsg.trim() || !selected) return
    await fetch('/api/messages', { method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'include', body: JSON.stringify({ to: selected.from, content: newMsg, platform: selected.platform }) })
    setNewMsg('')
    const res = await fetch('/api/messages?from=' + encodeURIComponent(selected.from) + '&limit=50', { credentials: 'include' })
    if (res.ok) { const d = await res.json(); setMsgs((d.messages || []).reverse()) }
  }

  const platformTabs: any[] = [{ key: '', label: 'Tumu' }]
  for (const p of connectedPlatforms) {
    if (PLATFORM_MAP[p]) platformTabs.push({ key: p, ...PLATFORM_MAP[p] })
  }
  const filteredConvos = convos.filter((c: any) =>
    (!filter || c.platform === filter) &&
    (!search || c.from?.toLowerCase().includes(search.toLowerCase()) || c.fromName?.toLowerCase().includes(search.toLowerCase()))
  )

  const T = (k: string, l: string) => (
    <button key={k} onClick={() => setTab(k)}
      className={'flex-1 px-3 py-2 rounded-lg text-xs font-semibold transition-all ' + (tab === k ? 'bg-blue-500/10 text-blue-400 shadow-sm' : 'text-gray-500 hover:text-white')}>{l}</button>
  )

  if (tab !== 'messages') {
    return (
      <div className="space-y-6 pb-12">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#0f1420] via-[#0d1117] to-[#0a0e14] border border-[#1a2332] p-6">
          <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl" />
          <div className="relative flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/20"><MessageSquare size={26} className="text-white" /></div>
            <div>
              <h1 className="text-xl font-bold text-white">Mesajlar</h1>
              <p className="text-sm text-gray-500 mt-0.5">Tum kanallardan gelen mesajlari yonetin</p>
            </div>
          </div>
        </div>
        <div className="flex gap-1 bg-[#080b12]/80 border border-[#1a2332] rounded-xl p-0.5 max-w-[280px]">
          {T('messages', 'Mesajlar')}{T('leads', 'Lead Yonetimi')}
        </div>
        {tab === 'leads' && <LeadsView />}
      </div>
    )
  }

  if (loading) return (
    <div className="flex items-center justify-center h-[60vh]">
      <div className="flex flex-col items-center gap-3">
        <div className="w-10 h-10 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
        <span className="text-sm text-gray-600">Mesajlar yukleniyor...</span>
      </div>
    </div>
  )

  return (
    <div className="h-[calc(100vh-5rem)] flex gap-0 relative overflow-hidden rounded-2xl border border-[#1a2332] bg-[#0a0e14] shadow-xl">
      {/* Sidebar */}
      <div className={'w-full md:w-[340px] md:flex-shrink-0 border-r border-[#1a2332] flex flex-col bg-[#0d1117]/80 backdrop-blur-sm ' + (mobileView === 'chat' ? 'hidden md:flex' : 'flex')}>
        <div className="p-4 border-b border-[#1a2332] space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/10"><MessageSquare size={15} className="text-white" /></div>
              <span className="text-sm font-bold text-white">Mesajlar</span>
              <span className="text-[10px] text-gray-600 bg-[#080b12] px-2 py-0.5 rounded-full border border-[#1a2332]">{convos.length}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[9px] text-gray-600 uppercase tracking-widest">AI</span>
              <button onClick={() => toggleAiGlobal(!aiEnabled)}
                className={'relative inline-flex h-[18px] w-[32px] items-center rounded-full transition-all duration-300 ' + (aiEnabled ? 'bg-emerald-500' : 'bg-gray-700')}>
                <span className={'inline-block h-3 w-3 transform rounded-full bg-white transition-all duration-300 shadow-sm ' + (aiEnabled ? 'translate-x-[17px]' : 'translate-x-[2px]')} />
              </button>
            </div>
          </div>
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600" />
            <input value={search} onChange={e => setSearch(e.target.value)}
              className="w-full bg-[#080b12]/80 border border-[#1a2332] rounded-xl pl-9 pr-4 py-2.5 text-white text-sm focus:outline-none focus:border-blue-500/50 placeholder-gray-600 transition-all" placeholder="Konusma ara..." />
          </div>
          <div className="flex gap-1.5 overflow-x-auto pb-0.5 scrollbar-thin">
            {platformTabs.map(p => {
              const Icon = p.icon
              const active = filter === p.key
              return (
                <button key={p.key} onClick={() => setFilter(active ? '' : p.key)}
                  className={'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-semibold transition-all border whitespace-nowrap ' + (active ? (p.bg + ' ' + p.border + ' ' + p.color) : 'border-[#1a2332] text-gray-500 hover:text-white hover:border-gray-600')}>
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
              <div className="w-14 h-14 rounded-2xl bg-[#080b12] border border-[#1a2332] flex items-center justify-center mb-4"><MessageSquare size={22} className="text-gray-700" /></div>
              <p className="text-sm text-gray-500 font-medium mb-1">Henuz konusma yok</p>
              <p className="text-[11px] text-gray-600">Musterilerinizden mesaj geldiginde burada gorunecek</p>
            </div>
          ) : filteredConvos.map((c: any) => {
            const p = ps(c.platform)
            const Icon = p.icon
            const convId = c.platform + ':' + c.from
            const isAiActive = aiConvOverride[convId] ?? true
            return (
              <div key={c.from} onClick={() => selectConv(c)}
                className={'flex items-start gap-3 px-4 py-3.5 cursor-pointer transition-all border-b border-[#1a2332]/30 hover:bg-white/[0.015] group relative ' + (selected?.from === c.from ? 'bg-blue-500/[0.04] border-l-[3px] border-l-blue-500' : 'border-l-[3px] border-l-transparent')}>
                <div className="relative flex-shrink-0 mt-0.5">
                  <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white text-sm font-bold shadow-lg shadow-blue-500/5">{(c.fromName?.[0] || c.from?.[0] || '?').toUpperCase()}</div>
                  {Icon && <div className="absolute -bottom-1 -right-1 w-[18px] h-[18px] rounded-full bg-[#0d1117] flex items-center justify-center ring-[3px] ring-[#0d1117]"><Icon className={'w-2.5 h-2.5 ' + p.color} /></div>}
                  {c.count > 0 && <div className="absolute -top-1 -right-1 w-[18px] h-[18px] rounded-full bg-red-500 flex items-center justify-center text-white text-[8px] font-bold ring-[3px] ring-[#0d1117]">{c.count > 99 ? '99+' : c.count}</div>}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm text-white font-medium truncate">{c.fromName || c.from}</span>
                    <span className="text-[10px] text-gray-600 flex-shrink-0 font-mono">{timeAgo(c.lastMessageAt)}</span>
                  </div>
                  <p className="text-xs text-gray-500 truncate mt-0.5 leading-relaxed">{c.lastContent || ''}</p>
                  <div className="flex items-center gap-2 mt-1.5">
                    <span className="flex items-center gap-1"><Icon className={'w-2.5 h-2.5 ' + p.color} /><span className={'text-[9px] ' + p.color}>{p.label}</span></span>
                    {!isAiActive && (
                      <span className="flex items-center gap-1 text-[9px] text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded-full">Devralindi</span>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Chat Area */}
      <div className={'flex-1 flex flex-col ' + (mobileView === 'list' ? 'hidden md:flex' : 'flex')}>
        {selected ? (
          <>
            <div className="flex items-center gap-3 px-5 py-3 border-b border-[#1a2332] bg-[#0d1117]/95 backdrop-blur-sm">
              <button onClick={() => setMobileView('list')} className="md:hidden p-1.5 rounded-lg text-gray-500 hover:text-white hover:bg-white/5 transition-all"><ChevronLeft size={18} /></button>
              <div className="relative flex-shrink-0">
                <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white text-sm font-bold shadow-lg">{(selected.fromName?.[0] || selected.from?.[0] || '?').toUpperCase()}</div>
                {(() => { const p = ps(selected.platform); const Icon = p.icon; return Icon ? <div className="absolute -bottom-1 -right-1 w-[18px] h-[18px] rounded-full bg-[#0d1117] flex items-center justify-center ring-[3px] ring-[#0d1117]"><Icon className={'w-2.5 h-2.5 ' + p.color} /></div> : null })()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-white font-medium truncate">{selected.fromName || selected.from}</p>
                <p className="flex items-center gap-1.5 text-[10px] text-gray-500">
                  <span className={'inline-block w-1.5 h-1.5 rounded-full ' + ps(selected.platform).dot} />
                  {ps(selected.platform).label}
                </p>
              </div>
              <div className="flex items-center gap-2">
                {(() => {
                  const convId = selected.platform + ':' + selected.from
                  const isAiActive = aiConvOverride[convId] ?? true
                  return (
                    <button onClick={() => toggleAiConv(convId, selected.platform, selected.from, !isAiActive)}
                      className={'px-3 py-1.5 rounded-lg text-[10px] font-semibold border transition-all flex items-center gap-1.5 shadow-sm ' + (isAiActive ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20' : 'bg-amber-500/10 text-amber-400 border-amber-500/20 hover:bg-amber-500/20')}>
                      <Bot size={12} />
                      {isAiActive ? 'AI Aktif' : 'Devralindi'}
                    </button>
                  )
                })()}
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-5 space-y-3 relative" style={{ backgroundImage: 'radial-gradient(ellipse at 20% 50%, rgba(99,102,241,0.03) 0%, transparent 50%), radial-gradient(ellipse at 80% 50%, rgba(168,85,247,0.03) 0%, transparent 50%)' }}>
              {msgs.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <MessageSquare size={28} className="text-gray-700 mb-3" />
                  <p className="text-sm text-gray-600">Henuz mesaj yok</p>
                </div>
              ) : msgs.map((m: any, i: number) => {
                const prev = msgs[i - 1]
                const showAvatar = !prev || prev.direction !== m.direction || prev.from !== m.from
                const isOutgoing = m.direction === 'outgoing'
                return (
                  <div key={m.id} className={'flex items-end gap-2.5 ' + (isOutgoing ? 'justify-end' : 'justify-start')}>
                    {!isOutgoing && showAvatar && (
                      <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white text-[9px] font-bold flex-shrink-0 shadow-md">{(m.fromName?.[0] || m.from?.[0] || '?').toUpperCase()}</div>
                    )}
                    {!isOutgoing && !showAvatar && <div className="w-8 flex-shrink-0" />}
                    <div className={'max-w-[75%] px-4 py-3 rounded-2xl text-sm leading-relaxed shadow-sm transition-all ' + (isOutgoing ? 'bg-gradient-to-br from-blue-600 to-blue-500 text-white rounded-br-sm' : 'bg-[#1a2332] text-gray-200 border border-[#2a3a4a]/50 rounded-bl-sm')}>
                      <p className="whitespace-pre-wrap break-words">{m.content}</p>
                      <p className={'text-[9px] mt-2 flex items-center justify-end gap-1 ' + (isOutgoing ? 'text-blue-200/70' : 'text-gray-600')}>
                        {new Date(m.createdAt).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
                        {isOutgoing && <CheckCircle2 size={10} className="opacity-60" />}
                      </p>
                    </div>
                    {isOutgoing && showAvatar && (
                      <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white text-[9px] font-bold flex-shrink-0 shadow-md">
                        <Bot size={14} />
                      </div>
                    )}
                    {isOutgoing && !showAvatar && <div className="w-8 flex-shrink-0" />}
                  </div>
                )
              })}
              <div ref={endRef} />
            </div>
            <div className="p-4 border-t border-[#1a2332] bg-[#0d1117]/95 backdrop-blur-sm">
              <div className="flex gap-3 items-end">
                <div className="flex-1 relative">
                  <input value={newMsg} onChange={e => setNewMsg(e.target.value)} onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMsg() } }}
                    className="w-full bg-[#080b12]/80 border border-[#1a2332] rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-blue-500/50 placeholder-gray-600 transition-all pr-10" placeholder="Mesaj yazin..." />
                </div>
                <button onClick={sendMsg} disabled={!newMsg.trim()}
                  className="px-5 py-3 bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-xl text-sm font-semibold hover:shadow-lg hover:shadow-blue-500/25 transition-all duration-200 disabled:opacity-40 flex items-center gap-2 active:scale-[0.96]"><Send size={15} /></button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center relative" style={{ backgroundImage: 'radial-gradient(ellipse at 50% 50%, rgba(99,102,241,0.05) 0%, transparent 60%)' }}>
            <div className="text-center max-w-xs">
              <div className="w-20 h-20 mx-auto rounded-3xl bg-gradient-to-br from-[#1a2332] to-[#0d1117] flex items-center justify-center mb-5 shadow-inner border border-white/[0.03]"><MessageSquare size={32} className="text-gray-600" /></div>
              <h3 className="text-white/30 text-sm font-medium mb-1.5">Mesajlar</h3>
              <p className="text-white/15 text-xs leading-relaxed">Soldan bir konusma secin veya musteri mesaji bekleyin</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// ====== CRM Lead Yonetimi ======
const CRM_STAGES = [
  { key: 'yeni', label: 'Yeni Lead', icon: '🆕', desc: 'AI yanit vermedi, bekliyor', color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/20', bar: 'bg-blue-500' },
  { key: 'gorusuldu', label: 'Iletisime Gecildi', icon: '📞', desc: 'AI yanit verdi veya manuel gorusuldu', color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/20', bar: 'bg-amber-500' },
  { key: 'mql', label: 'MQL', icon: '📊', desc: 'Pazarlama onayli aday', color: 'text-sky-400', bg: 'bg-sky-500/10', border: 'border-sky-500/20', bar: 'bg-sky-500' },
  { key: 'sql', label: 'SQL', icon: '🎯', desc: 'Satisa hazir aday', color: 'text-violet-400', bg: 'bg-violet-500/10', border: 'border-violet-500/20', bar: 'bg-violet-500' },
  { key: 'musteri', label: 'Musteri', icon: '✅', desc: 'Satis tamamlandi', color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', bar: 'bg-emerald-500' },
  { key: 'lost', label: 'Kayip', icon: '❌', desc: 'Satis gerceklesmedi', color: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/20', bar: 'bg-red-500' },
]

const stageInfo = (key: string) => CRM_STAGES.find(s => s.key === key) || CRM_STAGES[0]
const stageIndex = (key: string) => CRM_STAGES.findIndex(s => s.key === key)

function LeadsView() {
  const [leads, setLeads] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [viewMode, setViewMode] = useState('pipeline')
  const [selectedStage, setSelectedStage] = useState('')
  const [searchTerm, setSearchTerm] = useState('')

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
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#0f1420] via-[#0d1117] to-[#0a0e14] border border-[#1a2332] p-6 lg:p-8">
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl" />
        <div className="relative">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/20"><User size={24} className="text-white" /></div>
            <div>
              <h1 className="text-xl font-bold text-white">CRM Lead Yonetimi</h1>
              <p className="text-sm text-gray-500 mt-0.5">Musteri adaylarini yonetin, puanlayin ve satisa donusturun</p>
            </div>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {CRM_STAGES.map(s => {
          const count = stageCounts[s.key] || 0
          return (
            <div key={s.key} onClick={() => setSelectedStage(selectedStage === s.key ? '' : s.key)}
              className={'relative overflow-hidden rounded-2xl border p-4 cursor-pointer transition-all duration-300 hover:scale-[1.02] hover:shadow-lg ' + s.bg + ' ' + s.border + (selectedStage === s.key ? ' ring-2 ring-white/20' : '')}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xl">{s.icon}</span>
                <span className={'text-lg font-bold ' + s.color}>{count}</span>
              </div>
              <p className="text-xs text-white font-semibold">{s.label}</p>
              <p className="text-[10px] text-gray-500 mt-0.5 leading-relaxed">{s.desc}</p>
              <div className="mt-3 h-1.5 bg-[#1a2332] rounded-full overflow-hidden">
                <div className={'h-full rounded-full transition-all duration-700 ' + s.bar} style={{ width: Math.min(100, (count / Math.max(...Object.values(stageCounts).map((v: any) => v), 1)) * 100) + '%' }} />
              </div>
            </div>
          )
        })}
      </div>
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600" />
          <input value={searchTerm} onChange={e => setSearchTerm(e.target.value)} placeholder="Musteri adi, telefon veya ihtiyac ile ara..." className="w-full bg-[#080b12]/80 border border-[#1a2332] rounded-xl pl-9 pr-4 py-2.5 text-white text-sm focus:outline-none focus:border-emerald-500/50 placeholder-gray-600" />
        </div>
        <div className="flex gap-1 bg-[#080b12]/80 border border-[#1a2332] rounded-xl p-0.5">
          <button onClick={() => setViewMode('pipeline')} className={'px-3.5 py-2 rounded-lg text-xs font-semibold transition-all ' + (viewMode === 'pipeline' ? 'bg-emerald-500/10 text-emerald-400 shadow-sm' : 'text-gray-500 hover:text-white')}>Pipeline</button>
          <button onClick={() => setViewMode('list')} className={'px-3.5 py-2 rounded-lg text-xs font-semibold transition-all ' + (viewMode === 'list' ? 'bg-emerald-500/10 text-emerald-400 shadow-sm' : 'text-gray-500 hover:text-white')}>Liste</button>
        </div>
      </div>
      {viewMode === 'pipeline' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3">
          {CRM_STAGES.map(stage => {
            const stageLeads = leads.filter((l: any) => l.status === stage.key && (!searchTerm || l.name?.toLowerCase().includes(searchTerm.toLowerCase()) || l.phone?.includes(searchTerm) || l.needs?.toLowerCase().includes(searchTerm.toLowerCase())))
            return (
              <div key={stage.key} className={'rounded-2xl border p-3 ' + stage.bg + ' ' + stage.border}>
                <div className="flex items-center justify-between mb-3 px-1">
                  <div className="flex items-center gap-1.5">
                    <span>{stage.icon}</span>
                    <span className={'text-xs font-semibold ' + stage.color}>{stage.label}</span>
                  </div>
                  <span className={'text-xs font-bold ' + stage.color}>{stageLeads.length}</span>
                </div>
                <div className="space-y-2 max-h-[400px] overflow-y-auto scrollbar-thin">
                  {stageLeads.length === 0 ? (
                    <div className="text-center py-6 text-gray-600 text-[10px]">Henuz kayit yok</div>
                  ) : stageLeads.map((l: any) => (
                    <div key={l.id} className="bg-[#080b12]/80 backdrop-blur-sm rounded-xl p-3 border border-[#1a2332] hover:border-white/20 hover:shadow-lg hover:shadow-black/20 transition-all duration-300 group">
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0 shadow-md">{l.name?.[0] || (l.source === 'webchat' ? 'W' : l.source?.[0]?.toUpperCase() || '?')}</div>
                          <span className="text-xs text-white font-semibold truncate max-w-[90px]">{l.name || (l.source === 'webchat' ? 'Web Chat Ziyaretcisi' : (l.phone ? l.phone : (l.source || 'Bilinmeyen')))}</span>
                        </div>
                        <select value={l.status} onChange={e => updateStatus(l.id, e.target.value)}
                          className="text-[9px] px-1.5 py-0.5 rounded-lg border bg-[#0d1117]/80 cursor-pointer text-gray-400 border-[#1a2332] hover:text-white hover:border-white/20 transition-all">
                          {CRM_STAGES.map(s => <option key={s.key} value={s.key}>{s.icon + ' ' + s.label}</option>)}
                        </select>
                      </div>
                      {l.needs && <div className="text-[10px] text-gray-500 line-clamp-2 leading-relaxed mb-2 bg-[#0a0e14]/60 rounded-lg px-2.5 py-1.5 border border-[#1a2332]/50">{l.needs}</div>}
                      <div className="flex items-center justify-between text-[10px] text-gray-600">
                        <div className="flex items-center gap-2.5">
                          {l.phone && <span className="flex items-center gap-1"><Phone size={9} />{l.phone}</span>}
                          <span className="flex items-center gap-1"><Calendar size={9} />{new Date(l.createdAt).toLocaleDateString('tr-TR')}</span>
                          {l.source && PLATFORM_MAP[l.source] && (() => { const Icon = PLATFORM_MAP[l.source].icon; return <span className="flex items-center gap-1">{Icon ? <Icon className={'w-2.5 h-2.5 ' + PLATFORM_MAP[l.source].color} /> : null}{PLATFORM_MAP[l.source].label}</span> })()}
                        </div>
                        <div className="flex items-center gap-2">
                          {l.hasAiReply && <span className="text-[8px] text-emerald-500 bg-emerald-500/10 px-1.5 py-0.5 rounded-full">AI</span>}
                          {l.phone && <a href={'tel:' + l.phone} className="text-emerald-400 hover:text-emerald-300 font-semibold text-[10px] transition-all">Ara</a>}
                        </div>
                      </div>
                      <div className="mt-2 flex gap-0.5">
                        {CRM_STAGES.map((s, i) => {
                          const idx = stageIndex(l.status)
                          return <div key={s.key} className={'flex-1 h-1 rounded-full transition-all duration-300 ' + (i <= idx ? s.bar : 'bg-[#1a2332]')} />
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
        <div className="bg-[#0d1117]/80 backdrop-blur-xl border border-[#1a2332] rounded-2xl overflow-hidden shadow-xl shadow-black/10">
          <div className="p-4 border-b border-[#1a2332] flex items-center justify-between bg-[#0a0e14]/80">
            <p className="text-sm text-gray-400 font-medium">{filtered.length} kayit</p>
            {selectedStage && <button onClick={() => setSelectedStage('')} className="text-xs text-gray-500 hover:text-white px-3 py-1.5 rounded-lg hover:bg-white/5 transition-all border border-[#1a2332]">Filtreyi Temizle</button>}
          </div>
          {filtered.length === 0 ? (
            <div className="text-center py-16"><User size={40} className="mx-auto text-gray-700 mb-3" /><p className="text-gray-500 text-sm">Eslesen kayit bulunamadi</p></div>
          ) : (
            <div className="divide-y divide-[#1a2332]/50">
              {filtered.map((l: any) => {
                const si = stageInfo(l.status)
                const idx = stageIndex(l.status)
                return (
                  <div key={l.id} className="flex items-start gap-4 p-5 hover:bg-white/[0.02] transition-all duration-300 group">
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white text-sm font-bold shadow-lg shadow-emerald-500/10">{l.name?.[0] || (l.source === 'webchat' ? 'W' : l.source?.[0]?.toUpperCase() || '?')}</div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <h3 className="text-white font-bold text-sm">{l.name || (l.source === 'webchat' ? 'Web Chat Ziyaretcisi' : (l.phone ? l.phone : (l.source || 'Bilinmeyen')))}</h3>
                          {l.phone && <a href={'tel:' + l.phone} className="flex items-center gap-1 text-[10px] text-gray-500 hover:text-emerald-400 transition-all bg-[#080b12]/60 px-2.5 py-1 rounded-lg border border-[#1a2332] group-hover:border-white/10"><Phone size={10} />{l.phone}</a>}
                          {l.hasAiReply && <span className="text-[8px] text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">AI Yanitlandi</span>}
                        </div>
                        <select value={l.status} onChange={e => updateStatus(l.id, e.target.value)}
                          className={'text-xs px-3 py-1.5 rounded-lg border font-semibold cursor-pointer transition-all ' + si.bg + ' ' + si.color + ' ' + si.border}>
                          {CRM_STAGES.map(s => <option key={s.key} value={s.key} className="bg-[#0d1117]">{s.icon + ' ' + s.label}</option>)}
                        </select>
                      </div>
                      <div className="flex items-start gap-6">
                        <div className="flex-1">
                          {l.needs ? (
                            <p className="text-xs text-gray-400 leading-relaxed bg-[#080b12]/40 rounded-xl px-3.5 py-2.5 border border-[#1a2332]/80">{l.needs}</p>
                          ) : (
                            <p className="text-xs text-gray-600 italic">Ihtiyac bilgisi yok</p>
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
                          <div key={s.key} className={'flex-1 h-1.5 rounded-full transition-all duration-300 ' + (i <= idx ? s.bar : 'bg-[#1a2332]/50')} />
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
    </div>
  )
}
