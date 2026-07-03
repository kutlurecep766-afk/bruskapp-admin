'use client'
import { useState, useEffect, useCallback, useRef } from 'react'

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
  { key: 'telegram', label: 'Telegram', icon: TGIcon, color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/30' },
  { key: 'trendyol', label: 'Trendyol', icon: TrendyolIcon, color: 'text-orange-400', bg: 'bg-orange-500/10', border: 'border-orange-500/30' },
  { key: 'hepsiburada', label: 'Hepsiburada', icon: HepsiburadaIcon, color: 'text-purple-400', bg: 'bg-purple-500/10', border: 'border-purple-500/30' },
]

function PlatformDot({ platform }: { platform: string }) {
  const colors: Record<string, string> = { telegram: 'bg-blue-400', trendyol: 'bg-orange-400', hepsiburada: 'bg-purple-400' }
  return <div className={'w-2 h-2 rounded-full ' + (colors[platform] || 'bg-gray-400')} />
}

export default function MessagesPage() {
  const [conversations, setConversations] = useState<any[]>([])
  const [filteredConvs, setFilteredConvs] = useState<any[]>([])
  const [selectedConv, setSelectedConv] = useState<string | null>(null)
  const [messages, setMessages] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [msgLoading, setMsgLoading] = useState(false)
  const [mobileView, setMobileView] = useState<'list' | 'chat'>('list')
  const [platformFilter, setPlatformFilter] = useState('')
  const msgsEndRef = useRef<HTMLDivElement>(null)
  const selectedRef = useRef(selectedConv)
  selectedRef.current = selectedConv

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
      } catch {}
    }
    evtSource.onerror = () => {}
    return () => evtSource.close()
  }, [])

  useEffect(() => {
    if (msgsEndRef.current) msgsEndRef.current.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const selectConv = (id: string) => {
    setSelectedConv(id)
    setMobileView('chat')
    fetchMessages(id)
  }

  const backToList = () => {
    setMobileView('list')
    setSelectedConv(null)
  }

  const formatTime = (iso: string) => {
    const d = new Date(iso)
    const now = new Date()
    const diff = now.getTime() - d.getTime()
    if (diff < 86400000) return d.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })
    return d.toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' })
  }

  const platformIcon = (p: string, className: string) => {
    if (p === 'telegram') return <TGIcon className={className} />
    if (p === 'trendyol') return <TrendyolIcon className={className} />
    if (p === 'hepsiburada') return <HepsiburadaIcon className={className} />
    return null
  }

  const platformColor = (p: string) => {
    if (p === 'telegram') return 'bg-blue-500/20'
    if (p === 'trendyol') return 'bg-orange-500/20'
    if (p === 'hepsiburada') return 'bg-purple-500/20'
    return 'bg-gray-500/20'
  }

  const platformIconColor = (p: string) => {
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
          <p className="text-xs text-gray-500">{filteredConvs.length} konusma</p>
        </div>
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="p-4 text-center text-gray-500 text-sm">Yukleniyor...</div>
          ) : filteredConvs.length === 0 ? (
            <div className="p-4 text-center text-gray-500 text-sm">Henuz mesaj yok</div>
          ) : (
            filteredConvs.map((conv: any) => (
              <button key={conv.id} onClick={() => selectConv(conv.id)}
                className={'w-full text-left px-4 py-3 border-b border-[#1a2332]/50 hover:bg-[#1a2332]/30 transition-all ' + (selectedConv === conv.id ? 'bg-[#1a2332]/50 md:border-l-2 md:border-l-blue-500' : '')}>
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

      <div className={'flex-1 bg-[#0d1117]/80 backdrop-blur-xl border border-[#1a2332] rounded-2xl overflow-hidden flex flex-col ' + (mobileView === 'list' ? 'hidden md:flex' : 'flex')}>
        {selectedConv ? (
          <>
            <div className="p-3 md:p-4 border-b border-[#1a2332] flex items-center gap-3">
              <button onClick={backToList} className="md:hidden text-gray-400 hover:text-white mr-1">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <div className={'w-8 h-8 rounded-full flex items-center justify-center ' + platformColor(messages[0]?.platform)}>
                {platformIcon(messages[0]?.platform, 'w-4 h-4 ' + platformIconColor(messages[0]?.platform))}
              </div>
              <div>
                <h3 className="text-white font-medium text-sm">{selectedConv.split(':')[1]}</h3>
                <p className="text-xs text-gray-500 capitalize">{messages[0]?.platform || ''} - {messages.length} mesaj</p>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-3 md:p-4 space-y-2">
              {msgLoading ? (
                <div className="text-center text-gray-500 text-sm py-8">Yukleniyor...</div>
              ) : messages.length === 0 ? (
                <div className="text-center text-gray-500 text-sm py-8">Henuz mesaj yok</div>
              ) : (
                messages.map((msg: any) => (
                  <div key={msg.id} className={'flex ' + (msg.direction === 'outgoing' ? 'justify-end' : 'justify-start')}>
                    <div className={'max-w-[85%] md:max-w-[70%] px-3 py-2 md:px-4 md:py-2.5 rounded-2xl text-sm ' + (msg.direction === 'outgoing' ? 'bg-blue-500 text-white rounded-br-md' : 'bg-[#1a2332] text-gray-200 rounded-bl-md')}>
                      <p className="break-words">{msg.content}</p>
                      <p className={'text-xs mt-1 ' + (msg.direction === 'outgoing' ? 'text-blue-200' : 'text-gray-500')}>{formatTime(msg.createdAt)}</p>
                    </div>
                  </div>
                ))
              )}
              <div ref={msgsEndRef} />
            </div>
          </>
        ) : (
          <div className="hidden md:flex flex-1 items-center justify-center">
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
