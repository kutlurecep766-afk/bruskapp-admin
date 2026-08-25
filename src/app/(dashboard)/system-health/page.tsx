'use client'
import { useState, useEffect, useCallback } from 'react'
import { Activity, Database, AlertTriangle, Building2, RefreshCw, CheckCircle2, XCircle, Search, ShieldCheck, Clock, Wallet, Inbox } from 'lucide-react'

type Business = {
  id: string
  name: string
  slug: string
  createdAt: string
  ordersLast24h: number
  lastOrder: string | null
  hoursSinceOrder: number | null
  posConfigured: boolean
}

export default function SystemHealthPage() {
  const [data, setData] = useState<any>(null)
  const [businesses, setBusinesses] = useState<Business[]>([])
  const [errorList, setErrorList] = useState<any[] | null>(null)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<'all' | 'issue' | 'ok'>('all')

  const fetchAll = useCallback(async () => {
    try {
      const res = await fetch('/api/system/health', { credentials: 'include' })
      if (res.ok) { const d = await res.json(); setData(d) }
    } catch {}
    try {
      const b = await fetch('/api/system/health/businesses', { credentials: 'include' })
      if (b.ok) setBusinesses(await b.json())
    } catch {}
    try {
      const er = await fetch('/api/system/health/errors', { credentials: 'include' })
      if (er.ok) setErrorList(await er.json())
    } catch {}
    finally { setLoading(false) }
  }, [])

  useEffect(() => { fetchAll(); const i = setInterval(fetchAll, 30000); return () => clearInterval(i) }, [fetchAll])

  if (loading) return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" /></div>

  const ISSUE_THRESHOLD_HOURS = 24

  const issues = businesses.filter(b => b.ordersLast24h === 0 && b.hoursSinceOrder !== null && b.hoursSinceOrder >= ISSUE_THRESHOLD_HOURS)
  const noPos = businesses.filter(b => !b.posConfigured)
  const healthy = businesses.filter(b => b.ordersLast24h > 0 || (b.hoursSinceOrder !== null && b.hoursSinceOrder < ISSUE_THRESHOLD_HOURS))

  const filtered = businesses.filter(b => {
    if (search && !b.name.toLowerCase().includes(search.toLowerCase()) && !b.slug.toLowerCase().includes(search.toLowerCase())) return false
    if (filter === 'issue') return b.ordersLast24h === 0 && b.hoursSinceOrder !== null && b.hoursSinceOrder >= ISSUE_THRESHOLD_HOURS
    if (filter === 'ok') return b.ordersLast24h > 0 || (b.hoursSinceOrder !== null && b.hoursSinceOrder < ISSUE_THRESHOLD_HOURS)
    return true
  })

  const timeAgo = (hours: number | null) => {
    if (hours === null) return 'Henüz sipariş yok'
    if (hours < 1) return 'Az önce'
    if (hours < 24) return `${hours} saat önce`
    return `${Math.floor(hours / 24)} gün önce`
  }

  const statusOf = (b: Business) => {
    if (b.ordersLast24h > 0) return { label: 'Aktif', cls: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' }
    if (b.hoursSinceOrder !== null && b.hoursSinceOrder < ISSUE_THRESHOLD_HOURS) return { label: 'Son 24s aktif', cls: 'bg-blue-500/10 text-blue-400 border-blue-500/20' }
    return { label: 'Sessiz (24s+ sipariş yok)', cls: 'bg-amber-500/10 text-amber-400 border-amber-500/20' }
  }

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#0f1420] via-[#0d1117] to-[#0a0e14] border border-[#1a2332] p-6">
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl" />
        <div className="relative flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <Activity size={28} className="text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Sistem Durumu</h1>
              <p className="text-sm text-gray-500 mt-0.5 flex items-center gap-2 flex-wrap">
                <span className={'inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold ' + (data?.status === 'ok' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-amber-500/10 text-amber-400 border border-amber-500/20')}>
                  {data?.status === 'ok' ? <CheckCircle2 size={12} /> : <XCircle size={12} />}
                  {data?.status === 'ok' ? 'Sağlıklı' : 'Sorun Var'}
                </span>
                {data?.database === 'connected' && <span className="inline-flex items-center gap-1 text-emerald-400 text-xs"><Database size={12} /> DB Bağlı</span>}
                <span className="text-gray-600">{data?.timestamp ? new Date(data.timestamp).toLocaleTimeString('tr-TR') : ''}</span>
              </p>
            </div>
          </div>
          <button onClick={fetchAll} className="sm:ml-auto inline-flex items-center justify-center gap-2 px-4 py-2 bg-[#1a2332] hover:bg-[#253040] text-gray-300 rounded-xl text-xs font-semibold border border-[#2a3a4a] transition-all">
            <RefreshCw size={14} /> Yenile
          </button>
        </div>
      </div>

      {/* Alert summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="rounded-2xl border border-[#1a2332] bg-[#0d1117]/80 p-5 flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center flex-shrink-0"><CheckCircle2 size={20} className="text-emerald-400" /></div>
          <div>
            <p className="text-white font-semibold text-sm">Sağlıklı İşletmeler</p>
            <p className="text-2xl font-bold text-white mt-1">{healthy.length}</p>
            <p className="text-[10px] text-gray-500 mt-0.5">Son 24 saatte sipariş alan</p>
          </div>
        </div>
        <div className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-5 flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center flex-shrink-0"><AlertTriangle size={20} className="text-amber-400" /></div>
          <div>
            <p className="text-white font-semibold text-sm">Sessiz Arıza</p>
            <p className={'text-2xl font-bold mt-1 ' + (issues.length > 0 ? 'text-amber-400' : 'text-white')}>{issues.length}</p>
            <p className="text-[10px] text-gray-500 mt-0.5">24+ saat sipariş almayan işletme</p>
          </div>
        </div>
        <div className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-5 flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center flex-shrink-0"><Wallet size={20} className="text-amber-400" /></div>
          <div>
            <p className="text-white font-semibold text-sm">SanalPOS Bağlı Değil</p>
            <p className={'text-2xl font-bold mt-1 ' + (noPos.length > 0 ? 'text-amber-400' : 'text-white')}>{noPos.length}</p>
            <p className="text-[10px] text-gray-500 mt-0.5">Ödeme hesabı olmayan işletme</p>
          </div>
        </div>
      </div>

      {/* Issues list (sessiz arıza) */}
      {issues.length > 0 && (
        <div className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-5">
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle size={18} className="text-amber-400" />
            <span className="text-white font-semibold text-sm">Dikkat: Sessiz Arıza Olabilecek İşletmeler</span>
            <span className="text-xs text-gray-500 ml-auto">Son 24 saatte sipariş alınmamış</span>
          </div>
          <div className="space-y-2">
            {issues.map(b => (
              <div key={b.id} className="flex items-center justify-between gap-3 p-3 rounded-xl bg-[#080b12]/60 border border-[#1a2332]">
                <div className="min-w-0">
                  <p className="text-sm text-white font-medium truncate">{b.name}</p>
                  <p className="text-[11px] text-gray-500">Son sipariş: {timeAgo(b.hoursSinceOrder)}</p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  {!b.posConfigured && <span className="text-[10px] px-2 py-1 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center gap-1"><Wallet size={10} /> POS yok</span>}
                  <span className="text-[10px] px-2 py-1 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">Sessiz</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Business list */}
      <div className="rounded-2xl border border-[#1a2332] bg-[#0d1117]/80 p-5">
        <div className="flex flex-col md:flex-row md:items-center gap-3 mb-4">
          <div className="flex items-center gap-2">
            <Building2 size={18} className="text-cyan-400" />
            <span className="text-white font-semibold text-sm">İşletme Durumları</span>
            <span className="text-xs text-gray-500">({businesses.length})</span>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 md:ml-auto w-full md:w-auto">
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="İşletme ara..."
                className="w-full sm:w-48 bg-[#080b12]/80 border border-[#1a2332] rounded-xl pl-9 pr-3 py-2 text-white text-xs focus:outline-none focus:border-emerald-500/50" />
            </div>
            <div className="flex gap-1 bg-[#080b12]/80 border border-[#1a2332] rounded-xl p-1">
              {[{ k: 'all', l: 'Tümü' }, { k: 'issue', l: 'Sessiz' }, { k: 'ok', l: 'Aktif' }].map(f => (
                <button key={f.k} onClick={() => setFilter(f.k as any)}
                  className={'px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ' + (filter === f.k ? 'bg-emerald-500/20 text-emerald-400' : 'text-gray-500 hover:text-white')}>
                  {f.l}
                </button>
              ))}
            </div>
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="py-14 text-center">
            <Inbox size={32} className="mx-auto text-gray-600 mb-3" />
            <p className="text-gray-500 text-sm">İşletme bulunmuyor</p>
          </div>
        ) : (
          <div className="space-y-2">
            {filtered.map(b => {
              const st = statusOf(b)
              return (
                <div key={b.id} className="flex items-center justify-between gap-3 p-3 rounded-xl bg-[#080b12]/60 border border-[#1a2332] hover:border-[#2a3a4a] transition-colors">
                  <div className="min-w-0 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-500/20 to-blue-500/10 border border-cyan-500/20 flex items-center justify-center flex-shrink-0">
                      <Building2 size={14} className="text-cyan-400" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm text-white font-medium truncate">{b.name}</p>
                      <p className="text-[11px] text-gray-500 truncate flex items-center gap-1.5">
                        <Clock size={10} /> Son sipariş: {timeAgo(b.hoursSinceOrder)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {!b.posConfigured && (
                      <span className="text-[10px] px-2 py-1 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center gap-1" title="SanalPOS bağlı değil">
                        <Wallet size={10} /> POS yok
                      </span>
                    )}
                    {b.ordersLast24h > 0 && (
                      <span className="text-[10px] px-2 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        {b.ordersLast24h} sipariş/24s
                      </span>
                    )}
                    <span className={'text-[10px] px-2 py-1 rounded-full border flex items-center gap-1 ' + st.cls}>
                      {st.label === 'Aktif' ? <ShieldCheck size={10} /> : <AlertTriangle size={10} />} {st.label}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Recent errors */}
      {errorList && errorList.length > 0 && (
        <div className="rounded-2xl border border-[#1a2332] bg-[#0d1117]/80 p-5">
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle size={18} className="text-amber-400" />
            <span className="text-white font-semibold text-sm">Son Hatalar</span>
            <span className="text-xs text-gray-500 ml-auto">Son 50 kayıt</span>
          </div>
          <div className="space-y-2">
            {errorList.slice(0, 10).map(e => (
              <div key={e.id} className="p-3 rounded-xl bg-[#080b12]/60 border border-[#1a2332]">
                <div className="flex items-center justify-between gap-3 flex-wrap">
                  <div className="min-w-0">
                    <p className="text-sm text-gray-200 font-medium truncate">{e.title}</p>
                    <p className="text-[11px] text-gray-500 truncate">{e.tenantName} · {e.platform || '-'} · {new Date(e.createdAt).toLocaleString('tr-TR')}</p>
                  </div>
                  <span className={'text-[10px] px-2 py-1 rounded-full border flex-shrink-0 ' + (e.acknowledged ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-red-500/10 text-red-400 border-red-500/20')}>
                    {e.acknowledged ? 'Çözüldü' : 'Bekliyor'}
                  </span>
                </div>
                {e.message && <p className="text-xs text-gray-500 mt-1.5 line-clamp-1">{e.message}</p>}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}