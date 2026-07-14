'use client'
import { useState, useEffect } from 'react'
import { Check, X as XIcon, Loader2, Save } from 'lucide-react'

const ALL_MODULES = [
  { key: 'qr-menu', label: 'QR Menü', desc: 'Masa QR kodları ile sipariş alma', emoji: '📱' },
  { key: 'adisyon', label: 'Adisyon Sistemi', desc: 'Garson paneli ve yazıcı entegrasyonu', emoji: '🧾' },
  { key: 'orders', label: 'Sipariş Yönetimi', desc: 'Siparişleri takip etme ve yönetme', emoji: '📦' },
  { key: 'products', label: 'Ürün Yönetimi', desc: 'Ürün ekleme, düzenleme ve kategoriler', emoji: '🏷️' },
  { key: 'customers', label: 'Müşteri Yönetimi', desc: 'Müşteri takibi ve geçmiş siparişler', emoji: '👥' },
  { key: 'payments', label: 'Ödeme İşlemleri', desc: 'Sanal POS ve ödeme geçmişi', emoji: '💳' },
  { key: 'ai-chatbots', label: 'AI Chatbotlar', desc: 'Yapay zeka destekli sohbet botları', emoji: '🤖' },
  { key: 'analytics', label: 'Analitik & Raporlar', desc: 'Satış, müşteri ve stok raporları', emoji: '📊' },
  { key: 'chatbot-integrations', label: 'Chatbot Entegrasyonları', desc: "WhatsApp, Instagram, FB Messenger, Telegram bağlantısı", emoji: '🔗' },
  { key: 'kargo', label: 'Kargo Entegrasyonu', desc: 'Kargo takibi ve gönderi yönetimi', emoji: '🚚' },
  { key: 'messages', label: 'Mesajlaşma', desc: 'Müşteri mesajları ve bildirimler', emoji: '💬' },
  { key: 'settings', label: 'Ayarlar', desc: 'Mağaza ve sistem ayarları', emoji: '⚙️' },
]

export default function ModulesPage() {
  const [tenantId, setTenantId] = useState('')
  const [slug, setSlug] = useState('')
  const [features, setFeatures] = useState<Record<string, any>>({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    fetch('/api/tenants/me', { credentials: 'include' })
      .then(r => r.json())
      .then(t => {
        const tenant = t?.tenant || t
        setTenantId(tenant.id || '')
        setSlug(tenant.slug || '')
        const cfg = tenant.features || {}
        setFeatures(cfg)
      })
      .catch(() => setError('Bilgiler alınamadı'))
      .finally(() => setLoading(false))
  }, [])

  const toggle = (key: string) => {
    setFeatures(prev => ({ ...prev, [key]: !prev[key] }))
  }

  const save = async () => {
    if (!tenantId) return
    setSaving(true)
    setSaved(false)
    try {
      const res = await fetch(`/api/tenants/${tenantId}/theme`, {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ features }),
      })
      if (!res.ok) throw new Error('Kaydedilemedi')
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } catch (e: any) {
      setError(e.message || 'Hata')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <div className="flex items-center justify-center min-h-[400px]"><Loader2 className="w-6 h-6 text-blue-400 animate-spin" /></div>

  const enabledCount = Object.values(features).filter(Boolean).length

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Modüller</h1>
          <p className="text-sm text-gray-500 mt-1">{slug} — {enabledCount}/{ALL_MODULES.length} modül aktif</p>
        </div>
        <button onClick={save} disabled={saving || !tenantId} className="px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-xl text-sm font-medium hover:shadow-lg hover:shadow-blue-500/25 transition-all disabled:opacity-50 flex items-center gap-2">
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          {saving ? 'Kaydediliyor...' : 'Kaydet'}
        </button>
      </div>

      {saved && <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl px-4 py-3"><p className="text-emerald-400 text-xs">✓ Kaydedildi</p></div>}
      {error && <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3"><p className="text-red-400 text-xs">{error}</p></div>}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {ALL_MODULES.map(mod => {
          const active = features[mod.key] !== false
          return (
            <div key={mod.key} onClick={() => toggle(mod.key)} className={`relative bg-[#0d1117]/80 backdrop-blur-xl border rounded-2xl p-5 cursor-pointer transition-all hover:shadow-lg ${active ? 'border-emerald-500/20 hover:border-emerald-500/40' : 'border-[#1a2332] hover:border-gray-600'}`}>
              <div className="flex items-start justify-between mb-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg border ${active ? 'border-emerald-500/20' : 'border-[#1a2332]'}" style={{ backgroundColor: active ? 'rgba(52,211,153,0.1)' : 'rgba(255,255,255,0.03)' }}>{mod.emoji}</div>
                <div className={`w-5 h-5 rounded-lg border-2 flex items-center justify-center transition-all ${active ? 'bg-emerald-500 border-emerald-500' : 'border-gray-600'}`}>
                  {active && <Check className="w-3 h-3 text-white" />}
                </div>
              </div>
              <h3 className="text-sm font-semibold text-white mb-1">{mod.label}</h3>
              <p className="text-xs text-gray-500 leading-relaxed">{mod.desc}</p>
            </div>
          )
        })}
      </div>

      <div className="bg-[#0d1117]/80 backdrop-blur-xl border border-[#1a2332] rounded-2xl p-5 space-y-4">
        <h3 className="text-sm font-semibold text-white">AI Mesaj Limiti</h3>
        <p className="text-xs text-gray-500">WhatsApp ve Instagram AI yanıtları için aylık mesaj limiti. 0 = limitsiz.</p>
        <div className="flex items-center gap-3">
          <input type="number" min={0} step={100} value={features.messageLimit ?? 0} onChange={e => setFeatures(prev => ({ ...prev, messageLimit: parseInt(e.target.value) || 0 }))}
            className="w-32 bg-[#1a2332] border border-[#2a3a52] rounded-xl px-4 py-2.5 text-white text-sm outline-none focus:border-blue-500/50" />
          <span className="text-xs text-gray-500">mesaj / ay</span>
        </div>
      </div>

      <div className="bg-[#0d1117]/80 backdrop-blur-xl border border-[#1a2332] rounded-2xl p-5">
        <h3 className="text-sm font-semibold text-white mb-3">Modül Hakkında</h3>
        <div className="space-y-2 text-xs text-gray-400">
          <p>• Aktif modüller işletmenizin panelde göreceği özellikleri belirler</p>
          <p>• Pasif modüller menüden gizlenir, kullanıcılar tarafından görülmez</p>
          <p>• Garson rollü kullanıcılar sadece Adisyon, Sipariş ve Ürün modüllerini görür</p>
        </div>
      </div>
    </div>
  )
}
