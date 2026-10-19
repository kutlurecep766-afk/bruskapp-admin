'use client'
import { useState, useEffect, useCallback } from 'react'
import { Bell, ShoppingCart, CalendarCheck, MessageCircle, AlertTriangle, Info, RefreshCw, Sparkles, Search, Clock, Flame } from 'lucide-react'

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

const KIND_META: Record<string, { icon: any; chip: string; dot: string; label: string; grad: string }> = {
  order: { icon: ShoppingCart, chip: 'bg-emerald-50 text-emerald-600 border-emerald-200', dot: 'bg-emerald-500', label: 'Sipariş', grad: 'from-emerald-500 to-teal-600' },
  appointment: { icon: CalendarCheck, chip: 'bg-sky-50 text-sky-600 border-sky-200', dot: 'bg-sky-500', label: 'Randevu', grad: 'from-sky-500 to-blue-600' },
  reservation: { icon: CalendarCheck, chip: 'bg-indigo-50 text-indigo-600 border-indigo-200', dot: 'bg-indigo-500', label: 'Rezervasyon', grad: 'from-indigo-500 to-purple-600' },
  request: { icon: MessageCircle, chip: 'bg-blue-50 text-blue-600 border-blue-200', dot: 'bg-blue-500', label: 'Talep', grad: 'from-blue-600 to-blue-700' },
  complaint: { icon: AlertTriangle, chip: 'bg-red-50 text-red-600 border-red-200', dot: 'bg-red-500', label: 'Şikayet', grad: 'from-rose-500 to-red-600' },
  info: { icon: Info, chip: 'bg-slate-50 text-slate-600 border-slate-200', dot: 'bg-slate-400', label: 'Bilgi', grad: 'from-slate-500 to-slate-600' },
}

const KIND_ORDER = ['order', 'appointment', 'reservation', 'request', 'complaint', 'info']

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

