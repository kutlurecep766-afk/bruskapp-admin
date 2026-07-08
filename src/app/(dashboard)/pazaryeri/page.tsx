'use client'
import { useState, useEffect, useCallback } from 'react'

type Platform = 'trendyol' | 'hepsiburada' | 'yemeksepeti' | 'trendyolgo' | 'n11'
type Tab = 'ayarlar' | 'urunler' | 'siparisler' | 'mesajlar'
type Filter = 'all' | Platform

const platforms = [
  { key: 'trendyol' as Platform, label: 'Trendyol', color: 'orange', gradient: 'from-orange-600 to-orange-500' },
  { key: 'hepsiburada' as Platform, label: 'Hepsiburada', color: 'purple', gradient: 'from-purple-600 to-purple-500' },
  { key: 'yemeksepeti' as Platform, label: 'Yemeksepeti', color: 'red', gradient: 'from-red-600 to-red-500' },
  { key: 'trendyolgo' as Platform, label: 'Trendyol Go', color: 'emerald', gradient: 'from-emerald-600 to-emerald-500' },
  { key: 'n11' as Platform, label: 'n11', color: 'purple', gradient: 'from-purple-600 to-purple-500' },
]

const tabs = [
  { key: 'ayarlar' as Tab, label: 'Bağlantı Ayarları', desc: 'API anahtarlarını yönetin', combined: false },
  { key: 'urunler' as Tab, label: 'Ürünler & Stok', desc: 'Stok seviyelerini güncelleyin', combined: true },
  { key: 'siparisler' as Tab, label: 'Siparişler', desc: 'Gelen siparişleri takip edin', combined: true },
  { key: 'mesajlar' as Tab, label: 'Müşteri Mesajları', desc: 'Soruları yanıtlayın', combined: true },
]

