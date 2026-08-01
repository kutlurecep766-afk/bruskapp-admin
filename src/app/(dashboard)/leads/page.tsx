'use client'
import { useState, useEffect, useCallback } from 'react'
import { Users, Phone, MessageCircle, ChevronDown, ChevronUp, Search, RefreshCw, Sparkles, PhoneCall, CheckCircle2, XCircle, Bot, Globe, MessageSquareText } from 'lucide-react'

function WAIcon({ className }: { className?: string }) {
  return <svg className={className} viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
}
function IGAcon({ className }: { className?: string }) {
  return <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="2" y="2" width="20" height="20" rx="5"/><circle cx="12" cy="12" r="5"/><circle cx="17.5" cy="6.5" r="1.5" fill="currentColor" stroke="none"/></svg>
}
function TGIcon({ className }: { className?: string }) {
  return <svg className={className} viewBox="0 0 24 24" fill="currentColor"><path d="M11.944 0A12 12 0 000 12a12 12 0 0012 12 12 12 0 0012-12A12 12 0 0012 0a12 12 0 00-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 01.171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/></svg>
}

const PLATFORM_MAP: Record<string, any> = {
  whatsapp: { label: 'WhatsApp', icon: WAIcon, color: 'text-green-400', bg: 'bg-green-500/10', border: 'border-green-500/20', dot: 'bg-green-400' },
  instagram: { label: 'Instagram', icon: IGAcon, color: 'text-pink-400', bg: 'bg-pink-500/10', border: 'border-pink-500/20', dot: 'bg-pink-400' },
  telegram: { label: 'Telegram', icon: TGIcon, color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/20', dot: 'bg-blue-400' },
  messenger: { label: 'Messenger', color: 'text-sky-400', bg: 'bg-sky-500/10', border: 'border-sky-500/20', dot: 'bg-sky-400' },
  webchat: { label: 'Web Chat', color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', dot: 'bg-emerald-400' },
}

const ps = (p: string) => PLATFORM_MAP[p] || { label: p || 'Web Chat', color: 'text-gray-400', bg: 'bg-gray-500/10', icon: null, dot: 'bg-gray-400' }

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

  const statCards = [
    { key: 'total', label: 'Toplam Aday', icon: Users, color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/20' },
    { key: 'yeni', label: 'Yeni', icon: Sparkles, color: 'text-violet-400', bg: 'bg-violet-500/10', border: 'border-violet-500/20' },
    { key: 'contact', label: 'İletişimde', icon: PhoneCall, color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/20' },
    { key: 'converted', label: 'Müşteri', icon: CheckCircle2, color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' },
  ]

  return (
    <div className="space-y-6 pb-12">
      <div className="relative overflow-hidden rounded-3xl border border-white/[0.06] bg-gradient-to-br from-[#101a30] via-[#0d1117] to-[#0a0e14] p-6 lg:p-8 shadow-2xl shadow-black/20">
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-32 -left-16 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl" />
        <div className="absolute top-0 left-1/4 w-44 h-px bg-gradient-to-r from-transparent via-blue-400/40 to-transparent" />
        <div className="relative flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-xl shadow-blue-500/30 ring-1 ring-white/10"><Users size={26} className="text-white" /></div>
              <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-400 ring-4 ring-[#0d1117] animate-pulse" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-white">Potansiyel Müşteriler</h1>
              <p className="text-sm text-gray-500 mt-0.5">Web chat ve tüm kanallardan gelen müşteri adayları</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 text-xs border border-emerald-500/20">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Canlı
            </div>
            <button onClick={fetchLeads} className="flex items-center gap-2 px-3 py-2 bg-white/[0.04] text-gray-400 rounded-xl text-sm hover:text-white hover:bg-white/[0.08] transition-colors border border-white/[0.06]">
              <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
              Yenile
            </button>
          </div>
        </div>
      </div>

      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 lg:gap-4">
          {statCards.map(c => {
            const Icon = c.icon
            return (
              <div key={c.key} className={'relative overflow-hidden rounded-2xl border p-4 lg:p-5 ' + c.bg + ' ' + c.border}>
                <div className="absolute -top-8 -right-8 w-24 h-24 rounded-full bg-white/[0.03]" />
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-3xl font-bold tracking-tight text-white">{stats[c.key] ?? 0}</div>
                    <div className="text-xs text-gray-500 mt-1">{c.label}</div>
                  </div>
                  <div className={'w-11 h-11 rounded-xl flex items-center justify-center ' + c.bg + ' ' + c.color}><Icon size={20} /></div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      <div className="relative">
        <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600" />
        <input
          type="text" value={search} onChange={e => setSearch(e.target.value)}
          placeholder="İsim, telefon veya ihtiyaca göre ara..."
          className="w-full bg-[#0d1117]/70 backdrop-blur-xl border border-white/[0.06] rounded-xl pl-10 pr-4 py-3 text-white text-sm focus:outline-none focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/10 placeholder-gray-600 transition-all"
        />
      </div>

      {loading && !leads.length ? (
        <div className="flex items-center justify-center h-64">
          <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="relative overflow-hidden rounded-3xl border border-white/[0.06] bg-[#0d1117]/60 backdrop-blur-xl text-center py-20">
          <div className="absolute -top-20 left-1/3 w-64 h-64 bg-blue-500/[0.04] rounded-full blur-3xl" />
          <div className="relative">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-center shadow-inner"><Users size={28} className="text-gray-700" /></div>
            <p className="text-gray-400 font-medium">Henüz potansiyel müşteri yok</p>
            <p className="text-sm text-gray-600 mt-1">Web chat üzerinden gelen müşteri adayları burada görünecek</p>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(lead => {
            const p = ps(lead.source)
            const Icon = p.icon
            const isExpanded = expandedId === lead.id
            return (
              <div key={lead.id} className="group bg-[#0d1117]/70 backdrop-blur-xl border border-white/[0.06] rounded-2xl overflow-hidden hover:border-white/[0.14] hover:shadow-xl hover:shadow-black/20 transition-all duration-300">
                <div className="p-4 lg:p-5 cursor-pointer" onClick={() => setExpandedId(isExpanded ? null : lead.id)}>
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-4 min-w-0">
                      <div className="relative flex-shrink-0">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500/80 to-purple-600/80 flex items-center justify-center text-white font-bold text-sm ring-1 ring-white/10 shadow-lg shadow-blue-500/10">
                          {lead.name ? lead.name[0].toUpperCase() : '?'}
                        </div>
                        {Icon && <div className="absolute -bottom-1 -right-1 w-[18px] h-[18px] rounded-full bg-[#0d1117] flex items-center justify-center ring-[3px] ring-[#0d1117]"><Icon className={'w-2.5 h-2.5 ' + p.color} /></div>}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="text-white font-semibold truncate">{lead.name || 'İsimsiz'}</h3>
                          <span className={'flex items-center gap-1 text-[10px] font-medium flex-shrink-0 ' + p.color}>
                            {Icon ? <Icon className="w-3 h-3" /> : <Globe size={11} />}{p.label}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 mt-1 flex-wrap">
                          {lead.phone && (
                            <span className="flex items-center gap-1 text-xs text-gray-500">
                              <Phone size={11} /> {lead.phone}
                            </span>
                          )}
                          <span className="text-xs text-gray-600">{formatDate(lead.createdAt)}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 flex-shrink-0">
                      <span className={'text-xs px-2.5 py-1 rounded-lg border font-medium ' + statusColor(lead.status)}>
                        {statusLabel(lead.status)}
                      </span>
                      <div className={'w-7 h-7 rounded-lg flex items-center justify-center border border-white/[0.06] transition-all duration-300 ' + (isExpanded ? 'bg-blue-500/10 text-blue-400 rotate-180' : 'text-gray-500 group-hover:text-white')}>
                        {isExpanded ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
                      </div>
                    </div>
                  </div>
                </div>

                {isExpanded && (
                  <div className="border-t border-white/[0.06] animate-slide-in">
                    <div className="p-4 lg:p-5 space-y-4">
                      {lead.needs && (
                        <div>
                          <h4 className="text-[11px] text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-1.5"><MessageSquareText size={11} /> Müşteri İhtiyacı</h4>
                          <p className="text-sm text-gray-300 bg-white/[0.02] rounded-xl p-3.5 border border-white/[0.06] leading-relaxed">{lead.needs}</p>
                        </div>
                      )}

                      <div className="flex flex-wrap gap-2">
                        <select
                          value={lead.status}
                          onChange={e => updateStatus(lead.id, e.target.value)}
                          className="bg-[#0d1117] border border-white/[0.06] rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500/50"
                        >
                          <option value="yeni">Yeni</option>
                          <option value="contacted">İletişime Geçildi</option>
                          <option value="converted">Müşteri Oldu</option>
                          <option value="lost">Kaybedildi</option>
                        </select>
                        {lead.phone && (
                          <a href={`https://wa.me/${lead.phone.replace(/[^0-9]/g, '')}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-500/15 text-emerald-400 rounded-xl text-xs hover:bg-emerald-500/25 transition-all border border-emerald-500/20">
                            <MessageCircle size={14} /> WhatsApp'tan Yaz
                          </a>
                        )}
                      </div>

                      {lead.conversation && lead.conversation.length > 0 && (
                        <div>
                          <h4 className="text-[11px] text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-1.5"><Bot size={11} /> Sohbet Geçmişi</h4>
                          <div className="bg-white/[0.02] rounded-2xl border border-white/[0.06] max-h-64 overflow-y-auto p-3 space-y-2">
                            {lead.conversation.map((msg: any, i: number) => (
                              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-[80%] rounded-xl px-3 py-2 text-sm ${msg.role === 'user' ? 'bg-gradient-to-br from-blue-500/30 to-indigo-500/30 text-blue-100 border border-blue-500/20' : 'bg-[#1a2332]/80 text-gray-300 border border-white/[0.04]'}`}>
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
            )
          })}
        </div>
      )}
    </div>
  )
}
