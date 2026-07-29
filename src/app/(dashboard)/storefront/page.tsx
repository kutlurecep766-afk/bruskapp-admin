'use client'
import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { Store, Plus, Trash2, Save, QrCode, Download, Table2, Package, Image, Link } from 'lucide-react'

export default function StorefrontPage() {
  const searchParams = useSearchParams()
  const tenantIdParam = searchParams.get('tenantId')

  const [storefront, setStorefront] = useState<any>(null)
  const [products, setProducts] = useState<any[]>([])
  const [masaNumbers, setMasaNumbers] = useState<number[]>([])
  const [newMasa, setNewMasa] = useState('')
  const [newProduct, setNewProduct] = useState({ name: '', price: '', originalPrice: '', weight: '', description: '', image: '', category: '' })
  const [editingProduct, setEditingProduct] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [bannerFile, setBannerFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)

  const loadData = async () => {
    setLoading(true)
    setError('')
    try {
      if (tenantIdParam) {
        const [tenantRes, productsRes] = await Promise.all([
          fetch(`/api/tenants/${tenantIdParam}`, { credentials: 'include' }),
          fetch(`/api/storefront/admin/${tenantIdParam}/products`, { credentials: 'include' }),
        ])
        if (tenantRes.ok) {
          const tenant = await tenantRes.json()
          const cfg = typeof tenant.storefrontConfig === 'string' ? JSON.parse(tenant.storefrontConfig) : (tenant.storefrontConfig || {})
          setStorefront({
            name: tenant.siteTitle || tenant.name,
            slug: tenant.slug,
            primaryColor: tenant.primaryColor,
            secondaryColor: tenant.secondaryColor,
            bannerUrl: cfg.bannerUrl || '',
          })
          setMasaNumbers(cfg.masaNumbers || [])
        }
        if (productsRes.ok) setProducts(await productsRes.json())
      } else {
        const res = await fetch('/api/storefront/admin/me', { credentials: 'include' })
        if (res.ok) {
          const data = await res.json()
          setStorefront(data)
          setProducts(data.products || [])
          setMasaNumbers(data.masaNumbers || [])
        } else {
          setError('Bu sayfaya erişim yetkiniz yok')
        }
      }
    } catch { setError('Veri yüklenirken hata oluştu') }
    finally { setLoading(false) }
  }

  useEffect(() => { loadData() }, [tenantIdParam])

  const uploadFile = async (file: File): Promise<string | null> => {
    const form = new FormData()
    form.append('file', file)
    const res = await fetch('/api/upload', { method: 'POST', credentials: 'include', body: form })
    if (res.ok) {
      const data = await res.json()
      return data.url
    }
    return null
  }

  const handleBannerUpload = async () => {
    if (!bannerFile) return
    setUploading(true)
    const url = await uploadFile(bannerFile)
    if (url) {
      const tid = activeTenantId()
      if (tid) {
        await fetch(`/api/storefront/admin/${tid}/config`, {
          method: 'PUT', headers: { 'Content-Type': 'application/json' }, credentials: 'include',
          body: JSON.stringify({ bannerUrl: url }),
        })
      } else {
        await fetch('/api/storefront/admin/me/config', {
          method: 'PUT', headers: { 'Content-Type': 'application/json' }, credentials: 'include',
          body: JSON.stringify({ bannerUrl: url }),
        })
      }
      setStorefront((prev: any) => ({ ...prev, bannerUrl: url }))
      setBannerFile(null)
    }
    setUploading(false)
  }

  const activeTenantId = () => tenantIdParam || storefront?.id

  const addProduct = async () => {
    if (!newProduct.name || !newProduct.price) return
    setSaving(true)
    const tid = activeTenantId()
    if (!tid) { setSaving(false); return }
    const res = await fetch(`/api/storefront/admin/${tid}/products`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'include',
      body: JSON.stringify({ ...newProduct, price: parseFloat(newProduct.price) }),
    })
    if (res.ok) {
      const p = await res.json()
      setProducts(prev => [...prev, p])
      setNewProduct({ name: '', price: '', originalPrice: '', weight: '', description: '', image: '', category: '' })
    }
    setSaving(false)
  }

  const updateProduct = async () => {
    if (!editingProduct) return
    setSaving(true)
    const tid = activeTenantId()
    if (!tid) { setSaving(false); return }
    const res = await fetch(`/api/storefront/admin/${tid}/products/${editingProduct.id}`, {
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
    if (!confirm('Ürünü silmek istediğinize emin misiniz?')) return
    const tid = activeTenantId()
    if (!tid) return
    await fetch(`/api/storefront/admin/${tid}/products/${id}`, { method: 'DELETE', credentials: 'include' })
    setProducts(prev => prev.filter(p => p.id !== id))
  }

  const addMasa = () => {
    const num = parseInt(newMasa)
    if (isNaN(num) || masaNumbers.includes(num)) return
    setMasaNumbers(prev => [...prev, num].sort((a, b) => a - b))
    setNewMasa('')
  }

  const removeMasa = (num: number) => {
    setMasaNumbers(prev => prev.filter(n => n !== num))
  }

  const saveConfig = async () => {
    setSaving(true)
    const tid = activeTenantId()
    if (tid) {
      await fetch(`/api/storefront/admin/${tid}/config`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' }, credentials: 'include',
        body: JSON.stringify({ masaNumbers }),
      })
    } else {
      await fetch('/api/storefront/admin/me/config', {
        method: 'PUT', headers: { 'Content-Type': 'application/json' }, credentials: 'include',
        body: JSON.stringify({ masaNumbers }),
      })
    }
    setSaving(false)
  }

  const slug = storefront?.slug || ''
  const menuUrl = slug ? `https://bruskapp.com/menu/${slug}` : ''
  const qrUrl = menuUrl ? `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(menuUrl)}` : ''

  if (loading) return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" /></div>

  if (error) return (
    <div className="flex items-center justify-center h-64">
      <div className="text-center">
        <Store className="w-12 h-12 text-gray-600 mx-auto mb-3" />
        <p className="text-gray-500 text-sm">{error}</p>
      </div>
    </div>
  )

  if (!storefront) return (
    <div className="flex items-center justify-center h-64">
      <div className="text-center">
        <Store className="w-12 h-12 text-gray-600 mx-auto mb-3" />
        <p className="text-gray-500 text-sm">İşletme bulunamadı</p>
      </div>
    </div>
  )

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
              <p className="text-sm text-gray-500 mt-0.5">{storefront.name}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Mağaza Linki */}
      <div className="bg-[#0d1117]/80 border border-[#1a2332] rounded-2xl p-6">
        <h3 className="text-white font-semibold flex items-center gap-2 mb-4"><Link size={18} className="text-emerald-400" /> Mağaza Linki</h3>
        <a href={menuUrl} target="_blank" rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-sm hover:bg-emerald-500/20 transition-all">
          {menuUrl}
        </a>
        <p className="text-xs text-gray-600 mt-2">Müşterileriniz bu linkten menünüzü görüntüleyebilir</p>
      </div>

      {/* QR Kod */}
      <div className="bg-[#0d1117]/80 border border-[#1a2332] rounded-2xl p-6">
        <h3 className="text-white font-semibold flex items-center gap-2 mb-4"><QrCode size={18} className="text-emerald-400" /> Masa QR Kodları</h3>
        {qrUrl && (
          <div className="flex flex-col items-center gap-3">
            <img src={qrUrl} alt="Menü QR" className="w-40 h-40 rounded-xl bg-white p-2" />
            <a href={qrUrl} download={`${slug}-menu-qr.png`}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-sm hover:bg-emerald-500/20 transition-all">
              <Download size={16} /> QR İndir
            </a>
            <p className="text-xs text-gray-600">Bu QR kod masalara bastırabilirsiniz</p>
          </div>
        )}
      </div>

      {/* Banner Yükleme */}
      <div className="bg-[#0d1117]/80 border border-[#1a2332] rounded-2xl p-6">
        <h3 className="text-white font-semibold flex items-center gap-2 mb-4"><Image size={18} className="text-emerald-400" /> Banner</h3>
        <div>
          <p className="text-sm text-gray-400 mb-2">Mevcut Banner</p>
          {storefront.bannerUrl ? (
            <img src={storefront.bannerUrl} className="w-full max-w-md h-32 rounded-xl object-cover border border-[#1a2332] mb-3" />
          ) : (
            <div className="w-full max-w-md h-32 rounded-xl bg-[#080b12]/60 border border-[#1a2332] flex items-center justify-center mb-3">
              <Image size={24} className="text-gray-600" />
            </div>
          )}
          <input type="file" accept="image/*" onChange={e => setBannerFile(e.target.files?.[0] || null)} className="text-sm text-gray-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-medium file:bg-emerald-500/10 file:text-emerald-400 hover:file:bg-emerald-500/20" />
          {bannerFile && (
            <button onClick={handleBannerUpload} disabled={uploading} className="mt-2 px-3 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs hover:bg-emerald-500/20 transition-all">
              {uploading ? 'Yükleniyor...' : 'Banner Yükle'}
            </button>
          )}
        </div>
      </div>

      {/* Ürünler */}
      <div className="bg-[#0d1117]/80 border border-[#1a2332] rounded-2xl p-6">
        <h3 className="text-white font-semibold flex items-center gap-2 mb-4"><Package size={18} className="text-emerald-400" /> Ürünler</h3>

        <div className="space-y-2 mb-4">
          {products.length === 0 && <p className="text-gray-500 text-sm">Henüz ürün eklenmemiş</p>}
          {products.map((p: any) => (
            <div key={p.id} className="flex items-center justify-between p-3 rounded-xl bg-[#080b12]/60 border border-[#1a2332]">
              <div className="flex items-center gap-3">
                {p.image && <img src={p.image} className="w-10 h-10 rounded-lg object-cover" />}
                <div>
                  <p className="text-white text-sm font-medium">{p.name}</p>
                  <p className="text-xs text-gray-500">
                    {p.weight && <span className="text-gray-400 mr-2">{p.weight}</span>}
                    {p.description} {p.category && `(${p.category})`}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-right">
                  {p.originalPrice && parseFloat(p.originalPrice) > parseFloat(p.price) ? (
                    <div>
                      <span className="text-gray-500 line-through text-xs">₺{p.originalPrice}</span>
                      <span className="text-emerald-400 font-bold text-sm ml-1">₺{p.price}</span>
                    </div>
                  ) : (
                    <span className="text-emerald-400 font-bold text-sm">₺{p.price}</span>
                  )}
                </div>
                <button onClick={() => setEditingProduct({ ...p })} className="text-gray-500 hover:text-white text-xs">Düzenle</button>
                <button onClick={() => deleteProduct(p.id)} className="text-red-500 hover:text-red-400"><Trash2 size={14} /></button>
              </div>
            </div>
          ))}
        </div>

        {editingProduct ? (
          <div className="grid grid-cols-2 md:grid-cols-6 gap-3 p-4 rounded-xl bg-[#080b12]/60 border border-[#1a2332]">
            <input value={editingProduct.name} onChange={e => setEditingProduct({ ...editingProduct, name: e.target.value })} placeholder="Ürün adı" className="col-span-2 bg-[#0d1117]/80 border border-[#1a2332] rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-emerald-500/50 placeholder-gray-600" />
            <input value={editingProduct.price} onChange={e => setEditingProduct({ ...editingProduct, price: e.target.value })} type="number" step="0.01" placeholder="Fiyat" className="bg-[#0d1117]/80 border border-[#1a2332] rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-emerald-500/50 placeholder-gray-600" />
            <input value={editingProduct.weight || ''} onChange={e => setEditingProduct({ ...editingProduct, weight: e.target.value })} placeholder="Gramaj (200 gr)" className="bg-[#0d1117]/80 border border-[#1a2332] rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-emerald-500/50 placeholder-gray-600" />
            <input value={editingProduct.originalPrice || ''} onChange={e => setEditingProduct({ ...editingProduct, originalPrice: e.target.value })} type="number" step="0.01" placeholder="İndirimli fiyat" className="bg-[#0d1117]/80 border border-[#1a2332] rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-emerald-500/50 placeholder-gray-600" />
            <input value={editingProduct.category || ''} onChange={e => setEditingProduct({ ...editingProduct, category: e.target.value })} placeholder="Kategori" className="bg-[#0d1117]/80 border border-[#1a2332] rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-emerald-500/50 placeholder-gray-600" />
            <div className="col-span-3 flex items-center gap-2">
              {editingProduct.image && <img src={editingProduct.image} className="w-8 h-8 rounded object-cover" />}
              <input type="file" accept="image/*" onChange={async e => {
                const file = e.target.files?.[0]
                if (!file) return
                const url = await uploadFile(file)
                if (url) setEditingProduct((prev: any) => ({ ...prev, image: url }))
              }} className="text-sm text-gray-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-medium file:bg-emerald-500/10 file:text-emerald-400 hover:file:bg-emerald-500/20" />
            </div>
            <input value={editingProduct.description || ''} onChange={e => setEditingProduct({ ...editingProduct, description: e.target.value })} placeholder="Açıklama (isteğe bağlı)" className="col-span-3 bg-[#0d1117]/80 border border-[#1a2332] rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-emerald-500/50 placeholder-gray-600" />
            <div className="flex gap-2 col-span-2">
              <button onClick={updateProduct} disabled={saving} className="flex-1 px-3 py-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-sm hover:bg-emerald-500/20 transition-all"><Save size={14} className="inline mr-1" />Kaydet</button>
              <button onClick={() => setEditingProduct(null)} className="px-3 py-2 rounded-xl bg-[#080b12]/60 border border-[#1a2332] text-gray-500 text-sm hover:text-white">İptal</button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-6 gap-3 p-4 rounded-xl bg-[#080b12]/60 border border-[#1a2332]">
            <input value={newProduct.name} onChange={e => setNewProduct({ ...newProduct, name: e.target.value })} placeholder="Ürün adı" className="col-span-2 bg-[#0d1117]/80 border border-[#1a2332] rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-emerald-500/50 placeholder-gray-600" />
            <input value={newProduct.price} onChange={e => setNewProduct({ ...newProduct, price: e.target.value })} type="number" step="0.01" placeholder="Fiyat" className="bg-[#0d1117]/80 border border-[#1a2332] rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-emerald-500/50 placeholder-gray-600" />
            <input value={newProduct.weight} onChange={e => setNewProduct({ ...newProduct, weight: e.target.value })} placeholder="Gramaj (200 gr)" className="bg-[#0d1117]/80 border border-[#1a2332] rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-emerald-500/50 placeholder-gray-600" />
            <input value={newProduct.originalPrice} onChange={e => setNewProduct({ ...newProduct, originalPrice: e.target.value })} type="number" step="0.01" placeholder="İndirimli fiyat" className="bg-[#0d1117]/80 border border-[#1a2332] rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-emerald-500/50 placeholder-gray-600" />
            <input value={newProduct.category || ''} onChange={e => setNewProduct({ ...newProduct, category: e.target.value })} placeholder="Kategori" className="bg-[#0d1117]/80 border border-[#1a2332] rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-emerald-500/50 placeholder-gray-600" />
            <button onClick={addProduct} disabled={saving || !newProduct.name || !newProduct.price}
              className="flex items-center justify-center gap-1 px-3 py-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-sm hover:bg-emerald-500/20 transition-all disabled:opacity-50">
              <Plus size={14} /> Ekle
            </button>
            <div className="col-span-3 flex items-center gap-2">
              <input type="file" accept="image/*" onChange={async e => {
                const file = e.target.files?.[0]
                if (!file) return
                const url = await uploadFile(file)
                if (url) setNewProduct(prev => ({ ...prev, image: url }))
              }} className="text-sm text-gray-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-medium file:bg-emerald-500/10 file:text-emerald-400 hover:file:bg-emerald-500/20" />
              {newProduct.image && <img src={newProduct.image} className="w-8 h-8 rounded object-cover" />}
            </div>
            <input value={newProduct.description} onChange={e => setNewProduct({ ...newProduct, description: e.target.value })} placeholder="Açıklama (isteğe bağlı)" className="col-span-3 bg-[#0d1117]/80 border border-[#1a2332] rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-emerald-500/50 placeholder-gray-600" />
          </div>
        )}
      </div>

      {/* Masa Numaraları */}
      <div className="bg-[#0d1117]/80 border border-[#1a2332] rounded-2xl p-6">
        <h3 className="text-white font-semibold flex items-center gap-2 mb-4"><Table2 size={18} className="text-emerald-400" /> Masa Numaraları</h3>
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
  )
}
