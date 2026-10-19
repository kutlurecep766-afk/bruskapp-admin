'use client'
import { useState, useEffect, useCallback } from 'react'
import { Bell, ShoppingCart, CalendarCheck, MessageCircle, AlertTriangle, Info, RefreshCw, Loader2, Sparkles } from 'lucide-react'

interface FeedItem {
  id: string
  kind: string
  priority: number
  title: string
  summary: string
  createdAt: string
  read: boolean
}

interface Feed {
  priority: FeedItem[]
  secondary: FeedItem[]
  aiFilled: boolean
}

const KIND_META: Record<string, { icon: any; color: string; bg: string; label: string }> = {
  order: { icon: ShoppingCart, color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20', label: 'Sipariş' },
  appointment: { icon: CalendarCheck, color: 'text-sky-400', bg: 'bg-sky-500/10 border-sky-500/20', label: 'Randevu' },
  reservation: { icon: CalendarCheck, color: 'text-indigo-400', bg: 'bg-indigo-500/10 border-indigo-500/20', label: 'Rezervasyon' },
  request: { icon: MessageCircle, color: 'text-blue-400', bg: 'bg-blue-500/10 border-blue-500/20', label: 'Talep' },
  complaint: { icon: AlertTriangle, color: 'text-red-400', bg: 'bg-red-500/10 border-red-500/20', label: 'Şikayet' },
  info: { icon: Info, color: 'text-gray-400', bg: 'bg-gray-500/10 border-gray-500/20', label: 'Bilgi' },
}

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const m = Math.floor(diff / 60000)
  if (m < 1) return 'az önce'
  if (m < 60) return m + ' dk önce'
  const h = Math.floor(m / 60)
  if (h < 24) return h + ' saat önce'
  const d = Math.floor(h / 24)
  return d + ' gün önce'
}

function Card({ item }: { item: FeedItem }) {
  const meta = KIND_META[item.kind] || KIND_META.info
  const Icon = meta.icon
  return (
    <div className={'flex items-start gap-3 rounded-2xl border p-4 transition-all hover:border-blue-500/30 ' + (item.read ? 'bg-[#0d1117]/60 border-[#1a2332]' : 'bg-[#0f1420] border-[#1a2332]')}>
      <div className={'w-10 h-10 rounded-xl border flex items-center justify-center flex-shrink-0 ' + meta.bg}>
        <Icon size={18} className={meta.color} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-white text-sm font-semibold">{item.title}</span>
          <span className={'px-2 py-0.5 rounded-full text-[10px] border font-medium ' + meta.bg + ' ' + meta.color}>{meta.label}</span>
          {!item.read && <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />}
        </div>
        <p className="text-sm text-gray-400 mt-1 break-words">{item.summary}</p>
        <p className="text-[11px] text-gray-600 mt-1.5">{timeAgo(item.createdAt)}</p>
      </div>
    </div>
  )
}

function EmptyBox({ text }: { text: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-[#1a2332] p-6 flex flex-col items-center justify-center text-center gap-2">
      <Sparkles size={18} className="text-gray-600" />
      <p className="text-xs text-gray-600">{text}</p>
    </div>
  )
}

export default function BildirimlerimPage() {
  const [feed, setFeed] = useState<Feed | null>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  const load = useCallback(async (silent = false) => {
    if (silent) setRefreshing(true)
    try {
      const res = await fetch('/api/notifications/feed', { credentials: 'include' })
      if (res.ok) setFeed(await res.json())
    } catch {} finally { setLoading(false); setRefreshing(false) }
  }, [])

  useEffect(() => {
    load()
    const t = setInterval(() => load(true), 20000)
    return () => clearInterval(t)
  }, [load])

  const priority = feed?.priority || []
  const secondary = feed?.secondary || []

  return (
    <div className="space-y-6 pb-12 max-w-4xl">
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#0f1420] via-[#0d1117] to-[#0a0e14] border border-[#1a2332] p-6 sm:p-8">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl" />
        <div className="relative flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
              <Bell className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">Bildirimlerim</h1>
              <p className="text-sm text-gray-500 mt-0.5">Yapay zekanın sizin için özetlediği güncel bildirimler</p>
            </div>
          </div>
          <button onClick={() => load(true)} disabled={refreshing} className="flex items-center gap-2 px-4 py-2.5 bg-white/5 border border-[#1a2332] text-gray-300 rounded-xl text-sm font-medium hover:text-white hover:border-blue-500/30 transition-all disabled:opacity-50 self-start">
            {refreshing ? <Loader2 size={16} className="animate-spin" /> : <RefreshCw size={16} />} Yenile
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <>
          <div>
            <div className="flex items-center gap-2 mb-3">
              <h2 className="text-white font-semibold">Öncelikli</h2>
              <span className="px-2 py-0.5 rounded-full text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-medium">Sipariş / Randevu / Rezervasyon</span>
            </div>
            <div className="space-y-3">
              {priority.length > 0
                ? priority.map(item => <Card key={item.id} item={item} />)
                : <EmptyBox text="Bekleyen sipariş veya randevu yok. Yeni bir kayıt geldiğinde yapay zeka burayı dolduracak." />}
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2 mb-3">
              <h2 className="text-white font-semibold">Talepler & Şikayetler</h2>
              <span className="px-2 py-0.5 rounded-full text-[10px] bg-blue-500/10 text-blue-400 border border-blue-500/20 font-medium">Müşteri mesajları</span>
            </div>
            <div className="space-y-3">
              {secondary.length > 0
                ? secondary.map(item => <Card key={item.id} item={item} />)
                : <EmptyBox text="Henüz talep veya şikayet yok. Müşterilerden mesaj geldikçe yapay zeka burayı dolduracak." />}
            </div>
          </div>

          {feed?.aiFilled && (
            <p className="flex items-center gap-2 text-[11px] text-gray-600 justify-center">
              <Sparkles size={12} /> Özetler yapay zeka tarafından otomatik oluşturuldu
            </p>
          )}
        </>
      )}
    </div>
  )
}
