'use client'
import { useState, useEffect } from 'react'
import { Users, Plus, Pencil, Trash2, X, Shield, ShieldOff, Check, Search, UserPlus } from 'lucide-react'

const ALL_MODULES = [
  { key: 'dashboard', label: 'Dashboard' },
  { key: 'customers', label: 'Müşteriler' },
  { key: 'products', label: 'Ürünler' },
  { key: 'ai-chatbots', label: 'AI Chatbotlar' },
  { key: 'voice-assistants', label: 'Sesli AI Asistanlar' },
  { key: 'qr-menu', label: 'QR Menu' },
  { key: 'messages', label: 'Mesajlar' },
  { key: 'notifications', label: 'Bildirimler' },
  { key: 'orders', label: 'Siparişler' },
  { key: 'reservations', label: 'Rezervasyonlar' },
  { key: 'virtual-pos', label: 'Sanal POS' },
  { key: 'payments', label: 'Ödemeler' },
  { key: 'analytics', label: 'Analitik' },
  { key: 'telegram', label: 'Sistem Kontrol' },
  { key: 'settings', label: 'Ayarlar' },
  { key: 'leads', label: 'Potansiyel Müşteriler' },
  { key: 'webchat', label: 'Chatbot Ayarları' },
  { key: 'kargo', label: 'Kargo' },
  { key: 'e-fatura', label: 'e-Fatura' },
]

const VIRTUAL_POS_PROVIDERS = [
  { key: 'virtual-pos-paytr', label: 'PayTR' },
  { key: 'virtual-pos-iyzico', label: 'İyzico' },
  { key: 'virtual-pos-sipay', label: 'Sipay' },
]

