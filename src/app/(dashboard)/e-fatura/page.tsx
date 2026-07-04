'use client'
import { useState, useEffect } from 'react'
import { FileText, CheckCircle, XCircle, RefreshCw, Send, Plus, Trash2 } from 'lucide-react'

const PROVIDERS = [
  { key: 'nilvera', label: 'Nilvera', desc: 'REST JSON API, OAuth2 Bearer token. e-Fatura ve e-Arşiv.', color: '#6366f1', bg: 'rgba(99,102,241,0.1)' },
  { key: 'izibiz', label: 'İzibiz', desc: 'SOAP + REST. Session ID auth. e-Fatura, e-Arşiv, e-İrsaliye.', color: '#f59e0b', bg: 'rgba(245,158,11,0.1)' },
  { key: 'edm', label: 'EDM Bilişim', desc: 'SOAP (.NET). Kullanıcı/şifre auth. e-Fatura, e-Arşiv.', color: '#10b981', bg: 'rgba(16,185,129,0.1)' },
  { key: 'qnb', label: 'QNB eFinans', desc: 'SOAP. Kullanıcı/şifre/şube/kasa auth. Dijital Köprü.', color: '#ef4444', bg: 'rgba(239,68,68,0.1)' },
]

type Tab = 'settings' | 'send' | 'history'

