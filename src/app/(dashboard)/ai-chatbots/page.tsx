export default function AiChatbotsPage() {
  const bots = [
    { name: 'Musteri Hizmetleri', status: 'Aktif', conversations: 1234, accuracy: 96, model: 'GPT-4' },
    { name: 'Siparis Asistani', status: 'Aktif', conversations: 892, accuracy: 94, model: 'GPT-4' },
    { name: 'Destek Chatbot', status: 'Bakim', conversations: 456, accuracy: 91, model: 'GPT-3.5' },
    { name: 'Rezervasyon Asistani', status: 'Aktif', conversations: 678, accuracy: 97, model: 'GPT-4' },
    { name: 'Geri Bildirim', status: 'Pasif', conversations: 123, accuracy: 89, model: 'GPT-3.5' },
    { name: 'SSS Chatbot', status: 'Aktif', conversations: 2341, accuracy: 93, model: 'GPT-4' },
  ]
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold text-white">AI Chatbotlar</h1><p className="text-sm text-gray-500 mt-1">Aktif: 1,423 chatbot</p></div>
        <button className="px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-xl text-sm font-medium hover:shadow-lg hover:shadow-blue-500/20 transition-all">+ Yeni Chatbot</button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {bots.map((b,i)=>(
          <div key={i} className="bg-[#0d1117]/80 backdrop-blur-xl border border-[#1a2332] rounded-2xl p-5 hover:border-blue-500/30 transition-all group cursor-pointer">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-lg text-blue-400">✦</div>
              <span className={'px-2 py-0.5 rounded-full text-xs font-medium border '+(b.status==='Aktif'?'bg-emerald-500/10 text-emerald-400 border-emerald-500/20':b.status==='Bakim'?'bg-amber-500/10 text-amber-400 border-amber-500/20':'bg-red-500/10 text-red-400 border-red-500/20')}>{b.status}</span>
            </div>
            <h3 className="text-white font-semibold mb-1">{b.name}</h3>
            <p className="text-xs text-gray-500 mb-3">Model: {b.model}</p>
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-400"><span className="text-white font-medium">{b.conversations.toLocaleString()}</span> konusma</span>
              <span className="text-emerald-400">{b.accuracy}% dogruluk</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}