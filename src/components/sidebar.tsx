'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard, Users, QrCode,
  MessageSquare, Bell, ShoppingCart, CalendarCheck, CreditCard,
  BarChart3, Cog, Shield, MessageCircle,
  Package, Store, Truck, Sun, Moon, Crown, Link2, Radio, Megaphone
} from 'lucide-react'
import { useTheme } from './theme-provider'

const ALL_MODULES = [
  { key: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, href: '/', perm: 'dashboard' },
  { key: 'customers', label: 'Müşteriler', icon: Users, href: '/customers', perm: 'customers' },
  { key: 'products', label: 'Ürünler', icon: Package, href: '/products', perm: 'products' },
  { key: 'qr-menu', label: 'QR Menu', icon: QrCode, href: '/qr-menu', perm: 'qr-menu' },
  { key: 'messages', label: 'Mesajlar', icon: MessageSquare, href: '/messages', perm: 'messages' },
  { key: 'notifications', label: 'Bildirimler', icon: Bell, href: '/notifications', perm: 'notifications' },
  { key: 'orders', label: 'Siparişler', icon: ShoppingCart, href: '/orders', perm: 'orders' },
  { key: 'reservations', label: 'Rezervasyonlar', icon: CalendarCheck, href: '/reservations', perm: 'reservations' },
  { key: 'kargo', label: 'Kargo', icon: Truck, href: '/kargo', perm: 'kargo' },
  { key: 'payments', label: 'Ödemeler', icon: CreditCard, href: '/payments', perm: 'payments' },
  { key: 'analytics', label: 'Analitik', icon: BarChart3, href: '/analytics', perm: 'analytics' },
  { key: 'whatsapp', label: 'WhatsApp', icon: MessageCircle, href: '/whatsapp', perm: 'whatsapp' },
  { key: 'instagram', label: 'Instagram', icon: MessageCircle, href: '/instagram', perm: 'instagram' },
  { key: 'pazaryeri', label: 'Pazaryeri', icon: Store, href: '/pazaryeri', perm: 'trendyol' },
  { key: 'stok', label: 'Stok Yönetimi', icon: Package, href: '/stok', perm: 'products' },
  { key: 'settings', label: 'Ayarlar', icon: Cog, href: '/settings', perm: 'settings' },
  { key: 'chatbot-integrations', label: 'Chatbot Entegrasyonlar\u0131', icon: Link2, href: '/chatbot-integrations', perm: 'chatbot-integrations' },
  { key: 'zernio-accounts', label: 'Aboneler / Hesaplar', icon: Radio, href: '/zernio-accounts', perm: 'chatbot-integrations' },
]