export default function EFaturaPage() {
  const [config, setConfig] = useState<any>({})
  const [selectedProvider, setSelectedProvider] = useState('nilvera')
  const [tab, setTab] = useState<Tab>('settings')
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [result, setResult] = useState('')
  const [creds, setCreds] = useState<Record<string, string>>({})
  const [templates, setTemplates] = useState<any[]>([])

  const provider = PROVIDERS.find(p => p.key === selectedProvider)!

  useEffect(() => {
    fetch('/api/einvoice/config', { credentials: 'include' })
      .then(r => r.json()).then(d => {
        setConfig(d)
        const pc = d[selectedProvider]
        if (pc?.credentials) setCreds(pc.credentials)
      }).catch(() => {})
  }, [])

  useEffect(() => {
    const pc = config[selectedProvider]
    setCreds(pc?.credentials || {})
  }, [selectedProvider, config])

  const saveConfig = async () => {
    setSaving(true)
    try {
      const newConfig = { ...config, [selectedProvider]: { ...config[selectedProvider], credentials: creds } }
      const res = await fetch('/api/einvoice/config', {
        method: 'POST', credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...newConfig, selectedProvider }),
      })
      const data = await res.json()
      setConfig(data)
      setResult(JSON.stringify({ success: true, message: 'Ayarlar kaydedildi' }, null, 2))
    } catch {
      setResult(JSON.stringify({ error: 'Kaydetme hatası' }, null, 2))
    } finally { setSaving(false) }
  }

  const testConnection = async () => {
    setLoading(true); setResult('')
    try {
      const res = await fetch('/api/einvoice/test', {
        method: 'POST', credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ provider: selectedProvider, credentials: creds }),
      })
      setResult(JSON.stringify(await res.json(), null, 2))
    } catch { setResult('Bağlantı hatası') }
    finally { setLoading(false) }
  }

  const fetchTemplates = async () => {
    setLoading(true); setResult('')
    try {
      const res = await fetch('/api/einvoice/templates', {
        method: 'POST', credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ provider: selectedProvider }),
      })
      const data = await res.json()
      setResult(JSON.stringify(data, null, 2))
      if (data.templates) setTemplates(data.templates)
    } catch { setResult('Sablon getirme hatasi') }
    finally { setLoading(false) }
  }

  const sendInvoice = async (formData: any) => {
    setLoading(true); setResult('')
    try {
      const res = await fetch('/api/einvoice/send', {
        method: 'POST', credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })
      setResult(JSON.stringify(await res.json(), null, 2))
    } catch { setResult('Gonderme hatasi') }
    finally { setLoading(false) }
  }

  const credFields = selectedProvider === 'nilvera' ? [
    { key: 'apiKey', label: 'API Anahtarı', type: 'password', placeholder: 'Nilvera API Key' },
    { key: 'testMode', label: 'Test Modu', type: 'select', options: [{ value: 'true', label: 'Test (apitest.nilvera.com)' }, { value: 'false', label: 'Canlı (api.nilvera.com)' }] },
    { key: 'invoiceSerie', label: 'Fatura Serisi', type: 'text', placeholder: 'EFT (varsayılan)' },
    { key: 'archiveSerie', label: 'e-Arşiv Serisi', type: 'text', placeholder: 'EAF (varsayılan)' },
    { key: 'templateUuid', label: 'Şablon UUID (opsiyonel)', type: 'text', placeholder: 'Şablon UUID' },
  ] : selectedProvider === 'izibiz' ? [
    { key: 'username', label: 'Kullanıcı Adı', type: 'text', placeholder: 'İzibiz kullanıcı adı' },
    { key: 'password', label: 'Şifre', type: 'password', placeholder: 'İzibiz şifre' },
    { key: 'invoiceSerie', label: 'Fatura Serisi', type: 'text', placeholder: 'IZI (varsayılan)' },
    { key: 'archiveSerie', label: 'e-Arşiv Serisi', type: 'text', placeholder: 'EAR (varsayılan)' },
  ] : selectedProvider === 'edm' ? [
    { key: 'username', label: 'Kullanıcı Adı', type: 'text', placeholder: 'EDM kullanıcı adı' },
    { key: 'password', label: 'Şifre', type: 'password', placeholder: 'EDM şifre' },
    { key: 'invoiceSerie', label: 'Fatura Serisi', type: 'text', placeholder: 'EDM (varsayılan)' },
    { key: 'archiveSerie', label: 'e-Arşiv Serisi', type: 'text', placeholder: 'EDM (varsayılan)' },
  ] : [
    { key: 'username', label: 'Kullanıcı Adı', type: 'text', placeholder: 'QNB kullanıcı adı' },
    { key: 'password', label: 'Şifre', type: 'password', placeholder: 'QNB şifre' },
    { key: 'testMode', label: 'Test Modu', type: 'select', options: [{ value: 'true', label: 'Test' }, { value: 'false', label: 'Canlı' }] },
    { key: 'invoiceSerie', label: 'Fatura Serisi', type: 'text', placeholder: 'TRA (varsayılan)' },
    { key: 'archiveSerie', label: 'e-Arşiv Serisi', type: 'text', placeholder: 'EA (varsayılan)' },
    { key: 'sube', label: 'Şube Kodu', type: 'text', placeholder: 'DFLT' },
    { key: 'kasa', label: 'Kasa Kodu', type: 'text', placeholder: 'DFLT' },
  ]

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-white">e-Fatura / e-Arşiv</h1>
        <p className="text-sm text-gray-500 mt-1">Entegratör ayarlarınızı yapın ve faturalarınızı gönderin</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {PROVIDERS.map(p => {
          const active = selectedProvider === p.key
          const hasCreds = config[p.key]?.credentials?.apiKey || config[p.key]?.credentials?.username
          return (
            <button key={p.key} onClick={() => { setSelectedProvider(p.key); setResult('') }}
              className={'relative text-left p-4 rounded-2xl border transition-all ' + (active ? 'ring-2' : 'border-[#1a2332] hover:border-gray-600')}
              style={{ backgroundColor: active ? p.bg : '#0d1117', borderColor: active ? p.color : undefined }}>
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: p.color }}>
                  <FileText size={18} className="text-white" />
                </div>
                <div className={'w-2 h-2 rounded-full ' + (hasCreds ? 'bg-green-400' : 'bg-yellow-400')} />
              </div>
              <p className="text-sm font-semibold text-white">{p.label}</p>
              <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{p.desc}</p>
            </button>
          )
        })}
      </div>

      <div className="bg-[#0d1117]/80 backdrop-blur-xl border border-[#1a2332] rounded-2xl p-6">
        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-[#1a2332]">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: provider.color }}>
            <FileText size={18} className="text-white" />
          </div>
          <div>
            <h2 className="text-white font-semibold">{provider.label}</h2>
            <p className="text-xs text-gray-500">{provider.desc}</p>
          </div>
        </div>

        <div className="flex gap-2 mb-6 flex-wrap">
          {(['settings', 'send', 'history'] as Tab[]).map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={'px-5 py-2 rounded-xl text-sm font-medium transition-all ' + (tab === t ? 'border' : 'text-gray-400 bg-[#1a2332]/50')}
              style={tab === t ? { backgroundColor: provider.color + '20', borderColor: provider.color + '50', borderWidth: 1, color: provider.color } : {}}>
              {t === 'settings' ? 'Ayarlar' : t === 'send' ? 'Fatura Gonder' : 'Gecmis'}
            </button>
          ))}
        </div>

        {tab === 'settings' && (
          <div className="space-y-4">
            <p className="text-sm text-gray-500">
              {selectedProvider === 'nilvera' ? 'Nilvera panelinizden (API Tanimlari > Yeni Anahtar) API anahtari olusturun.' :
               selectedProvider === 'izibiz' ? 'Izibiz portalindan API kullanici adi ve sifrenizi girin.' :
               selectedProvider === 'edm' ? 'EDM Bilisim portalindan kullanici adi ve sifrenizi girin.' :
               'QNB eFinans portalindan (efinansportal.efinans.com.tr) kullanici bilgilerinizi girin.'}
            </p>

            {credFields.map(f => (
              <div key={f.key}>
                <label className="text-xs text-gray-500 mb-1 block">{f.label}</label>
                {f.type === 'select' ? (
                  <select value={creds[f.key] || f.options?.[0]?.value} onChange={e => setCreds({ ...creds, [f.key]: e.target.value })}
                    className="w-full bg-[#080b12] border border-[#1a2332] rounded-xl px-4 py-2.5 text-sm text-white font-mono">
                    {f.options?.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </select>
                ) : (
                  <input type={f.type} value={creds[f.key] || ''} onChange={e => setCreds({ ...creds, [f.key]: e.target.value })}
                    placeholder={f.placeholder}
                    className="w-full bg-[#080b12] border border-[#1a2332] rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-600 font-mono" />
                )}
              </div>
            ))}

            <div className="pt-2">
              <p className="text-xs text-gray-500 mb-2">Şirket Bilgileri (faturada görünecek)</p>
              <div className="grid grid-cols-2 gap-3">
                {['companyTaxNumber', 'companyName', 'companyTaxOffice', 'companyCity', 'companyAddress', 'phone', 'email'].map(k => (
                  <input key={k} type={k === 'email' ? 'email' : 'text'} value={creds[k] || ''} onChange={e => setCreds({ ...creds, [k]: e.target.value })}
                    placeholder={
                      k === 'companyTaxNumber' ? 'Vergi No' :
                      k === 'companyName' ? 'Ünvan' :
                      k === 'companyTaxOffice' ? 'Vergi Dairesi' :
                      k === 'companyCity' ? 'Şehir' :
                      k === 'companyAddress' ? 'Adres' :
                      k === 'phone' ? 'Telefon' : 'E-posta'
                    }
                    className={'w-full bg-[#080b12] border border-[#1a2332] rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-600 font-mono ' + (k === 'companyAddress' || k === 'phone' || k === 'email' ? 'col-span-2' : '')} />
                ))}
              </div>
            </div>

            <div className="flex gap-3 flex-wrap pt-2">
              <button onClick={saveConfig} disabled={saving}
                className="px-6 py-2 rounded-xl text-sm font-medium text-white disabled:opacity-50" style={{ background: provider.color }}>
                {saving ? 'Kaydediliyor...' : 'Ayarları Kaydet'}
              </button>
              <button onClick={testConnection} disabled={loading}
                className="px-6 py-2 rounded-xl text-sm font-medium border border-[#1a2332] text-gray-300 hover:bg-white/5 disabled:opacity-50 flex items-center gap-2">
                <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
                {loading ? 'Test ediliyor...' : 'Bağlantı Testi'}
              </button>
              {selectedProvider === 'nilvera' && (
                <button onClick={fetchTemplates} disabled={loading}
                  className="px-6 py-2 rounded-xl text-sm font-medium border border-[#1a2332] text-gray-300 hover:bg-white/5 disabled:opacity-50">
                  Sablonlari Getir
                </button>
              )}
            </div>

            {result && <pre className="bg-[#080b12] rounded-xl p-4 text-sm text-gray-300 font-mono border border-[#1a2332] whitespace-pre-wrap break-all max-h-96 overflow-auto">{result}</pre>}
          </div>
        )}

        {tab === 'send' && <SendInvoiceTab provider={selectedProvider} creds={creds} onSend={sendInvoice} loading={loading} result={result} />}

        {tab === 'history' && (
          <div className="text-center py-12 text-gray-500">
            <FileText size={32} className="mx-auto mb-3 opacity-50" />
            <p className="text-sm">Fatura gecmisi yakinda eklenecek.</p>
          </div>
        )}
      </div>
    </div>
  )
}

