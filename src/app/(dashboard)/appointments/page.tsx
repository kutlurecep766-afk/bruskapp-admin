'use client'
import { useState, useEffect, useCallback } from 'react'
import { Calendar, Clock, Search, RefreshCw, CheckCircle, AlertCircle, Scissors } from 'lucide-react'

const STATUS_META: Record<string, { label: string; chip: string; dot: string }> = {
  pending:   { label: 'Bekliyor',   chip: 'bg-amber-50 text-amber-600 border-amber-200',     dot: 'bg-amber-500' },
  confirmed: { label: 'Onaylandı',  chip: 'bg-emerald-50 text-emerald-600 border-emerald-200', dot: 'bg-emerald-500' },
  completed: { label: 'Tamamlandı', chip: 'bg-blue-50 text-blue-600 border-blue-200',        dot: 'bg-blue-500' },
  cancelled: { label: 'İptal',      chip: 'bg-red-50 text-red-600 border-red-200',           dot: 'bg-red-500' },
}

const FLOW: Record<string, string[]> = {
  pending: ['confirmed', 'cancelled'],
  confirmed: ['completed', 'cancelled'],
  completed: [],
  cancelled: [],
}

const ACTION_LABEL: Record<string, string> = {
  confirmed: 'Onayla',
  completed: 'Tamamlandı',
  cancelled: 'İptal',
}

