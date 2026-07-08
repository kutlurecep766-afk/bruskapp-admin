'use client'
import { useState, useEffect, useCallback, useRef } from 'react'

function WAIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" fill="currentColor"/>
    </svg>
  )
}

function IGAcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none">
      <rect x="2" y="2" width="20" height="20" rx="5" stroke="currentColor" strokeWidth="1.8" fill="none"/>
      <circle cx="12" cy="12" r="5" stroke="currentColor" strokeWidth="1.8" fill="none"/>
      <circle cx="17.5" cy="6.5" r="1.5" fill="currentColor" opacity="0.6"/>
    </svg>
  )
}

function TGIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none">
      <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM16.64 8.8C16.49 9.59 15.74 13.11 15.36 14.72C15.2 15.39 14.89 15.67 14.59 15.7C13.94 15.75 13.44 15.27 12.82 14.87C11.85 14.25 11.3 13.86 10.37 13.27C9.29 12.6 10.02 12.23 10.67 11.6C10.83 11.43 13.21 9.27 13.27 9.04C13.28 8.99 13.28 8.84 13.22 8.78C13.16 8.72 13.02 8.74 12.91 8.77C12.76 8.81 11.09 9.87 8.52 11.64C8.09 11.93 7.71 12.08 7.37 12.07C6.99 12.06 6.28 11.85 5.74 11.67C5.08 11.45 4.57 11.33 4.61 10.97C4.63 10.79 4.87 10.6 5.34 10.41C8.21 9.13 10.14 8.25 11.13 7.78C13.88 6.46 14.46 6.25 14.84 6.25C14.92 6.25 15.12 6.27 15.25 6.38C15.36 6.47 15.39 6.59 15.4 6.68C15.41 6.77 15.43 6.95 15.41 7.11C15.37 7.41 15.59 8.16 16.64 8.8Z" fill="currentColor"/>
    </svg>
  )
}

function HepsiburadaIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none">
      <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
    </svg>
  )
}

function TrendyolIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none">
      <path d="M4 7h16l-1.5 14H5.5L4 7zM8 7V5a4 4 0 0 1 8 0v2" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
      <circle cx="12" cy="14" r="2" fill="currentColor" opacity="0.6"/>
    </svg>
  )
}

