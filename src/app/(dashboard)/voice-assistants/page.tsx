export default function VoiceAssistantsPage() {
  const assistants = [
    { name: 'Siparis Asistani', calls: 2341, duration: '3:24', satisfaction: 4.8, lang: 'TR' },
    { name: 'Rezervasyon Asistani', calls: 1456, duration: '2:15', satisfaction: 4.6, lang: 'TR' },
    { name: 'Destek Asistani', calls: 892, duration: '5:42', satisfaction: 4.3, lang: 'TR/EN' },
    { name: 'Geri Bildirim Asistani', calls: 567, duration: '1:58', satisfaction: 4.7, lang: 'TR' },
  ]
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold text-white">Sesli AI Asistanlar</h1><p className="text-sm text-gray-500 mt-1">Aktif: 36 sesli asistan</p></div>
        <button className="px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-xl text-sm font-medium hover:shadow-lg hover:shadow-blue-500/20 transition-all">+ Yeni Asistan</button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {assistants.map((a,i)=>(
          <div key={i} className="bg-[#0d1117]/80 backdrop-blur-xl border border-[#1a2332] rounded-2xl p-5 hover:border-violet-500/30 transition-all group cursor-pointer">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-violet-500/10 flex items-center justify-center text-lg text-violet-400">♢</div>
              <div><h3 className="text-white font-semibold">{a.name}</h3><p className="text-xs text-gray-500">{a.lang}</p></div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center p-3 rounded-xl bg-white/[0.02]"><p className="text-lg font-bold text-white">{a.calls.toLocaleString()}</p><p className="text-xs text-gray-500">Toplam Cagri</p></div>
              <div className="text-center p-3 rounded-xl bg-white/[0.02]"><p className="text-lg font-bold text-white">{a.duration}</p><p className="text-xs text-gray-500">Ort. Sure</p></div>
              <div className="text-center p-3 rounded-xl bg-white/[0.02]"><p className="text-lg font-bold text-emerald-400">{a.satisfaction}</p><p className="text-xs text-gray-500">Memnuniyet</p></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}