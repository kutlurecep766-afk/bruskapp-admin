'use client'
import { useState, useEffect } from 'react'
import { CreditCard, ExternalLink } from 'lucide-react'

export default function PaymentsPage() {
  const [transactions, setTransactions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/payments/transactions', { credentials: 'include' })
      .then(r => r.json())
      .then(data => { setTransactions(Array.isArray(data) ? data : []); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  const formatAmount = (amount: number) => `₺${(amount / 100).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`
  const formatDate = (d: string) => new Date(d).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })

  const statusStyles: Record<string, string> = {
    pending: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    success: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    failed: 'bg-red-500/10 text-red-400 border-red-500/20',
  }
  const statusLabels: Record<string, string> = { pending: 'Bekliyor', success: 'Başarılı', failed: 'Başarısız' }

  const totalRevenue = transactions.filter(t => t.status === 'success').reduce((s, t) => s + t.amount, 0)
  const pendingTotal = transactions.filter(t => t.status === 'pending').reduce((s, t) => s + t.amount, 0)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold text-white">Ödeme Yönetimi</h1><p className="text-sm text-gray-500 mt-1">Tüm işlemler</p></div>
        <a href="/brk-mgmt/virtual-pos" className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-xl text-sm font-medium hover:shadow-lg hover:shadow-blue-500/20 transition-all"><CreditCard size={16} />Sanal POS Ayarları</a>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-[#0d1117]/80 backdrop-blur-xl border border-[#1a2332] rounded-2xl p-5">
          <p className="text-xs text-gray-500 uppercase tracking-wider">Toplam Gelir</p>
          <p className="text-2xl font-bold text-white mt-1">{formatAmount(totalRevenue)}</p>
        </div>
        <div className="bg-[#0d1117]/80 backdrop-blur-xl border border-[#1a2332] rounded-2xl p-5">
          <p className="text-xs text-gray-500 uppercase tracking-wider">İşlem Sayısı</p>
          <p className="text-2xl font-bold text-white mt-1">{transactions.length}</p>
        </div>
        <div className="bg-[#0d1117]/80 backdrop-blur-xl border border-[#1a2332] rounded-2xl p-5">
          <p className="text-xs text-gray-500 uppercase tracking-wider">Bekleyen</p>
          <p className="text-2xl font-bold text-amber-400 mt-1">{formatAmount(pendingTotal)}</p>
        </div>
        <div className="bg-[#0d1117]/80 backdrop-blur-xl border border-[#1a2332] rounded-2xl p-5">
          <p className="text-xs text-gray-500 uppercase tracking-wider">Başarılı Oranı</p>
          <p className="text-2xl font-bold text-white mt-1">{transactions.length > 0 ? Math.round(transactions.filter(t => t.status === 'success').length / transactions.length * 100) : 0}%</p>
        </div>
      </div>
      <div className="bg-[#0d1117]/80 backdrop-blur-xl border border-[#1a2332] rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="border-b border-[#1a2332]">{['İşlem No', 'Müşteri', 'Tutar', 'Açıklama', 'Tarih', 'Durum'].map(h => <th key={h} className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{h}</th>)}</tr></thead>
            <tbody className="divide-y divide-[#1a2332]">
              {loading ? (
                <tr><td colSpan={6} className="px-4 py-8 text-center text-gray-500">Yükleniyor...</td></tr>
              ) : transactions.length === 0 ? (
                <tr><td colSpan={6} className="px-4 py-8 text-center text-gray-500">Henüz işlem yok</td></tr>
              ) : transactions.map((tx, i) => (
                <tr key={tx.id || i} className="hover:bg-white/[0.02] transition-colors">
                  <td className="px-4 py-3 text-white font-medium font-mono text-xs">{tx.merchantOid}</td>
                  <td className="px-4 py-3 text-gray-300">{tx.customerName || tx.customerEmail || '-'}</td>
                  <td className="px-4 py-3 text-white font-medium">{formatAmount(tx.amount)}</td>
                  <td className="px-4 py-3 text-gray-400 max-w-[200px] truncate">{tx.description || '-'}</td>
                  <td className="px-4 py-3 text-gray-400">{formatDate(tx.createdAt)}</td>
                  <td className="px-4 py-3">
                    <span className={'px-2.5 py-0.5 rounded-full text-xs font-medium border ' + (statusStyles[tx.status] || 'bg-gray-500/10 text-gray-400 border-gray-500/20')}>
                      {statusLabels[tx.status] || tx.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
