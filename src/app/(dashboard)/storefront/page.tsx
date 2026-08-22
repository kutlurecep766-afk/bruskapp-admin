'use client'
import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { Store, Plus, Trash2, Save, QrCode, Download, Table2, Package, Image, Link, Globe, SmartphoneNfc, Banknote, CreditCard, HandCoins, WalletCards } from 'lucide-react'

const TABLE_PAYMENTS = ['Online Ödeme', 'Kasada Kart', 'Kasada Nakit']
const ONLINE_PAYMENTS = ['Online Ödeme', 'Kapıda Kart', 'Kapıda Nakit']
const PAYMENT_META: Record<string, { label: string; icon: any; desc: string }> = {
  'Online Ödeme': { label: 'Online Ödeme', icon: SmartphoneNfc, desc: 'SanalPOS ile online' },
  'Kapıda Nakit': { label: 'Kapıda Nakit', icon: Banknote, desc: 'Adrese teslimde nakit' },
  'Kapıda Kart': { label: 'Kapıda Kart', icon: CreditCard, desc: 'Adrese teslimde kart' },
  'Kasada Nakit': { label: 'Kasada Nakit', icon: HandCoins, desc: 'Masa siparişinde kasadan nakit' },
  'Kasada Kart': { label: 'Kasada Kart', icon: WalletCards, desc: 'Masa siparişinde kasadan kart' },
}

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
  const [statusMenuFor, setStatusMenuFor] = useState<string | null>(null)
  const [shopInfo, setShopInfo] = useState({ shopName: '', address: '', phone: '', locationUrl: '', workingHours: [''] as string[] })
  const [paymentMethodsTable, setPaymentMethodsTable] = useState<string[]>(TABLE_PAYMENTS)
  const [paymentMethodsOnline, setPaymentMethodsOnline] = useState<string[]>(ONLINE_PAYMENTS)

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
          setShopInfo({
            shopName: cfg.shopName || '',
            address: cfg.address || '',
            phone: cfg.phone || '',
            locationUrl: cfg.locationUrl || '',
            workingHours: cfg.workingHours && cfg.workingHours.length ? cfg.workingHours : [''],
          })
          setPaymentMethodsTable(cfg.paymentMethodsTable?.length ? cfg.paymentMethodsTable : TABLE_PAYMENTS)
          setPaymentMethodsOnline(cfg.paymentMethodsOnline?.length ? cfg.paymentMethodsOnline : ONLINE_PAYMENTS)
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
          setShopInfo({
            shopName: data.shopName || '',
            address: data.address || '',
            phone: data.phone || '',
            locationUrl: data.locationUrl || '',
            workingHours: data.workingHours && data.workingHours.length ? data.workingHours : [''],
          })
          setPaymentMethodsTable(data.paymentMethodsTable?.length ? data.paymentMethodsTable : TABLE_PAYMENTS)
          setPaymentMethodsOnline(data.paymentMethodsOnline?.length ? data.paymentMethodsOnline : ONLINE_PAYMENTS)
        } else {
          setError('Bu sayfaya erişim yetkiniz yok')
        }
      }
    } catch { setError('Veri yüklenirken hata oluştu') }
    finally { setLoading(false) }
  }

  useEffect(() => { loadData() }, [tenantIdParam])

  useEffect(() => {
    const close = () => setStatusMenuFor(null)
    window.addEventListener('click', close)
    return () => window.removeEventListener('click', close)
  }, [])

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

  const setProductStatus = async (p: any, status: string) => {
    const tid = activeTenantId()
    if (!tid) return
    setStatusMenuFor(null)
    const res = await fetch(`/api/storefront/admin/${tid}/products/${p.id}`, {
      method: 'PUT', headers: { 'Content-Type': 'application/json' }, credentials: 'include',
      body: JSON.stringify({ ...p, status }),
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

  const togglePayment = (kind: 'table' | 'online', key: string) => {
    if (kind === 'table') {
      setPaymentMethodsTable(prev => prev.includes(key) ? (prev.length > 1 ? prev.filter(k => k !== key) : prev) : [...prev, key])
    } else {
      setPaymentMethodsOnline(prev => prev.includes(key) ? (prev.length > 1 ? prev.filter(k => k !== key) : prev) : [...prev, key])
    }
  }

  const saveConfig = async () => {
    setSaving(true)
    const tid = activeTenantId()
    const payload = {
      masaNumbers,
      shopName: shopInfo.shopName.trim(),
      address: shopInfo.address.trim(),
      phone: shopInfo.phone.trim(),
      locationUrl: shopInfo.locationUrl.trim(),
      workingHours: shopInfo.workingHours.map(h => h.trim()).filter(Boolean),
      paymentMethodsTable,
      paymentMethodsOnline,
    }
    if (tid) {
      await fetch(`/api/storefront/admin/${tid}/config`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' }, credentials: 'include',
        body: JSON.stringify(payload),
      })
    } else {
      await fetch('/api/storefront/admin/me/config', {
        method: 'PUT', headers: { 'Content-Type': 'application/json' }, credentials: 'include',
        body: JSON.stringify(payload),
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

  const downloadQr = async (url: string, filename: string) => {
    try {
      const res = await fetch(url, { mode: 'cors' })
      if (!res.ok) throw new Error('fetch failed')
      const blob = await res.blob()
      const objectUrl = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = objectUrl
      a.download = filename
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(objectUrl)
    } catch {
      window.open(url, '_blank')
    }
  }

  if (loading) return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" /></div>

  if (error) return (
    <div className="flex items-center justify-center h-64">
      <div className="text-center">
        <Store className="w-12 h-12 text-blue-300 mx-auto mb-3" />
        <p className="text-gray-500 text-sm">{error}</p>
      </div>
    </div>
  )

  if (!storefront) return (
    <div className="flex items-center justify-center h-64">
      <div className="text-center">
        <Store className="w-12 h-12 text-blue-300 mx-auto mb-3" />
        <p className="text-gray-500 text-sm">İşletme bulunamadı</p>
      </div>
    </div>
  )

  const SectionCard = ({ icon: Icon, title, children, extra }: { icon: any; title: string; children: React.ReactNode; extra?: React.ReactNode }) => (
    <div className="relative overflow-hidden rounded-2xl bg-white border border-blue-100 p-6 shadow-sm hover:shadow-lg hover:shadow-blue-600/10 transition-all duration-300">
      <div className="absolute -top-8 -right-8 w-24 h-24 rounded-full bg-blue-50" />
      <div className="relative">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-gray-900 font-bold flex items-center gap-2"><Icon size={18} className="text-blue-600" /> {title}</h3>
          {extra}
        </div>
        {children}
      </div>
    </div>
  )

  const inputCls = "w-full bg-blue-50/40 border border-blue-100 rounded-xl px-3 py-2 text-gray-900 text-sm focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100 placeholder-gray-400 transition-all"
  const labelCls = "text-[10px] text-gray-500 font-semibold uppercase tracking-wider"

  return (
    <div className="space-y-6 pb-12">
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-700 via-blue-600 to-blue-500 p-6 lg:p-8 shadow-lg shadow-blue-600/20">
        <div className="absolute -top-16 -right-16 w-64 h-64 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute -bottom-20 -left-10 w-72 h-72 rounded-full bg-blue-900/20 blur-3xl" />
        <div className="relative flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-white/15 backdrop-blur flex items-center justify-center shadow-inner">
              <Store className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-xl lg:text-2xl font-bold text-white tracking-tight">QR Menü Yönetimi</h1>
              <p className="text-sm text-blue-100 mt-0.5 flex items-center gap-1.5">
                <Package className="w-3.5 h-3.5" />
                Ürünler, QR kodlar ve dükkan bilgileri tek ekranda
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Mağaza Linki */}
      <SectionCard icon={Link} title="Mağaza Linki">
        <a href={menuUrl} target="_blank" rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-50 text-blue-700 border border-blue-200 text-sm font-semibold hover:bg-blue-600 hover:text-white hover:border-blue-600 transition-all">
          {menuUrl}
        </a>
        <p className="text-xs text-gray-500 mt-2">Müşterileriniz bu linkten menünüzü görüntüleyebilir</p>
      </SectionCard>

      {/* QR Kod */}
      <SectionCard icon={QrCode} title="QR Kodlar">
        {/* Online Sipariş QR */}
        <div className="mb-6 p-4 rounded-xl bg-blue-50/50 border border-blue-100">
          <p className="text-gray-900 text-sm font-semibold mb-1">Online Sipariş QR Kodu</p>
          <p className="text-xs text-gray-500 mb-3">Müşterileriniz bu QR'ı okutarak online sipariş verebilir (adresli teslimat). Bu QR kodu vitrin, web sitesi veya paket üzerine koyabilirsiniz.</p>
          {onlineQrUrl && (
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <img src={onlineQrUrl} alt="Online Sipariş QR" className="w-32 h-32 rounded-xl bg-white p-2 border border-blue-100 shadow-sm" />
              <div className="flex flex-col gap-2 min-w-0">
                <a href={menuUrl} target="_blank" rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs text-blue-600 font-mono font-semibold hover:underline truncate max-w-[260px] sm:max-w-xs">
                  <Link size={12} className="shrink-0" /> {menuUrl}
                </a>
                <button onClick={(e) => { e.preventDefault(); downloadQr(onlineQrUrl, 'onlineQR.png') }}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-50 text-blue-700 border border-blue-200 text-sm font-semibold hover:bg-blue-600 hover:text-white hover:border-blue-600 transition-all cursor-pointer w-fit">
                  <Download size={16} /> QR İndir
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Masa QR Kodları */}
        <p className="text-gray-900 text-sm font-semibold mb-1">Masa QR Kodları</p>
        <p className="text-xs text-gray-500 mb-3">Her masa için ayrı QR kodu. Müşteri masasındaki QR'ı okutunca masa numarası otomatik seçilir ve siparişi masaya teslim edilir.</p>
        {masaNumbers.length === 0 ? (
          <p className="text-xs text-gray-500">Henüz masa eklenmemiş. Aşağıdaki "Masa Numaraları" bölümünden masa ekleyin.</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {masaNumbers.map(n => {
              const mqr = masaQrUrl(n)
              return (
                <div key={n} className="flex flex-col items-center gap-2 p-3 rounded-xl bg-blue-50/50 border border-blue-100 hover:shadow-md hover:shadow-blue-600/10 transition-all">
                  <p className="text-gray-900 text-sm font-bold">Masa {n}</p>
                  <img src={mqr} alt={`Masa ${n} QR`} className="w-24 h-24 rounded-lg bg-white p-1.5 border border-blue-100 shadow-sm" />
                  <a href={menuUrl + '?masa=' + n} target="_blank" rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-[10px] text-blue-600 font-mono font-semibold hover:underline truncate max-w-full">
                    <Link size={11} className="shrink-0" /> {menuUrl + '?masa=' + n}
                  </a>
                  <button onClick={(e) => { e.preventDefault(); downloadQr(mqr, `masa${n}QR.png`) }}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-50 text-blue-700 border border-blue-200 text-xs font-semibold hover:bg-blue-600 hover:text-white hover:border-blue-600 transition-all cursor-pointer">
                    <Download size={14} /> İndir
                  </button>
                </div>
              )
            })}
          </div>
        )}
      </SectionCard>

      {/* Dükkan Bilgileri */}
      <SectionCard icon={Store} title="Dükkan Bilgileri" extra={
        <button onClick={saveConfig} disabled={saving} className="px-4 py-2 rounded-full bg-blue-600 text-white text-xs font-bold shadow-md shadow-blue-600/30 hover:bg-blue-700 hover:scale-105 active:scale-95 transition-all disabled:opacity-50">
          <Save size={14} className="inline mr-1 -mt-0.5" />Dükkan Bilgilerini Kaydet
        </button>
      }>
        <p className="text-xs text-gray-500 mb-4">Bu bilgiler QR menüde banner'ın altında dükkan kartı olarak görünür.</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex flex-col gap-1">
            <label className={labelCls}>Dükkan Adı</label>
            <input value={shopInfo.shopName} onChange={e => setShopInfo({ ...shopInfo, shopName: e.target.value })}
              placeholder="Örn: Cafe Linna"
              className={inputCls} />
          </div>
          <div className="flex flex-col gap-1">
            <label className={labelCls}>Telefon</label>
            <input value={shopInfo.phone} onChange={e => setShopInfo({ ...shopInfo, phone: e.target.value })}
              placeholder="0 (5XX) XXX XX XX"
              className={inputCls} />
          </div>
          <div className="flex flex-col gap-1 md:col-span-2">
            <label className={labelCls}>Adres / Konum</label>
            <input value={shopInfo.address} onChange={e => setShopInfo({ ...shopInfo, address: e.target.value })}
              placeholder="Örn: Atatürk Cad. No:12, Kadıköy/İstanbul"
              className={inputCls} />
          </div>
          <div className="flex flex-col gap-1 md:col-span-2">
            <label className={labelCls}>Konum Linki (Google Maps)</label>
            <input value={shopInfo.locationUrl} onChange={e => setShopInfo({ ...shopInfo, locationUrl: e.target.value })}
              placeholder="https://maps.google.com/... veya https://maps.app.goo.gl/..."
              className={inputCls} />
            <p className="text-[10px] text-gray-500">Doluysa QR menüde konum butonu görünür; müşteri tıklayınca haritaya yönlendirilir.</p>
          </div>
          <div className="flex flex-col gap-1 md:col-span-2">
            <label className={labelCls}>Çalışma Saatleri</label>
            <p className="text-[10px] text-gray-500 mb-1">Her satır bir saat dilimi (ör: "Pzt - Cuma: 09:00 - 22:00")</p>
            {shopInfo.workingHours.map((h, i) => (
              <div key={i} className="flex gap-2 mb-1">
                <input value={h} onChange={e => { const arr = [...shopInfo.workingHours]; arr[i] = e.target.value; setShopInfo({ ...shopInfo, workingHours: arr }) }}
                  placeholder="Örn: Pzt - Cuma: 09:00 - 22:00"
                  className={inputCls} />
                <button onClick={() => setShopInfo({ ...shopInfo, workingHours: shopInfo.workingHours.filter((_, x) => x !== i) })} className="px-2 text-gray-400 hover:text-red-500 text-sm transition-colors">✕</button>
              </div>
            ))}
            <button onClick={() => setShopInfo({ ...shopInfo, workingHours: [...shopInfo.workingHours, ''] })} className="text-xs text-blue-600 hover:text-blue-700 font-semibold mt-1 text-left">+ Saat Satırı Ekle</button>
          </div>
          <div className="flex flex-col gap-3 md:col-span-2">
            <label className={labelCls}>Ödeme Yöntemleri</label>
            <p className="text-[10px] text-gray-500">Seçili ödeme yöntemleri her QR kodu için aktif olur. Tıklayarak seçebilir/yayayabilirsiniz.</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-1">
              <div className="rounded-xl bg-blue-50/40 border border-blue-100 p-3">
                <div className="flex items-center gap-2 mb-2">
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-600 text-white text-[9px] font-bold uppercase tracking-wide"><Table2 size={9} /> Masa QR</span>
                </div>
                <div className="space-y-1.5">
                  {TABLE_PAYMENTS.map(key => {
                    const meta = PAYMENT_META[key]
                    const Icon = meta.icon
                    const active = paymentMethodsTable.includes(key)
                    return (
                      <button key={key} onClick={() => togglePayment('table', key)} type="button"
                        className={'w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg border transition-all text-left ' + (active ? 'bg-white border-blue-200 cursor-pointer hover:border-blue-400' : 'bg-white/60 border-blue-100 opacity-60 cursor-pointer hover:opacity-100')}>
                        <span className={'w-4 h-4 rounded flex items-center justify-center flex-shrink-0 transition-all ' + (active ? 'bg-blue-600' : 'bg-gray-200')}>
                          {active && <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
                        </span>
                        <Icon size={14} className={(active ? 'text-blue-600' : 'text-gray-400') + ' flex-shrink-0'} />
                        <div className="min-w-0">
                          <p className={'text-xs font-semibold ' + (active ? 'text-gray-900' : 'text-gray-400')}>{meta.label}</p>
                          <p className="text-[9px] text-gray-400">{meta.desc}</p>
                        </div>
                      </button>
                    )
                  })}
                </div>
              </div>
              <div className="rounded-xl bg-cyan-50/40 border border-cyan-100 p-3">
                <div className="flex items-center gap-2 mb-2">
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-cyan-600 text-white text-[9px] font-bold uppercase tracking-wide"><Globe size={9} /> Online QR</span>
                </div>
                <div className="space-y-1.5">
                  {ONLINE_PAYMENTS.map(key => {
                    const meta = PAYMENT_META[key]
                    const Icon = meta.icon
                    const active = paymentMethodsOnline.includes(key)
                    return (
                      <button key={key} onClick={() => togglePayment('online', key)} type="button"
                        className={'w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg border transition-all text-left ' + (active ? 'bg-white border-cyan-200 cursor-pointer hover:border-cyan-400' : 'bg-white/60 border-cyan-100 opacity-60 cursor-pointer hover:opacity-100')}>
                        <span className={'w-4 h-4 rounded flex items-center justify-center flex-shrink-0 transition-all ' + (active ? 'bg-cyan-600' : 'bg-gray-200')}>
                          {active && <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
                        </span>
                        <Icon size={14} className={(active ? 'text-cyan-600' : 'text-gray-400') + ' flex-shrink-0'} />
                        <div className="min-w-0">
                          <p className={'text-xs font-semibold ' + (active ? 'text-gray-900' : 'text-gray-400')}>{meta.label}</p>
                          <p className="text-[9px] text-gray-400">{meta.desc}</p>
                        </div>
                      </button>
                    )
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      </SectionCard>

      {/* Sosyal Medya Yönlendirme */}
      <SectionCard icon={Link} title="Sosyal Medya Yönlendirme" extra={
        <button onClick={saveSocialLinks} disabled={saving} className="px-4 py-2 rounded-full bg-blue-600 text-white text-xs font-bold shadow-md shadow-blue-600/30 hover:bg-blue-700 hover:scale-105 active:scale-95 transition-all disabled:opacity-50">
          <Save size={14} className="inline mr-1 -mt-0.5" />Linkleri Kaydet
        </button>
      }>
        <p className="text-xs text-gray-500 mb-4">Bu linkler QR menüde logo olarak görünür; müşteri tıklayınca direkt oraya yönlendirilir.</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex flex-col gap-1">
            <label className={labelCls}>Google Yorum Linki</label>
            <input value={googleReviewUrl} onChange={e => setGoogleReviewUrl(e.target.value)}
              placeholder="https://g.page/r/... yorum linki"
              className={inputCls} />
          </div>
          <div className="flex flex-col gap-1">
            <label className={labelCls}>Instagram Linki</label>
            <input value={instagramUrl} onChange={e => setInstagramUrl(e.target.value)}
              placeholder="https://instagram.com/isletmeadi"
              className={inputCls} />
          </div>
        </div>
      </SectionCard>

      {/* Banner Yükleme */}
      <SectionCard icon={Image} title="Banner">
        <div>
          <p className="text-sm text-gray-700 mb-2 font-medium">Mevcut Banner</p>
          {storefront.bannerUrl ? (
            <img src={storefront.bannerUrl} className="w-full max-w-md h-32 rounded-xl object-cover border border-blue-100 shadow-sm mb-3" />
          ) : (
            <div className="w-full max-w-md h-32 rounded-xl bg-blue-50/50 border border-blue-100 flex items-center justify-center mb-3">
              <Image size={24} className="text-blue-300" />
            </div>
          )}
          <p className="text-[10px] text-gray-500 mb-1">Önerilen: 1200x400 piksel</p>
          <input type="file" accept="image/*" onChange={e => setBannerFile(e.target.files?.[0] || null)} className="text-sm text-gray-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-medium file:bg-blue-600 file:text-white hover:file:bg-blue-700 transition-all" />
          {bannerFile && (
            <button onClick={handleBannerUpload} disabled={uploading} className="mt-2 px-3 py-1.5 rounded-lg bg-blue-600 text-white text-xs font-bold shadow-md shadow-blue-600/30 hover:bg-blue-700 transition-all disabled:opacity-50">
              {uploading ? 'Yükleniyor...' : 'Banner Yükle'}
            </button>
          )}
        </div>
      </SectionCard>

      {/* Ürünler */}
      <div className="relative overflow-hidden rounded-2xl bg-white border border-blue-100 p-6 shadow-sm hover:shadow-lg hover:shadow-blue-600/10 transition-all duration-300">
        <div className="absolute -top-8 -right-8 w-24 h-24 rounded-full bg-blue-50" />
        <div className="relative">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-gray-900 font-bold flex items-center gap-2"><Package size={18} className="text-blue-600" /> Ürünler</h3>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-bold border border-blue-200">
              <Package size={12} /> {products.length} ürün
            </span>
          </div>

          <div className="space-y-2 mb-4">
            {products.length === 0 && (
              <div className="rounded-2xl bg-blue-50/50 border border-dashed border-blue-200 py-12 text-center">
                <div className="w-14 h-14 mx-auto mb-3 rounded-full bg-white border border-blue-100 flex items-center justify-center">
                  <Package className="w-7 h-7 text-blue-300" />
                </div>
                <p className="text-gray-500 text-sm font-semibold">Henüz ürün eklenmemiş</p>
                <p className="text-gray-400 text-xs mt-1.5">Aşağıdaki formdan ilk ürününüzü ekleyin</p>
              </div>
            )}
            {products.map((p: any) => (
              <div key={p.id} onClick={() => setEditingProduct({ ...p })} className="flex items-center justify-between p-3 rounded-xl bg-blue-50/40 border border-blue-100 cursor-pointer hover:border-blue-300 hover:shadow-md hover:shadow-blue-600/10 transition-all group">
                <div className="flex items-center gap-3">
                  {p.image ? (
                    <img src={p.image} className="w-12 h-12 rounded-lg object-cover border border-blue-100" />
                  ) : (
                    <div className="w-12 h-12 rounded-lg bg-blue-100/60 flex items-center justify-center flex-shrink-0">
                      <Package size={18} className="text-blue-400" />
                    </div>
                  )}
                  <div>
                    <p className="text-gray-900 text-sm font-semibold">{p.name}</p>
                    <p className="text-xs text-gray-500 truncate max-w-xs">
                      {p.weight && <span className="text-gray-400 mr-2">{p.weight}</span>}
                      {p.description} {p.category && `(${p.category})`}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    {p.originalPrice && parseFloat(p.originalPrice) > parseFloat(p.price) ? (
                      <div>
                        <span className="text-gray-400 line-through text-xs">₺{p.originalPrice}</span>
                        <span className="text-blue-700 font-bold text-sm ml-1">₺{p.price}</span>
                      </div>
                    ) : (
                      <span className="text-blue-700 font-bold text-sm">₺{p.price}</span>
                    )}
                  </div>
                  <div className="relative">
                    <button onClick={(e) => { e.stopPropagation(); setStatusMenuFor(statusMenuFor === p.id ? null : p.id) }} title="Durumu değiştir"
                      className={
                      p.status === 'soldout' ? 'text-[10px] px-2 py-1 rounded-full bg-red-50 text-red-600 border border-red-200 hover:bg-red-100 transition-all cursor-pointer'
                      : p.status === 'preparing' ? 'text-[10px] px-2 py-1 rounded-full bg-amber-50 text-amber-600 border border-amber-200 hover:bg-amber-100 transition-all cursor-pointer'
                      : 'text-[10px] px-2 py-1 rounded-full bg-green-50 text-green-600 border border-green-200 hover:bg-green-100 transition-all cursor-pointer'
                    }>
                      {p.status === 'soldout' ? 'Tükendi' : p.status === 'preparing' ? 'Hazırlıkta' : 'Aktif'}
                    </button>
                    {statusMenuFor === p.id && (
                      <div onClick={e => e.stopPropagation()} className="absolute right-0 top-7 z-20 w-40 rounded-xl bg-white border border-blue-100 shadow-2xl overflow-hidden">
                        {[
                          { val: 'active', label: 'Aktif', cls: 'text-green-600 hover:bg-green-50' },
                          { val: 'soldout', label: 'Tükendi', cls: 'text-red-600 hover:bg-red-50' },
                          { val: 'preparing', label: 'Hazırlıkta', cls: 'text-amber-600 hover:bg-amber-50' },
                        ].map(opt => (
                          <button key={opt.val} onClick={(e) => { e.stopPropagation(); setProductStatus(p, opt.val) }}
                            className={`w-full text-left px-3 py-2 text-[11px] font-medium transition-colors ${opt.cls} ${p.status === opt.val ? 'bg-blue-50' : ''}`}>
                            {opt.label}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                  <span className="text-[10px] text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity hidden md:inline">Düzenlemek için tıklayın</span>
                  <button onClick={(e) => { e.stopPropagation(); deleteProduct(p.id) }} className="text-red-500 hover:text-red-600 transition-colors"><Trash2 size={14} /></button>
                </div>
              </div>
            ))}
          </div>

          {editingProduct ? (
            <div className="flex flex-col gap-3 p-4 rounded-xl bg-blue-50/40 border border-blue-100 animate-fadeIn">
              <div className="flex items-center justify-between mb-1">
                <p className="text-sm text-gray-900 font-bold flex items-center gap-2"><Package size={14} className="text-blue-600" /> Ürünü Düzenle</p>
                <span className="text-[10px] text-gray-400">Düzenleme modu</span>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
                <div className="col-span-2 flex flex-col gap-1">
                  <label className={labelCls}>Ürün Adı</label>
                  <input value={editingProduct.name} onChange={e => setEditingProduct({ ...editingProduct, name: e.target.value })} placeholder="Örn: Kahve" className={inputCls} />
                </div>
                <div className="flex flex-col gap-1">
                  <label className={labelCls}>Fiyat (₺)</label>
                  <input value={editingProduct.price} onChange={e => setEditingProduct({ ...editingProduct, price: e.target.value })} type="number" step="0.01" placeholder="0.00" className={inputCls} />
                </div>
                <div className="flex flex-col gap-1">
                  <label className={labelCls}>Gramaj</label>
                  <input value={editingProduct.weight || ''} onChange={e => setEditingProduct({ ...editingProduct, weight: e.target.value })} placeholder="200 gr" className={inputCls} />
                </div>
                <div className="flex flex-col gap-1">
                  <label className={labelCls}>İndirimli Fiyat</label>
                  <input value={editingProduct.originalPrice || ''} onChange={e => setEditingProduct({ ...editingProduct, originalPrice: e.target.value })} type="number" step="0.01" placeholder="0.00" className={inputCls} />
                </div>
                <div className="flex flex-col gap-1">
                  <label className={labelCls}>Kategori</label>
                  <input value={editingProduct.category || ''} onChange={e => setEditingProduct({ ...editingProduct, category: e.target.value })} placeholder="İçecekler" className={inputCls} />
                </div>
                <div className="flex flex-col gap-1">
                  <label className={labelCls}>Durum</label>
                  <select value={editingProduct.status || 'active'} onChange={e => setEditingProduct({ ...editingProduct, status: e.target.value })}
                    className={inputCls}>
                    <option value="active">Aktif</option>
                    <option value="soldout">Tükendi</option>
                    <option value="preparing">Hazırlık Aşamasında</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
                <div className="col-span-3 flex flex-col gap-1">
                  <label className={labelCls}>Açıklama</label>
                  <input value={editingProduct.description || ''} onChange={e => setEditingProduct({ ...editingProduct, description: e.target.value })} placeholder="Ürün açıklaması" className={inputCls} />
                </div>
                <div className="col-span-3 flex flex-col gap-1">
                  <label className={labelCls}>Görsel</label>
                  <p className="text-[10px] text-gray-500">Önerilen: 300x300 piksel</p>
                  <div className="flex items-center gap-2">
                    {editingProduct.image && <img src={editingProduct.image} className="w-10 h-10 rounded-lg object-cover border border-blue-100" />}
                    <input type="file" accept="image/*" onChange={async e => {
                      const file = e.target.files?.[0]
                      if (!file) return
                      const url = await uploadFile(file)
                      if (url) setEditingProduct((prev: any) => ({ ...prev, image: url }))
                    }} className="text-sm text-gray-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-medium file:bg-blue-600 file:text-white hover:file:bg-blue-700 transition-all" />
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <button onClick={updateProduct} disabled={saving} className="flex-1 px-4 py-2.5 rounded-full bg-gradient-to-r from-blue-600 to-blue-700 text-white text-sm font-bold shadow-md shadow-blue-600/30 hover:from-blue-700 hover:to-blue-800 transition-all active:scale-95 disabled:opacity-50"><Save size={14} className="inline mr-1 -mt-0.5" />Kaydet</button>
                <button onClick={() => setEditingProduct(null)} className="px-4 py-2.5 rounded-full bg-white border border-blue-200 text-gray-600 text-sm font-bold hover:bg-blue-50 transition-all">İptal</button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-3 p-4 rounded-xl bg-blue-50/40 border border-blue-100">
              <div className="flex items-center justify-between mb-1">
                <p className="text-sm text-gray-900 font-bold flex items-center gap-2"><Plus size={14} className="text-blue-600" /> Yeni Ürün Ekle</p>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
                <div className="col-span-2 flex flex-col gap-1">
                  <label className={labelCls}>Ürün Adı</label>
                  <input value={newProduct.name} onChange={e => setNewProduct({ ...newProduct, name: e.target.value })} placeholder="Örn: Kahve" className={inputCls} />
                </div>
                <div className="flex flex-col gap-1">
                  <label className={labelCls}>Fiyat (₺)</label>
                  <input value={newProduct.price} onChange={e => setNewProduct({ ...newProduct, price: e.target.value })} type="number" step="0.01" placeholder="0.00" className={inputCls} />
                </div>
                <div className="flex flex-col gap-1">
                  <label className={labelCls}>Gramaj</label>
                  <input value={newProduct.weight} onChange={e => setNewProduct({ ...newProduct, weight: e.target.value })} placeholder="200 gr" className={inputCls} />
                </div>
                <div className="flex flex-col gap-1">
                  <label className={labelCls}>İndirimli Fiyat</label>
                  <input value={newProduct.originalPrice} onChange={e => setNewProduct({ ...newProduct, originalPrice: e.target.value })} type="number" step="0.01" placeholder="0.00" className={inputCls} />
                </div>
                <div className="flex flex-col gap-1">
                  <label className={labelCls}>Kategori</label>
                  <input value={newProduct.category || ''} onChange={e => setNewProduct({ ...newProduct, category: e.target.value })} placeholder="İçecekler" className={inputCls} />
                </div>
                <div className="flex flex-col gap-1">
                  <label className={labelCls}>Durum</label>
                  <select value={newProduct.status || 'active'} onChange={e => setNewProduct({ ...newProduct, status: e.target.value })}
                    className={inputCls}>
                    <option value="active">Aktif</option>
                    <option value="soldout">Tükendi</option>
                    <option value="preparing">Hazırlık Aşamasında</option>
                  </select>
                </div>
                <button onClick={addProduct} disabled={saving || !newProduct.name || !newProduct.price}
                  className="flex items-center justify-center gap-1 px-3 py-2 rounded-full bg-gradient-to-r from-blue-600 to-blue-700 text-white text-sm font-bold shadow-md shadow-blue-600/30 hover:from-blue-700 hover:to-blue-800 hover:scale-105 active:scale-95 transition-all disabled:opacity-50 self-end">
                  <Plus size={14} /> Ekle
                </button>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
                <div className="col-span-3 flex flex-col gap-1">
                  <label className={labelCls}>Açıklama</label>
                  <input value={newProduct.description} onChange={e => setNewProduct({ ...newProduct, description: e.target.value })} placeholder="Ürün açıklaması" className={inputCls} />
                </div>
                <div className="col-span-3 flex flex-col gap-1">
                  <label className={labelCls}>Görsel</label>
                  <p className="text-[10px] text-gray-500">Önerilen: 300x300 piksel</p>
                  <div className="flex items-center gap-2">
                    <input type="file" accept="image/*" onChange={async e => {
                      const file = e.target.files?.[0]
                      if (!file) return
                      const url = await uploadFile(file)
                      if (url) setNewProduct(prev => ({ ...prev, image: url }))
                    }} className="text-sm text-gray-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-medium file:bg-blue-600 file:text-white hover:file:bg-blue-700 transition-all" />
                    {newProduct.image && <img src={newProduct.image} className="w-10 h-10 rounded-lg object-cover border border-blue-100" />}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Masa Numaraları */}
      <SectionCard icon={Table2} title="Masa Numaraları" extra={
        <button onClick={saveConfig} disabled={saving} className="px-4 py-2 rounded-full bg-blue-600 text-white text-xs font-bold shadow-md shadow-blue-600/30 hover:bg-blue-700 hover:scale-105 active:scale-95 transition-all disabled:opacity-50">
          <Save size={14} className="inline mr-1 -mt-0.5" />Kaydet
        </button>
      }>
        <div className="flex gap-2 mb-3">
          <input value={newMasa} onChange={e => setNewMasa(e.target.value)} type="number" placeholder="Masa no" className="w-32 bg-blue-50/40 border border-blue-100 rounded-xl px-3 py-2 text-gray-900 text-sm focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100 placeholder-gray-400 transition-all" />
          <button onClick={addMasa} className="px-3 py-2 rounded-full bg-gradient-to-r from-blue-600 to-blue-700 text-white text-sm font-bold shadow-md shadow-blue-600/30 hover:from-blue-700 hover:to-blue-800 hover:scale-105 active:scale-95 transition-all"><Plus size={14} className="inline mr-1" />Ekle</button>
        </div>
        <div className="flex flex-wrap gap-2">
          {masaNumbers.length === 0 && <p className="text-xs text-gray-500">Masa eklenmemiş</p>}
          {masaNumbers.map(n => (
            <span key={n} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-sm font-bold">
              Masa {n}
              <button onClick={() => removeMasa(n)} className="text-blue-400 hover:text-red-500 transition-colors"><Trash2 size={12} /></button>
            </span>
          ))}
        </div>
      </SectionCard>
    </div>
  )
}