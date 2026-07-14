'use client'
import { useState, useEffect } from 'react'
import { Shield } from 'lucide-react'
import { useRouter } from 'next/navigation'
import Sidebar from '@/components/sidebar'
import Topbar from '@/components/topbar'
import NotificationToast from '@/components/NotificationToast'
import AnnouncementBanner from '@/components/announcement-banner'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true)
  const [checked, setChecked] = useState(false)
  const [restricted, setRestricted] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const check = async () => {
      try {
        const res = await fetch('/api/auth/2fa/status', { credentials: 'include' })
        const data = await res.json()
        if (data.setup && !sessionStorage.getItem('2fa_verified')) {
          router.replace('/login')
          return
        }
      } catch {
        try {
          await fetch('/api/auth/refresh', { method: 'POST', credentials: 'include' })
          const res = await fetch('/api/auth/2fa/status', { credentials: 'include' })
          const data = await res.json()
          if (data.setup && !sessionStorage.getItem('2fa_verified')) {
            router.replace('/login')
            return
          }
        } catch {}
      }
      setChecked(true)
    }
    check()
  }, [router])

  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/brk-mgmt/sw.js').then(reg => {
        if (!('PushManager' in window)) return
        Notification.requestPermission().then(perm => {
          if (perm !== 'granted') return
          reg.pushManager.getSubscription().then(sub => {
            if (sub) return sub
            return fetch('/api/push/vapid-key').then(r => r.json()).then(({ publicKey }) => {
              return reg.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: publicKey,
              })
            })
          }).then(sub => {
            if (!sub) return
            const p256dh = sub.getKey('p256dh')
            const auth = sub.getKey('auth')
            if (!p256dh || !auth) return
            const arrToB64 = (arr: ArrayBuffer) => btoa(Array.from(new Uint8Array(arr), b => String.fromCharCode(b)).join(''))
            fetch('/api/push/subscribe', {
              method: 'POST',
              credentials: 'include',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                endpoint: sub.endpoint,
                keys: { p256dh: arrToB64(p256dh), auth: arrToB64(auth) },
              }),
            }).catch(() => {})
          }).catch(() => {})
        }).catch(() => {})
      }).catch(() => {})
    }
  }, [])

  // Periodic status check for account restriction
  useEffect(() => {
    const checkStatus = async () => {
      try {
        const res = await fetch('/api/users/me/status', { credentials: 'include' })
        if (res.ok) {
          const data = await res.json()
          if (data.status === 'restricted') {
            setRestricted(true)
            sessionStorage.clear()
          }
        }
      } catch {}
    }
    checkStatus()
    const interval = setInterval(checkStatus, 30000)
    return () => clearInterval(interval)
  }, [])

  if (!checked) return null

  if (restricted) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#020408] via-[#0a0e17] to-[#020408] flex items-center justify-center p-4 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-40 -left-40 w-80 h-80 bg-gradient-to-br from-red-500/10 via-red-500/5 to-transparent rounded-full blur-3xl" />
          <div className="absolute -bottom-40 -right-40 w-80 h-80 bg-gradient-to-tl from-red-500/10 via-red-500/5 to-transparent rounded-full blur-3xl" />
          <div className="absolute top-1/3 right-1/4 w-2 h-2 rounded-full bg-red-500/20 animate-pulse" />
          <div className="absolute bottom-1/3 left-1/4 w-1.5 h-1.5 rounded-full bg-red-500/15 animate-pulse" style={{ animationDelay: '1s' }} />
        </div>
        <div className="relative bg-[#0d1117]/80 backdrop-blur-2xl border border-red-500/10 rounded-3xl p-10 max-w-md w-full text-center shadow-[0_0_60px_-15px_rgba(220,38,38,0.15)]">
          <div className="flex items-center justify-center gap-2.5 mb-8">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-500 to-red-700 flex items-center justify-center text-white font-bold text-base shadow-lg shadow-red-500/20">B</div>
            <span className="text-white font-bold text-2xl tracking-tight">BRUSK<span className="text-red-400">APP</span></span>
          </div>
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-red-500/20 to-red-600/10 flex items-center justify-center border border-red-500/20">
            <div className="relative">
              <Shield size={40} className="text-red-400" />
              <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
              </div>
            </div>
          </div>
          <h2 className="text-2xl font-bold text-white mb-2 tracking-tight">Hesap Kısıtlandı</h2>
          <div className="w-12 h-0.5 bg-gradient-to-r from-red-500/0 via-red-500/50 to-red-500/0 mx-auto mb-4" />
          <p className="text-sm text-gray-400 leading-relaxed mb-8">Hesabınız yönetici tarafından geçici olarak kısıtlanmıştır. <br />Detaylı bilgi için destek ekibiyle iletişime geçin.</p>
          <button onClick={() => { setRestricted(false); router.push('/login') }} className="px-8 py-3 bg-gradient-to-r from-red-600 to-red-500 text-white rounded-2xl text-sm font-semibold hover:shadow-lg hover:shadow-red-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 tracking-wide">Giriş Sayfasına Dön</button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-screen overflow-hidden" style={{ backgroundColor: 'var(--bg-primary)' }}>
      <Sidebar collapsed={sidebarCollapsed} toggle={() => setSidebarCollapsed(!sidebarCollapsed)} />
      <div className="flex-1 flex flex-col min-w-0">
        <Topbar toggleSidebar={() => setSidebarCollapsed(!sidebarCollapsed)} />
        <main className="flex-1 overflow-y-auto p-4 lg:p-6" style={{ backgroundColor: 'var(--bg-primary)' }}>
          <div className="max-w-7xl mx-auto animate-slide-in">
            <AnnouncementBanner />
            {children}
          </div>
          <NotificationToast />
        </main>
      </div>
    </div>
  )
}