const PLATFORMS = [
  { key: '', label: 'Tumu', icon: null, color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/30' },
  { key: 'whatsapp', label: 'WhatsApp', icon: WAIcon, color: 'text-green-400', bg: 'bg-green-500/10', border: 'border-green-500/30' },
  { key: 'instagram', label: 'Instagram', icon: IGAcon, color: 'text-pink-400', bg: 'bg-pink-500/10', border: 'border-pink-500/30' },
  { key: 'telegram', label: 'Telegram', icon: TGIcon, color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/30' },
  { key: 'trendyol', label: 'Trendyol', icon: TrendyolIcon, color: 'text-orange-400', bg: 'bg-orange-500/10', border: 'border-orange-500/30' },
  { key: 'hepsiburada', label: 'Hepsiburada', icon: HepsiburadaIcon, color: 'text-purple-400', bg: 'bg-purple-500/10', border: 'border-purple-500/30' },
]

function PlatformDot({ platform }: { platform: string }) {
  const colors: Record<string, string> = { whatsapp: 'bg-green-400', instagram: 'bg-pink-400', telegram: 'bg-blue-400', trendyol: 'bg-orange-400', hepsiburada: 'bg-purple-400' }
  return <div className={'w-2 h-2 rounded-full ' + (colors[platform] || 'bg-gray-400')} />
}

const themeBg: Record<string, string> = { whatsapp: '#0b141a', instagram: '#1a0d14', telegram: '#0d1418' }
const themeHeader: Record<string, string> = { whatsapp: 'bg-[#1f2c33] border-b border-[#2a3a4a]', instagram: 'bg-[#2a1a28] border-b border-[#3a2a38]', telegram: 'bg-[#17212b] border-b border-[#232e3a]' }
const themeChatBg: Record<string, string> = { whatsapp: '#0b141a', instagram: '#0d0a0e', telegram: '#0b141a' }
const themeOutgoing: Record<string, string> = { whatsapp: 'text-white rounded-2xl rounded-br-md', instagram: 'text-white rounded-2xl rounded-br-md', telegram: 'text-white rounded-2xl rounded-br-md' }
const themeOutgoingBg: Record<string, string> = { whatsapp: '#005c4b', instagram: '#8a3a5c', telegram: '#2b5278' }
const themeIncomingBg: Record<string, string> = { whatsapp: '#1f2c33', instagram: '#1a1218', telegram: '#182533' }
const themeFooter: Record<string, string> = { whatsapp: 'bg-[#1f2c33]', instagram: 'bg-[#2a1a28]', telegram: 'bg-[#17212b]' }
const themeInputBg: Record<string, string> = { whatsapp: '#2a3942', instagram: '#3a2a38', telegram: '#242f3d' }

export default function MessagesPage() {
  const [conversations, setConversations] = useState<any[]>([])
  const [filteredConvs, setFilteredConvs] = useState<any[]>([])
  const [selectedConv, setSelectedConv] = useState<string | null>(null)
  const [messages, setMessages] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [msgLoading, setMsgLoading] = useState(false)
  const [mobileView, setMobileView] = useState<'list' | 'chat'>('list')
  const [platformFilter, setPlatformFilter] = useState('')
  const [replyText, setReplyText] = useState('')
  const [sending, setSending] = useState(false)
  const [aiEnabled, setAiEnabled] = useState(true)
  const [aiPausedMap, setAiPausedMap] = useState<Record<string, boolean>>({})
  const [aiToggling, setAiToggling] = useState<string | null>(null)
  const msgsEndRef = useRef<HTMLDivElement>(null)
  const selectedRef = useRef(selectedConv)
  selectedRef.current = selectedConv

  useEffect(() => {
    const saved = localStorage.getItem('aiAutoReply')
    if (saved !== null) setAiEnabled(saved === 'true')
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission()
    }
    if ('serviceWorker' in navigator && 'PushManager' in window) {
      navigator.serviceWorker.register('/sw.js').then(reg => {
        if (!reg.pushManager) return
        fetch('/api/push/vapid-key').then(r => r.json()).then(({ publicKey }) => {
          if (!publicKey) return
          reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: urlBase64ToUint8Array(publicKey) })
            .then(sub => fetch('/api/push/subscribe', { method: 'POST', credentials: 'include', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(sub.toJSON()) }).catch(() => {}))
            .catch(() => {})
        }).catch(() => {})
      }).catch(() => {})
    }
  }, [])

  function urlBase64ToUint8Array(base64: string) {
    const padding = '='.repeat((4 - (base64.length % 4)) % 4)
    const b64 = (base64 + padding).replace(/-/g, '+').replace(/_/g, '/')
    const raw = atob(b64)
    return new Uint8Array(raw.split('').map(c => c.charCodeAt(0)))
  }

  const fetchConversations = useCallback(async () => {
    try {
      const res = await fetch('/api/messages/conversations', { credentials: 'include' })
      if (res.ok) setConversations(await res.json())
    } catch {} finally { setLoading(false) }
  }, [])

  useEffect(() => {
    setFilteredConvs(platformFilter ? conversations.filter(c => c.platform === platformFilter) : conversations)
  }, [conversations, platformFilter])

  const fetchMessages = useCallback(async (convId: string) => {
    setMsgLoading(true)
    try {
      const [platform, from] = convId.split(':')
      const res = await fetch('/api/messages?platform=' + platform + '&from=' + encodeURIComponent(from) + '&limit=100', { credentials: 'include' })
      if (res.ok) {
        const d = await res.json()
        setMessages((d.messages || []).reverse())
      }
    } catch {} finally { setMsgLoading(false) }
  }, [])

  useEffect(() => {
    fetchConversations()
  }, [fetchConversations])

  useEffect(() => {
    const evtSource = new EventSource('/api/messages/events')
    evtSource.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data)
        const convId = msg.platform + ':' + msg.from
        setConversations(prev => {
          const idx = prev.findIndex(c => c.id === convId)
          if (idx >= 0) {
            const updated = [...prev]
            updated[idx] = { ...updated[idx], lastContent: msg.content, lastMessageAt: msg.createdAt, count: updated[idx].count + 1 }
            updated.sort((a, b) => new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime())
            return updated
          }
          return [{ id: convId, platform: msg.platform, from: msg.from, lastContent: msg.content, lastMessageAt: msg.createdAt, count: 1 }, ...prev]
        })
        if (selectedRef.current === convId) {
          setMessages(prev => [...prev, { ...msg, direction: msg.direction || 'incoming' }])
        }
        if (msg.direction !== 'outgoing' && document.visibilityState === 'hidden') {
          try {
            const n = new Notification('Yeni mesaj: ' + msg.platform, {
              body: msg.from + ': ' + (msg.content?.slice(0, 80) || ''),
              icon: '/favicon.svg',
              silent: true,
            })
            setTimeout(() => n.close(), 4000)
          } catch {}
        }
      } catch {}
    }
    evtSource.onerror = () => {}
    return () => evtSource.close()
  }, [])

  useEffect(() => {
    if (msgsEndRef.current) msgsEndRef.current.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const selectConv = async (id: string) => {
    setSelectedConv(id)
    setMobileView('chat')
    fetchMessages(id)
    const [platform, from] = id.split(':')
    if (platform === 'whatsapp' || platform === 'instagram') {
      try {
        const res = await fetch(`/api/${platform}/ai/status?from=${encodeURIComponent(from)}`, { credentials: 'include' })
        if (res.ok) {
          const data = await res.json()
          setAiPausedMap(prev => ({ ...prev, [id]: data.paused }))
        }
      } catch {}
    }
  }

  const backToList = () => {
    setMobileView('list')
    setSelectedConv(null)
  }

  const sendReply = useCallback(async () => {
    if (!replyText.trim() || !selectedConv || sending) return
    setSending(true)
    const [platform, from] = selectedConv.split(':')
    const text = replyText.trim()
    setReplyText('')
    try {
      const endpoint = platform === 'whatsapp' ? '/api/whatsapp/send' : platform === 'instagram' ? '/api/instagram/send' : platform === 'telegram' ? '/api/telegram/send' : null
      if (!endpoint) return
      await fetch(endpoint, {
        method: 'POST', credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(platform === 'telegram' ? { chatId: from, message: text } : { to: from, message: text }),
      })
    } catch {} finally { setSending(false) }
  }, [replyText, selectedConv, sending])

  const toggleAiGlobal = () => {
    const next = !aiEnabled
    setAiEnabled(next)
    localStorage.setItem('aiAutoReply', String(next))
  }

  const toggleAiPause = async (convId: string) => {
    const [platform, from] = convId.split(':')
    if (platform !== 'whatsapp' && platform !== 'instagram') return
    const isPaused = aiPausedMap[convId]
    setAiToggling(convId)
    try {
      const endpoint = isPaused ? `/api/${platform}/ai/resume` : `/api/${platform}/ai/pause`
      const res = await fetch(endpoint, {
        method: 'POST', credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ from }),
      })
      if (res.ok) setAiPausedMap(prev => ({ ...prev, [convId]: !isPaused }))
    } catch {} finally { setAiToggling(null) }
  }

  const handleReplyKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendReply() }
  }

  const formatTime = (iso: string) => {
    const d = new Date(iso)
    const now = new Date()
    const diff = now.getTime() - d.getTime()
    if (diff < 86400000) return d.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })
    return d.toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' })
  }

  const platformIcon = (p: string, className: string) => {
    if (p === 'whatsapp') return <WAIcon className={className} />
    if (p === 'instagram') return <IGAcon className={className} />
    if (p === 'telegram') return <TGIcon className={className} />
    if (p === 'trendyol') return <TrendyolIcon className={className} />
    if (p === 'hepsiburada') return <HepsiburadaIcon className={className} />
    return null
  }

  const platformColor = (p: string) => {
    if (p === 'whatsapp') return 'bg-green-500/20'
    if (p === 'instagram') return 'bg-pink-500/20'
    if (p === 'telegram') return 'bg-blue-500/20'
    if (p === 'trendyol') return 'bg-orange-500/20'
    if (p === 'hepsiburada') return 'bg-purple-500/20'
    return 'bg-gray-500/20'
  }

  const platformIconColor = (p: string) => {
    if (p === 'whatsapp') return 'text-green-400'
    if (p === 'instagram') return 'text-pink-400'
    if (p === 'telegram') return 'text-blue-400'
    if (p === 'trendyol') return 'text-orange-400'
    if (p === 'hepsiburada') return 'text-purple-400'
    return 'text-gray-400'
  }

  return (
    <div className="h-[calc(100vh-6rem)] flex gap-4 relative">
      <div className={'w-full md:w-80 md:flex-shrink-0 bg-[#0d1117]/80 backdrop-blur-xl border border-[#1a2332] rounded-2xl overflow-hidden flex flex-col ' + (mobileView === 'chat' ? 'hidden md:flex' : 'flex')}>
        <div className="p-3 border-b border-[#1a2332] space-y-2">
          <h2 className="text-white font-semibold text-sm">Mesajlar</h2>
          <div className="flex gap-1.5 flex-wrap">
            {PLATFORMS.map(p => {
              const Icon = p.icon
              return (
                <button key={p.key} onClick={() => setPlatformFilter(p.key)}
                  className={'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ' + (platformFilter === p.key ? (p.color || 'text-white') + ' ' + (p.bg || 'bg-blue-500/20') + ' ' + (p.border || 'border-blue-500/30') + ' border' : 'text-gray-400 hover:text-gray-200 bg-[#1a2332]/50')}>
                  {Icon && <Icon className="w-3.5 h-3.5" />}
                  {p.label}
                </button>
              )
            })}
          </div>
          <div className="flex items-center justify-between">
            <p className="text-xs text-gray-500">{filteredConvs.length} konusma</p>
            <button onClick={toggleAiGlobal} className={'text-xs flex items-center gap-1.5 px-2.5 py-1 rounded-lg transition-all ' + (aiEnabled ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400')}>
              <div className={'w-1.5 h-1.5 rounded-full ' + (aiEnabled ? 'bg-emerald-400' : 'bg-red-400')} />
              AI {aiEnabled ? 'Aktif' : 'Kapali'}
            </button>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="p-4 text-center text-gray-500 text-sm">Yukleniyor...</div>
          ) : filteredConvs.length === 0 ? (
            <div className="p-4 text-center text-gray-500 text-sm">Henuz mesaj yok</div>
          ) : (
            filteredConvs.map((conv: any) => (
              <button key={conv.id} onClick={() => selectConv(conv.id)}
                className={'w-full text-left px-4 py-3 border-b border-[#1a2332]/50 hover:bg-[#1a2332]/30 transition-all ' + (selectedConv === conv.id ? 'bg-[#1a2332]/50 md:border-l-2 md:border-l-' + (conv.platform === 'whatsapp' ? 'green-500' : conv.platform === 'instagram' ? 'pink-500' : conv.platform === 'telegram' ? 'blue-500' : 'blue-500') : '')}>
                <div className="flex items-start gap-3">
                  <div className={'w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 ' + platformColor(conv.platform)}>
                    {platformIcon(conv.platform, 'w-4 h-4 ' + platformIconColor(conv.platform))}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-white truncate">{conv.from}</span>
                      <span className="text-xs text-gray-500 flex-shrink-0 ml-2">{formatTime(conv.lastMessageAt)}</span>
                    </div>
                    <p className="text-xs text-gray-500 truncate mt-0.5">{conv.lastContent}</p>
                  </div>
                </div>
              </button>
            ))
          )}
        </div>
      </div>

          <div className={'flex-1 flex flex-col overflow-hidden rounded-2xl ' + (mobileView === 'list' ? 'hidden md:flex' : 'flex')} style={{ backgroundColor: themeBg[messages[0]?.platform] || '#0d1117' }}>
        {selectedConv ? (
          <>
            <div className={'flex items-center gap-3 px-4 py-3 ' + themeHeader[messages[0]?.platform] || 'bg-[#0d1117]'}>
              <button onClick={backToList} className="md:hidden text-white/70 hover:text-white mr-1">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <div className={'w-9 h-9 rounded-full flex items-center justify-center shadow-lg ' + platformColor(messages[0]?.platform)}>
                {platformIcon(messages[0]?.platform, 'w-4.5 h-4.5 ' + platformIconColor(messages[0]?.platform))}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-white font-semibold text-sm truncate">{selectedConv.split(':')[1]}</h3>
                <p className="text-xs text-white/60 truncate">{messages.length} mesaj · {messages[0]?.platform || ''}</p>
              </div>
              {['whatsapp', 'instagram'].includes(selectedConv.split(':')[0]) && (
                <button onClick={() => toggleAiPause(selectedConv)} disabled={aiToggling === selectedConv}
                  className={'text-xs font-medium flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-all backdrop-blur-sm ' + (aiPausedMap[selectedConv] ? 'bg-white/10 text-white' : 'bg-white/10 text-white/80 hover:bg-white/20')}>
                  {aiToggling === selectedConv ? (
                    <svg className="w-3 h-3 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
                  ) : aiPausedMap[selectedConv] ? 'AI\'ye Devret' : 'AI\'den Devral'}
                </button>
              )}
            </div>
            <div className="flex-1 overflow-y-auto p-3 md:p-4 space-y-1" style={{ backgroundColor: themeChatBg[messages[0]?.platform] || '#0a0e14' }}>
              {msgLoading ? (
                <div className="text-center text-gray-500 text-sm py-8">Yukleniyor...</div>
              ) : messages.length === 0 ? (
                <div className="text-center text-gray-500 text-sm py-8">Henuz mesaj yok</div>
              ) : (
                messages.map((msg: any, idx: number) => {
                  const isOut = msg.direction === 'outgoing'
                  const platform = messages[0]?.platform
                  const showAvatar = !isOut && (idx === 0 || messages[idx-1]?.direction === 'outgoing')
                  return (
                    <div key={msg.id} className={'flex items-end gap-2 ' + (isOut ? 'justify-end' : 'justify-start')}>
                      {!isOut && <div className={'w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center ' + (showAvatar ? platformColor(platform) : 'opacity-0')}>{showAvatar && platformIcon(platform, 'w-3.5 h-3.5 ' + platformIconColor(platform))}</div>}
                      <div className={'max-w-[80%] md:max-w-[65%] px-3.5 py-2.5 text-sm leading-relaxed shadow-sm ' + (isOut ? themeOutgoing[platform] || 'bg-blue-600 text-white rounded-2xl rounded-br-md' : 'text-gray-100 rounded-2xl rounded-bl-md')} style={{ backgroundColor: isOut ? themeOutgoingBg[platform] : themeIncomingBg[platform] }}>
                        <p className="break-words whitespace-pre-wrap">{msg.content}</p>
                        <div className={'flex items-center gap-1 mt-1 ' + (isOut ? 'justify-end' : 'justify-start')}>
                          <span className={'text-[10px] ' + (isOut ? 'text-white/60' : 'text-gray-500')}>{formatTime(msg.createdAt)}</span>
                          {isOut && <svg className="w-3.5 h-3.5 text-white/50" viewBox="0 0 16 11" fill="currentColor"><path d="M11.071.653a.457.457 0 0 0-.304-.102.493.493 0 0 0-.381.178l-6.19 7.636-2.011-2.095a.463.463 0 0 0-.336-.153.457.457 0 0 0-.343.145.515.515 0 0 0-.14.337c0 .136.051.264.14.366l2.394 2.49c.1.104.228.158.367.153a.477.477 0 0 0 .367-.178l6.53-8.056a.515.515 0 0 0 .102-.343.487.487 0 0 0-.167-.382z"/></svg>}
                        </div>
                      </div>
                    </div>
                  )
                })
              )}
              <div ref={msgsEndRef} />
            </div>
            <div className={'px-4 py-3 ' + themeFooter[messages[0]?.platform] || 'bg-[#0d1117] border-t border-[#1a2332]'}>
              <div className="flex items-center gap-2 rounded-xl px-4 py-2.5" style={{ backgroundColor: themeInputBg[messages[0]?.platform] || '#1a2332' }}>
                <input
                  value={replyText} onChange={e => setReplyText(e.target.value)}
                  onKeyDown={handleReplyKeyDown}
                  placeholder={"Mesaj yaz..."}
                  className="flex-1 bg-transparent text-white text-sm outline-none placeholder-white/40"
                  disabled={sending}
                />
                <button onClick={sendReply} disabled={sending || !replyText.trim()}
                  className={'p-1.5 rounded-lg transition-all ' + (sending || !replyText.trim() ? 'text-white/20' : 'text-white/80 hover:scale-110')}>
                  {sending ? (
                    <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"/></svg>
                  )}
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="hidden md:flex flex-1 items-center justify-center" style={{ backgroundColor: '#0a0e14' }}>
            <div className="text-center">
              <div className="w-16 h-16 mx-auto rounded-full bg-[#1a2332] flex items-center justify-center mb-4">
                <svg className="w-8 h-8 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <p className="text-gray-500 text-sm">Bir konusma secin</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
