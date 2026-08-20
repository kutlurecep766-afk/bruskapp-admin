'use client'
import { useState, useEffect } from 'react'
import {
  CreditCard, Link2, CheckCircle, AlertCircle, Copy, ExternalLink,
  HandCoins, ScrollText, Percent, ShieldCheck, Wallet, Sparkles, ArrowRight,
} from 'lucide-react'
import PaytrPaymentForm from '@/components/paytr-iframe'
import InstallmentSelect from '@/components/installment-select'

const PROVIDERS = [
  { id: 'paytr', label: 'PayTR', desc: 'Sanal POS bağlantısı', icon: ShieldCheck, color: 'blue', available: true },
  { id: 'iyzico', label: 'İyzico', desc: 'Çok yakında', icon: Wallet, color: 'purple', available: false },
  { id: 'sipay', label: 'Sipay', desc: 'Çok yakında', icon: Wallet, color: 'emerald', available: false },
  { id: 'odeal', label: 'Ödeal', desc: 'Çok yakında', icon: Wallet, color: 'cyan', available: false },
]

export default function VirtualPosPage() {
  const [provider, setProvider] = useState('paytr')
  const [tab, setTab] = useState<'keys' | 'pay' | 'link' | 'installment' | 'legal'>('keys')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [config, setConfig] = useState<any>(null)

  const [paytrForm, setPaytrForm] = useState({ merchantId: '', merchantKey: '', merchantSecret: '' })

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
        setLoading(false)
      })
      .catch(() => setLoading(false))
    fetch('/api/payments/virtual-pos/legal-info', { credentials: 'include' })
      .then(r => r.json())
      .then(data => { if (data) setLegalInfo(data) })
      .catch(() => {})
  }, [])

  useEffect(() => {
    setLinkInstLoading(true)
    fetch('/api/payments/installment-settings', { credentials: 'include' })
      .then(r => r.json())
      .then(data => {
        const s = data.paytr
        if (s?.allowedInstallments) {
          setLinkInstallments(s.allowedInstallments.map((n: number) => ({ number: n, totalPrice: 0, installmentPrice: 0 })))
        }
      })
      .catch(() => {})
      .finally(() => setLinkInstLoading(false))
  }, [provider])

  const isConfigured = config?.paytr?.configured

  const saveKeys = async () => {
    setSaving(true); setMessage(null)
    const res = await fetch('/api/payments/virtual-pos/api-keys', {
      method: 'POST', credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ merchantId: paytrForm.merchantId, merchantKey: paytrForm.merchantKey, merchantSecret: paytrForm.merchantSecret }),
    })
    if (res.ok) {
      setMessage({ type: 'success', text: 'PayTR API anahtarları kaydedildi. Ödeme hesabınız aktif.' })
      setConfig((prev: any) => ({ ...prev, paytr: { configured: true, merchantId: paytrForm.merchantId } }))
    } else {
      const data = await res.json()
      setMessage({ type: 'error', text: data.message || 'Bir hata oluştu, anahtarlar kaydedilemedi.' })
    }
    setSaving(false)
  }

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
    else setMessage({ type: 'error', text: 'Yasal bilgiler kaydedilemedi.' })
    setSaving(false)
  }

  const activeProvider = PROVIDERS.find(p => p.id === provider)!

  if (loading) return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" /></div>

  const inputCls = "w-full bg-blue-50/40 border border-blue-100 rounded-xl px-3 py-2 text-gray-900 text-sm focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100 placeholder-gray-400 transition-all"
  const labelCls = "text-[10px] text-gray-500 font-semibold uppercase tracking-wider"

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-700 via-blue-600 to-blue-500 p-6 lg:p-8 shadow-lg shadow-blue-600/20">
        <div className="absolute -top-16 -right-16 w-64 h-64 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute -bottom-20 -left-10 w-72 h-72 rounded-full bg-blue-900/20 blur-3xl" />
        <div className="relative flex items-start justify-between flex-wrap gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-white/15 backdrop-blur flex items-center justify-center shadow-inner">
              <CreditCard className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-xl lg:text-2xl font-bold text-white tracking-tight">Sanal POS Yönetimi</h1>
              <p className="text-sm text-blue-100 mt-0.5 flex items-center gap-1.5">
                <HandCoins className="w-3.5 h-3.5" />
                Kendi ödeme hesabınızı bağlayın — ödemeler doğrudan size yansır
              </p>
            </div>
          </div>
          <span className={'inline-flex items-center gap-2 px-3 py-2.5 rounded-full text-xs font-semibold backdrop-blur ' + (isConfigured ? 'bg-emerald-400/20 text-emerald-50 border border-emerald-300/30' : 'bg-white/15 text-white border border-white/20')}>
            <span className={'relative flex w-2.5 h-2.5 ' + (isConfigured ? '' : '')}>
              <span className={'absolute inline-flex w-full h-full rounded-full ' + (isConfigured ? 'bg-emerald-300 opacity-75 animate-ping' : 'bg-white/50')} />
              <span className={'relative inline-flex w-2.5 h-2.5 rounded-full ' + (isConfigured ? 'bg-emerald-300' : 'bg-white/80')} />
            </span>
            {isConfigured ? 'Ödeme Hesabı Aktif' : 'Bağlantı Bekliyor'}
          </span>
        </div>
      </div>

      {/* Provider cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {PROVIDERS.map(p => {
          const Icon = p.icon
          const active = provider === p.id
          const connected = p.id === 'paytr' && isConfigured
          return (
            <button
              key={p.id}
              onClick={() => { if (p.available) { setProvider(p.id); setTab('keys'); setMessage(null) } }}
              disabled={!p.available}
              className={'relative overflow-hidden rounded-2xl bg-white border p-5 text-left shadow-sm transition-all duration-300 ' +
                (active ? 'border-blue-400 ring-2 ring-blue-100 shadow-lg shadow-blue-600/10 hover:shadow-xl hover:shadow-blue-600/15' : 'border-blue-100 hover:shadow-lg hover:shadow-blue-600/10') +
                (p.available ? ' cursor-pointer hover:-translate-y-0.5' : ' cursor-not-allowed opacity-60')}>
              <div className="absolute -top-8 -right-8 w-20 h-20 rounded-full bg-blue-50" />
              <div className="relative">
                <div className="flex items-center justify-between mb-3">
                  <div className={'w-9 h-9 rounded-full bg-gradient-to-br flex items-center justify-center shadow-md ' +
                    (p.color === 'blue' ? 'from-blue-600 to-blue-700' : p.color === 'purple' ? 'from-purple-500 to-purple-600' : p.color === 'emerald' ? 'from-emerald-500 to-teal-600' : 'from-cyan-500 to-cyan-600')}>
                    <Icon className="w-4 h-4 text-white" />
                  </div>
                  {connected ? (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200 text-[10px] font-bold">
                      <CheckCircle size={10} /> Bağlı
                    </span>
                  ) : active ? (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 border border-blue-200 text-[10px] font-bold">
                      Seçili
                    </span>
                  ) : !p.available ? (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-50 text-amber-600 border border-amber-200 text-[10px] font-bold">
                      Yakında
                    </span>
                  ) : null}
                </div>
                <p className="text-gray-900 text-sm font-bold">{p.label}</p>
                <p className="text-xs text-gray-500 mt-0.5">{p.desc}</p>
              </div>
            </button>
          )
        })}
      </div>

      {/* Info banner */}
      <div className="flex items-start gap-3 p-4 rounded-2xl bg-blue-50 border border-blue-100">
        <Sparkles size={16} className="text-blue-600 mt-0.5 flex-shrink-0" />
        <p className="text-xs text-gray-600 leading-relaxed">
          Her işletme <b className="text-gray-900">kendi Sanal POS hesabını</b> bağlar. PayTR panelinizdeki API anahtarlarını girin; müşteriden alınan tüm ödemeler <b className="text-gray-900">doğrudan kendi banka hesabınıza</b> yatar. BruskApp araya girmez, komisyon kesmez.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-white border border-blue-100 rounded-full p-1 shadow-sm w-fit overflow-x-auto no-scrollbar">
        <button onClick={() => setTab('keys')} className={'px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all ' + (tab === 'keys' ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30' : 'text-gray-500 hover:text-blue-600')}><Link2 size={13} className="inline mr-1.5 -mt-0.5" />API Anahtarları</button>
        <button onClick={() => setTab('pay')} className={'px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all ' + (tab === 'pay' ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30' : 'text-gray-500 hover:text-blue-600')}><HandCoins size={13} className="inline mr-1.5 -mt-0.5" />Ödeme Al</button>
        <button onClick={() => setTab('link')} className={'px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all ' + (tab === 'link' ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30' : 'text-gray-500 hover:text-blue-600')}><Link2 size={13} className="inline mr-1.5 -mt-0.5" />Tahsilat Linki</button>
        <button onClick={() => setTab('installment')} className={'px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all ' + (tab === 'installment' ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30' : 'text-gray-500 hover:text-blue-600')}><Percent size={13} className="inline mr-1.5 -mt-0.5" />Taksit</button>
        <button onClick={() => setTab('legal')} className={'px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all ' + (tab === 'legal' ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30' : 'text-gray-500 hover:text-blue-600')}><ScrollText size={13} className="inline mr-1.5 -mt-0.5" />Yasal Bilgiler</button>
      </div>

      {message && (
        <div className={'flex items-center gap-2 px-4 py-3 rounded-xl text-sm border ' + (message.type === 'success' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-red-50 text-red-600 border-red-200')}>
          {message.type === 'success' ? <CheckCircle size={16} /> : <AlertCircle size={16} />}{message.text}
        </div>
      )}

      {/* API Keys */}
      {tab === 'keys' && (
        <div className="relative overflow-hidden rounded-2xl bg-white border border-blue-100 p-6 shadow-sm hover:shadow-lg hover:shadow-blue-600/10 transition-all duration-300">
          <div className="absolute -top-8 -right-8 w-24 h-24 rounded-full bg-blue-50" />
          <div className="relative">
            <h3 className="text-gray-900 font-bold flex items-center gap-2 mb-1"><Link2 size={18} className="text-blue-600" /> PayTR API Anahtarları</h3>
            <p className="text-xs text-gray-500 mb-5">PayTR panelinizden <b className="text-gray-700">Mağaza {'>'} Entegrasyon Bilgileri</b> sayfasındaki anahtarlarınızı girin.</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex flex-col gap-1">
                <label className={labelCls}>Merchant ID</label>
                <input type="text" value={paytrForm.merchantId} onChange={e => setPaytrForm(f => ({ ...f, merchantId: e.target.value }))} className={inputCls} placeholder="000000" />
              </div>
              <div className="flex flex-col gap-1">
                <label className={labelCls}>Merchant Key</label>
                <input type="text" value={paytrForm.merchantKey} onChange={e => setPaytrForm(f => ({ ...f, merchantKey: e.target.value }))} className={inputCls} placeholder={config?.paytr?.configured ? '•••••••• (değiştirmek için yazın)' : ''} />
              </div>
              <div className="flex flex-col gap-1">
                <label className={labelCls}>Merchant Secret</label>
                <input type="password" value={paytrForm.merchantSecret} onChange={e => setPaytrForm(f => ({ ...f, merchantSecret: e.target.value }))} className={inputCls} placeholder={config?.paytr?.configured ? '•••••••• (değiştirmek için yazın)' : ''} />
              </div>
            </div>
            <div className="flex items-center gap-3 mt-5 flex-wrap">
              <button onClick={saveKeys} disabled={saving}
                className="flex items-center gap-1.5 px-5 py-2.5 rounded-full bg-gradient-to-r from-blue-600 to-blue-700 text-white text-xs font-bold shadow-md shadow-blue-600/30 hover:from-blue-700 hover:to-blue-800 hover:scale-105 active:scale-95 transition-all disabled:opacity-50">
                {saving ? 'Kaydediliyor...' : config?.paytr?.configured ? 'Anahtarları Güncelle' : 'Kaydet ve Bağlan'}
                {!saving && <ArrowRight size={13} />}
              </button>
              <a href="https://www.paytr.com" target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs text-blue-600 font-semibold hover:text-blue-700 hover:underline">
                <ExternalLink size={13} /> PayTR panelini aç
              </a>
            </div>
            {config?.paytr?.configured && (
              <div className="mt-4 flex items-center gap-2 px-4 py-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-700 text-sm">
                <CheckCircle size={16} /> PayTR bağlantısı aktif — Hesap: <b className="font-mono">{config.paytr.merchantId}</b>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Ödeme Al */}
      {tab === 'pay' && (
        <div className="relative overflow-hidden rounded-2xl bg-white border border-blue-100 p-6 shadow-sm hover:shadow-lg hover:shadow-blue-600/10 transition-all duration-300">
          <div className="absolute -top-8 -right-8 w-24 h-24 rounded-full bg-blue-50" />
          <div className="relative">
            <h3 className="text-gray-900 font-bold flex items-center gap-2 mb-1"><HandCoins size={18} className="text-blue-600" /> Ödeme Al</h3>
            <p className="text-xs text-gray-500 mb-5">Müşterinizden kartla ödeme alın. Tutar girip ödeme başlatın, müşteri PayTR sayfasında güvenle ödeme yapar.</p>
            {!isConfigured ? (
              <p className="text-amber-600 text-sm bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">Önce <b>API Anahtarları</b> sekmesinden PayTR anahtarlarınızı kaydedin.</p>
            ) : (
              <PaytrPaymentForm onDone={() => setTab('keys')} />
            )}
          </div>
        </div>
      )}

      {/* Tahsilat Linki */}
      {tab === 'link' && (
        <div className="relative overflow-hidden rounded-2xl bg-white border border-blue-100 p-6 shadow-sm hover:shadow-lg hover:shadow-blue-600/10 transition-all duration-300">
          <div className="absolute -top-8 -right-8 w-24 h-24 rounded-full bg-blue-50" />
          <div className="relative">
            <h3 className="text-gray-900 font-bold flex items-center gap-2 mb-1"><Link2 size={18} className="text-blue-600" /> Tahsilat Linki Oluştur</h3>
            <p className="text-xs text-gray-500 mb-5">WhatsApp, e-posta veya SMS ile gönderebileceğiniz tek tıkla ödeme linki oluşturun.</p>
            {!isConfigured ? (
              <p className="text-amber-600 text-sm bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">Önce <b>API Anahtarları</b> sekmesinden PayTR anahtarlarınızı kaydedin.</p>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1">
                    <label className={labelCls}>Tutar (TL)</label>
                    <input type="number" step="0.01" value={linkForm.amount} onChange={e => setLinkForm(f => ({ ...f, amount: e.target.value }))} className={inputCls} placeholder="100.00" />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className={labelCls}>Açıklama</label>
                    <input type="text" value={linkForm.description} onChange={e => setLinkForm(f => ({ ...f, description: e.target.value }))} className={inputCls} placeholder="Sipariş ödemesi" />
                  </div>
                </div>
                <div className="mt-4 max-w-xs">
                  <InstallmentSelect installments={linkInstallments} value={linkInstallment} onChange={setLinkInstallment} loading={linkInstLoading} />
                </div>
                <button onClick={createLink} disabled={saving}
                  className="mt-5 px-5 py-2.5 rounded-full bg-gradient-to-r from-blue-600 to-blue-700 text-white text-xs font-bold shadow-md shadow-blue-600/30 hover:from-blue-700 hover:to-blue-800 hover:scale-105 active:scale-95 transition-all disabled:opacity-50">
                  {saving ? 'Oluşturuluyor...' : 'Tahsilat Linki Oluştur'}
                </button>
                {linkResult && (
                  <div className="mt-4 flex items-center gap-2 px-4 py-3 bg-white border border-blue-200 rounded-xl shadow-sm">
                    <input type="text" value={linkResult} readOnly className="flex-1 bg-transparent text-gray-900 text-sm font-mono focus:outline-none" />
                    <button onClick={copyLink} className="p-2 text-gray-400 hover:text-blue-600 transition-colors" title="Kopyala"><Copy size={16} /></button>
                    <a href={linkResult} target="_blank" rel="noopener noreferrer" className="p-2 text-gray-400 hover:text-blue-600 transition-colors" title="Aç"><ExternalLink size={16} /></a>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}

      {/* Taksit */}
      {tab === 'installment' && (
        <div className="relative overflow-hidden rounded-2xl bg-white border border-blue-100 p-6 shadow-sm hover:shadow-lg hover:shadow-blue-600/10 transition-all duration-300">
          <div className="absolute -top-8 -right-8 w-24 h-24 rounded-full bg-blue-50" />
          <div className="relative">
            <h3 className="text-gray-900 font-bold flex items-center gap-2 mb-1"><Percent size={18} className="text-blue-600" /> Taksit Ayarları</h3>
            <p className="text-xs text-gray-500 mb-5">Ödeme sayfanızda sunulacak taksit seçeneklerini belirleyin. Müşteriler ödeme sırasında seçim yapabilir.</p>
            <InstallmentSettingsPanel />
          </div>
        </div>
      )}

      {/* Yasal Bilgiler */}
      {tab === 'legal' && (
        <div className="relative overflow-hidden rounded-2xl bg-white border border-blue-100 p-6 shadow-sm hover:shadow-lg hover:shadow-blue-600/10 transition-all duration-300">
          <div className="absolute -top-8 -right-8 w-24 h-24 rounded-full bg-blue-50" />
          <div className="relative">
            <h3 className="text-gray-900 font-bold flex items-center gap-2 mb-1"><ScrollText size={18} className="text-blue-600" /> Yasal Bilgiler</h3>
            <p className="text-xs text-gray-500 mb-5">PayTR, ödeme sayfasında Mesafeli Satış Sözleşmesi ve İptal/İade Politikası bağlantıları ister. Bu bilgiler sözleşmelerde otomatik görüntülenir.</p>
            {config?.slug && (
              <div className="bg-blue-50/50 border border-blue-100 rounded-xl p-4 space-y-2 text-sm mb-5">
                <p className="text-gray-900 font-medium">Sözleşme Linkleri (PayTR paneline ekleyin):</p>
                <div className="flex items-center gap-2">
                  <ScrollText size={14} className="text-blue-600 shrink-0" />
                  <span className="text-gray-600">Mesafeli Satış:</span>
                  <code className="text-xs bg-white px-2 py-1 rounded text-blue-600 break-all border border-blue-100">https://{config.slug}.bruskapp.com/sozlesme/mesafeli-satis</code>
                  <button onClick={() => navigator.clipboard.writeText(`https://${config.slug}.bruskapp.com/sozlesme/mesafeli-satis`)} className="p-1 text-gray-400 hover:text-blue-600 shrink-0"><Copy size={14} /></button>
                </div>
                <div className="flex items-center gap-2">
                  <ScrollText size={14} className="text-blue-600 shrink-0" />
                  <span className="text-gray-600">İade Politikası:</span>
                  <code className="text-xs bg-white px-2 py-1 rounded text-blue-600 break-all border border-blue-100">https://{config.slug}.bruskapp.com/sozlesme/iade</code>
                  <button onClick={() => navigator.clipboard.writeText(`https://${config.slug}.bruskapp.com/sozlesme/iade`)} className="p-1 text-gray-400 hover:text-blue-600 shrink-0"><Copy size={14} /></button>
                </div>
                <p className="text-xs text-amber-600">⚠ PayTR panelinde bu linkleri kullanın.</p>
              </div>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1">
                <label className={labelCls}>İşletme Ünvanı</label>
                <input type="text" value={legalInfo.title} onChange={e => setLegalInfo(f => ({ ...f, title: e.target.value }))} className={inputCls} placeholder="ABC Restoran Ltd. Şti." />
              </div>
              <div className="flex flex-col gap-1">
                <label className={labelCls}>Vergi Dairesi</label>
                <input type="text" value={legalInfo.taxOffice} onChange={e => setLegalInfo(f => ({ ...f, taxOffice: e.target.value }))} className={inputCls} placeholder="Kadıköy VD" />
              </div>
              <div className="flex flex-col gap-1">
                <label className={labelCls}>Vergi No</label>
                <input type="text" value={legalInfo.taxNumber} onChange={e => setLegalInfo(f => ({ ...f, taxNumber: e.target.value }))} className={inputCls} placeholder="1234567890" />
              </div>
              <div className="flex flex-col gap-1">
                <label className={labelCls}>Telefon</label>
                <input type="text" value={legalInfo.phone} onChange={e => setLegalInfo(f => ({ ...f, phone: e.target.value }))} className={inputCls} placeholder="+905321234567" />
              </div>
              <div className="flex flex-col gap-1">
                <label className={labelCls}>E-posta</label>
                <input type="email" value={legalInfo.email} onChange={e => setLegalInfo(f => ({ ...f, email: e.target.value }))} className={inputCls} placeholder="info@abc.com" />
              </div>
              <div className="flex flex-col gap-1 md:col-span-2">
                <label className={labelCls}>Adres</label>
                <textarea value={legalInfo.address} onChange={e => setLegalInfo(f => ({ ...f, address: e.target.value }))} className={inputCls + ' h-20 resize-none'} placeholder="Fikirtepe Mah. Örnek Sok. No:5, Kadıköy/İstanbul" />
              </div>
            </div>
            <button onClick={saveLegalInfo} disabled={saving}
              className="mt-5 px-5 py-2.5 rounded-full bg-gradient-to-r from-blue-600 to-blue-700 text-white text-xs font-bold shadow-md shadow-blue-600/30 hover:from-blue-700 hover:to-blue-800 hover:scale-105 active:scale-95 transition-all disabled:opacity-50">
              {saving ? 'Kaydediliyor...' : 'Kaydet'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

function InstallmentSettingsPanel() {
  const [settings, setSettings] = useState<any>(null)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const ALL_INSTALLMENTS = [1, 2, 3, 6, 9, 12]

  useEffect(() => {
    fetch('/api/payments/installment-settings', { credentials: 'include' })
      .then(r => r.json())
      .then(d => setSettings(d))
      .catch(() => {})
  }, [])

  const toggle = (n: number) => {
    if (!settings || !settings.paytr) return
    const s = { ...settings }
    const curr = s.paytr.allowedInstallments || []
    s.paytr.allowedInstallments = curr.includes(n) ? curr.filter((x: number) => x !== n) : [...curr, n].sort((a: number, b: number) => a - b)
    setSettings(s)
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

  const prov = settings.paytr || { enabled: true, maxInstallment: 12, allowedInstallments: [1, 2, 3, 6, 9, 12] }

  return (
    <div className="space-y-4">
      <div>
        <label className="text-[10px] text-gray-500 font-semibold uppercase tracking-wider block mb-2">İzin Verilen Taksitler</label>
        <div className="flex flex-wrap gap-2">
          {ALL_INSTALLMENTS.map(n => (
            <button key={n} onClick={() => toggle(n)}
              disabled={n > prov.maxInstallment}
              className={'px-4 py-2 rounded-full text-sm font-semibold border transition-all ' + (
                prov.allowedInstallments?.includes(n)
                  ? 'bg-blue-50 border-blue-200 text-blue-600 hover:bg-blue-100'
                  : 'border-gray-200 text-gray-400 hover:text-gray-600 ' + (n > prov.maxInstallment ? 'opacity-40 cursor-not-allowed' : '')
              )}>
              {n === 1 ? 'Peşin' : n + ' Taksit'}
            </button>
          ))}
        </div>
      </div>
      {message && <p className={'text-sm ' + (message.includes('kaydedildi') ? 'text-emerald-600' : 'text-red-600')}>{message}</p>}
      <button onClick={save} disabled={saving}
        className="px-5 py-2.5 rounded-full bg-gradient-to-r from-blue-600 to-blue-700 text-white text-xs font-bold shadow-md shadow-blue-600/30 hover:from-blue-700 hover:to-blue-800 hover:scale-105 active:scale-95 transition-all disabled:opacity-50">
        {saving ? 'Kaydediliyor...' : 'Kaydet'}
      </button>
    </div>
  )
}