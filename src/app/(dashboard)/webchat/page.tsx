'use client'
import { useState, useEffect } from 'react'
import { MessageCircle, Plus, Trash2, Save } from 'lucide-react'

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
}

export default function WebchatPage() {
  const [config, setConfig] = useState<Config | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
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
    <div className="space-y-6 max-w-4xl">
      <div className="relative rounded-2xl overflow-hidden border border-[#1a2332]">
        <img
          src="https://images.unsplash.com/photo-1553877522-43269d4ea984?w=1200&h=300&fit=crop"
          alt="Chatbot"
          className="w-full h-36 sm:h-48 object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0a0e14]/90 via-[#0a0e14]/60 to-transparent flex items-center px-8">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2.5 rounded-xl bg-blue-600/20 border border-blue-500/20">
                <MessageCircle size={22} className="text-blue-400" />
              </div>
              <h1 className="text-2xl font-bold text-white">Chatbot Ayarları</h1>
            </div>
            <p className="text-gray-400 text-sm max-w-lg leading-relaxed">
              Web sitenizdeki yapay zeka asistanını tamamen size özel şekillendirin.
              Aşağıdaki formu kullanarak işletme bilgilerinizi, ürünlerinizi ve SSS'leri ekleyin.
              <span className="block mt-1 text-blue-400 font-medium">Buradan yazarak projeniz hakkında tüm bilgileri, her şeyi halledebilirsiniz.</span>
            </p>
          </div>
        </div>
        <div className="absolute top-4 right-4">
          <button onClick={save} disabled={saving} className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-xl text-sm font-medium hover:shadow-lg hover:shadow-blue-500/25 transition-all disabled:opacity-50 shadow-lg shadow-blue-500/10">
            {saving ? 'Kaydediliyor...' : <><Save size={16} /> Kaydet</>}
          </button>
        </div>
      </div>

      {saved && <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl px-4 py-3 text-emerald-400 text-sm">Kaydedildi!</div>}

      <div className="glass rounded-2xl border border-[#1a2332] p-6 space-y-5">
        <h2 className="text-white font-semibold">İşletme Bilgileri</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-xs text-gray-500 block mb-1.5">İşletme Adı</label>
            <input type="text" value={config.businessName} onChange={e => update('businessName', e.target.value)} className="w-full bg-[#080b12]/80 border border-[#1a2332] rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-blue-500/50" />
          </div>
          <div>
            <label className="text-xs text-gray-500 block mb-1.5">E-posta</label>
            <input type="email" value={config.email} onChange={e => update('email', e.target.value)} className="w-full bg-[#080b12]/80 border border-[#1a2332] rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-blue-500/50" />
          </div>
          <div>
            <label className="text-xs text-gray-500 block mb-1.5">Telefon</label>
            <input type="text" value={config.phone} onChange={e => update('phone', e.target.value)} className="w-full bg-[#080b12]/80 border border-[#1a2332] rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-blue-500/50" />
          </div>
          <div>
            <label className="text-xs text-gray-500 block mb-1.5">Çalışma Saatleri</label>
            <input type="text" value={config.hours} onChange={e => update('hours', e.target.value)} className="w-full bg-[#080b12]/80 border border-[#1a2332] rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-blue-500/50" />
          </div>
          <div className="md:col-span-2">
            <label className="text-xs text-gray-500 block mb-1.5">Adres</label>
            <input type="text" value={config.address} onChange={e => update('address', e.target.value)} className="w-full bg-[#080b12]/80 border border-[#1a2332] rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-blue-500/50" />
          </div>
          <div className="md:col-span-2">
            <label className="text-xs text-gray-500 block mb-1.5">Açıklama</label>
            <textarea value={config.description} onChange={e => update('description', e.target.value)} rows={2} className="w-full bg-[#080b12]/80 border border-[#1a2332] rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-blue-500/50 resize-none" />
          </div>
          <div className="md:col-span-2">
            <label className="text-xs text-gray-500 block mb-1.5">Karşılama Mesajı</label>
            <textarea value={config.welcomeMessage} onChange={e => update('welcomeMessage', e.target.value)} rows={2} className="w-full bg-[#080b12]/80 border border-[#1a2332] rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-blue-500/50 resize-none" />
          </div>
          <div className="md:col-span-2">
            <label className="text-xs text-gray-500 block mb-1.5">Sistem Promptu</label>
            <textarea value={config.systemPrompt} onChange={e => update('systemPrompt', e.target.value)} rows={2} className="w-full bg-[#080b12]/80 border border-[#1a2332] rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-blue-500/50 resize-none" />
          </div>
        </div>
      </div>

      <div className="glass rounded-2xl border border-[#1a2332] p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-white font-semibold">Ürün / Hizmetler</h2>
          <button onClick={addProduct} className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600/20 text-blue-400 rounded-lg text-xs font-medium hover:bg-blue-600/30 transition-all"><Plus size={14} /> Ekle</button>
        </div>
        <div className="space-y-3">
          {config.products.map((p, i) => (
            <div key={i} className="flex gap-3 items-start bg-[#080b12]/50 rounded-xl p-3 border border-[#1a2332]">
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

      <div className="glass rounded-2xl border border-[#1a2332] p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-white font-semibold">SSS (Sık Sorulan Sorular)</h2>
          <button onClick={addFaq} className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600/20 text-blue-400 rounded-lg text-xs font-medium hover:bg-blue-600/30 transition-all"><Plus size={14} /> Ekle</button>
        </div>
        <div className="space-y-3">
          {config.faqs.map((f, i) => (
            <div key={i} className="flex gap-3 items-start bg-[#080b12]/50 rounded-xl p-3 border border-[#1a2332]">
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
  )
}
