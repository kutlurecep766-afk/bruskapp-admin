'use client'
import { useState, useEffect } from 'react'
import { Megaphone, CheckCircle, XCircle, Trash2 } from 'lucide-react'

export default function AnnouncementsPage() {
  const [announcements, setAnnouncements] = useState<any[]>([])
  const [title, setTitle] = useState('')
  const [message, setMessage] = useState('')
  const [saving, setSaving] = useState(false)
  const [result, setResult] = useState<{ ok: boolean; msg: string } | null>(null)

  const fetchAll = async () => {
    try {
      const res = await fetch('/api/notifications/announcements/all', { credentials: 'include' })
      if (res.ok) setAnnouncements(await res.json())
    } catch {}
  }

  const create = async () => {
    if (!title.trim() || !message.trim()) return
    setSaving(true)
    setResult(null)
    try {
      const res = await fetch('/api/notifications/announcements', {
        method: 'POST', credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, message }),
      })
      const data = await res.json()
      if (data.success) {
        setTitle('')
        setMessage('')
        setResult({ ok: true, msg: 'Duyuru olusturuldu, onay bekliyor' })
        fetchAll()
      } else {
        setResult({ ok: false, msg: data.message || 'Hata' })
      }
    } catch { setResult({ ok: false, msg: 'Baglanti hatasi' }) } finally {
      setSaving(false)
      setTimeout(() => setResult(null), 3000)
    }
  }

  const approve = async (id: string) => {
    await fetch('/api/notifications/announcements/' + id + '/approve', { method: 'POST', credentials: 'include' })
    fetchAll()
  }

  const toggleActive = async (id: string, isActive: boolean) => {
    await fetch('/api/notifications/announcements/' + id, {
      method: 'PUT', credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isActive: !isActive }),
    })
    fetchAll()
  }

  const remove = async (id: string) => {
    await fetch('/api/notifications/announcements/' + id, { method: 'DELETE', credentials: 'include' })
    fetchAll()
  }

  useEffect(() => { fetchAll() }, [])

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Megaphone className="w-5 h-5 text-amber-400" />
        <h1 className="text-xl font-bold text-white">Duyuru Yonetimi</h1>
      </div>

      <div className="bg-[#0d1117]/80 backdrop-blur-xl border border-[#1a2332] rounded-2xl p-6">
        <h2 className="text-sm font-semibold text-white mb-4">Yeni Duyuru</h2>
        <div className="space-y-3">
          <input type="text" value={title} onChange={e => setTitle(e.target.value)}
            placeholder="Duyuru basligi"
            className="w-full bg-[#1a2332]/50 border border-[#1a2332] rounded-xl px-3 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-blue-500/50" />
          <textarea value={message} onChange={e => setMessage(e.target.value)} rows={3}
            placeholder="Duyuru mesaji (istege bagli)"
            className="w-full bg-[#1a2332]/50 border border-[#1a2332] rounded-xl px-3 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-blue-500/50 resize-none" />
          <button onClick={create} disabled={saving || !title.trim()}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all bg-amber-500/10 text-amber-400 hover:text-amber-300 border border-amber-500/20 hover:border-amber-500/40 disabled:opacity-50">
            {saving ? 'Gonderiliyor...' : 'Duyuru Olustur'}
          </button>
          {result && <p className={'text-sm ' + (result.ok ? 'text-green-400' : 'text-red-400')}>{result.msg}</p>}
        </div>
      </div>

      <div className="bg-[#0d1117]/80 backdrop-blur-xl border border-[#1a2332] rounded-2xl p-6">
        <h2 className="text-sm font-semibold text-white mb-4">Tum Duyurular</h2>
        {announcements.length === 0 ? (
          <p className="text-gray-500 text-sm">Henuz duyuru yok</p>
        ) : (
          <div className="space-y-2">
            {announcements.map((a: any) => (
              <div key={a.id} className={'flex items-center justify-between p-4 rounded-xl border ' + (
                a.status === 'approved' ? 'bg-green-500/5 border-green-500/20' :
                a.status === 'pending' ? 'bg-amber-500/5 border-amber-500/20' :
                'bg-[#1a2332]/20 border-transparent'
              )}>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm text-white font-medium">{a.title}</p>
                    <span className={'text-xs px-1.5 py-0.5 rounded-full ' + (
                      a.status === 'approved' ? 'text-green-400 bg-green-500/10' :
                      a.status === 'pending' ? 'text-amber-400 bg-amber-500/10' :
                      'text-gray-500 bg-gray-500/10'
                    )}>{a.status}</span>
                  </div>
                  {a.message && <p className="text-xs text-gray-400 mt-0.5">{a.message}</p>}
                  <p className="text-xs text-gray-600 mt-1">{new Date(a.createdAt).toLocaleString('tr-TR')}</p>
                </div>
                <div className="flex items-center gap-2 ml-3">
                  {a.status === 'pending' && (
                    <button onClick={() => approve(a.id)} className="text-xs text-green-400 bg-green-500/10 hover:bg-green-500/20 px-2 py-1 rounded-lg flex items-center gap-1">
                      <CheckCircle className="w-3 h-3" /> Onayla
                    </button>
                  )}
                  {a.status === 'approved' && (
                    <button onClick={() => toggleActive(a.id, a.isActive)}
                      className={'text-xs px-2 py-1 rounded-lg ' + (a.isActive ? 'text-green-400 bg-green-500/10' : 'text-gray-500 bg-[#1a2332]/50')}>
                      {a.isActive ? 'Aktif' : 'Pasif'}
                    </button>
                  )}
                  <button onClick={() => remove(a.id)} className="text-xs text-red-400 bg-red-500/10 hover:bg-red-500/20 px-2 py-1 rounded-lg flex items-center gap-1">
                    <Trash2 className="w-3 h-3" /> Sil
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