export default function UsersPage() {
  const [users, setUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingUser, setEditingUser] = useState<any>(null)
  const [form, setForm] = useState({ email: '', password: '', name: '', role: 'USER', permissions: [] as string[], tenantId: '' })
  const [tenants, setTenants] = useState<any[]>([])
  const [search, setSearch] = useState('')
  const [saveError, setSaveError] = useState('')

  const [newEmail, setNewEmail] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [newName, setNewName] = useState('')
  const [newRole, setNewRole] = useState('BUSINESS_OWNER')
  const [newPerms, setNewPerms] = useState<string[]>(ALL_MODULES.map(m => m.key))
  const [newTenantId, setNewTenantId] = useState('')
  const [newLoading, setNewLoading] = useState(false)
  const [newError, setNewError] = useState('')
  const [newSuccess, setNewSuccess] = useState('')

  const fetchUsers = async () => {
      try {
        let res = await fetch('/api/users', { credentials: 'include' })
        if (res.status === 401) {
          const refreshRes = await fetch('/api/auth/refresh', { method: 'POST', credentials: 'include' })
          if (refreshRes.ok) res = await fetch('/api/users', { credentials: 'include' })
          else { setLoading(false); return }
        }
        if (res.ok) setUsers(await res.json())
      } catch {}
      finally { setLoading(false) }
  }

  useEffect(() => {
    fetchUsers()
    fetch('/api/tenants', { credentials: 'include' }).then(r => { if (r.ok) r.json().then(setTenants) })
  }, [])

  const openCreate = () => {
    setEditingUser(null); setSaveError('')
    setForm({ email: '', password: '', name: '', role: 'USER', permissions: [], tenantId: '' })
    setShowModal(true)
  }

  const openEdit = (u: any) => {
    setEditingUser(u); setSaveError('')
    setForm({ email: u.email, password: '', name: u.name || '', role: u.role, permissions: [], tenantId: u.tenantId || '' })
    setShowModal(true)
  }

  const toggleNewPerm = (key: string) => {
    setNewPerms(p => p.includes(key) ? p.filter(x => x !== key) : [...p, key])
  }

  const selectAllNew = () => setNewPerms(ALL_MODULES.map(m => m.key))
  const selectNoneNew = () => setNewPerms([])

  const save = async () => {
    setLoading(true); setSaveError('')
    try {
      let res
      if (editingUser) {
        const body: any = { name: form.name, role: form.role, tenantId: form.tenantId }
        res = await fetch('/api/users/' + editingUser.id, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, credentials: 'include', body: JSON.stringify(body) })
      } else {
        const payload: any = { email: form.email, password: form.password, name: form.name, role: form.role, permissions: [], tenantId: form.tenantId || undefined }
        res = await fetch('/api/users', { method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'include', body: JSON.stringify(payload) })
      }
      if (!res.ok) { setSaveError('Kayit basarisiz (' + res.status + ')'); return }
      setShowModal(false)
      fetchUsers()
    } catch (e: any) { setSaveError('Hata: ' + (e.message || 'Bilinmeyen')) }
    finally { setLoading(false) }
  }

  const handleCreateUser = async () => {
    setNewLoading(true); setNewError(''); setNewSuccess('')
    try {
      const payload: any = { email: newEmail, password: newPassword, name: newName, role: newRole, permissions: newPerms, tenantId: newRole === 'BUSINESS_OWNER' && newTenantId ? newTenantId : undefined }
      const res = await fetch('/api/users', { method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'include', body: JSON.stringify(payload) })
      if (res.ok) {
        setNewSuccess('Kullanici olusturuldu!')
        setNewEmail(''); setNewPassword(''); setNewName(''); setNewRole('BUSINESS_OWNER'); setNewPerms(ALL_MODULES.map(m => m.key)); setNewTenantId('')
        fetchUsers()
        return
      }
      const txt = await res.text()
      let msg = ''
      if (res.status === 429) msg = 'Cok fazla istek.'
      else if (res.status >= 500) msg = 'Sunucu hatasi.'
      else { try { const j = JSON.parse(txt); msg = j.message ? (Array.isArray(j.message) ? j.message[0] : j.message) : j.error || 'Hata' } catch { msg = 'Hata' } }
      setNewError(msg + ' (' + res.status + ')')
    } catch { setNewError('Baglanti hatasi') }
    finally { setNewLoading(false) }
  }

  const remove = async (id: string) => {
    if (!confirm('Kullaniciyi silmek istediginize emin misiniz?')) return
    await fetch('/api/users/' + id, { method: 'DELETE', credentials: 'include' })
    fetchUsers()
  }

  const filtered = users.filter(u => u.email.includes(search) || u.name?.includes(search) || u.role?.includes(search))

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Kullanici Yonetimi</h1>
          <p className="text-gray-500 text-sm mt-1">Kullanicilari yonetin, yetkilendirin</p>
        </div>
      </div>

      <div className="bg-[#0d1117]/80 backdrop-blur-xl border border-[#1a2332] rounded-2xl p-6 space-y-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/20"><UserPlus size={20} /></div>
          <div><h3 className="text-white font-semibold">Yeni Kullanici Olustur</h3><p className="text-xs text-gray-500">Rol ve modul yetkileriyle birlikte olusturun</p></div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <input type="text" value={newName} onChange={e => setNewName(e.target.value)} placeholder="Ad Soyad" className="bg-[#080b12]/80 border border-[#1a2332] rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-blue-500/50 placeholder-gray-600 transition-all" />
          <input type="email" value={newEmail} onChange={e => setNewEmail(e.target.value)} placeholder="E-posta" className="bg-[#080b12]/80 border border-[#1a2332] rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-blue-500/50 placeholder-gray-600 transition-all" />
          <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} placeholder="Parola" className="bg-[#080b12]/80 border border-[#1a2332] rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-blue-500/50 placeholder-gray-600 transition-all" />
          <select value={newRole} onChange={e => setNewRole(e.target.value)} className="bg-[#080b12]/80 border border-[#1a2332] rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-blue-500/50 transition-all">
            <option value="USER">Kullanici</option>
            <option value="BUSINESS_OWNER">Isletme Sahibi</option>
            <option value="ADMIN">Admin</option>
            <option value="SUPER_ADMIN">Super Admin</option>
          </select>
          {newRole === 'BUSINESS_OWNER' && (
            <select value={newTenantId} onChange={e => setNewTenantId(e.target.value)} className="bg-[#080b12]/80 border border-[#1a2332] rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-blue-500/50 transition-all">
              <option value="">Isletme secin</option>
              {tenants.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
            </select>
          )}
        </div>
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs text-gray-500 font-medium">Modul Yetkileri</label>
            <div className="flex gap-2">
              <button onClick={selectAllNew} className="text-xs text-blue-400 hover:text-blue-300">Tumunu Sec</button>
              <button onClick={selectNoneNew} className="text-xs text-gray-500 hover:text-gray-400">Temizle</button>
            </div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
            {ALL_MODULES.map(m => {
              const active = newPerms.includes(m.key)
              return (
                <button key={m.key} onClick={() => toggleNewPerm(m.key)}
                  className={'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ' + (active ? 'bg-blue-500/10 border-blue-500/30 text-blue-400' : 'bg-[#080b12]/50 border-[#1a2332] text-gray-500 hover:text-gray-300')}>
                  {active ? <Check size={11} /> : <div className="w-[11px]" />}{m.label}
                </button>
              )
            })}
          </div>
          {newPerms.includes('virtual-pos') && (
            <div className="mt-3 bg-[#080b12]/40 border border-[#1a2332] rounded-xl p-4 space-y-2">
              <label className="text-xs text-gray-500 font-medium">Sanal POS Saglayicilari</label>
              <div className="flex flex-wrap gap-2">{VIRTUAL_POS_PROVIDERS.map(p => {
                const active = newPerms.includes(p.key)
                return (
                  <button key={p.key} onClick={() => toggleNewPerm(p.key)}
                    className={'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ' + (active ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : 'bg-[#0d1117]/50 border-[#1a2332] text-gray-500 hover:text-gray-300')}>
                    {active ? <Check size={11} /> : <div className="w-[11px]" />}{p.label}
                  </button>
                )
              })}</div>
            </div>
          )}
        </div>
        {newError && <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3"><p className="text-red-400 text-xs">{newError}</p></div>}
        {newSuccess && <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl px-4 py-3"><p className="text-emerald-400 text-xs">{newSuccess}</p></div>}
        <button onClick={handleCreateUser} disabled={newLoading || !newEmail || !newPassword} className="w-full sm:w-auto px-6 py-2.5 bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-xl text-sm font-medium hover:shadow-lg hover:shadow-blue-500/25 transition-all disabled:opacity-50">{newLoading ? 'Olusturuluyor...' : 'Kullanici Olustur'}</button>
      </div>

      <div className="relative max-w-xs"><Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" /><input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Ara..." className="w-full bg-[#0d1117]/80 border border-[#1a2332] rounded-xl pl-9 pr-4 py-2 text-white text-sm focus:outline-none focus:border-blue-500/50 placeholder-gray-600 transition-all" /></div>

      {loading ? (
        <div className="text-center py-20"><div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto" /></div>
      ) : (
        <div className="glass rounded-2xl border border-[#1a2332] overflow-hidden">
          <table className="w-full">
            <thead><tr className="border-b border-[#1a2332]"><th className="text-left text-xs text-gray-500 font-medium px-5 py-3">Ad</th><th className="text-left text-xs text-gray-500 font-medium px-5 py-3">E-posta</th><th className="text-left text-xs text-gray-500 font-medium px-5 py-3">Rol</th><th className="text-left text-xs text-gray-500 font-medium px-5 py-3">Yetkiler</th><th className="text-left text-xs text-gray-500 font-medium px-5 py-3">Isletme</th><th className="text-right text-xs text-gray-500 font-medium px-5 py-3">Islem</th></tr></thead>
            <tbody>{filtered.map(u => (
              <tr key={u.id} className="border-b border-[#1a2332] last:border-0 hover:bg-white/[0.02] transition-colors">
                <td className="px-5 py-4"><div className="flex items-center gap-3"><div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white text-xs font-bold">{(u.name || u.email)[0].toUpperCase()}</div><span className="text-white text-sm font-medium">{u.name || '-'}</span></div></td>
                <td className="px-5 py-4 text-sm text-gray-400">{u.email}</td>
                <td className="px-5 py-4">
                  <div className="flex items-center gap-1.5">
                    <span className={'inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium ' + (u.role === 'SUPER_ADMIN' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' : u.role === 'ADMIN' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' : u.role === 'BUSINESS_OWNER' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-gray-500/10 text-gray-400 border border-gray-500/20')}><Shield size={12} />{u.role === 'SUPER_ADMIN' ? 'Super Admin' : u.role === 'ADMIN' ? 'Admin' : u.role === 'BUSINESS_OWNER' ? 'Isletme' : 'Kullanici'}</span>
                    {u.status === 'restricted' && <span className="px-2 py-0.5 bg-red-500/10 text-red-400 text-[10px] rounded-md border border-red-500/20 font-medium">Kisitli</span>}
                  </div>
                </td>
                <td className="px-5 py-4"><div className="flex flex-wrap gap-1">{((u.permissions || []).slice(0, 3)).map((p: string) => <span key={p} className="px-2 py-0.5 bg-blue-500/5 text-blue-400 text-[10px] rounded-md border border-blue-500/10">{ALL_MODULES.find(m => m.key === p)?.label || p}</span>)}{(u.permissions?.length || 0) > 3 && <span className="px-2 py-0.5 text-gray-500 text-[10px]">+{u.permissions.length - 3}</span>}</div></td>
                <td className="px-5 py-4 text-sm text-gray-500">{u.tenant?.name || '-'}</td>
                <td className="px-5 py-4 text-right"><div className="flex items-center justify-end gap-2">
                  {u.role !== 'SUPER_ADMIN' && (
                    u.status === 'restricted'
                      ? <button onClick={async () => { await fetch('/api/users/' + u.id + '/unrestrict', { method: 'PATCH', credentials: 'include' }); fetchUsers() }} className="p-2 rounded-lg hover:bg-white/5 text-emerald-500 hover:text-emerald-400 transition-all" title="Kisitlamayi Kaldir"><Check size={14} /></button>
                      : <button onClick={async () => { await fetch('/api/users/' + u.id + '/restrict', { method: 'PATCH', credentials: 'include' }); fetchUsers() }} className="p-2 rounded-lg hover:bg-white/5 text-red-500 hover:text-red-400 transition-all" title="Hesabi Kisitla"><ShieldOff size={14} /></button>
                  )}
                  <button onClick={() => openEdit(u)} className="p-2 rounded-lg hover:bg-white/5 text-gray-500 hover:text-blue-400 transition-all"><Pencil size={14} /></button>
                  <button onClick={() => remove(u.id)} className="p-2 rounded-lg hover:bg-white/5 text-gray-500 hover:text-red-400 transition-all"><Trash2 size={14} /></button>
                </div></td>
              </tr>
            ))}</tbody>
          </table>
          {filtered.length === 0 && <div className="text-center py-16 text-gray-500 text-sm">Kullanici bulunamadi</div>}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowModal(false)} />
          <div className="relative w-full max-w-lg bg-[#0d1117] border border-[#1a2332] rounded-2xl shadow-2xl p-6 space-y-5">
            <div className="flex items-center justify-between"><h3 className="text-lg font-semibold text-white">{editingUser ? 'Kullanici Duzenle' : 'Basit Kullanici Ekle'}</h3><button onClick={() => setShowModal(false)} className="p-2 rounded-lg hover:bg-white/5 text-gray-500"><X size={18} /></button></div>
            <div className="grid grid-cols-2 gap-4">
              <div><label className="text-xs text-gray-500 block mb-1.5">Ad Soyad</label><input type="text" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Kullanici adi" className="w-full bg-[#080b12]/80 border border-[#1a2332] rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-blue-500/50 placeholder-gray-600 transition-all" /></div>
              <div><label className="text-xs text-gray-500 block mb-1.5">E-posta</label><input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="ornek@email.com" disabled={!!editingUser} className="w-full bg-[#080b12]/80 border border-[#1a2332] rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-blue-500/50 placeholder-gray-600 transition-all disabled:opacity-50" /></div>
              {!editingUser && <div><label className="text-xs text-gray-500 block mb-1.5">Parola</label><input type="password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} placeholder="En az 6 karakter" className="w-full bg-[#080b12]/80 border border-[#1a2332] rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-blue-500/50 placeholder-gray-600 transition-all" /></div>}
              <div><label className="text-xs text-gray-500 block mb-1.5">Rol</label><select value={form.role} onChange={e => setForm({ ...form, role: e.target.value })} disabled={editingUser?.role === 'SUPER_ADMIN'} className="w-full bg-[#080b12]/80 border border-[#1a2332] rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-blue-500/50 transition-all disabled:opacity-50"><option value="USER">Kullanici</option><option value="BUSINESS_OWNER">Isletme Sahibi</option><option value="ADMIN">Admin</option><option value="SUPER_ADMIN">Super Admin</option></select></div>
            </div>
            {saveError && <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3"><p className="text-red-400 text-xs">{saveError}</p></div>}
            <div className="flex gap-3 justify-end pt-2"><button onClick={() => setShowModal(false)} className="px-5 py-2.5 border border-[#1a2332] text-gray-400 rounded-xl text-sm font-medium hover:text-white transition-all">Iptal</button><button onClick={save} disabled={loading || !form.email || (!editingUser && !form.password)} className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-xl text-sm font-medium hover:shadow-lg hover:shadow-blue-500/25 transition-all disabled:opacity-50">{loading ? 'Kaydediliyor...' : 'Kaydet'}</button></div>
          </div>
        </div>
      )}
    </div>
  )
}
