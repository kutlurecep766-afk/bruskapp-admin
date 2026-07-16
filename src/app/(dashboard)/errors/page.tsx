'use client'
import { useState, useEffect } from 'react'
import { AlertTriangle, CheckCircle, XCircle, RefreshCw, Filter, Eye, EyeOff } from 'lucide-react'

interface ErrorItem {
  id: string
  type: string
  platform: string | null
  title: string
  message: string
  stack: string | null
  metadata: any
  acknowledged: boolean
  tenantId: string | null
  createdAt: string
}

interface ErrorStats {
  total: number
  unacknowledged: number
  last24h: number
  byType: { type: string; count: number }[]
}

const TYPE_COLORS: Record<string, string> = {
  system_error: 'bg-red-500/10 text-red-400 border-red-500/20',
  platform_error: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
  ai_error: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
  security: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
}

const TYPE_LABELS: Record<string, string> = {
  system_error: 'Sistem',
  platform_error: 'Platform',
  ai_error: 'AI',
  security: 'Guvenlik',
}

export default function ErrorsPage() {
  const [errors, setErrors] = useState<ErrorItem[]>([])
  const [stats, setStats] = useState<ErrorStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [filterType, setFilterType] = useState('')
  const [showAcknowledged, setShowAcknowledged] = useState(false)

  const loadErrors = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ limit: '50' })
      if (filterType) params.set('type', filterType)
      if (!showAcknowledged) params.set('acknowledged', 'false')

      const [errRes, statRes] = await Promise.all([
        window.fetch('/api/error-logs?' + params.toString(), { credentials: 'include' }),
        window.fetch('/api/error-logs/stats', { credentials: 'include' }),
      ])
      if (errRes.ok) {
        const data = await errRes.json()
        setErrors(data.errors || [])
      }
      if (statRes.ok) {
        setStats(await statRes.json())
      }
    } catch {} finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadErrors() }, [filterType, showAcknowledged])

  const acknowledge = async (id: string) => {
    await window.fetch('/api/error-logs/' + id + '/acknowledge', { method: 'POST', credentials: 'include' })
    loadErrors()
  }

  const acknowledgeAll = async () => {
    await window.fetch('/api/error-logs/acknowledge-all', { method: 'POST', credentials: 'include' })
    loadErrors()
  }

  const timeAgo = (date: string) => {
    const diff = Date.now() - new Date(date).getTime()
    const mins = Math.floor(diff / 60000)
    if (mins < 1) return 'simdi'
    if (mins < 60) return mins + ' dk'
    const hours = Math.floor(mins / 60)
    if (hours < 24) return hours + ' s'
    return Math.floor(hours / 24) + ' g'
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-red-600/20 border border-red-500/20">
            <AlertTriangle size={22} className="text-red-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Hata Kayitlari</h1>
            <p className="text-gray-400 text-sm">Sistem hatalarini goruntuleyin ve yonetin</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={loadErrors} className="flex items-center gap-2 px-3 py-2 bg-[#1a2332] text-gray-300 rounded-xl text-sm hover:bg-[#1f2a3d] transition-all"><RefreshCw size={15} /> Yenile</button>
          <button onClick={acknowledgeAll} className="flex items-center gap-2 px-3 py-2 bg-emerald-600/20 text-emerald-400 rounded-xl text-sm hover:bg-emerald-600/30 transition-all"><CheckCircle size={15} /> Tumunu Onayla</button>
        </div>
      </div>

      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="glass rounded-2xl border border-[#1a2332] p-4">
            <p className="text-gray-500 text-xs mb-1">Toplam</p>
            <p className="text-2xl font-bold text-white">{stats.total}</p>
          </div>
          <div className="glass rounded-2xl border border-[#1a2332] p-4">
            <p className="text-gray-500 text-xs mb-1">Bekleyen</p>
            <p className="text-2xl font-bold text-yellow-400">{stats.unacknowledged}</p>
          </div>
          <div className="glass rounded-2xl border border-[#1a2332] p-4">
            <p className="text-gray-500 text-xs mb-1">Son 24s</p>
            <p className="text-2xl font-bold text-orange-400">{stats.last24h}</p>
          </div>
          <div className="glass rounded-2xl border border-[#1a2332] p-4">
            <p className="text-gray-500 text-xs mb-1">Tipe Gore</p>
            <div className="flex gap-2 flex-wrap mt-1">
              {stats.byType.map(b => (
                <span key={b.type} className="text-xs px-2 py-0.5 rounded-md bg-[#1a2332] text-gray-300">{TYPE_LABELS[b.type] || b.type}: {b.count}</span>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 bg-[#1a2332] rounded-xl px-3 py-2">
          <Filter size={14} className="text-gray-500" />
          <select value={filterType} onChange={e => setFilterType(e.target.value)} className="bg-transparent text-gray-300 text-sm outline-none">
            <option value="">Tum Tipler</option>
            <option value="system_error">Sistem</option>
            <option value="platform_error">Platform</option>
            <option value="ai_error">AI</option>
            <option value="security">Guvenlik</option>
          </select>
        </div>
        <button onClick={() => setShowAcknowledged(!showAcknowledged)} className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm transition-all ${showAcknowledged ? 'bg-blue-600/20 text-blue-400' : 'bg-[#1a2332] text-gray-400'}`}>
          {showAcknowledged ? <Eye size={15} /> : <EyeOff size={15} />} Onaylananlar
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : errors.length === 0 ? (
        <div className="glass rounded-2xl border border-[#1a2332] p-12 text-center">
          <CheckCircle size={48} className="text-emerald-500/50 mx-auto mb-3" />
          <p className="text-gray-400">Hata kaydi bulunmuyor</p>
        </div>
      ) : (
        <div className="space-y-2">
          {errors.map(err => (
            <div key={err.id} className={`glass rounded-2xl border ${err.acknowledged ? 'border-[#1a2332] opacity-60' : 'border-[#1a2332]'} p-4`}>
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-xs px-2 py-0.5 rounded-md border ${TYPE_COLORS[err.type] || 'bg-gray-500/10 text-gray-400 border-gray-500/20'}`}>
                      {TYPE_LABELS[err.type] || err.type}
                    </span>
                    {err.platform && <span className="text-xs text-gray-500 bg-[#1a2332] px-2 py-0.5 rounded-md">{err.platform}</span>}
                    <span className="text-xs text-gray-600">{timeAgo(err.createdAt)}</span>
                    {!err.acknowledged && <span className="text-xs text-yellow-500">Yeni</span>}
                  </div>
                  <p className="text-white font-medium text-sm">{err.title}</p>
                  <p className="text-gray-400 text-xs mt-1 line-clamp-2">{err.message}</p>
                  {err.stack && (
                    <details className="mt-2">
                      <summary className="text-xs text-gray-500 cursor-pointer hover:text-gray-400">Stack Trace</summary>
                      <pre className="text-xs text-gray-500 mt-1 bg-[#080b12] rounded-lg p-3 overflow-auto max-h-32">{err.stack}</pre>
                    </details>
                  )}
                </div>
                {!err.acknowledged && (
                  <button onClick={() => acknowledge(err.id)} className="flex-shrink-0 p-2 text-gray-500 hover:text-emerald-400 transition-colors" title="Onayla">
                    <CheckCircle size={18} />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
