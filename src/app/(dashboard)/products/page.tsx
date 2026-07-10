'use client'
import { useState, useEffect, useRef } from 'react'
import { Package, Plus, Pencil, Trash2, X, Search, Image as ImageIcon, Tag, Layers, DollarSign, Link as LinkIcon, Copy, Check, Upload, Loader2, ChevronDown, ChevronUp, Palette, ImageOff, RefreshCw, Barcode } from 'lucide-react'

const CATEGORIES = [
  'Yiyecek', 'İçecek', 'Tatlı', 'Kahvaltı', 'Ara Sıcak', 'Salata', 'Fast Food', 'Giyim', 'Aksesuar', 'Elektronik', 'Ev & Yaşam', 'Diğer'
]

export default function ProductsPage() {
  const [products, setProducts] = useState<any[]>([])
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState<any>(null)
  const [form, setForm] = useState({ name: '', description: '', category: 'Yiyecek', barcode: '', price: '', stock: '', active: true, image: null as string | null })
  const [variants, setVariants] = useState<any[]>([])
  const [variantForm, setVariantForm] = useState({ name: '', barcode: '', price: '', stock: '', options: '' })
  const [stockModal, setStockModal] = useState<{ product: any; type: 'ADD' | 'DEDUCT'; qty: string; note: string } | null>(null)
  const [syncing, setSyncing] = useState<number | null>(null)
  const [syncResults, setSyncResults] = useState<{ platform: string; success: boolean; message: string }[] | null>(null)
  const [bulkSyncing, setBulkSyncing] = useState(false)
  const [storefrontUrl, setStorefrontUrl] = useState<string | null>('')
  const [copied, setCopied] = useState(false)
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [saved, setSaved] = useState(false)
  const [savedCopied, setSavedCopied] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const bannerInputRef = useRef<HTMLInputElement>(null)

  const [showStorefront, setShowStorefront] = useState(false)
  const [tenantId, setTenantId] = useState<string | null>(null)
  const [storefrontCfg, setStorefrontCfg] = useState<{ bannerImage?: string; heroTitle?: string; heroSubtitle?: string; headerSubtitle?: string }>({})
  const [storefrontSiteTitle, setStorefrontSiteTitle] = useState('')
  const [storefrontLogo, setStorefrontLogo] = useState('')
  const [savingStorefront, setSavingStorefront] = useState(false)
  const [storefrontSaved, setStorefrontSaved] = useState(false)
  const [uploadingBanner, setUploadingBanner] = useState(false)
  const [uploadingLogo, setUploadingLogo] = useState(false)

  useEffect(() => {
    fetch('/api/tenants/me', { credentials: 'include' })
      .then(r => r.json())
      .then(t => {
        const tenant = t?.tenant || t
        const slug = tenant?.slug
        if (slug) setStorefrontUrl(`https://bruskapp.com/magaza/${slug}`)
        else setStorefrontUrl(null)
        if (tenant?.id) setTenantId(tenant.id)
        if (tenant?.siteTitle) setStorefrontSiteTitle(tenant.siteTitle)
        if (tenant?.logoUrl) setStorefrontLogo(tenant.logoUrl)
        if (tenant?.storefrontConfig) {
          const cfg = typeof tenant.storefrontConfig === 'string'
            ? JSON.parse(tenant.storefrontConfig)
            : tenant.storefrontConfig
          setStorefrontCfg({
            bannerImage: cfg.bannerImage || '',
            heroTitle: cfg.heroTitle || '',
            heroSubtitle: cfg.heroSubtitle || '',
            headerSubtitle: cfg.headerSubtitle || '',
          })
        }
      })
      .catch(() => setStorefrontUrl(null))
    fetchProducts()
  }, [])

  const fetchProducts = async () => {
    try {
      const res = await fetch('/api/products', { credentials: 'include' })
      if (res.status === 401) {
        const refresh = await fetch('/api/auth/refresh', { method: 'POST', credentials: 'include' })
        if (refresh.ok) {
          const r2 = await fetch('/api/products', { credentials: 'include' })
          if (r2.ok) setProducts(await r2.json())
        }
        return
      }
      if (res.ok) setProducts(await res.json())
    } catch {} finally { setLoading(false) }
  }

  const uploadFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    try {
      const fd = new FormData()
      fd.append('file', file)
      const res = await fetch('/api/upload', { method: 'POST', credentials: 'include', body: fd })
      if (!res.ok) {
        const err = await res.text()
        console.error('Upload error:', res.status, err)
        if (res.status === 401) alert('Oturum süreniz dolmuş. Lütfen sayfayı yenileyip tekrar deneyin.')
        else alert('Dosya yüklenemedi. Lütfen tekrar deneyin.')
        return
      }
      const data = await res.json()
      setForm(prev => ({ ...prev, image: data.url }))
    } catch (err) {
      console.error('Upload error:', err)
      alert('Dosya yüklenirken bir hata oluştu.')
    } finally { setUploading(false); if (fileInputRef.current) fileInputRef.current.value = '' }
  }

  const removeImage = () => { setForm(prev => ({ ...prev, image: null })) }

  const loadVariants = async (productId: number) => {
    try {
      const res = await fetch(`/api/products/${productId}/variants`, { credentials: 'include' })
      if (res.ok) setVariants(await res.json())
    } catch {}
  }
  const addVariant = async () => {
    if (!variantForm.name || !editing?.id) return
    const body: any = { name: variantForm.name, barcode: variantForm.barcode, price: variantForm.price ? Number(variantForm.price) : undefined, stock: variantForm.stock ? Number(variantForm.stock) : 0 }
    if (variantForm.options) body.options = variantForm.options.split(',').map((s: string) => s.trim()).filter(Boolean)
    const res = await fetch(`/api/products/${editing.id}/variants`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'include', body: JSON.stringify(body) })
    if (res.ok) { loadVariants(editing.id); setVariantForm({ name: '', barcode: '', price: '', stock: '', options: '' }) }
  }
  const deleteVariant = async (vid: number) => {
    const res = await fetch(`/api/products/variants/${vid}`, { method: 'DELETE', credentials: 'include' })
    if (res.ok && editing) loadVariants(editing.id)
  }
  const applyStockChange = async () => {
    if (!stockModal) return
    const qty = parseInt(stockModal.qty) || 1
    try {
      const res = await fetch('/api/products/manual-stock', {
        method: 'POST', credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId: stockModal.product.id, quantity: qty, type: stockModal.type, note: stockModal.note }),
      })
      if (res.ok) { setStockModal(null); fetchProducts() }
    } catch {}
  }

  const openCreate = () => {
    setEditing(null)
    setForm({ name: '', description: '', category: 'Yiyecek', barcode: '', price: '', stock: '', active: true, image: null })
    setVariants([])
    setShowModal(true)
  }

  const openEdit = (p: any) => {
    setEditing(p)
    setForm({ name: p.name, description: p.description || '', category: p.category, barcode: p.barcode || '', price: String(p.price), stock: String(p.stock), active: p.active, image: p.images?.[0] || null })
    setVariants([])
    if (p.id) loadVariants(p.id)
    setShowModal(true)
  }

  const syncProduct = async (productId: number) => {
    setSyncing(productId)
    setSyncResults(null)
    try {
      const res = await fetch('/api/products/sync', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productIds: [productId] }),
      })
      if (res.ok) {
        const data = await res.json()
        setSyncResults(data.results)
        setTimeout(() => setSyncResults(null), 5000)
      }
    } catch {} finally { setSyncing(null) }
  }

  const syncAll = async () => {
    setBulkSyncing(true)
    setSyncResults(null)
    try {
      const ids = products.map(p => p.id)
      const res = await fetch('/api/products/sync', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productIds: ids }),
      })
      if (res.ok) {
        const data = await res.json()
        setSyncResults(data.results)
        setTimeout(() => setSyncResults(null), 5000)
      }
    } catch {} finally { setBulkSyncing(false) }
  }

  const save = async () => {
    if (!form.name || !form.price) return
    const payload = {
      name: form.name,
      description: form.description,
      barcode: form.barcode,
      category: form.category,
      price: Number(form.price),
      stock: Number(form.stock),
      active: form.active,
      images: form.image ? [form.image] : [],
    }
    try {
      const opts = { method: editing ? 'PATCH' : 'POST', credentials: 'include' as RequestCredentials, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) }
      const url = editing ? `/api/products/${editing.id}` : '/api/products'
      const res = await fetch(url, opts)
      if (res.ok) {
        setShowModal(false)
        fetchProducts()
        if (!editing) {
          setSaved(true)
          setTimeout(() => setSaved(false), 3000)
        }
      }
    } catch {}
  }

  const remove = async (id: string) => {
    if (!confirm('Bu ürünü silmek istediğinize emin misiniz?')) return
    try {
      const res = await fetch(`/api/products/${id}`, { method: 'DELETE', credentials: 'include' })
      if (res.ok) fetchProducts()
    } catch {}
  }

  const copyLink = () => {
    if (storefrontUrl) {
      navigator.clipboard.writeText(storefrontUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const filtered = products.filter(p => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase())
    const matchCat = !categoryFilter || p.category === categoryFilter
    return matchSearch && matchCat
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Ürün Yönetimi</h1>
          <p className="text-gray-500 text-sm mt-1">Ürünlerinizi ekleyin, müşterileriniz mağaza linkinizden görüntülesin</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={syncAll} disabled={bulkSyncing || !products.length} className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-violet-600 to-violet-500 text-white rounded-xl text-sm font-medium hover:shadow-lg hover:shadow-violet-500/25 transition-all disabled:opacity-50">
            <RefreshCw size={16} className={bulkSyncing ? 'animate-spin' : ''} /> {bulkSyncing ? 'Senkronize...' : 'Tümünü Pazaryerlerine Gönder'}
          </button>
          <button onClick={openCreate} className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-emerald-600 to-emerald-500 text-white rounded-xl text-sm font-medium hover:shadow-lg hover:shadow-emerald-500/25 transition-all"><Plus size={16} /> Yeni Ürün</button>
        </div>
      </div>

      {syncResults && (
        <div className="glass rounded-2xl border border-violet-500/20 p-4 space-y-2">
          <p className="text-sm text-white font-medium">Senkronizasyon Sonuçları</p>
          {syncResults.map((r, i) => (
            <div key={i} className={`flex items-center gap-2 text-xs ${r.success ? 'text-emerald-400' : 'text-red-400'}`}>
              <span className="w-2 h-2 rounded-full shrink-0 ${r.success ? 'bg-emerald-400' : 'bg-red-400'}"></span>
              <span className="font-medium capitalize">{r.platform}:</span> {r.message}
            </div>
          ))}
        </div>
      )}

      <div className={'glass rounded-2xl border p-4 flex items-center justify-between flex-wrap gap-3 transition-all ' + (storefrontUrl ? 'border-emerald-500/20' : 'border-[#1a2332] opacity-60')}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center"><LinkIcon size={18} className="text-emerald-400" /></div>
          <div>
            <p className="text-sm text-white font-medium">Mağaza Linkiniz</p>
            <p className="text-xs text-gray-500">Ürünlerinizi müşterilerinize bu linkle gösterin</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {storefrontUrl ? (
            <>
              <a href={storefrontUrl} target="_blank" className="text-xs text-emerald-400 hover:text-emerald-300 font-medium transition-all underline underline-offset-2">{storefrontUrl}</a>
              <button onClick={copyLink} className="p-2 rounded-lg hover:bg-white/5 transition-all text-gray-500 hover:text-white">
                {copied ? <Check size={16} className="text-emerald-400" /> : <Copy size={16} />}
              </button>
            </>
          ) : storefrontUrl === '' ? (
            <span className="text-xs text-gray-500">Yükleniyor...</span>
          ) : null}
        </div>
      </div>

      {/* Mağaza Görünümü */}
      <div className="glass rounded-2xl border border-[#1a2332] overflow-hidden">
        <button onClick={() => setShowStorefront(!showStorefront)} className="w-full flex items-center justify-between p-4 hover:bg-white/[0.02] transition-all">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-violet-500/10 flex items-center justify-center"><Palette size={18} className="text-violet-400" /></div>
            <div className="text-left">
              <p className="text-sm text-white font-medium">Mağaza Görünümü</p>
              <p className="text-xs text-gray-500">Mağaza sayfanızdaki hero banner, başlık ve açıklama metnini özelleştirin</p>
            </div>
          </div>
          {showStorefront ? <ChevronUp size={16} className="text-gray-500" /> : <ChevronDown size={16} className="text-gray-500" />}
        </button>

        {showStorefront && (
          <div className="px-4 pb-5 space-y-4 border-t border-[#1a2332] pt-4">
            <div>
              <label className="text-xs text-gray-500 block mb-1.5">Banner / Hero Görseli</label>
              {storefrontCfg.bannerImage ? (
                <div className="relative rounded-xl overflow-hidden border border-[#1a2332]">
                  <img src={storefrontCfg.bannerImage} alt="Banner" className="w-full h-40 object-cover" />
                  <button onClick={() => setStorefrontCfg(prev => ({ ...prev, bannerImage: '' }))} className="absolute top-2 right-2 p-1.5 rounded-lg bg-black/60 backdrop-blur-sm text-white hover:bg-red-500/60 transition-all"><X size={14} /></button>
                  {uploadingBanner && <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-xl"><Loader2 size={24} className="text-violet-400 animate-spin" /></div>}
                </div>
              ) : (
                <div onClick={() => bannerInputRef.current?.click()} className="w-full h-40 bg-[#080b12]/80 border border-dashed border-[#1a2332] rounded-xl flex flex-col items-center justify-center gap-2 cursor-pointer hover:border-violet-500/40 transition-all">
                  {uploadingBanner ? <Loader2 size={24} className="text-violet-400 animate-spin" /> : <ImageIcon size={24} className="text-gray-500" />}
                  <p className="text-xs text-gray-500">{uploadingBanner ? 'Yükleniyor...' : 'Banner görseli yükleyin (1920x600 önerilir)'}</p>
                </div>
              )}
              <input ref={bannerInputRef} type="file" accept="image/*" onChange={async (e) => {
                const file = e.target.files?.[0]
                if (!file) return
                setUploadingBanner(true)
                try {
                  const fd = new FormData()
                  fd.append('file', file)
                  const res = await fetch('/api/upload', { method: 'POST', credentials: 'include', body: fd })
                  if (res.ok) {
                    const data = await res.json()
                    setStorefrontCfg(prev => ({ ...prev, bannerImage: data.url }))
                  } else alert('Yüklenemedi')
                } catch {} finally { setUploadingBanner(false); if (bannerInputRef.current) bannerInputRef.current.value = '' }
              }} className="hidden" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-gray-500 block mb-1.5">Header Alt Başlık</label>
                <input type="text" value={storefrontCfg.headerSubtitle || ''} onChange={e => setStorefrontCfg(prev => ({ ...prev, headerSubtitle: e.target.value }))} placeholder='Örn: "Çevrimiçi mağaza"' className="w-full bg-[#080b12]/80 border border-[#1a2332] rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-violet-500/50 placeholder-gray-600 transition-all" />
              </div>
              <div>
                <label className="text-xs text-gray-500 block mb-1.5">Hero Başlık</label>
                <input type="text" value={storefrontCfg.heroTitle || ''} onChange={e => setStorefrontCfg(prev => ({ ...prev, heroTitle: e.target.value }))} placeholder={tenantId ? 'Mağaza adı (boş bırakılırsa varsayılan)' : 'Yükleniyor...'} className="w-full bg-[#080b12]/80 border border-[#1a2332] rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-violet-500/50 placeholder-gray-600 transition-all" />
              </div>
            </div>
            <div>
              <label className="text-xs text-gray-500 block mb-1.5">Hero Alt Başlık</label>
              <input type="text" value={storefrontCfg.heroSubtitle || ''} onChange={e => setStorefrontCfg(prev => ({ ...prev, heroSubtitle: e.target.value }))} placeholder='Örn: "Tüm ürünlerimizi keşfedin..."' className="w-full bg-[#080b12]/80 border border-[#1a2332] rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-violet-500/50 placeholder-gray-600 transition-all" />
            </div>

            <div className="border-t border-[#1a2332] pt-4">
              <p className="text-xs text-gray-400 font-medium mb-3">Mağaza Bilgileri</p>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-gray-500 block mb-1.5">Mağaza Adı</label>
                  <input type="text" value={storefrontSiteTitle} onChange={e => setStorefrontSiteTitle(e.target.value)} placeholder="Mağaza adı (header'da görünür)" className="w-full bg-[#080b12]/80 border border-[#1a2332] rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-violet-500/50 placeholder-gray-600 transition-all" />
                </div>
                <div>
                  <label className="text-xs text-gray-500 block mb-1.5">Logo (64×64 önerilir)</label>
                  {storefrontLogo ? (
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl overflow-hidden border border-[#1a2332] shrink-0">
                        <img src={storefrontLogo} alt="" className="w-full h-full object-cover" />
                      </div>
                      <button onClick={() => setStorefrontLogo('')} className="p-1.5 rounded-lg hover:bg-red-500/10 transition-all"><Trash2 size={14} className="text-red-400" /></button>
                      <button onClick={() => { setUploadingLogo(true); document.getElementById('logo-upload')?.click() }} className="text-xs text-violet-400 hover:text-violet-300 transition-all underline underline-offset-2">Değiştir</button>
                    </div>
                  ) : (
                    <div onClick={() => document.getElementById('logo-upload')?.click()} className="w-full h-12 bg-[#080b12]/80 border border-dashed border-[#1a2332] rounded-xl flex items-center justify-center gap-2 cursor-pointer hover:border-violet-500/40 transition-all">
                      {uploadingLogo ? <Loader2 size={14} className="text-violet-400 animate-spin" /> : <Upload size={14} className="text-gray-500" />}
                      <span className="text-xs text-gray-500">Logo yükle</span>
                    </div>
                  )}
                  <input id="logo-upload" type="file" accept="image/*" className="hidden" onChange={async (e) => {
                    const file = e.target.files?.[0]
                    if (!file) return
                    setUploadingLogo(true)
                    try {
                      const fd = new FormData(); fd.append('file', file)
                      const res = await fetch('/api/upload', { method: 'POST', credentials: 'include', body: fd })
                      if (res.ok) { const data = await res.json(); setStorefrontLogo(data.url) }
                      else alert('Yüklenemedi')
                    } catch {} finally { setUploadingLogo(false); if (document.getElementById('logo-upload') as HTMLInputElement) (document.getElementById('logo-upload') as HTMLInputElement).value = '' }
                  }} />
                </div>
              </div>
            </div>

            {storefrontUrl && (
              <div className="rounded-xl overflow-hidden border border-[#1a2332] relative h-48 bg-[#080b12]">
                <div className="absolute inset-0 flex items-center justify-center bg-black/40 z-10">
                  <a href={storefrontUrl} target="_blank" className="px-4 py-2 bg-white/10 backdrop-blur-sm rounded-xl text-white text-xs font-medium hover:bg-white/20 transition-all border border-white/10">Mağazayı Önizle</a>
                </div>
                {storefrontCfg.bannerImage ? (
                  <img src={storefrontCfg.bannerImage} alt="" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center"><ImageOff size={32} className="text-gray-700" /></div>
                )}
                <div className="absolute top-4 left-4 z-20 flex items-center gap-3">
                  {storefrontLogo && (
                    <div className="w-8 h-8 rounded-lg overflow-hidden ring-2 ring-white/20 shadow-lg shrink-0">
                      <img src={storefrontLogo} alt="" className="w-full h-full object-cover" />
                    </div>
                  )}
                  <div>
                    <p className="text-white text-sm font-semibold drop-shadow-lg">{storefrontSiteTitle || 'Mağaza Adı'}</p>
                    <p className="text-white/50 text-[10px] drop-shadow">{storefrontCfg.headerSubtitle || 'Çevrimiçi mağaza'}</p>
                  </div>
                </div>
                <div className="absolute bottom-4 left-4 z-20">
                  <p className="text-white text-sm font-semibold drop-shadow-lg">{storefrontCfg.heroTitle || storefrontSiteTitle || 'Mağaza Adı'}</p>
                  <p className="text-white/70 text-xs drop-shadow">{storefrontCfg.heroSubtitle || 'Kısa açıklama'}</p>
                </div>
              </div>
            )}

            <div className="flex justify-end pt-1">
              <button
                onClick={async () => {
                  if (!tenantId) return
                  setSavingStorefront(true)
                  try {
                    const res = await fetch(`/api/tenants/${tenantId}/theme`, {
                      method: 'PATCH',
                      credentials: 'include',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({
                        siteTitle: storefrontSiteTitle,
                        logoUrl: storefrontLogo || '',
                        storefrontConfig: {
                          bannerImage: storefrontCfg.bannerImage || null,
                          heroTitle: storefrontCfg.heroTitle || null,
                          heroSubtitle: storefrontCfg.heroSubtitle || null,
                          headerSubtitle: storefrontCfg.headerSubtitle || null,
                        }
                      }),
                    })
                    if (res.ok) {
                      setStorefrontSaved(true)
                      setTimeout(() => setStorefrontSaved(false), 3000)
                    } else alert('Kaydedilemedi')
                  } catch {} finally { setSavingStorefront(false) }
                }}
                disabled={savingStorefront || !tenantId}
                className="px-5 py-2.5 bg-gradient-to-r from-violet-600 to-violet-500 text-white rounded-xl text-sm font-medium hover:shadow-lg hover:shadow-violet-500/25 transition-all disabled:opacity-50 flex items-center gap-2"
              >
                {savingStorefront ? <Loader2 size={14} className="animate-spin" /> : null}
                {storefrontSaved ? 'Kaydedildi ✓' : 'Mağaza Görünümünü Kaydet'}
              </button>
            </div>
          </div>
        )}
      </div>

      {saved && storefrontUrl && (
        <div className="flex items-center gap-3 p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20">
          <div className="flex-1">
            <p className="text-sm text-emerald-400 font-medium">Ürün başarıyla eklendi!</p>
            <p className="text-xs text-gray-400 mt-0.5">Müşterileriniz mağaza linkinizden ürünü görebilir.</p>
          </div>
          <button onClick={() => { navigator.clipboard.writeText(storefrontUrl); setSavedCopied(true); setTimeout(() => setSavedCopied(false), 2000) }} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/20 text-emerald-400 text-xs font-medium hover:bg-emerald-500/30 transition-all">{savedCopied ? <Check size={14} /> : <Copy size={14} />} {savedCopied ? 'Kopyalandı' : 'Linki Kopyala'}</button>
          <a href={storefrontUrl} target="_blank" className="px-3 py-1.5 rounded-lg bg-white/10 text-white text-xs font-medium hover:bg-white/20 transition-all">Mağazayı Gör</a>
        </div>
      )}

      <div className="flex gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px] max-w-xs"><Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" /><input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Ürün ara..." className="w-full bg-[#0d1117]/80 border border-[#1a2332] rounded-xl pl-9 pr-4 py-2 text-white text-sm focus:outline-none focus:border-emerald-500/50 placeholder-gray-600 transition-all" /></div>
        <select value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)} className="bg-[#0d1117]/80 border border-[#1a2332] rounded-xl px-4 py-2 text-white text-sm focus:outline-none focus:border-emerald-500/50 transition-all"><option value="">Tüm Kategoriler</option>{CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}</select>
        <button onClick={() => { setSearch(''); setCategoryFilter('') }} className="px-3 py-2 text-xs text-gray-500 hover:text-white transition-all">Temizle</button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filtered.map(p => (
          <div key={p.id} className="glass rounded-2xl border border-[#1a2332] overflow-hidden hover:border-emerald-500/20 transition-all group">
            <div className="aspect-[4/3] bg-[#080b12] flex items-center justify-center relative overflow-hidden">
              {p.images?.[0] ? (
                <img src={p.images[0]} alt={p.name} className="w-full h-full object-cover" />
              ) : (
                <div className="text-center"><ImageIcon size={36} className="text-gray-700 mx-auto mb-2" /><p className="text-xs text-gray-600">Görsel Yok</p></div>
              )}
              <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-all">
                <button onClick={() => openEdit(p)} className="p-1.5 rounded-lg bg-black/60 backdrop-blur-sm text-white hover:bg-emerald-500/60 transition-all"><Pencil size={13} /></button>
                <button onClick={() => remove(p.id)} className="p-1.5 rounded-lg bg-black/60 backdrop-blur-sm text-white hover:bg-red-500/60 transition-all"><Trash2 size={13} /></button>
              </div>
              {!p.active && <div className="absolute inset-0 bg-black/50 flex items-center justify-center pointer-events-none"><span className="text-xs font-medium text-gray-400 bg-black/60 px-3 py-1 rounded-full">Pasif</span></div>}
            </div>
              <div className="p-4 space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="text-white text-sm font-semibold leading-tight">{p.name}</h3>
                  <span className="text-emerald-400 text-sm font-bold whitespace-nowrap">{p.price.toFixed(2)} ₺</span>
                </div>
                <div className="flex items-center gap-2 text-xs flex-wrap">
                  <span className="flex items-center gap-1 px-2 py-0.5 bg-purple-500/5 text-purple-400 rounded-lg border border-purple-500/10"><Layers size={10} />{p.category}</span>
                  <span className={'flex items-center gap-1 px-2 py-0.5 rounded-lg border ' + (p.stock > 50 ? 'bg-emerald-500/5 text-emerald-400 border-emerald-500/10' : p.stock > 0 ? 'bg-amber-500/5 text-amber-400 border-amber-500/10' : 'bg-red-500/5 text-red-400 border-red-500/10')}><Tag size={10} />Stok: {p.stock}</span>
                  <button onClick={() => setStockModal({ product: p, type: 'ADD', qty: '1', note: '' })} className="p-1 rounded-md bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 transition-all"><Plus size={12} /></button>
                  <button onClick={() => setStockModal({ product: p, type: 'DEDUCT', qty: '1', note: '' })} className="p-1 rounded-md bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-all"><Minus size={12} /></button>
                  {p.barcode && <span className="flex items-center gap-1 px-2 py-0.5 bg-cyan-500/5 text-cyan-400 rounded-lg border border-cyan-500/10"><Barcode size={10} />{p.barcode}</span>}
                </div>
                <button
                  onClick={() => syncProduct(p.id)}
                  disabled={syncing === p.id}
                  className="w-full mt-2 flex items-center justify-center gap-1.5 py-1.5 rounded-xl text-xs font-medium bg-violet-500/10 border border-violet-500/20 text-violet-400 hover:bg-violet-500/20 transition-all disabled:opacity-50"
                >
                  <RefreshCw size={12} className={syncing === p.id ? 'animate-spin' : ''} />
                  {syncing === p.id ? 'Senkronize...' : 'Pazaryerlerine Gönder'}
                </button>
              </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="col-span-full text-center py-20 text-gray-500">
            <Package size={48} className="mx-auto mb-3 text-gray-700" />
            <p className="text-sm">Ürün bulunamadı</p>
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowModal(false)} />
          <div className="relative w-full max-w-lg bg-[#0d1117] border border-[#1a2332] rounded-2xl shadow-2xl p-6 space-y-5">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-white">{editing ? 'Ürün Düzenle' : 'Yeni Ürün'}</h3>
              <button onClick={() => setShowModal(false)} className="p-2 rounded-lg hover:bg-white/5 text-gray-500"><X size={18} /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-xs text-gray-500 block mb-1.5">Ürün Adı</label>
                <input type="text" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Ürün adı" className="w-full bg-[#080b12]/80 border border-[#1a2332] rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-emerald-500/50 placeholder-gray-600 transition-all" />
              </div>
              <div>
                <label className="text-xs text-gray-500 block mb-1.5">Açıklama</label>
                <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Ürün açıklaması..." rows={3} className="w-full bg-[#080b12]/80 border border-[#1a2332] rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-emerald-500/50 placeholder-gray-600 transition-all resize-none" />
              </div>
              <div>
                <label className="text-xs text-gray-500 block mb-1.5">Barkod</label>
                <div className="relative"><Barcode size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" /><input type="text" value={form.barcode} onChange={e => setForm({ ...form, barcode: e.target.value })} placeholder="Barkod kodu (pazaryerleri ile eşleşme için)" className="w-full bg-[#080b12]/80 border border-[#1a2332] rounded-xl pl-9 pr-4 py-2.5 text-white text-sm focus:outline-none focus:border-emerald-500/50 placeholder-gray-600 transition-all" /></div>
                <p className="text-[10px] text-gray-600 mt-1">Pazaryerlerindeki ürün barkodu ile aynı olmalıdır</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-gray-500 block mb-1.5">Kategori</label>
                  <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} className="w-full bg-[#080b12]/80 border border-[#1a2332] rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-emerald-500/50 transition-all">{CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}</select>
                </div>
                <div>
                  <label className="text-xs text-gray-500 block mb-1.5">Fiyat (₺)</label>
                  <div className="relative"><DollarSign size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" /><input type="number" step="0.01" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} placeholder="0.00" className="w-full bg-[#080b12]/80 border border-[#1a2332] rounded-xl pl-9 pr-4 py-2.5 text-white text-sm focus:outline-none focus:border-emerald-500/50 placeholder-gray-600 transition-all" /></div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-gray-500 block mb-1.5">Stok Miktarı</label>
                  <input type="number" value={form.stock} onChange={e => setForm({ ...form, stock: e.target.value })} placeholder="0" className="w-full bg-[#080b12]/80 border border-[#1a2332] rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-emerald-500/50 placeholder-gray-600 transition-all" />
                </div>
                <div>
                  <label className="text-xs text-gray-500 block mb-1.5">Durum</label>
                  <div className="flex gap-2 h-full items-center pt-1">
                    <button onClick={() => setForm({ ...form, active: true })} className={'flex-1 py-2 rounded-xl text-xs font-medium border transition-all ' + (form.active ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : 'bg-[#080b12]/50 border-[#1a2332] text-gray-500')}>Aktif</button>
                    <button onClick={() => setForm({ ...form, active: false })} className={'flex-1 py-2 rounded-xl text-xs font-medium border transition-all ' + (!form.active ? 'bg-red-500/10 border-red-500/30 text-red-400' : 'bg-[#080b12]/50 border-[#1a2332] text-gray-500')}>Pasif</button>
                  </div>
                </div>
              </div>
              {editing && variants.length > 0 && (
                <div>
                  <label className="text-xs text-gray-500 block mb-1.5">Varyantlar</label>
                  <div className="space-y-2">
                    {variants.map((v: any) => (
                      <div key={v.id} className="flex items-center gap-2 bg-[#080b12]/50 rounded-xl p-3 border border-[#1a2332]">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-white truncate">{v.name}</p>
                          <p className="text-[11px] text-gray-500">{v.barcode && 'Barkod: ' + v.barcode}{v.price ? ' / ' + v.price + ' TL' : ''} / Stok: {v.stock}</p>
                          {v.options?.length > 0 && <p className="text-[11px] text-gray-600">{v.options.join(', ')}</p>}
                        </div>
                        <button onClick={() => deleteVariant(v.id)} className="p-1.5 text-gray-500 hover:text-red-400 transition-colors"><Trash2 size={14} /></button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {editing && (
                <div className="border border-dashed border-[#1a2332] rounded-xl p-4 space-y-3">
                  <label className="text-xs text-gray-500 block">Yeni Varyant Ekle</label>
                  <input type="text" value={variantForm.name} onChange={e => setVariantForm({ ...variantForm, name: e.target.value })} placeholder="Varyant adı (örn: Siyah / XL)" className="w-full bg-[#080b12]/80 border border-[#1a2332] rounded-lg px-3 py-2 text-white text-xs focus:outline-none focus:border-emerald-500/50 placeholder-gray-600" />
                  <div className="grid grid-cols-3 gap-2">
                    <input type="text" value={variantForm.barcode} onChange={e => setVariantForm({ ...variantForm, barcode: e.target.value })} placeholder="Barkod" className="w-full bg-[#080b12]/80 border border-[#1a2332] rounded-lg px-3 py-2 text-white text-xs focus:outline-none focus:border-emerald-500/50 placeholder-gray-600" />
                    <input type="number" value={variantForm.price} onChange={e => setVariantForm({ ...variantForm, price: e.target.value })} placeholder="Fiyat" className="w-full bg-[#080b12]/80 border border-[#1a2332] rounded-lg px-3 py-2 text-white text-xs focus:outline-none focus:border-emerald-500/50 placeholder-gray-600" />
                    <input type="number" value={variantForm.stock} onChange={e => setVariantForm({ ...variantForm, stock: e.target.value })} placeholder="Stok" className="w-full bg-[#080b12]/80 border border-[#1a2332] rounded-lg px-3 py-2 text-white text-xs focus:outline-none focus:border-emerald-500/50 placeholder-gray-600" />
                  </div>
                  <input type="text" value={variantForm.options} onChange={e => setVariantForm({ ...variantForm, options: e.target.value })} placeholder="Seçenekler (virgülle ayırın: color:Siyah, size:XL)" className="w-full bg-[#080b12]/80 border border-[#1a2332] rounded-lg px-3 py-2 text-white text-xs focus:outline-none focus:border-emerald-500/50 placeholder-gray-600" />
                  <button onClick={addVariant} disabled={!variantForm.name} className="w-full py-2 bg-emerald-600/20 text-emerald-400 rounded-lg text-xs font-medium hover:bg-emerald-600/30 transition-all disabled:opacity-50">Varyant Ekle</button>
                </div>
              )}
              <div>
                <label className="text-xs text-gray-500 block mb-1.5">Ürün Görseli</label>
                {form.image ? (
                  <div className="relative rounded-xl overflow-hidden border border-[#1a2332]">
                    <img src={form.image} alt="Önizleme" className="w-full h-48 object-cover" />
                    <button onClick={removeImage} className="absolute top-2 right-2 p-1.5 rounded-lg bg-black/60 backdrop-blur-sm text-white hover:bg-red-500/60 transition-all"><X size={14} /></button>
                    {uploading && <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-xl"><Loader2 size={24} className="text-emerald-400 animate-spin" /></div>}
                  </div>
                ) : (
                  <div onClick={() => fileInputRef.current?.click()} className="w-full h-48 bg-[#080b12]/80 border border-dashed border-[#1a2332] rounded-xl flex flex-col items-center justify-center gap-2 cursor-pointer hover:border-emerald-500/40 transition-all">
                    {uploading ? <Loader2 size={24} className="text-emerald-400 animate-spin" /> : <Upload size={24} className="text-gray-500" />}
                    <p className="text-xs text-gray-500">{uploading ? 'Yükleniyor...' : 'Fotoğraf yüklemek için tıklayın'}</p>
                  </div>
                )}
                <input ref={fileInputRef} type="file" accept="image/*" onChange={uploadFile} className="hidden" />
              </div>
            </div>
            <div className="flex gap-3 justify-end pt-2">
              <button onClick={() => setShowModal(false)} className="px-5 py-2.5 border border-[#1a2332] text-gray-400 rounded-xl text-sm font-medium hover:text-white transition-all">İptal</button>
              <button onClick={save} disabled={!form.name || !form.price} className="px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-emerald-500 text-white rounded-xl text-sm font-medium hover:shadow-lg hover:shadow-emerald-500/25 transition-all disabled:opacity-50">Kaydet</button>
            </div>
          </div>
        </div>
      )}
      {stockModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={() => setStockModal(null)}>
          <div className="bg-[#0d1117] border border-[#1a2332] rounded-2xl p-6 w-full max-w-sm" onClick={e => e.stopPropagation()}>
            <h3 className="text-white font-bold text-lg mb-1">{stockModal.type === 'ADD' ? 'Stok Ekle' : 'Stok Düş'}</h3>
            <p className="text-gray-400 text-sm mb-4">{stockModal.product.name} — Mevcut stok: <span className="text-white font-medium">{stockModal.product.stock}</span></p>
            <div className="space-y-3 mb-4">
              <div><label className="text-xs text-gray-500 mb-1 block">Miktar</label><input type="number" min="1" value={stockModal.qty} onChange={e => setStockModal({ ...stockModal, qty: e.target.value })} className="w-full bg-[#080b12]/80 border border-[#1a2332] rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-emerald-500/50" autoFocus /></div>
              <div><label className="text-xs text-gray-500 mb-1 block">Not (opsiyonel)</label><input value={stockModal.note} onChange={e => setStockModal({ ...stockModal, note: e.target.value })} className="w-full bg-[#080b12]/80 border border-[#1a2332] rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-emerald-500/50" placeholder="Sayım fazlası, fire, vb." /></div>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setStockModal(null)} className="flex-1 px-4 py-2.5 bg-[#1a2332] text-gray-300 rounded-xl text-sm font-medium hover:bg-[#243040] transition-all">İptal</button>
              <button onClick={applyStockChange} className="flex-1 px-4 py-2.5 rounded-xl text-sm font-medium text-white transition-all bg-emerald-600 hover:bg-emerald-700">{stockModal.type === 'ADD' ? 'Stok Ekle' : 'Stok Düş'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
