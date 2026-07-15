'use client'
import { useState, useEffect, useCallback, useRef } from 'react'

function WAIcon({ className }: { className?: string }) {
  return <svg className={className} viewBox="0 0 24 24" fill="none"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" fill="currentColor"/></svg>
}
function IGAcon({ className }: { className?: string }) {
  return <svg className={className} viewBox="0 0 24 24" fill="none"><rect x="2" y="2" width="20" height="20" rx="5" stroke="currentColor" strokeWidth="1.8" fill="none"/><circle cx="12" cy="12" r="5" stroke="currentColor" strokeWidth="1.8" fill="none"/><circle cx="17.5" cy="6.5" r="1.5" fill="currentColor" opacity="0.6"/></svg>
}
function TGIcon({ className }: { className?: string }) {
  return <svg className={className} viewBox="0 0 24 24" fill="none"><path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM16.64 8.8C16.49 9.59 15.74 13.11 15.36 14.72C15.2 15.39 14.89 15.67 14.59 15.7C13.94 15.75 13.44 15.27 12.82 14.87C11.85 14.25 11.3 13.86 10.37 13.27C9.29 12.6 10.02 12.23 10.67 11.6C10.83 11.43 13.21 9.27 13.27 9.04C13.28 8.99 13.28 8.84 13.22 8.78C13.16 8.72 13.02 8.74 12.91 8.77C12.76 8.81 11.09 9.87 8.52 11.64C8.09 11.93 7.71 12.08 7.37 12.07C6.99 12.06 6.28 11.85 5.74 11.67C5.08 11.45 4.57 11.33 4.61 10.97C4.63 10.79 4.87 10.6 5.34 10.41C8.21 9.13 10.14 8.25 11.13 7.78C13.88 6.46 14.46 6.25 14.84 6.25C14.92 6.25 15.12 6.27 15.25 6.38C15.36 6.47 15.39 6.59 15.4 6.68C15.41 6.77 15.43 6.95 15.41 7.11C15.37 7.41 15.59 8.16 16.64 8.8Z" fill="currentColor"/></svg>
}
function HepsiburadaIcon({ className }: { className?: string }) {
  return <svg className={className} viewBox="0 0 24 24" fill="none"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" fill="none"/></svg>
}
function MessengerIcon({ className }: { className?: string }) {
  return <svg className={className} viewBox="0 0 24 24" fill="none"><path d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.17 6.839 9.49-.094-.82-.18-2.083.038-2.98l.603-2.56s-.16-.32-.16-.794c0-.744.432-1.3.97-1.3.456 0 .68.342.68.752 0 .458-.29 1.144-.44 1.78-.126.53.268.962.795.962.954 0 1.688-1.008 1.688-2.463 0-1.288-.926-2.188-2.246-2.188-1.53 0-2.428 1.148-2.428 2.333 0 .462.178.957.4 1.226.044.054.05.1.037.156-.04.168-.13.536-.148.61-.023.098-.078.12-.18.072-.672-.312-1.092-1.296-1.092-2.088 0-1.7 1.235-3.26 3.56-3.26 1.87 0 3.322 1.332 3.322 3.113 0 1.858-1.172 3.353-2.8 3.353-.546 0-1.06-.284-1.236-.62l-.336 1.28c-.122.47-.452 1.058-.672 1.416A10.05 10.05 0 0012 22c5.523 0 10-4.477 10-10S17.523 2 12 2z" fill="currentColor"/></svg>
}
function TrendyolIcon({ className }: { className?: string }) {
  return <svg className={className} viewBox="0 0 24 24" fill="none"><path d="M4 7h16l-1.5 14H5.5L4 7zM8 7V5a4 4 0 0 1 8 0v2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" fill="none"/><circle cx="12" cy="14" r="2" fill="currentColor" opacity="0.6"/></svg>
}

