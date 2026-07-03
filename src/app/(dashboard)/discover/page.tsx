'use client'
import { useState } from 'react'
import { Search, Users, Globe, MapPin, Phone, Instagram, Star, Loader2, Download, ExternalLink, MessageCircle } from 'lucide-react'

interface Business {
  name: string
  phone: string
  website: string
  address: string
  rating: string
  instagram: string
}

export default function DiscoverPage() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<Business[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [selected, setSelected] = useState<Set<number>>(new Set())

  const search = async () => {
    if (!query.trim()) return
    setLoading(true)
    setError('')
    setResults([])
    try {
      const res = await fetch('/api/scraper/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: query.trim(), max_results: 30 }),
      })
      if (!res.ok) {
        const text = await res.text()
        throw new Error(text || 'Arama hatas')
      }
      const data = await res.json()
      setResults(data)
    } catch (e: any) {
      setError(e.message || 'Bir hata oluştu')
    } finally {
      setLoading(false)
    }
  }

  const toggleSelect = (idx: number) => {
    const next = new Set(selected)
    if (next.has(idx)) next.delete(idx)
    else next.add(idx)
    setSelected(next)
  }

  const selectAll = () => {
    if (selected.size === results.length) setSelected(new Set())
    else setSelected(new Set(results.map((_, i) => i)))
  }

  const exportCsv = () => {
    const headers = ['isletme_adi', 'telefon', 'web_sitesi', 'adres', 'puan', 'instagram']
    const rows = results.map(b => [
      `"${b.name}"`, `"${b.phone}"`, `"${b.website}"`,
      `"${b.address}"`, `"${b.rating}"`, `"${b.instagram}"`
    ].join(','))
    const csv = [headers.join(','), ...rows].join('\n')
    const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `isletmeler_${query.replace(/\s+/g, '_')}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-blue-600/20 border border-blue-500/20">
            <Search size={22} className="text-blue-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">İşletme Bul</h1>
            <p className="text-sm text-gray-500 mt-0.5">Firma rehberleri üzerinden potansiyel müşteri listesi oluşturun</p>
          </div>
        </div>
      </div>

      <div className="flex gap-3">
        <div className="flex-1 relative">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
          <input
            type="text" value={query} onChange={e => setQuery(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && search()}
            placeholder="Örn: restoran kadıköy, diş kliniği izmir, yazılım şirketi ankara"
            className="w-full bg-[#0d1117]/80 border border-[#1a2332] rounded-xl pl-10 pr-4 py-3 text-white text-sm focus:outline-none focus:border-blue-500/50 placeholder-gray-600"
          />
        </div>
        <button
          onClick={search} disabled={loading || !query.trim()}
          className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-500 disabled:bg-blue-600/50 disabled:cursor-not-allowed text-white rounded-xl text-sm font-medium transition-all"
        >
          {loading ? <Loader2 size={16} className="animate-spin" /> : <Search size={16} />}
          {loading ? 'Aranıyor...' : 'Ara'}
        </button>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 text-red-400 text-sm">
          {error}
        </div>
      )}

      {results.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-500">{results.length} işletme bulundu</p>
            <div className="flex gap-2">
              <button onClick={selectAll} className="text-xs text-gray-400 hover:text-white transition-colors px-3 py-1.5 bg-[#1a2332] rounded-lg">
                {selected.size === results.length ? 'Tümünü Kaldır' : 'Tümünü Seç'}
              </button>
              <button onClick={exportCsv} className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-white transition-colors px-3 py-1.5 bg-[#1a2332] rounded-lg">
                <Download size={12} /> CSV Dışa Aktar
              </button>
            </div>
          </div>

          <div className="space-y-2">
            {results.map((biz, i) => (
              <div key={i} className="bg-[#0d1117]/80 border border-[#1a2332] rounded-xl p-4 hover:border-[#2a3a4a] transition-all">
                <div className="flex items-start gap-3">
                  <input
                    type="checkbox" checked={selected.has(i)} onChange={() => toggleSelect(i)}
                    className="mt-1 accent-blue-500"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h3 className="text-white font-medium truncate">{biz.name}</h3>
                      {biz.rating && (
                        <span className="flex items-center gap-1 text-xs text-amber-400 flex-shrink-0 ml-2">
                          <Star size={12} /> {biz.rating}
                        </span>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-xs text-gray-500">
                      {biz.address && (
                        <span className="flex items-center gap-1">
                          <MapPin size={11} /> {biz.address}
                        </span>
                      )}
                      {biz.phone && (
                        <a href={`tel:${biz.phone}`} className="flex items-center gap-1 hover:text-blue-400 transition-colors">
                          <Phone size={11} /> {biz.phone}
                        </a>
                      )}
                      {biz.website && biz.website !== '#' && (
                        <a href={biz.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 hover:text-blue-400 transition-colors">
                          <Globe size={11} /> Web Sitesi
                        </a>
                      )}
                      {biz.instagram && (
                        <a href={biz.instagram} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 hover:text-pink-400 transition-colors">
                          <Instagram size={11} /> Instagram
                        </a>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    {biz.phone && (
                      <a href={`https://wa.me/${biz.phone.replace(/[^0-9]/g, '')}`} target="_blank" rel="noopener noreferrer"
                        className="p-2 rounded-lg bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 transition-all">
                        <MessageCircle size={14} />
                      </a>
                    )}
                    {biz.instagram && (
                      <a href={biz.instagram} target="_blank" rel="noopener noreferrer"
                        className="p-2 rounded-lg bg-pink-500/10 text-pink-400 hover:bg-pink-500/20 transition-all">
                        <ExternalLink size={14} />
                      </a>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {!loading && results.length === 0 && !error && (
        <div className="text-center py-20 text-gray-500">
          <Search size={48} className="mx-auto mb-4 opacity-30" />
          <p>Sektör ve lokasyon girerek arama yapın</p>
          <p className="text-sm mt-1">Örn: restoran kadıköy, diş kliniği izmir, yazılım şirketi ankara</p>
        </div>
      )}

      {loading && (
        <div className="flex items-center justify-center h-64">
          <div className="flex items-center gap-3">
            <Loader2 size={20} className="animate-spin text-blue-400" />
            <span className="text-gray-400 text-sm">Firma rehberleri taranıyor...</span>
          </div>
        </div>
      )}
    </div>
  )
}
