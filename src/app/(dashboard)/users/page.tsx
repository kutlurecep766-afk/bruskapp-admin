'use client'
import { useState, useEffect } from 'react'
import { Users, Plus, Pencil, Trash2, X, Shield, ShieldOff, Check, Search, UserPlus, Coins, Gift } from 'lucide-react'

const ALL_MODULES = [
  { key: 'dashboard', label: 'Dashboard' },
  { key: 'customers', label: 'Musteriler' },
  { key: 'messages', label: 'Mesajlar' },
  { key: 'notifications', label: 'Bildirimler' },
  { key: 'orders', label: 'Siparisler' },
  { key: 'reservations', label: 'Rezervasyonlar' },
  { key: 'appointments', label: 'Randevular' },
  { key: 'analytics', label: 'Analitik' },
  { key: 'settings', label: 'Ayarlar' },
  { key: 'leads', label: 'Potansiyel Musteriler' },
  { key: 'webchat', label: 'Chatbot Ayarlari' },
  { key: 'chatbot-integrations', label: 'Chatbot Entegrasyonlari' },
  { key: 'zernio-accounts', label: 'Aboneler / Hesaplar' },
  { key: 'campaigns', label: 'Kampanya Modülü' },
  { key: 'bulk-messages', label: 'Toplu Mesaj' },
  { key: 'reminder-templates', label: 'Hatırlatma Şablonları' },
  { key: 'comments', label: 'Yorum Yönetimi' },
  { key: 'support', label: '7/24 Destek' },
]

