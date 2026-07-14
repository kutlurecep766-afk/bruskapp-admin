'use client'
import { useState, useEffect } from 'react'
import { MessageCircle, Camera, Send, Globe, Users, Link2, Unlink } from 'lucide-react'

const platformIcons: Record<string, any> = {
  whatsapp: MessageCircle,
  instagram: Camera,
  facebook: Send,
  telegram: Globe,
}

const platformColors: Record<string, string> = {
  whatsapp: 'text-green-400',
  instagram: 'text-pink-400',
  facebook: 'text-blue-400',
  telegram: 'text-sky-400',
}

export default function ZernioAccountsPage() {
  const [data, setData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({ totalTenants: 0, totalConnections: 0, byPlatform: {} as Record<string, number> })

  useEffect(() => {
    fetch('/api/zernio/connections', { credentials: 'include' })
      .then(r => r.ok ? r.json() : { data: [] })
      .then(json => {
        const list = json.data || []
        setData(list)
        const byPlatform: Record<string, number> = {}
        let totalConnections = 0
        for (const item of list) {
          for (const p of (item.platforms || [])) {
            byPlatform[p.platform] = (byPlatform[p.platform] || 0) + 1
            totalConnections++
          }
        }
        setStats({ totalTenants: list.length, totalConnections, byPlatform })
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return <div className="flex items-center justify-center h-64"><div className="animate-spin w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full" /></div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Aboneler / Hesaplar</h1>
          <p className="text-sm text-gray-500 mt-1">Zernio uzerinden bagli isletmeler ve aktif hesaplar</p>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[#0d1117]/80 backdrop-blur-xl border border-[#1a2332] rounded-2xl p-5">
          <p className="text-sm text-gray-500">Bagli Isletme</p>
          <p className="text-2xl font-bold text-white mt-1">{stats.totalTenants}</p>
        </div>
        <div className="bg-[#0d1117]/80 backdrop-blur-xl border border-[#1a2332] rounded-2xl p-5">
          <p className="text-sm text-gray-500">Toplam Hesap</p>
          <p className="text-2xl font-bold text-white mt-1">{stats.totalConnections}</p>
        </div>
        {Object.entries(stats.byPlatform).map(([platform, count]) => {
          const Icon = platformIcons[platform]
          const color = platformColors[platform] || 'text-gray-400'
          return (
            <div key={platform} className="bg-[#0d1117]/80 backdrop-blur-xl border border-[#1a2332] rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-1">
                {Icon && <Icon className={'w-4 h-4 ' + color} />}
                <p className="text-sm text-gray-500 capitalize">{platform}</p>
              </div>
              <p className={'text-2xl font-bold mt-1 ' + color}>{count}</p>
            </div>
          )
        })}
      </div>

      <div className="bg-[#0d1117]/80 backdrop-blur-xl border border-[#1a2332] rounded-2xl overflow-hidden">
        <div className="p-5 border-b border-[#1a2332]">
          <h3 className="text-white font-semibold">Bagli Isletmeler</h3>
        </div>
        {data.length === 0 ? (
          <div className="text-center py-16 text-gray-500">Henuz bagli isletme yok</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#1a2332] text-gray-500 text-xs uppercase tracking-wider">
                  <th className="text-left p-4 font-medium">Isletme</th>
                  <th className="text-left p-4 font-medium">Platformlar</th>
                  <th className="text-left p-4 font-medium">Profil ID</th>
                  <th className="text-left p-4 font-medium">Durum</th>
                </tr>
              </thead>
              <tbody>
                {data.map((item) => (
                  <tr key={item.tenantId} className="border-b border-[#1a2332]/50 hover:bg-white/[0.02]">
                    <td className="p-4">
                      <span className="text-white font-medium">{item.tenantName}</span>
                    </td>
                    <td className="p-4">
                      <div className="flex gap-2">
                        {(item.platforms || []).length > 0 ? item.platforms.map((p: any) => {
                          const Icon = platformIcons[p.platform]
                          const color = platformColors[p.platform] || 'text-gray-400'
                          return (
                            <div key={p.platform} className={'flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium ' + color + ' bg-white/5'}>
                              {Icon && <Icon className="w-3 h-3" />}
                              {p.platform}
                            </div>
                          )
                        }) : <span className="text-gray-600">Bagli degil</span>}
                      </div>
                    </td>
                    <td className="p-4 text-gray-400 font-mono text-xs">{item.profileId ? item.profileId.substring(0, 16) + '...' : '-'}</td>
                    <td className="p-4">
                      <span className={'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium ' + ((item.platforms || []).length > 0 ? 'bg-green-500/10 text-green-400' : 'bg-gray-500/10 text-gray-500')}>
                        {(item.platforms || []).length > 0 ? <Link2 className="w-3 h-3" /> : <Unlink className="w-3 h-3" />}
                        {(item.platforms || []).length > 0 ? 'Aktif' : 'Pasif'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
