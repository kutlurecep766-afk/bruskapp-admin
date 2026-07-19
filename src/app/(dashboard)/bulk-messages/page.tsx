'use client'
import { useState, useEffect } from 'react'
import { Send, Upload, FileSpreadsheet, Download, Trash2, MessageSquare, CheckCircle, XCircle } from 'lucide-react'

export default function BulkMessagesPage() {
  const [messages, setMessages] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ title: '', message: '', platform: 'all' })
  const [file, setFile] = useState<File | null>(null)
  const [parsed, setParsed] = useState<any[]>([])

  useEffect(() => {
    fetch('/api/bulk-messages', { credentials: 'include' })
      .then(r => r.ok ? r.json() : [])
      .then(d => { setMessages(d); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  const handleFile = (e: any) => {
    const f = e.target.files?.[0]
    if (!f) return
    setFile(f)
    const reader = new FileReader()
    reader.onload = (ev) => {
      const text = ev.target?.result as string
      const lines = text.split('\n').filter(l => l.trim())
      const headers = lines[0].split(',').map(h => h.trim())
      const data = lines.slice(1).map(l => {
        const vals = l.split(',').map(v => v.trim())
        const obj: any = {}
        headers.forEach((h, i) => obj[h] = vals[i] || '')
        return obj
      })
      setParsed(data)
    }
    reader.readAsText(f)
  }

  const send = async () => {
    const res = await fetch('/api/bulk-messages', {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'include',
      body: JSON.stringify({ ...form, totalCount: parsed.length, fileData: parsed }),
    })
    if (res.ok) { setShowForm(false); setForm({ title: '', message: '', platform: 'all' }); setParsed([]); setFile(null); window.location.reload() }
  }

  const triggerSend = async (id: string) => {
    const res = await fetch('/api/bulk-messages/' + id + '/send', { method: 'POST', credentials: 'include' })
    if (res.ok) window.location.reload()
  }

  if (loading) return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" /></div>

  return (
    <div className="space-y-6 pb-12">
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#0f1420] via-[#0d1117] to-[#0a0e14] border border-[#1a2332] p-6 lg:p-8">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl" />
        <div className="relative flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/20"><Send size={24} className="text-white" /></div>
            <div><h1 className="text-xl font-bold text-white">Toplu Mesaj Kampanyası</h1><p className="text-sm text-gray-500 mt-0.5">Excel yükleyerek toplu mesaj gönderimi</p></div>
          </div>
          <button onClick={() => setShowForm(!showForm)} className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-500 text-white rounded-xl text-sm font-semibold hover:shadow-lg hover:shadow-blue-500/25 transition-all flex items-center gap-2"><Upload size={16} />Yeni Kampanya</button>
        </div>
      </div>

      {showForm && (
        <div className="bg-[#0d1117]/80 backdrop-blur-xl border border-[#1a2332] rounded-2xl p-6 space-y-4">
          <h3 className="text-white font-semibold">Yeni Toplu Mesaj</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div><label className="text-xs text-gray-500 block mb-1">Başlık</label><input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} className="w-full bg-[#080b12]/80 border border-[#1a2332] rounded-xl px-4 py-2.5 text-white text-sm" /></div>
            <div><label className="text-xs text-gray-500 block mb-1">Platform</label><select value={form.platform} onChange={e => setForm({ ...form, platform: e.target.value })} className="w-full bg-[#080b12]/80 border border-[#1a2332] rounded-xl px-4 py-2.5 text-white text-sm"><option value="all">Tüm Platformlar</option><option value="whatsapp">WhatsApp</option><option value="instagram">Instagram</option><option value="telegram">Telegram</option></select></div>
          </div>
          <div><label className="text-xs text-gray-500 block mb-1">Mesaj</label><textarea value={form.message} onChange={e => setForm({ ...form, message: e.target.value })} rows={4} className="w-full bg-[#080b12]/80 border border-[#1a2332] rounded-xl px-4 py-2.5 text-white text-sm resize-none" placeholder="Mesaj içeriğini yazın..." /></div>
          <div className="border-2 border-dashed border-[#1a2332] rounded-xl p-6 text-center hover:border-blue-500/30 transition-all cursor-pointer" onClick={() => document.getElementById('csvInput')?.click()}>
            <FileSpreadsheet size={32} className="mx-auto text-gray-600 mb-2" />
            <p className="text-sm text-gray-500">Excel / CSV dosyası yükleyin</p>
            <p className="text-xs text-gray-600 mt-1">Sütunlar: phone, name (opsiyonel)</p>
            <input id="csvInput" type="file" accept=".csv,.xlsx" className="hidden" onChange={handleFile} />
            {file && <p className="text-xs text-emerald-400 mt-2"><CheckCircle size={12} className="inline" /> {file.name} ({parsed.length} kayıt)</p>}
          </div>
          {parsed.length > 0 && (
            <div className="bg-[#080b12]/60 border border-[#1a2332] rounded-xl p-3 max-h-32 overflow-y-auto">
              <p className="text-xs text-gray-500 mb-2">Yüklenen kayıtlar ({parsed.length}):</p>
              {parsed.slice(0, 5).map((p, i) => <p key={i} className="text-xs text-gray-400">{p.phone || p.telefon || p.tel} - {p.name || p.ad || p.isim || ''}</p>)}
              {parsed.length > 5 && <p className="text-xs text-gray-600 mt-1">+{parsed.length - 5} kayıt daha...</p>}
            </div>
          )}
          <div className="flex gap-3"><button onClick={send} disabled={!form.title || !form.message || parsed.length === 0} className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-500 text-white rounded-xl text-sm font-semibold hover:shadow-lg hover:shadow-blue-500/25 transition-all disabled:opacity-50 flex items-center gap-2"><Send size={16} />Oluştur</button><button onClick={() => setShowForm(false)} className="px-6 py-2.5 border border-[#1a2332] text-gray-400 rounded-xl text-sm hover:text-white transition-all">İptal</button></div>
        </div>
      )}

      {messages.length === 0 ? (
        <div className="text-center py-16"><Send size={48} className="mx-auto text-gray-700 mb-4" /><p className="text-gray-500">Henüz toplu mesaj bulunmuyor</p></div>
      ) : (
        <div className="space-y-3">{messages.map(m => (
          <div key={m.id} className="bg-[#0d1117]/80 border border-[#1a2332] rounded-2xl p-5 flex items-center justify-between transition-all hover:border-blue-500/20">
            <div className="flex items-center gap-4">
              <div className={'w-10 h-10 rounded-xl flex items-center justify-center ' + (m.status === 'sent' ? 'bg-emerald-500/10' : 'bg-blue-500/10')}>
                {m.status === 'sent' ? <CheckCircle size={20} className="text-emerald-400" /> : <Send size={20} className="text-blue-400" />}
              </div>
              <div><h3 className="text-white font-semibold">{m.title}</h3><p className="text-xs text-gray-500 mt-0.5">{m.totalCount || 0} alıcı · {m.platform === 'all' ? 'Tüm platformlar' : m.platform}</p></div>
            </div>
            <div className="flex items-center gap-3">
              <span className={'px-3 py-1 rounded-full text-xs font-medium ' + (m.status === 'sent' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400')}>{m.status === 'sent' ? 'Gönderildi' : 'Taslak'}</span>
              {m.status === 'draft' && <button onClick={() => triggerSend(m.id)} className="px-4 py-1.5 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-lg text-xs font-medium hover:bg-blue-500/20 transition-all">Gönder</button>}
            </div>
          </div>
        ))}</div>
      )}
    </div>
  )
}
