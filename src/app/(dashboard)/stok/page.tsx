'use client'
import { useState, useEffect } from 'react'
import { Package, RefreshCw, Search, Check, X, DollarSign, Tag, Barcode, Loader2 } from 'lucide-react'

export default function StokPage() {
  const [products, setProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [syncing, setSyncing] = useState(false)
  const [syncResults, setSyncResults] = useState<{ platform: string; success: boolean; message: string }[] | null>(null)
  const [editingStock, setEditingStock] = useState<{ id: number; stock: number; price: number } | null>(null)

  useEffect(() => { fetchProducts() }, [])

  const fetchProducts = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/products', { credentials: 'include' })
      if (res.ok) setProducts(await res.json())
    } catch {} finally { setLoading(false) }
  }

  const syncAll = async () => {
    setSyncing(true)
    setSyncResults(null)
    try {
      const ids = products.filter(p => p.barcode).map(p => p.id)
      if (!ids.length) { setSyncResults([{ platform: 'uyari', success: false, message: 'Barkodlu urun bulunamadi' }]); return }
      const res = await fetch('/api/products/sync', {
        method: 'POST', credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productIds: ids }),
      })
      if (res.ok) {
        const data = await res.json()
        setSyncResults(data.results)
        setTimeout(() => setSyncResults(null), 8000)
      }
    } catch {} finally { setSyncing(false) }
  }

  const saveStock = async () => {
    if (!editingStock) return
    try {
      const res = await fetch(`/api/products/${editingStock.id}`, {
        method: 'PATCH', credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stock: editingStock.stock, price: editingStock.price }),
      })
      if (res.ok) {
        setEditingStock(null)
        fetchProducts()
      }
    } catch {}
  }

  const filtered = products.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    (p.barcode || '').toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Stok Yönetimi</h1>
          <p className="text-gray-500 text-sm mt-1">Stok ve fiyatları tek ekrandan güncelleyin, tüm pazaryerlerine tek tıkla gönderin</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={syncAll} disabled={syncing} className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-violet-600 to-violet-500 text-white rounded-xl text-sm font-medium hover:shadow-lg hover:shadow-violet-500/25 transition-all disabled:opacity-50">
            <RefreshCw size={16} className={syncing ? 'animate-spin' : ''} />
            {syncing ? 'Senkronize...' : 'Tümünü Pazaryerlerine Gönder'}
          </button>
        </div>
      </div>

      {syncResults && (
        <div className="glass rounded-2xl border border-violet-500/20 p-4 space-y-2">
          <p className="text-sm text-white font-medium">Senkronizasyon Sonuçları</p>
          {syncResults.map((r, i) => (
            <div key={i} className={`flex items-center gap-2 text-xs ${r.success ? 'text-emerald-400' : 'text-red-400'}`}>
              <span className={`w-2 h-2 rounded-full shrink-0 ${r.success ? 'bg-emerald-400' : 'bg-red-400'}`}></span>
              <span className="font-medium capitalize">{r.platform}:</span> {r.message}
            </div>
          ))}
        </div>
      )}

      <div className="flex gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px] max-w-xs">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
          <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Ürün veya barkod ara..." className="w-full bg-[#0d1117]/80 border border-[#1a2332] rounded-xl pl-9 pr-4 py-2 text-white text-sm focus:outline-none focus:border-violet-500/50 placeholder-gray-600 transition-all" />
        </div>
        <button onClick={() => setSearch('')} className="px-3 py-2 text-xs text-gray-500 hover:text-white transition-all">Temizle</button>
        <button onClick={fetchProducts} className="px-3 py-2 text-xs text-gray-500 hover:text-white transition-all flex items-center gap-1"><RefreshCw size={12} /> Yenile</button>
      </div>

      <div className="glass rounded-2xl border border-[#1a2332] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#1a2332] bg-[#080b12]/50">
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Barkod</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ürün</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Kategori</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Stok</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Fiyat</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">İşlem</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1a2332]">
              {loading ? (
                <tr><td colSpan={6} className="px-4 py-16 text-center text-gray-500"><Loader2 size={24} className="animate-spin mx-auto mb-2" />Yükleniyor...</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={6} className="px-4 py-16 text-center text-gray-500"><Package size={36} className="mx-auto mb-2 text-gray-700" /><p>Ürün bulunamadı</p></td></tr>
              ) : filtered.map(p => (
                <tr key={p.id} className="hover:bg-white/[0.02] transition-colors">
                  <td className="px-4 py-3">
                    {p.barcode ? (
                      <span className="flex items-center gap-1.5 text-cyan-400 text-xs"><Barcode size={12} />{p.barcode}</span>
                    ) : (
                      <span className="text-gray-600 text-xs">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-white font-medium">{p.name}</td>
                  <td className="px-4 py-3 text-gray-400 text-xs">{p.category || '—'}</td>
                  <td className="px-4 py-3 text-right">
                    {editingStock?.id === p.id ? (
                      <input type="number" value={editingStock.stock} onChange={e => setEditingStock({ ...editingStock, stock: parseInt(e.target.value) || 0 })}
                        className="w-20 text-right bg-[#080b12]/80 border border-violet-500/50 rounded-lg px-2 py-1 text-white text-sm focus:outline-none" autoFocus />
                    ) : (
                      <span className={`font-medium ${p.stock > 50 ? 'text-emerald-400' : p.stock > 0 ? 'text-amber-400' : 'text-red-400'}`}>{p.stock}</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    {editingStock?.id === p.id ? (
                      <input type="number" step="0.01" value={editingStock.price} onChange={e => setEditingStock({ ...editingStock, price: parseFloat(e.target.value) || 0 })}
                        className="w-24 text-right bg-[#080b12]/80 border border-violet-500/50 rounded-lg px-2 py-1 text-white text-sm focus:outline-none" />
                    ) : (
                      <span className="text-emerald-400 font-medium">{p.price.toFixed(2)} ₺</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      {editingStock?.id === p.id ? (
                        <>
                          <button onClick={saveStock} className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 transition-all"><Check size={14} /></button>
                          <button onClick={() => setEditingStock(null)} className="p-1.5 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-all"><X size={14} /></button>
                        </>
                      ) : (
                        <button onClick={() => setEditingStock({ id: p.id, stock: p.stock, price: p.price })}
                          className="px-3 py-1.5 rounded-lg bg-violet-500/10 text-violet-400 text-xs font-medium hover:bg-violet-500/20 transition-all border border-violet-500/20">
                          Düzenle
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="flex items-center gap-4 text-xs text-gray-500 px-2">
        <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-emerald-400/30"></span> Stok &gt; 50</span>
        <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-amber-400/30"></span> Stok &gt; 0</span>
        <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-red-400/30"></span> Stok = 0</span>
        <span className="text-gray-600 ml-auto">{products.filter(p => p.barcode).length}/{products.length} ürün barkodlu</span>
      </div>
    </div>
  )
}
