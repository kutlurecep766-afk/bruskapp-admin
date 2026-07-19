'use client'
import { useState, useEffect } from 'react'
import { ShoppingCart, BarChart3, PieChart, Calendar, TrendingUp, ExternalLink, CheckCircle } from 'lucide-react'

const PLATFORM_CONF: Record<string, { label: string; svg: string }> = {
  whatsapp: {
    label: 'WhatsApp',
    svg: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.626.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>',
  },
  instagram: {
    label: 'Instagram',
    svg: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>',
  },
  facebook: {
    label: 'Facebook',
    svg: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>',
  },
  telegram: {
    label: 'Telegram',
    svg: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M11.944 0A12 12 0 000 12a12 12 0 0012 12 12 12 0 0012-12A12 12 0 0012 0a12 12 0 00-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 01.171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/></svg>',
  },
  webchat: {
    label: 'Web Chat',
    svg: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z" fill="none"/><path d="M9 10h6M9 13h4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>',
  },
  trendyol: {
    label: 'Trendyol',
    svg: '<svg viewBox="0 0 48 48"><rect width="48" height="48" rx="12" fill="#F27A00"/><text x="24" y="33" font-family="Arial,sans-serif" font-weight="900" font-size="30" text-anchor="middle" fill="white">t</text></svg>',
  },
  hepsiburada: {
    label: 'Hepsiburada',
    svg: '<svg viewBox="0 0 48 48"><rect width="48" height="48" rx="12" fill="#572B85"/><rect x="10" y="12" width="28" height="24" rx="3" fill="white"/><text x="16" y="29" font-family="Arial,sans-serif" font-weight="800" font-size="14" fill="#572B85">HB</text></svg>',
  },
  n11: {
    label: 'n11',
    svg: '<svg viewBox="0 0 48 48"><circle cx="24" cy="24" r="24" fill="#D7003A"/><text x="15" y="32" font-family="Arial,sans-serif" font-weight="900" font-size="18" fill="white">n</text><text x="26" y="32" font-family="Arial,sans-serif" font-weight="700" font-size="13" fill="white">11</text></svg>',
  },
}

function PlatformSvg({ svg, className = '' }: { svg: string; className?: string }) {
  return <span className={className} dangerouslySetInnerHTML={{ __html: svg.replace('currentColor', 'currentColor') }} />
}

