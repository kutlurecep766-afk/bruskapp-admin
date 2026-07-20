'use client'
import { useState, useEffect } from 'react'
import { MessageCircle, Plus, Trash2, Save, Zap, Loader2, CheckCircle2 } from 'lucide-react'

interface Product {
  name: string
  price: string
  description: string
}

interface FAQ {
  question: string
  answer: string
}

interface Config {
  businessName: string
  description: string
  address: string
  phone: string
  hours: string
  email: string
  welcomeMessage: string
  products: Product[]
  faqs: FAQ[]
  systemPrompt: string
  knowledgeBase: string
}

export default function WebchatPage() {
  const [config, setConfig] = useState<Config | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [webcampaigns, setWebcampaigns] = useState<any[]>([])
  const [showCampaignForm, setShowCampaignForm] = useState(false)
  const [campaignTitle, setCampaignTitle] = useState('')
  const [campaignDiscount, setCampaignDiscount] = useState('')
  const [campaignDesc, setCampaignDesc] = useState('')

  const saveWebCampaign = async () => {
    if (!campaignTitle) return
    await fetch('/api/campaigns', { method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'include', body: JSON.stringify({ title: campaignTitle, description: campaignDesc, type: 'discount', discount: campaignDiscount ? parseInt(campaignDiscount) : null, status: 'active' }) })
    setShowCampaignForm(false)
    setCampaignTitle(''); setCampaignDiscount(''); setCampaignDesc('')
    fetch('/api/campaigns', { credentials: 'include' }).then(r => r.ok ? r.json() : []).then(setWebcampaigns)
  }

  const deleteCampaign = async (id: string) => {
    if (!confirm('Kampanyayi silmek istediginize emin misiniz?')) return
    await fetch('/api/campaigns/' + id, { method: 'DELETE', credentials: 'include' })
    fetch('/api/campaigns', { credentials: 'include' }).then(r => r.ok ? r.json() : []).then(setWebcampaigns)
  }

  const toggleCampaign = async (id: string, currentStatus: string) => {
    const newStatus = currentStatus === 'active' ? 'passive' : 'active'
    await fetch('/api/campaigns/' + id, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, credentials: 'include', body: JSON.stringify({ status: newStatus }) })
    fetch('/api/campaigns', { credentials: 'include' }).then(r => r.ok ? r.json() : []).then(setWebcampaigns)
  }
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    fetch('/api/campaigns', { credentials: 'include' }).then(r => r.ok ? r.json() : []).then(setWebcampaigns).catch(() => {})
    fetch('/api/webchat/config', { credentials: 'include' })
      .then(r => r.ok ? r.json() : null)
      .then(d => { if (d) setConfig(d) })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const update = (key: string, value: any) => {
    if (!config) return
    setConfig({ ...config, [key]: value })
  }

  const addProduct = () => {
    if (!config) return
    setConfig({ ...config, products: [...config.products, { name: '', price: '', description: '' }] })
  }

  const updateProduct = (i: number, key: string, value: string) => {
    if (!config) return
    const products = [...config.products]
    products[i] = { ...products[i], [key]: value }
    setConfig({ ...config, products })
  }

  const removeProduct = (i: number) => {
    if (!config) return
    setConfig({ ...config, products: config.products.filter((_, idx) => idx !== i) })
  }

  const addFaq = () => {
    if (!config) return
    setConfig({ ...config, faqs: [...config.faqs, { question: '', answer: '' }] })
  }

  const updateFaq = (i: number, key: string, value: string) => {
    if (!config) return
    const faqs = [...config.faqs]
    faqs[i] = { ...faqs[i], [key]: value }
    setConfig({ ...config, faqs })
  }

  const removeFaq = (i: number) => {
    if (!config) return
    setConfig({ ...config, faqs: config.faqs.filter((_, idx) => idx !== i) })
  }

  const save = async () => {
    if (!config) return
    setSaving(true)
    setSaved(false)
    try {
      const res = await fetch('/api/webchat/config', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(config),
      })
      if (res.ok) {
        setSaved(true)
        setTimeout(() => setSaved(false), 2000)
      }
    } catch {} finally { setSaving(false) }
  }

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
    </div>
  )

  if (!config) return <div className="text-gray-500 text-center py-20">Yapılandırma yüklenemedi</div>

  return (
    <div className="space-y-6 pb-12 max-w-4xl">
      {/* Header */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#0f1420] via-[#0d1117] to-[#0a0e14] border border-[#1a2332] p-8">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-500/5 rounded-full blur-3xl" />
        <div className="relative flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
              <MessageCircle className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">Chatbot Ayarları</h1>
              <p className="text-sm text-gray-500 mt-0.5">Web sitenizdeki yapay zeka asistanını tamamen size özel şekillendirin</p>
            </div>
          </div>
          <button onClick={save} disabled={saving} className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-xl text-sm font-medium hover:shadow-lg hover:shadow-blue-500/25 transition-all disabled:opacity-50 shadow-lg shadow-blue-500/10">
            {saving ? <><Loader2 className="w-4 h-4 animate-spin" /> Kaydediliyor...</> : <><Save size={16} /> Kaydet</>}
          </button>
        </div>
      </div>

      {saved && (
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#0f1420] to-[#0d1117] border border-emerald-500/20 px-5 py-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center"><CheckCircle2 className="w-4 h-4 text-emerald-400" /></div>
            <p className="text-emerald-400 text-sm font-medium">Tüm değişiklikler kaydedildi!</p>
          </div>
        </div>
      )}

      {/* İşletme Bilgileri */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#0f1420] to-[#0d1117] border border-[#1a2332] p-6 lg:p-8">
        <div className="absolute top-0 right-0 w-48 h-48 bg-blue-500/5 rounded-full blur-2xl" />
        <div className="relative">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/20"><MessageCircle size={18} className="text-white" /></div>
            <div>
              <h2 className="text-white font-semibold">İşletme Bilgileri</h2>
              <p className="text-xs text-gray-500">AI asistanın işletmenizi tanıması için temel bilgiler</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-gray-500 block mb-1.5">İşletme Adı</label>
              <input type="text" value={config.businessName} onChange={e => update('businessName', e.target.value)} className="w-full bg-[#080b12]/80 border border-[#1a2332] rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-blue-500/50 transition-colors" />
            </div>
            <div>
              <label className="text-xs text-gray-500 block mb-1.5">E-posta</label>
              <input type="email" value={config.email} onChange={e => update('email', e.target.value)} className="w-full bg-[#080b12]/80 border border-[#1a2332] rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-blue-500/50 transition-colors" />
            </div>
            <div>
              <label className="text-xs text-gray-500 block mb-1.5">Telefon</label>
              <input type="text" value={config.phone} onChange={e => update('phone', e.target.value)} className="w-full bg-[#080b12]/80 border border-[#1a2332] rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-blue-500/50 transition-colors" />
            </div>
            <div>
              <label className="text-xs text-gray-500 block mb-1.5">Çalışma Saatleri</label>
              <input type="text" value={config.hours} onChange={e => update('hours', e.target.value)} className="w-full bg-[#080b12]/80 border border-[#1a2332] rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-blue-500/50 transition-colors" />
            </div>
            <div className="md:col-span-2">
              <label className="text-xs text-gray-500 block mb-1.5">Adres</label>
              <input type="text" value={config.address} onChange={e => update('address', e.target.value)} className="w-full bg-[#080b12]/80 border border-[#1a2332] rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-blue-500/50 transition-colors" />
            </div>
            <div className="md:col-span-2">
              <label className="text-xs text-gray-500 block mb-1.5">Açıklama</label>
              <textarea value={config.description} onChange={e => update('description', e.target.value)} rows={2} className="w-full bg-[#080b12]/80 border border-[#1a2332] rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-blue-500/50 transition-colors resize-none" />
            </div>
            <div className="md:col-span-2">
              <label className="text-xs text-gray-500 block mb-1.5">Karşılama Mesajı</label>
              <textarea value={config.welcomeMessage} onChange={e => update('welcomeMessage', e.target.value)} rows={2} className="w-full bg-[#080b12]/80 border border-[#1a2332] rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-blue-500/50 transition-colors resize-none" />
            </div>
            <div className="md:col-span-2">
              <label className="text-xs text-gray-500 block mb-1.5">Sistem Promptu</label>
              <textarea value={config.systemPrompt} onChange={e => update('systemPrompt', e.target.value)} rows={2} className="w-full bg-[#080b12]/80 border border-[#1a2332] rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-blue-500/50 transition-colors resize-none" />
            </div>
          </div>
        </div>
      </div>

      {/* Ürün / Hizmetler */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#0f1420] to-[#0d1117] border border-[#1a2332] p-6 lg:p-8">
        <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-500/5 rounded-full blur-2xl" />
        <div className="relative">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-500/20"><Plus size={18} className="text-white" /></div>
              <div>
                <h2 className="text-white font-semibold">Ürün / Hizmetler</h2>
                <p className="text-xs text-gray-500">AI asistanın müşterilere anlatacağı ürün ve hizmetler</p>
              </div>
            </div>
            <button onClick={addProduct} className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600/20 text-blue-400 rounded-lg text-xs font-medium hover:bg-blue-600/30 transition-all"><Plus size={14} /> Ekle</button>
          </div>
          <div className="space-y-3">
            {config.products.map((p, i) => (
              <div key={i} className="flex gap-3 items-start bg-[#080b12]/60 border border-[#1a2332] rounded-xl p-3 transition-all hover:border-emerald-500/20">
                <div className="flex-1 space-y-2">
                  <input type="text" value={p.name} onChange={e => updateProduct(i, 'name', e.target.value)} placeholder="Ürün adı" className="w-full bg-[#080b12]/80 border border-[#1a2332] rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500/50 placeholder-gray-600" />
                  <div className="flex gap-2">
                    <input type="text" value={p.price} onChange={e => updateProduct(i, 'price', e.target.value)} placeholder="Fiyat" className="flex-1 bg-[#080b12]/80 border border-[#1a2332] rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500/50 placeholder-gray-600" />
                    <input type="text" value={p.description} onChange={e => updateProduct(i, 'description', e.target.value)} placeholder="Açıklama" className="flex-[2] bg-[#080b12]/80 border border-[#1a2332] rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500/50 placeholder-gray-600" />
                  </div>
                </div>
                <button onClick={() => removeProduct(i)} className="p-2 text-gray-500 hover:text-red-400 transition-colors"><Trash2 size={16} /></button>
              </div>
            ))}
            {config.products.length === 0 && <p className="text-gray-500 text-sm text-center py-4">Henüz ürün eklenmemiş</p>}
          </div>
        </div>
      </div>

      {/* SSS */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#0f1420] to-[#0d1117] border border-[#1a2332] p-6 lg:p-8">
        <div className="absolute top-0 right-0 w-48 h-48 bg-purple-500/5 rounded-full blur-2xl" />
        <div className="relative">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center shadow-lg shadow-purple-500/20"><MessageCircle size={18} className="text-white" /></div>
              <div>
                <h2 className="text-white font-semibold">SSS</h2>
                <p className="text-xs text-gray-500">Sık sorulan sorular ve cevapları</p>
              </div>
            </div>
            <button onClick={addFaq} className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600/20 text-blue-400 rounded-lg text-xs font-medium hover:bg-blue-600/30 transition-all"><Plus size={14} /> Ekle</button>
          </div>
          <div className="space-y-3">
            {config.faqs.map((f, i) => (
              <div key={i} className="flex gap-3 items-start bg-[#080b12]/60 border border-[#1a2332] rounded-xl p-3 transition-all hover:border-purple-500/20">
                <div className="flex-1 space-y-2">
                  <input type="text" value={f.question} onChange={e => updateFaq(i, 'question', e.target.value)} placeholder="Soru" className="w-full bg-[#080b12]/80 border border-[#1a2332] rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500/50 placeholder-gray-600" />
                  <textarea value={f.answer} onChange={e => updateFaq(i, 'answer', e.target.value)} placeholder="Cevap" rows={2} className="w-full bg-[#080b12]/80 border border-[#1a2332] rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500/50 placeholder-gray-600 resize-none" />
                </div>
                <button onClick={() => removeFaq(i)} className="p-2 text-gray-500 hover:text-red-400 transition-colors"><Trash2 size={16} /></button>
              </div>
            ))}
            {config.faqs.length === 0 && <p className="text-gray-500 text-sm text-center py-4">Henüz SSS eklenmemiş</p>}
          </div>
        </div>
      </div>

      {/* Bilgi Havuzu */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#0f1420] to-[#0d1117] border border-[#1a2332] p-6 lg:p-8">
        <div className="absolute top-0 right-0 w-48 h-48 bg-amber-500/5 rounded-full blur-2xl" />
        <div className="relative">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center shadow-lg shadow-amber-500/20"><MessageCircle size={18} className="text-white" /></div>
            <div>
              <h2 className="text-white font-semibold">Bilgi Havuzu</h2>
              <p className="text-xs text-gray-500">İşletmeniz, ürünleriniz, hizmetleriniz hakkında detaylı bilgileri buraya yapıştırın. AI asistanı bu bilgileri kullanarak cevap verecek.</p>
            </div>
          </div>
          <textarea
            value={config.knowledgeBase}
            onChange={e => update('knowledgeBase', e.target.value)}
            rows={16}
            className="w-full bg-[#080b12]/80 border border-[#1a2332] rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-amber-500/50 placeholder-gray-600 resize-y font-mono leading-relaxed transition-colors"
            placeholder={'Örneğin işletmenizle ilgili her şeyi buraya yazın/kopyalayın:\n\n- Şirket tarihçesi\n- Tüm hizmet detayları\n- Fiyatlandırma bilgileri\n- Paket içerikleri\n- Referanslar\n- İletişim politikası\n- Sık yapılan hatalar ve çözümleri\n- vb.'}
          />
        </div>
      </div>

      {/* Kampanya Modülü */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#0f1420] to-[#0d1117] border border-[#1a2332] p-6 lg:p-8">
        <div className="absolute top-0 right-0 w-48 h-48 bg-pink-500/5 rounded-full blur-2xl" />
        <div className="relative">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-pink-500 to-rose-600 flex items-center justify-center shadow-lg shadow-pink-500/20"><Zap size={18} className="text-white" /></div>
            <div>
              <h2 className="text-white font-semibold">Kampanya Modülü</h2>
              <p className="text-xs text-gray-500">AI asistanın kampanyalara göre yanıt vermesi için kampanya oluşturun</p>
            </div>
          </div>

          {webcampaigns.length > 0 && (
            <div className="space-y-2 mb-4">
              {webcampaigns.map((c: any) => (
                <div key={c.id} className="bg-[#080b12]/60 border border-[#1a2332] rounded-xl p-4 transition-all hover:border-pink-500/20">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <h4 className="text-white text-sm font-medium">{c.title}</h4>
                      {c.description && <p className="text-xs text-gray-500 mt-0.5">{c.description}</p>}
                      <div className="flex gap-2 mt-2">
                        {c.discount && <span className="px-2 py-0.5 bg-rose-500/10 text-rose-400 rounded text-[10px]">%{c.discount}</span>}
                        {c.code && <span className="px-2 py-0.5 bg-blue-500/10 text-blue-400 rounded text-[10px]">{c.code}</span>}
                        <span className={'px-2 py-0.5 rounded text-[10px] ' + (c.status === 'active' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-gray-500/10 text-gray-400')}>{c.status === 'active' ? 'Aktif' : 'Pasif'}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 ml-3 flex-shrink-0">
                      <button onClick={() => toggleCampaign(c.id, c.status)} className={'p-1.5 rounded-lg hover:bg-white/5 transition-all ' + (c.status === 'active' ? 'text-amber-400 hover:text-amber-300' : 'text-emerald-400 hover:text-emerald-300')} title={c.status === 'active' ? 'Devre Disi Birak' : 'Aktiflestir'}>
                        {c.status === 'active' ? '🔴' : '🟢'}
                      </button>
                      <button onClick={() => deleteCampaign(c.id)} className="p-1.5 rounded-lg hover:bg-white/5 text-gray-500 hover:text-red-400 transition-all" title="Sil">🗑️</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {showCampaignForm && (
            <div className="bg-[#080b12]/60 border border-[#1a2332] rounded-xl p-4 space-y-3 mb-4">
              <h4 className="text-white text-sm font-semibold">Yeni Kampanya</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <input value={campaignTitle} onChange={e => setCampaignTitle(e.target.value)} placeholder="Kampanya adı" className="bg-[#080b12]/80 border border-[#1a2332] rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-pink-500/50" />
                <input value={campaignDiscount} onChange={e => setCampaignDiscount(e.target.value)} placeholder="İndirim %" className="bg-[#080b12]/80 border border-[#1a2332] rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-pink-500/50" />
              </div>
              <input value={campaignDesc} onChange={e => setCampaignDesc(e.target.value)} placeholder="Açıklama (AI'nin kampanyayı anlatması için)" className="w-full bg-[#080b12]/80 border border-[#1a2332] rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-pink-500/50" />
              <div className="flex gap-2">
                <button onClick={saveWebCampaign} className="px-4 py-2 bg-gradient-to-r from-pink-600 to-rose-500 text-white rounded-lg text-sm font-semibold hover:shadow-lg hover:shadow-pink-500/25 transition-all">Kaydet</button>
                <button onClick={() => setShowCampaignForm(false)} className="px-4 py-2 border border-[#1a2332] text-gray-400 rounded-lg text-sm hover:text-white transition-all">İptal</button>
              </div>
            </div>
          )}

          <button onClick={() => setShowCampaignForm(true)} className="w-full py-3 border-2 border-dashed border-[#1a2332] text-gray-500 rounded-xl text-sm hover:text-white hover:border-pink-500/30 transition-all flex items-center justify-center gap-2">
            <Plus size={16} /> Kampanya Ekle
          </button>
        </div>
      </div>
    </div>
  )
}