const PLATFORMS = [
  { key: '', label: 'Tumu', icon: null, color: 'text-white', bg: 'bg-blue-500/20' },
  { key: 'whatsapp', label: 'WhatsApp', icon: WAIcon, color: 'text-green-300', bg: 'bg-green-500/20' },
  { key: 'instagram', label: 'Instagram', icon: IGAcon, color: 'text-pink-300', bg: 'bg-pink-500/20' },
  { key: 'telegram', label: 'Telegram', icon: TGIcon, color: 'text-blue-300', bg: 'bg-blue-500/20' },
  { key: 'messenger', label: 'Facebook', icon: MessengerIcon, color: 'text-sky-300', bg: 'bg-sky-500/20' },
  { key: 'trendyol', label: 'Trendyol', icon: TrendyolIcon, color: 'text-orange-300', bg: 'bg-orange-500/20' },
  { key: 'hepsiburada', label: 'Hepsiburada', icon: HepsiburadaIcon, color: 'text-purple-300', bg: 'bg-purple-500/20' },
]

const platformColor = (p: string) => {
  if (p === 'whatsapp') return 'bg-green-500/20'; if (p === 'instagram') return 'bg-pink-500/20'
  if (p === 'telegram') return 'bg-blue-500/20'; if (p === 'messenger') return 'bg-sky-500/20'
  if (p === 'trendyol') return 'bg-orange-500/20'; if (p === 'hepsiburada') return 'bg-purple-500/20'
  return 'bg-gray-500/20'
}
const platformIconColor = (p: string) => {
  if (p === 'whatsapp') return 'text-green-400'; if (p === 'instagram') return 'text-pink-400'
  if (p === 'telegram') return 'text-blue-400'; if (p === 'messenger') return 'text-sky-400'
  if (p === 'trendyol') return 'text-orange-400'; if (p === 'hepsiburada') return 'text-purple-400'
  return 'text-gray-400'
}
const platformBadge = (p: string) => {
  if (p === 'whatsapp') return { bg: 'bg-green-500/15', text: 'text-green-300', label: 'WA' }
  if (p === 'instagram') return { bg: 'bg-pink-500/15', text: 'text-pink-300', label: 'IG' }
  if (p === 'telegram') return { bg: 'bg-blue-500/15', text: 'text-blue-300', label: 'TG' }
  if (p === 'messenger') return { bg: 'bg-sky-500/15', text: 'text-sky-300', label: 'FB' }
  if (p === 'trendyol') return { bg: 'bg-orange-500/15', text: 'text-orange-300', label: 'TY' }
  if (p === 'hepsiburada') return { bg: 'bg-purple-500/15', text: 'text-purple-300', label: 'HB' }
  return { bg: 'bg-gray-500/15', text: 'text-gray-300', label: '??' }
}

const themeBg: Record<string, string> = { whatsapp: '#0b141a', instagram: '#1a0d14', telegram: '#0d1418', messenger: '#0a0e1a' }
const themeChatBg: Record<string, string> = { whatsapp: '#0b141a', instagram: '#0d0a0e', telegram: '#0b141a', messenger: '#080c18' }
const themeOutgoingBg: Record<string, string> = { whatsapp: '#005c4b', instagram: '#8a3a5c', telegram: '#2b5278', messenger: '#0066ff' }
const themeIncomingBg: Record<string, string> = { whatsapp: '#1f2c33', instagram: '#1a1218', telegram: '#182533', messenger: '#141824' }
const themeInputBg: Record<string, string> = { whatsapp: '#2a3942', instagram: '#3a2a38', telegram: '#242f3d', messenger: '#1a1f2e' }

