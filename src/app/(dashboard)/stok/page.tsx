'use client'
import { useState, useEffect } from 'react'
import { Package, RefreshCw, Search, Check, X, DollarSign, Tag, Barcode, Loader2, Plus, Minus, Store, Link2, ArrowRight, ArrowUpRight, ArrowDownRight, FileText, Trash2 } from 'lucide-react'

const TABS = [
  { key: 'products', label: 'Ürünler', icon: Package },
  { key: 'movements', label: 'Stok Hareketleri', icon: ArrowUpRight },
  { key: 'invoices', label: 'Alış Faturaları', icon: FileText },
  { key: 'marketplace', label: 'Pazaryeri Birleştirme', icon: Store },
]

const TYPE_LABELS: Record<string, string> = {
  ADD: 'Stok Ekleme', DEDUCT: 'Stok Düşme', MANUAL: 'Manuel',
  PURCHASE_INVOICE: 'Alış Faturası', ORDER: 'Sipariş', SYNC_FROM_MARKETPLACE: 'Pazaryeri Senkron',
}

export default function StokPage() {
  const [tab, setTab] = useState('products')
  const [products, setProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [syncing, setSyncing] = useState(false)
  const [syncResults, setSyncResults] = useState<{ platform: string; success: boolean; message: string }[] | null>(null)
  const [editingStock, setEditingStock] = useState<{ id: number; stock: number; price: number } | null>(null)
  const [stockModal, setStockModal] = useState<{ product: any; type: 'ADD' | 'DEDUCT'; qty: string; note: string } | null>(null)
  const [barcodeInput, setBarcodeInput] = useState('')
  const [scanning, setScanning] = useState(false)
  const [createProduct, setCreateProduct] = useState<{ barcode: string } | null>(null)
  const [createForm, setCreateForm] = useState({ name: '', price: '', stock: '0', category: '' })
  const [mpData, setMpData] = useState<{ total: number; linked: number; unlinked: number; unlinkedProducts: any[] } | null>(null)
  const [manualLink, setManualLink] = useState<{ mpid: number; selected: string } | null>(null)
  const [movements, setMovements] = useState<any[]>([])
  const [movementsLoading, setMovementsLoading] = useState(false)
  const [movementsTotal, setMovementsTotal] = useState(0)
  const [movementsPage, setMovementsPage] = useState(0)
  const [invoices, setInvoices] = useState<any[]>([])
  const [invoicesLoading, setInvoicesLoading] = useState(false)
  const [showInvoiceForm, setShowInvoiceForm] = useState(false)
  const [invoiceForm, setInvoiceForm] = useState({ invoiceNo: '', supplier: '', date: new Date().toISOString().split('T')[0], totalAmount: 0, note: '' })
  const [invoiceItems, setInvoiceItems] = useState<{ productId: number; productName: string; barcode: string; quantity: string; unitPrice: string }[]>([])

  useEffect(() => { fetchProducts() }, [])

  const fetchProducts = async () => {
    setLoading(true)
    try {
      const [pRes, mRes] = await Promise.all([
        fetch('/api/products', { credentials: 'include' }),
        fetch('/api/marketplace/unlinked', { credentials: 'include' }),
      ])
      if (pRes.ok) setProducts(await pRes.json())
      if (mRes.ok) setMpData(await mRes.json())
    } catch {} finally { setLoading(false) }
  }

  const fetchMovements = async () => {
    setMovementsLoading(true)
    try {
      const res = await fetch(`/api/stock-movements?page=${movementsPage}&size=50`, { credentials: 'include' })
      if (res.ok) {
        const data = await res.json()
        setMovements(data.items)
        setMovementsTotal(data.total)
      }
    } catch {} finally { setMovementsLoading(false) }
  }

  const fetchInvoices = async () => {
    setInvoicesLoading(true)
    try {
      const res = await fetch('/api/purchase-invoices', { credentials: 'include' })
      if (res.ok) setInvoices((await res.json()).items || [])
    } catch {} finally { setInvoicesLoading(false) }
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
      if (res.ok) { const data = await res.json(); setSyncResults(data.results); setTimeout(() => setSyncResults(null), 8000) }
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
      if (res.ok) { setEditingStock(null); fetchProducts() }
    } catch {}
  }

  const scanBarcode = async () => {
    if (!barcodeInput.trim()) return
    setScanning(true)
    try {
      const res = await fetch(`/api/products/by-barcode/${encodeURIComponent(barcodeInput.trim())}`, { credentials: 'include' })
      if (res.ok) {
        const data = await res.json()
        if (data.found && data.product) setStockModal({ product: data.product, type: 'ADD', qty: '1', note: 'QR barkod ile' })
        else { setCreateProduct({ barcode: barcodeInput.trim() }); setCreateForm({ name: '', price: '', stock: '0', category: '' }) }
      }
    } catch {} finally { setScanning(false); setBarcodeInput('') }
  }

  const submitCreateProduct = async () => {
    if (!createProduct || !createForm.name) return
    try {
      const res = await fetch('/api/products', {
        method: 'POST', credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: createForm.name, barcode: createProduct.barcode,
          price: parseFloat(createForm.price) || 0, stock: parseInt(createForm.stock) || 0,
          category: createForm.category,
        }),
      })
      if (res.ok) { setCreateProduct(null); fetchProducts() }
    } catch {}
  }

  const applyStockChange = async () => {
    if (!stockModal) return
    const qty = parseInt(stockModal.qty)
    if (!qty || qty <= 0) return
    try {
      await fetch('/api/products/manual-stock', {
        method: 'POST', credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId: stockModal.product.id, quantity: qty, type: stockModal.type, note: stockModal.note }),
      })
      setStockModal(null); fetchProducts()
    } catch {}
  }

  const pullFromMarketplaces = async () => {
    const platforms = ['trendyol', 'hepsiburada', 'n11', 'yemeksepeti', 'trendyolgo']
    setSyncing(true); setSyncResults(null)
    const results: any[] = []
    for (const platform of platforms) {
      try {
        const res = await fetch(`/api/marketplace/${platform}/stock/pull`, { method: 'POST', credentials: 'include' })
        if (res.ok) { const d = await res.json(); results.push({ platform, success: d.success, message: d.message || `${d.synced || 0} urun` }) }
      } catch {}
    }
    setSyncResults(results); setSyncing(false)
    setTimeout(() => { setSyncResults(null); fetchProducts() }, 1000)
  }

  const mergeAuto = async () => {
    setSyncing(true)
    try {
      const res = await fetch('/api/marketplace/merge-auto', { method: 'POST', credentials: 'include' })
      if (res.ok) { const r = await res.json(); setSyncResults([{ platform: 'birlestirme', success: true, message: r.message }]); fetchProducts() }
    } catch {} finally { setSyncing(false) }
  }

  const createLocalFromMp = async (mpId: number) => {
    try {
      await fetch('/api/marketplace/create-local-from-marketplace', {
        method: 'POST', credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ marketplaceProductId: mpId }),
      })
      fetchProducts()
    } catch {}
  }

  const linkManual = async () => {
    if (!manualLink || !manualLink.selected) return
    try {
      await fetch('/api/marketplace/merge-manual', {
        method: 'POST', credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ marketplaceProductId: manualLink.mpid, localProductId: parseInt(manualLink.selected) }),
      })
      setManualLink(null); fetchProducts()
    } catch {}
  }

  const addInvoiceItem = () => setInvoiceItems([...invoiceItems, { productId: 0, productName: '', barcode: '', quantity: '1', unitPrice: '0' }])
  const removeInvoiceItem = (idx: number) => setInvoiceItems(invoiceItems.filter((_, i) => i !== idx))
  const updateInvoiceItem = (idx: number, field: string, value: any) => {
    const updated = invoiceItems.map((item, i) => i === idx ? { ...item, [field]: value } : item)
    setInvoiceItems(updated)
    if (field === 'productId') {
      const p = products.find(p => p.id === parseInt(value))
      if (p) { updated[idx] = { ...updated[idx], productName: p.name, barcode: p.barcode || '' }; setInvoiceItems([...updated]) }
    }
    setInvoiceForm(f => ({ ...f, totalAmount: updated.reduce((s, i) => s + (parseInt(i.quantity || '0') * parseFloat(i.unitPrice || '0')), 0) }))
  }
  const submitInvoice = async () => {
    if (!invoiceForm.invoiceNo || !invoiceForm.supplier || !invoiceItems.length) return
    try {
      const res = await fetch('/api/purchase-invoices', {
        method: 'POST', credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...invoiceForm, date: new Date(invoiceForm.date).toISOString(), items: invoiceItems.map(i => ({ productId: i.productId, quantity: parseInt(i.quantity) || 0, unitPrice: parseFloat(i.unitPrice) || 0 })) }),
      })
      if (res.ok) { setShowInvoiceForm(false); setInvoiceForm({ invoiceNo: '', supplier: '', date: new Date().toISOString().split('T')[0], totalAmount: 0, note: '' }); setInvoiceItems([]); fetchInvoices() }
    } catch {}
  }

  const filtered = products.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) || (p.barcode || '').toLowerCase().includes(search.toLowerCase())
  )
  const unlinkedMp = mpData?.unlinkedProducts || []

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Stok Yönetimi</h1>
          <p className="text-gray-500 text-sm mt-1">Stok, fiyat, hareketler, alış faturaları ve pazaryeri birleştirme</p>
        </div>
      </div>

      <div className="flex gap-1.5 flex-wrap border-b border-[#1a2332] pb-0.5">
        {TABS.map(t => {
          const active = tab === t.key
          const Icon = t.icon
          return (
            <button key={t.key} onClick={() => { setTab(t.key); if (t.key === 'movements') fetchMovements(); if (t.key === 'invoices') fetchInvoices() }}
              className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-t-xl transition-all border-b-2 ${active ? 'text-violet-400 border-violet-400 bg-violet-500/5' : 'text-gray-500 border-transparent hover:text-gray-300 hover:border-gray-600'}`}>
              <Icon size={16} /> {t.label}
            </button>
          )
        })}
      </div>

      {syncResults && (
        <div className="glass rounded-2xl border border-violet-500/20 p-4 space-y-2">
          {syncResults.map((r, i) => (
            <div key={i} className={`flex items-center gap-2 text-xs ${r.success ? 'text-emerald-400' : 'text-red-400'}`}>
              <span className={`w-2 h-2 rounded-full shrink-0 ${r.success ? 'bg-emerald-400' : 'bg-red-400'}`}></span>
              <span className="font-medium capitalize">{r.platform}:</span> {r.message}
            </div>
          ))}
        </div>
      )}

      {tab === 'products' && (
        <>
          <div className="flex items-center gap-2 flex-wrap">
            <button onClick={pullFromMarketplaces} disabled={syncing} className="flex items-center gap-2 px-4 py-2.5 bg-[#1a2332] text-gray-300 rounded-xl text-sm font-medium hover:bg-[#243040] transition-all disabled:opacity-50">
              <Store size={16} /> Pazaryerlerinden Cek
            </button>
            {unlinkedMp.length > 0 && (
              <button onClick={mergeAuto} disabled={syncing} className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-emerald-600 to-emerald-500 text-white rounded-xl text-sm font-medium hover:shadow-lg hover:shadow-emerald-500/25 transition-all disabled:opacity-50">
                <Link2 size={16} /> {unlinkedMp.length} Urunu Birlestir
              </button>
            )}
            <button onClick={syncAll} disabled={syncing} className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-violet-600 to-violet-500 text-white rounded-xl text-sm font-medium hover:shadow-lg hover:shadow-violet-500/25 transition-all disabled:opacity-50">
              <RefreshCw size={16} className={syncing ? 'animate-spin' : ''} /> Pazaryerlerine Gonder
            </button>
          </div>

          <div className="flex gap-3 flex-wrap items-center">
            <div className="relative flex-1 min-w-[200px] max-w-xs">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Urun veya barkod ara..." className="w-full bg-[#0d1117]/80 border border-[#1a2332] rounded-xl pl-9 pr-4 py-2 text-white text-sm focus:outline-none focus:border-violet-500/50 placeholder-gray-600 transition-all" />
            </div>
            <button onClick={fetchProducts} className="px-3 py-2 text-xs text-gray-500 hover:text-white transition-all flex items-center gap-1"><RefreshCw size={12} /> Yenile</button>
          </div>

          <div className="glass rounded-2xl border border-cyan-500/20 p-4 flex items-center gap-3">
            <Barcode size={20} className="text-cyan-400 flex-shrink-0" />
            <input value={barcodeInput} onChange={e => setBarcodeInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && scanBarcode()}
              placeholder="Barkod okut veya gir -- urun varsa stok ekle, yoksa olustur..." autoComplete="off"
              className="flex-1 bg-[#080b12]/80 border border-[#1a2332] rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-cyan-500/50 placeholder-gray-600" />
            <button onClick={scanBarcode} disabled={scanning || !barcodeInput.trim()} className="px-4 py-2.5 bg-gradient-to-r from-cyan-600 to-cyan-500 text-white rounded-xl text-sm font-medium hover:shadow-lg hover:shadow-cyan-500/25 transition-all disabled:opacity-50 flex items-center gap-1">
              {scanning ? <Loader2 size={14} className="animate-spin" /> : <Barcode size={14} />} Sorgula
            </button>
          </div>

          <div className="glass rounded-2xl border border-[#1a2332] overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 bg-[#080b12]/50 border-b border-[#1a2332]">
              <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">Yerel Urunler ({filtered.length})</span>
              <span className="text-xs text-gray-600">{products.filter(p => p.barcode).length}/{products.length} barkodlu</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[#1a2332] bg-[#080b12]/50">
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Barkod</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Urun</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Kategori</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Stok</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Fiyat</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Islem</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1a2332]">
                  {loading ? (
                    <tr><td colSpan={6} className="px-4 py-16 text-center text-gray-500"><Loader2 size={24} className="animate-spin mx-auto mb-2" />Yukleniyor...</td></tr>
                  ) : filtered.length === 0 ? (
                    <tr><td colSpan={6} className="px-4 py-16 text-center text-gray-500"><Package size={36} className="mx-auto mb-2 text-gray-700" /><p>Urun bulunamadi</p></td></tr>
                  ) : filtered.map(p => {
                    const isEditing = editingStock?.id === p.id
                    return (
                      <tr key={p.id} className="hover:bg-white/[0.02] transition-colors">
                        <td className="px-4 py-3">{p.barcode ? <span className="flex items-center gap-1.5 text-cyan-400 text-xs"><Barcode size={12} />{p.barcode}</span> : <span className="text-gray-600 text-xs">--</span>}</td>
                        <td className="px-4 py-3 text-white font-medium">{p.name}</td>
                        <td className="px-4 py-3 text-gray-400 text-xs">{p.category || '--'}</td>
                        <td className="px-4 py-3 text-right">{isEditing ? <input type="number" value={editingStock!.stock} onChange={e => setEditingStock({ ...editingStock!, stock: parseInt(e.target.value) || 0 })} className="w-20 text-right bg-[#080b12]/80 border border-violet-500/50 rounded-lg px-2 py-1 text-white text-sm focus:outline-none" autoFocus /> : <span className={`font-medium ${p.stock > 50 ? 'text-emerald-400' : p.stock > 0 ? 'text-amber-400' : 'text-red-400'}`}>{p.stock}</span>}</td>
                        <td className="px-4 py-3 text-right">{isEditing ? <input type="number" step="0.01" value={editingStock!.price} onChange={e => setEditingStock({ ...editingStock!, price: parseFloat(e.target.value) || 0 })} className="w-24 text-right bg-[#080b12]/80 border border-violet-500/50 rounded-lg px-2 py-1 text-white text-sm focus:outline-none" /> : <span className="text-emerald-400 font-medium">{p.price.toFixed(2)} TL</span>}</td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button onClick={() => setStockModal({ product: p, type: 'ADD', qty: '1', note: '' })} className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 transition-all" title="Stok Ekle"><Plus size={14} /></button>
                            <button onClick={() => setStockModal({ product: p, type: 'DEDUCT', qty: '1', note: '' })} className="p-1.5 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-all" title="Stok Dus"><Minus size={14} /></button>
                            {isEditing ? (<><button onClick={saveStock} className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 transition-all"><Check size={14} /></button><button onClick={() => setEditingStock(null)} className="p-1.5 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-all"><X size={14} /></button></>) : (<button onClick={() => setEditingStock({ id: p.id, stock: p.stock, price: p.price })} className="px-3 py-1.5 rounded-lg bg-violet-500/10 text-violet-400 text-xs font-medium hover:bg-violet-500/20 transition-all border border-violet-500/20">Duzenle</button>)}
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>

          <div className="flex items-center gap-4 text-xs text-gray-500 px-2 flex-wrap">
            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-emerald-400/30"></span> Stok &gt; 50</span>
            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-amber-400/30"></span> Stok &gt; 0</span>
            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-red-400/30"></span> Stok = 0</span>
          </div>
        </>
      )}

      {tab === 'movements' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-500">Toplam {movementsTotal} hareket</p>
            <button onClick={fetchMovements} className="flex items-center gap-2 px-4 py-2 bg-[#1a2332] text-gray-300 rounded-xl text-sm font-medium hover:bg-[#243040] transition-all"><RefreshCw size={14} /> Yenile</button>
          </div>
          <div className="glass rounded-2xl border border-[#1a2332] overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[#1a2332] bg-[#080b12]/50">
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tarih</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Urun</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tur</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Miktar</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Kalan</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Not</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1a2332]">
                  {movementsLoading ? (
                    <tr><td colSpan={6} className="px-4 py-16 text-center text-gray-500"><Loader2 size={24} className="animate-spin mx-auto mb-2" />Yukleniyor...</td></tr>
                  ) : movements.length === 0 ? (
                    <tr><td colSpan={6} className="px-4 py-16 text-center text-gray-500"><Package size={36} className="mx-auto mb-2 text-gray-700" /><p>Hareket bulunamadi</p></td></tr>
                  ) : movements.map(m => (
                    <tr key={m.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="px-4 py-3 text-gray-400 text-xs whitespace-nowrap">{new Date(m.createdAt).toLocaleString('tr-TR')}</td>
                      <td className="px-4 py-3 text-white font-medium">{m.product?.name || '--'}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-xs font-medium ${m.quantity > 0 ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>
                          {m.quantity > 0 ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                          {TYPE_LABELS[m.type] || m.type}
                        </span>
                      </td>
                      <td className={`px-4 py-3 text-right font-medium ${m.quantity > 0 ? 'text-emerald-400' : 'text-red-400'}`}>{m.quantity > 0 ? '+' : ''}{m.quantity}</td>
                      <td className="px-4 py-3 text-right text-gray-300 font-medium">{m.balance}</td>
                      <td className="px-4 py-3 text-gray-500 text-xs">{(m.reference ? m.reference + ' -- ' : '') + (m.note || '')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          {movementsTotal > 50 && (
            <div className="flex items-center justify-center gap-2">
              <button onClick={() => setMovementsPage(p => Math.max(0, p - 1))} disabled={movementsPage === 0} className="px-4 py-2 rounded-xl bg-[#1a2332] text-gray-300 text-sm hover:bg-[#243040] disabled:opacity-50 transition-all">Onceki</button>
              <span className="text-gray-500 text-sm">Sayfa {movementsPage + 1} / {Math.ceil(movementsTotal / 50)}</span>
              <button onClick={() => setMovementsPage(p => p + 1)} disabled={(movementsPage + 1) * 50 >= movementsTotal} className="px-4 py-2 rounded-xl bg-[#1a2332] text-gray-300 text-sm hover:bg-[#243040] disabled:opacity-50 transition-all">Sonraki</button>
            </div>
          )}
        </div>
      )}

      {tab === 'invoices' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-500">{invoices.length} fatura kaydedildi</p>
            <button onClick={() => { setShowInvoiceForm(true); addInvoiceItem() }} className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-emerald-600 to-emerald-500 text-white rounded-xl text-sm font-medium hover:shadow-lg hover:shadow-emerald-500/25 transition-all">
              <Plus size={16} /> Yeni Alis Faturasi
            </button>
          </div>
          {showInvoiceForm && (
            <div className="glass rounded-2xl border border-emerald-500/20 p-6 space-y-5">
              <div className="flex items-center justify-between">
                <h2 className="text-white font-bold text-lg">Yeni Alis Faturasi</h2>
                <button onClick={() => setShowInvoiceForm(false)} className="text-gray-500 hover:text-white transition-all"><X size={18} /></button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div><label className="text-xs text-gray-500 mb-1 block">Fatura No</label><input value={invoiceForm.invoiceNo} onChange={e => setInvoiceForm({ ...invoiceForm, invoiceNo: e.target.value })} className="w-full bg-[#080b12]/80 border border-[#1a2332] rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-emerald-500/50" /></div>
                <div><label className="text-xs text-gray-500 mb-1 block">Tedarikci</label><input value={invoiceForm.supplier} onChange={e => setInvoiceForm({ ...invoiceForm, supplier: e.target.value })} className="w-full bg-[#080b12]/80 border border-[#1a2332] rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-emerald-500/50" /></div>
                <div><label className="text-xs text-gray-500 mb-1 block">Tarih</label><input type="date" value={invoiceForm.date} onChange={e => setInvoiceForm({ ...invoiceForm, date: e.target.value })} className="w-full bg-[#080b12]/80 border border-[#1a2332] rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-emerald-500/50" /></div>
              </div>
              <div><label className="text-xs text-gray-500 mb-1 block">Not</label><input value={invoiceForm.note} onChange={e => setInvoiceForm({ ...invoiceForm, note: e.target.value })} className="w-full bg-[#080b12]/80 border border-[#1a2332] rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-emerald-500/50" placeholder="Istege bagli" /></div>
              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="text-xs text-gray-500 font-medium uppercase tracking-wider">Urunler</label>
                  <button onClick={addInvoiceItem} className="flex items-center gap-1 text-xs text-emerald-400 hover:text-emerald-300 transition-all"><Plus size={14} /> Urun Ekle</button>
                </div>
                <div className="space-y-2">
                  {invoiceItems.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <select value={item.productId} onChange={e => updateInvoiceItem(idx, 'productId', e.target.value)}
                        className="flex-1 bg-[#080b12]/80 border border-[#1a2332] rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-emerald-500/50">
                        <option value="0">Urun sec</option>
                        {products.map(p => <option key={p.id} value={p.id}>{p.name} ({p.barcode || 'barkod yok'}) -- Stok: {p.stock}</option>)}
                      </select>
                      <input type="number" min="1" value={item.quantity} onChange={e => updateInvoiceItem(idx, 'quantity', e.target.value)}
                        className="w-20 bg-[#080b12]/80 border border-[#1a2332] rounded-xl px-3 py-2 text-white text-sm text-center focus:outline-none focus:border-emerald-500/50" placeholder="Adet" />
                      <input type="number" min="0" step="0.01" value={item.unitPrice} onChange={e => updateInvoiceItem(idx, 'unitPrice', e.target.value)}
                        className="w-28 bg-[#080b12]/80 border border-[#1a2332] rounded-xl px-3 py-2 text-white text-sm text-right focus:outline-none focus:border-emerald-500/50" placeholder="Birim Fiyat" />
                      <span className="text-emerald-400 font-medium text-sm w-24 text-right">{(parseInt(item.quantity || '0') * parseFloat(item.unitPrice || '0')).toFixed(2)} TL</span>
                      <button onClick={() => removeInvoiceItem(idx)} className="p-2 text-red-400 hover:text-red-300 transition-all"><Trash2 size={16} /></button>
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex items-center justify-between border-t border-[#1a2332] pt-4">
                <span className="text-gray-400 text-sm">Toplam: <strong className="text-white text-lg">{invoiceForm.totalAmount.toFixed(2)} TL</strong></span>
                <button onClick={submitInvoice} disabled={!invoiceForm.invoiceNo || !invoiceForm.supplier || !invoiceItems.some(i => i.productId > 0)}
                  className="px-6 py-2.5 bg-gradient-to-r from-emerald-600 to-emerald-500 text-white rounded-xl text-sm font-medium hover:shadow-lg hover:shadow-emerald-500/25 transition-all disabled:opacity-50">
                  Faturayi Kaydet & Stoga Isle
                </button>
              </div>
            </div>
          )}
          <div className="glass rounded-2xl border border-[#1a2332] overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[#1a2332] bg-[#080b12]/50">
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fatura No</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tedarikci</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tarih</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Urunler</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Tutar</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1a2332]">
                  {invoicesLoading ? (
                    <tr><td colSpan={5} className="px-4 py-16 text-center text-gray-500"><Loader2 size={24} className="animate-spin mx-auto mb-2" />Yukleniyor...</td></tr>
                  ) : invoices.length === 0 ? (
                    <tr><td colSpan={5} className="px-4 py-16 text-center text-gray-500"><FileText size={36} className="mx-auto mb-2 text-gray-700" /><p>Henuz fatura girilmedi</p></td></tr>
                  ) : invoices.map(inv => (
                    <tr key={inv.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="px-4 py-3 text-white font-medium">{inv.invoiceNo}</td>
                      <td className="px-4 py-3 text-gray-300">{inv.supplier}</td>
                      <td className="px-4 py-3 text-gray-400 text-xs">{new Date(inv.date).toLocaleDateString('tr-TR')}</td>
                      <td className="px-4 py-3"><div className="flex flex-wrap gap-1">{inv.items?.map((item: any) => (<span key={item.id} className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-500/10 text-emerald-400 rounded-lg text-xs">{item.productName} <span className="text-gray-500">x{item.quantity}</span></span>))}</div></td>
                      <td className="px-4 py-3 text-right text-emerald-400 font-medium">{inv.totalAmount.toFixed(2)} TL</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {tab === 'marketplace' && (
        <div className="space-y-4">
          <div className="flex items-center gap-2 flex-wrap">
            <button onClick={pullFromMarketplaces} disabled={syncing} className="flex items-center gap-2 px-4 py-2.5 bg-[#1a2332] text-gray-300 rounded-xl text-sm font-medium hover:bg-[#243040] transition-all disabled:opacity-50"><Store size={16} /> Pazaryerlerinden Cek</button>
            {unlinkedMp.length > 0 && (
              <button onClick={mergeAuto} disabled={syncing} className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-emerald-600 to-emerald-500 text-white rounded-xl text-sm font-medium hover:shadow-lg hover:shadow-emerald-500/25 transition-all disabled:opacity-50"><Link2 size={16} /> {unlinkedMp.length} Urunu Birlestir</button>
            )}
          </div>
          {mpData && (
            <div className="grid grid-cols-3 gap-4">
              <div className="glass rounded-2xl border border-[#1a2332] p-4 text-center"><p className="text-2xl font-bold text-white">{mpData.total}</p><p className="text-xs text-gray-500 mt-1">Toplam Pazaryeri Urunu</p></div>
              <div className="glass rounded-2xl border border-[#1a2332] p-4 text-center"><p className="text-2xl font-bold text-emerald-400">{mpData.linked}</p><p className="text-xs text-gray-500 mt-1">Birlestirilmis</p></div>
              <div className="glass rounded-2xl border border-[#1a2332] p-4 text-center"><p className="text-2xl font-bold text-amber-400">{mpData.unlinked}</p><p className="text-xs text-gray-500 mt-1">Birlestirilmemis</p></div>
            </div>
          )}
          <div className="glass rounded-2xl border border-emerald-500/20 overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 bg-[#080b12]/50 border-b border-emerald-500/20">
              <span className="text-xs font-medium text-emerald-400 uppercase tracking-wider">Pazaryeri Urunleri -- Birlestirilmemis ({unlinkedMp.length})</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-emerald-500/10 bg-[#080b12]/30">
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Pazaryeri</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Barkod</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Urun</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Stok</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Fiyat</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Islem</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-emerald-500/10">
                  {unlinkedMp.length === 0 ? (
                    <tr><td colSpan={6} className="px-4 py-16 text-center text-gray-500"><Link2 size={36} className="mx-auto mb-2 text-gray-700" /><p>Tum urunler birlestirilmis</p></td></tr>
                  ) : unlinkedMp.map(mp => (
                    <tr key={mp.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="px-4 py-3"><span className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-500/10 text-blue-400 rounded-lg text-xs font-medium capitalize">{mp.platform}</span></td>
                      <td className="px-4 py-3 text-cyan-400 text-xs font-mono">{mp.barcode || '--'}</td>
                      <td className="px-4 py-3 text-white font-medium">{mp.title}</td>
                      <td className="px-4 py-3 text-right text-gray-300">{mp.stock}</td>
                      <td className="px-4 py-3 text-right text-emerald-400">{mp.price?.toFixed(2)} TL</td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button onClick={() => createLocalFromMp(mp.id)} className="px-2 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 text-xs font-medium hover:bg-emerald-500/20 transition-all">Urun Olustur</button>
                          <button onClick={() => setManualLink({ mpid: mp.id, selected: '' })} className="px-2 py-1.5 rounded-lg bg-violet-500/10 text-violet-400 text-xs font-medium hover:bg-violet-500/20 transition-all">Elle Esle</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {stockModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={() => setStockModal(null)}>
          <div className="bg-[#0d1117] rounded-2xl border border-[#1a2332] p-6 w-full max-w-md" onClick={e => e.stopPropagation()}>
            <h3 className="text-white font-bold text-lg mb-1">{stockModal.type === 'ADD' ? 'Stok Ekle' : 'Stok Dus'}</h3>
            <p className="text-gray-400 text-sm mb-4">{stockModal.product.name} ({stockModal.product.barcode || 'barkod yok'}) -- Mevcut stok: <span className="text-white font-medium">{stockModal.product.stock}</span></p>
            <div className="space-y-4">
              <div><label className="text-xs text-gray-500 mb-1 block">Miktar</label><input type="number" min="1" value={stockModal.qty} onChange={e => setStockModal({ ...stockModal, qty: e.target.value })} className="w-full bg-[#080b12]/80 border border-[#1a2332] rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-violet-500/50" autoFocus /></div>
              <div><label className="text-xs text-gray-500 mb-1 block">Not (opsiyonel)</label><input value={stockModal.note} onChange={e => setStockModal({ ...stockModal, note: e.target.value })} className="w-full bg-[#080b12]/80 border border-[#1a2332] rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-violet-500/50" placeholder="Sayim fazlasi, fire, vb." /></div>
              <div className="flex gap-2">
                <button onClick={() => setStockModal(null)} className="flex-1 px-4 py-2.5 bg-[#1a2332] text-gray-300 rounded-xl text-sm font-medium hover:bg-[#243040] transition-all">Iptal</button>
                <button onClick={applyStockChange} className="flex-1 px-4 py-2.5 rounded-xl text-sm font-medium text-white transition-all bg-violet-600 hover:bg-violet-700">{stockModal.type === 'ADD' ? 'Stok Ekle' : 'Stok Dus'}</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {createProduct && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={() => setCreateProduct(null)}>
          <div className="bg-[#0d1117] rounded-2xl border border-cyan-500/20 p-6 w-full max-w-md" onClick={e => e.stopPropagation()}>
            <h3 className="text-white font-bold text-lg mb-1">Yeni Urun Olustur</h3>
            <p className="text-gray-400 text-sm mb-4">Barkod: <span className="text-cyan-400 font-mono">{createProduct.barcode}</span> -- Bu barkodla eslesen urun bulunamadi.</p>
            <div className="space-y-4">
              <div><label className="text-xs text-gray-500 mb-1 block">Urun Adi *</label><input value={createForm.name} onChange={e => setCreateForm({ ...createForm, name: e.target.value })} className="w-full bg-[#080b12]/80 border border-[#1a2332] rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-cyan-500/50" autoFocus /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="text-xs text-gray-500 mb-1 block">Fiyat (TL)</label><input type="number" step="0.01" min="0" value={createForm.price} onChange={e => setCreateForm({ ...createForm, price: e.target.value })} className="w-full bg-[#080b12]/80 border border-[#1a2332] rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-cyan-500/50" /></div>
                <div><label className="text-xs text-gray-500 mb-1 block">Stok</label><input type="number" min="0" value={createForm.stock} onChange={e => setCreateForm({ ...createForm, stock: e.target.value })} className="w-full bg-[#080b12]/80 border border-[#1a2332] rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-cyan-500/50" /></div>
              </div>
              <div><label className="text-xs text-gray-500 mb-1 block">Kategori</label><input value={createForm.category} onChange={e => setCreateForm({ ...createForm, category: e.target.value })} className="w-full bg-[#080b12]/80 border border-[#1a2332] rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-cyan-500/50" placeholder="Orn: Yiyecek, Icecek..." /></div>
              <div className="flex gap-2">
                <button onClick={() => setCreateProduct(null)} className="flex-1 px-4 py-2.5 bg-[#1a2332] text-gray-300 rounded-xl text-sm font-medium hover:bg-[#243040] transition-all">Iptal</button>
                <button onClick={submitCreateProduct} disabled={!createForm.name} className="flex-1 px-4 py-2.5 rounded-xl text-sm font-medium text-white transition-all bg-cyan-600 hover:bg-cyan-700">Urunu Olustur & Stoga Ekle</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {manualLink && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={() => setManualLink(null)}>
          <div className="bg-[#0d1117] rounded-2xl border border-[#1a2332] p-6 w-full max-w-md" onClick={e => e.stopPropagation()}>
            <h3 className="text-white font-bold text-lg mb-4">Elle Eslestir</h3>
            <p className="text-gray-400 text-sm mb-4">Bu pazaryeri urununu hangi yerel urunle eslestirmek istiyorsun? (Yerel urunun barkodu guncellenir)</p>
            <select value={manualLink.selected} onChange={e => setManualLink({ ...manualLink, selected: e.target.value })} className="w-full bg-[#080b12]/80 border border-[#1a2332] rounded-xl px-4 py-2.5 text-white text-sm mb-4 focus:outline-none focus:border-violet-500/50">
              <option value="">Urun sec</option>
              {products.map(p => <option key={p.id} value={p.id}>{p.name} ({p.barcode || 'barkod yok'})</option>)}
            </select>
            <div className="flex gap-2">
              <button onClick={() => setManualLink(null)} className="flex-1 px-4 py-2.5 bg-[#1a2332] text-gray-300 rounded-xl text-sm font-medium hover:bg-[#243040] transition-all">Iptal</button>
              <button onClick={linkManual} disabled={!manualLink.selected} className="flex-1 px-4 py-2.5 rounded-xl text-sm font-medium text-white transition-all bg-violet-600 hover:bg-violet-700 disabled:opacity-50"><ArrowRight size={16} className="inline mr-1" />Eslestir</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
