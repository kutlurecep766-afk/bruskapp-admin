'use client'
import { useState, useEffect } from 'react'
import { Store, Coins, Gift, Sparkles, RotateCcw, Bell, AlertCircle, MessageSquare, BarChart3, Calendar, Activity, Timer } from 'lucide-react'

function WheelIcon({ size = 24, className = '', animate = false }) {
  const animStyle = animate ? { animation: 'spSp 6s linear infinite', transformOrigin: 'center' } : {}
  return (
    <svg width={size} height={size} viewBox="0 0 26 26" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className} style={animStyle}>
      <style>{'@keyframes spSp{to{transform:rotate(360deg)}}'}</style>
      <circle cx="13" cy="13" r="11" opacity="0.25" />
      <circle cx="13" cy="13" r="8" opacity="0.4" strokeWidth="1" strokeDasharray="2 3" />
      <circle cx="13" cy="13" r="11" opacity="0.9" />
      <line x1="13" y1="2" x2="13" y2="6" />
      <line x1="13" y1="20" x2="13" y2="24" />
      <line x1="2" y1="13" x2="6" y2="13" />
      <line x1="20" y1="13" x2="24" y2="13" />
      <line x1="4.8" y1="4.8" x2="7.8" y2="7.8" />
      <line x1="18.2" y1="18.2" x2="21.2" y2="21.2" />
      <line x1="4.8" y1="21.2" x2="7.8" y2="18.2" />
      <line x1="18.2" y1="7.8" x2="21.2" y2="4.8" />
      <circle cx="13" cy="13" r="3.5" strokeWidth="1.5" fill="currentColor" fillOpacity="0.15" />
      <circle cx="13" cy="13" r="1.5" fill="currentColor" />
    </svg>
  )
}

