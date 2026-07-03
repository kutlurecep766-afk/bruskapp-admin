'use client'
import { useState, useEffect } from 'react'
import { Users, Plus, Trash2, X, Loader2, Shield, UserCog } from 'lucide-react'

export default function TeamPage() {
  const [users, setUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState({ email: '', password: '', name: '', role: 'WAITER' })
  const [error, setError] = useState('')

  const fetchUsers = async () => {
    try {
      const res = await fetch('/api/users', { credentials: 'include' })
      if (res.ok) setUsers(await res.json())
    } catch {}
    finally { setLoading(false) }
  }

  useEffect(() => { fetchUsers() }, [])

  const save = async () => {
    setError('')
    try {
      const res = await fetch('/api/users', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: form.email, password: form.password, name: form.name, role: form.role }),
      })
      if (!res.ok) { const d = await res.json(); setError(d.message || 'Kayıt başarısız'); return }
      setShowModal(false)
      setForm({ email: '', password: '', name: '', role: 'WAITER' })
      fetchUsers()
    } catch (e: any) { setError(e.message || 'Hata') }
  }

  const remove = async (id: string) => {
    if (!confirm('Bu kullanıcıyı silmek istediğinize emin misiniz?')) return
    await fetch('/api/users/' + id, { method: 'DELETE', credentials: 'include' })
    fetchUsers()
  }

  const roleLabel = (role: string) => {
    const labels: Record<string, string> = { WAITER: 'Garson', ADMIN: 'Admin', BUSINESS_OWNER: 'İşletme Sahibi', USER: 'Kullanıcı' }
    return labels[role] || role
  }

  const roleColor = (role: string) => {
    if (role === 'ADMIN') return 'bg-blue-500/10 text-blue-400 border-blue-500/20'
    if (role === 'WAITER') return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
    return 'bg-gray-500/10 text-gray-400 border-gray-500/20'
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Ekibim</h1>
          <p className="text-sm text-gray-500 mt-1">{users.length} kullanıcı</p>
        </div>
        <button onClick={() => { setForm({ email: '', password: '', name: '', role: 'WAITER' }); setError(''); setShowModal(true) }} className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-emerald-600 to-emerald-500 text-white rounded-xl text-sm font-medium hover:shadow-lg hover:shadow-emerald-500/25 transition-all">
          <Plus size={16} /> Ekip Ekle
        </button>
      </div>

      {loading ? (
        <div className="text-center py-20"><Loader2 className="w-8 h-8 text-blue-400 animate-spin mx-auto" /></div>
      ) : users.length === 0 ? (
        <div className="text-center py-20">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-center"><Users className="w-6 h-6 text-gray-500" /></div>
          <p className="text-sm text-gray-400">Henüz ekip üyesi eklenmemiş</p>
          <p className="text-xs text-gray-600 mt-1">Garson veya admin ekleyerek ekibinizi oluşturun</p>
        </div>
      ) : (
        <div className="glass rounded-2xl border border-[#1a2332] overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#1a2332]">
                <th className="text-left text-xs text-gray-500 font-medium px-5 py-3">Ad</th>
                <th className="text-left text-xs text-gray-500 font-medium px-5 py-3">E-posta</th>
                <th className="text-left text-xs text-gray-500 font-medium px-5 py-3">Rol</th>
                <th className="text-right text-xs text-gray-500 font-medium px-5 py-3">İşlem</th>
              </tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u.id} className="border-b border-[#1a2332] last:border-0 hover:bg-white/[0.02] transition-colors">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white text-xs font-bold">{(u.name || u.email)[0].toUpperCase()}</div>
                      <span className="text-white text-sm font-medium">{u.name || '-'}</span>
                    </div>
                  </td>
                  <td className="px-5 py-4 text-sm text-gray-400">{u.email}</td>
                  <td className="px-5 py-4">
                    <span className={'inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium border ' + roleColor(u.role)}>
                      {u.role === 'ADMIN' ? <UserCog size={12} /> : <Shield size={12} />}
                      {roleLabel(u.role)}
                    </span>
                    {u.status === 'restricted' && <span className="ml-2 px-2 py-0.5 bg-red-500/10 text-red-400 text-[10px] rounded-md border border-red-500/20 font-medium">Kısıtlı</span>}
                  </td>
                  <td className="px-5 py-4 text-right">
                    <button onClick={() => remove(u.id)} className="p-2 rounded-lg hover:bg-white/5 text-gray-500 hover:text-red-400 transition-all"><Trash2 size={14} /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowModal(false)} />
          <div className="relative w-full max-w-md bg-[#0d1117] border border-[#1a2332] rounded-2xl shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-white">Ekip Üyesi Ekle</h3>
              <button onClick={() => setShowModal(false)} className="p-2 rounded-lg hover:bg-white/5 text-gray-500"><X size={18} /></button>
            </div>
            <div>
              <label className="text-xs text-gray-500 block mb-1.5">Ad Soyad</label>
              <input type="text" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Adı" className="w-full bg-[#080b12]/80 border border-[#1a2332] rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-blue-500/50 placeholder-gray-600 transition-all" />
            </div>
            <div>
              <label className="text-xs text-gray-500 block mb-1.5">E-posta</label>
              <input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="ornek@email.com" className="w-full bg-[#080b12]/80 border border-[#1a2332] rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-blue-500/50 placeholder-gray-600 transition-all" />
            </div>
            <div>
              <label className="text-xs text-gray-500 block mb-1.5">Parola</label>
              <input type="password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} placeholder="En az 6 karakter" className="w-full bg-[#080b12]/80 border border-[#1a2332] rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-blue-500/50 placeholder-gray-600 transition-all" />
            </div>
            <div>
              <label className="text-xs text-gray-500 block mb-1.5">Rol</label>
              <select value={form.role} onChange={e => setForm({ ...form, role: e.target.value })} className="w-full bg-[#080b12]/80 border border-[#1a2332] rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-blue-500/50 transition-all">
                <option value="WAITER">Garson</option>
                <option value="ADMIN">Admin</option>
              </select>
            </div>
            {error && <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3"><p className="text-red-400 text-xs">{error}</p></div>}
            <div className="flex gap-3 justify-end pt-2">
              <button onClick={() => setShowModal(false)} className="px-5 py-2.5 border border-[#1a2332] text-gray-400 rounded-xl text-sm font-medium hover:text-white transition-all">İptal</button>
              <button onClick={save} disabled={!form.email || !form.password} className="px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-emerald-500 text-white rounded-xl text-sm font-medium hover:shadow-lg hover:shadow-emerald-500/25 transition-all disabled:opacity-50">Ekle</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
