'use client'
import { useState, useEffect } from 'react'
import { Package, Search, RefreshCw, Loader2, ArrowUpRight, ArrowDownRight, Filter } from 'lucide-react'

const TYPE_LABELS: Record<string, string> = {
  ADD: 'Stok Ekleme',
  DEDUCT: 'Stok Düşme',
  MANUAL: 'Manuel',
  PURCHASE_INVOICE: 'Alış Faturası',
  ORDER: 'Sipariş',
  SYNC_FROM_MARKETPLACE: 'Pazaryeri Senkron',
}

export default function StokHareketleriPage() {
  const [movements, setMovements] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(0)
  const [total, setTotal] = useState(0)

  useEffect(() => { fetchMovements() }, [page])

  const fetchMovements = async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/stock-movements?page=${page}&size=50`, { credentials: 'include' })
      if (res.ok) {
        const data = await res.json()
        setMovements(data.items)
        setTotal(data.total)
      }
    } catch {} finally { setLoading(false) }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Stok Hareketleri</h1>
          <p className="text-gray-500 text-sm mt-1">Tüm stok giriş/çıkış hareketlerinin kaydı</p>
        </div>
        <button onClick={fetchMovements} className="flex items-center gap-2 px-4 py-2.5 bg-[#1a2332] text-gray-300 rounded-xl text-sm font-medium hover:bg-[#243040] transition-all"><RefreshCw size={16} /> Yenile</button>
      </div>

      <div className="glass rounded-2xl border border-[#1a2332] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#1a2332] bg-[#080b12]/50">
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tarih</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ürün</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tür</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Miktar</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Kalan</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Referans / Not</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1a2332]">
              {loading ? (
                <tr><td colSpan={6} className="px-4 py-16 text-center text-gray-500"><Loader2 size={24} className="animate-spin mx-auto mb-2" />Yükleniyor...</td></tr>
              ) : movements.length === 0 ? (
                <tr><td colSpan={6} className="px-4 py-16 text-center text-gray-500"><Package size={36} className="mx-auto mb-2 text-gray-700" /><p>Hareket bulunamadı</p></td></tr>
              ) : movements.map(m => (
                <tr key={m.id} className="hover:bg-white/[0.02] transition-colors">
                  <td className="px-4 py-3 text-gray-400 text-xs whitespace-nowrap">{new Date(m.createdAt).toLocaleString('tr-TR')}</td>
                  <td className="px-4 py-3 text-white font-medium">{m.product?.name || '—'}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-xs font-medium ${
                      m.quantity > 0 ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'
                    }`}>
                      {m.quantity > 0 ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                      {TYPE_LABELS[m.type] || m.type}
                    </span>
                  </td>
                  <td className={`px-4 py-3 text-right font-medium ${m.quantity > 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                    {m.quantity > 0 ? '+' : ''}{m.quantity}
                  </td>
                  <td className="px-4 py-3 text-right text-gray-300 font-medium">{m.balance}</td>
                  <td className="px-4 py-3 text-gray-500 text-xs">{(m.reference ? m.reference + ' — ' : '') + (m.note || '')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {total > 50 && (
        <div className="flex items-center justify-center gap-2">
          <button onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0} className="px-4 py-2 rounded-xl bg-[#1a2332] text-gray-300 text-sm hover:bg-[#243040] disabled:opacity-50 transition-all">Önceki</button>
          <span className="text-gray-500 text-sm">Sayfa {page + 1} / {Math.ceil(total / 50)}</span>
          <button onClick={() => setPage(p => p + 1)} disabled={(page + 1) * 50 >= total} className="px-4 py-2 rounded-xl bg-[#1a2332] text-gray-300 text-sm hover:bg-[#243040] disabled:opacity-50 transition-all">Sonraki</button>
        </div>
      )}
    </div>
  )
}