export default function Sidebar({ collapsed, toggle }: { collapsed: boolean; toggle: () => void }) {
  const pathname = usePathname()
  const basePath = '/brk-mgmt'
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    async function loadUser() {
      try {
        let res = await fetch('/api/users/me', { credentials: 'include' })
        if (res.status === 401) {
          const refreshRes = await fetch('/api/auth/refresh', { method: 'POST', credentials: 'include' })
          if (refreshRes.ok) res = await fetch('/api/users/me', { credentials: 'include' })
          else { window.location.href = '/brk-mgmt/login'; return }
        }
        if (res.ok) setUser(await res.json())
      } catch {}
    }
    loadUser()
  }, [])

  const isActive = (href: string) => pathname === basePath + (href === '/' ? '' : href)
  const sidebarClass = collapsed ? '-translate-x-full' : 'translate-x-0 w-64'

  const isSuperAdmin = user?.role === 'SUPER_ADMIN'
  const userPermissions = user?.permissions || []
  const initial = (user?.name || user?.email || '?')[0].toUpperCase()

  const hasMarketplacePerm = userPermissions.includes('trendyol') || userPermissions.includes('hepsiburada')
  const visibleItems = isSuperAdmin
    ? ALL_MODULES
    : ALL_MODULES.filter(m => m.key === 'pazaryeri' ? hasMarketplacePerm : userPermissions.includes(m.perm))

  return (
    <>
      {!collapsed && <div className="fixed inset-0 bg-black/50 z-20 lg:hidden" onClick={toggle} />}
      <aside className={'fixed lg:static inset-y-0 left-0 z-30 flex flex-col bg-[#0a0e14] border-r border-[#1a2332] transition-all duration-300 ' + sidebarClass}>
        <div className="flex items-center h-16 px-6 border-b border-[#1a2332]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 flex-shrink-0">
              <svg viewBox="0 0 100 100" className="w-full h-full">
                <defs>
                  <linearGradient id="logobg" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#2563eb"/>
                    <stop offset="100%" stopColor="#1d4ed8"/>
                  </linearGradient>
                </defs>
                <rect width="100" height="100" rx="22" fill="url(#logobg)"/>
                <rect x="6" y="6" width="88" height="88" rx="16" fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth="1.5"/>
                <text x="50" y="70" fontFamily="'Inter','Segoe UI',Arial,sans-serif" fontSize="60" fontWeight="800" fill="white" textAnchor="middle">B</text>
              </svg>
            </div>
            {!collapsed && <span className="text-white font-semibold text-lg">brusk<span className="text-blue-400">app</span></span>}
          </div>
        </div>
        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
          {isSuperAdmin && (
            <Link href="/users" className={'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group relative ' + (isActive('/users') ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' : 'text-gray-400 hover:text-white hover:bg-white/5')}>
              <Shield size={18} className={isActive('/users') ? 'text-amber-400' : 'text-gray-500 group-hover:text-gray-300'} />
              {!collapsed && <span>Kullanıcı Yönetimi</span>}
            </Link>
          )}
          {isSuperAdmin && (
            <Link href="/leads" className={'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group relative ' + (isActive('/leads') ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' : 'text-gray-400 hover:text-white hover:bg-white/5')}>
              <Users size={18} className={isActive('/leads') ? 'text-blue-400' : 'text-gray-500 group-hover:text-gray-300'} />
              {!collapsed && <span>Potansiyel Müşteriler</span>}
            </Link>
          )}
          {isSuperAdmin && (
            <Link href="/webchat" className={'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group relative ' + (isActive('/webchat') ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' : 'text-gray-400 hover:text-white hover:bg-white/5')}>
              <MessageCircle size={18} className={isActive('/webchat') ? 'text-blue-400' : 'text-gray-500 group-hover:text-gray-300'} />
              {!collapsed && <span>Chatbot Ayarları</span>}
            </Link>
          )}
          {isSuperAdmin && (
            <Link href="/announcements" className={'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group relative ' + (isActive('/announcements') ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' : 'text-gray-400 hover:text-white hover:bg-white/5')}>
              <Megaphone size={18} className={isActive('/announcements') ? 'text-amber-400' : 'text-gray-500 group-hover:text-gray-300'} />
              {!collapsed && <span>Duyuru Yonetimi</span>}
            </Link>
          )}
          {visibleItems.map((item) => {
            const active = isActive(item.href)
            const Icon = item.icon
            let linkClass = 'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group relative'
            if (active) linkClass += ' bg-blue-500/10 text-blue-400 border border-blue-500/20'
            else linkClass += ' text-gray-400 hover:text-white hover:bg-white/5'
            return (
              <Link key={item.href} href={item.href} className={linkClass} title={collapsed ? item.label : undefined}>
                <div className="w-5 h-5 flex items-center justify-center flex-shrink-0">
                  <Icon size={18} className={active ? 'text-blue-400' : 'text-gray-500 group-hover:text-gray-300'} />
                </div>
                {!collapsed && <span>{item.label}</span>}
                {collapsed && (
                  <div className="absolute left-full ml-2 px-2 py-1 bg-[#1a2332] text-white text-xs rounded-md opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all whitespace-nowrap z-50 shadow-xl border border-[#2a3a4a]">
                    {item.label}
                  </div>
                )}
                {active && !collapsed && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-blue-400" />}
              </Link>
            )
          })}
        </nav>
        <div className="p-4 border-t border-[#1a2332]">
          <div className="flex items-center gap-3 px-3 py-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white text-xs font-bold">{initial}</div>
            {!collapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-sm text-white truncate">{user?.name || user?.email || ''}</p>
                <p className="text-xs text-gray-500">{isSuperAdmin ? 'Super Admin' : user?.role === 'ADMIN' ? 'Admin' : 'Kullanici'}</p>
                <button onClick={async () => { await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' }); window.location.href = '/brk-mgmt/login'; }} className="text-xs text-red-400 hover:text-red-300 transition-colors mt-1">Çıkış Yap</button>
              </div>
            )}
          </div>
        </div>
      </aside>
    </>
  )
}
