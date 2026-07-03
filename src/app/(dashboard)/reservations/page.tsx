export default function ReservationsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold text-white">Rezervasyonlar</h1><p className="text-sm text-gray-500 mt-1">Bugun: 42 rezervasyon</p></div>
        <button className="px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-xl text-sm font-medium hover:shadow-lg hover:shadow-blue-500/20 transition-all">+ Yeni Rezervasyon</button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Bekleyen', value: '18', color: 'amber' },
          { label: 'Onaylanan', value: '92', color: 'emerald' },
          { label: 'Iptal', value: '8', color: 'red' },
          { label: 'Bugun', value: '42', color: 'blue' },
        ].map((s,i)=>(
          <div key={i} className="bg-[#0d1117]/80 backdrop-blur-xl border border-[#1a2332] rounded-2xl p-5">
            <p className="text-xs text-gray-500 uppercase tracking-wider">{s.label}</p>
            <p className={'text-2xl font-bold mt-1 text-'+s.color+'-400'}>{s.value}</p>
          </div>
        ))}
      </div>
      <div className="bg-[#0d1117]/80 backdrop-blur-xl border border-[#1a2332] rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="border-b border-[#1a2332]">{['Musteri','Tarih','Saat','Kisi Sayisi','Masa','Durum'].map(h=><th key={h} className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{h}</th>)}</tr></thead>
            <tbody className="divide-y divide-[#1a2332]">
              {[
                {name:'Ahmet Y.',date:'2025-01-15',time:'19:30',guests:4,table:'7',status:'Onaylandi'},
                {name:'Zeynep K.',date:'2025-01-15',time:'20:00',guests:2,table:'3',status:'Bekliyor'},
                {name:'Mehmet D.',date:'2025-01-16',time:'18:45',guests:6,table:'12',status:'Onaylandi'},
                {name:'Ayse Y.',date:'2025-01-16',time:'21:00',guests:3,table:'5',status:'Iptal'},
              ].map((r,i)=>(
                <tr key={i} className="hover:bg-white/[0.02] transition-colors">
                  <td className="px-4 py-3 text-white font-medium">{r.name}</td>
                  <td className="px-4 py-3 text-gray-300">{r.date}</td>
                  <td className="px-4 py-3 text-gray-300">{r.time}</td>
                  <td className="px-4 py-3 text-gray-300">{r.guests}</td>
                  <td className="px-4 py-3 text-gray-300">Masa {r.table}</td>
                  <td className="px-4 py-3"><span className={'px-2.5 py-0.5 rounded-full text-xs font-medium border '+(r.status==='Onaylandi'?'bg-emerald-500/10 text-emerald-400 border-emerald-500/20':r.status==='Bekliyor'?'bg-amber-500/10 text-amber-400 border-amber-500/20':'bg-red-500/10 text-red-400 border-red-500/20')}>{r.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}