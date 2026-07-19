'use client'
import { useState, useEffect } from 'react'
import { Plus, Trash2, Bell, Clock, Calendar, MessageSquare } from 'lucide-react'

export default function ReminderTemplatesPage() {
  const [templates, setTemplates] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ title: '', type: 'appointment', message: '', platform: 'all' })

  useEffect(() => {
    fetch('/api/reminder-templates', { credentials: 'include' })
      .then(r => r.ok ? r.json() : [])
      .then(d => { setTemplates(d); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  const save = async () => {
    const res = await fetch('/api/reminder-templates', { method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'include', body: JSON.stringify(form) })
    if (res.ok) { setShowForm(false); setForm({ title: '', type: 'appointment', message: '', platform: 'all' }); window.location.reload() }
  }

  const remove = async (id: string) => {
    if (!confirm('Emin misiniz?')) return
    await fetch('/api/reminder-templates/' + id, { method: 'DELETE', credentials: 'include' })
    setTemplates(prev => prev.filter(t => t.id !== id))
  }

  const toggle = async (t: any) => {
    await fetch('/api/reminder-templates/' + t.id, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, credentials: 'include', body: JSON.stringify({ active: !t.active }) })
    window.location.reload()
  }

  if (loading) return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" /></div>

  return (
    <div className="space-y-6 pb-12">
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#0f1420] via-[#0d1117] to-[#0a0e14] border border-[#1a2332] p-6 lg:p-8">
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl" />
        <div className="relative flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-lg shadow-amber-500/20"><Bell size={24} className="text-white" /></div>
            <div><h1 className="text-xl font-bold text-white">Hatırlatma Şablonları</h1><p className="text-sm text-gray-500 mt-0.5">Randevu ve sipariş hatırlatma mesaj şablonları</p></div>
          </div>
          <button onClick={() => setShowForm(!showForm)} className="px-5 py-2.5 bg-gradient-to-r from-amber-600 to-orange-500 text-white rounded-xl text-sm font-semibold hover:shadow-lg hover:shadow-amber-500/25 transition-all flex items-center gap-2"><Plus size={16} />Yeni Şablon</button>
        </div>
      </div>

      {showForm && (
        <div className="bg-[#0d1117]/80 backdrop-blur-xl border border-[#1a2332] rounded-2xl p-6 space-y-4">
          <h3 className="text-white font-semibold">Yeni Hatırlatma Şablonu</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div><label className="text-xs text-gray-500 block mb-1">Başlık</label><input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} className="w-full bg-[#080b12]/80 border border-[#1a2332] rounded-xl px-4 py-2.5 text-white text-sm" /></div>
            <div><label className="text-xs text-gray-500 block mb-1">Tür</label><select value={form.type} onChange={e => setForm({ ...form, type: e.target.value })} className="w-full bg-[#080b12]/80 border border-[#1a2332] rounded-xl px-4 py-2.5 text-white text-sm"><option value="appointment">Randevu</option><option value="order">Sipariş</option><option value="payment">Ödeme</option><option value="custom">Özel</option></select></div>
            <div><label className="text-xs text-gray-500 block mb-1">Platform</label><select value={form.platform} onChange={e => setForm({ ...form, platform: e.target.value })} className="w-full bg-[#080b12]/80 border border-[#1a2332] rounded-xl px-4 py-2.5 text-white text-sm"><option value="all">Tümü</option><option value="whatsapp">WhatsApp</option><option value="telegram">Telegram</option></select></div>
          </div>
          <div><label className="text-xs text-gray-500 block mb-1">Mesaj</label><textarea value={form.message} onChange={e => setForm({ ...form, message: e.target.value })} rows={4} className="w-full bg-[#080b12]/80 border border-[#1a2332] rounded-xl px-4 py-2.5 text-white text-sm resize-none" placeholder='{musteri} {tarih} {saat} gibi değişkenleri kullanabilirsiniz...' /></div>
          <div className="flex gap-3"><button onClick={save} disabled={!form.title || !form.message} className="px-6 py-2.5 bg-gradient-to-r from-amber-600 to-orange-500 text-white rounded-xl text-sm font-semibold hover:shadow-lg hover:shadow-amber-500/25 transition-all disabled:opacity-50">Kaydet</button><button onClick={() => setShowForm(false)} className="px-6 py-2.5 border border-[#1a2332] text-gray-400 rounded-xl text-sm hover:text-white">İptal</button></div>
        </div>
      )}

      {templates.length === 0 ? (
        <div className="text-center py-16"><Bell size={48} className="mx-auto text-gray-700 mb-4" /><p className="text-gray-500">Henüz şablon bulunmuyor</p></div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">{templates.map(t => (
          <div key={t.id} className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#0f1420] to-[#0d1117] border border-[#1a2332] p-5">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2"><Bell size={16} className="text-amber-400" /><h3 className="text-white font-semibold">{t.title}</h3></div>
              <div className="flex items-center gap-2">
                <button onClick={() => toggle(t)} className={'relative inline-flex h-5 w-9 items-center rounded-full transition-all ' + (t.active ? 'bg-emerald-500' : 'bg-gray-600')}><span className={'inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-all ' + (t.active ? 'translate-x-4.5' : 'translate-x-1')} /></button>
                <button onClick={() => remove(t.id)} className="p-1.5 rounded-lg hover:bg-white/5 text-gray-500 hover:text-red-400"><Trash2 size={14} /></button>
              </div>
            </div>
            <p className="text-xs text-gray-400 line-clamp-2">{t.message}</p>
            <div className="flex gap-2 mt-3">
              <span className="px-2 py-0.5 bg-amber-500/10 text-amber-400 rounded text-[10px] border border-amber-500/20 capitalize">{t.type}</span>
              <span className="px-2 py-0.5 bg-blue-500/10 text-blue-400 rounded text-[10px] border border-blue-500/20">{t.platform === 'all' ? 'Tümü' : t.platform}</span>
            </div>
          </div>
        ))}</div>
      )}
    </div>
  )
}
