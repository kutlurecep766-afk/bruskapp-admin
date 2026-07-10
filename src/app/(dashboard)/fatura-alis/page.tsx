'use client'
import { useState, useEffect } from 'react'
import { Package, Plus, Search, Loader2, FileText, Trash2, Check, X, RefreshCw } from 'lucide-react'

export default function FaturaAlisPage() {
  const [invoices, setInvoices] = useState<any[]>([])
  const [products, setProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ invoiceNo: '', supplier: '', date: new Date().toISOString().split('T')[0], totalAmount: 0, note: '' })
  const [items, setItems] = useState<{ productId: number; productName: string; barcode: string; quantity: string; unitPrice: string }[]>([])

  useEffect(() => {
    Promise.all([fetchInvoices(), fetchProducts()])
  }, [])

  const fetchInvoices = async () => {
    try {
      const res = await fetch('/api/purchase-invoices', { credentials: 'include' })
      if (res.ok) setInvoices((await res.json()).items || [])
    } catch {} finally { setLoading(false) }
  }

  const fetchProducts = async () => {
    try {
      const res = await fetch('/api/products', { credentials: 'include' })
      if (res.ok) setProducts(await res.json())
    } catch {}
  }

  const addItem = () => {
    setItems([...items, { productId: 0, productName: '', barcode: '', quantity: '1', unitPrice: '0' }])
  }

  const removeItem = (idx: number) => {
    setItems(items.filter((_, i) => i !== idx))
  }

  const updateItem = (idx: number, field: string, value: any) => {
    const updated = items.map((item, i) => i === idx ? { ...item, [field]: value } : item)
    setItems(updated)
    if (field === 'productId') {
      const product = products.find(p => p.id === parseInt(value))
      if (product) {
        updated[idx] = { ...updated[idx], productName: product.name, barcode: product.barcode || '' }
        setItems([...updated])
      }
    }
    const total = updated.reduce((sum, item) => sum + (parseInt(item.quantity || '0') * parseFloat(item.unitPrice || '0')), 0)
    setForm(f => ({ ...f, totalAmount: total }))
  }

  const submitInvoice = async () => {
    if (!form.invoiceNo || !form.supplier || !items.length) return
    const payload = {
      ...form,
      date: new Date(form.date).toISOString(),
      items: items.map(item => ({
        productId: item.productId,
        quantity: parseInt(item.quantity) || 0,
        unitPrice: parseFloat(item.unitPrice) || 0,
      })),
    }
    try {
      const res = await fetch('/api/purchase-invoices', {
        method: 'POST', credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      if (res.ok) {
        setShowForm(false)
        setForm({ invoiceNo: '', supplier: '', date: new Date().toISOString().split('T')[0], totalAmount: 0, note: '' })
        setItems([])
        fetchInvoices()
      }
    } catch {}
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Alış Faturaları</h1>
          <p className="text-gray-500 text-sm mt-1">Tedarikçi faturalarını gir, stok otomatik artsın</p>
        </div>
        <button onClick={() => { setShowForm(true); addItem() }} className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-emerald-600 to-emerald-500 text-white rounded-xl text-sm font-medium hover:shadow-lg hover:shadow-emerald-500/25 transition-all">
          <Plus size={16} /> Yeni Alış Faturası
        </button>
      </div>

      {showForm && (
        <div className="glass rounded-2xl border border-emerald-500/20 p-6 space-y-5">
          <div className="flex items-center justify-between">
            <h2 className="text-white font-bold text-lg">Yeni Alış Faturası</h2>
            <button onClick={() => setShowForm(false)} className="text-gray-500 hover:text-white transition-all"><X size={18} /></button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Fatura No</label>
              <input type="text" value={form.invoiceNo} onChange={e => setForm({ ...form, invoiceNo: e.target.value })}
                className="w-full bg-[#080b12]/80 border border-[#1a2332] rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-emerald-500/50" />
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Tedarikçi</label>
              <input type="text" value={form.supplier} onChange={e => setForm({ ...form, supplier: e.target.value })}
                className="w-full bg-[#080b12]/80 border border-[#1a2332] rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-emerald-500/50" />
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Tarih</label>
              <input type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })}
                className="w-full bg-[#080b12]/80 border border-[#1a2332] rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-emerald-500/50" />
            </div>
          </div>
          <div>
            <label className="text-xs text-gray-500 mb-1 block">Not</label>
            <input type="text" value={form.note} onChange={e => setForm({ ...form, note: e.target.value })}
              className="w-full bg-[#080b12]/80 border border-[#1a2332] rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-emerald-500/50" placeholder="İsteğe bağlı" />
          </div>

          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="text-xs text-gray-500 font-medium uppercase tracking-wider">Ürünler</label>
              <button onClick={addItem} className="flex items-center gap-1 text-xs text-emerald-400 hover:text-emerald-300 transition-all"><Plus size={14} /> Ürün Ekle</button>
            </div>
            <div className="space-y-2">
              {items.map((item, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <select value={item.productId} onChange={e => updateItem(idx, 'productId', e.target.value)}
                    className="flex-1 bg-[#080b12]/80 border border-[#1a2332] rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-emerald-500/50">
                    <option value="0">Ürün seç</option>
                    {products.map(p => <option key={p.id} value={p.id}>{p.name} ({p.barcode || 'barkod yok'}) — Stok: {p.stock}</option>)}
                  </select>
                  <input type="number" min="1" value={item.quantity} onChange={e => updateItem(idx, 'quantity', e.target.value)}
                    className="w-20 bg-[#080b12]/80 border border-[#1a2332] rounded-xl px-3 py-2 text-white text-sm text-center focus:outline-none focus:border-emerald-500/50" placeholder="Adet" />
                  <input type="number" min="0" step="0.01" value={item.unitPrice} onChange={e => updateItem(idx, 'unitPrice', e.target.value)}
                    className="w-28 bg-[#080b12]/80 border border-[#1a2332] rounded-xl px-3 py-2 text-white text-sm text-right focus:outline-none focus:border-emerald-500/50" placeholder="Birim Fiyat" />
                  <span className="text-emerald-400 font-medium text-sm w-24 text-right">{(parseInt(item.quantity || '0') * parseFloat(item.unitPrice || '0')).toFixed(2)} ₺</span>
                  <button onClick={() => removeItem(idx)} className="p-2 text-red-400 hover:text-red-300 transition-all"><Trash2 size={16} /></button>
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between border-t border-[#1a2332] pt-4">
            <span className="text-gray-400 text-sm">Toplam: <strong className="text-white text-lg">{form.totalAmount.toFixed(2)} ₺</strong></span>
            <button onClick={submitInvoice} disabled={!form.invoiceNo || !form.supplier || !items.some(i => i.productId > 0)}
              className="px-6 py-2.5 bg-gradient-to-r from-emerald-600 to-emerald-500 text-white rounded-xl text-sm font-medium hover:shadow-lg hover:shadow-emerald-500/25 transition-all disabled:opacity-50">
              Faturayı Kaydet & Stoğa İşle
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
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tedarikçi</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tarih</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ürünler</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Tutar</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1a2332]">
              {loading ? (
                <tr><td colSpan={5} className="px-4 py-16 text-center text-gray-500"><Loader2 size={24} className="animate-spin mx-auto mb-2" />Yükleniyor...</td></tr>
              ) : invoices.length === 0 ? (
                <tr><td colSpan={5} className="px-4 py-16 text-center text-gray-500"><FileText size={36} className="mx-auto mb-2 text-gray-700" /><p>Henüz fatura girilmedi</p></td></tr>
              ) : invoices.map(inv => (
                <tr key={inv.id} className="hover:bg-white/[0.02] transition-colors">
                  <td className="px-4 py-3 text-white font-medium">{inv.invoiceNo}</td>
                  <td className="px-4 py-3 text-gray-300">{inv.supplier}</td>
                  <td className="px-4 py-3 text-gray-400 text-xs">{new Date(inv.date).toLocaleDateString('tr-TR')}</td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1">
                      {inv.items?.map((item: any) => (
                        <span key={item.id} className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-500/10 text-emerald-400 rounded-lg text-xs">
                          {item.productName} <span className="text-gray-500">x{item.quantity}</span>
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right text-emerald-400 font-medium">{inv.totalAmount.toFixed(2)} ₺</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
