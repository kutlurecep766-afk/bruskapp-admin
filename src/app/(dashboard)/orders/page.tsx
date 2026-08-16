'use client'
import { useState, useEffect, useRef } from 'react'
import {
  ShoppingCart, Search, Clock, CheckCircle2, XCircle, Timer, BellRing, UtensilsCrossed,
  RefreshCw, Globe2, Table2, Banknote, Layers, TrendingUp, MapPin, Phone, ChevronRight,
} from 'lucide-react'

const STATUS_MAP: Record<string, { label: string; color: string; bg: string; border: string; dot: string; icon: any }> = {
  pending: { label: 'Bekliyor', color: 'text-amber-300', bg: 'bg-amber-500/10', border: 'border-amber-500/25', dot: 'bg-amber-400', icon: Timer },
  preparing: { label: 'Hazırlanıyor', color: 'text-blue-300', bg: 'bg-blue-500/10', border: 'border-blue-500/25', dot: 'bg-blue-400', icon: Timer },
  completed: { label: 'Tamamlandı', color: 'text-emerald-300', bg: 'bg-emerald-500/10', border: 'border-emerald-500/25', dot: 'bg-emerald-400', icon: CheckCircle2 },
  cancelled: { label: 'İptal', color: 'text-red-300', bg: 'bg-red-500/10', border: 'border-red-500/25', dot: 'bg-red-400', icon: XCircle },
}

type TabKey = 'table' | 'online' | 'waiter'
type PlatformInfo = { label: string; bg: string; border: string; icon: any; grad: string; glow: string }

function isTableOrder(o: any) {
  const p = (o.platform || '').trim()
  return p === 'Masa' || p === 'Masa Siparişi' || o.tableNumber
}
function isOnlineOrder(o: any) {
  const p = (o.platform || '').trim()
  return p === 'QR Menü' || p === 'Online' || p === 'Online Sipariş'
}
function isWaiterCall(o: any) {
  return (o.platform || '').includes('Garson')
}

const PLATFORM_META: Record<'table' | 'online', PlatformInfo> = {
  table: {
    label: 'Masa', bg: 'bg-blue-500/10', border: 'border-blue-500/25',
    icon: Table2, grad: 'from-blue-500 to-indigo-600', glow: 'shadow-blue-500/25',
  },
  online: {
    label: 'Online', bg: 'bg-cyan-500/10', border: 'border-cyan-500/25',
    icon: Globe2, grad: 'from-cyan-500 to-blue-600', glow: 'shadow-cyan-500/25',
  },
}

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'az önce'
  if (mins < 60) return `${mins} dk önce`
  if (mins < 1440) return `${Math.floor(mins / 60)} sa ${mins % 60} dk önce`
  return new Date(dateStr).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' })
}

function orderTotal(o: any) {
  if (o.products?.reduce) {
    return o.products.reduce((a: any, p: any) => a + (Number(p.price) || 0) * (p.quantity || 1), 0)
  }
  return o.totalAmount || 0
}

