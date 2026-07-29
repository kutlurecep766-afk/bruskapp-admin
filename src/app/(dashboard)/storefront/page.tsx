'use client'
import { useState, useEffect } from 'react'
import { Store, Plus, Trash2, Save, QrCode, Download, Search, Table2, Package, Image, DollarSign } from 'lucide-react'

export default function StorefrontPage() {
  const [tenants, setTenants] = useState<any[]>([])
  const [selectedTenant, setSelectedTenant] = useState<any>(null)
  const [products, setProducts] = useState<any[]>([])
  const [masaNumbers, setMasaNumbers] = useState<number[]>([])
  const [newMasa, setNewMasa] = useState('')
  const [newProduct, setNewProduct] = useState({ name: '', price: '', description: '', image: '', category: '' })
  const [editingProduct, setEditingProduct] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [search, setSearch] = useState('')
  const [menuUrl, setMenuUrl] = useState('')

  useEffect(() => {
    fetch('/api/tenants', { credentials: 'include' }).then(r => r.ok ? r.json() : []).then(data => {
      setTenants(data)
      setLoading(false)
    })
  }, [])

  const loadStorefront = async (tenant: any) => {
    setSelectedTenant(tenant)
    setMenuUrl(`https://bruskapp.com/menu/${tenant.slug}`)
    try {
      const [productsRes, menuRes] = await Promise.all([
        fetch(`/api/storefront/admin/${tenant.id}/products`, { credentials: 'include' }),
        fetch(`/api/storefront/${tenant.slug}`),
      ])
      if (productsRes.ok) setProducts(await productsRes.json())
      if (menuRes.ok) {
        const data = await menuRes.json()
        setMasaNumbers(data.masaNumbers || [])
      }
    } catch {}
  }

  const addProduct = async () => {
    if (!newProduct.name || !newProduct.price) return
    setSaving(true)
    const res = await fetch(`/api/storefront/admin/${selectedTenant.id}/products`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'include',
      body: JSON.stringify({ ...newProduct, price: parseFloat(newProduct.price) }),
    })
    if (res.ok) {
      const p = await res.json()
      setProducts(prev => [...prev, p])
      setNewProduct({ name: '', price: '', description: '', image: '', category: '' })
    }
    setSaving(false)
  }

  const updateProduct = async () => {
    if (!editingProduct) return
    setSaving(true)
    const res = await fetch(`/api/storefront/admin/${selectedTenant.id}/products/${editingProduct.id}`, {
      method: 'PUT', headers: { 'Content-Type': 'application/json' }, credentials: 'include',
      body: JSON.stringify(editingProduct),
    })
    if (res.ok) {
      const updated = await res.json()
      setProducts(prev => prev.map(p => p.id === updated.id ? updated : p))
      setEditingProduct(null)
    }
    setSaving(false)
  }

  const deleteProduct = async (id: string) => {
    if (!confirm('Urunu silmek istediginize emin misiniz?')) return
    await fetch(`/api/storefront/admin/${selectedTenant.id}/products/${id}`, { method: 'DELETE', credentials: 'include' })
    setProducts(prev => prev.filter(p => p.id !== id))
  }

  const addMasa = () => {
    const num = parseInt(newMasa)
    if (isNaN(num) || masaNumbers.includes(num)) return
    setMasaNumbers(prev => [...prev, num].sort())
    setNewMasa('')
  }

  const removeMasa = (num: number) => {
    setMasaNumbers(prev => prev.filter(n => n !== num))
  }

  const saveConfig = async () => {
    setSaving(true)
    await fetch(`/api/storefront/admin/${selectedTenant.id}/config`, {
      method: 'PUT', headers: { 'Content-Type': 'application/json' }, credentials: 'include',
      body: JSON.stringify({ masaNumbers }),
    })
    setSaving(false)
  }

  const qrUrl = menuUrl ? `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(menuUrl)}` : ''

  const filtered = tenants.filter((t: any) =>
    t.name?.toLowerCase().includes(search.toLowerCase()) || t.slug?.toLowerCase().includes(search.toLowerCase())
  )

  if (loading) return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" /></div>

  return (
    <div className="space-y-6 pb-12">
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#0f1420] via-[#0d1117] to-[#0a0e14] border border-[#1a2332] p-6 lg:p-8">
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl" />
        <div className="relative flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <Store className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">QR Menü Yönetimi</h1>
              <p className="text-sm text-gray-500 mt-0.5">İşletmelerin dijital menü ve masa sipariş sistemi</p>
            </div>
          </div>
        </div>
      </div>

      {!selectedTenant ? (
        <div>
          <div className="relative mb-4">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="İşletme ara..." className="w-full bg-[#080b12]/80 border border-[#1a2332] rounded-xl pl-9 pr-4 py-2.5 text-white text-sm focus:outline-none focus:border-emerald-500/50 placeholder-gray-600" />
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
            {filtered.map((t: any) => (
              <button key={t.id} onClick={() => loadStorefront(t)}
                className="text-left p-4 rounded-2xl bg-[#0d1117]/80 border border-[#1a2332] hover:border-emerald-500/30 hover:bg-emerald-500/5 transition-all group">
                <p className="text-white font-semibold group-hover:text-emerald-400 transition-colors">{t.name}</p>
                <p className="text-xs text-gray-600 mt-1">{t.slug}</p>
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between bg-[#0d1117]/80 border border-[#1a2332] rounded-2xl p-4">
            <div>
              <p className="text-white font-semibold">{selectedTenant.name}</p>
              <p className="text-xs text-gray-500">{selectedTenant.slug}</p>
              <p className="text-xs text-emerald-400 mt-1">{menuUrl}</p>
            </div>
            <button onClick={() => { setSelectedTenant(null); setProducts([]); setMasaNumbers([]) }}
              className="px-4 py-2 rounded-xl bg-[#080b12]/60 border border-[#1a2332] text-gray-400 hover:text-white text-sm">Degistir</button>
          </div>

          {/* QR Code */}
          <div className="bg-[#0d1117]/80 border border-[#1a2332] rounded-2xl p-6">
            <h3 className="text-white font-semibold flex items-center gap-2 mb-4"><QrCode size={18} className="text-emerald-400" /> QR Kod</h3>
            {qrUrl && (
              <div className="flex flex-col items-center gap-3">
                <img src={qrUrl} alt="Menu QR" className="w-40 h-40 rounded-xl bg-white p-2" />
                <a href={qrUrl} download={`${selectedTenant.slug}-menu-qr.png`}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-sm hover:bg-emerald-500/20 transition-all">
                  <Download size={16} /> QR Indir
                </a>
              </div>
            )}
          </div>

          {/* Products */}
          <div className="bg-[#0d1117]/80 border border-[#1a2332] rounded-2xl p-6">
            <h3 className="text-white font-semibold flex items-center gap-2 mb-4"><Package size={18} className="text-emerald-400" /> Urunler</h3>

            {/* Product list */}
            <div className="space-y-2 mb-4">
              {products.length === 0 && <p className="text-gray-500 text-sm">Henuz urun eklenmemis</p>}
              {products.map((p: any) => (
                <div key={p.id} className="flex items-center justify-between p-3 rounded-xl bg-[#080b12]/60 border border-[#1a2332]">
                  <div className="flex items-center gap-3">
                    {p.image && <img src={p.image} className="w-10 h-10 rounded-lg object-cover" />}
                    <div>
                      <p className="text-white text-sm font-medium">{p.name}</p>
                      <p className="text-xs text-gray-500">{p.description} {p.category && `(${p.category})`}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-emerald-400 font-bold text-sm">₺{p.price}</span>
                    <button onClick={() => setEditingProduct({ ...p })} className="text-gray-500 hover:text-white text-xs">Duzenle</button>
                    <button onClick={() => deleteProduct(p.id)} className="text-red-500 hover:text-red-400"><Trash2 size={14} /></button>
                  </div>
                </div>
              ))}
            </div>

            {/* Edit product form */}
            {editingProduct ? (
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3 p-4 rounded-xl bg-[#080b12]/60 border border-[#1a2332]">
                <input value={editingProduct.name} onChange={e => setEditingProduct({ ...editingProduct, name: e.target.value })} placeholder="Urun adi" className="col-span-2 bg-[#0d1117]/80 border border-[#1a2332] rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-emerald-500/50 placeholder-gray-600" />
                <input value={editingProduct.price} onChange={e => setEditingProduct({ ...editingProduct, price: e.target.value })} type="number" step="0.01" placeholder="Fiyat" className="bg-[#0d1117]/80 border border-[#1a2332] rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-emerald-500/50 placeholder-gray-600" />
                <input value={editingProduct.category || ''} onChange={e => setEditingProduct({ ...editingProduct, category: e.target.value })} placeholder="Kategori" className="bg-[#0d1117]/80 border border-[#1a2332] rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-emerald-500/50 placeholder-gray-600" />
                <div className="flex gap-2">
                  <button onClick={updateProduct} disabled={saving} className="flex-1 px-3 py-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-sm hover:bg-emerald-500/20 transition-all"><Save size={14} className="inline mr-1" />Kaydet</button>
                  <button onClick={() => setEditingProduct(null)} className="px-3 py-2 rounded-xl bg-[#080b12]/60 border border-[#1a2332] text-gray-500 text-sm hover:text-white">Iptal</button>
                </div>
              </div>
            ) : (
              /* Add product form */
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3 p-4 rounded-xl bg-[#080b12]/60 border border-[#1a2332]">
                <input value={newProduct.name} onChange={e => setNewProduct({ ...newProduct, name: e.target.value })} placeholder="Urun adi" className="col-span-2 bg-[#0d1117]/80 border border-[#1a2332] rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-emerald-500/50 placeholder-gray-600" />
                <input value={newProduct.price} onChange={e => setNewProduct({ ...newProduct, price: e.target.value })} type="number" step="0.01" placeholder="Fiyat" className="bg-[#0d1117]/80 border border-[#1a2332] rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-emerald-500/50 placeholder-gray-600" />
                <input value={newProduct.category || ''} onChange={e => setNewProduct({ ...newProduct, category: e.target.value })} placeholder="Kategori" className="bg-[#0d1117]/80 border border-[#1a2332] rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-emerald-500/50 placeholder-gray-600" />
                <button onClick={addProduct} disabled={saving || !newProduct.name || !newProduct.price}
                  className="flex items-center justify-center gap-1 px-3 py-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-sm hover:bg-emerald-500/20 transition-all disabled:opacity-50">
                  <Plus size={14} /> Ekle
                </button>
                <input value={newProduct.image} onChange={e => setNewProduct({ ...newProduct, image: e.target.value })} placeholder="Gorsel URL (opsiyonel)" className="col-span-2 md:col-span-5 bg-[#0d1117]/80 border border-[#1a2332] rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-emerald-500/50 placeholder-gray-600" />
                <input value={newProduct.description} onChange={e => setNewProduct({ ...newProduct, description: e.target.value })} placeholder="Aciklama (opsiyonel)" className="col-span-2 md:col-span-5 bg-[#0d1117]/80 border border-[#1a2332] rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-emerald-500/50 placeholder-gray-600" />
              </div>
            )}
          </div>

          {/* Masa Numbers */}
          <div className="bg-[#0d1117]/80 border border-[#1a2332] rounded-2xl p-6">
            <h3 className="text-white font-semibold flex items-center gap-2 mb-4"><Table2 size={18} className="text-emerald-400" /> Masa Numaralari</h3>
            <div className="flex gap-2 mb-3">
              <input value={newMasa} onChange={e => setNewMasa(e.target.value)} type="number" placeholder="Masa no" className="w-32 bg-[#080b12]/80 border border-[#1a2332] rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-emerald-500/50 placeholder-gray-600" />
              <button onClick={addMasa} className="px-3 py-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-sm hover:bg-emerald-500/20 transition-all"><Plus size={14} className="inline mr-1" />Ekle</button>
            </div>
            <div className="flex flex-wrap gap-2">
              {masaNumbers.map(n => (
                <span key={n} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#080b12]/60 border border-[#1a2332] text-white text-sm">
                  Masa {n}
                  <button onClick={() => removeMasa(n)} className="text-red-500 hover:text-red-400"><Trash2 size={12} /></button>
                </span>
              ))}
            </div>
            <button onClick={saveConfig} disabled={saving} className="mt-4 px-4 py-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-sm hover:bg-emerald-500/20 transition-all"><Save size={14} className="inline mr-1" />Kaydet</button>
          </div>
        </div>
      )}
    </div>
  )
}