export default function BildirimlerimPage() {
  const [feed, setFeed] = useState<Feed | null>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [search, setSearch] = useState('')
  const [priorityKinds, setPriorityKinds] = useState<string[]>(['order', 'appointment', 'reservation', 'request'])

  const load = useCallback(async (silent = false) => {
    if (silent) setRefreshing(true)
    try {
      const res = await fetch('/api/notifications/feed', { credentials: 'include' })
      if (res.ok) setFeed(await res.json())
    } catch {} finally { setLoading(false); setRefreshing(false) }
  }, [])

  useEffect(() => {
    load()
    fetch('/api/webchat/config', { credentials: 'include' })
      .then(r => r.ok ? r.json() : null)
      .then(cfg => { const pk = cfg?.feedSettings?.priorityKinds; if (Array.isArray(pk) && pk.length) setPriorityKinds(pk) })
      .catch(() => {})
    const t = setInterval(() => load(true), 20000)
    return () => clearInterval(t)
  }, [load])

  const priority = feed?.priority || []
  const secondary = feed?.secondary || []
  const all = [...priority, ...secondary]

  const stats = {
    total: all.length,
    priority: priority.length,
    secondary: secondary.length,
    complaint: all.filter(x => x.kind === 'complaint').length,
  }

  const matches = (item: FeedItem) => {
    if (!search) return true
    const s = search.toLowerCase()
    return (item.title || '').toLowerCase().includes(s) || (item.summary || '').toLowerCase().includes(s)
  }
  const priorityList = priority.filter(matches)
  const secondaryList = secondary.filter(matches)

  const currentPriorityLabels = KIND_ORDER.filter(k => priorityKinds.includes(k)).map(k => KIND_META[k]?.label || k)

  if (loading) return (
    <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" /></div>
  )

  const Section = ({ title, subtitle, items }: { title: string; subtitle: string; items: FeedItem[] }) => (
    <div className="space-y-3">
      <div className="flex items-center gap-2.5">
        <span className={'w-1.5 h-5 rounded-full ' + (title === 'Öncelikli' ? 'bg-emerald-500' : 'bg-slate-400')} />
        <h2 className="text-sm font-bold text-gray-900">{title}</h2>
        <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-blue-50 text-blue-600 border border-blue-100">{items.length}</span>
        <span className="text-[11px] text-gray-400 hidden sm:inline">{subtitle}</span>
      </div>
      {items.length === 0 ? (
        <div className="text-center py-8 bg-white border border-blue-100 rounded-2xl">
          <Bell size={28} className="mx-auto text-blue-200 mb-2" />
          <p className="text-gray-400 text-xs">{search ? 'Aramanıza uygun kayıt yok' : 'Bu bölümde kayıt bulunmuyor'}</p>
        </div>
      ) : (
        items.map(item => {
          const meta = KIND_META[item.kind] || KIND_META.info
          const Icon = meta.icon
          return (
            <div key={item.id} className="rounded-2xl bg-white border border-blue-100 p-5 shadow-sm hover:shadow-md transition-all">
              <div className="flex items-start justify-between gap-3 mb-2">
                <div className="flex items-center gap-3 min-w-0">
                  <div className={'w-11 h-11 rounded-full bg-gradient-to-br ' + meta.grad + ' flex items-center justify-center shadow-md shrink-0'}>
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-gray-900 font-semibold text-sm truncate">{item.title}</p>
                      {!item.read && <span className={'w-1.5 h-1.5 rounded-full ' + meta.dot} />}
                    </div>
                    <p className="text-[11px] text-gray-400 flex items-center gap-1.5 mt-0.5"><Clock size={11} /> {timeAgo(item.createdAt)}</p>
                  </div>
                </div>
                <span className={'px-3 py-1 rounded-full text-[11px] font-semibold border shrink-0 ' + meta.chip}>{meta.label}</span>
              </div>
              <p className="text-sm text-gray-600 leading-relaxed break-words">{item.summary}</p>
            </div>
          )
        })
      )}
    </div>
  )

  return (
    <div className="space-y-5 pb-12">
      {/* Header */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-700 via-blue-600 to-blue-500 p-6 lg:p-8 shadow-lg shadow-blue-600/20">
        <div className="absolute -top-16 -right-16 w-64 h-64 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute -bottom-20 -left-10 w-72 h-72 rounded-full bg-blue-900/20 blur-3xl" />
        <div className="relative flex items-start justify-between flex-wrap gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-white/15 backdrop-blur flex items-center justify-center shadow-inner">
              <Bell className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-xl lg:text-2xl font-bold text-white tracking-tight">Bildirimlerim</h1>
              <p className="text-sm text-blue-100 mt-0.5">Yapay zekanın sizin için özetlediği güncel bildirimler</p>
            </div>
          </div>
          <button onClick={() => load(true)} disabled={refreshing}
            className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-white text-blue-700 text-xs font-bold shadow-md hover:shadow-lg hover:scale-105 active:scale-95 transition-all disabled:opacity-60">
            <RefreshCw size={14} className={refreshing ? 'animate-spin' : ''} /> Yenile
          </button>
        </div>
      </div>

      {/* Priority config note */}
      <div className="flex items-start gap-3 rounded-2xl bg-white border border-blue-100 px-4 py-3 shadow-sm">
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shrink-0 shadow">
          <Flame className="w-4 h-4 text-white" />
        </div>
        <div className="min-w-0">
          <p className="text-xs font-semibold text-gray-900">Öncelikli bölümüne düşenler: {currentPriorityLabels.join(', ') || 'Yok'}</p>
          <p className="text-[11px] text-gray-500 mt-0.5">Bu ayarı Chatbot sayfasındaki sohbetten değiştirebilirsiniz: "siparişler öncelikli olsun, şikayetler diğer bölüme düşsün" gibi.</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: 'Toplam Bildirim', value: stats.total, grad: 'from-blue-600 to-blue-700', icon: Bell },
          { label: 'Öncelikli', value: stats.priority, grad: 'from-emerald-500 to-teal-600', icon: Flame },
          { label: 'Diğer', value: stats.secondary, grad: 'from-slate-500 to-slate-600', icon: Info },
          { label: 'Şikayet', value: stats.complaint, grad: 'from-rose-500 to-red-600', icon: AlertTriangle },
        ].map(s => {
          const Icon = s.icon
          return (
            <div key={s.label} className="relative overflow-hidden rounded-2xl bg-white border border-blue-100 p-5 shadow-sm hover:shadow-lg hover:shadow-blue-600/10 hover:-translate-y-0.5 transition-all duration-300">
              <div className="absolute -top-8 -right-8 w-20 h-20 rounded-full bg-blue-50" />
              <div className="relative">
                <div className={'w-9 h-9 rounded-full bg-gradient-to-br ' + s.grad + ' flex items-center justify-center mb-3 shadow-md'}>
                  <Icon className="w-4 h-4 text-white" />
                </div>
                <p className="text-xl font-bold text-gray-900 tracking-tight">{s.value}</p>
                <p className="text-[10px] text-gray-500 uppercase tracking-wider font-semibold mt-1">{s.label}</p>
              </div>
            </div>
          )
        })}
      </div>

      {/* Search */}
      <div className="relative">
        <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Bildirimlerde ara..."
          className="w-full pl-10 pr-4 py-3 rounded-xl bg-white border border-blue-100 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all" />
      </div>

      {/* Two rows: Öncelikli / Diğer */}
      <Section title="Öncelikli" subtitle="Sipariş, randevu, rezervasyon ve talepler" items={priorityList} />
      <Section title="Diğer" subtitle="Şikayetler ve diğer kayıtlar" items={secondaryList} />

      {feed?.aiFilled && (
        <p className="flex items-center gap-2 text-[11px] text-gray-400 justify-center">
          <Sparkles size={12} /> Özetler yapay zeka tarafından otomatik oluşturuldu
        </p>
      )}
    </div>
  )
}
