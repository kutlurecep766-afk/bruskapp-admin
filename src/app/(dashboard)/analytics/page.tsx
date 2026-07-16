'use client'
import { useState, useEffect } from 'react'
import { ShoppingCart, MessageSquare, Users, Send, Settings, Clock } from 'lucide-react'

const PLATFORM_LABELS: Record<string, string> = {
  whatsapp: 'WhatsApp', instagram: 'Instagram', telegram: 'Telegram',
  messenger: 'Messenger', webchat: 'Web Chat', trendyol: 'Trendyol',
  hepsiburada: 'Hepsiburada', n11: 'n11',
}

const PLATFORM_COLORS: Record<string, { bg: string; text: string }> = {
  whatsapp: { bg: 'bg-green-500/20', text: 'text-green-400' },
  instagram: { bg: 'bg-pink-500/20', text: 'text-pink-400' },
  telegram: { bg: 'bg-sky-500/20', text: 'text-sky-400' },
  messenger: { bg: 'bg-blue-500/20', text: 'text-blue-400' },
  webchat: { bg: 'bg-emerald-500/20', text: 'text-emerald-400' },
  trendyol: { bg: 'bg-orange-500/20', text: 'text-orange-400' },
  hepsiburada: { bg: 'bg-purple-500/20', text: 'text-purple-400' },
  n11: { bg: 'bg-rose-500/20', text: 'text-rose-400' },
}

