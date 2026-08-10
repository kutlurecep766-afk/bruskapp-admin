'use client'
import { useState, useEffect } from 'react'
import { ShoppingCart, Search, Clock, Filter, RefreshCw, CheckCircle, XCircle, AlertCircle, ChevronDown, Calendar } from 'lucide-react'

const STATUS_MAP: Record<string, { label: string; color: string; bg: string; border: string; icon: any }> = {
  pending: { label: 'Bekliyor', color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/20', icon: Clock },
  preparing: { label: 'Hazırlanıyor', color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/20', icon: AlertCircle },
  completed: { label: 'Tamamlandı', color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', icon: CheckCircle },
  cancelled: { label: 'İptal', color: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/20', icon: XCircle },
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('')
  const [search, setSearch] = useState('')

  const load = async () => {
    try {
      const tenant = await fetch('/api/tenants/me', { credentials: 'include' }).then(r => r.json())
      const tid = tenant?.tenant?.id || tenant?.id
      if (tid) {
        const res = await fetch('/api/orders?tenantId=' + tid, { credentials: 'include' })
        if (res.ok) setOrders(await res.json())
      }
    } catch {} finally { setLoading(false) }
  }

  useEffect(() => { load() }, [])

  const filtered = orders.filter((o: any) => {
    if (filter && o.status !== filter) return false
    if (search) {
      const s = search.toLowerCase()
      return o.customerName?.toLowerCase().includes(s) || o.platform?.toLowerCase().includes(s)
    }
    return true
  })

  const stats = {
    total: orders.length,
    pending: orders.filter((o: any) => o.status === 'pending').length,
    completed: orders.filter((o: any) => o.status === 'completed').length,
    cancelled: orders.filter((o: any) => o.status === 'cancelled').length,
  }

  if (loading) return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" /></div>

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#0f1420] via-[#0d1117] to-[#0a0e14] border border-[#1a2332] p-6 lg:p-8">
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-orange-500/5 rounded-full blur-3xl" />
        <div className="relative flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-lg shadow-amber-500/20">
              <ShoppingCart className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">Siparişler</h1>
              <p className="text-sm text-gray-500 mt-0.5">Toplam {orders.length} sipariş</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={load} className="p-2.5 rounded-xl bg-[#080b12]/60 border border-[#1a2332] text-gray-500 hover:text-white hover:border-white/20 transition-all"><RefreshCw size={16} /></button>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'Toplam', value: stats.total, color: 'from-blue-500 to-indigo-600', glow: 'shadow-blue-500/20' },
          { label: 'Bekleyen', value: stats.pending, color: 'from-amber-500 to-orange-600', glow: 'shadow-amber-500/20' },
          { label: 'Tamamlanan', value: stats.completed, color: 'from-emerald-500 to-teal-600', glow: 'shadow-emerald-500/20' },
          { label: 'İptal', value: stats.cancelled, color: 'from-red-500 to-rose-600', glow: 'shadow-red-500/20' },
        ].map((s, i) => (
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
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Müşteri veya platform ara..." className="w-full bg-[#080b12]/80 border border-[#1a2332] rounded-xl pl-9 pr-4 py-2.5 text-white text-sm focus:outline-none focus:border-amber-500/50 placeholder-gray-600" />
        </div>
        <div className="flex gap-1 bg-[#080b12]/80 border border-[#1a2332] rounded-xl p-0.5">
          {[{ key: '', label: 'Tümü' }, { key: 'pending', label: 'Bekleyen' }, { key: 'completed', label: 'Tamamlanan' }, { key: 'cancelled', label: 'İptal' }].map(f => (
            <button key={f.key} onClick={() => setFilter(f.key)}
              className={'px-3.5 py-2 rounded-lg text-xs font-semibold transition-all ' + (filter === f.key ? 'bg-amber-500/10 text-amber-400 shadow-sm' : 'text-gray-500 hover:text-white')}>{f.label}</button>
          ))}
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-[#0d1117]/80 backdrop-blur-xl border border-[#1a2332] rounded-2xl overflow-hidden shadow-xl shadow-black/10">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#1a2332] bg-[#080b12]/40">
                {['Sipariş', 'Müşteri', 'Platform', 'Ürünler', 'Tutar', 'Tarih', 'Durum'].map(h => (
                  <th key={h} className="px-5 py-3.5 text-left text-[10px] font-semibold text-gray-500 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1a2332]/50">
              {filtered.length === 0 ? (
                <tr><td colSpan={7} className="text-center py-16 text-gray-500 text-sm">Henüz sipariş bulunmuyor</td></tr>
              ) : filtered.map((o: any) => {
                const s = STATUS_MAP[o.status] || STATUS_MAP.pending
                const Icon = s.icon
                return (
                  <tr key={o.id} className="hover:bg-white/[0.02] transition-all duration-300 group">
                    <td className="px-5 py-4">
                      <span className="text-white font-mono font-bold text-xs">#{o.id}</span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white text-[10px] font-bold">{o.customerName?.[0] || '?'}</div>
                        <div>
                          <p className="text-white font-medium text-xs">{o.customerName}</p>
                          {o.customerContact && <p className="text-[10px] text-gray-600">{o.customerContact}</p>}
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <span className="text-[10px] text-gray-500 bg-[#080b12]/60 px-2.5 py-1 rounded-lg border border-[#1a2332]">{o.platform || 'webchat'}</span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex flex-wrap gap-1">
                        {(o.products || []).map((p: any, i: number) => (
                          <span key={i} className="text-[10px] text-gray-400 bg-[#080b12]/40 px-2 py-0.5 rounded-md border border-[#1a2332]/50">{p.name} {p.quantity > 1 ? 'x' + p.quantity : ''}</span>
                        ))}
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <span className="text-white font-bold text-xs">₺{o.totalAmount || 0}</span>
                    </td>
                    <td className="px-5 py-4">
                      <span className="text-[10px] text-gray-500">{new Date(o.createdAt).toLocaleDateString('tr-TR')}</span>
                    </td>
                    <td className="px-5 py-4">
                      <span className={'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-semibold border ' + s.bg + ' ' + s.color + ' ' + s.border}>
                        <Icon size={12} />
                        {s.label}
                      </span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
