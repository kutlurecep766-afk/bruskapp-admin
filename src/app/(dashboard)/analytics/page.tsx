'use client'
import { useState, useEffect } from 'react'
import { ShoppingCart, MessageSquare, Users, TrendingUp, Clock, Send, Settings } from 'lucide-react'

const PLATFORM_COLORS: Record<string, { bg: string; text: string }> = {
  whatsapp: { bg: 'bg-green-500/20', text: 'text-green-400' },
  instagram: { bg: 'bg-pink-500/20', text: 'text-pink-400' },
  telegram: { bg: 'bg-sky-500/20', text: 'text-sky-400' },
  messenger: { bg: 'bg-blue-500/20', text: 'text-blue-400' },
  webchat: { bg: 'bg-emerald-500/20', text: 'text-emerald-400' },
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
    fetch('/api/analytics/dashboard', { credentials: 'include' })
      .then(r => r.ok ? r.json() : null)
      .then(d => { if (d) setData(d); setLoading(false) })
      .catch(() => setLoading(false))
    fetch('/api/notifications/telegram-config', { credentials: 'include' })
      .then(r => r.ok ? r.json() : null)
      .then(d => { if (d) setScheduleEnabled(d.enabled) })
      .catch(() => {})
  }, [])

  const sendReport = async () => {
    setReportSending(true)
    setReportResult('')
    try {
      const res = await fetch('/api/analytics/report', { method: 'POST', credentials: 'include' })
      const json = await res.json()
      setReportResult(json.message || (json.success ? 'Rapor gönderildi' : 'Gönderilemedi'))
    } catch { setReportResult('Bağlantı hatası') }
    setReportSending(false)
  }

  if (loading) {
    return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" /></div>
  }

  const orders = data?.orders
  const messages = data?.messages
  const customers = data?.customers
  const totalPlatformMessages = messages?.byPlatform?.reduce((a: number, b: any) => a + b.count, 0) || 0

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Analitik</h1>
          <p className="text-sm text-gray-500 mt-1">İşletme performansı ve istatistikler</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setShowSchedule(!showSchedule)} className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium bg-[#1a2332] text-gray-400 hover:text-white border border-[#2a3a4a] transition-all">
            <Settings size={14} /> Planlı Gönderim
          </button>
          <button onClick={sendReport} disabled={reportSending} className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium bg-blue-500/10 text-blue-400 hover:text-blue-300 border border-blue-500/20 transition-all disabled:opacity-50">
            <Send size={14} /> {reportSending ? 'Gönderiliyor...' : 'Raporu Gönder'}
          </button>
        </div>
      </div>

      {showSchedule && (
        <div className="bg-[#0d1117]/80 backdrop-blur-xl border border-[#1a2332] rounded-2xl p-4">
          <div className="flex items-center gap-3">
            <Clock size={16} className="text-gray-500" />
            <span className="text-sm text-gray-400">Otomatik rapor gönderimi</span>
            <input type="time" value={scheduleTime} onChange={e => setScheduleTime(e.target.value)} className="bg-[#1a2332] border border-[#2a3a4a] rounded-lg px-2 py-1 text-sm text-white" />
            <button onClick={() => setScheduleEnabled(!scheduleEnabled)}
              className={'relative inline-flex h-5 w-9 items-center rounded-full transition-all ' + (scheduleEnabled ? 'bg-blue-500' : 'bg-gray-600')}>
              <span className={'inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-all ' + (scheduleEnabled ? 'translate-x-4.5' : 'translate-x-1')} />
            </button>
            <span className="text-xs text-gray-500">{scheduleEnabled ? 'Aktif - Her gün ' + scheduleTime : 'Kapalı'}</span>
            {scheduleEnabled && <span className="text-xs text-gray-600">(henüz backend cron yok)</span>}
          </div>
        </div>
      )}

      {reportResult && (
        <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl px-4 py-2 text-sm text-blue-300">{reportResult}</div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-[#0d1117]/80 backdrop-blur-xl border border-[#1a2332] rounded-2xl p-5">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center"><ShoppingCart size={18} className="text-blue-400" /></div>
            <p className="text-xs text-gray-500 uppercase">Toplam Sipariş</p>
          </div>
          <p className="text-2xl font-bold text-white">{orders?.total || 0}</p>
          <p className="text-xs text-gray-600 mt-1">Bu ay {orders?.monthlyCount || 0} sipariş</p>
        </div>
        <div className="bg-[#0d1117]/80 backdrop-blur-xl border border-[#1a2332] rounded-2xl p-5">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center"><MessageSquare size={18} className="text-emerald-400" /></div>
            <p className="text-xs text-gray-500 uppercase">Toplam Mesaj</p>
          </div>
          <p className="text-2xl font-bold text-white">{messages?.total || 0}</p>
          <p className="text-xs text-gray-600 mt-1">Bugün {messages?.todayCount || 0} mesaj</p>
        </div>
        <div className="bg-[#0d1117]/80 backdrop-blur-xl border border-[#1a2332] rounded-2xl p-5">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center"><Users size={18} className="text-purple-400" /></div>
            <p className="text-xs text-gray-500 uppercase">Müşteri</p>
          </div>
          <p className="text-2xl font-bold text-white">{customers?.total || 0}</p>
          <p className="text-xs text-gray-600 mt-1">Bu ay +{customers?.newThisMonth || 0} yeni</p>
        </div>
        <div className="bg-[#0d1117]/80 backdrop-blur-xl border border-[#1a2332] rounded-2xl p-5">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center"><TrendingUp size={18} className="text-amber-400" /></div>
            <p className="text-xs text-gray-500 uppercase">Toplam Gelir</p>
          </div>
          <p className="text-2xl font-bold text-white">{orders?.totalRevenue?.toLocaleString('tr-TR') || '0'} ₺</p>
          <p className="text-xs text-gray-600 mt-1">Tüm siparişlerden</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-[#0d1117]/80 backdrop-blur-xl border border-[#1a2332] rounded-2xl p-6">
          <h3 className="text-white font-semibold mb-4">Sipariş Durumu</h3>
          <div className="space-y-3">
            {[
              { label: 'Bekleyen', value: orders?.pending || 0, color: 'bg-amber-500', max: orders?.total || 1 },
              { label: 'Tamamlanan', value: orders?.completed || 0, color: 'bg-emerald-500', max: orders?.total || 1 },
              { label: 'İptal', value: orders?.cancelled || 0, color: 'bg-red-500', max: orders?.total || 1 },
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
                <span className="text-gray-500">Bugün</span>
                <span className="text-white font-medium">{orders?.todayCount || 0}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-[#0d1117]/80 backdrop-blur-xl border border-[#1a2332] rounded-2xl p-6">
          <h3 className="text-white font-semibold mb-4">Platform Bazında Mesajlar</h3>
          <div className="space-y-3">
            {(messages?.byPlatform?.length > 0 ? messages.byPlatform : []).map((p: any, i: number) => {
              const colors = PLATFORM_COLORS[p.platform] || { bg: 'bg-gray-500/20', text: 'text-gray-400' }
              return (
                <div key={i}>
                  <div className="flex items-center justify-between mb-1">
                    <span className={'text-sm font-medium ' + colors.text}>{p.platform}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-white font-semibold">{p.count}</span>
                      <span className="text-xs text-gray-600">(%{totalPlatformMessages > 0 ? Math.round((p.count / totalPlatformMessages) * 100) : 0})</span>
                    </div>
                  </div>
                  <div className="h-2 bg-[#1a2332] rounded-full overflow-hidden">
                    <div className={'h-full rounded-full ' + colors.bg.replace('/20', '/50')} style={{ width: totalPlatformMessages > 0 ? (p.count / totalPlatformMessages) * 100 + '%' : '0%' }} />
                  </div>
                </div>
              )
            })}
            {(!messages?.byPlatform || messages.byPlatform.length === 0) && (
              <p className="text-sm text-gray-600">Henüz mesaj yok</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