export default function AnalyticsPage() {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [reportSending, setReportSending] = useState(false)
  const [reportResult, setReportResult] = useState('')
  const [showSchedule, setShowSchedule] = useState(false)
  const [scheduleTime, setScheduleTime] = useState('09:00')
  const [scheduleEnabled, setScheduleEnabled] = useState(false)

  useEffect(() => {
    const fetchData = () => {
      fetch('/api/analytics/dashboard', { credentials: 'include' })
        .then(r => r.ok ? r.json() : null)
        .then(d => { if (d) setData(d); setLoading(false) })
        .catch(() => setLoading(false))
    }
    fetchData()
    const interval = setInterval(fetchData, 5000)
    return () => clearInterval(interval)
  }, [])

  const sendReport = async () => {
    setReportSending(true)
    setReportResult('')
    try {
      const res = await fetch('/api/analytics/report', { method: 'POST', credentials: 'include' })
      const json = await res.json()
      setReportResult(json.message || (json.success ? 'Rapor gonderildi' : 'Gonderilemedi'))
    } catch { setReportResult('Baglanti hatasi') }
    setReportSending(false)
  }

  if (loading) {
    return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" /></div>
  }

  const orders = data?.orders
  const messages = data?.messages
  const customers = data?.customers
  const connectedPlatforms: string[] = data?.connectedPlatforms || []
  const hasOrders = orders?.total > 0
  const hasMessages = messages?.total > 0

  const filteredPlatforms = (messages?.byPlatform || []).filter((p: any) =>
    connectedPlatforms.length === 0 || connectedPlatforms.includes(p.platform)
  )
  const totalPlatformMessages = filteredPlatforms.reduce((a: number, b: any) => a + b.count, 0)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Analitik</h1>
          <p className="text-sm text-gray-500 mt-1">İşletme performansı ve istatistikler</p>
        </div>
        <div className="flex gap-2">
          {hasMessages && (
            <button onClick={() => setShowSchedule(!showSchedule)} className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium bg-[#1a2332] text-gray-400 hover:text-white border border-[#2a3a4a] transition-all">
              <Settings size={14} /> Planli Gonderim
            </button>
          )}
          {hasMessages && (
            <button onClick={sendReport} disabled={reportSending} className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium bg-blue-500/10 text-blue-400 hover:text-blue-300 border border-blue-500/20 transition-all disabled:opacity-50">
              <Send size={14} /> {reportSending ? 'Gonderiliyor...' : 'Raporu Gonder'}
            </button>
          )}
        </div>
      </div>

      {showSchedule && (
        <div className="bg-[#0d1117]/80 backdrop-blur-xl border border-[#1a2332] rounded-2xl p-4">
          <div className="flex items-center gap-3">
            <Clock size={16} className="text-gray-500" />
            <span className="text-sm text-gray-400">Otomatik rapor gonderimi</span>
            <input type="time" value={scheduleTime} onChange={e => setScheduleTime(e.target.value)} className="bg-[#1a2332] border border-[#2a3a4a] rounded-lg px-2 py-1 text-sm text-white" />
            <button onClick={() => setScheduleEnabled(!scheduleEnabled)}
              className={'relative inline-flex h-5 w-9 items-center rounded-full transition-all ' + (scheduleEnabled ? 'bg-blue-500' : 'bg-gray-600')}>
              <span className={'inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-all ' + (scheduleEnabled ? 'translate-x-4.5' : 'translate-x-1')} />
            </button>
            <span className="text-xs text-gray-500">{scheduleEnabled ? 'Aktif - Her gun ' + scheduleTime : 'Kapali'}</span>
            {scheduleEnabled && <span className="text-xs text-gray-600">(henuz backend cron yok)</span>}
          </div>
        </div>
      )}

      {reportResult && (
        <div className={'border rounded-xl px-4 py-2 text-sm ' + (reportResult.includes('gonderildi') ? 'bg-blue-500/10 border-blue-500/20 text-blue-300' : 'bg-red-500/10 border-red-500/20 text-red-300')}>{reportResult}</div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {hasOrders && (
          <div className="bg-[#0d1117]/80 backdrop-blur-xl border border-[#1a2332] rounded-2xl p-5">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center"><ShoppingCart size={18} className="text-blue-400" /></div>
              <p className="text-xs text-gray-500 uppercase">Toplam Siparis</p>
            </div>
            <p className="text-2xl font-bold text-white">{orders?.total || 0}</p>
            <p className="text-xs text-gray-600 mt-1">Bu ay {orders?.monthlyCount || 0} siparis</p>
          </div>
        )}
        {hasMessages && (
          <div className="bg-[#0d1117]/80 backdrop-blur-xl border border-[#1a2332] rounded-2xl p-5">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center"><MessageSquare size={18} className="text-emerald-400" /></div>
              <p className="text-xs text-gray-500 uppercase">Toplam Mesaj</p>
            </div>
            <p className="text-2xl font-bold text-white">{messages?.total || 0}</p>
            <p className="text-xs text-gray-600 mt-1">Bugun {messages?.todayCount || 0} mesaj</p>
          </div>
        )}
        <div className="bg-[#0d1117]/80 backdrop-blur-xl border border-[#1a2332] rounded-2xl p-5">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center"><Users size={18} className="text-purple-400" /></div>
            <p className="text-xs text-gray-500 uppercase">Musteri</p>
          </div>
          <p className="text-2xl font-bold text-white">{customers?.total || 0}</p>
          <p className="text-xs text-gray-600 mt-1">Bu ay +{customers?.newThisMonth || 0} yeni</p>
        </div>
      </div>

      {hasOrders && (
        <div className="bg-[#0d1117]/80 backdrop-blur-xl border border-[#1a2332] rounded-2xl p-6">
          <h3 className="text-white font-semibold mb-4">Siparis Durumu</h3>
          <div className="space-y-3">
            {[
              { label: 'Bekleyen', value: orders?.pending || 0, color: 'bg-amber-500', max: orders?.total || 1 },
              { label: 'Tamamlanan', value: orders?.completed || 0, color: 'bg-emerald-500', max: orders?.total || 1 },
              { label: 'Iptal', value: orders?.cancelled || 0, color: 'bg-red-500', max: orders?.total || 1 },
            ].map((item, i) => (
              <div key={i}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm text-gray-400">{item.label}</span>
                  <span className="text-sm text-white font-semibold">{item.value}</span>
                </div>
                <div className="h-2 bg-[#1a2332] rounded-full overflow-hidden">
                  <div className={'h-full rounded-full ' + item.color} style={{ width: Math.min((item.value / item.max) * 100, 100) + '%' }} />
                </div>
              </div>
            ))}
            <div className="pt-2 border-t border-[#1a2332]">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">Bu hafta</span>
                <span className="text-white font-medium">{orders?.weeklyCount || 0}</span>
              </div>
              <div className="flex items-center justify-between text-sm mt-1">
                <span className="text-gray-500">Bu ay</span>
                <span className="text-white font-medium">{orders?.monthlyCount || 0}</span>
              </div>
              <div className="flex items-center justify-between text-sm mt-1">
                <span className="text-gray-500">Bugun</span>
                <span className="text-white font-medium">{orders?.todayCount || 0}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {hasMessages && filteredPlatforms.length > 0 && (
        <div className="bg-[#0d1117]/80 backdrop-blur-xl border border-[#1a2332] rounded-2xl p-6">
          <h3 className="text-white font-semibold mb-4">Platform Bazinda Mesajlar</h3>
          {(connectedPlatforms.length > 0 ? connectedPlatforms : filteredPlatforms.map((p: any) => p.platform)).map((platform: string) => {
            const msgData = filteredPlatforms.find((p: any) => p.platform === platform)
            const count = msgData?.count || 0
            const colors = PLATFORM_COLORS[platform] || { bg: 'bg-gray-500/20', text: 'text-gray-400' }
            const maxCount = Math.max(...filteredPlatforms.map((p: any) => p.count), 1)
            return (
              <div key={platform} className="mb-3">
                <div className="flex items-center justify-between mb-1">
                  <span className={'text-sm font-medium ' + colors.text}>{PLATFORM_LABELS[platform] || platform}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-white font-semibold">{count}</span>
                    <span className="text-xs text-gray-600">(%{totalPlatformMessages > 0 ? Math.round((count / totalPlatformMessages) * 100) : 0})</span>
                  </div>
                </div>
                <div className="h-2 bg-[#1a2332] rounded-full overflow-hidden">
                  <div className={'h-full rounded-full ' + colors.bg.replace('/20', '/50')} style={{ width: (count / maxCount) * 100 + '%' }} />
                </div>
              </div>
            )
          })}
        </div>
      )}

      {!hasOrders && !hasMessages && (
        <div className="bg-[#0d1117]/80 backdrop-blur-xl border border-[#1a2332] rounded-2xl p-8 text-center">
          <p className="text-gray-500">Henuz yeterli veri yok. Siparis ve mesaj gelmeye baslayinca istatistikler burada gorunecek.</p>
        </div>
      )}
    </div>
  )
}
