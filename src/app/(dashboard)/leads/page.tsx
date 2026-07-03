'use client'
import { useState, useEffect, useCallback } from 'react'
import { Users, Phone, MessageCircle, ChevronDown, ChevronUp, Search, RefreshCw, Activity } from 'lucide-react'

interface Lead {
  id: number
  sessionId: string
  name: string
  phone: string
  email: string
  needs: string
  status: string
  notes: string
  conversation: any[]
  source: string
  createdAt: string
}

export default function LeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([])
  const [loading, setLoading] = useState(true)
  const [expandedId, setExpandedId] = useState<number | null>(null)
  const [search, setSearch] = useState('')
  const [stats, setStats] = useState<any>(null)

  const fetchLeads = useCallback(async () => {
    try {
      const res = await fetch('/api/leads', { credentials: 'include' })
      if (res.ok) setLeads(await res.json())
      const s = await fetch('/api/leads/stats', { credentials: 'include' })
      if (s.ok) setStats(await s.json())
    } catch {} finally { setLoading(false) }
  }, [])

  useEffect(() => { fetchLeads() }, [fetchLeads])

  // Auto-refresh every 5 seconds
  useEffect(() => {
    const interval = setInterval(fetchLeads, 5000)
    return () => clearInterval(interval)
  }, [fetchLeads])

  const updateStatus = async (id: number, status: string) => {
    try {
      await fetch(`/api/leads/${id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ status }),
      })
      fetchLeads()
    } catch {}
  }

  const filtered = leads.filter(l =>
    l.name.toLowerCase().includes(search.toLowerCase()) ||
    l.phone.includes(search) ||
    l.needs.toLowerCase().includes(search.toLowerCase())
  )

  const statusColor = (s: string) => {
    switch (s) {
      case 'yeni': return 'bg-blue-500/10 text-blue-400 border-blue-500/20'
      case 'contacted': return 'bg-amber-500/10 text-amber-400 border-amber-500/20'
      case 'converted': return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
      case 'lost': return 'bg-red-500/10 text-red-400 border-red-500/20'
      default: return 'bg-gray-500/10 text-gray-400 border-gray-500/20'
    }
  }

  const statusLabel = (s: string) => {
    switch (s) {
      case 'yeni': return 'Yeni'
      case 'contacted': return 'İletişime Geçildi'
      case 'converted': return 'Müşteri Oldu'
      case 'lost': return 'Kaybedildi'
      default: return s
    }
  }

  const formatDate = (d: string) => {
    const date = new Date(d)
    return date.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-blue-600/20 border border-blue-500/20">
            <Users size={22} className="text-blue-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Potansiyel Müşteriler</h1>
            <p className="text-sm text-gray-500 mt-0.5">Web chat üzerinden gelen müşteri adayları</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 text-xs border border-emerald-500/20">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Canlı
          </div>
          <button onClick={fetchLeads} className="flex items-center gap-2 px-3 py-2 bg-[#1a2332] text-gray-400 rounded-xl text-sm hover:text-white transition-colors">
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            Yenile
          </button>
        </div>
      </div>

      {stats && (
        <div className="grid grid-cols-4 gap-4">
          <div className="bg-[#0d1117]/80 border border-[#1a2332] rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-white">{stats.total}</div>
            <div className="text-xs text-gray-500 mt-1">Toplam</div>
          </div>
          <div className="bg-[#0d1117]/80 border border-[#1a2332] rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-blue-400">{stats.yeni}</div>
            <div className="text-xs text-gray-500 mt-1">Yeni</div>
          </div>
          <div className="bg-[#0d1117]/80 border border-[#1a2332] rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-amber-400">{stats.contact}</div>
            <div className="text-xs text-gray-500 mt-1">İletişimde</div>
          </div>
          <div className="bg-[#0d1117]/80 border border-[#1a2332] rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-emerald-400">{stats.converted}</div>
            <div className="text-xs text-gray-500 mt-1">Müşteri</div>
          </div>
        </div>
      )}

      <div className="relative">
        <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
        <input
          type="text" value={search} onChange={e => setSearch(e.target.value)}
          placeholder="İsim, telefon veya ihtiyaca göre ara..."
          className="w-full bg-[#0d1117]/80 border border-[#1a2332] rounded-xl pl-10 pr-4 py-3 text-white text-sm focus:outline-none focus:border-blue-500/50 placeholder-gray-600"
        />
      </div>

      {loading && !leads.length ? (
        <div className="flex items-center justify-center h-64">
          <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 text-gray-500">
          <Users size={48} className="mx-auto mb-4 opacity-30" />
          <p>Henüz potansiyel müşteri yok</p>
          <p className="text-sm mt-1">Web chat üzerinden gelen müşteri adayları burada görünecek</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(lead => (
            <div key={lead.id} className="bg-[#0d1117]/80 border border-[#1a2332] rounded-xl overflow-hidden hover:border-[#2a3a4a] transition-all">
              <div className="p-4 cursor-pointer" onClick={() => setExpandedId(expandedId === lead.id ? null : lead.id)}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center text-white font-semibold text-sm border border-blue-500/10">
                      {lead.name ? lead.name[0].toUpperCase() : '?'}
                    </div>
                    <div>
                      <h3 className="text-white font-medium">{lead.name || 'İsimsiz'}</h3>
                      <div className="flex items-center gap-3 mt-1">
                        {lead.phone && (
                          <span className="flex items-center gap-1 text-xs text-gray-500">
                            <Phone size={11} /> {lead.phone}
                          </span>
                        )}
                        <span className="text-xs text-gray-500">{formatDate(lead.createdAt)}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={'text-xs px-2.5 py-1 rounded-lg border ' + statusColor(lead.status)}>
                      {statusLabel(lead.status)}
                    </span>
                    {expandedId === lead.id ? <ChevronUp size={16} className="text-gray-500" /> : <ChevronDown size={16} className="text-gray-500" />}
                  </div>
                </div>
              </div>

              {expandedId === lead.id && (
                <div className="border-t border-[#1a2332]">
                  <div className="p-4 space-y-4">
                    {lead.needs && (
                      <div>
                        <h4 className="text-xs text-gray-500 uppercase tracking-wider mb-2">Müşteri İhtiyacı</h4>
                        <p className="text-sm text-gray-300 bg-[#080b12] rounded-lg p-3 border border-[#1a2332]">{lead.needs}</p>
                      </div>
                    )}

                    <div className="flex gap-2">
                      <select
                        value={lead.status}
                        onChange={e => updateStatus(lead.id, e.target.value)}
                        className="bg-[#080b12] border border-[#1a2332] rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:border-blue-500/50"
                      >
                        <option value="yeni">Yeni</option>
                        <option value="contacted">İletişime Geçildi</option>
                        <option value="converted">Müşteri Oldu</option>
                        <option value="lost">Kaybedildi</option>
                      </select>
                      <a href={`https://wa.me/${lead.phone.replace(/[^0-9]/g, '')}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500/20 text-emerald-400 rounded-lg text-xs hover:bg-emerald-500/30 transition-all">
                        <MessageCircle size={14} /> WhatsApp'tan Yaz
                      </a>
                    </div>

                    {lead.conversation && lead.conversation.length > 0 && (
                      <div>
                        <h4 className="text-xs text-gray-500 uppercase tracking-wider mb-2">Sohbet Geçmişi</h4>
                        <div className="bg-[#080b12] rounded-lg border border-[#1a2332] max-h-64 overflow-y-auto p-3 space-y-2">
                          {lead.conversation.map((msg: any, i: number) => (
                            <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                              <div className={`max-w-[80%] rounded-lg px-3 py-2 text-sm ${msg.role === 'user' ? 'bg-blue-500/20 text-blue-200' : 'bg-[#1a2332] text-gray-300'}`}>
                                {msg.content}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
