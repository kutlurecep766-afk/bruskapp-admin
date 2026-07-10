'use client'
import { useState } from 'react'
import { Check, ExternalLink, Crown, Loader2 } from 'lucide-react'

const DODO_CHECKOUT_URL = 'https://checkout.dodopayments.com/pay/pdt_0NisD0fIY6VpqQLWE2UDh'

const PLANS = [
  {
    name: 'Başlangıç',
    price: '0',
    currency: 'TL',
    period: '/ay',
    desc: 'Küçük işletmeler için temel özellikler',
    features: ['QR Menü', 'Adisyon Sistemi', 'Sipariş Yönetimi', 'Müşteri Yönetimi', 'E-Fatura'],
    cta: 'Ücretsiz',
    popular: false,
    emoji: '🚀',
  },
  {
    name: 'Profesyonel',
    price: '2.999',
    currency: 'TL',
    period: '/ay',
    desc: 'Büyüyen işletmeler için tam çözüm',
    features: [
      'Tüm Başlangıç özellikleri',
      'AI Chatbotlar (WhatsApp & Instagram)',
      'Pazaryeri Entegrasyonu (Trendyol, HB, n11)',
      'Stok & Fiyat Senkronizasyonu',
      'WhatsApp & Instagram Mesajlaşma',
      'Kargo Entegrasyonu',
      'Gelişmiş Analitik & Raporlar',
      'Öncelikli Destek',
    ],
    cta: 'Satın Al',
    popular: true,
    emoji: '👑',
  },
  {
    name: 'Kurumsal',
    price: 'Özel',
    currency: '',
    period: '',
    desc: 'Büyük ölçekli işletmeler için özel çözüm',
    features: ['Tüm Profesyonel özellikleri', 'Özel entegrasyonlar', 'SLA garantisi', 'Özel API erişimi', '7/24 öncelikli destek', 'Özel fiyatlandırma'],
    cta: 'İletişime Geç',
    popular: false,
    emoji: '🏢',
  },
]

export default function PricingPage() {
  const [loading, setLoading] = useState(false)
  const [selected, setSelected] = useState<string | null>(null)

  const handlePurchase = async (planName: string) => {
    if (planName === 'Başlangıç') return
    if (planName === 'Kurumsal') {
      window.location.href = 'mailto:info@bruskapp.com'
      return
    }
    setSelected(planName)
    setLoading(true)
    window.open(DODO_CHECKOUT_URL, '_blank')
    setTimeout(() => setLoading(false), 2000)
  }

  return (
    <div className="space-y-8">
      <div className="text-center max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-white">Fiyatlandırma</h1>
        <p className="text-gray-500 mt-2 text-sm">İşletmenize uygun planı seçin, ihtiyacınız olan tüm özelliklere erişin</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
        {PLANS.map(p => (
          <div key={p.name} className={`relative bg-[#0d1117]/80 backdrop-blur-xl border rounded-2xl p-6 flex flex-col transition-all hover:shadow-xl ${p.popular ? 'border-violet-500/40 shadow-lg shadow-violet-500/10' : 'border-[#1a2332] hover:border-gray-600'}`}>
            {p.popular && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-gradient-to-r from-violet-600 to-violet-500 rounded-full text-xs font-semibold text-white shadow-lg shadow-violet-500/30 flex items-center gap-1">
                <Crown size={12} /> En Popüler
              </div>
            )}

            <div className="text-center mb-6 pt-2">
              <span className="text-3xl">{p.emoji}</span>
              <h2 className="text-lg font-bold text-white mt-2">{p.name}</h2>
              <p className="text-xs text-gray-500 mt-1">{p.desc}</p>
            </div>

            <div className="text-center mb-6">
              <span className="text-4xl font-extrabold text-white">{p.price}</span>
              {p.currency && <span className="text-xl font-semibold text-gray-400 ml-1">{p.currency}</span>}
              {p.period && <span className="text-sm text-gray-500 ml-1">{p.period}</span>}
            </div>

            <ul className="space-y-2.5 mb-8 flex-1">
              {p.features.map((f, i) => (
                <li key={i} className="flex items-start gap-2.5 text-sm">
                  <Check size={14} className="text-emerald-400 mt-0.5 shrink-0" />
                  <span className="text-gray-300">{f}</span>
                </li>
              ))}
            </ul>

            <button
              onClick={() => handlePurchase(p.name)}
              disabled={loading && selected === p.name}
              className={`w-full py-3 rounded-xl text-sm font-semibold transition-all flex items-center justify-center gap-2 ${p.popular ? 'bg-gradient-to-r from-violet-600 to-violet-500 text-white hover:shadow-lg hover:shadow-violet-500/25' : 'bg-[#1a2332] text-gray-300 hover:bg-[#2a3a52] border border-[#2a3a52]'} ${p.name === 'Başlangıç' ? 'opacity-60 cursor-default' : ''}`}
            >
              {loading && selected === p.name ? <Loader2 size={14} className="animate-spin" /> : null}
              {p.cta}
              {p.name !== 'Başlangıç' && <ExternalLink size={14} />}
            </button>
          </div>
        ))}
      </div>

      <div className="text-center text-xs text-gray-600 max-w-lg mx-auto">
        <p>Profesyonel paket satın alırken Dodo Payments güvenli ödeme sayfasına yönlendirilirsiniz.</p>
        <p className="mt-1">Ödeme tamamlandıktan sonra hesabınız otomatik olarak güncellenecektir.</p>
      </div>
    </div>
  )
}
