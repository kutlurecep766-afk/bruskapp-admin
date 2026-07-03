export default function AnalyticsPage() {
  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-bold text-white">Analitik</h1><p className="text-sm text-gray-500 mt-1">Detayli istatistik ve raporlar</p></div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-[#0d1117]/80 backdrop-blur-xl border border-[#1a2332] rounded-2xl p-6">
          <h3 className="text-white font-semibold mb-4">Aylik Buyume</h3>
          <div className="space-y-3">
            {[{ label: 'Musteri Artisi', value: '%18.5', progress: 85 },{ label: 'Gelir Artisi', value: '%23.1', progress: 92 },{ label: 'AI Kullanim Artisi', value: '%31.2', progress: 78 },{ label: 'QR Menu Artisi', value: '%15.8', progress: 65 }].map((m,i)=>(
              <div key={i}>
                <div className="flex items-center justify-between mb-1"><span className="text-sm text-gray-400">{m.label}</span><span className="text-sm text-white font-semibold">{m.value}</span></div>
                <div className="h-2 bg-[#1a2332] rounded-full overflow-hidden"><div className="h-full rounded-full bg-gradient-to-r from-blue-600 to-blue-400" style={{width:m.progress+'%'}} /></div>
              </div>
            ))}
          </div>
        </div>
        <div className="bg-[#0d1117]/80 backdrop-blur-xl border border-[#1a2332] rounded-2xl p-6">
          <h3 className="text-white font-semibold mb-4">Populer Zamanlar</h3>
          <div className="space-y-3">
            {[{ time: '09:00 - 12:00', orders: 312, percent: 75 },{ time: '12:00 - 15:00', orders: 523, percent: 100 },{ time: '15:00 - 18:00', orders: 234, percent: 55 },{ time: '18:00 - 21:00', orders: 456, percent: 88 },{ time: '21:00 - 00:00', orders: 198, percent: 42 }].map((t,i)=>(
              <div key={i} className="flex items-center gap-4">
                <span className="text-sm text-gray-400 w-24">{t.time}</span>
                <div className="flex-1 h-2 bg-[#1a2332] rounded-full overflow-hidden"><div className="h-full rounded-full bg-gradient-to-r from-violet-600 to-violet-400" style={{width:t.percent+'%'}} /></div>
                <span className="text-sm text-white font-medium w-16 text-right">{t.orders}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { label: 'Toplam Ziyaret', value: '45,234', icon: '◉', color: 'blue' },
          { label: 'Ort. Oturum', value: '4m 32s', icon: '◈', color: 'emerald' },
          { label: 'Hemen Cikma', value: '32.4%', icon: '◇', color: 'amber' },
        ].map((s,i)=>(
          <div key={i} className="bg-[#0d1117]/80 backdrop-blur-xl border border-[#1a2332] rounded-2xl p-5">
            <div className="flex items-center gap-3 mb-2">
              <div className={'w-10 h-10 rounded-xl bg-'+s.color+'-500/10 flex items-center justify-center text-lg text-'+s.color+'-400'}>{s.icon}</div>
              <p className="text-xs text-gray-500 uppercase">{s.label}</p>
            </div>
            <p className="text-2xl font-bold text-white">{s.value}</p>
          </div>
        ))}
      </div>
    </div>
  )
}