export default function OrdersPage() {
  const orders = [
    { id: '#2401', customer: 'Ahmet Y.', items: 'Kebap, Ayran', total: '340', status: 'Tamamlandi', time: '2 dk', method: 'Kredi Karti' },
    { id: '#2400', customer: 'Zeynep K.', items: 'Lahmacun x2', total: '180', status: 'Hazirlaniyor', time: '15 dk', method: 'Nakit' },
    { id: '#2399', customer: 'Mehmet D.', items: 'Pizza, Kola', total: '420', status: 'Tamamlandi', time: '28 dk', method: 'Kredi Karti' },
    { id: '#2398', customer: 'Ayse Y.', items: 'Doner, Ayran', total: '260', status: 'Bekliyor', time: '45 dk', method: 'Havale' },
    { id: '#2397', customer: 'Ali O.', items: 'Iskender', total: '310', status: 'Iptal', time: '1 sa', method: 'Kredi Karti' },
  ]
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold text-white">Siparisler</h1><p className="text-sm text-gray-500 mt-1">Bugun: 156 siparis</p></div>
        <div className="flex gap-2">
          <button className="px-4 py-2 border border-[#1a2332] text-gray-300 rounded-xl text-sm hover:border-blue-500/50 transition-all">Filtrele</button>
          <button className="px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-xl text-sm font-medium hover:shadow-lg hover:shadow-blue-500/20 transition-all">+ Yeni Siparis</button>
        </div>
      </div>
      <div className="bg-[#0d1117]/80 backdrop-blur-xl border border-[#1a2332] rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="border-b border-[#1a2332]">{['Siparis','Musteri','Urunler','Tutar','Odeme','Durum','Sure'].map(h=><th key={h} className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{h}</th>)}</tr></thead>
            <tbody className="divide-y divide-[#1a2332]">
              {orders.map((o,i)=>(
                <tr key={i} className="hover:bg-white/[0.02] transition-colors">
                  <td className="px-4 py-3 text-white font-medium">{o.id}</td>
                  <td className="px-4 py-3 text-gray-300">{o.customer}</td>
                  <td className="px-4 py-3 text-gray-300">{o.items}</td>
                  <td className="px-4 py-3 text-white">₺{o.total}</td>
                  <td className="px-4 py-3 text-gray-400">{o.method}</td>
                  <td className="px-4 py-3"><span className={'px-2.5 py-0.5 rounded-full text-xs font-medium border '+(o.status==='Tamamlandi'?'bg-emerald-500/10 text-emerald-400 border-emerald-500/20':o.status==='Hazirlaniyor'?'bg-amber-500/10 text-amber-400 border-amber-500/20':o.status==='Iptal'?'bg-red-500/10 text-red-400 border-red-500/20':'bg-blue-500/10 text-blue-400 border-blue-500/20')}>{o.status}</span></td>
                  <td className="px-4 py-3 text-gray-400">{o.time}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}