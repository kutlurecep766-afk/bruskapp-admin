'use client'
import { useState, useEffect } from 'react'
import { Plus, Trash2, Save, Megaphone, Send, RefreshCw, Target, Percent, Tag } from 'lucide-react'

export default function CampaignsPage() {
  const [campaigns, setCampaigns] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ title: '', description: '', type: 'discount', discount: '', code: '', target: 'all', status: 'active' })

  useEffect(() => {
    fetch('/api/campaigns', { credentials: 'include' })
      .then(r => r.ok ? r.json() : [])
      .then(d => { setCampaigns(d); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  const save = async () => {
    const res = await fetch('/api/campaigns', {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'include',
      body: JSON.stringify({ ...form, discount: form.discount ? parseInt(form.discount) : null }),
    })
    if (res.ok) { setShowForm(false); setForm({ title: '', description: '', type: 'discount', discount: '', code: '', target: 'all', status: 'active' }); window.location.reload() }
  }

  const remove = async (id: string) => {
    if (!confirm('Kampanyayi silmek istediginize emin misiniz?')) return
    await fetch('/api/campaigns/' + id, { method: 'DELETE', credentials: 'include' })
    setCampaigns(prev => prev.filter(c => c.id !== id))
  }

  if (loading) return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" /></div>

  return (
    <div className="space-y-6 pb-12">
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#0f1420] via-[#0d1117] to-[#0a0e14] border border-[#1a2332] p-6 lg:p-8">
        <div className="absolute top-0 right-0 w-96 h-96 bg-pink-500/5 rounded-full blur-3xl" />
        <div className="relative flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-pink-500 to-rose-600 flex items-center justify-center shadow-lg shadow-pink-500/20"><Megaphone size={24} className="text-white" /></div>
            <div><h1 className="text-xl font-bold text-white">Kampanya Modülü</h1><p className="text-sm text-gray-500 mt-0.5">İndirim ve promosyon kampanyalarını yönetin</p></div>
          </div>
          <button onClick={() => setShowForm(!showForm)} className="px-5 py-2.5 bg-gradient-to-r from-pink-600 to-rose-500 text-white rounded-xl text-sm font-semibold hover:shadow-lg hover:shadow-pink-500/25 transition-all flex items-center gap-2"><Plus size={16} />Yeni Kampanya</button>
        </div>
      </div>

      {showForm && (
        <div className="bg-[#0d1117]/80 backdrop-blur-xl border border-[#1a2332] rounded-2xl p-6 space-y-4">
          <h3 className="text-white font-semibold">Yeni Kampanya Oluştur</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div><label className="text-xs text-gray-500 block mb-1">Başlık</label><input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} className="w-full bg-[#080b12]/80 border border-[#1a2332] rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-pink-500/50" /></div>
            <div><label className="text-xs text-gray-500 block mb-1">Tür</label><select value={form.type} onChange={e => setForm({ ...form, type: e.target.value })} className="w-full bg-[#080b12]/80 border border-[#1a2332] rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-pink-500/50"><option value="discount">İndirim</option><option value="coupon">Kupon</option><option value="promotion">Promosyon</option></select></div>
            <div><label className="text-xs text-gray-500 block mb-1">İndirim %</label><input value={form.discount} onChange={e => setForm({ ...form, discount: e.target.value })} className="w-full bg-[#080b12]/80 border border-[#1a2332] rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-pink-500/50" /></div>
            <div><label className="text-xs text-gray-500 block mb-1">Kod</label><input value={form.code} onChange={e => setForm({ ...form, code: e.target.value })} className="w-full bg-[#080b12]/80 border border-[#1a2332] rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-pink-500/50" /></div>
            <div><label className="text-xs text-gray-500 block mb-1">Hedef</label><select value={form.target} onChange={e => setForm({ ...form, target: e.target.value })} className="w-full bg-[#080b12]/80 border border-[#1a2332] rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-pink-500/50"><option value="all">Tüm Müşteriler</option><option value="new">Yeni Müşteriler</option><option value="vip">VIP Müşteriler</option></select></div>
            <div><label className="text-xs text-gray-500 block mb-1">Açıklama</label><input value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} className="w-full bg-[#080b12]/80 border border-[#1a2332] rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-pink-500/50" /></div>
          </div>
          <div className="flex gap-3"><button onClick={save} className="px-6 py-2.5 bg-gradient-to-r from-pink-600 to-rose-500 text-white rounded-xl text-sm font-semibold hover:shadow-lg hover:shadow-pink-500/25 transition-all flex items-center gap-2"><Save size={16} />Kaydet</button><button onClick={() => setShowForm(false)} className="px-6 py-2.5 border border-[#1a2332] text-gray-400 rounded-xl text-sm hover:text-white transition-all">İptal</button></div>
        </div>
      )}

      {campaigns.length === 0 ? (
        <div className="text-center py-16"><Megaphone size={48} className="mx-auto text-gray-700 mb-4" /><p className="text-gray-500">Henüz kampanya bulunmuyor</p></div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {campaigns.map(c => (
            <div key={c.id} className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#0f1420] to-[#0d1117] border border-[#1a2332] p-5 transition-all duration-300 hover:border-pink-500/30">
              <div className="flex items-start justify-between mb-3">
                <span className={'px-2.5 py-1 rounded-full text-xs font-semibold ' + (c.status === 'active' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-gray-500/10 text-gray-400 border border-gray-500/20')}>{c.status === 'active' ? 'Aktif' : 'Pasif'}</span>
                <button onClick={() => remove(c.id)} className="p-1.5 rounded-lg hover:bg-white/5 text-gray-500 hover:text-red-400 transition-all"><Trash2 size={14} /></button>
              </div>
              <h3 className="text-white font-semibold">{c.title}</h3>
              <p className="text-xs text-gray-500 mt-1">{c.description}</p>
              <div className="flex flex-wrap gap-2 mt-3">
                {c.discount && <span className="inline-flex items-center gap-1 px-2 py-1 bg-rose-500/10 text-rose-400 rounded text-[10px] border border-rose-500/20"><Percent size={10} />%{c.discount}</span>}
                {c.code && <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-500/10 text-blue-400 rounded text-[10px] border border-blue-500/20"><Tag size={10} />{c.code}</span>}
                <span className="inline-flex items-center gap-1 px-2 py-1 bg-purple-500/10 text-purple-400 rounded text-[10px] border border-purple-500/20"><Target size={10} />{c.target === 'all' ? 'Tümü' : c.target}</span>
              </div>
              <div className="flex items-center gap-4 mt-3 pt-3 border-t border-[#1a2332] text-xs text-gray-600">
                <span className="flex items-center gap-1"><Send size={11} />{c.sentCount || 0} gönderim</span>
                <span className="flex items-center gap-1"><RefreshCw size={11} />{c.clickCount || 0} tıklama</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
