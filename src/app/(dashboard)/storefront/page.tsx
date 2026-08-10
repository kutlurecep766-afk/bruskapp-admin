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
  const [newProduct, setNewProduct] = useState({ name: '', price: '', originalPrice: '', weight: '', description: '', image: '', category: '', status: 'active' })
  const [editingProduct, setEditingProduct] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [bannerFile, setBannerFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [googleReviewUrl, setGoogleReviewUrl] = useState('')
  const [instagramUrl, setInstagramUrl] = useState('')

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
          setGoogleReviewUrl(cfg.googleReviewUrl || '')
          setInstagramUrl(cfg.instagramUrl || '')
        }
        if (productsRes.ok) setProducts(await productsRes.json())
      } else {
        const res = await fetch('/api/storefront/admin/me', { credentials: 'include' })
        if (res.ok) {
          const data = await res.json()
          setStorefront(data)
          setProducts(data.products || [])
          setMasaNumbers(data.masaNumbers || [])
          setGoogleReviewUrl(data.googleReviewUrl || '')
          setInstagramUrl(data.instagramUrl || '')
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
      setNewProduct({ name: '', price: '', originalPrice: '', weight: '', description: '', image: '', category: '', status: 'active' })
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

  const toggleProductStatus = async (p: any) => {
    const next = p.status === 'soldout' ? 'preparing' : p.status === 'preparing' ? 'active' : 'soldout'
    const tid = activeTenantId()
    if (!tid) return
    const res = await fetch(`/api/storefront/admin/${tid}/products/${p.id}`, {
      method: 'PUT', headers: { 'Content-Type': 'application/json' }, credentials: 'include',
      body: JSON.stringify({ ...p, status: next }),
    })
    if (res.ok) {
      const updated = await res.json()
      setProducts(prev => prev.map(x => x.id === updated.id ? updated : x))
    }
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

  const saveSocialLinks = async () => {
    setSaving(true)
    const tid = activeTenantId()
    if (tid) {
      await fetch(`/api/storefront/admin/${tid}/config`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' }, credentials: 'include',
        body: JSON.stringify({ googleReviewUrl, instagramUrl }),
      })
    } else {
      await fetch('/api/storefront/admin/me/config', {
        method: 'PUT', headers: { 'Content-Type': 'application/json' }, credentials: 'include',
        body: JSON.stringify({ googleReviewUrl, instagramUrl }),
      })
    }
    setSaving(false)
  }

  const slug = storefront?.slug || ''
  const menuUrl = slug ? `https://bruskapp.com/menu/${slug}` : ''
  const onlineQrUrl = menuUrl ? `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(menuUrl)}` : ''
  const masaQrUrl = (num: number) => menuUrl ? `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(menuUrl + '?masa=' + num)}` : ''

  if (loading) return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" /></div>

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
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl" />
        <div className="relative flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-lg shadow-amber-500/20">
              <Store className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">QR Menü Yönetimi</h1>
            </div>
          </div>
        </div>
      </div>

      {/* Mağaza Linki */}
      <div className="bg-[#0d1117]/80 border border-[#1a2332] rounded-2xl p-6">
        <h3 className="text-white font-semibold flex items-center gap-2 mb-4"><Link size={18} className="text-amber-400" /> Mağaza Linki</h3>
        <a href={menuUrl} target="_blank" rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20 text-sm hover:bg-amber-500/20 transition-all">
          {menuUrl}
        </a>
        <p className="text-xs text-gray-600 mt-2">Müşterileriniz bu linkten menünüzü görüntüleyebilir</p>
      </div>

      {/* QR Kod */}
      <div className="bg-[#0d1117]/80 border border-[#1a2332] rounded-2xl p-6">
        <h3 className="text-white font-semibold flex items-center gap-2 mb-4"><QrCode size={18} className="text-amber-400" /> QR Kodlar</h3>

        {/* Online Sipariş QR */}
        <div className="mb-6 p-4 rounded-xl bg-[#080b12]/60 border border-[#1a2332]">
          <p className="text-white text-sm font-semibold mb-1">Online Sipariş QR Kodu</p>
          <p className="text-xs text-gray-500 mb-3">Müşterileriniz bu QR'ı okutarak online sipariş verebilir (adresli teslimat). Bu QR kodu vitrin, web sitesi veya paket üzerine koyabilirsiniz.</p>
          {onlineQrUrl && (
            <div className="flex items-center gap-4">
              <img src={onlineQrUrl} alt="Online Sipariş QR" className="w-32 h-32 rounded-xl bg-white p-2" />
              <a href={onlineQrUrl} download={`${slug}-online-qr.png`}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20 text-sm hover:bg-amber-500/20 transition-all">
                <Download size={16} /> QR İndir
              </a>
            </div>
          )}
        </div>

        {/* Masa QR Kodları */}
        <p className="text-white text-sm font-semibold mb-1">Masa QR Kodları</p>
        <p className="text-xs text-gray-500 mb-3">Her masa için ayrı QR kodu. Müşteri masasındaki QR'ı okutunca masa numarası otomatik seçilir ve siparişi masaya teslim edilir.</p>
        {masaNumbers.length === 0 ? (
          <p className="text-xs text-gray-600">Henüz masa eklenmemiş. Aşağıdaki "Masa Numaraları" bölümünden masa ekleyin.</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {masaNumbers.map(n => {
              const mqr = masaQrUrl(n)
              return (
                <div key={n} className="flex flex-col items-center gap-2 p-3 rounded-xl bg-[#080b12]/60 border border-[#1a2332]">
                  <p className="text-white text-sm font-bold">Masa {n}</p>
                  <img src={mqr} alt={`Masa ${n} QR`} className="w-24 h-24 rounded-lg bg-white p-1.5" />
                  <a href={mqr} download={`${slug}-masa-${n}-qr.png`}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20 text-xs hover:bg-amber-500/20 transition-all">
                    <Download size={14} /> İndir
                  </a>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Sosyal Medya Yönlendirme */}
      <div className="bg-[#0d1117]/80 border border-[#1a2332] rounded-2xl p-6">
        <h3 className="text-white font-semibold flex items-center gap-2 mb-4"><Link size={18} className="text-amber-400" /> Sosyal Medya Yönlendirme</h3>
        <p className="text-xs text-gray-500 mb-4">Bu linkler QR menüde logo olarak görünür; müşteri tıklayınca direkt oraya yönlendirilir.</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-[10px] text-gray-500 font-medium uppercase tracking-wider">Google Yorum Linki</label>
            <input value={googleReviewUrl} onChange={e => setGoogleReviewUrl(e.target.value)}
              placeholder="https://g.page/r/... yorum linki"
              className="bg-[#080b12]/80 border border-[#1a2332] rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-amber-500/50 placeholder-gray-600" />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-[10px] text-gray-500 font-medium uppercase tracking-wider">Instagram Linki</label>
            <input value={instagramUrl} onChange={e => setInstagramUrl(e.target.value)}
              placeholder="https://instagram.com/isletmeadi"
              className="bg-[#080b12]/80 border border-[#1a2332] rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-amber-500/50 placeholder-gray-600" />
          </div>
        </div>
        <button onClick={saveSocialLinks} disabled={saving} className="mt-4 px-4 py-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20 text-sm hover:bg-amber-500/20 transition-all"><Save size={14} className="inline mr-1" />Linkleri Kaydet</button>
      </div>

      {/* Banner Yükleme */}
      <div className="bg-[#0d1117]/80 border border-[#1a2332] rounded-2xl p-6">
        <h3 className="text-white font-semibold flex items-center gap-2 mb-4"><Image size={18} className="text-amber-400" /> Banner</h3>
        <div>
          <p className="text-sm text-gray-400 mb-2">Mevcut Banner</p>
          {storefront.bannerUrl ? (
            <img src={storefront.bannerUrl} className="w-full max-w-md h-32 rounded-xl object-cover border border-[#1a2332] mb-3" />
          ) : (
            <div className="w-full max-w-md h-32 rounded-xl bg-[#080b12]/60 border border-[#1a2332] flex items-center justify-center mb-3">
              <Image size={24} className="text-gray-600" />
            </div>
          )}
          <p className="text-[10px] text-gray-600 mb-1">Önerilen: 1200x400 piksel</p>
          <input type="file" accept="image/*" onChange={e => setBannerFile(e.target.files?.[0] || null)} className="text-sm text-gray-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-medium file:bg-amber-500/10 file:text-amber-400 hover:file:bg-amber-500/20" />
          {bannerFile && (
            <button onClick={handleBannerUpload} disabled={uploading} className="mt-2 px-3 py-1.5 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20 text-xs hover:bg-amber-500/20 transition-all">
              {uploading ? 'Yükleniyor...' : 'Banner Yükle'}
            </button>
          )}
        </div>
      </div>

      {/* Ürünler */}
      <div className="bg-[#0d1117]/80 border border-[#1a2332] rounded-2xl p-6">
        <h3 className="text-white font-semibold flex items-center gap-2 mb-4"><Package size={18} className="text-amber-400" /> Ürünler</h3>

        <div className="space-y-2 mb-4">
          {products.length === 0 && <p className="text-gray-500 text-sm">Henüz ürün eklenmemiş</p>}
          {products.map((p: any) => (
            <div key={p.id} onClick={() => setEditingProduct({ ...p })} className="flex items-center justify-between p-3 rounded-xl bg-[#080b12]/60 border border-[#1a2332] cursor-pointer hover:border-amber-500/30 transition-all group">
              <div className="flex items-center gap-3">
                {p.image && <img src={p.image} className="w-16 h-16 rounded-lg object-cover" />}
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
                      <span className="text-amber-400 font-bold text-sm ml-1">₺{p.price}</span>
                    </div>
                  ) : (
                    <span className="text-amber-400 font-bold text-sm">₺{p.price}</span>
                  )}
                </div>
                <button onClick={(e) => { e.stopPropagation(); toggleProductStatus(p) }} title="Durumu değiştir"
                  className={
                  p.status === 'soldout' ? 'text-[10px] px-2 py-1 rounded-full bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 transition-all cursor-pointer'
                  : p.status === 'preparing' ? 'text-[10px] px-2 py-1 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 hover:bg-amber-500/20 transition-all cursor-pointer'
                  : 'text-[10px] px-2 py-1 rounded-full bg-green-500/10 text-green-400 border border-green-500/20 hover:bg-green-500/20 transition-all cursor-pointer'
                }>
                  {p.status === 'soldout' ? 'Tükendi' : p.status === 'preparing' ? 'Hazırlıkta' : 'Aktif'}
                </button>
                <span className="text-[10px] text-gray-600 opacity-0 group-hover:opacity-100 transition-opacity">Düzenlemek için tıklayın</span>
                <button onClick={(e) => { e.stopPropagation(); deleteProduct(p.id) }} className="text-red-500 hover:text-red-400"><Trash2 size={14} /></button>
              </div>
            </div>
          ))}
        </div>

        {editingProduct ? (
          <div className="flex flex-col gap-3 p-4 rounded-xl bg-[#080b12]/60 border border-[#1a2332]">
            <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
              <div className="col-span-2 flex flex-col gap-1">
                <label className="text-[10px] text-gray-500 font-medium uppercase tracking-wider">Ürün Adı</label>
                <input value={editingProduct.name} onChange={e => setEditingProduct({ ...editingProduct, name: e.target.value })} placeholder="Örn: Kahve" className="bg-[#0d1117]/80 border border-[#1a2332] rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-amber-500/50 placeholder-gray-600" />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-[10px] text-gray-500 font-medium uppercase tracking-wider">Fiyat (₺)</label>
                <input value={editingProduct.price} onChange={e => setEditingProduct({ ...editingProduct, price: e.target.value })} type="number" step="0.01" placeholder="0.00" className="bg-[#0d1117]/80 border border-[#1a2332] rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-amber-500/50 placeholder-gray-600" />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-[10px] text-gray-500 font-medium uppercase tracking-wider">Gramaj</label>
                <input value={editingProduct.weight || ''} onChange={e => setEditingProduct({ ...editingProduct, weight: e.target.value })} placeholder="200 gr" className="bg-[#0d1117]/80 border border-[#1a2332] rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-amber-500/50 placeholder-gray-600" />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-[10px] text-gray-500 font-medium uppercase tracking-wider">İndirimli Fiyat</label>
                <input value={editingProduct.originalPrice || ''} onChange={e => setEditingProduct({ ...editingProduct, originalPrice: e.target.value })} type="number" step="0.01" placeholder="0.00" className="bg-[#0d1117]/80 border border-[#1a2332] rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-amber-500/50 placeholder-gray-600" />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-[10px] text-gray-500 font-medium uppercase tracking-wider">Kategori</label>
                <input value={editingProduct.category || ''} onChange={e => setEditingProduct({ ...editingProduct, category: e.target.value })} placeholder="İçecekler" className="bg-[#0d1117]/80 border border-[#1a2332] rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-amber-500/50 placeholder-gray-600" />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-[10px] text-gray-500 font-medium uppercase tracking-wider">Durum</label>
                <select value={editingProduct.status || 'active'} onChange={e => setEditingProduct({ ...editingProduct, status: e.target.value })}
                  className="bg-[#0d1117]/80 border border-[#1a2332] rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-amber-500/50">
                  <option value="active">Aktif</option>
                  <option value="soldout">Tükendi</option>
                  <option value="preparing">Hazırlık Aşamasında</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
              <div className="col-span-3 flex flex-col gap-1">
                <label className="text-[10px] text-gray-500 font-medium uppercase tracking-wider">Açıklama</label>
                <input value={editingProduct.description || ''} onChange={e => setEditingProduct({ ...editingProduct, description: e.target.value })} placeholder="Ürün açıklaması" className="bg-[#0d1117]/80 border border-[#1a2332] rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-amber-500/50 placeholder-gray-600" />
              </div>
              <div className="col-span-3 flex flex-col gap-1">
                <label className="text-[10px] text-gray-500 font-medium uppercase tracking-wider">Görsel</label>
                <p className="text-[10px] text-gray-600">Önerilen: 300x300 piksel</p>
                <div className="flex items-center gap-2">
                  {editingProduct.image && <img src={editingProduct.image} className="w-8 h-8 rounded object-cover" />}
                  <input type="file" accept="image/*" onChange={async e => {
                    const file = e.target.files?.[0]
                    if (!file) return
                    const url = await uploadFile(file)
                    if (url) setEditingProduct((prev: any) => ({ ...prev, image: url }))
                  }} className="text-sm text-gray-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-medium file:bg-amber-500/10 file:text-amber-400 hover:file:bg-amber-500/20" />
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <button onClick={updateProduct} disabled={saving} className="flex-1 px-4 py-2.5 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20 text-sm hover:bg-amber-500/20 transition-all"><Save size={14} className="inline mr-1" />Kaydet</button>
              <button onClick={() => setEditingProduct(null)} className="px-4 py-2.5 rounded-xl bg-[#080b12]/60 border border-[#1a2332] text-gray-500 text-sm hover:text-white">İptal</button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-3 p-4 rounded-xl bg-[#080b12]/60 border border-[#1a2332]">
            <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
              <div className="col-span-2 flex flex-col gap-1">
                <label className="text-[10px] text-gray-500 font-medium uppercase tracking-wider">Ürün Adı</label>
                <input value={newProduct.name} onChange={e => setNewProduct({ ...newProduct, name: e.target.value })} placeholder="Örn: Kahve" className="bg-[#0d1117]/80 border border-[#1a2332] rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-amber-500/50 placeholder-gray-600" />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-[10px] text-gray-500 font-medium uppercase tracking-wider">Fiyat (₺)</label>
                <input value={newProduct.price} onChange={e => setNewProduct({ ...newProduct, price: e.target.value })} type="number" step="0.01" placeholder="0.00" className="bg-[#0d1117]/80 border border-[#1a2332] rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-amber-500/50 placeholder-gray-600" />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-[10px] text-gray-500 font-medium uppercase tracking-wider">Gramaj</label>
                <input value={newProduct.weight} onChange={e => setNewProduct({ ...newProduct, weight: e.target.value })} placeholder="200 gr" className="bg-[#0d1117]/80 border border-[#1a2332] rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-amber-500/50 placeholder-gray-600" />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-[10px] text-gray-500 font-medium uppercase tracking-wider">İndirimli Fiyat</label>
                <input value={newProduct.originalPrice} onChange={e => setNewProduct({ ...newProduct, originalPrice: e.target.value })} type="number" step="0.01" placeholder="0.00" className="bg-[#0d1117]/80 border border-[#1a2332] rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-amber-500/50 placeholder-gray-600" />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-[10px] text-gray-500 font-medium uppercase tracking-wider">Kategori</label>
                <input value={newProduct.category || ''} onChange={e => setNewProduct({ ...newProduct, category: e.target.value })} placeholder="İçecekler" className="bg-[#0d1117]/80 border border-[#1a2332] rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-amber-500/50 placeholder-gray-600" />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-[10px] text-gray-500 font-medium uppercase tracking-wider">Durum</label>
                <select value={newProduct.status || 'active'} onChange={e => setNewProduct({ ...newProduct, status: e.target.value })}
                  className="bg-[#0d1117]/80 border border-[#1a2332] rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-amber-500/50">
                  <option value="active">Aktif</option>
                  <option value="soldout">Tükendi</option>
                  <option value="preparing">Hazırlık Aşamasında</option>
                </select>
              </div>
              <button onClick={addProduct} disabled={saving || !newProduct.name || !newProduct.price}
                className="flex items-center justify-center gap-1 px-3 py-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20 text-sm hover:bg-amber-500/20 transition-all disabled:opacity-50 self-end">
                <Plus size={14} /> Ekle
              </button>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
              <div className="col-span-3 flex flex-col gap-1">
                <label className="text-[10px] text-gray-500 font-medium uppercase tracking-wider">Açıklama</label>
                <input value={newProduct.description} onChange={e => setNewProduct({ ...newProduct, description: e.target.value })} placeholder="Ürün açıklaması" className="bg-[#0d1117]/80 border border-[#1a2332] rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-amber-500/50 placeholder-gray-600" />
              </div>
              <div className="col-span-3 flex flex-col gap-1">
                <label className="text-[10px] text-gray-500 font-medium uppercase tracking-wider">Görsel</label>
                <p className="text-[10px] text-gray-600">Önerilen: 300x300 piksel</p>
                <div className="flex items-center gap-2">
                  <input type="file" accept="image/*" onChange={async e => {
                    const file = e.target.files?.[0]
                    if (!file) return
                    const url = await uploadFile(file)
                    if (url) setNewProduct(prev => ({ ...prev, image: url }))
                  }} className="text-sm text-gray-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-medium file:bg-amber-500/10 file:text-amber-400 hover:file:bg-amber-500/20" />
                  {newProduct.image && <img src={newProduct.image} className="w-8 h-8 rounded object-cover" />}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Masa Numaraları */}
      <div className="bg-[#0d1117]/80 border border-[#1a2332] rounded-2xl p-6">
        <h3 className="text-white font-semibold flex items-center gap-2 mb-4"><Table2 size={18} className="text-amber-400" /> Masa Numaraları</h3>
        <div className="flex gap-2 mb-3">
          <input value={newMasa} onChange={e => setNewMasa(e.target.value)} type="number" placeholder="Masa no" className="w-32 bg-[#080b12]/80 border border-[#1a2332] rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-amber-500/50 placeholder-gray-600" />
          <button onClick={addMasa} className="px-3 py-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20 text-sm hover:bg-amber-500/20 transition-all"><Plus size={14} className="inline mr-1" />Ekle</button>
        </div>
        <div className="flex flex-wrap gap-2">
          {masaNumbers.map(n => (
            <span key={n} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#080b12]/60 border border-[#1a2332] text-white text-sm">
              Masa {n}
              <button onClick={() => removeMasa(n)} className="text-red-500 hover:text-red-400"><Trash2 size={12} /></button>
            </span>
          ))}
        </div>
        <button onClick={saveConfig} disabled={saving} className="mt-4 px-4 py-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20 text-sm hover:bg-amber-500/20 transition-all"><Save size={14} className="inline mr-1" />Kaydet</button>
      </div>
    </div>
  )
}