const themeWallpaper: Record<string, string> = {
  whatsapp: 'url("data:image/svg+xml,%3Csvg width=\'32\' height=\'32\' viewBox=\'0 0 32 32\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'0.03\'%3E%3Cpath d=\'M11 0h2v2h-2zM5 5h2v2H5zM1 9h2v2H1zM9 9h2v2H9zM21 7h2v2h-2zM25 3h2v2h-2zM15 13h2v2h-2zM23 13h2v2h-2zM27 11h2v2h-2zM29 17h2v2h-2zM19 19h2v2h-2zM7 15h2v2H7zM3 21h2v2H3zM13 21h2v2h-2zM17 25h2v2h-2zM9 27h2v2H9zM29 25h2v2h-2zM1 1h2v2H1z\'/%3E%3C/g%3E%3C/svg%3E")',
  instagram: 'url("data:image/svg+xml,%3Csvg width=\'40\' height=\'40\' viewBox=\'0 0 40 40\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'0.02\'%3E%3Ccircle cx=\'4\' cy=\'4\' r=\'1.5\'/%3E%3Ccircle cx=\'20\' cy=\'8\' r=\'1.5\'/%3E%3Ccircle cx=\'36\' cy=\'4\' r=\'1.5\'/%3E%3Ccircle cx=\'12\' cy=\'20\' r=\'1.5\'/%3E%3Ccircle cx=\'28\' cy=\'20\' r=\'1.5\'/%3E%3Ccircle cx=\'4\' cy=\'36\' r=\'1.5\'/%3E%3Ccircle cx=\'20\' cy=\'32\' r=\'1.5\'/%3E%3Ccircle cx=\'36\' cy=\'36\' r=\'1.5\'/%3E%3Ccircle cx=\'20\' cy=\'20\' r=\'2.5\'/%3E%3C/g%3E%3C/svg%3E")',
  telegram: 'url("data:image/svg+xml,%3Csvg width=\'30\' height=\'30\' viewBox=\'0 0 30 30\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'0.025\'%3E%3Cpolygon points=\'15,2 18,12 28,12 20,18 23,28 15,22 7,28 10,18 2,12 12,12\'/%3E%3C/g%3E%3C/svg%3E")',
  messenger: 'url("data:image/svg+xml,%3Csvg width=\'36\' height=\'36\' viewBox=\'0 0 36 36\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'0.02\'%3E%3Crect x=\'2\' y=\'2\' width=\'14\' height=\'14\' rx=\'2\'/%3E%3Crect x=\'20\' y=\'2\' width=\'14\' height=\'14\' rx=\'2\'/%3E%3Crect x=\'2\' y=\'20\' width=\'14\' height=\'14\' rx=\'2\'/%3E%3Crect x=\'20\' y=\'20\' width=\'14\' height=\'14\' rx=\'2\'/%3E%3C/g%3E%3C/svg%3E")',
  trendyol: 'url("data:image/svg+xml,%3Csvg width=\'28\' height=\'28\' viewBox=\'0 0 28 28\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'0.02\'%3E%3Cpath d=\'M14 2L26 14 14 26 2 14z\'/%3E%3C/g%3E%3C/svg%3E")',
  hepsiburada: 'url("data:image/svg+xml,%3Csvg width=\'24\' height=\'24\' viewBox=\'0 0 24 24\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'0.025\'%3E%3Cpath d=\'M4 4h8v8H4zM12 4h8v8h-8zM4 12h8v8H4zM12 12h8v8h-8z\'/%3E%3C/g%3E%3C/svg%3E")',
}

