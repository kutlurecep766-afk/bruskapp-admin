'use client'
import { useState, useEffect } from 'react'
import { Package, RefreshCw, Link2, Loader2, Store, Check, ArrowRight, Search } from 'lucide-react'

export default function UrunBirlestirPage() {
  const [data, setData] = useState<{ total: number; linked: number; unlinked: number; unlinkedProducts: any[] } | null>(null)
  const [products, setProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [merging, setMerging] = useState(false)
  const [message, setMessage] = useState('')
  const [manualLink, setManualLink] = useState<{ mpid: number; selected: string } | null>(null)

  useEffect(() => { load() }, [])

  const load = async () => {
    setLoading(true)
    try {
      const [dRes, pRes] = await Promise.all([
        fetch('/api/marketplace/unlinked', { credentials: 'include' }),
        fetch('/api/products', { credentials: 'include' }),
      ])
      if (dRes.ok) setData(await dRes.json())
      if (pRes.ok) setProducts(await pRes.json())
    } catch {} finally { setLoading(false) }
  }

  const mergeAuto = async () => {
    setMerging(true)
    setMessage('')
    try {
      const res = await fetch('/api/marketplace/merge-auto', { method: 'POST', credentials: 'include' })
      if (res.ok) {
        const result = await res.json()
        setMessage(`${result.message}`)
        load()
      }
    } catch {} finally { setMerging(false) }
  }

  const linkManual = async (mpId: number, localId: number) => {
    setMerging(true)
    try {
      const res = await fetch('/api/marketplace/merge-manual', {
        method: 'POST', credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ marketplaceProductId: mpId, localProductId: localId }),
      })
      if (res.ok) {
        setManualLink(null)
        load()
      }
    } catch {} finally { setMerging(false) }
  }

  const createLocal = async (mpId: number) => {
    setMerging(true)
    try {
      const res = await fetch('/api/marketplace/create-local-from-marketplace', {
        method: 'POST', credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ marketplaceProductId: mpId }),
      })
      if (res.ok) {
        setMessage('Ürün oluşturuldu')
        load()
      }
    } catch {} finally { setMerging(false) }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Ürün Birleştirme</h1>
          <p className="text-gray-500 text-sm mt-1">Pazaryerlerinden çekilen ürünleri yerel ürünlerinizle eşleştirin</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={load} className="px-4 py-2.5 bg-[#1a2332] text-gray-300 rounded-xl text-sm font-medium hover:bg-[#243040] transition-all flex items-center gap-1"><RefreshCw size={16} /> Yenile</button>
          <button onClick={mergeAuto} disabled={merging || !data?.unlinked} className="px-4 py-2.5 bg-gradient-to-r from-emerald-600 to-emerald-500 text-white rounded-xl text-sm font-medium hover:shadow-lg hover:shadow-emerald-500/25 transition-all disabled:opacity-50 flex items-center gap-1">
            <Link2 size={16} className={merging ? 'animate-spin' : ''} />
            {merging ? 'Birleştiriliyor...' : 'Tümünü Barkodla Birleştir'}
          </button>
        </div>
      </div>

      {message && (
        <div className="glass rounded-2xl border border-emerald-500/20 p-4 text-sm text-emerald-400">{message}</div>
      )}

      {data && (
        <div className="grid grid-cols-3 gap-4">
          <div className="glass rounded-2xl border border-[#1a2332] p-4 text-center">
            <p className="text-2xl font-bold text-white">{data.total}</p>
            <p className="text-xs text-gray-500 mt-1">Toplam Pazaryeri Ürünü</p>
          </div>
          <div className="glass rounded-2xl border border-[#1a2332] p-4 text-center">
            <p className="text-2xl font-bold text-emerald-400">{data.linked}</p>
            <p className="text-xs text-gray-500 mt-1">Birleştirilmiş</p>
          </div>
          <div className="glass rounded-2xl border border-[#1a2332] p-4 text-center">
            <p className="text-2xl font-bold text-amber-400">{data.unlinked}</p>
            <p className="text-xs text-gray-500 mt-1">Birleştirilmemiş</p>
          </div>
        </div>
      )}

      <div className="glass rounded-2xl border border-[#1a2332] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#1a2332] bg-[#080b12]/50">
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Pazaryeri</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Barkod</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ürün</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Stok</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Fiyat</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">İşlem</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1a2332]">
              {loading ? (
                <tr><td colSpan={6} className="px-4 py-16 text-center text-gray-500"><Loader2 size={24} className="animate-spin mx-auto mb-2" />Yükleniyor...</td></tr>
              ) : !data?.unlinkedProducts?.length ? (
                <tr><td colSpan={6} className="px-4 py-16 text-center text-gray-500"><Link2 size={36} className="mx-auto mb-2 text-gray-700" /><p>Tüm ürünler birleştirilmiş</p></td></tr>
              ) : data.unlinkedProducts.map(mp => {
                const matching = products.filter(p => p.barcode === mp.barcode)
                return (
                  <tr key={mp.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="px-4 py-3"><span className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-500/10 text-blue-400 rounded-lg text-xs font-medium capitalize">{mp.platform}</span></td>
                    <td className="px-4 py-3 text-cyan-400 text-xs font-mono">{mp.barcode || '—'}</td>
                    <td className="px-4 py-3 text-white font-medium">{mp.title}</td>
                    <td className="px-4 py-3 text-right text-gray-300">{mp.stock}</td>
                    <td className="px-4 py-3 text-right text-emerald-400">{mp.price?.toFixed(2)} ₺</td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        {matching.length > 0 ? (
                          <span className="text-xs text-emerald-400 flex items-center gap-1"><Check size={12} /> Barkod eşleşiyor</span>
                        ) : (
                          <>
                            <button onClick={() => createLocal(mp.id)} disabled={merging} className="px-2 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 text-xs font-medium hover:bg-emerald-500/20 transition-all disabled:opacity-50">Ürün Oluştur</button>
                            <button onClick={() => setManualLink({ mpid: mp.id, selected: '' })} className="px-2 py-1.5 rounded-lg bg-violet-500/10 text-violet-400 text-xs font-medium hover:bg-violet-500/20 transition-all">Elle Eşle</button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {manualLink && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={() => setManualLink(null)}>
          <div className="bg-[#0d1117] rounded-2xl border border-[#1a2332] p-6 w-full max-w-md" onClick={e => e.stopPropagation()}>
            <h3 className="text-white font-bold text-lg mb-4">Elle Eşleştir</h3>
            <p className="text-gray-400 text-sm mb-4">Bu pazaryeri ürününü hangi yerel ürünle eşleştirmek istiyorsun?</p>
            <select value={manualLink.selected} onChange={e => setManualLink({ ...manualLink, selected: e.target.value })}
              className="w-full bg-[#080b12]/80 border border-[#1a2332] rounded-xl px-4 py-2.5 text-white text-sm mb-4 focus:outline-none focus:border-violet-500/50">
              <option value="">Ürün seç</option>
              {products.filter(p => !p.barcode).map(p => <option key={p.id} value={p.id}>{p.name} (barkod yok)</option>)}
              {products.filter(p => p.barcode).map(p => <option key={p.id} value={p.id}>{p.name} ({p.barcode})</option>)}
            </select>
            <div className="flex gap-2">
              <button onClick={() => setManualLink(null)} className="flex-1 px-4 py-2.5 bg-[#1a2332] text-gray-300 rounded-xl text-sm font-medium hover:bg-[#243040] transition-all">İptal</button>
              <button onClick={() => linkManual(manualLink.mpid, parseInt(manualLink.selected))} disabled={!manualLink.selected} className="flex-1 px-4 py-2.5 rounded-xl text-sm font-medium text-white transition-all bg-violet-600 hover:bg-violet-700 disabled:opacity-50">
                <ArrowRight size={16} className="inline mr-1" />Eşleştir
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
