'use client'
import { useState, useEffect } from 'react'
import { Calendar, Clock, Search, Filter, RefreshCw, CheckCircle, XCircle, AlertCircle, Scissors, Stethoscope } from 'lucide-react'

const STATUS_MAP: Record<string, { label: string; color: string; bg: string; border: string; icon: any }> = {
  pending: { label: 'Bekliyor', color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/20', icon: Clock },
  confirmed: { label: 'Onaylandı', color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', icon: CheckCircle },
  completed: { label: 'Tamamlandı', color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/20', icon: AlertCircle },
  cancelled: { label: 'İptal', color: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/20', icon: XCircle },
}

export default function AppointmentsPage() {
  const [appointments, setAppointments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('')

  const load = async () => {
    try {
      const tenant = await fetch('/api/tenants/me', { credentials: 'include' }).then(r => r.json())
      const tid = tenant?.tenant?.id || tenant?.id
      if (tid) {
        const res = await fetch('/api/appointments?tenantId=' + tid, { credentials: 'include' })
        if (res.ok) setAppointments(await res.json())
      }
    } catch {} finally { setLoading(false) }
  }

  useEffect(() => { load() }, [])

  const updateStatus = async (id: number, status: string) => {
    await fetch('/api/appointments/' + id + '/status', { method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'include', body: JSON.stringify({ status }) })
    setAppointments(prev => prev.map(a => a.id === id ? { ...a, status } : a))
  }

  const filtered = filter ? appointments.filter((a: any) => a.status === filter) : appointments
  const today = new Date().toDateString()
  const stats = {
    total: appointments.length,
    pending: appointments.filter((a: any) => a.status === 'pending').length,
    confirmed: appointments.filter((a: any) => a.status === 'confirmed').length,
    today: appointments.filter((a: any) => new Date(a.date).toDateString() === today).length,
  }

  if (loading) return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" /></div>

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#0f1420] via-[#0d1117] to-[#0a0e14] border border-[#1a2332] p-6 lg:p-8">
        <div className="absolute top-0 right-0 w-96 h-96 bg-sky-500/5 rounded-full blur-3xl" />
        <div className="relative flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-sky-500 to-blue-600 flex items-center justify-center shadow-lg shadow-sky-500/20">
              <Calendar className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">Randevular</h1>
              <p className="text-sm text-gray-500 mt-0.5">Toplam {appointments.length} randevu</p>
            </div>
          </div>
          <button onClick={load} className="p-2.5 rounded-xl bg-[#080b12]/60 border border-[#1a2332] text-gray-500 hover:text-white hover:border-white/20 transition-all"><RefreshCw size={16} /></button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'Toplam', value: stats.total, color: 'from-sky-500 to-blue-600', glow: 'shadow-sky-500/20' },
          { label: 'Bekleyen', value: stats.pending, color: 'from-amber-500 to-orange-600', glow: 'shadow-amber-500/20' },
          { label: 'Onaylanan', value: stats.confirmed, color: 'from-emerald-500 to-teal-600', glow: 'shadow-emerald-500/20' },
          { label: 'Bugün', value: stats.today, color: 'from-purple-500 to-pink-600', glow: 'shadow-purple-500/20' },
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

      {/* Filter */}
      <div className="flex gap-1 bg-[#080b12]/80 border border-[#1a2332] rounded-xl p-0.5 w-fit">
        {[{ key: '', label: 'Tümü' }, ...Object.entries(STATUS_MAP).map(([k, v]) => ({ key: k, label: v.label }))].map(f => (
          <button key={f.key} onClick={() => setFilter(f.key)}
            className={'px-3.5 py-2 rounded-lg text-xs font-semibold transition-all ' + (filter === f.key ? 'bg-sky-500/10 text-sky-400 shadow-sm' : 'text-gray-500 hover:text-white')}>{f.label}</button>
        ))}
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 bg-[#0d1117]/80 backdrop-blur-xl border border-[#1a2332] rounded-2xl">
          <Calendar size={40} className="mx-auto text-gray-700 mb-3" />
          <p className="text-gray-500 text-sm">Henüz randevu bulunmuyor</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((a: any) => {
            const s = STATUS_MAP[a.status] || STATUS_MAP.pending
            const Icon = s.icon
            return (
              <div key={a.id} className="group relative overflow-hidden rounded-2xl bg-[#0d1117]/80 backdrop-blur-xl border border-[#1a2332] p-5 hover:border-sky-500/30 hover:shadow-lg hover:shadow-sky-500/5 transition-all duration-300">
                <div className="absolute top-0 right-0 w-32 h-32 bg-sky-500/5 rounded-full blur-2xl transition-all duration-700 group-hover:opacity-50" />
                <div className="relative">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-sky-400 to-blue-500 flex items-center justify-center text-white text-sm font-bold shadow-md">{a.customerName?.[0] || '?'}</div>
                      <div>
                        <h3 className="text-white font-semibold text-sm">{a.customerName}</h3>
                        <p className="text-[10px] text-gray-500">{a.platform || 'webchat'}</p>
                      </div>
                    </div>
                    <select value={a.status} onChange={e => updateStatus(a.id, e.target.value)}
                      className={'text-[10px] px-2 py-1 rounded-lg border font-medium cursor-pointer transition-all ' + s.bg + ' ' + s.color + ' ' + s.border}>
                      {Object.entries(STATUS_MAP).map(([k, v]) => <option key={k} value={k} className="bg-[#0d1117]">{v.label}</option>)}
                    </select>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-gray-400 mb-3">
                    <span className="flex items-center gap-1.5"><Calendar size={13} className="text-sky-400" />{new Date(a.date).toLocaleDateString('tr-TR')}</span>
                    {a.time && <span className="flex items-center gap-1.5"><Clock size={13} className="text-blue-400" />{a.time}</span>}
                  </div>
                  {a.service && (
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#080b12]/60 border border-[#1a2332] text-[10px] text-gray-500">
                      <Scissors size={10} className="text-sky-400" />{a.service}
                    </div>
                  )}
                  {a.notes && <p className="text-[10px] text-gray-600 mt-2 italic">{a.notes}</p>}
                  <div className="mt-3 flex items-center gap-1.5">
                    <Icon size={12} className={s.color} />
                    <span className={'text-[10px] font-semibold ' + s.color}>{s.label}</span>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