const PLATFORM_THEME: Record<string, { bg: string; border: string; text: string }> = {
  whatsapp: { bg: 'bg-[#25D366]/10', border: 'border-green-500/20', text: 'text-green-400' },
  instagram: { bg: 'bg-[#E4405F]/10', border: 'border-pink-500/20', text: 'text-pink-400' },
  facebook: { bg: 'bg-[#0866FF]/10', border: 'border-blue-500/20', text: 'text-blue-400' },
  telegram: { bg: 'bg-[#0088CC]/10', border: 'border-sky-500/20', text: 'text-sky-400' },
  webchat: { bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', text: 'text-emerald-400' },
  trendyol: { bg: 'bg-orange-500/10', border: 'border-orange-500/20', text: 'text-orange-400' },
  hepsiburada: { bg: 'bg-purple-500/10', border: 'border-purple-500/20', text: 'text-purple-400' },
  n11: { bg: 'bg-rose-500/10', border: 'border-rose-500/20', text: 'text-rose-400' },
}

export default function AnalyticsPage() {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/analytics/dashboard', { credentials: 'include' })
      .then(r => r.ok ? r.json() : null)
      .then(d => { if (d) setData(d); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  if (loading) return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" /></div>

  const messages = data?.messages
  const orders = data?.orders
  const connectedPlatforms: string[] = data?.connectedPlatforms || []
  const hasData = messages?.total > 0 || orders?.total > 0

  const activePlatforms = Object.keys(PLATFORM_CONF).filter(p =>
    connectedPlatforms.length === 0 || connectedPlatforms.includes(p)
  )

  const platformData = activePlatforms.map(p => {
    const msgData = (messages?.byPlatform || []).find((bp: any) => bp.platform === p)
    const count = msgData?.count || 0
    const conf = PLATFORM_CONF[p]
    const theme = PLATFORM_THEME[p] || { bg: 'bg-gray-500/10', border: 'border-gray-500/20', text: 'text-gray-400' }
    return { key: p, label: conf?.label || p, svg: conf?.svg || '', count, theme, hasMessages: count > 0 }
  })

  const connectedWithData = platformData.filter(p => p.hasMessages)
  const totalMessages = connectedWithData.reduce((a, p) => a + p.count, 0)

  return (
    <div className="space-y-6 pb-12">
      {/* Başlık */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#0f1420] via-[#0d1117] to-[#0a0e14] border border-[#1a2332] p-8">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500/5 rounded-full blur-3xl" />
        <div className="relative">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/20"><BarChart3 size={20} className="text-white" /></div>
            <div>
              <h1 className="text-xl font-bold text-white">Analitik</h1>
              <p className="text-sm text-gray-500">Platform bazında mesaj ve sipariş istatistikleri</p>
            </div>
          </div>
        </div>
      </div>

      {!hasData && (
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#0f1420] to-[#0d1117] border border-[#1a2332] p-12 text-center">
          <BarChart3 size={48} className="mx-auto text-gray-700 mb-4" />
          <p className="text-gray-500 text-lg">Henüz veri bulunmuyor</p>
          <p className="text-gray-600 text-sm mt-2">Mesaj ve sipariş gelmeye başlayınca istatistikler burada görünecek</p>
        </div>
      )}

      {hasData && (
        <>
          {/* Platform Bazında Mesaj Dağılımı */}
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#0f1420] to-[#0d1117] border border-[#1a2332] p-6 lg:p-8">
            <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl" />
            <div className="relative">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-500/20"><PieChart size={20} className="text-white" /></div>
                <div>
                  <h2 className="text-white text-lg font-semibold">Platform Bazında Mesaj Dağılımı</h2>
                  <p className="text-xs text-gray-500 mt-0.5">Bağlı platformlardan gelen mesajların platform bazında dağılımı</p>
                </div>
              </div>

              {connectedWithData.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                  {connectedWithData.map(p => {
                    const percent = totalMessages > 0 ? Math.round((p.count / totalMessages) * 100) : 0
                    const t = p.theme
                    return (
                      <div key={p.key} className={'relative overflow-hidden rounded-2xl border p-5 transition-all duration-300 hover:scale-[1.02] hover:shadow-lg ' + t.bg + ' ' + t.border}>
                        <div className="flex items-start justify-between mb-4">
                          <div className="w-10 h-10 flex items-center justify-center">
                            <PlatformSvg svg={p.svg} className={'w-8 h-8 ' + t.text} />
                          </div>
                          <div className={'px-2.5 py-1 rounded-full text-xs font-semibold ' + t.bg + ' ' + t.text}>{percent}%</div>
                        </div>
                        <p className="text-sm text-gray-400 font-medium">{p.label}</p>
                        <p className="text-3xl font-bold text-white mt-1">{p.count}</p>
                        <div className="mt-3 h-2 bg-[#1a2332] rounded-full overflow-hidden">
                          <div className="h-full rounded-full transition-all duration-700" style={{ width: percent + '%', background: t.text.includes('green') ? '#25D366' : t.text.includes('pink') ? '#E4405F' : t.text.includes('blue') ? '#0866FF' : t.text.includes('sky') ? '#0088CC' : t.text.includes('emerald') ? '#10b981' : t.text.includes('orange') ? '#F27A00' : t.text.includes('purple') ? '#572B85' : t.text.includes('rose') ? '#D7003A' : '#6b7280' }} />
                        </div>
                      </div>
                    )
                  })}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500 text-sm">Henüz platform verisi bulunmuyor</div>
              )}

              {/* Özet Kartları */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="bg-[#080b12]/60 border border-[#1a2332] rounded-xl p-4 text-center">
                  <p className="text-2xl font-bold text-white">{totalMessages}</p>
                  <p className="text-xs text-gray-500 mt-1">Toplam Mesaj</p>
                </div>
                <div className="bg-[#080b12]/60 border border-[#1a2332] rounded-xl p-4 text-center">
                  <p className="text-2xl font-bold text-white">{messages?.todayCount || 0}</p>
                  <p className="text-xs text-gray-500 mt-1">Bugün</p>
                </div>
                <div className="bg-[#080b12]/60 border border-[#1a2332] rounded-xl p-4 text-center">
                  <p className="text-2xl font-bold text-white">{connectedWithData.length}</p>
                  <p className="text-xs text-gray-500 mt-1">Aktif Platform</p>
                </div>
                <div className="bg-[#080b12]/60 border border-[#1a2332] rounded-xl p-4 text-center">
                  <p className="text-2xl font-bold text-white">{connectedPlatforms.length || activePlatforms.length}</p>
                  <p className="text-xs text-gray-500 mt-1">Bağlı Platform</p>
                </div>
              </div>
            </div>
          </div>

          {/* Alt Bölüm */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Bağlı Aktif Platformlar */}
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#0f1420] to-[#0d1117] border border-[#1a2332] p-6">
              <div className="absolute top-0 right-0 w-48 h-48 bg-purple-500/5 rounded-full blur-2xl" />
              <div className="relative">
                <div className="flex items-center gap-2 mb-5">
                  <ExternalLink size={16} className="text-purple-400" />
                  <h3 className="text-white font-semibold">Bağlı Aktif Platformlar</h3>
                </div>
                <div className="space-y-3">
                  {activePlatforms.map(p => {
                    const conf = PLATFORM_CONF[p]
                    const t = PLATFORM_THEME[p] || { bg: 'bg-gray-500/10', border: 'border-gray-500/20', text: 'text-gray-400' }
                    const count = (messages?.byPlatform || []).find((bp: any) => bp.platform === p)?.count || 0
                    return (
                      <div key={p} className={'flex items-center justify-between p-4 rounded-xl border transition-all ' + t.bg + ' ' + t.border}>
                        <div className="flex items-center gap-3">
                          <div className={'w-9 h-9 rounded-lg flex items-center justify-center ' + t.bg + ' ' + t.border}>
                            <PlatformSvg svg={conf.svg} className={'w-6 h-6 ' + t.text} />
                          </div>
                          <div>
                            <p className={'text-sm font-semibold ' + t.text}>{conf.label}</p>
                            <div className="flex items-center gap-1.5 mt-0.5">
                              <CheckCircle size={10} className="text-emerald-400" />
                              <span className="text-xs text-gray-500">Aktif · {count} mesaj</span>
                            </div>
                          </div>
                        </div>
                        <div className={'px-3 py-1 rounded-full text-xs font-semibold ' + t.bg + ' ' + t.text}>
                          {totalMessages > 0 ? Math.round((count / totalMessages) * 100) : 0}%
                        </div>
                      </div>
                    )
                  })}
                  {activePlatforms.length === 0 && (
                    <div className="text-center py-6 text-gray-500 text-sm">Bağlı platform bulunmuyor</div>
                  )}
                </div>
              </div>
            </div>

            {/* Sipariş Durumu */}
            {orders?.total > 0 && (
              <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#0f1420] to-[#0d1117] border border-[#1a2332] p-6">
                <div className="absolute top-0 right-0 w-48 h-48 bg-blue-500/5 rounded-full blur-2xl" />
                <div className="relative">
                  <div className="flex items-center gap-2 mb-5">
                    <ShoppingCart size={16} className="text-blue-400" />
                    <h3 className="text-white font-semibold">Sipariş Durumu</h3>
                  </div>
                  {[
                    { label: 'Bekleyen', value: orders.pending || 0, color: 'bg-amber-500', max: orders.total },
                    { label: 'Tamamlanan', value: orders.completed || 0, color: 'bg-emerald-500', max: orders.total },
                    { label: 'İptal', value: orders.cancelled || 0, color: 'bg-red-500', max: orders.total },
                  ].map((item, i) => (
                    <div key={i} className="mb-4">
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-sm text-gray-400">{item.label}</span>
                        <span className="text-sm text-white font-semibold">{item.value}</span>
                      </div>
                      <div className="h-2.5 bg-[#1a2332] rounded-full overflow-hidden">
                        <div className={'h-full rounded-full transition-all duration-700 ' + item.color} style={{ width: Math.min((item.value / item.max) * 100, 100) + '%' }} />
                      </div>
                    </div>
                  ))}
                  <div className="mt-5 pt-4 border-t border-[#1a2332] grid grid-cols-3 gap-3">
                    {[
                      { label: 'Bu Hafta', val: orders.weeklyCount || 0 },
                      { label: 'Bu Ay', val: orders.monthlyCount || 0 },
                      { label: 'Bugün', val: orders.todayCount || 0 },
                    ].map((item, i) => (
                      <div key={i} className="text-center">
                        <p className="text-xs text-gray-600">{item.label}</p>
                        <p className="text-lg font-bold text-white">{item.val}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}
