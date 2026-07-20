'use client'
import { useState, useEffect } from 'react'
export default function Topbar({ toggleSidebar }: { toggleSidebar: () => void }) {
  const [showNotifications, setShowNotifications] = useState(false)
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    async function loadUser() {
      try {
        let res = await fetch('/api/users/me', { credentials: 'include' })
        if (res.status === 401) {
          const refreshRes = await fetch('/api/auth/refresh', { method: 'POST', credentials: 'include' })
          if (refreshRes.ok) res = await fetch('/api/users/me', { credentials: 'include' })
          else { return }
        }
        if (res.ok) setUser(await res.json())
      } catch {}
    }
    loadUser()
  }, [])

  const initial = (user?.name || user?.email || '?')[0].toUpperCase()
  const isSuperAdmin = user?.role === 'SUPER_ADMIN'

  const notifications = [
    { text: 'Yeni siparis alindi', time: '2 dk', color: 'blue' },
    { text: 'AI asistan aktif', time: '15 dk', color: 'emerald' },
    { text: 'Odeme basarisiz', time: '1 sa', color: 'red' },
  ]

  const dotColor = (c: string) => {
    if (c === 'blue') return 'bg-blue-400'
    if (c === 'emerald') return 'bg-emerald-400'
    return 'bg-red-400'
  }

  return (
    <header className="sticky top-0 z-10 h-16 bg-[#0a0e14]/80 backdrop-blur-xl border-b border-[#1a2332] flex items-center justify-between px-4 lg:px-6">
      <div className="flex items-center gap-4">
        <button onClick={toggleSidebar} className="p-2 text-gray-400 hover:text-white hover:bg-white/5 rounded-lg">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
        </button>
        <div className="relative hidden sm:block">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
          <input readOnly type="text" placeholder="Ara..." className="w-64 lg:w-96 bg-[#0d1117] border border-[#1a2332] rounded-xl pl-10 pr-4 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500/50" />
        </div>
      </div>
      <div className="flex items-center gap-3">
        <div className="relative">
          <button className="relative p-2 text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors" onClick={() => setShowNotifications(!showNotifications)}>
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
            <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-blue-500 rounded-full text-[10px] text-white flex items-center justify-center font-bold">3</span>
          </button>
          {showNotifications && (
            <div className="absolute right-0 top-full mt-2 w-80 bg-[#0d1117] border border-[#1a2332] rounded-2xl shadow-2xl overflow-hidden">
              <div className="p-4 border-b border-[#1a2332]"><h3 className="text-white font-semibold text-sm">Bildirimler</h3></div>
              {notifications.map((n, i) => (
                <div key={i} className="p-4 hover:bg-white/[0.02] transition-colors cursor-pointer border-b border-[#1a2332]/50 last:border-0">
                  <div className="flex items-start gap-3">
                    <div className={'w-2 h-2 mt-2 rounded-full ' + dotColor(n.color) + ' flex-shrink-0'} />
                    <div><p className="text-sm text-gray-300">{n.text}</p><p className="text-xs text-gray-600 mt-0.5">{n.time} once</p></div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        <button className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-white/5 transition-colors">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white text-xs font-bold">{initial}</div>
          <div className="hidden lg:block text-left">
            <p className="text-sm text-white leading-tight">{user?.name || user?.email || '...'}</p>
            <p className="text-xs text-gray-500">{isSuperAdmin ? 'Super Admin' : user?.role === 'ADMIN' ? 'Admin' : 'Kullanici'}</p>
          </div>
        </button>
      </div>
    </header>
  )
}
