'use client'
import { useState, useEffect, useRef } from 'react'
import { ShoppingCart, Search, Clock, CheckCircle, XCircle, AlertCircle, BellRing, UtensilsCrossed, RefreshCw, Truck, Table2, Wallet } from 'lucide-react'

const STATUS_MAP: Record<string, { label: string; color: string; bg: string; border: string; icon: any }> = {
  pending: { label: 'Bekliyor', color: 'text-amber-300', bg: 'bg-amber-500/10', border: 'border-amber-500/25', icon: Clock },
  preparing: { label: 'Hazırlanıyor', color: 'text-blue-300', bg: 'bg-blue-500/10', border: 'border-blue-500/25', icon: AlertCircle },
  completed: { label: 'Tamamlandı', color: 'text-emerald-300', bg: 'bg-emerald-500/10', border: 'border-emerald-500/25', icon: CheckCircle },
  cancelled: { label: 'İptal', color: 'text-red-300', bg: 'bg-red-500/10', border: 'border-red-500/25', icon: XCircle },
}

type PlatformInfo = { label: string; color: string; bg: string; border: string; icon: any }

function getPlatform(o: any): PlatformInfo {
  const p = (o.platform || '').trim()
  if (p === 'Masa' || p === 'Masa Siparişi') {
    return { label: 'Masa Siparişi', color: 'text-blue-300', bg: 'bg-blue-500/10', border: 'border-blue-500/25', icon: Table2 }
  }
  if (p === 'QR Menü' || p === 'Online' || p === 'Online Sipariş') {
    return { label: 'Online Sipariş', color: 'text-cyan-300', bg: 'bg-cyan-500/10', border: 'border-cyan-500/25', icon: Truck }
  }
  if (p === 'Garson Çağrı' || p === 'Garson') {
    return { label: 'Garson Çağrı', color: 'text-amber-300', bg: 'bg-amber-500/10', border: 'border-amber-500/25', icon: BellRing }
  }
  return { label: p || 'webchat', color: 'text-gray-300', bg: 'bg-gray-500/10', border: 'border-gray-500/25', icon: Wallet }
}

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'az önce'
  if (mins < 60) return mins + ' dk önce'
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return hrs + ' sa önce'
  return new Date(dateStr).toLocaleDateString('tr-TR')
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('')
  const [search, setSearch] = useState('')
  const [tab, setTab] = useState<'orders' | 'waiter'>('orders')
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
    let tid: string | null = null
    async function connect() {
      try {
        const tenant = await fetch('/api/tenants/me', { credentials: 'include' }).then(r => r.json())
        tid = tenant?.tenant?.id || tenant?.id || null
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

  const waiterCalls = orders.filter((o: any) => (o.platform || '').includes('Garson'))
  const realOrders = orders.filter((o: any) => !(o.platform || '').includes('Garson'))
  const pendingWaiterCount = waiterCalls.filter((o: any) => o.status === 'pending').length

  const filtered = realOrders.filter((o: any) => {
    if (filter && o.status !== filter) return false
    if (search) {
      const s = search.toLowerCase()
      return o.customerName?.toLowerCase().includes(s) || o.platform?.toLowerCase().includes(s) || (o.tableNumber && String(o.tableNumber).includes(s))
    }
    return true
  })

  const stats = {
    total: realOrders.length,
    pending: realOrders.filter((o: any) => o.status === 'pending').length,
    completed: realOrders.filter((o: any) => o.status === 'completed').length,
    cancelled: realOrders.filter((o: any) => o.status === 'cancelled').length,
  }

  if (loading) return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" /></div>

  const StatusBadge = ({ o }: { o: any }) => {
    const s = STATUS_MAP[o.status] || STATUS_MAP.pending
    const Icon = s.icon
    return (
      <span className={'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-semibold border ' + s.bg + ' ' + s.color + ' ' + s.border}>
        <Icon size={12} />
        {s.label}
      </span>
    )
  }

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#0b1220] via-[#0d1117] to-[#0a0e14] border border-[#1a2332] p-6 lg:p-8">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-500/5 rounded-full blur-3xl" />
        <div className="relative flex items-start justify-between flex-wrap gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
              <ShoppingCart className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">Sipariş Yönetimi</h1>
              <p className="text-sm text-gray-500 mt-0.5">Masa ve online siparişler tek ekranda</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={load} className="p-2.5 rounded-xl bg-[#080b12]/60 border border-[#1a2332] text-gray-500 hover:text-white hover:border-white/20 transition-all"><RefreshCw size={16} /></button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2">
        <button onClick={() => setTab('orders')}
          className={'flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold border transition-all ' + (tab === 'orders' ? 'bg-blue-500/10 text-blue-300 border-blue-500/25' : 'bg-[#0d1117] border-[#1a2332] text-gray-400 hover:text-white')}>
          <ShoppingCart size={15} />
          Siparişler
        </button>
        <button onClick={() => setTab('waiter')}
          className={'flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold border transition-all relative ' + (tab === 'waiter' ? 'bg-amber-500/10 text-amber-300 border-amber-500/25' : 'bg-[#0d1117] border-[#1a2332] text-gray-400 hover:text-white')}>
          <BellRing size={15} />
          Garson Çağrıları
          {pendingWaiterCount > 0 && (
            <span className="ml-1 px-1.5 py-0.5 rounded-full bg-amber-500 text-[10px] font-bold text-white animate-pulse">{pendingWaiterCount}</span>
          )}
        </button>
      </div>

      {tab === 'waiter' ? (
        <div className="space-y-4">
          {/* Pending calls */}
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {waiterCalls.filter((o: any) => o.status === 'pending').map((o: any) => (
              <div key={o.id} className="relative overflow-hidden rounded-2xl bg-[#0d1117] border border-amber-500/30 p-5 transition-all duration-500 hover:border-amber-500/50 shadow-xl shadow-amber-500/5">
                <div className="absolute top-0 inset-x-0 h-0.5 bg-gradient-to-r from-transparent via-amber-500 to-transparent" />
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-lg shadow-amber-500/20">
                    {o.tableNumber ? <UtensilsCrossed className="w-6 h-6 text-white" /> : <BellRing className="w-6 h-6 text-white" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-bold text-sm">Masa {o.tableNumber || o.customerName}</p>
                    <p className="text-[11px] text-gray-500">{timeAgo(o.createdAt)}</p>
                  </div>
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse" />
                </div>
                <p className="text-sm text-gray-400 mb-4 line-clamp-3">{o.note || 'Garson çağrısı'}</p>
                <button onClick={() => updateStatus(o.id, 'completed')} disabled={updating === o.id}
                  className="w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 text-white text-sm font-semibold hover:shadow-lg hover:shadow-amber-500/20 hover:scale-[1.01] active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed">
                  {updating === o.id ? 'İşaretleniyor...' : '✓ Tamamlandı Olarak İşaretle'}
                </button>
              </div>
            ))}
            {waiterCalls.filter((o: any) => o.status === 'pending').length === 0 && (
              <div className="md:col-span-2 xl:col-span-3 rounded-2xl bg-[#0d1117]/60 border border-dashed border-[#1a2332] py-16 text-center">
                <BellRing className="w-10 h-10 text-gray-600 mx-auto mb-3" />
                <p className="text-gray-500 text-sm font-medium">Bekleyen garson çağrısı yok</p>
                <p className="text-gray-600 text-xs mt-1">Masadan garson çağrıldığında burada anında görünür</p>
              </div>
            )}
          </div>

          {/* Completed calls history */}
          {waiterCalls.filter((o: any) => o.status === 'completed').length > 0 && (
            <div className="bg-[#0d1117]/80 backdrop-blur-xl border border-[#1a2332] rounded-2xl overflow-hidden shadow-xl shadow-black/10">
              <div className="px-5 py-3.5 border-b border-[#1a2332] flex items-center gap-2">
                <CheckCircle size={14} className="text-emerald-400" />
                <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Tamamlanan Çağrılar</span>
              </div>
              <div className="divide-y divide-[#1a2332]/50">
                {waiterCalls.filter((o: any) => o.status === 'completed').map((o: any) => (
                  <div key={o.id} className="flex items-center gap-3 px-5 py-3.5">
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
          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { label: 'Toplam', value: stats.total, color: 'from-blue-500 to-indigo-600', glow: 'shadow-blue-500/20' },
              { label: 'Bekleyen', value: stats.pending, color: 'from-amber-500 to-orange-600', glow: 'shadow-amber-500/20' },
              { label: 'Tamamlanan', value: stats.completed, color: 'from-emerald-500 to-teal-600', glow: 'shadow-emerald-500/20' },
              { label: 'İptal', value: stats.cancelled, color: 'from-red-500 to-rose-600', glow: 'shadow-red-500/20' },
            ].map(s => (
              <div key={s.label} className="group relative overflow-hidden rounded-2xl bg-[#0d1117] border border-[#1a2332] p-5 transition-all duration-500 hover:scale-[1.02] hover:border-white/20">
                <div className="relative">
                  <div className={'w-9 h-9 rounded-xl bg-gradient-to-br ' + s.color + ' flex items-center justify-center mb-3 shadow-lg ' + s.glow}>
                    <span className="text-white text-sm font-bold">{s.value}</span>
                  </div>
                  <p className="text-xs text-gray-500 uppercase tracking-wider font-medium">{s.label}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Filters */}
          <div className="flex items-center gap-3 flex-wrap">
            <div className="relative flex-1 min-w-[200px]">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600" />
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Müşteri, platform veya masa ara..." className="w-full bg-[#080b12]/80 border border-[#1a2332] rounded-xl pl-9 pr-4 py-2.5 text-white text-sm focus:outline-none focus:border-blue-500/50 placeholder-gray-600" />
            </div>
            <div className="flex gap-1 bg-[#080b12]/80 border border-[#1a2332] rounded-xl p-0.5">
              {[{ key: '', label: 'Tümü' }, { key: 'pending', label: 'Bekleyen' }, { key: 'preparing', label: 'Hazırlanıyor' }, { key: 'completed', label: 'Tamamlanan' }, { key: 'cancelled', label: 'İptal' }].map(f => (
                <button key={f.key} onClick={() => setFilter(f.key)}
                  className={'px-3 py-2 rounded-lg text-xs font-semibold transition-all ' + (filter === f.key ? 'bg-blue-500/10 text-blue-300 shadow-sm' : 'text-gray-500 hover:text-white')}>{f.label}</button>
              ))}
            </div>
          </div>

          {/* Orders */}
          <div className="space-y-3">
            {filtered.length === 0 ? (
              <div className="rounded-2xl bg-[#0d1117]/60 border border-dashed border-[#1a2332] py-16 text-center">
                <ShoppingCart className="w-10 h-10 text-gray-600 mx-auto mb-3" />
                <p className="text-gray-500 text-sm font-medium">Sipariş bulunmuyor</p>
              </div>
            ) : filtered.map((o: any) => {
              const plat = getPlatform(o)
              const PI = plat.icon
              const total = o.products?.reduce ? o.products.reduce((a: any, p: any) => a + (parseFloat(p.price) || 0) * (p.quantity || 1), 0) : (o.totalAmount || 0)
              return (
                <div key={o.id} className="rounded-2xl bg-[#0d1117]/80 backdrop-blur-xl border border-[#1a2332] p-5 transition-all duration-300 hover:border-white/20 shadow-lg shadow-black/10">
                  <div className="flex items-start justify-between gap-3 flex-wrap">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={'w-11 h-11 rounded-xl border flex items-center justify-center flex-shrink-0 ' + plat.bg + ' ' + plat.border}>
                        <PI className={'w-5 h-5 ' + plat.color} />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-[10px] text-gray-500 font-mono font-semibold">#{o.id}</span>
                          <span className={'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-semibold border ' + plat.bg + ' ' + plat.color + ' ' + plat.border}>
                            <PI size={11} />
                            {plat.label}
                          </span>
                          {o.tableNumber ? (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-semibold bg-blue-500/10 text-blue-300 border border-blue-500/25">
                              <Table2 size={11} />
                              Masa {o.tableNumber}
                            </span>
                          ) : null}
                          <StatusBadge o={o} />
                        </div>
                        <p className="text-white font-semibold text-sm mt-1.5 truncate">
                          {o.customerName || 'Müşteri'}
                          {o.customerContact ? <span className="text-gray-500 font-normal ml-1.5 text-xs">{o.customerContact}</span> : null}
                        </p>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-white font-bold text-base">₺{(total || o.totalAmount || 0).toLocaleString('tr-TR', { minimumFractionDigits: 2 })}</p>
                      <p className="text-[10px] text-gray-600 mt-0.5">{timeAgo(o.createdAt)}</p>
                    </div>
                  </div>
                  {o.products?.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {o.products.map((p: any, i: number) => (
                        <span key={i} className="inline-flex items-center gap-1.5 text-[10px] text-gray-300 bg-[#080b12]/60 px-2.5 py-1 rounded-lg border border-[#1a2332]">
                          {p.quantity > 1 && <span className="text-blue-400 font-bold">{p.quantity}×</span>}
                          {p.name}
                          {p.note && <span className="text-gray-500">({p.note})</span>}
                        </span>
                      ))}
                    </div>
                  )}
                  {o.note && o.note !== 'Garson çağrısı' && (
                    <p className="mt-3 text-[11px] text-gray-500 bg-[#080b12]/40 rounded-lg px-3 py-2 border border-[#1a2332]/50">{o.note}</p>
                  )}
                  {o.status !== 'completed' && o.status !== 'cancelled' && (
                    <div className="mt-4 flex items-center gap-2 flex-wrap">
                      {o.status !== 'preparing' && (
                        <button onClick={() => updateStatus(o.id, 'preparing')} disabled={updating === o.id}
                          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-blue-500/10 text-blue-300 border border-blue-500/25 hover:bg-blue-500/20 transition-all disabled:opacity-50">
                          <AlertCircle size={13} /> Hazırlanıyor
                        </button>
                      )}
                      <button onClick={() => updateStatus(o.id, 'completed')} disabled={updating === o.id}
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-emerald-500/10 text-emerald-300 border border-emerald-500/25 hover:bg-emerald-500/20 transition-all disabled:opacity-50">
                        <CheckCircle size={13} /> Tamamlandı
                      </button>
                      <button onClick={() => updateStatus(o.id, 'cancelled')} disabled={updating === o.id}
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-red-500/10 text-red-300 border border-red-500/25 hover:bg-red-500/20 transition-all disabled:opacity-50">
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