'use client'
import { useState, useEffect } from 'react'
import { Activity, Database, MessageSquare, AlertTriangle, Users, Building2, RefreshCw, CheckCircle2, XCircle, Clock } from 'lucide-react'

export default function SystemHealthPage() {
  const [data, setData] = useState<any>(null)
  const [errorList, setErrorList] = useState<any[]>(null)
  const [loading, setLoading] = useState(true)

  const fetchHealth = async () => {
    try {
      const res = await fetch('/api/system/health', { credentials: 'include' })
      if (res.ok) { const d = await res.json(); setData(d) }
    } catch {} try { const er = await fetch('/api/system/health/errors', { credentials: 'include' }); if (er.ok) setErrorList(await er.json()) } catch {}
    finally { setLoading(false) }
  }

  useEffect(() => { fetchHealth(); const i = setInterval(fetchHealth, 30000); return () => clearInterval(i) }, [])

  if (loading) return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" /></div>

  return (
    <div className="space-y-6 pb-12">
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#0f1420] via-[#0d1117] to-[#0a0e14] border border-[#1a2332] p-6 lg:p-8">
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl" />
        <div className="relative flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/20"><Activity size={28} className="text-white" /></div>
          <div>
            <h1 className="text-2xl font-bold text-white">Sistem Durumu</h1>
            <p className="text-sm text-gray-500 mt-0.5">{data?.timestamp ? new Date(data.timestamp).toLocaleString('tr-TR') : ''}</p>
          </div>
          <button onClick={fetchHealth} className="ml-auto px-4 py-2 bg-[#1a2332] hover:bg-[#253040] text-gray-300 rounded-xl text-xs font-semibold border border-[#2a3a4a] transition-all flex items-center gap-2"><RefreshCw size={14} /> Yenile</button>
        </div>
      </div>

      {/* Status Badge */}
      <div className={'inline-flex items-center gap-2 px-4 py-2 rounded-2xl text-sm font-bold border ' + (data?.status === 'ok' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-amber-500/10 text-amber-400 border-amber-500/20')}>
        {data?.status === 'ok' ? <><CheckCircle2 size={16} /> Sistem Saglikli</> : <><XCircle size={16} /> Sorun Var</>}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Database */}
        <div className="rounded-2xl border border-[#1a2332] bg-[#0d1117]/80 p-5">
          <div className="flex items-center gap-3 mb-3">
            <Database size={20} className={data?.database === 'connected' ? 'text-emerald-400' : 'text-red-400'} />
            <span className="text-white font-semibold text-sm">Veritabani</span>
            <span className={'ml-auto text-xs px-2 py-0.5 rounded-full font-medium ' + (data?.database === 'connected' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400')}>{data?.database === 'connected' ? 'Bagli' : 'Hata'}</span>
          </div>
          <p className="text-xs text-gray-500">PostgreSQL</p>
        </div>

        {/* Error Stats */}
        <div className="rounded-2xl border border-[#1a2332] bg-[#0d1117]/80 p-5">
          <div className="flex items-center gap-3 mb-3">
            <AlertTriangle size={20} className="text-amber-400" />
            <span className="text-white font-semibold text-sm">Hata Kayitlari</span>
          </div>
          <div className="grid grid-cols-3 gap-3 text-center">
            <div>
              <p className="text-2xl font-bold text-white">{data?.errors?.total || 0}</p>
              <p className="text-[10px] text-gray-500 mt-1">Toplam</p>
            </div>
            <div>
              <p className={'text-2xl font-bold ' + ((data?.errors?.last24h || 0) > 0 ? 'text-amber-400' : 'text-white')}>{data?.errors?.last24h || 0}</p>
              <p className="text-[10px] text-gray-500 mt-1">24 Saat</p>
            </div>
            <div>
              <p className={'text-2xl font-bold ' + ((data?.errors?.unacknowledged || 0) > 0 ? 'text-red-400' : 'text-white')}>{data?.errors?.unacknowledged || 0}</p>
              <p className="text-[10px] text-gray-500 mt-1">Bekleyen</p>
            </div>
          </div>
        </div>

        {/* Messages */}
        <div className="rounded-2xl border border-[#1a2332] bg-[#0d1117]/80 p-5">
          <div className="flex items-center gap-3 mb-3">
            <MessageSquare size={20} className="text-blue-400" />
            <span className="text-white font-semibold text-sm">Mesajlar</span>
          </div>
          <p className="text-2xl font-bold text-white">{data?.messagesLast24h || 0}</p>
          <p className="text-[10px] text-gray-500 mt-1">Son 24 saat</p>
        </div>

        {/* Leads */}
        <div className="rounded-2xl border border-[#1a2332] bg-[#0d1117]/80 p-5">
          <div className="flex items-center gap-3 mb-3">
            <Users size={20} className="text-purple-400" />
            <span className="text-white font-semibold text-sm">Lead'ler</span>
          </div>
          <p className="text-2xl font-bold text-white">{data?.leads || 0}</p>
          <p className="text-[10px] text-gray-500 mt-1">Toplam</p>
        </div>

        {/* Tenants */}
        <div className="rounded-2xl border border-[#1a2332] bg-[#0d1117]/80 p-5">
          <div className="flex items-center gap-3 mb-3">
            <Building2 size={20} className="text-cyan-400" />
            <span className="text-white font-semibold text-sm">Isletmeler</span>
          </div>
          <p className="text-2xl font-bold text-white">{data?.tenants || 0}</p>
          <p className="text-[10px] text-gray-500 mt-1">Aktif</p>
        </div>
      </div>

      {/* Platform Message Activity */}
      {data?.lastMessages && data.lastMessages.length > 0 && (
        <div className="rounded-2xl border border-[#1a2332] bg-[#0d1117]/80 p-5">
          <div className="flex items-center gap-3 mb-4">
            <Clock size={20} className="text-gray-400" />
            <span className="text-white font-semibold text-sm">Platform Mesaj Aktivitesi</span>
          </div>
          <div className="space-y-2">
            {data.lastMessages.map((p: any) => (
              <div key={p.platform} className="flex items-center justify-between px-3 py-2 rounded-xl bg-[#080b12]/60 border border-[#1a2332]">
                <span className="text-sm text-gray-300 font-medium capitalize">{p.platform}</span>
                <span className="text-xs text-gray-500">{p.lastmsg ? new Date(p.lastmsg).toLocaleString('tr-TR') : 'Henuz mesaj yok'}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {errorList && errorList.length > 0 && (
        <div className="rounded-2xl border border-[#1a2332] bg-[#0d1117]/80 p-5">
          <div className="flex items-center gap-3 mb-4">
            <AlertTriangle size={20} className="text-amber-400" />
            <span className="text-white font-semibold text-sm">Son Hatalar</span>
            <span className="text-xs text-gray-500 ml-auto">Son 50 kayit</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#1a2332] text-gray-500 text-xs uppercase tracking-wider">
                  <th className="text-left py-2 pr-4">Tarih</th>
                  <th className="text-left py-2 pr-4">Isletme</th>
                  <th className="text-left py-2 pr-4">Platform</th>
                  <th className="text-left py-2 pr-4">Hata</th>
                  <th className="text-right py-2">Durum</th>
                </tr>
              </thead>
              <tbody>
                {errorList.map((e: any) => (
                  <tr key={e.id} className="border-b border-[#1a2332]/50 hover:bg-[#080b12]/40 transition-colors">
                    <td className="py-2.5 pr-4 text-gray-400 text-xs whitespace-nowrap">{new Date(e.createdAt).toLocaleString('tr-TR')}</td>
                    <td className="py-2.5 pr-4 text-gray-300 font-medium">{e.tenantName}</td>
                    <td className="py-2.5 pr-4"><span className="text-xs px-2 py-0.5 rounded-full bg-[#1a2332] text-gray-400">{e.platform || '-'}</span></td>
                    <td className="py-2.5 pr-4">
                      <div className="text-gray-200 font-medium">{e.title}</div>
                      <div className="text-gray-500 text-xs mt-0.5 line-clamp-1">{e.message}</div>
                    </td>
                    <td className="py-2.5 text-right">{e.acknowledged
                      ? <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400">Cozuldu</span>
                      : <span className="text-xs px-2 py-0.5 rounded-full bg-red-500/10 text-red-400">Bekliyor</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