export default function PazaryeriPage() {
  const [platform, setPlatform] = useState<Platform>('trendyol')
  const [tab, setTab] = useState<Tab>('ayarlar')
  const [filter, setFilter] = useState<Filter>('all')
  const [status, setStatus] = useState<Record<string, any>>({})
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState('')

  const [apiKey, setApiKey] = useState('')
  const [apiSecret, setApiSecret] = useState('')
  const [supplierId, setSupplierId] = useState('')
  const [merchantId, setMerchantId] = useState('')
  const [restaurantId, setRestaurantId] = useState('')
  const [storeId, setStoreId] = useState('')


  const [products, setProducts] = useState<any[]>([])
  const [productPage, setProductPage] = useState(0)
  const [productTotal, setProductTotal] = useState(0)
  const [stockUpdates, setStockUpdates] = useState<Record<string, { quantity: number; platform: Platform }>>({})
  const [syncingProducts, setSyncingProducts] = useState(false)

  const [orders, setOrders] = useState<any[]>([])
  const [orderPage, setOrderPage] = useState(0)
  const [orderTotal, setOrderTotal] = useState(0)
  const [syncingOrders, setSyncingOrders] = useState(false)

  const [messages, setMessages] = useState<any[]>([])
  const [replyText, setReplyText] = useState('')
  const [replyTo, setReplyTo] = useState<string | null>(null)
  const [sendingReply, setSendingReply] = useState(false)

  const pf = platforms.find(p => p.key === platform)!
  const currentTab = tabs.find(t => t.key === tab)

  useEffect(() => { loadAllStatus() }, [])

  const loadAllStatus = async () => {
    for (const p of platforms) {
      try {
        const res = await fetch('/api/marketplace/' + p.key + '/status', { credentials: 'include' })
        if (res.ok) {
          const data = await res.json()
          setStatus(s => ({ ...s, [p.key]: data }))
        }
      } catch {}
    }
  }

  const fetchWithAuth = async (url: string, opts?: RequestInit) => {
    const res = await fetch(url, { credentials: 'include', headers: { 'Content-Type': 'application/json' }, ...opts })
    if (res.status === 401) {
      const refresh = await fetch('/api/auth/refresh', { method: 'POST', credentials: 'include' })
      if (refresh.ok) return fetch(url, { credentials: 'include', headers: { 'Content-Type': 'application/json' }, ...opts })
      window.location.href = '/brk-mgmt/login'
      return null
    }
    return res
  }

  const callApi = async (url: string, body: object) => {
    setLoading(true); setResult('')
    try {
      const res = await fetchWithAuth(url, { method: 'POST', body: JSON.stringify(body) })
      if (res) setResult(JSON.stringify(await res.json(), null, 2))
    } catch { setResult('Bağlantı hatası') }
    finally { setLoading(false) }
  }

  const makePublicCall = async (url: string, body: object) => {
    try {
      const res = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
      setResult(JSON.stringify(await res.json(), null, 2))
    } catch { setResult('Bağlantı hatası') }
  }

  const loadProducts = useCallback(async () => {
    setSyncingProducts(true)
    setProducts([])
    setResult('')
    let all: any[] = []
    let total = 0
    for (const p of platforms) {
      try {
        const res = await fetchWithAuth('/api/marketplace/' + p.key + '/products?page=0&size=100')
        if (res) {
          const data = await res.json()
          if (!res.ok) { setResult(p.key + ' ürünler yüklenemedi: ' + (data.message || JSON.stringify(data))); continue }
          const tagged = (data.products || []).map((item: any) => ({ ...item, _platform: p.key }))
          all = [...all, ...tagged]
          total += data.total || 0
        }
      } catch (e) { setResult(p.key + ' bağlantı hatası') }
    }
    setProducts(all)
    setProductTotal(total)
    setProductPage(0)
    setSyncingProducts(false)
  }, [])

  const loadOrders = useCallback(async () => {
    setSyncingOrders(true)
    setOrders([])
    setResult('')
    let all: any[] = []
    let total = 0
    for (const p of platforms) {
      try {
        const res = await fetchWithAuth('/api/marketplace/' + p.key + '/orders?page=0&size=50')
        if (res) {
          const data = await res.json()
          if (!res.ok) { setResult(p.key + ' siparişler yüklenemedi: ' + (data.message || JSON.stringify(data))); continue }
          const tagged = (data.orders || []).map((item: any) => ({ ...item, _platform: p.key }))
          all = [...all, ...tagged]
          total += data.total || 0
        }
      } catch (e) { setResult(p.key + ' bağlantı hatası') }
    }
    all.sort((a, b) => new Date(b.orderDate || b.createdAt).getTime() - new Date(a.orderDate || a.createdAt).getTime())
    setOrders(all)
    setOrderTotal(total)
    setOrderPage(0)
    setSyncingOrders(false)
  }, [])

  const loadMessages = async () => {
    setMessages([])
    setResult('')
    let all: any[] = []
    for (const p of platforms) {
      try {
        const res = await fetchWithAuth('/api/marketplace/' + p.key + '/messages')
        if (res) {
          const data = await res.json()
          if (!res.ok) { setResult(p.key + ' mesajlar yüklenemedi: ' + (data.message || JSON.stringify(data))); continue }
          if (Array.isArray(data)) {
            const tagged = data.map((item: any) => ({ ...item, _platform: p.key }))
            all = [...all, ...tagged]
          }
        }
      } catch (e) { setResult(p.key + ' bağlantı hatası') }
    }
    all.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    setMessages(all)
  }

  const sendReply = async (messageId: string, msgPlatform: string) => {
    if (!replyText.trim()) return
    setSendingReply(true)
    try {
      const res = await fetchWithAuth('/api/marketplace/' + msgPlatform + '/messages/' + messageId + '/reply', {
        method: 'POST', body: JSON.stringify({ message: replyText }),
      })
      if (res) {
        const data = await res.json()
        setResult(JSON.stringify(data, null, 2))
        if (data.success) { setReplyText(''); setReplyTo(null); loadMessages() }
      }
    } catch {}
    setSendingReply(false)
  }

  const commitStockUpdates = async () => {
    const entries = Object.entries(stockUpdates).filter(([, v]) => v.quantity >= 0)
    if (!entries.length) return
    for (const p of platforms) {
      const platformUpdates = entries.filter(([, v]) => v.platform === p.key).map(([barcode, v]) => ({ barcode, quantity: v.quantity }))
      if (platformUpdates.length) {
        await callApi('/api/marketplace/' + p.key + '/stock', { updates: platformUpdates })
      }
    }
    setStockUpdates({})
  }

  const filteredProducts = filter === 'all' ? products : products.filter(p => p._platform === filter)
  const filteredOrders = filter === 'all' ? orders : orders.filter(o => o._platform === filter)
  const filteredMessages = filter === 'all' ? messages : messages.filter(m => m._platform === filter)

  const platformBadgeClass = (p: string) => {
    const map: Record<string, string> = { trendyol: 'bg-orange-500/10 text-orange-400', hepsiburada: 'bg-purple-500/10 text-purple-400', yemeksepeti: 'bg-red-500/10 text-red-400', trendyolgo: 'bg-emerald-500/10 text-emerald-400', n11: 'bg-violet-500/10 text-violet-400' }
    return map[p] || 'bg-gray-500/10 text-gray-400'
  }
  const platformShort = (p: string) => {
    const map: Record<string, string> = { trendyol: 'TY', hepsiburada: 'HB', yemeksepeti: 'YS', trendyolgo: 'TG', n11: 'N11' }
    return map[p] || p.slice(0, 2).toUpperCase()
  }
  const PlatformBadge = ({ platform: p }: { platform: string }) => (
    <span className={'inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium ' + platformBadgeClass(p)}>
      {platformShort(p)}
    </span>
  )

  const buildCredentials = () => {
    const body: Record<string, string> = {}
    if (apiKey) body.apiKey = apiKey
    if (apiSecret) body.apiSecret = apiSecret
    if (supplierId) body.supplierId = supplierId
    if (merchantId) body.merchantId = merchantId
    if (restaurantId) body.restaurantId = restaurantId
    if (storeId) body.storeId = storeId
    if (platform === 'yemeksepeti') { body.clientId = apiKey; body.clientSecret = apiSecret }
    return body
  }

  const platformDescriptions = (p: string) => {
    const map: Record<string, string> = {
      trendyol: 'Trendyol satıcı panelinden (Satıcı > Entegrasyon > API) aldığınız API anahtarı, API Secret ve Satıcı ID bilgilerini girin.',
      hepsiburada: 'Hepsiburada satıcı panelinden aldığınız API anahtarı, API Secret ve Mağaza (Merchant) ID bilgilerini girin.',
      yemeksepeti: 'Yemeksepeti partner portalından (integration.yemeksepeti.com) Client ID, Client Secret ve Restoran ID bilgilerini girin.',
      trendyolgo: 'Trendyol Go partner portalından (developers.tgoapps.com) Client ID, Client Secret ve Mağaza ID bilgilerini girin.',
      n11: 'n11 satıcı panelinden (so.n11.com) API Key ve API Secret bilgilerini girin.',
    }
    return map[p] || ''
  }

  const fieldRow = (label: string, value: string, onChange: (v: string) => void, placeholder: string, type = 'text', extra?: React.ReactNode) => (
    <div key={label}>
      <label className="block text-sm font-medium text-gray-300 mb-1.5">{label}</label>
      <div className="flex gap-2">
        <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
          className={'flex-1 bg-[#080b12] border border-[#1a2332] rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-700 focus:outline-none focus:border-' + pf.color + '-500/60 focus:ring-1 focus:ring-' + pf.color + '-500/20 transition-all font-mono'} />
        {extra}
      </div>
    </div>
  )

  const renderFields = () => {
    switch (platform) {
      case 'trendyol':
        return <>{fieldRow('API Anahtarı (API Key)', apiKey, setApiKey, 'api-key')}{fieldRow('API Secret', apiSecret, setApiSecret, 'api-secret', 'password')}{fieldRow('Satıcı ID (Supplier ID)', supplierId, setSupplierId, '123456')}</>
      case 'hepsiburada':
        return <>{fieldRow('API Anahtarı (API Key)', apiKey, setApiKey, 'api-key')}{fieldRow('API Secret', apiSecret, setApiSecret, 'api-secret', 'password')}{fieldRow('Mağaza ID (Merchant ID)', merchantId, setMerchantId, '123456')}</>
      case 'yemeksepeti':
        return <>{fieldRow('Client ID', apiKey, setApiKey, 'client-id')}{fieldRow('Client Secret', apiSecret, setApiSecret, 'client-secret', 'password')}{fieldRow('Restoran ID', restaurantId, setRestaurantId, '123456')}</>
      case 'trendyolgo':
        return <>{fieldRow('Client ID', apiKey, setApiKey, 'client-id')}{fieldRow('Client Secret', apiSecret, setApiSecret, 'client-secret', 'password')}{fieldRow('Mağaza ID (Store ID)', storeId, setStoreId, '123456')}</>
      case 'n11':
        return <>{fieldRow('API Key (AppKey)', apiKey, setApiKey, 'app-key')}{fieldRow('API Secret (AppSecret)', apiSecret, setApiSecret, 'app-secret', 'password')}</>
      default:
        return <>{fieldRow('API Key', apiKey, setApiKey, 'api-key')}{fieldRow('API Secret', apiSecret, setApiSecret, 'api-secret', 'password')}</>
    }
  }

  const renderButtons = () => {
    const requiredFields = (): boolean => {
      const checks: Record<string, boolean> = {
        trendyol: !!apiKey && !!apiSecret && !!supplierId,
        hepsiburada: !!apiKey && !!apiSecret && !!merchantId,
        yemeksepeti: !!apiKey && !!apiSecret && !!restaurantId,
        trendyolgo: !!apiKey && !!apiSecret && !!storeId,
        n11: !!apiKey && !!apiSecret,
      }
      return checks[platform] || false
    }
    return (
      <>
        <button onClick={() => callApi('/api/marketplace/' + platform + '/connect', buildCredentials())}
          disabled={loading || !requiredFields()}
          className={'px-6 py-2.5 bg-gradient-to-r ' + pf.gradient + ' text-white rounded-xl text-sm font-semibold hover:shadow-lg hover:shadow-' + pf.color + '-500/25 transition-all disabled:opacity-40 disabled:cursor-not-allowed active:scale-[0.98]'}>
          {loading ? 'Bağlantı Kuruluyor...' : pf.label + "'a Bağlan"}
        </button>
        <button onClick={() => makePublicCall('/api/marketplace/' + platform + '/test', buildCredentials())}
          disabled={!requiredFields()}
          className="px-6 py-2.5 bg-[#1a2332] text-gray-300 rounded-xl text-sm font-medium hover:bg-[#1f2a3a] border border-[#2a3a4a] transition-all disabled:opacity-40 active:scale-[0.98]">
          Bağlantıyı Test Et
        </button>
        {status[platform]?.connected && (
          <button onClick={() => callApi('/api/marketplace/' + platform + '/disconnect', {})} disabled={loading}
            className="px-6 py-2.5 bg-red-500/10 text-red-400 rounded-xl text-sm font-medium hover:bg-red-500/20 border border-red-500/20 transition-all active:scale-[0.98]">
            Bağlantıyı Kes
          </button>
        )}
      </>
    )
  }

  const FilterBar = () => {
    return (
      <div className="flex items-center gap-2">
        <span className="text-xs text-gray-500 mr-1">Filtre:</span>
        {[{ key: 'all' as Filter, label: 'Tümü' }, ...platforms].map(item => {
          const active = filter === item.key
          const plat = item.key !== 'all' ? platforms.find(p => p.key === item.key) : null
          return (
            <button key={item.key} onClick={() => setFilter(item.key as Filter)}
              className={'px-3 py-1 rounded-lg text-xs font-medium transition-all ' + (active
                ? (item.key === 'all' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' : 'bg-' + (plat?.color || 'gray') + '-500/10 text-' + (plat?.color || 'gray') + '-400 border border-' + (plat?.color || 'gray') + '-500/20')
                : 'bg-[#1a2332] text-gray-400 hover:text-white border border-transparent')}>
              {item.label}
            </button>
          )
        })}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500/20 to-blue-600/10 border border-blue-500/20 flex items-center justify-center">
              <svg className="w-5 h-5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Pazaryeri Entegrasyonları</h1>
              <p className="text-sm text-gray-500">Trendyol ve Hepsiburada stok, sipariş ve mesaj yönetimi</p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {platforms.map(p => {
            const connected = status[p.key]?.connected
            return (
              <div key={p.key} className={'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border ' + (connected ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-amber-500/10 text-amber-400 border-amber-500/20')}>
                <div className={'w-1.5 h-1.5 rounded-full ' + (connected ? 'bg-emerald-400' : 'bg-amber-400')} />
                {p.label}: {connected ? 'Bağlı' : 'Bağlı Değil'}
              </div>
            )
          })}
        </div>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1">
        {tabs.map(t => (
          <button key={t.key} onClick={() => { setTab(t.key); setResult(''); if (t.key === 'urunler') loadProducts(); if (t.key === 'siparisler') loadOrders(); if (t.key === 'mesajlar') loadMessages() }}
            className={'relative px-5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 whitespace-nowrap ' + (tab === t.key ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/25' : 'bg-[#0d1117]/80 border border-[#1a2332] text-gray-400 hover:text-white hover:border-gray-600')}>
            {t.label}
          </button>
        ))}
      </div>

      {currentTab && (
        <div className="flex items-center gap-2 text-xs text-gray-500 px-1 -mt-2">
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {currentTab.desc}
        </div>
      )}

      <div className="bg-[#0d1117]/80 backdrop-blur-xl border border-[#1a2332] rounded-2xl p-6">
        {tab === 'ayarlar' && (
          <div className="space-y-5">
            <div className="flex gap-2 overflow-x-auto pb-3 border-b border-[#1a2332]">
              {platforms.map(p => {
                const active = platform === p.key
                return (
                  <button key={p.key} onClick={() => { setPlatform(p.key); setApiKey(''); setApiSecret(''); setSupplierId(''); setMerchantId(''); setRestaurantId(''); setStoreId(''); setResult('') }}
                    className={'relative px-5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 whitespace-nowrap ' + (active ? 'bg-gradient-to-r ' + p.gradient + ' text-white shadow-lg shadow-' + p.color + '-500/25' : 'bg-[#0d1117]/80 border border-[#1a2332] text-gray-400 hover:text-white hover:border-gray-600')}>
                    {p.label} {status[p.key]?.connected ? '✅' : ''}
                  </button>
                )
              })}
            </div>

            <div className="flex items-center gap-3 pb-1">
              <div className={'w-1 h-6 rounded-full bg-' + pf.color + '-500'} />
              <h3 className="text-white font-semibold">{pf.label} API Bilgileri</h3>
            </div>
            <p className="text-sm text-gray-400 leading-relaxed">{platformDescriptions(platform)}</p>
            <div className="grid gap-4">{renderFields()}</div>
            <div className="flex flex-wrap gap-3 pt-2">{renderButtons()}</div>
            {result && <pre className="bg-[#080b12] rounded-xl p-4 text-sm text-gray-300 font-mono overflow-x-auto border border-[#1a2332]">{result}</pre>}
            {status[platform]?.connected && (
              <div className="mt-4 p-5 bg-gradient-to-br from-' + pf.color + '-500/5 to-transparent rounded-xl border border-' + pf.color + '-500/10">
                <h4 className="text-white font-medium text-sm mb-2 flex items-center gap-2">
                  <svg className={'w-4 h-4 text-' + pf.color + '-400'} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                  </svg>
                  Webhook URL
                </h4>
                <p className="text-xs text-gray-500 mb-2">
                  İlgili pazaryeri panelindeki webhook/entegrasyon ayarlarına bu URL'yi ekleyin:
                </p>
                <div className="flex items-center gap-2">
                  <code className={'flex-1 text-sm text-' + pf.color + '-400 bg-[#080b12] rounded-lg px-3 py-2 border border-[#1a2332] font-mono truncate'}>
                    {typeof window !== 'undefined' ? window.location.origin + '/api/marketplace/' + platform + '/webhook/callback/unknown' : ''}
                  </code>
                  <button onClick={() => navigator.clipboard.writeText(typeof window !== 'undefined' ? window.location.origin + '/api/marketplace/' + platform + '/webhook/callback/unknown' : '')}
                    className={'px-4 py-2 bg-' + pf.color + '-500/10 text-' + pf.color + '-400 rounded-lg text-xs font-medium hover:bg-' + pf.color + '-500/20 border border-' + pf.color + '-500/20 transition-all shrink-0'}>Kopyala</button>
                </div>
              </div>
            )}
          </div>
        )}

        {tab === 'urunler' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div className="flex items-center gap-3">
                <div className="w-1 h-6 bg-blue-500 rounded-full" />
                <h3 className="text-white font-semibold">Ürünler & Stok Yönetimi</h3>
              </div>
              <div className="flex gap-2">
                <button onClick={commitStockUpdates} disabled={!Object.keys(stockUpdates).length}
                  className="px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-xl text-sm font-semibold transition-all disabled:opacity-40 active:scale-[0.98]">
                  Stokları Güncelle
                </button>
              </div>
            </div>

            <FilterBar />

            {!filteredProducts.length && !syncingProducts ? (
              <div className="text-center py-16">
                <svg className="w-12 h-12 mx-auto text-gray-600 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
                <p className="text-gray-500 text-sm">Henüz ürün bulunmuyor. Ürünler otomatik senkronize edilir.</p>
              </div>
            ) : (
              <div className="overflow-x-auto -mx-6">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-[#1a2332]">
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Platform</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Barkod</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Ürün</th>
                      <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Fiyat</th>
                      <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Mevcut Stok</th>
                      <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Yeni Stok</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#1a2332]">
                    {filteredProducts.map((p: any) => (
                      <tr key={p._platform + '-' + p.barcode} className="hover:bg-white/[0.02] transition-colors">
                        <td className="px-6 py-3"><PlatformBadge platform={p._platform} /></td>
                        <td className="px-6 py-3 text-gray-500 font-mono text-xs">{p.barcode}</td>
                        <td className="px-6 py-3">
                          <div className="flex items-center gap-3">
                            {p.images && p.images[0] && <img src={p.images[0]} alt="" className="w-9 h-9 rounded-lg object-cover border border-[#1a2332]" />}
                            <span className="text-white text-sm">{p.title}</span>
                          </div>
                        </td>
                        <td className="px-6 py-3 text-white text-right font-medium">{p.price} {p.currency}</td>
                        <td className="px-6 py-3 text-right">
                          <span className={'inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-sm font-medium ' + (p.stock < 10 ? 'bg-red-500/10 text-red-400' : p.stock < 50 ? 'bg-amber-500/10 text-amber-400' : 'bg-emerald-500/10 text-emerald-400')}>
                            <div className={'w-1.5 h-1.5 rounded-full ' + (p.stock < 10 ? 'bg-red-400' : p.stock < 50 ? 'bg-amber-400' : 'bg-emerald-400')} />
                            {p.stock}
                          </span>
                        </td>
                        <td className="px-6 py-3 text-right">
                          <input type="number" min="0" placeholder={String(p.stock)}
                            onChange={e => {
                              const qty = parseInt(e.target.value)
                              setStockUpdates(s => ({ ...s, [p._platform + '-' + p.barcode]: { quantity: isNaN(qty) ? p.stock : qty, platform: p._platform } }))
                            }}
                            className="w-24 bg-[#080b12] border border-[#1a2332] rounded-lg px-3 py-1.5 text-sm text-white text-right focus:outline-none focus:border-blue-500/60 focus:ring-1 focus:ring-blue-500/20 transition-all" />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            {productTotal > 0 && (
              <div className="flex justify-between items-center pt-2 text-xs text-gray-500">
                <span>Toplam <span className="text-white font-medium">{productTotal}</span> ürün</span>
              </div>
            )}
          </div>
        )}

        {tab === 'siparisler' && (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-1 h-6 bg-blue-500 rounded-full" />
              <h3 className="text-white font-semibold">Siparişler</h3>
              <span className="text-xs text-gray-500">(Otomatik senkronize edilir)</span>
            </div>

            <FilterBar />

            {!filteredOrders.length && !syncingOrders ? (
              <div className="text-center py-16">
                <svg className="w-12 h-12 mx-auto text-gray-600 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                <p className="text-gray-500 text-sm">Henüz sipariş bulunmuyor</p>
              </div>
            ) : (
              <div className="overflow-x-auto -mx-6">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-[#1a2332]">
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Platform</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Sipariş No</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Müşteri</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Ürünler</th>
                      <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Tutar</th>
                      <th className="px-6 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">Durum</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Kargo</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#1a2332]">
                    {filteredOrders.map((o: any) => (
                      <tr key={o._platform + '-' + o.id} className="hover:bg-white/[0.02] transition-colors">
                        <td className="px-6 py-3"><PlatformBadge platform={o._platform} /></td>
                        <td className="px-6 py-3 text-white font-mono text-xs">{o.orderNumber || o.id}</td>
                        <td className="px-6 py-3 text-gray-300">{o.customerName}</td>
                        <td className="px-6 py-3 text-gray-400 text-xs">
                          {(o.products || []).map((p: any, i: number) => (
                            <span key={i}>{p.title} x{p.quantity}{i < (o.products || []).length - 1 ? ', ' : ''}</span>
                          ))}
                        </td>
                        <td className="px-6 py-3 text-white text-right font-medium">{o.totalAmount} {o.currency}</td>
                        <td className="px-6 py-3 text-center">
                          <span className={'inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border ' + orderStatusStyle(o.status)}>
                            <div className={'w-1.5 h-1.5 rounded-full ' + orderStatusDot(o.status)} />
                            {orderStatusLabel(o.status)}
                          </span>
                        </td>
                        <td className="px-6 py-3 text-xs text-gray-400">
                          {o.cargoCompany ? (
                            <span className="flex items-center gap-1">
                              <svg className="w-3.5 h-3.5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10m8 0a1 1 0 01-1 1H5m8 0a1 1 0 001 1h2m0 0a1 1 0 001-1v-4a1 1 0 00-.293-.707l-2-2A1 1 0 0013.586 10H12v6z" />
                              </svg>
                              {o.cargoCompany}{o.cargoTracking ? ' - ' + o.cargoTracking : ''}
                            </span>
                          ) : '-'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {tab === 'mesajlar' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div className="flex items-center gap-3">
                <div className="w-1 h-6 bg-blue-500 rounded-full" />
                <h3 className="text-white font-semibold">Müşteri Mesajları</h3>
              </div>
              <button onClick={loadMessages}
                className="px-4 py-2 bg-[#1a2332] text-gray-300 rounded-xl text-sm font-medium hover:bg-[#1f2a3a] border border-[#2a3a4a] transition-all active:scale-[0.98]">
                Mesajları Yenile
              </button>
            </div>

            <FilterBar />

            {!filteredMessages.length ? (
              <div className="text-center py-16">
                <svg className="w-12 h-12 mx-auto text-gray-600 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                <p className="text-gray-500 text-sm">Henüz mesaj yok</p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredMessages.map((m: any) => (
                  <div key={m._platform + '-' + m.id} className="group bg-[#080b12] border border-[#1a2332] rounded-xl p-4 hover:border-gray-700/50 transition-all">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <div className={'w-8 h-8 rounded-full bg-gradient-to-br ' + (m._platform === 'trendyol' ? 'from-orange-400 to-orange-600' : m._platform === 'trendyolgo' ? 'from-emerald-400 to-emerald-600' : m._platform === 'n11' ? 'from-violet-400 to-violet-600' : m._platform === 'yemeksepeti' ? 'from-red-400 to-red-600' : 'from-purple-400 to-purple-600') + ' flex items-center justify-center text-white text-xs font-bold'}>
                            {(m.from || '?')[0].toUpperCase()}
                          </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="text-white font-medium text-sm">{m.from}</p>
                            <PlatformBadge platform={m._platform} />
                          </div>
                          <p className="text-xs text-gray-500">{m.subject || 'Konusuz'}</p>
                        </div>
                      </div>
                      <span className="text-xs text-gray-600">{new Date(m.createdAt).toLocaleString('tr-TR')}</span>
                    </div>
                    <p className="text-sm text-gray-300 whitespace-pre-wrap pl-10">{m.body}</p>
                    <div className="mt-3 pl-10">
                      {replyTo === m.id ? (
                        <div className="space-y-2 bg-[#0d1117] rounded-xl p-3 border border-[#1a2332]">
                          <textarea value={replyText} onChange={e => setReplyText(e.target.value)}
                            rows={3} placeholder="Yanıtınızı yazın..."
                            className="w-full bg-[#080b12] border border-[#1a2332] rounded-lg px-4 py-2.5 text-sm text-white placeholder-gray-700 focus:outline-none focus:border-blue-500/60 focus:ring-1 focus:ring-blue-500/20 transition-all resize-none" />
                          <div className="flex gap-2">
                            <button onClick={() => sendReply(m.id, m._platform)} disabled={sendingReply || !replyText.trim()}
                              className="px-4 py-1.5 bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-lg text-xs font-semibold disabled:opacity-40 active:scale-[0.98] transition-all">
                              {sendingReply ? 'Gönderiliyor...' : 'Yanıtı Gönder'}
                            </button>
                            <button onClick={() => { setReplyTo(null); setReplyText('') }}
                              className="px-4 py-1.5 bg-[#1a2332] text-gray-400 rounded-lg text-xs hover:text-white transition-all">İptal</button>
                          </div>
                        </div>
                      ) : (
                        <button onClick={() => { setReplyTo(m.id); setReplyText('') }}
                          className={'inline-flex items-center gap-1.5 text-xs ' + (platformBadgeClass(m._platform).includes('orange') ? 'text-orange-400 hover:text-orange-300' : platformBadgeClass(m._platform).includes('emerald') ? 'text-emerald-400 hover:text-emerald-300' : platformBadgeClass(m._platform).includes('amber') ? 'text-amber-400 hover:text-amber-300' : platformBadgeClass(m._platform).includes('violet') ? 'text-violet-400 hover:text-violet-300' : platformBadgeClass(m._platform).includes('pink') ? 'text-pink-400 hover:text-pink-300' : platformBadgeClass(m._platform).includes('blue') ? 'text-blue-400 hover:text-blue-300' : platformBadgeClass(m._platform).includes('yellow') ? 'text-yellow-400 hover:text-yellow-300' : platformBadgeClass(m._platform).includes('red') ? 'text-red-400 hover:text-red-300' : 'text-purple-400 hover:text-purple-300') + ' transition-all opacity-0 group-hover:opacity-100'}>
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                          </svg>
                          Yanıtla
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {result && tab !== 'ayarlar' && (
        <div className="bg-[#0d1117]/80 border border-[#1a2332] rounded-2xl p-4">
          <pre className="text-sm text-gray-300 font-mono overflow-x-auto">{result}</pre>
        </div>
      )}
    </div>
  )
}

function orderStatusStyle(s: string) {
  const map: Record<string, string> = {
    'pending': 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    'confirmed': 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    'shipped': 'bg-purple-500/10 text-purple-400 border-purple-500/20',
    'delivered': 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    'cancelled': 'bg-red-500/10 text-red-400 border-red-500/20',
  }
  return map[s] || 'bg-gray-500/10 text-gray-400 border-gray-500/20'
}

function orderStatusDot(s: string) {
  const map: Record<string, string> = {
    'pending': 'bg-amber-400',
    'confirmed': 'bg-blue-400',
    'shipped': 'bg-purple-400',
    'delivered': 'bg-emerald-400',
    'cancelled': 'bg-red-400',
  }
  return map[s] || 'bg-gray-400'
}

function orderStatusLabel(s: string) {
  const map: Record<string, string> = {
    'pending': 'Bekliyor',
    'confirmed': 'Onaylandı',
    'shipped': 'Kargoda',
    'delivered': 'Teslim Edildi',
    'cancelled': 'İptal',
  }
  return map[s] || s
}