export default function AppointmentsPage() {
  const [appointments, setAppointments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('')
  const [search, setSearch] = useState('')
  const [updating, setUpdating] = useState<number | null>(null)
  const [editId, setEditId] = useState<number | null>(null)
  const [editForm, setEditForm] = useState<{ customerName: string; date: string; time: string; service: string }>({ customerName: '', date: '', time: '', service: '' })

  const openEdit = (a: any) => {
    setEditId(a.id)
    const d = a.date ? new Date(a.date) : null
    const iso = d && !isNaN(d.getTime()) ? d.toISOString().slice(0, 10) : ''
    setEditForm({ customerName: a.customerName || '', date: iso, time: a.time || '', service: a.service || '' })
  }

  const load = useCallback(async () => {
    try {
      const tenant = await fetch('/api/tenants/me', { credentials: 'include' }).then(r => r.json())
      const tid = tenant?.tenant?.id || tenant?.id
      if (tid) {
        const res = await fetch('/api/appointments?tenantId=' + tid, { credentials: 'include' })
        if (res.ok) setAppointments(await res.json())
      }
    } catch {} finally { setLoading(false) }
  }, [])

  useEffect(() => { load() }, [load])

  const updateStatus = async (id: number, status: string) => {
    setUpdating(id)
    try {
      const res = await fetch('/api/appointments/' + id + '/status', { method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'include', body: JSON.stringify({ status }) })
      if (res.ok) setAppointments(prev => prev.map(a => a.id === id ? { ...a, status } : a))
    } catch {} finally { setUpdating(null) }
  }

  const cancelAppt = async (id: number) => {
    if (!confirm('Bu randevuyu iptal etmek istediğinize emin misiniz?')) return
    setUpdating(id)
    try {
      const res = await fetch('/api/appointments/' + id + '/cancel', { method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'include', body: JSON.stringify({ notes: 'Panelden iptal edildi' }) })
      if (res.ok) setAppointments(prev => prev.map(a => a.id === id ? { ...a, status: 'cancelled' } : a))
    } catch {} finally { setUpdating(null) }
  }

  const updateAppt = async (id: number, patch: any) => {
    setUpdating(id)
    try {
      const res = await fetch('/api/appointments/' + id + '/update', { method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'include', body: JSON.stringify(patch) })
      if (res.ok) { const upd = await res.json(); setAppointments(prev => prev.map(a => a.id === id ? { ...a, ...upd } : a)) }
    } catch {} finally { setUpdating(null) }
  }

  const today = new Date().toDateString()
  const stats = {
    total: appointments.length,
    pending: appointments.filter((a: any) => a.status === 'pending').length,
    confirmed: appointments.filter((a: any) => a.status === 'confirmed').length,
    today: appointments.filter((a: any) => new Date(a.date).toDateString() === today).length,
  }

  const filtered = appointments.filter((a: any) => {
    if (filter && a.status !== filter) return false
    if (search) {
      const s = search.toLowerCase()
      return (a.customerName || '').toLowerCase().includes(s)
        || (a.service || '').toLowerCase().includes(s)
        || (a.customerContact || '').toLowerCase().includes(s)
    }
    return true
  })

  if (loading) return (
    <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" /></div>
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
              <Calendar className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-xl lg:text-2xl font-bold text-white tracking-tight">Randevular</h1>
              <p className="text-sm text-blue-100 mt-0.5">Chatbot üzerinden alınan randevular</p>
            </div>
          </div>
          <button onClick={load}
            className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-white text-blue-700 text-xs font-bold shadow-md hover:shadow-lg hover:scale-105 active:scale-95 transition-all">
            <RefreshCw size={14} /> Yenile
          </button>
        </div>

        {/* Tabs */}
        <div className="relative mt-6 flex items-center gap-2 overflow-x-auto no-scrollbar">
          {[{ key: '', label: 'Tümü' }, ...Object.entries(STATUS_META).map(([k, v]) => ({ key: k, label: v.label }))].map(f => {
            const active = filter === f.key
            const count = f.key ? appointments.filter((a: any) => a.status === f.key).length : appointments.length
            return (
              <button key={f.key} onClick={() => setFilter(f.key)}
                className={'flex items-center gap-2 px-4 py-2.5 rounded-full text-xs font-semibold transition-all whitespace-nowrap ' + (active ? 'bg-white text-blue-700 shadow-md' : 'bg-white/15 text-white backdrop-blur hover:bg-white/25')}>
                {f.label}
                <span className={'px-1.5 py-0.5 rounded-full text-[10px] ' + (active ? 'bg-blue-100 text-blue-700' : 'bg-white/20 text-white')}>{count}</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: 'Toplam Randevu', value: stats.total, grad: 'from-blue-600 to-blue-700', icon: Calendar },
          { label: 'Bekleyen', value: stats.pending, grad: 'from-amber-500 to-orange-500', icon: Clock },
          { label: 'Onaylanan', value: stats.confirmed, grad: 'from-emerald-500 to-teal-600', icon: CheckCircle },
          { label: 'Bugün', value: stats.today, grad: 'from-indigo-500 to-purple-600', icon: AlertCircle },
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
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Müşteri, hizmet veya telefon ara..."
          className="w-full pl-10 pr-4 py-3 rounded-xl bg-white border border-blue-100 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all" />
      </div>

      {/* List */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 bg-white border border-blue-100 rounded-2xl">
          <Calendar size={40} className="mx-auto text-blue-200 mb-3" />
          <p className="text-gray-500 text-sm">Henüz randevu bulunmuyor</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((a: any) => {
            const s = STATUS_META[a.status] || STATUS_META.pending
            const next = FLOW[a.status] || []
            const initials = (a.customerName || '?').trim().charAt(0).toUpperCase()
            return (
              <div key={a.id} className="rounded-2xl bg-white border border-blue-100 p-5 shadow-sm hover:shadow-md transition-all">
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-11 h-11 rounded-full bg-gradient-to-br from-sky-400 to-blue-600 flex items-center justify-center text-white text-sm font-bold shadow-md shrink-0">{initials}</div>
                    <div className="min-w-0">
                      <p className="text-gray-900 font-semibold text-sm truncate">{a.customerName || 'Misafir'}</p>
                      <p className="text-[11px] text-gray-400 truncate">{a.platform || 'webchat'}{a.customerContact ? ' · ' + a.customerContact : ''}</p>
                    </div>
                  </div>
                  <span className={'px-3 py-1 rounded-full text-[11px] font-semibold border shrink-0 ' + s.chip}>{s.label}</span>
                </div>

                <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-gray-600 mb-3">
                  <span className="flex items-center gap-1.5"><Calendar size={13} className="text-blue-500" />{a.date ? new Date(a.date).toLocaleDateString('tr-TR') : '-'}</span>
                  {a.time && <span className="flex items-center gap-1.5"><Clock size={13} className="text-blue-500" />{a.time}</span>}
                  {a.service && (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-50 border border-slate-200 text-[11px] text-gray-600">
                      <Scissors size={11} className="text-blue-500" />{a.service}
                    </span>
                  )}
                </div>
                {a.notes && <p className="text-[11px] text-gray-500 italic mb-3">{a.notes}</p>}

                <div className="flex flex-wrap items-center gap-1.5 pt-3 border-t border-blue-50">
                  {next.filter(nv => nv !== 'cancelled').map(nv => {
                    const nm = STATUS_META[nv]
                    return (
                      <button key={nv} disabled={updating === a.id} onClick={() => updateStatus(a.id, nv)}
                        className={'px-3 py-2 rounded-lg text-xs font-semibold border transition-all hover:brightness-95 active:scale-95 disabled:opacity-40 ' + nm.chip}>
                        {ACTION_LABEL[nv] || nm.label}
                      </button>
                    )
                  })}
                  {a.status !== 'cancelled' && a.status !== 'completed' && (
                    <button disabled={updating === a.id} onClick={() => openEdit(a)}
                      className="px-3 py-2 rounded-lg text-xs font-semibold border border-slate-200 text-gray-600 hover:bg-slate-50 active:scale-95 disabled:opacity-40">
                      Düzenle
                    </button>
                  )}
                  {a.status !== 'cancelled' && a.status !== 'completed' && (
                    <button disabled={updating === a.id} onClick={() => cancelAppt(a.id)}
                      className={'px-3 py-2 rounded-lg text-xs font-semibold border transition-all hover:brightness-95 active:scale-95 disabled:opacity-40 ' + STATUS_META.cancelled.chip}>
                      İptal
                    </button>
                  )}
                </div>

                {editId === a.id && (
                  <div className="mt-3 pt-3 border-t border-blue-50 grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <input value={editForm.customerName} onChange={e => setEditForm(f => ({ ...f, customerName: e.target.value }))} placeholder="Ad Soyad"
                      className="px-3 py-2 rounded-lg border border-slate-200 text-sm text-gray-900 focus:outline-none focus:border-blue-400" />
                    <input value={editForm.service} onChange={e => setEditForm(f => ({ ...f, service: e.target.value }))} placeholder="Hizmet"
                      className="px-3 py-2 rounded-lg border border-slate-200 text-sm text-gray-900 focus:outline-none focus:border-blue-400" />
                    <input type="date" value={editForm.date} onChange={e => setEditForm(f => ({ ...f, date: e.target.value }))}
                      className="px-3 py-2 rounded-lg border border-slate-200 text-sm text-gray-900 focus:outline-none focus:border-blue-400" />
                    <input value={editForm.time} onChange={e => setEditForm(f => ({ ...f, time: e.target.value }))} placeholder="Saat (ör. 14:00)"
                      className="px-3 py-2 rounded-lg border border-slate-200 text-sm text-gray-900 focus:outline-none focus:border-blue-400" />
                    <div className="flex gap-2 sm:col-span-2">
                      <button disabled={updating === a.id}
                        onClick={async () => { await updateAppt(a.id, { customerName: editForm.customerName, service: editForm.service, time: editForm.time, date: editForm.date || undefined }); setEditId(null) }}
                        className="px-4 py-2 rounded-lg bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700 active:scale-95 disabled:opacity-40">Kaydet</button>
                      <button onClick={() => setEditId(null)} className="px-4 py-2 rounded-lg border border-slate-200 text-gray-500 text-xs font-semibold hover:bg-slate-50">Vazgeç</button>
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
