'use client'
import { useState, useEffect, useRef } from 'react'
import { CreditCard, Link2, CheckCircle, AlertCircle, Copy, ExternalLink, HandCoins, ScrollText, Code, Percent } from 'lucide-react'
import PaytrPaymentForm from '@/components/paytr-iframe'
import InstallmentSelect from '@/components/installment-select'

const PROVIDERS = [
  { id: 'paytr', label: 'PayTR', icon: CreditCard, color: 'blue' },
  { id: 'iyzico', label: 'İyzico', icon: CreditCard, color: 'purple' },
  { id: 'sipay', label: 'Sipay', icon: CreditCard, color: 'emerald' },
  { id: 'odeal', label: 'Ödeal', icon: CreditCard, color: 'cyan' },
]

type Provider = 'paytr' | 'iyzico' | 'sipay' | 'odeal'

export default function VirtualPosPage() {
  const [user, setUser] = useState<any>(null)
  const [provider, setProvider] = useState<Provider>('paytr')
  const [tab, setTab] = useState<'keys' | 'link' | 'pay' | 'legal' | 'embed' | 'installment'>('keys')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [config, setConfig] = useState<any>(null)

  useEffect(() => {
    fetch('/api/users/me', { credentials: 'include' }).then(r => { if (r.ok) r.json().then(setUser) })
  }, [])

  const allowedProviders = PROVIDERS.filter(p => !user || user.role === 'SUPER_ADMIN' || (user.permissions || []).includes('virtual-pos-' + p.id))

  useEffect(() => {
    if (allowedProviders.length > 0 && !allowedProviders.find(p => p.id === provider)) {
      setProvider(allowedProviders[0].id as Provider)
    }
  }, [user])

  // PayTR form
  const [paytrForm, setPaytrForm] = useState({ merchantId: '', merchantKey: '', merchantSecret: '' })
  // Iyzico form
  const [iyzicoForm, setIyzicoForm] = useState({ apiKey: '', secretKey: '' })
  // Sipay form
  const [sipayForm, setSipayForm] = useState({ merchantKey: '', appId: '', appSecret: '' })
  // Ödeal form
  const [odealForm, setOdealForm] = useState({ apiKey: '', secretKey: '' })

  const [linkForm, setLinkForm] = useState({ amount: '', description: '' })
  const [linkResult, setLinkResult] = useState<string | null>(null)
  const [linkInstallment, setLinkInstallment] = useState(1)
  const [linkInstallments, setLinkInstallments] = useState<Array<{ number: number; totalPrice: number; installmentPrice: number }>>([])
  const [linkInstLoading, setLinkInstLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [legalInfo, setLegalInfo] = useState({ title: '', taxOffice: '', taxNumber: '', address: '', phone: '', email: '' })

  useEffect(() => {
    fetch('/api/payments/virtual-pos/api-keys', { credentials: 'include' })
      .then(r => r.json())
      .then(data => {
        setConfig(data)
        if (data.paytr?.configured) setPaytrForm(f => ({ ...f, merchantId: data.paytr.merchantId }))
        if (data.iyzico?.configured) setIyzicoForm(f => ({ ...f, apiKey: data.iyzico.apiKey }))
        if (data.sipay?.configured) setSipayForm(f => ({ ...f, merchantKey: data.sipay.merchantKey }))
        if (data.odeal?.configured) setOdealForm(f => ({ ...f, apiKey: data.odeal.apiKey }))
        setLoading(false)
      })
      .catch(() => setLoading(false))
    fetch('/api/payments/virtual-pos/legal-info', { credentials: 'include' })
      .then(r => r.json())
      .then(data => { if (data) setLegalInfo(data) })
      .catch(() => {})
  }, [])

  const getKeysEndpoint = () => provider === 'paytr' ? '/api/payments/virtual-pos/api-keys' : provider === 'iyzico' ? '/api/payments/iyzico/api-keys' : provider === 'sipay' ? '/api/payments/sipay/api-keys' : '/api/payments/odeal/api-keys'
  const getInitEndpoint = () => provider === 'paytr' ? '/api/payments/virtual-pos/paytr/init' : provider === 'iyzico' ? '/api/payments/iyzico/init' : provider === 'sipay' ? '/api/payments/sipay/init' : '/api/payments/odeal/init'
  const getLinkEndpoint = () => provider === 'paytr' ? '/api/payments/virtual-pos/paytr/link' : provider === 'odeal' ? '/api/payments/odeal/link' : null
  const providerLabel = () => provider === 'paytr' ? 'PayTR' : provider === 'iyzico' ? 'İyzico' : provider === 'sipay' ? 'Sipay' : 'Ödeal'

  const isConfigured = provider === 'paytr' ? config?.paytr?.configured : provider === 'iyzico' ? config?.iyzico?.configured : provider === 'sipay' ? config?.sipay?.configured : config?.odeal?.configured

  const saveKeys = async () => {
    setSaving(true); setMessage(null)
    const body = provider === 'paytr'
      ? { merchantId: paytrForm.merchantId, merchantKey: paytrForm.merchantKey, merchantSecret: paytrForm.merchantSecret }
      : provider === 'iyzico'
        ? { apiKey: iyzicoForm.apiKey, secretKey: iyzicoForm.secretKey }
        : provider === 'sipay'
          ? { merchantKey: sipayForm.merchantKey, appId: sipayForm.appId, appSecret: sipayForm.appSecret }
          : { apiKey: odealForm.apiKey, secretKey: odealForm.secretKey }
    const res = await fetch(getKeysEndpoint(), {
      method: 'POST', credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
    if (res.ok) {
      setMessage({ type: 'success', text: providerLabel() + ' API anahtarları kaydedildi.' })
      const data = await res.json()
      setConfig((prev: any) => ({ ...prev, [provider]: { configured: true, merchantId: body.merchantId || body.apiKey } }))
    } else {
      const data = await res.json()
      setMessage({ type: 'error', text: data.message || 'Bir hata oluştu.' })
    }
    setSaving(false)
  }

  // Load link installments
  useEffect(() => {
    setLinkInstLoading(true)
    fetch('/api/payments/installment-settings', { credentials: 'include' })
      .then(r => r.json())
      .then(data => {
        const s = data[provider] || data.paytr
        if (s?.allowedInstallments) {
          setLinkInstallments(s.allowedInstallments.map((n: number) => ({ number: n, totalPrice: 0, installmentPrice: 0 })))
        }
      })
      .catch(() => {})
      .finally(() => setLinkInstLoading(false))
  }, [provider])

  const createLink = async () => {
    setSaving(true); setMessage(null); setLinkResult(null)
    const amount = parseFloat(linkForm.amount)
    if (!amount || amount <= 0) { setMessage({ type: 'error', text: 'Geçerli bir tutar girin.' }); setSaving(false); return }
    const res = await fetch('/api/payments/virtual-pos/paytr/link', {
      method: 'POST', credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount, description: linkForm.description, installment: linkInstallment }),
    })
    const data = await res.json()
    if (res.ok) { setLinkResult(data.link); setMessage({ type: 'success', text: 'Tahsilat linki oluşturuldu!' }) }
    else { setMessage({ type: 'error', text: data.message || 'Link oluşturulamadı.' }) }
    setSaving(false)
  }

  const copyLink = () => { if (linkResult) navigator.clipboard.writeText(linkResult) }

  const saveLegalInfo = async () => {
    setSaving(true); setMessage(null)
    const res = await fetch('/api/payments/virtual-pos/legal-info', {
      method: 'POST', credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(legalInfo),
    })
    if (res.ok) setMessage({ type: 'success', text: 'Yasal bilgiler kaydedildi.' })
    else setMessage({ type: 'error', text: 'Kaydedilemedi.' })
    setSaving(false)
  }

  const switchProvider = (p: Provider) => {
    setProvider(p)
    setTab('keys')
    setMessage(null)
  }

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin w-8 h-8 border-2 border-blue-400 border-t-transparent rounded-full" /></div>

  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-bold text-white">Sanal POS</h1><p className="text-sm text-gray-500 mt-1">Ödeme altyapısı yönetimi</p></div>

      {/* Provider selector */}
      {allowedProviders.length === 0 ? (
        <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl px-4 py-3 text-amber-400 text-sm">
          Sanal POS modulune erisiminiz var ancak hicbir odeme saglayicisina yetkiniz bulunmuyor. Yoneticinizden PayTR, Iyzico veya Sipay yetkisi talep edin.
        </div>
      ) : (
        <div className="flex gap-2 bg-[#0d1117]/80 border border-[#1a2332] rounded-xl p-1.5 w-fit">
          {allowedProviders.map(p => (
            <button key={p.id} onClick={() => switchProvider(p.id as Provider)}
              className={'flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ' +
                (provider === p.id ? 'bg-blue-500/20 text-blue-400 shadow-sm shadow-blue-500/10' : 'text-gray-500 hover:text-gray-300')}>
              <p.icon size={16} />{p.label}
              {config?.[p.id]?.configured && <CheckCircle size={14} className="text-emerald-400" />}
            </button>
          ))}
        </div>
      )}

      {isConfigured && (
        <div className="flex items-center gap-2 px-4 py-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-400 text-sm">
          <CheckCircle size={16} /> {providerLabel()} bağlantısı aktif
          {provider === 'paytr' && config?.paytr?.merchantId && <span className="text-gray-500"> — Hesap: {config.paytr.merchantId}</span>}
        </div>
      )}

      <div className="flex gap-1 bg-[#0d1117]/80 border border-[#1a2332] rounded-xl p-1 w-fit overflow-x-auto">
        <button onClick={() => setTab('keys')} className={'px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ' + (tab === 'keys' ? 'bg-blue-500/20 text-blue-400' : 'text-gray-400 hover:text-white')}><CreditCard size={16} className="inline mr-2" />API Anahtarları</button>
        {(provider === 'paytr' || provider === 'odeal') && <button onClick={() => setTab('link')} className={'px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ' + (tab === 'link' ? 'bg-blue-500/20 text-blue-400' : 'text-gray-400 hover:text-white')}><Link2 size={16} className="inline mr-2" />Link ile Ödeme</button>}
        <button onClick={() => setTab('pay')} className={'px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ' + (tab === 'pay' ? 'bg-blue-500/20 text-blue-400' : 'text-gray-400 hover:text-white')}><HandCoins size={16} className="inline mr-2" />Ödeme Al</button>
        <button onClick={() => setTab('legal')} className={'px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ' + (tab === 'legal' ? 'bg-blue-500/20 text-blue-400' : 'text-gray-400 hover:text-white')}><ScrollText size={16} className="inline mr-2" />Yasal Bilgiler</button>
        <button onClick={() => setTab('embed')} className={'px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ' + (tab === 'embed' ? 'bg-blue-500/20 text-blue-400' : 'text-gray-400 hover:text-white')}><Code size={16} className="inline mr-2" />Embed Kodu</button>
        <button onClick={() => setTab('installment')} className={'px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ' + (tab === 'installment' ? 'bg-blue-500/20 text-blue-400' : 'text-gray-400 hover:text-white')}><Percent size={16} className="inline mr-2" />Taksit</button>
      </div>

      {message && (
        <div className={'flex items-center gap-2 px-4 py-3 rounded-xl text-sm border ' + (message.type === 'success' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-red-500/10 text-red-400 border-red-500/20')}>
          {message.type === 'success' ? <CheckCircle size={16} /> : <AlertCircle size={16} />}{message.text}
        </div>
      )}

      {/* API Keys tab */}
      {tab === 'keys' && provider === 'paytr' && (
        <div className="bg-[#0d1117]/80 backdrop-blur-xl border border-[#1a2332] rounded-2xl p-6 space-y-4">
          <div><label className="block text-sm font-medium text-gray-400 mb-1">Merchant ID</label><input type="text" value={paytrForm.merchantId} onChange={e => setPaytrForm(f => ({ ...f, merchantId: e.target.value }))} className="w-full px-4 py-2.5 bg-[#080b12] border border-[#1a2332] rounded-xl text-white text-sm focus:outline-none focus:border-blue-500/50 transition-colors" placeholder="000000" /></div>
          <div><label className="block text-sm font-medium text-gray-400 mb-1">Merchant Key</label><input type="text" value={paytrForm.merchantKey} onChange={e => setPaytrForm(f => ({ ...f, merchantKey: e.target.value }))} className="w-full px-4 py-2.5 bg-[#080b12] border border-[#1a2332] rounded-xl text-white text-sm focus:outline-none focus:border-blue-500/50 transition-colors" placeholder={config?.paytr?.configured ? '•••••••• (değiştirmek için yazın)' : ''} /></div>
          <div><label className="block text-sm font-medium text-gray-400 mb-1">Merchant Secret</label><input type="password" value={paytrForm.merchantSecret} onChange={e => setPaytrForm(f => ({ ...f, merchantSecret: e.target.value }))} className="w-full px-4 py-2.5 bg-[#080b12] border border-[#1a2332] rounded-xl text-white text-sm focus:outline-none focus:border-blue-500/50 transition-colors" placeholder={config?.paytr?.configured ? '•••••••• (değiştirmek için yazın)' : ''} /></div>
          <button onClick={saveKeys} disabled={saving} className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-xl text-sm font-medium hover:shadow-lg hover:shadow-blue-500/20 transition-all disabled:opacity-50">
            {saving ? 'Kaydediliyor...' : config?.paytr?.configured ? 'Güncelle' : 'Kaydet'}
          </button>
        </div>
      )}

      {tab === 'keys' && provider === 'iyzico' && (
        <div className="bg-[#0d1117]/80 backdrop-blur-xl border border-[#1a2332] rounded-2xl p-6 space-y-4">
          <div><label className="block text-sm font-medium text-gray-400 mb-1">API Key</label><input type="text" value={iyzicoForm.apiKey} onChange={e => setIyzicoForm(f => ({ ...f, apiKey: e.target.value }))} className="w-full px-4 py-2.5 bg-[#080b12] border border-[#1a2332] rounded-xl text-white text-sm focus:outline-none focus:border-purple-500/50 transition-colors" placeholder="Iyzipaya api anahtariniz" /></div>
          <div><label className="block text-sm font-medium text-gray-400 mb-1">Secret Key</label><input type="password" value={iyzicoForm.secretKey} onChange={e => setIyzicoForm(f => ({ ...f, secretKey: e.target.value }))} className="w-full px-4 py-2.5 bg-[#080b12] border border-[#1a2332] rounded-xl text-white text-sm focus:outline-none focus:border-purple-500/50 transition-colors" placeholder={config?.iyzico?.configured ? '•••••••• (değiştirmek için yazın)' : ''} /></div>
          <p className="text-xs text-gray-500">İyzico api anahtarlarınızı <a href="https://merchant.iyzipay.com" target="_blank" rel="noopener noreferrer" className="text-purple-400 hover:underline">merchant.iyzipay.com</a> panelinden alabilirsiniz.</p>
          <button onClick={saveKeys} disabled={saving} className="px-6 py-2.5 bg-gradient-to-r from-purple-600 to-purple-500 text-white rounded-xl text-sm font-medium hover:shadow-lg hover:shadow-purple-500/20 transition-all disabled:opacity-50">
            {saving ? 'Kaydediliyor...' : config?.iyzico?.configured ? 'Güncelle' : 'Kaydet'}
          </button>
        </div>
      )}

      {tab === 'keys' && provider === 'sipay' && (
        <div className="bg-[#0d1117]/80 backdrop-blur-xl border border-[#1a2332] rounded-2xl p-6 space-y-4">
          <div><label className="block text-sm font-medium text-gray-400 mb-1">Merchant Key</label><input type="text" value={sipayForm.merchantKey} onChange={e => setSipayForm(f => ({ ...f, merchantKey: e.target.value }))} className="w-full px-4 py-2.5 bg-[#080b12] border border-[#1a2332] rounded-xl text-white text-sm focus:outline-none focus:border-emerald-500/50 transition-colors font-mono" placeholder="$2y$10$..." /></div>
          <div><label className="block text-sm font-medium text-gray-400 mb-1">App ID</label><input type="text" value={sipayForm.appId} onChange={e => setSipayForm(f => ({ ...f, appId: e.target.value }))} className="w-full px-4 py-2.5 bg-[#080b12] border border-[#1a2332] rounded-xl text-white text-sm focus:outline-none focus:border-emerald-500/50 transition-colors font-mono" placeholder="6d4a7e9374a76c15260fcc75e315b0b9" /></div>
          <div><label className="block text-sm font-medium text-gray-400 mb-1">App Secret</label><input type="password" value={sipayForm.appSecret} onChange={e => setSipayForm(f => ({ ...f, appSecret: e.target.value }))} className="w-full px-4 py-2.5 bg-[#080b12] border border-[#1a2332] rounded-xl text-white text-sm focus:outline-none focus:border-emerald-500/50 transition-colors" placeholder={config?.sipay?.configured ? '•••••••• (değiştirmek için yazın)' : ''} /></div>
          <p className="text-xs text-gray-500">Sipay API anahtarlarınızı <a href="https://kurumsal.sipay.com.tr" target="_blank" rel="noopener noreferrer" className="text-emerald-400 hover:underline">Sipay Business Panel</a> &gt; Settings &gt; Integration & API sayfasından alabilirsiniz.</p>
          <button onClick={saveKeys} disabled={saving} className="px-6 py-2.5 bg-gradient-to-r from-emerald-600 to-emerald-500 text-white rounded-xl text-sm font-medium hover:shadow-lg hover:shadow-emerald-500/20 transition-all disabled:opacity-50">
            {saving ? 'Kaydediliyor...' : config?.sipay?.configured ? 'Güncelle' : 'Kaydet'}
          </button>
        </div>
      )}

      {tab === 'keys' && provider === 'odeal' && (
        <div className="bg-[#0d1117]/80 backdrop-blur-xl border border-[#1a2332] rounded-2xl p-6 space-y-4">
          <div><label className="block text-sm font-medium text-gray-400 mb-1">API Key</label><input type="text" value={odealForm.apiKey} onChange={e => setOdealForm(f => ({ ...f, apiKey: e.target.value }))} className="w-full px-4 py-2.5 bg-[#080b12] border border-[#1a2332] rounded-xl text-white text-sm focus:outline-none focus:border-cyan-500/50 transition-colors font-mono" placeholder="odeal-api-key" /></div>
          <div><label className="block text-sm font-medium text-gray-400 mb-1">Secret Key</label><input type="password" value={odealForm.secretKey} onChange={e => setOdealForm(f => ({ ...f, secretKey: e.target.value }))} className="w-full px-4 py-2.5 bg-[#080b12] border border-[#1a2332] rounded-xl text-white text-sm focus:outline-none focus:border-cyan-500/50 transition-colors font-mono" placeholder={config?.odeal?.configured ? '•••••••• (değiştirmek için yazın)' : ''} /></div>
          <p className="text-xs text-gray-500">Ödeal API anahtarlarınızı <a href="https://odeal.com" target="_blank" rel="noopener noreferrer" className="text-cyan-400 hover:underline">Ödeal panelinden</a> alabilirsiniz.</p>
          <button onClick={saveKeys} disabled={saving} className="px-6 py-2.5 bg-gradient-to-r from-cyan-600 to-cyan-500 text-white rounded-xl text-sm font-medium hover:shadow-lg hover:shadow-cyan-500/20 transition-all disabled:opacity-50">
            {saving ? 'Kaydediliyor...' : config?.odeal?.configured ? 'Güncelle' : 'Kaydet'}
          </button>
        </div>
      )}

      {/* Link tab (PayTR + Ödeal) */}
      {(tab === 'link' && (provider === 'paytr' || provider === 'odeal')) && (
        <div className="bg-[#0d1117]/80 backdrop-blur-xl border border-[#1a2332] rounded-2xl p-6 space-y-4">
          {!isConfigured ? (
            <p className="text-amber-400 text-sm">Önce API anahtarlarınızı tanımlayın.</p>
          ) : (
            <>
              <div><label className="block text-sm font-medium text-gray-400 mb-1">Tutar (TL)</label><input type="number" step="0.01" value={linkForm.amount} onChange={e => setLinkForm(f => ({ ...f, amount: e.target.value }))} className="w-full px-4 py-2.5 bg-[#080b12] border border-[#1a2332] rounded-xl text-white text-sm focus:outline-none focus:border-' + (provider === 'odeal' ? 'cyan' : 'blue') + '-500/50 transition-colors" placeholder="100.00" /></div>
              <div><label className="block text-sm font-medium text-gray-400 mb-1">Açıklama</label><input type="text" value={linkForm.description} onChange={e => setLinkForm(f => ({ ...f, description: e.target.value }))} className="w-full px-4 py-2.5 bg-[#080b12] border border-[#1a2332] rounded-xl text-white text-sm focus:outline-none focus:border-' + (provider === 'odeal' ? 'cyan' : 'blue') + '-500/50 transition-colors" placeholder="Sipariş ödemesi" /></div>
              <InstallmentSelect installments={linkInstallments} value={linkInstallment} onChange={setLinkInstallment} loading={linkInstLoading} />
              <button onClick={createLink} disabled={saving} className={'px-6 py-2.5 bg-gradient-to-r ' + (provider === 'odeal' ? 'from-cyan-600 to-cyan-500' : 'from-blue-600 to-blue-500') + ' text-white rounded-xl text-sm font-medium hover:shadow-lg hover:shadow-' + (provider === 'odeal' ? 'cyan' : 'blue') + '-500/20 transition-all disabled:opacity-50'}>
                {saving ? 'Oluşturuluyor...' : 'Tahsilat Linki Oluştur'}
              </button>
              {linkResult && (
                <div className="flex items-center gap-2 px-4 py-3 bg-[#080b12] border border-[#1a2332] rounded-xl">
                  <input type="text" value={linkResult} readOnly className="flex-1 bg-transparent text-white text-sm focus:outline-none" />
                  <button onClick={copyLink} className="p-2 text-gray-400 hover:text-white transition-colors" title="Kopyala"><Copy size={16} /></button>
                  <a href={linkResult} target="_blank" rel="noopener noreferrer" className="p-2 text-gray-400 hover:text-white transition-colors" title="Aç"><ExternalLink size={16} /></a>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* Pay tab */}
      {tab === 'pay' && provider === 'paytr' && (
        <div className="bg-[#0d1117]/80 backdrop-blur-xl border border-[#1a2332] rounded-2xl p-6">
          {!isConfigured ? <p className="text-amber-400 text-sm">Önce API anahtarlarınızı tanımlayın.</p> : <PaytrPaymentForm onDone={() => setTab('keys')} />}
        </div>
      )}

      {tab === 'pay' && provider === 'iyzico' && (
        <div className="bg-[#0d1117]/80 backdrop-blur-xl border border-[#1a2332] rounded-2xl p-6">
          {!isConfigured ? <p className="text-amber-400 text-sm">Önce İyzico API anahtarlarınızı tanımlayın.</p> : <IyzicoPaymentForm />}
        </div>
      )}

      {tab === 'pay' && provider === 'sipay' && (
        <div className="bg-[#0d1117]/80 backdrop-blur-xl border border-[#1a2332] rounded-2xl p-6">
          {!isConfigured ? <p className="text-amber-400 text-sm">Önce Sipay API anahtarlarınızı tanımlayın.</p> : <SipayPaymentForm />}
        </div>
      )}

      {tab === 'pay' && provider === 'odeal' && (
        <div className="bg-[#0d1117]/80 backdrop-blur-xl border border-[#1a2332] rounded-2xl p-6">
          {!isConfigured ? <p className="text-amber-400 text-sm">Önce Ödeal API anahtarlarınızı tanımlayın.</p> : <OdealPaymentForm />}
        </div>
      )}

      {/* Embed tab */}
      {tab === 'embed' && (
        <div className="bg-[#0d1117]/80 backdrop-blur-xl border border-[#1a2332] rounded-2xl p-6 space-y-4">
          <p className="text-xs text-gray-500">Kendi web sitenize tek tıkla ödeme butonu eklemek için aşağıdaki kodu sayfanıza yapıştırın.</p>
          {!config?.slug ? (
            <p className="text-amber-400 text-sm">Sayfayı yenileyin veya API anahtarlarını kaydedin.</p>
          ) : (
            <div className="relative">
              <pre className="bg-[#080b12] border border-[#1a2332] rounded-xl p-4 text-xs text-gray-300 overflow-x-auto whitespace-pre-wrap font-mono leading-relaxed">{`<!-- BruskApp ${providerLabel()} Odeme Butonu -->
<div id="bruskapp-pay-root"></div>
<script>
(function(){
  var t = '${config.slug}';
  var api = '${provider === 'iyzico' ? 'iyzico' : provider === 'sipay' ? 'parampos' : provider === 'odeal' ? 'odeal' : 'paytr'}';
  var root = document.getElementById('bruskapp-pay-root');
  if(!root) return;
  root.innerHTML = '<button id="bruskapp-pay-btn" style="width:100%;padding:14px 24px;background:#2563eb;color:white;border:none;border-radius:12px;font-size:16px;font-weight:600;cursor:pointer">Odeme Yap</button><div id="bruskapp-pay-frame" style="display:none"></div><p id="bruskapp-pay-msg" style="display:none;text-align:center;font-size:14px;margin-top:12px"></p>';
  var btn = document.getElementById('bruskapp-pay-btn');
  var frame = document.getElementById('bruskapp-pay-frame');
  var msg = document.getElementById('bruskapp-pay-msg');
  btn.onclick = function(){
    btn.disabled = true; btn.textContent = 'Yonlendiriliyor...';
    var xhr = new XMLHttpRequest();
    xhr.open('POST','https://bruskapp.com/api/payments/' + (api === 'iyzico' ? 'storefront/iyzico' : api === 'sipay' ? 'storefront/sipay' : api === 'odeal' ? 'storefront/odeal' : 'storefront/paytr') + '/init');
    xhr.setRequestHeader('Content-Type','application/json');
    xhr.onload = function(){
      var d = JSON.parse(xhr.responseText);
      if(xhr.status === 200){
        btn.style.display = 'none';
        frame.style.display = 'block';
        if (api === 'sipay' || api === 'odeal') {
          var ifr = document.createElement('iframe');
          ifr.style.width = '100%'; ifr.style.height = '520px'; ifr.style.border = 'none'; ifr.style.borderRadius = '12px';
          frame.innerHTML = ''; frame.appendChild(ifr);
          var idoc = ifr.contentWindow.document; idoc.open(); idoc.write(d.threeDSecureHtmlContent); idoc.close();
        } else {
          var src = api === 'iyzico' ? d.iframeUrl : 'https://www.paytr.com/odeme/guvenli/'+d.token;
          frame.innerHTML = '<iframe src=\"'+src+'\" style=\"width:100%;height:520px;border:none;border-radius:12px\"></iframe>';
        }
      } else {
        msg.style.display = 'block'; msg.style.color = '#dc2626'; msg.textContent = d.message || 'Odeme baslatilamadi';
        btn.disabled = false; btn.textContent = 'Odeme Yap';
      }
    };
    xhr.onerror = function(){ msg.style.display = 'block'; msg.style.color = '#dc2626'; msg.textContent = 'Baglanti hatasi'; btn.disabled = false; btn.textContent = 'Odeme Yap'; };
    xhr.send(JSON.stringify({tenantSlug:t,amount:0,description:''}));
  };
  window.addEventListener('message',function(e){
    if(e.data && e.data.type === 'PAYTR_RESULT'){
      frame.style.display = 'none';
      msg.style.display = 'block';
      if(e.data.status === 'success'){ msg.style.color = '#16a34a'; msg.textContent = '✓ Odeme basarili!'; }
      else { msg.style.color = '#dc2626'; msg.textContent = '✗ Odeme basarisiz'; btn.style.display = 'block'; btn.disabled = false; btn.textContent = 'Tekrar Dene'; }
    }
  });
})();
</script>`}</pre>
              <button onClick={() => { navigator.clipboard.writeText(document.querySelector('pre')?.textContent || '') }} className="absolute top-3 right-3 p-2 bg-blue-500/10 border border-blue-500/20 rounded-lg text-blue-400 hover:bg-blue-500/20 transition-colors text-xs flex items-center gap-1"><Copy size={14} />Kopyala</button>
              <p className="text-xs text-amber-400/80 mt-2">⚠ Not: Embed kodundaki <code className="text-amber-300">amount:0</code> değerini kendi ürün tutarınızla değiştirin.</p>
              <p className="text-xs text-blue-400/80 mt-1">Sözleşme sayfaları <code className="text-blue-300">{config.slug}.bruskapp.com</code> alan adı altında çalışır.</p>
            </div>
          )}
        </div>
      )}

      {/* Installment tab */}
      {tab === 'installment' && (
        <div className="bg-[#0d1117]/80 backdrop-blur-xl border border-[#1a2332] rounded-2xl p-6 space-y-4">
          <p className="text-xs text-gray-500">Her ödeme sağlayıcısı için sunulacak taksit seçeneklerini belirleyin. Müşteriler ödeme sırasında bu seçenekler arasından seçim yapabilir.</p>
          <InstallmentSettingsPanel provider={provider} />
        </div>
      )}

      {/* Legal tab */}
      {tab === 'legal' && (
        <div className="bg-[#0d1117]/80 backdrop-blur-xl border border-[#1a2332] rounded-2xl p-6 space-y-4">
          <p className="text-xs text-gray-500">PayTR/İyzico, ödeme sayfasında Mesafeli Satış Sözleşmesi ve İptal/İade Politikası bağlantıları ister. Bu bilgiler sözleşmelerde otomatik görüntülenir.</p>
          {config?.slug && (
            <div className="bg-[#080b12] border border-[#1a2332] rounded-xl p-4 space-y-2 text-sm">
              <p className="text-gray-400 font-medium">Sözleşme Linkleri (ödeme sağlayıcı paneline ekleyin):</p>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <ScrollText size={14} className="text-blue-400 shrink-0" />
                  <span className="text-gray-300">Mesafeli Satış:</span>
                  <code className="text-xs bg-[#0d1117] px-2 py-1 rounded text-blue-300 break-all">https://{config.slug}.bruskapp.com/sozlesme/mesafeli-satis</code>
                  <button onClick={() => navigator.clipboard.writeText(`https://${config.slug}.bruskapp.com/sozlesme/mesafeli-satis`)} className="p-1 text-gray-500 hover:text-white shrink-0"><Copy size={14} /></button>
                </div>
                <div className="flex items-center gap-2">
                  <ScrollText size={14} className="text-blue-400 shrink-0" />
                  <span className="text-gray-300">İade Politikası:</span>
                  <code className="text-xs bg-[#0d1117] px-2 py-1 rounded text-blue-300 break-all">https://{config.slug}.bruskapp.com/sozlesme/iade</code>
                  <button onClick={() => navigator.clipboard.writeText(`https://${config.slug}.bruskapp.com/sozlesme/iade`)} className="p-1 text-gray-500 hover:text-white shrink-0"><Copy size={14} /></button>
                </div>
              </div>
              <p className="text-xs text-amber-400/80 mt-1">⚠ {providerLabel()} panelinde bu linkleri kullanın. Sözleşme sayfası {config.slug}.bruskapp.com alan adından açılır.</p>
            </div>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium text-gray-400 mb-1">İşletme Ünvanı</label><input type="text" value={legalInfo.title} onChange={e => setLegalInfo(f => ({ ...f, title: e.target.value }))} className="w-full px-4 py-2.5 bg-[#080b12] border border-[#1a2332] rounded-xl text-white text-sm focus:outline-none focus:border-blue-500/50" placeholder="ABC Restoran Ltd. Şti." /></div>
            <div><label className="block text-sm font-medium text-gray-400 mb-1">Vergi Dairesi</label><input type="text" value={legalInfo.taxOffice} onChange={e => setLegalInfo(f => ({ ...f, taxOffice: e.target.value }))} className="w-full px-4 py-2.5 bg-[#080b12] border border-[#1a2332] rounded-xl text-white text-sm focus:outline-none focus:border-blue-500/50" placeholder="Kadıköy VD" /></div>
            <div><label className="block text-sm font-medium text-gray-400 mb-1">Vergi No</label><input type="text" value={legalInfo.taxNumber} onChange={e => setLegalInfo(f => ({ ...f, taxNumber: e.target.value }))} className="w-full px-4 py-2.5 bg-[#080b12] border border-[#1a2332] rounded-xl text-white text-sm focus:outline-none focus:border-blue-500/50" placeholder="1234567890" /></div>
            <div><label className="block text-sm font-medium text-gray-400 mb-1">Telefon</label><input type="text" value={legalInfo.phone} onChange={e => setLegalInfo(f => ({ ...f, phone: e.target.value }))} className="w-full px-4 py-2.5 bg-[#080b12] border border-[#1a2332] rounded-xl text-white text-sm focus:outline-none focus:border-blue-500/50" placeholder="+905321234567" /></div>
            <div><label className="block text-sm font-medium text-gray-400 mb-1">E-posta</label><input type="email" value={legalInfo.email} onChange={e => setLegalInfo(f => ({ ...f, email: e.target.value }))} className="w-full px-4 py-2.5 bg-[#080b12] border border-[#1a2332] rounded-xl text-white text-sm focus:outline-none focus:border-blue-500/50" placeholder="info@abc.com" /></div>
            <div className="md:col-span-2"><label className="block text-sm font-medium text-gray-400 mb-1">Adres</label><textarea value={legalInfo.address} onChange={e => setLegalInfo(f => ({ ...f, address: e.target.value }))} className="w-full px-4 py-2.5 bg-[#080b12] border border-[#1a2332] rounded-xl text-white text-sm focus:outline-none focus:border-blue-500/50 h-20" placeholder="Fikirtepe Mah. Örnek Sok. No:5, Kadıköy/İstanbul" /></div>
          </div>
          <button onClick={saveLegalInfo} disabled={saving} className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-xl text-sm font-medium hover:shadow-lg hover:shadow-blue-500/20 transition-all disabled:opacity-50">{saving ? 'Kaydediliyor...' : 'Kaydet'}</button>
        </div>
      )}
    </div>
  )
}

// Iyzico mini payment form component
function IyzicoPaymentForm() {
  const [amount, setAmount] = useState('')
  const [desc, setDesc] = useState('')
  const [buyerName, setBuyerName] = useState('')
  const [buyerSurname, setBuyerSurname] = useState('')
  const [buyerEmail, setBuyerEmail] = useState('')
  const [buyerPhone, setBuyerPhone] = useState('')
  const [buyerAddress, setBuyerAddress] = useState('')
  const [loading, setLoading] = useState(false)
  const [iframeUrl, setIframeUrl] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<string | null>(null)
  const [installments, setInstallments] = useState<Array<{ number: number; totalPrice: number; installmentPrice: number }>>([])
  const [selectedInstallment, setSelectedInstallment] = useState(1)
  const [instLoading, setInstLoading] = useState(false)

  useEffect(() => {
    setInstLoading(true)
    fetch('/api/payments/installment-settings', { credentials: 'include' })
      .then(r => r.json())
      .then(data => {
        const s = data.iyzico
        if (s?.allowedInstallments) {
          setInstallments(s.allowedInstallments.map((n: number) => ({ number: n, totalPrice: 0, installmentPrice: 0 })))
        }
      })
      .catch(() => {})
      .finally(() => setInstLoading(false))
  }, [])

  useEffect(() => {
    const handler = (e: MessageEvent) => {
      if (e.data?.type === 'PAYTR_RESULT') {
        setResult(e.data.status === 'success' ? 'Odeme basarili!' : 'Odeme basarisiz')
      }
    }
    if (iframeUrl) window.addEventListener('message', handler)
    return () => window.removeEventListener('message', handler)
  }, [iframeUrl])

  const pay = async () => {
    setLoading(true); setError(null)
    const a = parseFloat(amount)
    if (!a || a <= 0) { setError('Gecerli bir tutar girin'); setLoading(false); return }
    try {
      const res = await fetch('/api/payments/iyzico/init', {
        method: 'POST', credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: a, description: desc, name: buyerName, surname: buyerSurname, email: buyerEmail, phone: buyerPhone, address: buyerAddress, installment: selectedInstallment }),
      })
      const data = await res.json()
      if (res.ok) setIframeUrl(data.iframeUrl)
      else setError(data.message || 'Hata')
    } catch { setError('Baglanti hatasi') }
    setLoading(false)
  }

  const reset = () => { setIframeUrl(null); setResult(null); setError(null) }

  if (result) return (
    <div className="text-center py-8">
      <div className={'w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3 text-2xl ' + (result.includes('basarili') ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400')}>
        {result.includes('basarili') ? '✓' : '✗'}
      </div>
      <p className={'font-medium ' + (result.includes('basarili') ? 'text-green-600' : 'text-red-600')}>{result}</p>
      <button onClick={reset} className="mt-4 text-sm text-gray-500 hover:text-gray-700 underline">Tekrar Dene</button>
    </div>
  )

  if (iframeUrl) return (
    <div className="space-y-3">
      <iframe src={iframeUrl} className="w-full border-0 rounded-xl" style={{ height: 520 }} title="Iyzico Odeme" />
      <button onClick={reset} className="text-sm text-gray-500 hover:text-gray-700 underline">Iptal</button>
    </div>
  )

  return (
    <div className="space-y-4">
      {error && <p className="text-red-500 text-sm">{error}</p>}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div><label className="block text-sm font-medium text-gray-400 mb-1">Tutar (TL)</label><input type="number" step="0.01" value={amount} onChange={e => setAmount(e.target.value)} className="w-full px-4 py-2.5 bg-[#080b12] border border-[#1a2332] rounded-xl text-white text-sm focus:outline-none focus:border-purple-500/50 transition-colors" placeholder="100.00" /></div>
        <div><label className="block text-sm font-medium text-gray-400 mb-1">Açıklama</label><input type="text" value={desc} onChange={e => setDesc(e.target.value)} className="w-full px-4 py-2.5 bg-[#080b12] border border-[#1a2332] rounded-xl text-white text-sm focus:outline-none focus:border-purple-500/50 transition-colors" placeholder="Siparis odemesi" /></div>
      </div>
      <p className="text-xs text-gray-500 font-medium">Alıcı Bilgileri (iyzico zorunlu)</p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div><label className="block text-sm font-medium text-gray-400 mb-1">Ad</label><input type="text" value={buyerName} onChange={e => setBuyerName(e.target.value)} className="w-full px-4 py-2.5 bg-[#080b12] border border-[#1a2332] rounded-xl text-white text-sm focus:outline-none focus:border-purple-500/50 transition-colors" placeholder="Ahmet" /></div>
        <div><label className="block text-sm font-medium text-gray-400 mb-1">Soyad</label><input type="text" value={buyerSurname} onChange={e => setBuyerSurname(e.target.value)} className="w-full px-4 py-2.5 bg-[#080b12] border border-[#1a2332] rounded-xl text-white text-sm focus:outline-none focus:border-purple-500/50 transition-colors" placeholder="Yılmaz" /></div>
        <div><label className="block text-sm font-medium text-gray-400 mb-1">E-posta</label><input type="email" value={buyerEmail} onChange={e => setBuyerEmail(e.target.value)} className="w-full px-4 py-2.5 bg-[#080b12] border border-[#1a2332] rounded-xl text-white text-sm focus:outline-none focus:border-purple-500/50 transition-colors" placeholder="ahmet@ornek.com" /></div>
        <div><label className="block text-sm font-medium text-gray-400 mb-1">Telefon</label><input type="tel" value={buyerPhone} onChange={e => setBuyerPhone(e.target.value)} className="w-full px-4 py-2.5 bg-[#080b12] border border-[#1a2332] rounded-xl text-white text-sm focus:outline-none focus:border-purple-500/50 transition-colors" placeholder="+905321234567" /></div>
      </div>
      <div><label className="block text-sm font-medium text-gray-400 mb-1">Adres</label><textarea value={buyerAddress} onChange={e => setBuyerAddress(e.target.value)} className="w-full px-4 py-2.5 bg-[#080b12] border border-[#1a2332] rounded-xl text-white text-sm focus:outline-none focus:border-purple-500/50 transition-colors h-20" placeholder="Fikirtepe Mah. Örnek Sok. No:5, Kadıköy/İstanbul" /></div>
      <InstallmentSelect installments={installments} value={selectedInstallment} onChange={setSelectedInstallment} loading={instLoading} />
      <button onClick={pay} disabled={loading} className="w-full py-3 bg-gradient-to-r from-purple-600 to-purple-500 text-white rounded-xl font-medium hover:shadow-lg hover:shadow-purple-500/20 transition-all disabled:opacity-50">
        {loading ? 'Yonlendiriliyor...' : 'Iyzico ile Odeme Al'}
      </button>
    </div>
  )
}

// Sipay payment form component (card info -> 3D API)
function SipayPaymentForm() {
  const [amount, setAmount] = useState('')
  const [desc, setDesc] = useState('')
  const [buyerName, setBuyerName] = useState('')
  const [buyerSurname, setBuyerSurname] = useState('')
  const [buyerEmail, setBuyerEmail] = useState('')
  const [buyerPhone, setBuyerPhone] = useState('')
  const [buyerAddress, setBuyerAddress] = useState('')
  const [loading, setLoading] = useState(false)
  const [htmlContent, setHtmlContent] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<string | null>(null)
  const [installments, setInstallments] = useState<Array<{ number: number; totalPrice: number; installmentPrice: number }>>([])
  const [selectedInstallment, setSelectedInstallment] = useState(1)
  const [instLoading, setInstLoading] = useState(false)

  useEffect(() => {
    setInstLoading(true)
    fetch('/api/payments/installment-settings', { credentials: 'include' })
      .then(r => r.json())
      .then(data => {
        const s = data.sipay
        if (s?.allowedInstallments) {
          setInstallments(s.allowedInstallments.map((n: number) => ({ number: n, totalPrice: 0, installmentPrice: 0 })))
        }
      })
      .catch(() => {})
      .finally(() => setInstLoading(false))
  }, [])

  useEffect(() => {
    const handler = (e: MessageEvent) => {
      if (e.data?.type === 'PAYTR_RESULT') {
        setResult(e.data.status === 'success' ? 'Odeme basarili!' : 'Odeme basarisiz')
      }
    }
    if (htmlContent) window.addEventListener('message', handler)
    return () => window.removeEventListener('message', handler)
  }, [htmlContent])

  const pay = async () => {
    setLoading(true); setError(null)
    const a = parseFloat(amount)
    if (!a || a <= 0) { setError('Gecerli bir tutar girin'); setLoading(false); return }
    try {
      const res = await fetch('/api/payments/sipay/init', {
        method: 'POST', credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: a, description: desc, name: buyerName, surname: buyerSurname, email: buyerEmail, phone: buyerPhone, address: buyerAddress, installment: selectedInstallment }),
      })
      const data = await res.json()
      if (res.ok) setHtmlContent(data.threeDSecureHtmlContent)
      else setError(data.message || 'Hata')
    } catch { setError('Baglanti hatasi') }
    setLoading(false)
  }

  const reset = () => { setHtmlContent(null); setResult(null); setError(null) }

  if (result) return (
    <div className="text-center py-8">
      <div className={'w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3 text-2xl ' + (result.includes('basarili') ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400')}>
        {result.includes('basarili') ? '✓' : '✗'}
      </div>
      <p className={'font-medium ' + (result.includes('basarili') ? 'text-green-600' : 'text-red-600')}>{result}</p>
      <button onClick={reset} className="mt-4 text-sm text-gray-500 hover:text-gray-700 underline">Tekrar Dene</button>
    </div>
  )

  if (htmlContent) return (
    <div className="space-y-3">
      <iframe srcDoc={htmlContent} className="w-full border-0 rounded-xl" style={{ height: 520 }} title="Sipay 3D Odeme" />
      <button onClick={reset} className="text-sm text-gray-500 hover:text-gray-700 underline">Iptal</button>
    </div>
  )

  return (
    <div className="space-y-4">
      {error && <p className="text-red-500 text-sm">{error}</p>}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div><label className="block text-sm font-medium text-gray-400 mb-1">Tutar (TL)</label><input type="number" step="0.01" value={amount} onChange={e => setAmount(e.target.value)} className="w-full px-4 py-2.5 bg-[#080b12] border border-[#1a2332] rounded-xl text-white text-sm focus:outline-none focus:border-emerald-500/50 transition-colors" placeholder="100.00" /></div>
        <div><label className="block text-sm font-medium text-gray-400 mb-1">Açıklama</label><input type="text" value={desc} onChange={e => setDesc(e.target.value)} className="w-full px-4 py-2.5 bg-[#080b12] border border-[#1a2332] rounded-xl text-white text-sm focus:outline-none focus:border-emerald-500/50 transition-colors" placeholder="Siparis odemesi" /></div>
      </div>
      <p className="text-xs text-gray-500 font-medium">Alıcı Bilgileri (Sipay zorunlu)</p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div><label className="block text-sm font-medium text-gray-400 mb-1">Ad</label><input type="text" value={buyerName} onChange={e => setBuyerName(e.target.value)} className="w-full px-4 py-2.5 bg-[#080b12] border border-[#1a2332] rounded-xl text-white text-sm focus:outline-none focus:border-emerald-500/50 transition-colors" placeholder="Ahmet" /></div>
        <div><label className="block text-sm font-medium text-gray-400 mb-1">Soyad</label><input type="text" value={buyerSurname} onChange={e => setBuyerSurname(e.target.value)} className="w-full px-4 py-2.5 bg-[#080b12] border border-[#1a2332] rounded-xl text-white text-sm focus:outline-none focus:border-emerald-500/50 transition-colors" placeholder="Yılmaz" /></div>
        <div><label className="block text-sm font-medium text-gray-400 mb-1">E-posta</label><input type="email" value={buyerEmail} onChange={e => setBuyerEmail(e.target.value)} className="w-full px-4 py-2.5 bg-[#080b12] border border-[#1a2332] rounded-xl text-white text-sm focus:outline-none focus:border-emerald-500/50 transition-colors" placeholder="ahmet@ornek.com" /></div>
        <div><label className="block text-sm font-medium text-gray-400 mb-1">Telefon</label><input type="tel" value={buyerPhone} onChange={e => setBuyerPhone(e.target.value)} className="w-full px-4 py-2.5 bg-[#080b12] border border-[#1a2332] rounded-xl text-white text-sm focus:outline-none focus:border-emerald-500/50 transition-colors" placeholder="+905321234567" /></div>
      </div>
      <div><label className="block text-sm font-medium text-gray-400 mb-1">Adres</label><textarea value={buyerAddress} onChange={e => setBuyerAddress(e.target.value)} className="w-full px-4 py-2.5 bg-[#080b12] border border-[#1a2332] rounded-xl text-white text-sm focus:outline-none focus:border-emerald-500/50 transition-colors h-20" placeholder="Fikirtepe Mah. Örnek Sok. No:5, Kadıköy/İstanbul" /></div>
      <InstallmentSelect installments={installments} value={selectedInstallment} onChange={setSelectedInstallment} loading={instLoading} />
      <button onClick={pay} disabled={loading} className="w-full py-3 bg-gradient-to-r from-emerald-600 to-emerald-500 text-white rounded-xl font-medium hover:shadow-lg hover:shadow-emerald-500/20 transition-all disabled:opacity-50">
        {loading ? 'Yonlendiriliyor...' : 'Sipay ile Odeme Al'}
      </button>
    </div>
  )
}

// Odeal payment form component
// Installment settings panel component
function InstallmentSettingsPanel({ provider }: { provider: string }) {
  const [settings, setSettings] = useState<any>(null)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const ALL_INSTALLMENTS = [1, 2, 3, 6, 9, 12]

  useEffect(() => {
    fetch('/api/payments/installment-settings', { credentials: 'include' })
      .then(r => r.json())
      .then(d => setSettings(d))
      .catch(() => {})
  }, [provider])

  const toggle = (n: number) => {
    if (!settings || !settings[provider]) return
    const s = { ...settings }
    const curr = s[provider].allowedInstallments || []
    s[provider].allowedInstallments = curr.includes(n) ? curr.filter((x: number) => x !== n) : [...curr, n].sort((a: number, b: number) => a - b)
    setSettings(s)
  }

  const setMax = (n: number) => {
    if (!settings || !settings[provider]) return
    setSettings({ ...settings, [provider]: { ...settings[provider], maxInstallment: n, allowedInstallments: settings[provider].allowedInstallments.filter((x: number) => x <= n) } })
  }

  const save = async () => {
    setSaving(true); setMessage(null)
    try {
      const res = await fetch('/api/payments/installment-settings/update', {
        method: 'POST', credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      })
      if (res.ok) setMessage('Taksit ayarları kaydedildi.')
      else setMessage('Kaydedilemedi.')
    } catch { setMessage('Bağlantı hatası') }
    setSaving(false)
  }

  if (!settings) return <div className="text-sm text-gray-500">Yükleniyor...</div>

  const prov = settings[provider] || { enabled: true, maxInstallment: 12, allowedInstallments: [1, 2, 3, 6, 9, 12] }

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-400 mb-2">İzin Verilen Taksitler</label>
        <div className="flex flex-wrap gap-2">
          {ALL_INSTALLMENTS.map(n => (
            <button key={n} onClick={() => toggle(n)}
              disabled={n > prov.maxInstallment}
              className={'px-4 py-2 rounded-xl text-sm font-medium border transition-all ' + (
                prov.allowedInstallments?.includes(n)
                  ? 'bg-blue-500/20 border-blue-500/30 text-blue-400'
                  : 'border-[#1a2332] text-gray-500 hover:text-gray-300 ' + (n > prov.maxInstallment ? 'opacity-30 cursor-not-allowed' : '')
              )}>
              {n === 1 ? 'Peşin' : n + ' Taksit'}
            </button>
          ))}
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-400 mb-1">Maksimum Taksit</label>
        <select value={prov.maxInstallment} onChange={e => setMax(parseInt(e.target.value))}
          className="w-full max-w-xs px-4 py-2.5 bg-[#080b12] border border-[#1a2332] rounded-xl text-white text-sm focus:outline-none focus:border-blue-500/50">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(n => (
            <option key={n} value={n}>{n} Taksit</option>
          ))}
        </select>
      </div>
      {message && <p className={'text-sm ' + (message.includes('kaydedildi') ? 'text-emerald-400' : 'text-red-400')}>{message}</p>}
      <button onClick={save} disabled={saving} className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-xl text-sm font-medium hover:shadow-lg hover:shadow-blue-500/20 transition-all disabled:opacity-50">
        {saving ? 'Kaydediliyor...' : 'Kaydet'}
      </button>
    </div>
  )
}

function OdealPaymentForm() {
  const [amount, setAmount] = useState('')
  const [desc, setDesc] = useState('')
  const [cardNumber, setCardNumber] = useState('')
  const [cardHolderName, setCardHolderName] = useState('')
  const [cardMonth, setCardMonth] = useState('')
  const [cardYear, setCardYear] = useState('')
  const [cardCvv, setCardCvv] = useState('')
  const [buyerName, setBuyerName] = useState('')
  const [buyerSurname, setBuyerSurname] = useState('')
  const [buyerEmail, setBuyerEmail] = useState('')
  const [buyerPhone, setBuyerPhone] = useState('')
  const [buyerAddress, setBuyerAddress] = useState('')
  const [loading, setLoading] = useState(false)
  const [htmlContent, setHtmlContent] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<string | null>(null)
  const [installments, setInstallments] = useState<Array<{ number: number; totalPrice: number; installmentPrice: number }>>([])
  const [selectedInstallment, setSelectedInstallment] = useState(1)
  const [instLoading, setInstLoading] = useState(false)

  // Load settings on mount
  useEffect(() => {
    setInstLoading(true)
    fetch('/api/payments/installment-settings', { credentials: 'include' })
      .then(r => r.json())
      .then(data => {
        const s = data.odeal
        if (s?.allowedInstallments) {
          setInstallments(s.allowedInstallments.map((n: number) => ({ number: n, totalPrice: 0, installmentPrice: 0 })))
        }
      })
      .catch(() => {})
      .finally(() => setInstLoading(false))
  }, [])

  // BIN check when card number has 6+ digits
  const binChecked = useRef(false)
  useEffect(() => {
    const raw = cardNumber.replace(/\s/g, '')
    if (raw.length >= 6 && !binChecked.current && amount) {
      binChecked.current = true
      const a = parseFloat(amount)
      if (a > 0) {
        setInstLoading(true)
        fetch('/api/payments/bin-check', {
          method: 'POST', credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ bin: raw.substring(0, 6), amount: a }),
        })
          .then(r => r.json())
          .then(data => {
            if (Array.isArray(data) && data.length > 0) {
              setInstallments(data)
              setSelectedInstallment(1)
            }
          })
          .catch(() => {})
          .finally(() => setInstLoading(false))
      }
    }
    if (raw.length < 6) binChecked.current = false
  }, [cardNumber, amount])

  useEffect(() => {
    const handler = (e: MessageEvent) => {
      if (e.data?.type === 'PAYTR_RESULT') {
        setResult(e.data.status === 'success' ? 'Odeme basarili!' : 'Odeme basarisiz')
      }
    }
    if (htmlContent) window.addEventListener('message', handler)
    return () => window.removeEventListener('message', handler)
  }, [htmlContent])

  const pay = async () => {
    setLoading(true); setError(null)
    const a = parseFloat(amount)
    if (!a || a <= 0) { setError('Gecerli bir tutar girin'); setLoading(false); return }
    if (!cardNumber || !cardMonth || !cardYear || !cardCvv) { setError('Kart bilgilerini eksiksiz girin'); setLoading(false); return }
    try {
      const res = await fetch('/api/payments/odeal/init', {
        method: 'POST', credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: a, description: desc,
          cardNumber: cardNumber.replace(/\s/g, ''),
          cardHolderName, cardMonth, cardYear, cardCvv,
          name: buyerName, surname: buyerSurname, email: buyerEmail, phone: buyerPhone, address: buyerAddress,
          installment: selectedInstallment,
        }),
      })
      const data = await res.json()
      if (res.ok) setHtmlContent(data.threeDFormHtml || data.threeDSecureHtmlContent)
      else setError(data.message || 'Hata')
    } catch { setError('Baglanti hatasi') }
    setLoading(false)
  }

  const formatCard = (v: string) => v.replace(/\D/g, '').replace(/(.{4})/g, '$1 ').trim().slice(0, 19)
  const reset = () => { setHtmlContent(null); setResult(null); setError(null) }

  if (result) return (
    <div className="text-center py-8">
      <div className={'w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3 text-2xl ' + (result.includes('basarili') ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400')}>
        {result.includes('basarili') ? '✓' : '✗'}
      </div>
      <p className={'font-medium ' + (result.includes('basarili') ? 'text-green-600' : 'text-red-600')}>{result}</p>
      <button onClick={reset} className="mt-4 text-sm text-gray-500 hover:text-gray-700 underline">Tekrar Dene</button>
    </div>
  )

  if (htmlContent) return (
    <div className="space-y-3">
      <iframe srcDoc={htmlContent} className="w-full border-0 rounded-xl" style={{ height: 520 }} title="Odeal 3D Odeme" />
      <button onClick={reset} className="text-sm text-gray-500 hover:text-gray-700 underline">Iptal</button>
    </div>
  )

  return (
    <div className="space-y-4">
      {error && <p className="text-red-500 text-sm">{error}</p>}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div><label className="block text-sm font-medium text-gray-400 mb-1">Tutar (TL)</label><input type="number" step="0.01" value={amount} onChange={e => setAmount(e.target.value)} className="w-full px-4 py-2.5 bg-[#080b12] border border-[#1a2332] rounded-xl text-white text-sm focus:outline-none focus:border-cyan-500/50 transition-colors" placeholder="100.00" /></div>
        <div><label className="block text-sm font-medium text-gray-400 mb-1">Açıklama</label><input type="text" value={desc} onChange={e => setDesc(e.target.value)} className="w-full px-4 py-2.5 bg-[#080b12] border border-[#1a2332] rounded-xl text-white text-sm focus:outline-none focus:border-cyan-500/50 transition-colors" placeholder="Siparis odemesi" /></div>
      </div>

      <p className="text-xs text-gray-500 font-medium">Kart Bilgileri</p>
      <div className="space-y-3">
        <div><label className="block text-sm font-medium text-gray-400 mb-1">Kart Numarası</label><input type="text" value={cardNumber} onChange={e => setCardNumber(formatCard(e.target.value))} className="w-full px-4 py-2.5 bg-[#080b12] border border-[#1a2332] rounded-xl text-white text-sm focus:outline-none focus:border-cyan-500/50 transition-colors font-mono" placeholder="1234 5678 9012 3456" /></div>
        <div><label className="block text-sm font-medium text-gray-400 mb-1">Kart Sahibi</label><input type="text" value={cardHolderName} onChange={e => setCardHolderName(e.target.value.toUpperCase())} className="w-full px-4 py-2.5 bg-[#080b12] border border-[#1a2332] rounded-xl text-white text-sm focus:outline-none focus:border-cyan-500/50 transition-colors font-mono" placeholder="AHMET YILMAZ" /></div>
        <div className="grid grid-cols-3 gap-3">
          <div><label className="block text-sm font-medium text-gray-400 mb-1">Ay (AA)</label><input type="text" value={cardMonth} onChange={e => setCardMonth(e.target.value.replace(/\D/g, '').slice(0, 2))} className="w-full px-4 py-2.5 bg-[#080b12] border border-[#1a2332] rounded-xl text-white text-sm focus:outline-none focus:border-cyan-500/50 transition-colors font-mono text-center" placeholder="12" /></div>
          <div><label className="block text-sm font-medium text-gray-400 mb-1">Yıl (YY)</label><input type="text" value={cardYear} onChange={e => setCardYear(e.target.value.replace(/\D/g, '').slice(0, 2))} className="w-full px-4 py-2.5 bg-[#080b12] border border-[#1a2332] rounded-xl text-white text-sm focus:outline-none focus:border-cyan-500/50 transition-colors font-mono text-center" placeholder="28" /></div>
          <div><label className="block text-sm font-medium text-gray-400 mb-1">CVV</label><input type="password" value={cardCvv} onChange={e => setCardCvv(e.target.value.replace(/\D/g, '').slice(0, 4))} className="w-full px-4 py-2.5 bg-[#080b12] border border-[#1a2332] rounded-xl text-white text-sm focus:outline-none focus:border-cyan-500/50 transition-colors font-mono text-center" placeholder="123" /></div>
        </div>
      </div>

      <p className="text-xs text-gray-500 font-medium">Alıcı Bilgileri</p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div><label className="block text-sm font-medium text-gray-400 mb-1">Ad</label><input type="text" value={buyerName} onChange={e => setBuyerName(e.target.value)} className="w-full px-4 py-2.5 bg-[#080b12] border border-[#1a2332] rounded-xl text-white text-sm focus:outline-none focus:border-cyan-500/50 transition-colors" placeholder="Ahmet" /></div>
        <div><label className="block text-sm font-medium text-gray-400 mb-1">Soyad</label><input type="text" value={buyerSurname} onChange={e => setBuyerSurname(e.target.value)} className="w-full px-4 py-2.5 bg-[#080b12] border border-[#1a2332] rounded-xl text-white text-sm focus:outline-none focus:border-cyan-500/50 transition-colors" placeholder="Yılmaz" /></div>
        <div><label className="block text-sm font-medium text-gray-400 mb-1">E-posta</label><input type="email" value={buyerEmail} onChange={e => setBuyerEmail(e.target.value)} className="w-full px-4 py-2.5 bg-[#080b12] border border-[#1a2332] rounded-xl text-white text-sm focus:outline-none focus:border-cyan-500/50 transition-colors" placeholder="ahmet@ornek.com" /></div>
        <div><label className="block text-sm font-medium text-gray-400 mb-1">Telefon</label><input type="tel" value={buyerPhone} onChange={e => setBuyerPhone(e.target.value)} className="w-full px-4 py-2.5 bg-[#080b12] border border-[#1a2332] rounded-xl text-white text-sm focus:outline-none focus:border-cyan-500/50 transition-colors" placeholder="+905321234567" /></div>
      </div>
      <div><label className="block text-sm font-medium text-gray-400 mb-1">Adres</label><textarea value={buyerAddress} onChange={e => setBuyerAddress(e.target.value)} className="w-full px-4 py-2.5 bg-[#080b12] border border-[#1a2332] rounded-xl text-white text-sm focus:outline-none focus:border-cyan-500/50 transition-colors h-20" placeholder="Fikirtepe Mah. Örnek Sok. No:5, Kadıköy/İstanbul" /></div>
      <InstallmentSelect installments={installments} value={selectedInstallment} onChange={setSelectedInstallment} loading={instLoading} />
      <button onClick={pay} disabled={loading} className="w-full py-3 bg-gradient-to-r from-cyan-600 to-cyan-500 text-white rounded-xl font-medium hover:shadow-lg hover:shadow-cyan-500/20 transition-all disabled:opacity-50">
        {loading ? 'Yonlendiriliyor...' : 'Ödeal ile Odeme Al'}
      </button>
    </div>
  )
}
