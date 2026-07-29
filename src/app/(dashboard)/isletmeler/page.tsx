'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Store, Search, ExternalLink, QrCode } from 'lucide-react'

export default function IsletmelerPage() {
  const [tenants, setTenants] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    fetch('/api/tenants', { credentials: 'include' }).then(r => r.ok ? r.json() : []).then(data => {
      setTenants(data)
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [])

  const filtered = tenants.filter((t: any) =>
    t.name?.toLowerCase().includes(search.toLowerCase()) || t.slug?.toLowerCase().includes(search.toLowerCase())
  )

  if (loading) return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" /></div>

  return (
    <div className="space-y-6 pb-12">
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#0f1420] via-[#0d1117] to-[#0a0e14] border border-[#1a2332] p-6 lg:p-8">
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl" />
        <div className="relative flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <Store className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">İşletmeler</h1>
              <p className="text-sm text-gray-500 mt-0.5">Tüm işletmeleri yönetin, QR menü ve ayarlarına erişin</p>
            </div>
          </div>
        </div>
      </div>

      <div className="relative mb-4">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600" />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="İşletme ara..." className="w-full bg-[#080b12]/80 border border-[#1a2332] rounded-xl pl-9 pr-4 py-2.5 text-white text-sm focus:outline-none focus:border-emerald-500/50 placeholder-gray-600" />
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
        {filtered.map((t: any) => (
          <div key={t.id} className="p-4 rounded-2xl bg-[#0d1117]/80 border border-[#1a2332] hover:border-emerald-500/30 transition-all group">
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-white font-semibold">{t.name}</p>
                <p className="text-xs text-gray-600 mt-0.5">{t.slug}</p>
              </div>
              <Link
                href={`/storefront?tenantId=${t.id}`}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-medium hover:bg-emerald-500/20 transition-all"
              >
                <QrCode size={14} /> QR Menü Yönet
              </Link>
            </div>
            <a
              href={`https://bruskapp.com/menu/${t.slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-emerald-400 transition-colors"
            >
              <ExternalLink size={12} /> menüyü görüntüle
            </a>
          </div>
        ))}
      </div>

      {filtered.length === 0 && !loading && (
        <div className="text-center py-16 text-gray-500 text-sm">İşletme bulunamadı</div>
      )}
    </div>
  )
}
