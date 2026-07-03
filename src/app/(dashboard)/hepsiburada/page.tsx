'use client'
import { useState, useEffect } from 'react'

type Tab = 'ayarlar' | 'urunler' | 'siparisler' | 'mesajlar'

const tabs = [
  { key: 'ayarlar' as Tab, label: 'Bağlantı Ayarları', desc: 'API anahtarlarını yönetin' },
  { key: 'urunler' as Tab, label: 'Ürünler & Stok', desc: 'Stok seviyelerini güncelleyin' },
  { key: 'siparisler' as Tab, label: 'Siparişler', desc: 'Gelen siparişleri takip edin' },
  { key: 'mesajlar' as Tab, label: 'Müşteri Mesajları', desc: 'Soruları yanıtlayın' },
]

export default function HepsiburadaPage() {
  const [tab, setTab] = useState<Tab>('ayarlar')
  const [status, setStatus] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState('')

  const [apiKey, setApiKey] = useState('')
  const [apiSecret, setApiSecret] = useState('')
  const [merchantId, setMerchantId] = useState('')

  const [products, setProducts] = useState<any[]>([])
  const [productPage, setProductPage] = useState(0)
  const [productTotal, setProductTotal] = useState(0)
  const [stockUpdates, setStockUpdates] = useState<Record<string, number>>({})
  const [syncingProducts, setSyncingProducts] = useState(false)

  const [orders, setOrders] = useState<any[]>([])
  const [orderPage, setOrderPage] = useState(0)
  const [orderTotal, setOrderTotal] = useState(0)
  const [syncingOrders, setSyncingOrders] = useState(false)

  const [messages, setMessages] = useState<any[]>([])
  const [replyText, setReplyText] = useState('')
  const [replyTo, setReplyTo] = useState<string | null>(null)
  const [sendingReply, setSendingReply] = useState(false)

  const API_BASE = '/api/marketplace/hepsiburada'
  const currentTab = tabs.find(t => t.key === tab)

  useEffect(() => {
    fetch(API_BASE + '/status', { credentials: 'include' })
      .then(r => r.json()).then(setStatus).catch(() => {})
  }, [])

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

  const loadProducts = async (page = 0) => {
    setSyncingProducts(true)
    try {
      const res = await fetchWithAuth(API_BASE + '/products?page=' + page + '&size=100')
      if (res) {
        const data = await res.json()
        setProducts(data.products || [])
        setProductTotal(data.total || 0)
        setProductPage(page)
      }
    } catch {}
    setSyncingProducts(false)
  }

  const loadOrders = async (page = 0) => {
    setSyncingOrders(true)
    try {
      const res = await fetchWithAuth(API_BASE + '/orders?page=' + page + '&size=50')
      if (res) {
        const data = await res.json()
        setOrders(data.orders || [])
        setOrderTotal(data.total || 0)
        setOrderPage(page)
      }
    } catch {}
    setSyncingOrders(false)
  }

  const loadMessages = async () => {
    try {
      const res = await fetchWithAuth(API_BASE + '/messages')
      if (res) {
        const data = await res.json()
        setMessages(Array.isArray(data) ? data : [])
      }
    } catch {}
  }

  const sendReply = async (messageId: string) => {
    if (!replyText.trim()) return
    setSendingReply(true)
    try {
      const res = await fetchWithAuth(API_BASE + '/messages/' + messageId + '/reply', {
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
    const updates = Object.entries(stockUpdates).filter(([, qty]) => qty >= 0).map(([barcode, quantity]) => ({ barcode, quantity }))
    if (!updates.length) return
    await callApi(API_BASE + '/stock', { updates })
  }

  return (
    <>
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500/20 to-purple-600/10 border border-purple-500/20 flex items-center justify-center">
              <svg className="w-5 h-5 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Hepsiburada Entegrasyonu</h1>
              <p className="text-sm text-gray-500">Ürün stok yönetimi, sipariş takibi ve müşteri mesajlaşması</p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          {status && (
            <div className={'flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium border ' + (status.connected ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-amber-500/10 text-amber-400 border-amber-500/20')}>
              <div className={'w-2 h-2 rounded-full animate-pulse ' + (status.connected ? 'bg-emerald-400' : 'bg-amber-400')} />
              {status.connected ? 'Bağlı' : 'Bağlı Değil'}
            </div>
          )}
        </div>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1">
        {tabs.map(t => (
          <button key={t.key} onClick={() => { setTab(t.key); setResult(''); if (t.key === 'urunler') loadProducts(); if (t.key === 'siparisler') loadOrders(); if (t.key === 'mesajlar') loadMessages() }}
            className={'relative px-5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 whitespace-nowrap ' + (tab === t.key ? 'bg-purple-500 text-white shadow-lg shadow-purple-500/25' : 'bg-[#0d1117]/80 border border-[#1a2332] text-gray-400 hover:text-white hover:border-gray-600')}>
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
            <div className="flex items-center gap-3 pb-1">
              <div className="w-1 h-6 bg-purple-500 rounded-full" />
              <h3 className="text-white font-semibold">Hepsiburada API Bilgileri</h3>
            </div>
            <p className="text-sm text-gray-400 leading-relaxed">Hepsiburada satıcı panelinden aldığınız API anahtarı, API Secret ve Mağaza (Merchant) ID bilgilerini girin.</p>
            <div className="grid gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">API Anahtarı (API Key)</label>
                <input type="text" value={apiKey} onChange={e => setApiKey(e.target.value)}
                  placeholder="api-key-girin" className="w-full bg-[#080b12] border border-[#1a2332] rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-700 focus:outline-none focus:border-purple-500/60 focus:ring-1 focus:ring-purple-500/20 transition-all font-mono" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">API Secret</label>
                <input type="password" value={apiSecret} onChange={e => setApiSecret(e.target.value)}
                  placeholder="api-secret" className="w-full bg-[#080b12] border border-[#1a2332] rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-700 focus:outline-none focus:border-purple-500/60 focus:ring-1 focus:ring-purple-500/20 transition-all font-mono" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">Mağaza ID (Merchant ID)</label>
                <input type="text" value={merchantId} onChange={e => setMerchantId(e.target.value)}
                  placeholder="123456" className="w-full bg-[#080b12] border border-[#1a2332] rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-700 focus:outline-none focus:border-purple-500/60 focus:ring-1 focus:ring-purple-500/20 transition-all font-mono" />
              </div>
            </div>
            <div className="flex flex-wrap gap-3 pt-2">
              <button onClick={() => callApi(API_BASE + '/connect', { apiKey, apiSecret, merchantId })} disabled={loading || !apiKey || !apiSecret || !merchantId}
                className="px-6 py-2.5 bg-gradient-to-r from-purple-600 to-purple-500 text-white rounded-xl text-sm font-semibold hover:shadow-lg hover:shadow-purple-500/25 transition-all disabled:opacity-40 disabled:cursor-not-allowed active:scale-[0.98]">
                {loading ? 'Bağlantı Kuruluyor...' : 'Hepsiburada\'ya Bağlan'}
              </button>
              <button onClick={async () => {
                const res = await fetch(API_BASE + '/test', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ apiKey, apiSecret, merchantId }) })
                const data = await res.json()
                setResult(JSON.stringify(data, null, 2))
              }} disabled={!apiKey || !apiSecret || !merchantId}
                className="px-6 py-2.5 bg-[#1a2332] text-gray-300 rounded-xl text-sm font-medium hover:bg-[#1f2a3a] border border-[#2a3a4a] transition-all disabled:opacity-40 active:scale-[0.98]">
                Bağlantıyı Test Et
              </button>
              {status && status.connected && (
                <button onClick={() => callApi(API_BASE + '/disconnect', {})} disabled={loading}
                  className="px-6 py-2.5 bg-red-500/10 text-red-400 rounded-xl text-sm font-medium hover:bg-red-500/20 border border-red-500/20 transition-all active:scale-[0.98]">
                  Bağlantıyı Kes
                </button>
              )}
            </div>
            {result && <pre className="bg-[#080b12] rounded-xl p-4 text-sm text-gray-300 font-mono overflow-x-auto border border-[#1a2332]">{result}</pre>}
            {status && status.connected && (
              <div className="mt-4 p-5 bg-gradient-to-br from-purple-500/5 to-transparent rounded-xl border border-purple-500/10">
                <h4 className="text-white font-medium text-sm mb-2 flex items-center gap-2">
                  <svg className="w-4 h-4 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                  </svg>
                  Webhook URL (Entegratörler İçin)
                </h4>
                <p className="text-xs text-gray-500 mb-2">Hepsiburada entegratör panelinizdeki webhook ayarlarına aşağıdaki adresi ekleyin:</p>
                <div className="flex items-center gap-2">
                  <code className="flex-1 text-sm text-purple-400 bg-[#080b12] rounded-lg px-3 py-2 border border-[#1a2332] font-mono truncate">{typeof window !== 'undefined' ? window.location.origin + API_BASE + '/webhook/callback/unknown' : ''}</code>
                  <button onClick={() => navigator.clipboard.writeText(typeof window !== 'undefined' ? window.location.origin + API_BASE + '/webhook/callback/unknown' : '')}
                    className="px-4 py-2 bg-purple-500/10 text-purple-400 rounded-lg text-xs font-medium hover:bg-purple-500/20 border border-purple-500/20 transition-all shrink-0">Kopyala</button>
                </div>
              </div>
            )}
          </div>
        )}

        {tab === 'urunler' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div className="flex items-center gap-3">
                <div className="w-1 h-6 bg-purple-500 rounded-full" />
                <h3 className="text-white font-semibold">Ürünler & Stok Yönetimi</h3>
              </div>
              <div className="flex gap-2">
                <button onClick={() => loadProducts(productPage)}
                  className="px-4 py-2 bg-[#1a2332] text-gray-300 rounded-xl text-sm font-medium hover:bg-[#1f2a3a] border border-[#2a3a4a] transition-all disabled:opacity-50 active:scale-[0.98]">
                  {syncingProducts ? (
                    <span className="flex items-center gap-2">
                      <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
                      Senkronize Ediliyor...
                    </span>
                  ) : 'Hepsiburada\'dan Getir'}
                </button>
                <button onClick={commitStockUpdates} disabled={!Object.keys(stockUpdates).length}
                  className="px-4 py-2 bg-gradient-to-r from-purple-600 to-purple-500 text-white rounded-xl text-sm font-semibold transition-all disabled:opacity-40 active:scale-[0.98]">
                  Stokları Güncelle
                </button>
              </div>
            </div>
            {!products.length && !syncingProducts ? (
              <div className="text-center py-16">
                <svg className="w-12 h-12 mx-auto text-gray-600 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
                <p className="text-gray-500 text-sm">Ürünleri görmek için &quot;Hepsiburada\'dan Getir&quot; butonuna tıklayın</p>
              </div>
            ) : (
              <div className="overflow-x-auto -mx-6">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-[#1a2332]">
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Barkod</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Ürün</th>
                      <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Fiyat</th>
                      <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Mevcut Stok</th>
                      <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Yeni Stok</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#1a2332]">
                    {products.map((p: any) => (
                      <tr key={p.barcode} className="hover:bg-white/[0.02] transition-colors">
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
                              setStockUpdates(s => ({ ...s, [p.barcode]: isNaN(qty) ? p.stock : qty }))
                            }}
                            className="w-24 bg-[#080b12] border border-[#1a2332] rounded-lg px-3 py-1.5 text-sm text-white text-right focus:outline-none focus:border-purple-500/60 focus:ring-1 focus:ring-purple-500/20 transition-all" />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            {productTotal > 0 && (
              <div className="flex justify-between items-center pt-2 text-xs text-gray-500">
                <span>Toplam <span className="text-white font-medium">{productTotal}</span> ürün (sayfa {productPage + 1})</span>
                <div className="flex gap-2">
                  <button onClick={() => loadProducts(productPage - 1)} disabled={productPage === 0}
                    className="px-3 py-1.5 bg-[#1a2332] rounded-lg disabled:opacity-30 hover:bg-[#1f2a3a] text-gray-400 hover:text-white transition-all">Önceki</button>
                  <button onClick={() => loadProducts(productPage + 1)} disabled={(productPage + 1) * 100 >= productTotal}
                    className="px-3 py-1.5 bg-[#1a2332] rounded-lg disabled:opacity-30 hover:bg-[#1f2a3a] text-gray-400 hover:text-white transition-all">Sonraki</button>
                </div>
              </div>
            )}
          </div>
        )}

        {tab === 'siparisler' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div className="flex items-center gap-3">
                <div className="w-1 h-6 bg-purple-500 rounded-full" />
                <h3 className="text-white font-semibold">Siparişler</h3>
              </div>
              <button onClick={() => loadOrders(orderPage)}
                className="px-4 py-2 bg-[#1a2332] text-gray-300 rounded-xl text-sm font-medium hover:bg-[#1f2a3a] border border-[#2a3a4a] transition-all disabled:opacity-50 active:scale-[0.98]">
                {syncingOrders ? (
                  <span className="flex items-center gap-2">
                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
                    Senkronize Ediliyor...
                  </span>
                ) : 'Siparişleri Getir'}
              </button>
            </div>
            {!orders.length && !syncingOrders ? (
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
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Sipariş No</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Müşteri</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Ürünler</th>
                      <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Tutar</th>
                      <th className="px-6 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">Durum</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Kargo</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#1a2332]">
                    {orders.map((o: any) => (
                      <tr key={o.id} className="hover:bg-white/[0.02] transition-colors">
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
                <div className="w-1 h-6 bg-purple-500 rounded-full" />
                <h3 className="text-white font-semibold">Müşteri Mesajları</h3>
              </div>
              <button onClick={loadMessages}
                className="px-4 py-2 bg-[#1a2332] text-gray-300 rounded-xl text-sm font-medium hover:bg-[#1f2a3a] border border-[#2a3a4a] transition-all active:scale-[0.98]">
                Mesajları Yenile
              </button>
            </div>
            {!messages.length ? (
              <div className="text-center py-16">
                <svg className="w-12 h-12 mx-auto text-gray-600 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                <p className="text-gray-500 text-sm">Henüz mesaj yok</p>
              </div>
            ) : (
              <div className="space-y-3">
                {messages.map((m: any) => (
                  <div key={m.id} className="group bg-[#080b12] border border-[#1a2332] rounded-xl p-4 hover:border-gray-700/50 transition-all">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center text-white text-xs font-bold">
                          {(m.from || '?')[0].toUpperCase()}
                        </div>
                        <div>
                          <p className="text-white font-medium text-sm">{m.from}</p>
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
                            className="w-full bg-[#080b12] border border-[#1a2332] rounded-lg px-4 py-2.5 text-sm text-white placeholder-gray-700 focus:outline-none focus:border-purple-500/60 focus:ring-1 focus:ring-purple-500/20 transition-all resize-none" />
                          <div className="flex gap-2">
                            <button onClick={() => sendReply(m.id)} disabled={sendingReply || !replyText.trim()}
                              className="px-4 py-1.5 bg-gradient-to-r from-purple-600 to-purple-500 text-white rounded-lg text-xs font-semibold disabled:opacity-40 active:scale-[0.98] transition-all">
                              {sendingReply ? 'Gönderiliyor...' : 'Yanıtı Gönder'}
                            </button>
                            <button onClick={() => { setReplyTo(null); setReplyText('') }}
                              className="px-4 py-1.5 bg-[#1a2332] text-gray-400 rounded-lg text-xs hover:text-white transition-all">İptal</button>
                          </div>
                        </div>
                      ) : (
                        <button onClick={() => setReplyTo(m.id)}
                          className="inline-flex items-center gap-1.5 text-xs text-purple-400 hover:text-purple-300 transition-all opacity-0 group-hover:opacity-100">
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
    </>
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