export default function DashboardPage() {
  const [tenant, setTenant] = useState<any>(null)
  const [creditUsage, setCreditUsage] = useState<any>(null)
  const [wheelData, setWheelData] = useState<any>(null)
  const [notifications, setNotifications] = useState<any[]>([])
  const [stats, setStats] = useState<any>(null)
  const [unreadNotif, setUnreadNotif] = useState(0)
  const [spinning, setSpinning] = useState(false)
  const [spinResult, setSpinResult] = useState<number | null>(null)
  const [wheelAngle, setWheelAngle] = useState(0)
  const [loading, setLoading] = useState(true)
  const [countdown, setCountdown] = useState('')

  useEffect(() => {
    async function load() {
      try {
        const [tenantRes, usageRes, wheelRes, notifRes, statsRes] = await Promise.all([
          fetch('/api/tenants/me', { credentials: 'include' }),
          fetch('/api/tenant/messages/usage', { credentials: 'include' }),
          fetch('/api/tenant/weekly-wheel', { credentials: 'include' }),
          fetch('/api/tenant/notifications', { credentials: 'include' }),
          fetch('/api/tenant/messages/stats', { credentials: 'include' }),
        ])
        if (tenantRes.ok) setTenant(await tenantRes.json())
        if (usageRes.ok) setCreditUsage(await usageRes.json())
        if (wheelRes.ok) setWheelData(await wheelRes.json())
        if (notifRes.ok) { const n = await notifRes.json(); setNotifications(n); setUnreadNotif(n.filter((x: any) => !x.read).length) }
        if (statsRes.ok) setStats(await statsRes.json())
      } catch {} finally { setLoading(false) }
    }
    load()
    const interval = setInterval(async () => {
      const [usageRes, statsRes] = await Promise.all([
        fetch('/api/tenant/messages/usage', { credentials: 'include' }),
        fetch('/api/tenant/messages/stats', { credentials: 'include' }),
      ])
      if (usageRes.ok) setCreditUsage(await usageRes.json())
      if (statsRes.ok) setStats(await statsRes.json())
    }, 5000)
    return () => clearInterval(interval)
  }, [])

  const refreshWheel = async () => {
    try {
      const res = await fetch('/api/tenant/weekly-wheel', { credentials: 'include' })
      if (res.ok) setWheelData(await res.json())
    } catch {}
  }

  useEffect(() => {
    if (!wheelData?.nextAvailableAt || wheelData?.hasActive) return
    const interval = setInterval(() => {
      const now = new Date().getTime()
      const target = new Date(wheelData.nextAvailableAt).getTime()
      const diff = target - now
      if (diff <= 0) {
        setCountdown('')
        clearInterval(interval)
        refreshWheel()
        return
      }
      const days = Math.floor(diff / (1000 * 60 * 60 * 24))
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
      const seconds = Math.floor((diff % (1000 * 60)) / 1000)
      if (days > 0) setCountdown(days + ' gün ' + hours + ' saat ' + minutes + ' dk')
      else if (hours > 0) setCountdown(hours + ' saat ' + minutes + ' dk ' + seconds + ' sn')
      else if (minutes > 0) setCountdown(minutes + ' dk ' + seconds + ' sn')
      else setCountdown(seconds + ' sn')
    }, 1000)
    return () => clearInterval(interval)
  }, [wheelData])

  const spinWheel = async () => {
    if (spinning || !wheelData?.hasActive) return
    setSpinning(true)
    setSpinResult(null)
    const targetSegment = Math.floor(Math.random() * 5)
    const segmentAngle = 360 / 5
    const spins = 5 + Math.floor(Math.random() * 3)
    const offset = segmentAngle * targetSegment + segmentAngle / 2
    const totalAngle = spins * 360 + (360 - offset)
    setWheelAngle(prev => prev + totalAngle)
    try {
      const res = await fetch('/api/tenant/weekly-wheel/spin', { method: 'POST', credentials: 'include' })
      if (res.ok) {
        const data = await res.json()
        setTimeout(() => {
          setSpinResult(data.result)
          setSpinning(false)
          setWheelData((prev: any) => prev ? { ...prev, hasActive: false, nextAvailableAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() } : prev)
          setCreditUsage((prev: any) => prev ? { ...prev, messageCredit: data.totalCredits } : prev)
        }, 2500)
      } else setSpinning(false)
    } catch { setSpinning(false) }
  }

  const markNotifRead = async (id: number) => {
    try {
      await fetch('/api/tenant/notifications/' + id + '/read', { method: 'POST', credentials: 'include' })
      setNotifications((prev: any[]) => prev.map(n => n.id === id ? { ...n, read: true } : n))
      setUnreadNotif((prev: number) => Math.max(0, prev - 1))
    } catch {}
  }

  const WHEEL_SEGMENTS = [
    { value: 100, color: '#6366f1', label: '100' },
    { value: 250, color: '#8b5cf6', label: '250' },
    { value: 500, color: '#a855f7', label: '500' },
    { value: 750, color: '#d946ef', label: '750' },
    { value: 1000, color: '#ec4899', label: '1000' },
  ]

  const typeIcons: any = { credit: <Coins size={14} className="text-emerald-400" />, warning: <AlertCircle size={14} className="text-amber-400" />, error: <AlertCircle size={14} className="text-red-400" />, wheel: <Gift size={14} className="text-purple-400" /> }

  if (loading) return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" /></div>

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#0f1420] via-[#0d1117] to-[#0a0e14] border border-[#1a2332] p-8">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500/5 rounded-full blur-3xl" />
        <div className="relative flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/20"><Store size={16} /></div>
              <h1 className="text-xl font-bold text-white">{tenant?.name || 'İşletme'}</h1>
            </div>
            <p className="text-sm text-gray-500">Dashboard</p>
          </div>
          {creditUsage && (
            <div className="flex items-center gap-3 bg-[#080b12]/60 border border-[#1a2332] rounded-2xl px-5 py-3">
              <Coins size={18} className="text-emerald-400" />
              <div>
                <p className="text-2xl font-bold text-emerald-400 tracking-tight">{creditUsage.messageCredit}</p>
                <p className="text-[10px] text-gray-600 uppercase tracking-wider">Kalan Kredi</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Spin Result Banner */}
      {spinResult && (
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-emerald-600/20 via-emerald-500/10 to-transparent border border-emerald-500/30 p-6 text-center">
          <div className="absolute inset-0 bg-gradient-to-t from-emerald-500/10 to-transparent opacity-50" />
          <Sparkles size={36} className="mx-auto text-emerald-400 mb-2 relative" />
          <h3 className="text-white text-lg font-bold relative">Tebrikler!</h3>
          <p className="text-emerald-400 text-4xl font-bold mt-1 relative">+{spinResult} Mesaj Kredisi</p>
          <p className="text-gray-500 text-sm mt-2 relative">Hesabınıza eklendi</p>
          <button onClick={() => setSpinResult(null)} className="mt-4 px-4 py-1.5 bg-white/5 border border-white/10 text-gray-400 rounded-full text-xs hover:text-white transition-all relative">Kapat</button>
        </div>
      )}

      {/* Uyarı Bannerları */}
      {creditUsage?.messageCredit === 0 && (
        <div className="flex items-start gap-4 p-5 rounded-2xl bg-red-500/5 border border-red-500/20">
          <div className="w-10 h-10 rounded-xl bg-red-500/20 flex items-center justify-center flex-shrink-0"><AlertCircle size={20} className="text-red-400" /></div>
          <div>
            <h3 className="text-white font-semibold text-sm">Mesaj Krediniz Tükendi</h3>
            <p className="text-red-400/80 text-xs mt-1">Yeni mesajlara yanıt verilmeyecektir. Yöneticinizle iletişime geçin.</p>
          </div>
        </div>
      )}
      {creditUsage?.messageCredit > 0 && creditUsage?.messageCredit <= 50 && (
        <div className="flex items-start gap-4 p-5 rounded-2xl bg-amber-500/5 border border-amber-500/20">
          <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center flex-shrink-0"><AlertCircle size={20} className="text-amber-400" /></div>
          <div>
            <h3 className="text-white font-semibold text-sm">Mesaj Krediniz Azalıyor</h3>
            <p className="text-amber-400/80 text-xs mt-1">Kalan: <strong>{creditUsage.messageCredit}</strong> kredi. Bittiğinde mesajlaşma duracaktır.</p>
          </div>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#0f1420] to-[#0d1117] border border-[#1a2332] p-6 transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] hover:border-blue-500/30">
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full blur-2xl transition-all duration-700 group-hover:bg-blue-500/10" />
          <div className="relative">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center mb-4"><Calendar size={18} className="text-blue-400" /></div>
            <p className="text-3xl font-bold text-white tracking-tight">{stats ? stats.todayIn + stats.todayOut : '-'}</p>
            <p className="text-xs text-gray-500 mt-1 uppercase tracking-wider">Bugün</p>
          </div>
        </div>
        <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#0f1420] to-[#0d1117] border border-[#1a2332] p-6 transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] hover:border-purple-500/30">
          <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/5 rounded-full blur-2xl transition-all duration-700 group-hover:bg-purple-500/10" />
          <div className="relative">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center mb-4"><Activity size={18} className="text-purple-400" /></div>
            <p className="text-3xl font-bold text-white tracking-tight">{stats ? stats.weekIn + stats.weekOut : '-'}</p>
            <p className="text-xs text-gray-500 mt-1 uppercase tracking-wider">Bu Hafta</p>
          </div>
        </div>
        <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#0f1420] to-[#0d1117] border border-[#1a2332] p-6 transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] hover:border-emerald-500/30">
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-2xl transition-all duration-700 group-hover:bg-emerald-500/10" />
          <div className="relative">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mb-4"><MessageSquare size={18} className="text-emerald-400" /></div>
            <p className="text-3xl font-bold text-white tracking-tight">{stats ? stats.monthIn + stats.monthOut : '-'}</p>
            <p className="text-xs text-gray-500 mt-1 uppercase tracking-wider">Bu Ay</p>
          </div>
        </div>
      </div>

      {/* Bento Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Haftalık Çark */}
        <div className="lg:col-span-2 relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#0f1420] to-[#0d1117] border border-[#1a2332] p-8">
          <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/5 rounded-full blur-3xl" />
          <div className="relative">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-purple-500/20"><WheelIcon size={20} animate={true} /></div>
              <div>
                <h2 className="text-white font-semibold">Haftalık Çark</h2>
                <p className="text-xs text-gray-500">Her 7 günde 1 kez çevirebilirsiniz</p>
              </div>
            </div>

            {wheelData?.hasActive ? (
              <div className="flex flex-col lg:flex-row items-center gap-10">
                <div className="relative w-64 h-64 flex-shrink-0">
                  {/* Işıltılı dış katman */}
                  <div className="absolute -inset-4 rounded-full bg-gradient-to-br from-fuchsia-500/30 via-purple-500/20 to-indigo-500/30 blur-3xl animate-pulse" />
                  {/* Premium dönen halka - gradient akışı */}
                  <div className="absolute -inset-2 rounded-full" style={{ background: 'conic-gradient(from var(--angle, 0deg), #e879f9, #818cf8, #a855f7, #c084fc, #e879f9)', animation: 'spSp 3s linear infinite', padding: '3px', WebkitMask: 'radial-gradient(farthest-side, transparent calc(100% - 3px), #fff calc(100% - 3px))', mask: 'radial-gradient(farthest-side, transparent calc(100% - 3px), #fff calc(100% - 3px))' }} />
                  {/* Parlak dış çember */}
                  <div className="absolute -inset-1 rounded-full border-2 border-white/20 shadow-[0_0_30px_rgba(168,85,247,0.3)]" />
                  {/* Ampuller */}
                  {Array.from({ length: 16 }).map((_, i) => {
                    const a = (i * 360) / 16
                    const rad = (a - 90) * Math.PI / 180
                    const colors = ['#e879f9', '#818cf8', '#a855f7', '#f472b6']
                    return (
                      <div key={i} className="absolute w-2 h-2 rounded-full z-10" style={{
                        top: (50 + 47 * Math.sin(rad)) + '%',
                        left: (50 + 47 * Math.cos(rad)) + '%',
                        background: colors[i % 4],
                        boxShadow: '0 0 6px ' + colors[i % 4] + ', 0 0 12px ' + colors[i % 4] + '80',
                      }} />
                    )
                  })}
                  {/* Çark */}
                  <div className="absolute inset-1 rounded-full overflow-hidden shadow-2xl ring-2 ring-white/10" style={{ transform: 'rotate(' + wheelAngle + 'deg)', transition: 'transform 3000ms cubic-bezier(0.17,0.67,0.12,0.99)' }}>
                    <div className="w-full h-full" style={{
                      background: [
                        'conic-gradient(',
                        '#ff1493 0deg 72deg,',
                        '#ff6b00 72deg 144deg,',
                        '#ffd700 144deg 216deg,',
                        '#00e676 216deg 288deg,',
                        '#00b0ff 288deg 360deg',
                      ].join(''),
                    }}>
                      {[
                        { val: '100 Mesaj', short: '100', emoji: '💰' },
                        { val: '250 Mesaj', short: '250', emoji: '💎' },
                        { val: '500 Mesaj', short: '500', emoji: '🚀' },
                        { val: '750 Mesaj', short: '750', emoji: '👑' },
                        { val: '1000 Mesaj', short: '1000', emoji: '🏆' },
                      ].map((item, i) => {
                        const angle = i * 72 + 36
                        const rad = (angle - 90) * Math.PI / 180
                        return (
                          <div key={item.short} className="absolute flex flex-col items-center" style={{
                            top: (50 + 33 * Math.sin(rad)) + '%',
                            left: (50 + 33 * Math.cos(rad)) + '%',
                            transform: 'translate(-50%, -50%)',
                          }}>
                            <span style={{ fontSize: '24px', lineHeight: 1.2, filter: 'drop-shadow(0 2px 6px rgba(0,0,0,0.7))' }}>{item.emoji}</span>
                            <span className="text-white text-xs font-bold mt-0.5 whitespace-nowrap" style={{ textShadow: '0 2px 8px rgba(0,0,0,0.9), 0 0 20px rgba(0,0,0,0.5)' }}>{item.val}</span>
                          </div>
                        )
                      })}
                    </div>
                    {/* Merkez göbek - premium */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#1a1a2e] to-[#0d1117] border-[3px] border-white/30 flex items-center justify-center shadow-2xl shadow-purple-500/40">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-fuchsia-500 via-purple-500 to-indigo-500 flex items-center justify-center shadow-inner animate-pulse" style={{ animationDuration: '3s' }}>
                          <span style={{ fontSize: '20px' }}>🎯</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  {/* Ok */}
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center" style={{ filter: 'drop-shadow(0 0 15px rgba(236,72,153,0.9))' }}>
                    <div className="w-3 h-6 rounded-t-full bg-gradient-to-b from-fuchsia-300 to-fuchsia-500 blur-[1px] -mb-1" />
                    <div className="w-0 h-0 border-l-[16px] border-r-[16px] border-t-[26px] border-l-transparent border-r-transparent border-t-fuchsia-400" style={{ filter: 'drop-shadow(0 4px 12px rgba(236,72,153,0.6))' }} />
                    <div className="w-1.5 h-4 bg-gradient-to-b from-fuchsia-400 to-purple-600 rounded-full blur-sm -mt-1" />
                  </div>
                </div>
                <div className="flex flex-col items-center lg:items-start gap-4">
                  <p className="text-gray-400 text-sm text-center lg:text-left">Kazanabileceğiniz ödüller:</p>
                  <div className="flex flex-wrap gap-2">
                    {[
                      { emoji: '💰', val: '100' },
                      { emoji: '💎', val: '250' },
                      { emoji: '🚀', val: '500' },
                      { emoji: '👑', val: '750' },
                      { emoji: '🏆', val: '1000' },
                    ].map(item => (
                      <span key={item.val} className="inline-flex items-center gap-1 px-3 py-1.5 bg-white/5 border border-white/10 rounded-full text-xs text-white font-medium">
                        <span>{item.emoji}</span>
                        <span>{item.val} Mesaj</span>
                      </span>
                    ))}
                  </div>
                  <button onClick={spinWheel} disabled={spinning}
                    className="group relative px-8 py-3 bg-gradient-to-r from-fuchsia-600 to-purple-500 text-white rounded-full text-sm font-semibold hover:shadow-lg hover:shadow-fuchsia-500/25 transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] disabled:opacity-50 flex items-center gap-2 active:scale-[0.98]">
                    {spinning ? <RotateCcw size={18} className="animate-spin" /> : <Sparkles size={18} />}
                    {spinning ? 'Çevriliyor...' : 'Çarkı Çevir'}
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center py-4">
                <div className="relative w-60 h-60 flex-shrink-0 mb-4">
                  <div className="absolute -inset-3 rounded-full bg-purple-500/10 blur-2xl" />
                  <div className="absolute -inset-2 rounded-full border border-white/5" style={{ background: 'conic-gradient(from var(--angle, 0deg), rgba(168,85,247,0.2), rgba(129,140,248,0.2), rgba(168,85,247,0.2))', animation: 'spSp 4s linear infinite', padding: '2px', WebkitMask: 'radial-gradient(farthest-side, transparent calc(100% - 2px), #fff calc(100% - 2px))', mask: 'radial-gradient(farthest-side, transparent calc(100% - 2px), #fff calc(100% - 2px))' }} />
                  <div className="absolute inset-0 rounded-full overflow-hidden opacity-25" style={{ animation: 'spSp 30s linear infinite' }}>
                    <div className="w-full h-full" style={{
                      background: 'conic-gradient(#ff1493 0deg 72deg, #ff6b00 72deg 144deg, #ffd700 144deg 216deg, #00e676 216deg 288deg, #00b0ff 288deg 360deg)',
                    }}>
                      {[
                        { val: '100 Mesaj', short: '100', emoji: '💰' },
                        { val: '250 Mesaj', short: '250', emoji: '💎' },
                        { val: '500 Mesaj', short: '500', emoji: '🚀' },
                        { val: '750 Mesaj', short: '750', emoji: '👑' },
                        { val: '1000 Mesaj', short: '1000', emoji: '🏆' },
                      ].map((item, i) => {
                        const angle = i * 72 + 36
                        const rad = (angle - 90) * Math.PI / 180
                        return (
                          <div key={item.short} className="absolute flex flex-col items-center" style={{
                            top: (50 + 33 * Math.sin(rad)) + '%',
                            left: (50 + 33 * Math.cos(rad)) + '%',
                            transform: 'translate(-50%, -50%)',
                          }}>
                            <span style={{ fontSize: '18px', lineHeight: 1 }}>{item.emoji}</span>
                            <span className="text-white/60 text-[10px] font-bold mt-0.5 whitespace-nowrap">{item.val}</span>
                          </div>
                        )
                      })}
                    </div>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-14 h-14 rounded-full bg-[#0d1117]/80 border border-white/5 flex items-center justify-center">
                        <span style={{ fontSize: '18px' }}>🎯</span>
                      </div>
                    </div>
                  </div>
                  <div className="absolute -top-1 left-1/2 -translate-x-1/2 z-20">
                    <div className="w-0 h-0 border-l-[10px] border-r-[10px] border-t-[16px] border-l-transparent border-r-transparent border-t-white/20" />
                  </div>
                </div>
                <p className="text-gray-500 text-sm">Şu an aktif çark bulunmuyor</p>
                {countdown ? (
                  <div className="flex items-center gap-2 mt-2 px-4 py-2 bg-gradient-to-r from-purple-500/10 to-fuchsia-500/10 border border-purple-500/20 rounded-full">
                    <Timer size={14} className="text-purple-400" />
                    <span className="text-purple-400 text-sm font-medium">{countdown}</span>
                  </div>
                ) : (
                  <p className="text-gray-600 text-xs mt-2">Son çarkınızın üzerinden 7 gün geçmeden yeni çark oluşmaz</p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-5">
          {/* Kredi Kullanımı */}
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#0f1420] to-[#0d1117] border border-[#1a2332] p-6">
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-2xl" />
            <div className="relative">
              <div className="flex items-center gap-2 mb-4">
                <Coins size={16} className="text-emerald-400" />
                <h3 className="text-white text-sm font-semibold">Kredi Kullanımı</h3>
              </div>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-500">Kalan</span>
                    <span className="text-emerald-400 font-bold">{creditUsage?.messageCredit || 0}</span>
                  </div>
                  <div className="h-2 bg-[#1a2332] rounded-full overflow-hidden">
                    <div className="h-full rounded-full bg-gradient-to-r from-emerald-600 to-emerald-400 transition-all duration-700" style={{ width: creditUsage?.monthlyLimit > 0 ? Math.min(100, (creditUsage.messageCredit / 1000 * 100)) + '%' : '0%' }} />
                  </div>
                </div>
                {creditUsage?.monthlyLimit > 0 && (
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-500">Aylık Kullanım</span>
                      <span className="text-white font-medium">{creditUsage.monthlyUsed} / {creditUsage.monthlyLimit}</span>
                    </div>
                    <div className="h-2 bg-[#1a2332] rounded-full overflow-hidden">
                      <div className="h-full rounded-full bg-gradient-to-r from-blue-600 to-blue-400 transition-all duration-700" style={{ width: Math.min(100, (creditUsage.monthlyUsed / creditUsage.monthlyLimit * 100)) + '%' }} />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Bildirimler */}
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#0f1420] to-[#0d1117] border border-[#1a2332] p-6">
            <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full blur-2xl" />
            <div className="relative">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Bell size={16} className="text-amber-400" />
                  <h3 className="text-white text-sm font-semibold">Bildirimler</h3>
                </div>
                {unreadNotif > 0 && <span className="px-2 py-0.5 bg-amber-500/10 text-amber-400 rounded-full text-[10px] border border-amber-500/20 font-medium">{unreadNotif}</span>}
              </div>
              {notifications.length > 0 ? (
                <div className="space-y-1.5 max-h-[280px] overflow-y-auto scrollbar-thin">
                  {notifications.slice(0, 8).map((n: any) => (
                    <div key={n.id} className={'flex items-start gap-3 p-3 rounded-xl transition-all duration-300 ' + (n.read ? 'opacity-50' : 'bg-white/[0.02]')}>
                      <div className="flex-shrink-0 mt-0.5">{typeIcons[n.type] || <Bell size={14} className="text-gray-500" />}</div>
                      <div className="flex-1 min-w-0">
                        <p className={'text-xs ' + (n.read ? 'text-gray-600' : 'text-gray-300')}>{n.title}</p>
                        <p className="text-[10px] text-gray-700 mt-0.5">{n.message}</p>
                        <p className="text-[9px] text-gray-800 mt-0.5">{new Date(n.createdAt).toLocaleDateString('tr-TR') + ' ' + new Date(n.createdAt).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}</p>
                      </div>
                      {!n.read && <button onClick={() => markNotifRead(n.id)} className="text-[10px] text-blue-400/70 hover:text-blue-300 px-2 py-1 rounded-lg hover:bg-blue-500/10 transition-all flex-shrink-0">Okundu</button>}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6">
                  <Bell size={24} className="mx-auto text-gray-700 mb-2" />
                  <p className="text-gray-600 text-xs">Bildirim bulunmuyor</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