const CHATBOT_PLATFORMS = [
  { key: 'whatsapp', label: 'WhatsApp' },
  { key: 'instagram', label: 'Instagram' },
  { key: 'facebook', label: 'Facebook Messenger' },
  { key: 'telegram', label: 'Telegram' },
  { key: 'webchat-widget', label: 'Web Chat' },

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
  const [currentUser, setCurrentUser] = useState<any>(null)

  const [newEmail, setNewEmail] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [newName, setNewName] = useState('')
  const [newRole, setNewRole] = useState('BUSINESS_OWNER')
  const [newPerms, setNewPerms] = useState<string[]>(ALL_MODULES.map(m => m.key))
  const [newTenantId, setNewTenantId] = useState('')
  const [newLoading, setNewLoading] = useState(false)
  const [newError, setNewError] = useState('')
  const [newSuccess, setNewSuccess] = useState('')
  const [fetchError, setFetchError] = useState('')
  const [tenantsUsage, setTenantsUsage] = useState<any[]>([])
  const [showCreditModal, setShowCreditModal] = useState(false)
  const [creditTenant, setCreditTenant] = useState<any>(null)
  const [creditAmount, setCreditAmount] = useState(100)
  const [creditReason, setCreditReason] = useState('')
  const [creditSaving, setCreditSaving] = useState(false)
  const [creditMsg, setCreditMsg] = useState('')
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [detailTenant, setDetailTenant] = useState<any>(null)
  const [detailLoading, setDetailLoading] = useState(false)
  const [detailData, setDetailData] = useState<any>(null)

  const loadDetail = async (id: string) => {
    setDetailLoading(true)
    try {
      const res = await fetch('/api/tenants/' + id + '/detail', { credentials: 'include' })
      if (res.ok) setDetailData(await res.json())
    } catch {} finally { setDetailLoading(false) }
  }

  const fetchUsers = async () => {
    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        let res = await fetch('/api/users', { credentials: 'include' })
        if (res.status === 401) {
          const refreshRes = await fetch('/api/auth/refresh', { method: 'POST', credentials: 'include' })
          if (refreshRes.ok) res = await fetch('/api/users', { credentials: 'include' })
          else { setLoading(false); setFetchError('Oturum suresi doldu, yeniden giris yapin'); return }
        }
        if (res.ok) { setLoading(false); setUsers(await res.json()); setFetchError(''); return }
        setFetchError('API hatasi (' + res.status + ')')
      } catch (e) { setFetchError('Baglanti hatasi') }
      await new Promise(r => setTimeout(r, 1500))
    }
    setLoading(false)
  }

  const fetchUsage = async () => {
    try {
      const res = await fetch('/api/tenants/usage/all', { credentials: 'include' })
      if (res.ok) setTenantsUsage(await res.json())
    } catch {}
  }

  useEffect(() => {
    fetchUsers()
    fetch('/api/tenants', { credentials: 'include' }).then(r => { if (r.ok) r.json().then(setTenants) })
    fetch('/api/users/me', { credentials: 'include' }).then(r => { if (r.ok) r.json().then(setCurrentUser) })
    fetchUsage()
  }, [])

  const openCreate = () => {
    setEditingUser(null); setSaveError('')
    setForm({ email: '', password: '', name: '', role: 'USER', permissions: [], tenantId: '' })
    setShowModal(true)
  }

  const openEdit = (u: any) => {
    setEditingUser(u); setSaveError('')
    setForm({ email: u.email, password: '', name: u.name || '', role: u.role, permissions: u.permissions || [], tenantId: u.tenantId || '' })
    setShowModal(true)
  }

  const toggleNewPerm = (key: string) => {
    setNewPerms(p => p.includes(key) ? p.filter(x => x !== key) : [...p, key])
  }

  const selectAllNew = () => setNewPerms(ALL_MODULES.map(m => m.key))
  const selectNoneNew = () => setNewPerms([])

  const ROLE_OPTIONS = [
    { value: 'USER', label: 'Kullanici' },
    { value: 'BUSINESS_OWNER', label: 'Isletme Sahibi' },
    { value: 'ADMIN', label: 'Admin' },
  ]

  const save = async () => {
    setLoading(true); setSaveError('')
    try {
      let res
      if (editingUser) {
        const body: any = { name: form.name, role: form.role, permissions: form.permissions }
        res = await fetch('/api/users/' + editingUser.id, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, credentials: 'include', body: JSON.stringify(body) })
      } else {
        const payload: any = { email: form.email, password: form.password, name: form.name, role: form.role, permissions: form.permissions, tenantId: form.tenantId || undefined }
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
      const regRes = await fetch('/api/auth/register', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ businessName: newName || newEmail.split('@')[0], email: newEmail, password: newPassword }) })
      if (!regRes.ok) {
        const txt = await regRes.text()
        let msg = ''; try { const j = JSON.parse(txt); msg = j.message ? (Array.isArray(j.message) ? j.message[0] : j.message) : j.error || 'Hata' } catch { msg = 'Hata' }
        setNewError(msg + ' (' + regRes.status + ')'); setNewLoading(false); return
      }
      const { slug } = await regRes.json()
      const usersRes = await fetch('/api/users', { credentials: 'include' })
      const allUsers = await usersRes.json()
      const created = allUsers.find((u: any) => u.email === newEmail)
      if (created) {
        await fetch('/api/users/' + created.id, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, credentials: 'include', body: JSON.stringify({ role: newRole, name: newName, permissions: newPerms }) })
      }
      setNewSuccess('Isletme olusturuldu! Slug: ' + slug)
      setNewEmail(''); setNewPassword(''); setNewName(''); setNewRole('BUSINESS_OWNER'); setNewPerms(ALL_MODULES.map(m => m.key)); setNewTenantId('')
      fetchUsers()
    } catch { setNewError('Baglanti hatasi') }
    finally { setNewLoading(false) }
  }

  const remove = async (id: string) => {
    if (!confirm('Kullaniciyi silmek istediginize emin misiniz?')) return
    await fetch('/api/users/' + id, { method: 'DELETE', credentials: 'include' })
    fetchUsers()
  }

  const togglePerm = (key: string) => {
    setForm(f => ({ ...f, permissions: f.permissions.includes(key) ? f.permissions.filter(x => x !== key) : [...f.permissions, key] }))
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
            <label className="text-xs text-gray-500 font-medium">Genel Modul Yetkileri</label>
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
          {newPerms.includes('chatbot-integrations') && (
            <div className="mt-3">
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs text-gray-500 font-medium">Chatbot Platformlari</label>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
                {CHATBOT_PLATFORMS.map(p => {
                  const active = newPerms.includes(p.key)
                  return (
                    <button key={p.key} onClick={() => toggleNewPerm(p.key)}
                      className={'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ' + (active ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : 'bg-[#080b12]/50 border-[#1a2332] text-gray-500 hover:text-gray-300')}>
                      {active ? <Check size={11} /> : <div className="w-[11px]" />}{p.label}
                    </button>
                  )
                })}
              </div>
            </div>
          )}
        </div>
        {newError && <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3"><p className="text-red-400 text-xs">{newError}</p></div>}
        {newSuccess && <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl px-4 py-3"><p className="text-emerald-400 text-xs">{newSuccess}</p></div>}
        <button onClick={handleCreateUser} disabled={newLoading || !newEmail || !newPassword} className="w-full sm:w-auto px-6 py-2.5 bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-xl text-sm font-medium hover:shadow-lg hover:shadow-blue-500/25 transition-all disabled:opacity-50">{newLoading ? 'Olusturuluyor...' : 'Kullanici Olustur'}</button>
      </div>

      {/* Tenant Credit Management */}
      <div className="bg-[#0d1117]/80 backdrop-blur-xl border border-[#1a2332] rounded-2xl p-6 space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center text-white shadow-lg shadow-emerald-500/20"><Coins size={20} /></div>
          <div><h3 className="text-white font-semibold">Mesaj Kredisi Yonetimi</h3><p className="text-xs text-gray-500">Isletmelere bonus mesaj kredisi tanimlayin, detaylari goruntuleyin</p></div>
        </div>
        {tenantsUsage.length === 0 ? (
          <div className="text-center py-8 text-gray-500 text-sm">Yukleniyor...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead><tr className="border-b border-[#1a2332]"><th className="text-left text-xs text-gray-500 font-medium px-3 py-2">Isletme</th><th className="text-center text-xs text-gray-500 font-medium px-3 py-2">Bonus Kredi</th><th className="text-center text-xs text-gray-500 font-medium px-3 py-2">Aylik Kullanim</th><th className="text-center text-xs text-gray-500 font-medium px-3 py-2">Kalan</th><th className="text-right text-xs text-gray-500 font-medium px-3 py-2">Islem</th></tr></thead>
              <tbody>{tenantsUsage.map((t: any) => (
                <tr key={t.id} className="border-b border-[#1a2332]/50 last:border-0 hover:bg-white/[0.02] transition-colors">
                  <td className="px-3 py-3 text-sm text-white font-medium">{t.name}</td>
                  <td className="px-3 py-3 text-center"><span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">{t.messageCredit}</span></td>
                  <td className="px-3 py-3 text-center text-sm text-gray-400">{t.monthlyUsed} / {t.monthlyLimit === -1 ? 'sinirsiz' : t.monthlyLimit}</td>
                  <td className="px-3 py-3 text-center text-sm text-gray-400">{t.monthlyRemaining === -1 ? 'sinirsiz' : t.monthlyRemaining}</td>
                  <td className="px-3 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button onClick={() => { setCreditTenant(t); setCreditAmount(100); setCreditReason(''); setCreditMsg(''); setShowCreditModal(true) }} className="px-3 py-1.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-lg text-xs font-medium hover:bg-emerald-500/20 transition-all">Mesaj Ekle</button>
                      <button onClick={() => { setCreditTenant(t); setShowDetailModal(true); loadDetail(t.id) }} className="px-3 py-1.5 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-lg text-xs font-medium hover:bg-blue-500/20 transition-all">Detay</button>
                    </div>
                  </td>
                </tr>
              ))}</tbody>
            </table>
          </div>
        )}
      </div>

      <div className="relative max-w-xs"><Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" /><input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Ara..." className="w-full bg-[#0d1117]/80 border border-[#1a2332] rounded-xl pl-9 pr-4 py-2 text-white text-sm focus:outline-none focus:border-blue-500/50 placeholder-gray-600 transition-all" /></div>
      {fetchError && <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3"><p className="text-red-400 text-xs">{fetchError}</p></div>}

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
                  {u.role !== 'SUPER_ADMIN' && u.id !== currentUser?.id && (
                    u.status === 'restricted'
                      ? <button onClick={async () => { await fetch('/api/users/' + u.id + '/unrestrict', { method: 'PATCH', credentials: 'include' }); fetchUsers() }} className="p-2 rounded-lg hover:bg-white/5 text-emerald-500 hover:text-emerald-400 transition-all" title="Kisitlamayi Kaldir"><Check size={14} /></button>
                      : <button onClick={async () => { await fetch('/api/users/' + u.id + '/restrict', { method: 'PATCH', credentials: 'include' }); fetchUsers() }} className="p-2 rounded-lg hover:bg-white/5 text-red-500 hover:text-red-400 transition-all" title="Hesabi Kisitla"><ShieldOff size={14} /></button>
                  )}
                  <button onClick={() => openEdit(u)} className="p-2 rounded-lg hover:bg-white/5 text-gray-500 hover:text-blue-400 transition-all"><Pencil size={14} /></button>
                  {u.role !== 'SUPER_ADMIN' && u.id !== currentUser?.id && (
                    <button onClick={() => remove(u.id)} className="p-2 rounded-lg hover:bg-white/5 text-gray-500 hover:text-red-400 transition-all"><Trash2 size={14} /></button>
                  )}
                </div></td>
              </tr>
            ))}</tbody>
          </table>
          {filtered.length === 0 && <div className="text-center py-16 text-gray-500 text-sm">Kullanici bulunamadi</div>}
        </div>
      )}

      {/* Credit Modal */}
      {showCreditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowCreditModal(false)} />
          <div className="relative w-full max-w-md bg-[#0d1117] border border-[#1a2332] rounded-2xl shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-[#1a2332]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center text-white shadow-lg shadow-emerald-500/20"><Coins size={20} /></div>
                <div><h3 className="text-lg font-semibold text-white">Mesaj Kredisi Ekle</h3><p className="text-xs text-gray-500">{creditTenant?.name}</p></div>
              </div>
              <button onClick={() => setShowCreditModal(false)} className="p-2 rounded-lg hover:bg-white/5 text-gray-500"><X size={18} /></button>
            </div>
            <div className="p-6 space-y-5">
              <div>
                <label className="text-xs text-gray-500 block mb-1.5">Miktar <span className="text-red-400">*</span></label>
                <input type="number" min="1" value={creditAmount} onChange={e => setCreditAmount(Math.max(1, parseInt(e.target.value) || 0))} className="w-full bg-[#080b12]/80 border border-[#1a2332] rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-emerald-500/50 placeholder-gray-600 transition-all" />
              </div>
              <div>
                <label className="text-xs text-gray-500 block mb-1.5">Sebep <span className="text-red-400">*</span></label>
                <textarea value={creditReason} onChange={e => setCreditReason(e.target.value)} placeholder="Kredi tanimlama sebebini yazin..." rows={3} className="w-full bg-[#080b12]/80 border border-[#1a2332] rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-emerald-500/50 placeholder-gray-600 transition-all resize-none" />
              </div>
              {creditMsg && <div className={'bg-' + (creditMsg.startsWith('Hata') ? 'red' : 'emerald') + '-500/10 border border-' + (creditMsg.startsWith('Hata') ? 'red' : 'emerald') + '-500/20 rounded-xl px-4 py-3'}><p className={'text-' + (creditMsg.startsWith('Hata') ? 'red' : 'emerald') + '-400 text-xs'}>{creditMsg}</p></div>}
              <div className="flex gap-3 justify-end pt-2">
                <button onClick={() => setShowCreditModal(false)} className="px-5 py-2.5 border border-[#1a2332] text-gray-400 rounded-xl text-sm font-medium hover:text-white transition-all">Iptal</button>
                <button onClick={async () => {
                  if (!creditReason.trim()) { setCreditMsg('Hata: Sebep zorunludur'); return }
                  setCreditSaving(true); setCreditMsg('')
                  try {
                    const res = await fetch('/api/tenants/' + creditTenant.id + '/credit', { method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'include', body: JSON.stringify({ amount: creditAmount, reason: creditReason }) })
                    if (res.ok) { setCreditMsg(creditAmount + ' mesaj kredisi eklendi!'); setShowCreditModal(false); fetchUsage() }
                    else setCreditMsg('Hata: (' + res.status + ')')
                  } catch { setCreditMsg('Hata: Baglanti hatasi') }
                  finally { setCreditSaving(false) }
                }} disabled={creditSaving || !creditReason.trim()} className="px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-emerald-500 text-white rounded-xl text-sm font-medium hover:shadow-lg hover:shadow-emerald-500/25 transition-all disabled:opacity-50">{creditSaving ? 'Kaydediliyor...' : 'Kredi Ekle'}</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {showDetailModal && detailData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowDetailModal(false)} />
          <div className="relative w-full max-w-3xl bg-[#0d1117] border border-[#1a2332] rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between p-6 border-b border-[#1a2332] flex-shrink-0">
              <div>
                <h3 className="text-lg font-semibold text-white">{detailData.name} - Detay</h3>
                <p className="text-xs text-gray-500">Slug: {detailData.slug} | Domain: {detailData.domain || '-'}</p>
              </div>
              <button onClick={() => setShowDetailModal(false)} className="p-2 rounded-lg hover:bg-white/5 text-gray-500"><X size={18} /></button>
            </div>
            <div className="p-6 space-y-6 overflow-y-auto">
              {/* Usage Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="bg-[#080b12]/80 border border-[#1a2332] rounded-xl p-4">
                  <p className="text-xs text-gray-500">Bonus Kredi</p>
                  <p className="text-2xl font-bold text-emerald-400">{detailData.messageCredit}</p>
                </div>
                <div className="bg-[#080b12]/80 border border-[#1a2332] rounded-xl p-4">
                  <p className="text-xs text-gray-500">Aylik Kullanim</p>
                  <p className="text-2xl font-bold text-blue-400">{detailData.monthlyUsed} <span className="text-sm text-gray-500">/ {detailData.monthlyLimit === -1 ? '∞' : detailData.monthlyLimit}</span></p>
                </div>
                <div className="bg-[#080b12]/80 border border-[#1a2332] rounded-xl p-4">
                  <p className="text-xs text-gray-500">Bugun</p>
                  <p className="text-2xl font-bold text-white">{detailData.messagesToday}</p>
                </div>
                <div className="bg-[#080b12]/80 border border-[#1a2332] rounded-xl p-4">
                  <p className="text-xs text-gray-500">Bu Hafta</p>
                  <p className="text-2xl font-bold text-white">{detailData.messagesWeek}</p>
                </div>
              </div>

              {/* Credit Logs */}
              <div>
                <h4 className="text-sm font-semibold text-white mb-3">Kredi Gecmisi</h4>
                {detailData.creditLogs?.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead><tr className="border-b border-[#1a2332]"><th className="text-left text-xs text-gray-500 font-medium px-3 py-2">Tarih</th><th className="text-right text-xs text-gray-500 font-medium px-3 py-2">Miktar</th><th className="text-left text-xs text-gray-500 font-medium px-3 py-2">Sebep</th></tr></thead>
                      <tbody>{detailData.creditLogs.map((log: any) => (
                        <tr key={log.id} className="border-b border-[#1a2332]/50 last:border-0">
                          <td className="px-3 py-2 text-xs text-gray-400">{new Date(log.createdAt).toLocaleDateString('tr-TR')}</td>
                          <td className="px-3 py-2 text-right"><span className="text-emerald-400 text-xs font-medium">+{log.amount}</span></td>
                          <td className="px-3 py-2 text-xs text-gray-500">{log.reason}</td>
                        </tr>
                      ))}</tbody>
                    </table>
                  </div>
                ) : <p className="text-gray-500 text-sm">Henuz kredi eklenmemis</p>}
              </div>

              {/* Wheel History */}
              <div>
                <h4 className="text-sm font-semibold text-white mb-3">Cark Gecmisi</h4>
                {detailData.wheels?.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead><tr className="border-b border-[#1a2332]"><th className="text-left text-xs text-gray-500 font-medium px-3 py-2">Tarih</th><th className="text-center text-xs text-gray-500 font-medium px-3 py-2">Durum</th><th className="text-right text-xs text-gray-500 font-medium px-3 py-2">Sonuc</th></tr></thead>
                      <tbody>{detailData.wheels.filter((w: any) => w.status === 'completed').map((w: any) => (
                        <tr key={w.id} className="border-b border-[#1a2332]/50 last:border-0">
                          <td className="px-3 py-2 text-xs text-gray-400">{new Date(w.createdAt).toLocaleDateString('tr-TR')}</td>
                          <td className="px-3 py-2 text-center"><span className="inline-flex px-2 py-0.5 bg-emerald-500/10 text-emerald-400 rounded text-[10px] border border-emerald-500/20">{w.status}</span></td>
                          <td className="px-3 py-2 text-right text-emerald-400 text-xs font-medium">+{w.result}</td>
                        </tr>
                      ))}</tbody>
                    </table>
                  </div>
                ) : <p className="text-gray-500 text-sm">Henuz cark kaydi yok</p>}
              </div>
            </div>
          </div>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowModal(false)} />
          <div className="relative w-full max-w-2xl bg-[#0d1117] border border-[#1a2332] rounded-2xl shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-[#1a2332]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/20"><Pencil size={20} /></div>
                <div><h3 className="text-lg font-semibold text-white">{editingUser ? 'Kullanici Duzenle' : 'Yeni Kullanici'}</h3><p className="text-xs text-gray-500">{editingUser?.email || ''}</p></div>
              </div>
              <button onClick={() => setShowModal(false)} className="p-2 rounded-lg hover:bg-white/5 text-gray-500"><X size={18} /></button>
            </div>
            <div className="p-6 space-y-5 max-h-[90vh] overflow-y-auto">
              <div className="grid grid-cols-2 gap-4">
                <div><label className="text-xs text-gray-500 block mb-1.5">Ad Soyad</label><input type="text" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Kullanici adi" className="w-full bg-[#080b12]/80 border border-[#1a2332] rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-blue-500/50 placeholder-gray-600 transition-all" /></div>
                <div><label className="text-xs text-gray-500 block mb-1.5">E-posta</label><input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="ornek@email.com" disabled={!!editingUser} className="w-full bg-[#080b12]/80 border border-[#1a2332] rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-blue-500/50 placeholder-gray-600 transition-all disabled:opacity-50" /></div>
                {!editingUser && <div><label className="text-xs text-gray-500 block mb-1.5">Parola</label><input type="password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} placeholder="En az 6 karakter" className="w-full bg-[#080b12]/80 border border-[#1a2332] rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-blue-500/50 placeholder-gray-600 transition-all" /></div>}
                <div><label className="text-xs text-gray-500 block mb-1.5">Rol</label>
                  <select value={form.role} onChange={e => setForm({ ...form, role: e.target.value })} disabled={editingUser?.role === 'SUPER_ADMIN'} className="w-full bg-[#080b12]/80 border border-[#1a2332] rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-blue-500/50 transition-all disabled:opacity-50">
                    {ROLE_OPTIONS.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
                    {editingUser?.role === 'SUPER_ADMIN' && <option value="SUPER_ADMIN">Super Admin</option>}
                  </select>
                  {editingUser?.role === 'SUPER_ADMIN' && <p className="text-xs text-amber-400 mt-1">Super Admin rolu degistirilemez</p>}
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs text-gray-500 font-medium">Modul Yetkileri</label>
                  <div className="flex gap-2">
                    <button onClick={() => setForm(f => ({ ...f, permissions: ALL_MODULES.map(m => m.key) }))} className="text-xs text-blue-400 hover:text-blue-300">Tumunu Sec</button>
                    <button onClick={() => setForm(f => ({ ...f, permissions: [] }))} className="text-xs text-gray-500 hover:text-gray-400">Temizle</button>
                  </div>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                  {ALL_MODULES.map(m => {
                    const active = form.permissions.includes(m.key)
                    return (
                      <button key={m.key} onClick={() => togglePerm(m.key)}
                        className={'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ' + (active ? 'bg-blue-500/10 border-blue-500/30 text-blue-400' : 'bg-[#080b12]/50 border-[#1a2332] text-gray-500 hover:text-gray-300')}>
                        {active ? <Check size={11} /> : <div className="w-[11px]" />}{m.label}
                      </button>
                    )
                  })}
                </div>
              </div>
              {form.permissions.includes('chatbot-integrations') && (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs text-gray-500 font-medium">Chatbot Platformlari</label>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                    {CHATBOT_PLATFORMS.map(p => {
                      const active = form.permissions.includes(p.key)
                      return (
                        <button key={p.key} onClick={() => togglePerm(p.key)}
                          className={'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ' + (active ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : 'bg-[#080b12]/50 border-[#1a2332] text-gray-500 hover:text-gray-300')}>
                          {active ? <Check size={11} /> : <div className="w-[11px]" />}{p.label}
                        </button>
                      )
                    })}
                  </div>
                </div>
              )}
              {saveError && <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3"><p className="text-red-400 text-xs">{saveError}</p></div>}
              <div className="flex gap-3 justify-end pt-2"><button onClick={() => setShowModal(false)} className="px-5 py-2.5 border border-[#1a2332] text-gray-400 rounded-xl text-sm font-medium hover:text-white transition-all">Iptal</button><button onClick={save} disabled={loading || !form.email || (!editingUser && !form.password)} className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-xl text-sm font-medium hover:shadow-lg hover:shadow-blue-500/25 transition-all disabled:opacity-50">{loading ? 'Kaydediliyor...' : 'Kaydet'}</button></div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