function StatusBadge({ o }: { o: any }) {
  const s = STATUS_MAP[o.status] || STATUS_MAP.pending
  const Icon = s.icon
  return (
    <span className={'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wide border ' + s.bg + ' ' + s.color + ' ' + s.border}>
      <span className={'w-1.5 h-1.5 rounded-full ' + s.dot + (o.status === 'pending' ? ' animate-pulse' : '')} />
      {s.label}
    </span>
  )
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('')
  const [search, setSearch] = useState('')
  const [tab, setTab] = useState<TabKey>('table')
  const [updating, setUpdating] = useState<number | null>(null)
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const esRef = useRef<EventSource | null>(null)

  const load = async () => {
    try {
      const tenant = await fetch('/api/tenants/me', { credentials: 'include' }).then(r => r.json())
      const tid = tenant?.tenant?.id || tenant?.id
      if (tid) {
        const res = await fetch('/api/orders?tenantId=' + tid + '&limit=200', { credentials: 'include' })
        if (res.ok) setOrders(await res.json())
      }
    } catch {} finally { setLoading(false) }
  }

  useEffect(() => {
    load()
    async function connect() {
      try {
        const tenant = await fetch('/api/tenants/me', { credentials: 'include' }).then(r => r.json())
        const tid = tenant?.tenant?.id || tenant?.id
        if (!tid) return
        const es = new EventSource('/api/orders/events?tenantId=' + tid)
        esRef.current = es
        es.onmessage = () => load()
        es.onerror = () => es.close()
      } catch {}
    }
    connect()
    pollRef.current = setInterval(load, 30000)
    return () => {
      if (pollRef.current) clearInterval(pollRef.current)
      if (esRef.current) esRef.current.close()
    }
  }, [])

  const updateStatus = async (id: number, status: string) => {
    setUpdating(id)
    try {
      await fetch('/api/orders/' + id + '/status', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      })
      await load()
    } catch {} finally { setUpdating(null) }
  }

  const tableOrders = orders.filter(isTableOrder)
  const onlineOrders = orders.filter(isOnlineOrder)
  const waiterCalls = orders.filter(isWaiterCall)

  const pendingWaiter = waiterCalls.filter(o => o.status === 'pending')
  const pendingTable = tableOrders.filter(o => o.status === 'pending')
  const pendingOnline = onlineOrders.filter(o => o.status === 'pending')

  const countFor: Record<TabKey, number> = {
    table: tableOrders.length,
    online: onlineOrders.length,
    waiter: pendingWaiter.length,
  }
  const pendingFor: Record<TabKey, number> = {
    table: pendingTable.length,
    online: pendingOnline.length,
    waiter: pendingWaiter.length,
  }

  const activeList = tab === 'table' ? tableOrders : tab === 'online' ? onlineOrders : waiterCalls
  const filtered = activeList.filter((o: any) => {
    if (filter && o.status !== filter) return false
    if (search) {
      const s = search.toLowerCase()
      return o.customerName?.toLowerCase().includes(s)
        || o.platform?.toLowerCase().includes(s)
        || String(o.tableNumber || '').includes(s)
    }
    return true
  })

  const tabStats = {
    table: {
      total: tableOrders.length, pending: pendingTable.length,
      completed: tableOrders.filter(o => o.status === 'completed').length,
      revenue: tableOrders.filter(o => o.status !== 'cancelled').reduce((a, o) => a + orderTotal(o), 0),
    },
    online: {
      total: onlineOrders.length, pending: pendingOnline.length,
      completed: onlineOrders.filter(o => o.status === 'completed').length,
      revenue: onlineOrders.filter(o => o.status !== 'cancelled').reduce((a, o) => a + orderTotal(o), 0),
    },
  } as Record<TabKey, any>

  if (loading) return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" /></div>

  const TABS: { key: TabKey; label: string; icon: any; desc: string }[] = [
    { key: 'table', label: 'Masa Siparişleri', icon: Table2, desc: 'Masadan gelen siparişler' },
    { key: 'online', label: 'Online Siparişler', icon: Globe2, desc: 'QR menüden online siparişler' },
    { key: 'waiter', label: 'Garson Çağrıları', icon: BellRing, desc: 'Bekleyen garson çağrıları' },
  ]

  const StatsCards = ({ data }: { data: any }) => (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {[
        { label: 'Toplam', value: data.total, grad: 'from-blue-500 to-indigo-600', glow: 'shadow-blue-500/20', icon: Layers },
        { label: 'Bekleyen', value: data.pending, grad: 'from-amber-500 to-orange-600', glow: 'shadow-amber-500/20', icon: Timer },
        { label: 'Tamamlanan', value: data.completed, grad: 'from-emerald-500 to-teal-600', glow: 'shadow-emerald-500/20', icon: CheckCircle2 },
        { label: 'Ciro (₺)', value: data.revenue.toLocaleString('tr-TR', { minimumFractionDigits: 2 }), grad: 'from-indigo-500 to-purple-600', glow: 'shadow-indigo-500/20', icon: Banknote },
      ].map((s, i) => {
        const Icon = s.icon
        return (
          <div key={s.label} className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#101826] to-[#0d1117] border border-[#1a2332] p-5 transition-all duration-500 hover:scale-[1.03] hover:border-white/20">
            <div className="absolute -top-10 -right-10 w-24 h-24 rounded-full bg-white/[0.03] blur-2xl transition-opacity opacity-0 group-hover:opacity-100" />
            <div className="relative flex items-start justify-between">
              <div>
                <div className={'w-9 h-9 rounded-xl bg-gradient-to-br ' + s.grad + ' flex items-center justify-center mb-3 shadow-lg ' + s.glow} style={{ animationDelay: i * 0.05 + 's' }}>
                  <Icon className="w-4 h-4 text-white" />
                </div>
                <p className="text-2xl font-bold text-white tracking-tight">{s.value}</p>
                <p className="text-[10px] text-gray-500 uppercase tracking-wider font-semibold mt-1">{s.label}</p>
              </div>
              <ChevronRight className="w-4 h-4 text-gray-700 group-hover:text-blue-500 transition-colors" />
            </div>
          </div>
        )
      })}
    </div>
  )

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="relative overflow-hidden rounded-3xl border border-[#1a2332] bg-gradient-to-br from-[#0a0f1a] via-[#0d1117] to-[#080c14] p-6 lg:p-8">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-24 right-10 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
          <div className="absolute -bottom-24 left-10 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-[radial-gradient(ellipse_at_center,rgba(59,130,246,0.06),transparent)]" />
        </div>
        <div className="relative flex items-start justify-between flex-wrap gap-4">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="absolute inset-0 rounded-2xl bg-blue-500/30 blur-lg" />
              <div className="relative w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
                <ShoppingCart className="w-7 h-7 text-white" />
              </div>
            </div>
            <div>
              <h1 className="text-xl lg:text-2xl font-bold text-white tracking-tight">Sipariş Yönetimi</h1>
              <p className="text-sm text-gray-500 mt-0.5 flex items-center gap-1.5">
                <TrendingUp className="w-3.5 h-3.5 text-blue-400" />
                Masadaki ve online siparişler tek ekranda
              </p>
            </div>
          </div>
          <button onClick={load} className="group p-2.5 rounded-xl bg-[#080b12]/60 border border-[#1a2332] text-gray-500 hover:text-white hover:border-blue-500/40 hover:bg-blue-500/10 transition-all">
            <RefreshCw size={16} className="group-hover:rotate-180 transition-transform duration-500" />
          </button>
        </div>

        {/* Tabs */}
        <div className="relative mt-6 grid grid-cols-1 sm:grid-cols-3 gap-2">
          {TABS.map(t => {
            const active = tab === t.key
            const Icon = t.icon
            const isWaiter = t.key === 'waiter'
            const count = countFor[t.key]
            const pending = pendingFor[t.key]
            return (
              <button key={t.key} onClick={() => setTab(t.key)}
                className={'relative overflow-hidden rounded-2xl border p-3.5 text-left transition-all duration-300 ' + (active
                  ? (isWaiter ? 'border-amber-500/40 bg-gradient-to-br from-amber-500/15 to-orange-600/10 shadow-lg shadow-amber-500/10 text-amber-300' : 'border-blue-500/40 bg-gradient-to-br from-blue-500/15 to-indigo-600/10 shadow-lg shadow-blue-500/10 text-blue-300')
                  : 'border-[#1a2332] bg-[#0a0f1a]/80 text-gray-400 hover:border-white/20 hover:text-white')}>
                <div className="flex items-center gap-3">
                  <div className={'w-9 h-9 rounded-xl flex items-center justify-center transition-all ' + (active ? (isWaiter ? 'bg-amber-500/20' : 'bg-blue-500/20') : 'bg-[#080b12] border border-[#1a2332]')}>
                    <Icon size={17} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold">{t.label}</p>
                    <p className={'text-[10px] mt-0.5 ' + (active ? (t.key === 'waiter' ? 'text-amber-400/70' : 'text-blue-400/70') : 'text-gray-600')}>{t.desc}</p>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <span className="text-xs font-bold text-white">{count}</span>
                    {pending > 0 && (
                      <span className={'px-1.5 py-0.5 rounded-full text-[9px] font-bold text-white ' + (isWaiter ? 'bg-amber-500 animate-pulse' : 'bg-blue-500')}>
                        {pending} bekleyen
                      </span>
                    )}
                  </div>
                </div>
              </button>
            )
          })}
        </div>
      </div>

      {tab === 'waiter' ? (
        <div className="space-y-4">
          {/* Pending */}
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {pendingWaiter.map(o => (
              <div key={o.id} className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#12100f] to-[#0d1117] border border-amber-500/30 p-5 transition-all duration-500 hover:border-amber-500/60 hover:-translate-y-0.5 shadow-xl shadow-amber-500/5">
                <div className="absolute top-0 inset-x-0 h-0.5 bg-gradient-to-r from-transparent via-amber-500 to-transparent" />
                <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full blur-3xl" />
                <div className="relative flex items-center gap-3 mb-4">
                  <div className="relative">
                    <div className="absolute inset-0 rounded-xl bg-amber-500/30 blur-md" />
                    <div className="relative w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-lg shadow-amber-500/20">
                      {o.tableNumber ? <UtensilsCrossed className="w-6 h-6 text-white" /> : <BellRing className="w-6 h-6 text-white" />}
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-white font-bold text-base">Masa {o.tableNumber || o.customerName}</p>
                      <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
                    </div>
                    <p className="text-[11px] text-gray-500 flex items-center gap-1"><Clock size={11} /> {timeAgo(o.createdAt)}</p>
                  </div>
                </div>
                <div className="relative rounded-xl bg-[#080b12]/60 border border-amber-500/15 px-4 py-3 mb-4">
                  <p className="text-sm text-amber-100/90 leading-relaxed">{o.note || 'Garson çağrısı'}</p>
                </div>
                <button onClick={() => updateStatus(o.id, 'completed')} disabled={updating === o.id}
                  className="relative w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 text-white text-sm font-bold hover:shadow-lg hover:shadow-amber-500/25 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed">
                  {updating === o.id ? 'İşaretleniyor...' : '✓ Çağrıyı Tamamla'}
                </button>
              </div>
            ))}
            {pendingWaiter.length === 0 && (
              <div className="md:col-span-2 xl:col-span-3 rounded-2xl bg-[#0d1117]/60 border border-dashed border-[#1a2332] py-20 text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-[#080b12] border border-[#1a2332] flex items-center justify-center">
                  <BellRing className="w-8 h-8 text-gray-600" />
                </div>
                <p className="text-gray-400 text-sm font-semibold">Bekleyen garson çağrısı yok</p>
                <p className="text-gray-600 text-xs mt-1.5">Masadan çağrı geldiğinde burada anında görünecek</p>
              </div>
            )}
          </div>

          {/* Completed history */}
          {waiterCalls.filter(o => o.status === 'completed').length > 0 && (
            <div className="bg-[#0d1117]/80 backdrop-blur-xl border border-[#1a2332] rounded-2xl overflow-hidden shadow-xl shadow-black/10">
              <div className="px-5 py-3.5 border-b border-[#1a2332] flex items-center gap-2">
                <CheckCircle2 size={14} className="text-emerald-400" />
                <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Tamamlanan Çağrılar</span>
              </div>
              <div className="divide-y divide-[#1a2332]/50">
                {waiterCalls.filter(o => o.status === 'completed').map(o => (
                  <div key={o.id} className="flex items-center gap-3 px-5 py-3.5 hover:bg-white/[0.02] transition-colors">
                    <div className="w-8 h-8 rounded-lg bg-[#080b12]/60 border border-[#1a2332] flex items-center justify-center">
                      <UtensilsCrossed size={14} className="text-gray-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-xs font-medium">Masa {o.tableNumber || o.customerName}</p>
                      <p className="text-[10px] text-gray-600 truncate">{o.note || 'Garson çağrısı'}</p>
                    </div>
                    <span className="text-[10px] text-gray-600 whitespace-nowrap">{timeAgo(o.createdAt)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        <>
          <StatsCards data={tabStats[tab] || { total: 0, pending: 0, completed: 0, revenue: 0 }} />

          {/* Filters */}
          <div className="flex items-center gap-3 flex-wrap">
            <div className="relative flex-1 min-w-[200px]">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600" />
              <input value={search} onChange={e => setSearch(e.target.value)}
                placeholder={tab === 'table' ? 'Masa numarası veya müşteri ara...' : 'Müşteri, telefon veya adres ara...'}
                className="w-full bg-[#080b12]/80 border border-[#1a2332] rounded-xl pl-9 pr-4 py-2.5 text-white text-sm focus:outline-none focus:border-blue-500/50 placeholder-gray-600" />
            </div>
            <div className="flex gap-1 bg-[#080b12]/80 border border-[#1a2332] rounded-xl p-0.5">
              {[{ key: '', label: 'Tümü' }, { key: 'pending', label: 'Bekleyen' }, { key: 'preparing', label: 'Hazırlanıyor' }, { key: 'completed', label: 'Tamamlanan' }, { key: 'cancelled', label: 'İptal' }].map(f => (
                <button key={f.key} onClick={() => setFilter(f.key)}
                  className={'px-3 py-2 rounded-lg text-xs font-semibold transition-all ' + (filter === f.key ? 'bg-blue-500/10 text-blue-300 shadow-sm' : 'text-gray-500 hover:text-white')}>{f.label}</button>
              ))}
            </div>
          </div>

          {/* Order list */}
          <div className="space-y-3">
            {filtered.length === 0 ? (
              <div className="rounded-2xl bg-[#0d1117]/60 border border-dashed border-[#1a2332] py-20 text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-[#080b12] border border-[#1a2332] flex items-center justify-center">
                  {tab === 'table' ? <Table2 className="w-8 h-8 text-gray-600" /> : <Globe2 className="w-8 h-8 text-gray-600" />}
                </div>
                <p className="text-gray-400 text-sm font-semibold">{tab === 'table' ? 'Masa siparişi bulunmuyor' : 'Online sipariş bulunmuyor'}</p>
                <p className="text-gray-600 text-xs mt-1.5">Yeni siparişler geldiğinde burada görünecek</p>
              </div>
            ) : filtered.map(o => {
              const meta = isOnlineOrder(o) ? PLATFORM_META.online : PLATFORM_META.table
              const Icon = meta.icon
              const total = orderTotal(o)
              return (
                <div key={o.id} className="group relative overflow-hidden rounded-2xl bg-[#0d1117]/80 backdrop-blur-xl border border-[#1a2332] p-5 transition-all duration-300 hover:border-white/20 hover:-translate-y-0.5 shadow-lg shadow-black/10">
                  <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-transparent to-transparent" />
                  <div className="flex items-start justify-between gap-4 flex-wrap">
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <div className="relative flex-shrink-0">
                        <div className="absolute inset-0 rounded-xl bg-blue-500/25 blur-md opacity-60" />
                        <div className={'relative w-12 h-12 rounded-xl bg-gradient-to-br ' + meta.grad + ' flex items-center justify-center shadow-lg ' + meta.glow}>
                          <Icon className="w-6 h-6 text-white" />
                        </div>
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-[10px] text-gray-500 font-mono font-semibold tracking-wider">#{o.id}</span>
                          <span className={'inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wide border ' + meta.bg + ' ' + meta.border}>
                            <Icon size={11} />
                            {meta.label}
                          </span>
                          {isTableOrder(o) && o.tableNumber ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-bold bg-indigo-500/10 text-indigo-300 border border-indigo-500/25">
                              <Table2 size={11} />
                              Masa {o.tableNumber}
                            </span>
                          ) : null}
                          <StatusBadge o={o} />
                        </div>
                        <p className="text-white font-bold text-sm mt-2 truncate">{o.customerName || 'Müşteri'}</p>
                        <div className="flex flex-col gap-0.5 mt-0.5">
                          {o.customerContact && (
                            <p className="flex items-center gap-1.5 text-[11px] text-gray-500">
                              <Phone size={10} className="text-gray-600" /> {o.customerContact}
                            </p>
                          )}
                          {isOnlineOrder(o) && (/Adres: (.+)/.exec(o.note || '')?.[1]) && (
                            <p className="flex items-center gap-1.5 text-[11px] text-gray-500">
                              <MapPin size={10} className="text-cyan-500" /> {/Adres: (.+)/.exec(o.note || '')![1]}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col items-end shrink-0 gap-1">
                      <p className="text-lg font-bold text-white tracking-tight">₺{total.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}</p>
                      <p className="text-[10px] text-gray-600 flex items-center gap-1"><Clock size={10} /> {timeAgo(o.createdAt)}</p>
                    </div>
                  </div>

                  {o.products?.length > 0 && (
                    <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                      {o.products.map((p: any, i: number) => (
                        <div key={i} className="flex items-center gap-2 text-[11px] bg-[#080b12]/60 px-3 py-2 rounded-lg border border-[#1a2332]/50">
                          <span className={'flex-shrink-0 text-xs font-bold px-1.5 py-0.5 rounded-md border ' + (p.quantity > 1 ? 'bg-blue-500/15 border-blue-500/30 text-blue-300' : 'bg-[#080b12] border-[#1a2332] text-gray-500')}>
                            {p.quantity}×
                          </span>
                          <span className="text-gray-200 font-medium truncate">{p.name}</span>
                          {p.note && <span className="text-gray-600 truncate">· {p.note}</span>}
                        </div>
                      ))}
                    </div>
                  )}
                  {o.note && !/^Adres: /.test(o.note) && o.note !== 'Garson çağrısı' && (
                    <p className="mt-3 text-[11px] text-gray-500 bg-[#080b12]/40 rounded-lg px-3 py-2 border border-[#1a2332]/50">{o.note}</p>
                  )}

                  {o.status !== 'completed' && o.status !== 'cancelled' && (
                    <div className="mt-4 flex items-center gap-2 flex-wrap border-t border-[#1a2332]/40 pt-4">
                      {o.status !== 'preparing' && (
                        <button onClick={() => updateStatus(o.id, 'preparing')} disabled={updating === o.id}
                          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-blue-500/10 text-blue-300 border border-blue-500/25 hover:bg-blue-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50">
                          <Timer size={13} /> Hazırlanıyor
                        </button>
                      )}
                      <button onClick={() => updateStatus(o.id, 'completed')} disabled={updating === o.id}
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-emerald-500/10 text-emerald-300 border border-emerald-500/25 hover:bg-emerald-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50">
                        <CheckCircle2 size={13} /> Tamamlandı
                      </button>
                      <button onClick={() => updateStatus(o.id, 'cancelled')} disabled={updating === o.id}
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-red-500/10 text-red-300 border border-red-500/25 hover:bg-red-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50">
                        <XCircle size={13} /> İptal
                      </button>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </>
      )}
    </div>
  )
}