function platformIcon(p: string, className: string) {
  if (p === 'whatsapp') return <WAIcon className={className} />; if (p === 'instagram') return <IGAcon className={className} />
  if (p === 'telegram') return <TGIcon className={className} />; if (p === 'messenger') return <MessengerIcon className={className} />
  if (p === 'trendyol') return <TrendyolIcon className={className} />
  if (p === 'hepsiburada') return <HepsiburadaIcon className={className} />; return null
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
  const [replyText, setReplyText] = useState('')
  const [sending, setSending] = useState(false)
  const [aiPausedMap, setAiPausedMap] = useState<Record<string, boolean>>({})
  const [aiToggling, setAiToggling] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const msgsEndRef = useRef<HTMLDivElement>(null)
  const selectedRef = useRef(selectedConv)
  const convEndRef = useRef<HTMLDivElement>(null)
  selectedRef.current = selectedConv

  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') Notification.requestPermission()
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
    return new Uint8Array(atob(b64).split('').map(c => c.charCodeAt(0)))
  }

  const fetchConversations = useCallback(async () => {
    try {
      const res = await fetch('/api/messages/conversations', { credentials: 'include' })
      if (res.ok) setConversations(await res.json())
    } catch {} finally { setLoading(false) }
  }, [])

  useEffect(() => {
    let filtered = platformFilter ? conversations.filter(c => c.platform === platformFilter) : conversations
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      filtered = filtered.filter(c => (c.fromName || c.from).toLowerCase().includes(q) || (c.lastContent || '').toLowerCase().includes(q))
    }
    setFilteredConvs(filtered)
  }, [conversations, platformFilter, searchQuery])

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

  const markAsRead = useCallback(async (convId: string) => {
    const [platform, from] = convId.split(':')
    try { await fetch('/api/messages/read?platform=' + platform + '&from=' + encodeURIComponent(from), { method: 'POST', credentials: 'include' }) } catch {}
  }, [])

  useEffect(() => { fetchConversations() }, [fetchConversations])

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
            if (msg.direction === 'outgoing') {
              updated[idx] = { ...updated[idx], lastContent: msg.content, lastMessageAt: msg.createdAt, count: 0 }
            } else {
              updated[idx] = { ...updated[idx], lastContent: msg.content, lastMessageAt: msg.createdAt, count: 1 + (updated[idx].count || 0) }
            }
            updated.sort((a, b) => new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime())
            return updated
          }
          return [{ id: convId, platform: msg.platform, from: msg.from, lastContent: msg.content, lastMessageAt: msg.createdAt, count: msg.direction !== 'outgoing' ? 1 : 0 }, ...prev]
        })
        if (selectedRef.current === convId) setMessages(prev => [...prev, { ...msg, direction: msg.direction || 'incoming' }])
        if (msg.direction !== 'outgoing' && document.visibilityState === 'hidden') {
          try { const n = new Notification('Yeni mesaj: ' + msg.platform, { body: msg.from + ': ' + (msg.content?.slice(0, 80) || ''), icon: '/favicon.svg', silent: true }); setTimeout(() => n.close(), 4000) } catch {}
        }
      } catch {}
    }
    evtSource.onerror = () => {}
    return () => evtSource.close()
  }, [])

  useEffect(() => { if (msgsEndRef.current) msgsEndRef.current.scrollIntoView({ behavior: 'smooth' }) }, [messages])

  const selectConv = async (id: string) => {
    setSelectedConv(id); setMobileView('chat'); fetchMessages(id)
    const [platform, from] = id.split(':')
    markAsRead(id).then(() => {
      setConversations(prev => prev.map(c => c.id === id ? { ...c, count: 0 } : c))
    })
    if (platform === 'whatsapp' || platform === 'instagram') {
      try {
        const res = await fetch(`/api/${platform}/ai/status?from=${encodeURIComponent(from)}`, { credentials: 'include' })
        if (res.ok) { const data = await res.json(); setAiPausedMap(prev => ({ ...prev, [id]: data.paused })) }
      } catch {}
    }
  }

  const sendReply = useCallback(async () => {
    if (!replyText.trim() || !selectedConv || sending) return
    setSending(true); const [platform, from] = selectedConv.split(':'); const text = replyText.trim(); setReplyText('')
    try {
      const endpoint = platform === 'whatsapp' ? '/api/whatsapp/send' : platform === 'instagram' ? '/api/instagram/send' : platform === 'telegram' ? '/api/telegram/send' : null
      if (!endpoint) return
      const res = await fetch(endpoint, { method: 'POST', credentials: 'include', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(platform === 'telegram' ? { chatId: from, message: text } : { to: from, message: text }) })
      if (res.ok) setMessages(prev => [...prev, { id: 'temp-' + Date.now(), platform, from, content: text, direction: 'outgoing', createdAt: new Date().toISOString(), status: 'sent' }])
    } catch {} finally { setSending(false) }
  }, [replyText, selectedConv, sending])

  const toggleAiPause = async (convId: string) => {
    const [platform, from] = convId.split(':')
    if (platform !== 'whatsapp' && platform !== 'instagram') return
    const isPaused = aiPausedMap[convId]; setAiToggling(convId)
    try {
      const endpoint = isPaused ? `/api/${platform}/ai/resume` : `/api/${platform}/ai/pause`
      const res = await fetch(endpoint, { method: 'POST', credentials: 'include', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ from }) })
      if (res.ok) setAiPausedMap(prev => ({ ...prev, [convId]: !isPaused }))
    } catch {} finally { setAiToggling(null) }
  }

  const formatTime = (iso: string) => {
    const d = new Date(iso); const now = new Date()
    const diff = now.getTime() - d.getTime()
    if (diff < 86400000) return d.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })
    return d.toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' })
  }

  const formatDateDivider = (iso: string) => {
    const d = new Date(iso); const now = new Date()
    const diff = now.getTime() - d.getTime()
    if (diff < 86400000) return 'Bugun'
    if (diff < 172800000) return 'Dun'
    return d.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })
  }

  const getDateDivider = (msg: any, idx: number) => {
    if (idx === 0) return formatDateDivider(msg.createdAt)
    const prev = new Date(messages[idx - 1].createdAt); const curr = new Date(msg.createdAt)
    if (prev.toDateString() !== curr.toDateString()) return formatDateDivider(msg.createdAt)
    return null
  }

  return (
    <div className="h-[calc(100vh-5rem)] flex gap-0 relative overflow-hidden rounded-2xl border border-[#1a2332] bg-[#0a0e14]">
      <div className={'w-full md:w-80 md:flex-shrink-0 border-r border-[#1a2332] flex flex-col bg-[#0d1117]/90 ' + (mobileView === 'chat' ? 'hidden md:flex' : 'flex')}>
        <div className="p-4 border-b border-[#1a2332] space-y-3">
          <h2 className="text-white font-semibold">Mesajlar</h2>
          <div className="relative">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
            <input value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Kisi veya mesaj ara..." className="w-full bg-[#1a2332] border border-[#2a3a4a] rounded-xl pl-10 pr-4 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500/50 transition-all" />
          </div>
          <div className="flex gap-1.5 flex-wrap">
            {PLATFORMS.map(p => {
              const Icon = p.icon
              return                <button key={p.key} onClick={() => setPlatformFilter(p.key)} className={'inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold tracking-wide transition-all duration-200 ' + (platformFilter === p.key ? p.color + ' ' + p.bg + ' shadow-sm' : 'text-gray-500 hover:text-white bg-[#1a2332]/30 hover:bg-[#1a2332]/60')}>
                {Icon && <Icon className="w-3.5 h-3.5" />}{p.label}
              </button>
            })}
          </div>
        </div>
        <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-[#1a2332] scrollbar-track-transparent" ref={convEndRef}>
          {loading ? (
            <div className="p-4 space-y-3">{Array.from({ length: 6 }).map((_, i) => <div key={i} className="flex items-center gap-3 animate-pulse"><div className="w-10 h-10 rounded-full bg-[#1a2332]" /><div className="flex-1 space-y-2"><div className="h-3 bg-[#1a2332] rounded w-3/4" /><div className="h-2.5 bg-[#1a2332] rounded w-1/2" /></div></div>)}</div>
          ) : filteredConvs.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center p-6">
              <div className="w-14 h-14 rounded-full bg-[#1a2332] flex items-center justify-center mb-3"><svg className="w-7 h-7 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg></div>
              <p className="text-gray-500 text-sm">Henuz mesaj yok</p>
            </div>
          ) : (
            filteredConvs.map((conv: any) => {
              const badge = platformBadge(conv.platform)
              return <button key={conv.id} onClick={() => selectConv(conv.id)} className={'w-full text-left px-4 py-3.5 border-b border-[#1a2332]/20 transition-all relative group ' + (selectedConv === conv.id ? 'bg-blue-500/[0.06] shadow-[inset_3px_0_0_#3b82f6]' : 'hover:bg-white/[0.02]')}>
                <div className="flex items-start gap-3">
                  <div className="relative flex-shrink-0">
                    <div className={'w-10 h-10 rounded-full flex items-center justify-center ' + platformColor(conv.platform)}>{platformIcon(conv.platform, 'w-4.5 h-4.5 ' + platformIconColor(conv.platform))}</div>
                    <span className={'absolute -top-0.5 -right-0.5 text-[9px] font-bold px-1 py-0.5 rounded-md leading-none ' + badge.bg + ' ' + badge.text}>{badge.label}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className={'text-sm font-medium truncate ' + (selectedConv === conv.id ? 'text-white' : 'text-gray-200 group-hover:text-white')}>{conv.fromName || conv.from}</span>
                      <span className="text-[11px] text-gray-500 flex-shrink-0 ml-2">{formatTime(conv.lastMessageAt)}</span>
                    </div>
                    <p className={'text-xs truncate mt-0.5 leading-relaxed ' + ((conv.count || 0) > 0 ? 'text-gray-300' : 'text-gray-500')}>{conv.lastContent}</p>
                  </div>
                  {(conv.count || 0) > 0 && <div className="min-w-[1.25rem] h-5 px-1.5 rounded-full bg-blue-500 text-[10px] font-bold text-white flex items-center justify-center flex-shrink-0 mt-1 shadow-lg shadow-blue-500/30">{conv.count}</div>}
                </div>
              </button>
            })
          )}
        </div>
      </div>
      <div className={'flex-1 flex flex-col overflow-hidden relative ' + (mobileView === 'list' ? 'hidden md:flex' : 'flex')} style={{ backgroundColor: selectedConv ? (themeBg[messages[0]?.platform] || '#0a0e14') : '#0a0e14' }}>
        {selectedConv ? (
          <>
            <div className="flex items-center gap-3 px-4 py-3 border-b border-white/[0.03] bg-[#0a0e14]/80 backdrop-blur-xl shadow-sm">
              <button onClick={() => { setMobileView('list'); setSelectedConv(null) }} className="md:hidden text-white/60 hover:text-white transition-colors mr-1"><svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg></button>
              <div className={'w-10 h-10 rounded-full flex items-center justify-center shadow-lg ring-2 ring-white/[0.06] ' + platformColor(messages[0]?.platform)}>{platformIcon(messages[0]?.platform, 'w-4.5 h-4.5 ' + platformIconColor(messages[0]?.platform))}</div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="text-white font-semibold text-sm truncate">{messages.find(m => m.direction === 'incoming')?.fromName || selectedConv.split(':')[1]}</h3>
                  <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-sm shadow-emerald-500/50 flex-shrink-0" />
                </div>
                <p className="text-[11px] text-white/40">{messages.length} mesaj</p>
              </div>
              {['whatsapp', 'instagram', 'messenger'].includes(selectedConv.split(':')[0]) && (
                <button onClick={() => toggleAiPause(selectedConv)} disabled={aiToggling === selectedConv} className={'text-xs font-semibold flex items-center gap-1.5 px-3.5 py-2 rounded-xl transition-all backdrop-blur-sm border ' + (aiPausedMap[selectedConv] ? 'bg-amber-500/10 text-amber-400 border-amber-500/20 hover:bg-amber-500/20' : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20')}>
                  {aiToggling === selectedConv ? <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
                    : aiPausedMap[selectedConv] ? <><svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg> Devral</>
                      : <><svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg> AI Durdur</>
                  }
                </button>
              )}
            </div>
            <div className="flex-1 overflow-y-auto p-3 md:p-4 space-y-0.5 scrollbar-thin scrollbar-thumb-white/[0.06] scrollbar-track-transparent chat-area relative" style={{ backgroundColor: themeChatBg[messages[0]?.platform] || '#0a0e14' }}>
              <div className="absolute inset-0 pointer-events-none opacity-[0.5]" style={{ backgroundImage: themeWallpaper[messages[0]?.platform] || 'none' }} />
              {msgLoading ? (
                <div className="space-y-4 p-4 relative z-10">{Array.from({ length: 5 }).map((_, i) => <div key={i} className={'flex ' + (i % 2 === 0 ? 'justify-start' : 'justify-end')}><div className={'h-12 rounded-2xl animate-pulse ' + (i % 2 === 0 ? 'w-52 bg-white/[0.04]' : 'w-40 bg-white/[0.04]')} /></div>)}</div>
              ) : messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center p-8 relative z-10">
                  <div className="w-20 h-20 rounded-full bg-white/[0.02] flex items-center justify-center mb-5 border border-white/[0.04]">
                    <svg className="w-8 h-8 text-white/10" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/></svg>
                  </div>
                  <p className="text-white/20 text-sm font-medium mb-1.5">Henuz mesaj yok</p>
                  <p className="text-white/10 text-xs">Karsidan mesaj gelince burada gorunecek</p>
                </div>
              ) : (<div className="relative z-10">
                {messages.map((msg: any, idx: number) => {
                const divider = getDateDivider(msg, idx)
                const isOut = msg.direction === 'outgoing'; const platform = messages[0]?.platform
                const showAvatar = !isOut && (idx === 0 || messages[idx - 1]?.direction === 'outgoing')
                const isFirstMsg = idx === 0 || messages[idx - 1]?.direction !== msg.direction
                const isLastInSeq = idx === messages.length - 1 || messages[idx + 1]?.direction !== msg.direction
                return <div key={msg.id} className="animate-fadeIn">
                  {divider && <div className="flex items-center justify-center py-3 relative"><div className="absolute inset-0 flex items-center"><div className="w-full h-px bg-gradient-to-r from-transparent via-white/[0.04] to-transparent" /></div><span className="relative text-[11px] text-white/20 font-medium px-4 py-1 rounded-full bg-[#0a0e14]/80 backdrop-blur-sm border border-white/[0.04]">{divider}</span></div>}
                  <div className={'flex items-end gap-2 py-0.5 group ' + (isOut ? 'justify-end' : 'justify-start')}>
                    {!isOut && <div className={'w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center transition-all duration-200 ' + (showAvatar ? platformColor(platform) + ' shadow-sm ring-2 ring-white/[0.04]' : 'opacity-0 scale-0')}>{showAvatar && platformIcon(platform, 'w-3.5 h-3.5 ' + platformIconColor(platform))}</div>}
                    <div className={'max-w-[82%] md:max-w-[68%] text-sm leading-relaxed transition-all duration-150 hover:brightness-110 ' + (isOut ? 'shadow-sm' : 'shadow-sm') + (isLastInSeq ? (isOut ? ' rounded-2xl rounded-br-sm' : ' rounded-2xl rounded-bl-sm') : (isOut ? ' rounded-2xl rounded-br-md' : ' rounded-2xl rounded-bl-md'))} style={{ backgroundColor: isOut ? themeOutgoingBg[platform] || '#2563eb' : themeIncomingBg[platform] || '#1a2332' }}>
                      <div className={'px-3.5 py-2.5 ' + (isOut ? 'text-white' : 'text-gray-100')}>
                        {!isOut && isFirstMsg && msg.fromName && <p className="text-[11px] font-semibold text-white/50 mb-0.5 tracking-wide">{msg.fromName}</p>}
                        <p className="break-words whitespace-pre-wrap">{msg.content}</p>
                        <div className={'flex items-center gap-1 mt-1 ' + (isOut ? 'justify-end' : 'justify-start')}>
                          <span className={'text-[10px] ' + (isOut ? 'text-white/35' : 'text-white/25')}>{formatTime(msg.createdAt)}</span>
                          {isOut && <span className="flex items-center ml-0.5">{msg.status === 'read' ? <svg className="w-3.5 h-3.5 text-blue-400" viewBox="0 0 16 11" fill="currentColor"><path d="M11.071.653a.457.457 0 0 0-.304-.102.493.493 0 0 0-.381.178l-6.19 7.636-2.011-2.095a.463.463 0 0 0-.336-.153.457.457 0 0 0-.343.145.515.515 0 0 0-.14.337c0 .136.051.264.14.366l2.394 2.49c.1.104.228.158.367.153a.477.477 0 0 0 .367-.178l6.53-8.056a.515.515 0 0 0 .102-.343.487.487 0 0 0-.167-.382z"/><path d="M15.071.653a.457.457 0 0 0-.304-.102.493.493 0 0 0-.381.178l-6.19 7.636-1.011-1.054a.05.05 0 0 0-.011.016l.522.544c.1.104.228.158.367.153a.477.477 0 0 0 .367-.178l6.53-8.056a.515.515 0 0 0 .102-.343.487.487 0 0 0-.167-.382z" opacity="0.9"/></svg> : msg.status === 'delivered' ? <svg className="w-3.5 h-3.5 text-white/50" viewBox="0 0 16 11" fill="currentColor"><path d="M11.071.653a.457.457 0 0 0-.304-.102.493.493 0 0 0-.381.178l-6.19 7.636-2.011-2.095a.463.463 0 0 0-.336-.153.457.457 0 0 0-.343.145.515.515 0 0 0-.14.337c0 .136.051.264.14.366l2.394 2.49c.1.104.228.158.367.153a.477.477 0 0 0 .367-.178l6.53-8.056a.515.515 0 0 0 .102-.343.487.487 0 0 0-.167-.382z"/><path d="M15.071.653a.457.457 0 0 0-.304-.102.493.493 0 0 0-.381.178l-6.19 7.636-1.011-1.054a.05.05 0 0 0-.011.016l.522.544c.1.104.228.158.367.153a.477.477 0 0 0 .367-.178l6.53-8.056a.515.515 0 0 0 .102-.343.487.487 0 0 0-.167-.382z" opacity="0.9"/></svg> : <svg className="w-3.5 h-3.5 text-white/35" viewBox="0 0 16 11" fill="currentColor"><path d="M11.071.653a.457.457 0 0 0-.304-.102.493.493 0 0 0-.381.178l-6.19 7.636-2.011-2.095a.463.463 0 0 0-.336-.153.457.457 0 0 0-.343.145.515.515 0 0 0-.14.337c0 .136.051.264.14.366l2.394 2.49c.1.104.228.158.367.153a.477.477 0 0 0 .367-.178l6.53-8.056a.515.515 0 0 0 .102-.343.487.487 0 0 0-.167-.382z"/></svg>}</span>
                          }
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              })}
              </div>)}
              <div ref={msgsEndRef} />
            </div>
            <div className="border-t border-white/[0.03] bg-[#0a0e14]/80 backdrop-blur-xl px-4 py-3 shadow-sm">
              <div className="flex items-center gap-2.5 rounded-2xl px-4 py-3" style={{ backgroundColor: themeInputBg[messages[0]?.platform] || '#1a2332' }}>
                <button className="flex-shrink-0 text-white/30 hover:text-white/60 transition-colors"><svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" /></svg></button>
                <input value={replyText} onChange={e => setReplyText(e.target.value)} onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendReply() } }} placeholder="Mesaj yaz..." className="flex-1 bg-transparent text-white text-sm outline-none placeholder-white/30" disabled={sending} />
                <button onClick={sendReply} disabled={sending || !replyText.trim()} className={'flex-shrink-0 w-8 h-8 rounded-xl flex items-center justify-center transition-all duration-200 ' + (sending || !replyText.trim() ? 'text-white/20' : 'text-white hover:bg-white/[0.1]')}>
                  {sending ? <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
                    : <svg className="w-4.5 h-4.5 -rotate-45" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"/></svg>}
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="hidden md:flex flex-1 items-center justify-center bg-gradient-to-b from-transparent via-white/[0.005] to-transparent">
            <div className="text-center max-w-xs">
              <div className="w-24 h-24 mx-auto rounded-3xl bg-gradient-to-br from-[#1a2332] to-[#0d1117] flex items-center justify-center mb-6 shadow-inner border border-white/[0.03]">
                <svg className="w-10 h-10 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/></svg>
              </div>
              <h3 className="text-white/30 text-sm font-medium mb-2">Mesajlar</h3>
              <p className="text-white/15 text-xs leading-relaxed">Soldan bir konusma secin veya yeni bir konusma baslatmak icin kisi arayin</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
