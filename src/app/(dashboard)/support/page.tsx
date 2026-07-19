'use client'
import { Headphones, MessageCircle, Mail, CheckCircle } from 'lucide-react'

export default function SupportPage() {
  return (
    <div className="space-y-6 pb-12">
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#0f1420] via-[#0d1117] to-[#0a0e14] border border-[#1a2332] p-6 lg:p-8">
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl" />
        <div className="relative flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/20"><Headphones size={24} className="text-white" /></div>
          <div><h1 className="text-xl font-bold text-white">7/24 Destek</h1><p className="text-sm text-gray-500 mt-0.5">Kurulum ve teknik destek</p></div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-[#0d1117]/80 backdrop-blur-xl border border-[#1a2332] rounded-2xl p-6 space-y-4">
          <h3 className="text-white font-semibold">İletişim Kanalları</h3>
          <div className="flex items-center gap-3 p-3 rounded-xl bg-[#080b12]/60 border border-[#1a2332]">
            <MessageCircle size={18} className="text-green-400" />
            <div><p className="text-xs text-gray-500">WhatsApp</p><p className="text-sm text-white font-medium">+90 544 256 6476</p></div>
          </div>
          <div className="flex items-center gap-3 p-3 rounded-xl bg-[#080b12]/60 border border-[#1a2332]">
            <Mail size={18} className="text-purple-400" />
            <div><p className="text-xs text-gray-500">E-posta</p><p className="text-sm text-white font-medium">bruskappdestek@gmail.com</p></div>
          </div>
        </div>

        <div className="bg-[#0d1117]/80 backdrop-blur-xl border border-[#1a2332] rounded-2xl p-6 space-y-4">
          <h3 className="text-white font-semibold">Kurulum Adımları</h3>
          {[
            { step: '1', title: 'Hesap Oluşturma', desc: 'Admin panelinizi oluşturun ve giriş yapın' },
            { step: '2', title: 'Platform Entegrasyonu', desc: 'WhatsApp, Instagram vb. platformları bağlayın' },
            { step: '3', title: 'AI Asistan Ayarları', desc: 'Chatbot ayarlarını yapılandırın ve kampanyaları ekleyin' },
            { step: '4', title: 'Test ve Yayına Alma', desc: 'Mesajlaşma testi yapın ve sistemi aktifleştirin' },
          ].map((item, i) => (
            <div key={i} className="flex items-start gap-3">
              <div className="w-7 h-7 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center flex-shrink-0 mt-0.5"><span className="text-xs font-bold text-emerald-400">{item.step}</span></div>
              <div><p className="text-sm text-white font-medium">{item.title}</p><p className="text-xs text-gray-500 mt-0.5">{item.desc}</p></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