function SendInvoiceTab({ provider, creds, onSend, loading, result }: any) {
  const [type, setType] = useState<'invoice' | 'archive'>('archive')
  const [profileId, setProfileId] = useState<'TICARIFATURA' | 'TEMELFATURA'>('TICARIFATURA')
  const [customerName, setCustomerName] = useState('')
  const [vkn, setVkn] = useState('')
  const [tckn, setTckn] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [address, setAddress] = useState('')
  const [taxOffice, setTaxOffice] = useState('')
  const [description, setDescription] = useState('')
  const [checking, setChecking] = useState(false)
  const [checkResult, setCheckResult] = useState('')
  const [lines, setLines] = useState([{ name: '', quantity: 1, unitPrice: 0, vatRate: 20 }])

  const checkTaxpayer = async (id: string) => {
    if (!id || id.length < 10) { setCheckResult(''); return }
    setChecking(true)
    try {
      const res = await fetch('/api/einvoice/check-taxpayer', {
        method: 'POST', credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ taxNumber: id }),
      })
      const data = await res.json()
      if (data.registered) {
        setType('invoice')
        setCheckResult('e-Fatura mükellefi')
      } else {
        setType('archive')
        setCheckResult('e-Arşiv (e-Fatura mükellefi değil)')
      }
    } catch { setCheckResult('Sorgulanamadı') }
    finally { setChecking(false) }
  }

  const addLine = () => setLines([...lines, { name: '', quantity: 1, unitPrice: 0, vatRate: 20 }])
  const removeLine = (i: number) => setLines(lines.filter((_, idx) => idx !== i))
  const updateLine = (i: number, field: string, value: any) => {
    const copy = [...lines]
    ;(copy[i] as any)[field] = value
    setLines(copy)
  }

  const handleSend = () => {
    onSend({
      type,
      profileId: type === 'invoice' ? profileId : undefined,
      customer: { name: customerName, vkn: vkn || undefined, tckn: tckn || undefined, email: email || undefined, phone: phone || undefined, address: address || undefined, taxOffice: taxOffice || undefined },
      lines: lines.map(l => ({ name: l.name, quantity: l.quantity, unitPrice: l.unitPrice, vatRate: l.vatRate })),
      description: description || undefined,
    })
  }

  return (
    <div className="space-y-4">
      <div>
        <label className="text-xs text-gray-500 mb-1 block">Fatura Türü</label>
        <div className="flex gap-2">
          <button onClick={() => setType('invoice')}
            className={'px-5 py-2 rounded-xl text-sm font-medium transition-all ' + (type === 'invoice' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' : 'bg-[#1a2332]/50 text-gray-400')}>
            e-Fatura (B2B)
          </button>
          <button onClick={() => setType('archive')}
            className={'px-5 py-2 rounded-xl text-sm font-medium transition-all ' + (type === 'archive' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' : 'bg-[#1a2332]/50 text-gray-400')}>
            e-Arşiv (B2C)
          </button>
        </div>
        {type === 'invoice' && (
          <div className="mt-3">
            <label className="text-xs text-gray-500 mb-1 block">Fatura Senaryosu</label>
            <div className="flex gap-2">
              <button onClick={() => setProfileId('TICARIFATURA')}
                className={'px-5 py-2 rounded-xl text-sm font-medium transition-all ' + (profileId === 'TICARIFATURA' ? 'bg-green-500/20 text-green-400 border border-green-500/30' : 'bg-[#1a2332]/50 text-gray-400')}>
                Ticari (Kabul/Red)
              </button>
              <button onClick={() => setProfileId('TEMELFATURA')}
                className={'px-5 py-2 rounded-xl text-sm font-medium transition-all ' + (profileId === 'TEMELFATURA' ? 'bg-green-500/20 text-green-400 border border-green-500/30' : 'bg-[#1a2332]/50 text-gray-400')}>
                Temel (Reddedilemez)
              </button>
            </div>
          </div>
        )}
        {checkResult && (
          <p className={'text-xs mt-1 ' + (checkResult.includes('mükellefi') ? 'text-green-400' : 'text-yellow-400')}>
            {checking ? 'Sorgulanıyor...' : checkResult}
          </p>
        )}
      </div>

      <div>
        <p className="text-xs text-gray-500 mb-2">Müşteri Bilgileri</p>
        <div className="grid grid-cols-2 gap-3">
          <input type="text" value={customerName} onChange={e => setCustomerName(e.target.value)} placeholder="Ad Soyad / Ünvan"
            className="col-span-2 w-full bg-[#080b12] border border-[#1a2332] rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-600" />
          <input type="text" value={vkn} onChange={e => setVkn(e.target.value)} onBlur={e => checkTaxpayer(e.target.value)} placeholder="VKN (Vergi No)"
            className="w-full bg-[#080b12] border border-[#1a2332] rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-600 font-mono" />
          <input type="text" value={tckn} onChange={e => setTckn(e.target.value)} onBlur={e => checkTaxpayer(e.target.value)} placeholder="TCKN"
            className="w-full bg-[#080b12] border border-[#1a2332] rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-600 font-mono" />
          <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="E-posta"
            className="w-full bg-[#080b12] border border-[#1a2332] rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-600" />
          <input type="tel" value={phone} onChange={e => setPhone(e.target.value)} placeholder="Telefon"
            className="w-full bg-[#080b12] border border-[#1a2332] rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-600" />
          <input type="text" value={taxOffice} onChange={e => setTaxOffice(e.target.value)} placeholder="Vergi Dairesi"
            className="w-full bg-[#080b12] border border-[#1a2332] rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-600" />
          <textarea value={address} onChange={e => setAddress(e.target.value)} rows={2} placeholder="Adres"
            className="col-span-2 w-full bg-[#080b12] border border-[#1a2332] rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-600 resize-none" />
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-2">
          <p className="text-xs text-gray-500">Fatura Kalemleri</p>
          <button onClick={addLine} className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1"><Plus size={12} /> Kalem Ekle</button>
        </div>
        <div className="space-y-2">
          {lines.map((line, i) => (
            <div key={i} className="flex gap-2 items-start bg-[#080b12] rounded-xl p-3 border border-[#1a2332]">
              <div className="flex-1 grid grid-cols-5 gap-2">
                <input type="text" value={line.name} onChange={e => updateLine(i, 'name', e.target.value)} placeholder="Ürün adı"
                  className="col-span-2 w-full bg-transparent border border-[#1a2332] rounded-lg px-3 py-1.5 text-sm text-white placeholder-gray-600" />
                <input type="number" value={line.quantity} onChange={e => updateLine(i, 'quantity', Number(e.target.value))} placeholder="Adet"
                  className="w-full bg-transparent border border-[#1a2332] rounded-lg px-3 py-1.5 text-sm text-white placeholder-gray-600" />
                <input type="number" value={line.unitPrice} onChange={e => updateLine(i, 'unitPrice', Number(e.target.value))} placeholder="Birim fiyat"
                  className="w-full bg-transparent border border-[#1a2332] rounded-lg px-3 py-1.5 text-sm text-white placeholder-gray-600" />
                <select value={line.vatRate} onChange={e => updateLine(i, 'vatRate', Number(e.target.value))}
                  className="w-full bg-transparent border border-[#1a2332] rounded-lg px-3 py-1.5 text-sm text-white">
                  <option value={0}>%0</option>
                  <option value={1}>%1</option>
                  <option value={8}>%8</option>
                  <option value={10}>%10</option>
                  <option value={18}>%18</option>
                  <option value={20}>%20</option>
                </select>
              </div>
              {lines.length > 1 && (
                <button onClick={() => removeLine(i)} className="p-1.5 text-red-400 hover:text-red-300"><Trash2 size={14} /></button>
              )}
            </div>
          ))}
        </div>
        <div className="text-right text-sm text-gray-400 mt-2">
          Toplam: {lines.reduce((s, l) => s + l.quantity * l.unitPrice, 0).toLocaleString('tr-TR')} TL
          (KDV: {lines.reduce((s, l) => s + l.quantity * l.unitPrice * (l.vatRate || 0) / 100, 0).toLocaleString('tr-TR')} TL)
        </div>
      </div>

      <textarea value={description} onChange={e => setDescription(e.target.value)} rows={2} placeholder="Açıklama (opsiyonel)"
        className="w-full bg-[#080b12] border border-[#1a2332] rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-600 resize-none" />

      <button onClick={handleSend} disabled={loading || !customerName || lines.every(l => !l.name)}
        className="px-6 py-2.5 rounded-xl text-sm font-medium text-white disabled:opacity-50 flex items-center gap-2" style={{ background: '#6366f1' }}>
        <Send size={14} className={loading ? 'animate-pulse' : ''} />
        {loading ? 'Gönderiliyor...' : 'Faturayı Gönder'}
      </button>

      {result && <pre className="bg-[#080b12] rounded-xl p-4 text-sm text-gray-300 font-mono border border-[#1a2332] whitespace-pre-wrap break-all max-h-96 overflow-auto">{result}</pre>}
    </div>
  )
}
