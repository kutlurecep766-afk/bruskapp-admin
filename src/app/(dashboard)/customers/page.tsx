export default function CustomersPage() {
  const customers = [
    { name: 'Ahmet Yilmaz', email: 'ahmet@email.com', company: 'ABC Restoran', plan: 'Premium', status: 'Aktif', since: '2024' },
    { name: 'Zeynep Kaya', email: 'zeynep@email.com', company: 'ZL Kafe', plan: 'Profesyonel', status: 'Aktif', since: '2024' },
    { name: 'Mehmet Demir', email: 'mehmet@email.com', company: 'MD Catering', plan: 'Baslangic', status: 'Pasif', since: '2025' },
    { name: 'Ayse Yildiz', email: 'ayse@email.com', company: 'AY Restoran', plan: 'Premium', status: 'Aktif', since: '2023' },
    { name: 'Ali Ozturk', email: 'ali@email.com', company: 'AO Lokanta', plan: 'Profesyonel', status: 'Aktif', since: '2024' },
  ]
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold text-white">Musteriler</h1><p className="text-sm text-gray-500 mt-1">Toplam 2,847 musteri</p></div>
        <button className="px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-xl text-sm font-medium hover:shadow-lg hover:shadow-blue-500/20 transition-all">+ Yeni Musteri</button>
      </div>
      <div className="bg-[#0d1117]/80 backdrop-blur-xl border border-[#1a2332] rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="border-b border-[#1a2332]">{['Musteri','E-posta','Sirket','Plan','Durum','Kayit'].map(h=><th key={h} className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{h}</th>)}</tr></thead>
            <tbody className="divide-y divide-[#1a2332]">{customers.map((c,i)=>(
              <tr key={i} className="hover:bg-white/[0.02] transition-colors">
                <td className="px-4 py-3"><div className="flex items-center gap-3"><div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white text-xs font-bold">{c.name[0]}</div><span className="text-white font-medium">{c.name}</span></div></td>
                <td className="px-4 py-3 text-gray-400">{c.email}</td>
                <td className="px-4 py-3 text-gray-300">{c.company}</td>
                <td className="px-4 py-3"><span className={'px-2.5 py-0.5 rounded-full text-xs font-medium border ' + (c.plan==='Premium'?'bg-violet-500/10 text-violet-400 border-violet-500/20':c.plan==='Profesyonel'?'bg-blue-500/10 text-blue-400 border-blue-500/20':'bg-gray-500/10 text-gray-400 border-gray-500/20')}>{c.plan}</span></td>
                <td className="px-4 py-3"><span className={'px-2.5 py-0.5 rounded-full text-xs font-medium border ' + (c.status==='Aktif'?'bg-emerald-500/10 text-emerald-400 border-emerald-500/20':'bg-red-500/10 text-red-400 border-red-500/20')}>{c.status}</span></td>
                <td className="px-4 py-3 text-gray-400">{c.since}</td>
              </tr>
            ))}</tbody>
          </table>
        </div>
      </div>
    </div>
  )
}