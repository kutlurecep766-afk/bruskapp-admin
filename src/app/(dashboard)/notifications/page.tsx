'use client'
import { useState, useEffect } from 'react'

const NOTIF_ICONS: Record<string, { svg: string; color: string; bg: string }> = {
  whatsapp: { svg: `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.626.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" fill="#25D366"/></svg>`, color: '#25D366', bg: '#25D366' },
  instagram: { svg: `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" fill="#E4405F"/></svg>`, color: '#E4405F', bg: '#E4405F' },
  facebook: { svg: `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" fill="#0866FF"/></svg>`, color: '#0866FF', bg: '#0866FF' },
  telegram: { svg: `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M11.944 0A12 12 0 000 12a12 12 0 0012 12 12 12 0 0012-12A12 12 0 0012 0a12 12 0 00-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 01.171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" fill="#0088CC"/></svg>`, color: '#0088CC', bg: '#0088CC' },
}

const getNotifIcon = (type: string) => {
  const lower = type.toLowerCase()
  for (const [key, val] of Object.entries(NOTIF_ICONS)) {
    if (lower.includes(key)) return val
  }
  return null
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<any[]>([])
  const [prefs, setPrefs] = useState<{ newOrder: boolean; lowStock: boolean; newMessage: boolean }>({ newOrder: true, lowStock: true, newMessage: true })
  const [prefResult, setPrefResult] = useState<{ ok: boolean; msg: string } | null>(null)

  const [tgConfig, setTgConfig] = useState<{ botToken: string; chatId: string; configured: boolean; enabled: boolean }>({ botToken: '', chatId: '', configured: false, enabled: false })
  const [tgBotToken, setTgBotToken] = useState('')
  const [tgChatId, setTgChatId] = useState('')
  const [tgSaving, setTgSaving] = useState(false)
  const [tgResult, setTgResult] = useState<{ ok: boolean; msg: string } | null>(null)

  const fetchNotifications = async () => {
    try {
      const res = await fetch('/api/notifications', { credentials: 'include' })
      if (res.ok) setNotifications(await res.json())
    } catch {}
  }

  const markRead = async (id: number) => {
    await fetch('/api/notifications/read/' + id, { method: 'POST', credentials: 'include' })
    fetchNotifications()
  }

  const markAllRead = async () => {
    await fetch('/api/notifications/read-all', { method: 'POST', credentials: 'include' })
    fetchNotifications()
  }

  const fetchTelegramConfig = async () => {
    try {
      const res = await fetch('/api/notifications/telegram-config', { credentials: 'include' })
      if (res.ok) {
        const data = await res.json()
        setTgConfig(data)
        setTgBotToken(data.botToken)
        setTgChatId(data.chatId)
      }
    } catch {}
  }

  const toggleTelegram = async () => {
    try {
      const res = await fetch('/api/notifications/telegram-toggle', {
        method: 'POST', credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enabled: !tgConfig.enabled }),
      })
      if (res.ok) {
        const data = await res.json()
        setTgConfig(prev => ({ ...prev, enabled: data.enabled }))
        setTgResult({ ok: true, msg: data.message })
        setTimeout(() => setTgResult(null), 3000)
      }
    } catch {}
  }

  const saveTelegramConfig = async () => {
    setTgSaving(true)
    setTgResult(null)
    try {
      const res = await fetch('/api/notifications/telegram-config', {
        method: 'POST', credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ botToken: tgBotToken, chatId: tgChatId }),
      })
      const data = await res.json()
      setTgResult({ ok: data.success, msg: data.message })
      if (data.success) fetchTelegramConfig()
    } catch (e: any) {
      setTgResult({ ok: false, msg: 'Baglanti hatasi: ' + e.message })
    } finally {
      setTgSaving(false)
    }
  }

  const fetchPreferences = async () => {
    try {
      const res = await fetch('/api/notifications/preferences', { credentials: 'include' })
      if (res.ok) setPrefs(await res.json())
    } catch {}
  }

  const savePreference = async (key: string, value: boolean) => {
    setPrefResult(null)
    try {
      const updated = { ...prefs, [key]: value }
      const res = await fetch('/api/notifications/preferences', {
        method: 'POST', credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updated),
      })
      if (res.ok) {
        setPrefs(updated)
        setPrefResult({ ok: true, msg: 'Tercihler kaydedildi' })
      } else {
        setPrefResult({ ok: false, msg: 'Kaydedilemedi' })
      }
    } catch { setPrefResult({ ok: false, msg: 'Hata' }) } finally {
      setTimeout(() => setPrefResult(null), 2000)
    }
  }

  useEffect(() => { fetchNotifications(); fetchTelegramConfig(); fetchPreferences() }, [])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-white">Bildirimler</h1>
        <button onClick={markAllRead} className="text-xs text-blue-400 hover:text-blue-300 bg-blue-500/10 px-3 py-1.5 rounded-lg">
          Tumunu okundu isaretle
        </button>
      </div>

      {/* Push Bildirim Tercihleri */}
      <div className="bg-[#0d1117]/80 backdrop-blur-xl border border-[#1a2332] rounded-2xl p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-3 h-3 rounded-full bg-indigo-400" />
          <h2 className="text-sm font-semibold text-white">Bildirim Tercihleri</h2>
          {prefResult && <span className={'text-xs ' + (prefResult.ok ? 'text-green-400' : 'text-red-400')}>{prefResult.msg}</span>}
        </div>
        <div className="space-y-3">
          {[
            { key: 'newOrder', label: 'Yeni Sipariş', desc: 'Yeni sipariş alındığında bildirim gönder' },
            { key: 'lowStock', label: 'Düşük Stok Uyarısı', desc: 'Stok eşik değerin altına düştüğünde uyarı' },
            { key: 'newMessage', label: 'Yeni Mesaj', desc: 'WhatsApp/Instagram/Telegram\'dan yeni mesaj geldiğinde bildirim' },
          ].map(item => (
            <div key={item.key} className="flex items-center justify-between py-2">
              <div>
                <p className="text-sm text-white">{item.label}</p>
                <p className="text-xs text-gray-500">{item.desc}</p>
              </div>
              <button
                onClick={() => savePreference(item.key, !(prefs as any)[item.key])}
                className={'relative inline-flex h-5 w-9 items-center rounded-full transition-all ' + ((prefs as any)[item.key] ? 'bg-indigo-500' : 'bg-gray-600')}
              >
                <span className={'inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-all ' + ((prefs as any)[item.key] ? 'translate-x-4.5' : 'translate-x-1')} />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Telegram Bildirim Ayarlari */}
      <div className="bg-[#0d1117]/80 backdrop-blur-xl border border-[#1a2332] rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 rounded-full" style={{ background: '#0088CC' }} />
            <h2 className="text-sm font-semibold text-white">Telegram Bildirim Ayarlari</h2>
          </div>
          <div className="flex items-center gap-2">
            {tgConfig.configured && (
              <span className={'text-xs px-2 py-0.5 rounded-full ' + (tgConfig.enabled ? 'text-green-400 bg-green-500/10' : 'text-red-400 bg-red-500/10')}>
                {tgConfig.enabled ? 'Aktif' : 'Devre Disi'}
              </span>
            )}
            {tgConfig.configured && (
              <button onClick={toggleTelegram}
                className={'relative inline-flex h-5 w-9 items-center rounded-full transition-all ' + (tgConfig.enabled ? 'bg-green-500' : 'bg-gray-600')}>
                <span className={'inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-all ' + (tgConfig.enabled ? 'translate-x-4.5' : 'translate-x-1')} />
              </button>
            )}
          </div>
        </div>
        <div className="space-y-3">
          <div>
            <label className="text-xs text-gray-400 block mb-1">Bot Token</label>
            <input type="text" value={tgBotToken} onChange={e => setTgBotToken(e.target.value)}
              placeholder={tgConfig.botToken ? '•••••• (kayitli)' : 'Telegram Bot Token'}
              className="w-full bg-[#1a2332]/50 border border-[#1a2332] rounded-xl px-3 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-blue-500/50" />
          </div>
          <div>
            <label className="text-xs text-gray-400 block mb-1">Sohbet ID (Chat ID)</label>
            <input type="text" value={tgChatId} onChange={e => setTgChatId(e.target.value)}
              placeholder='Telegram Chat ID (ornek: 123456789)'
              className="w-full bg-[#1a2332]/50 border border-[#1a2332] rounded-xl px-3 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-blue-500/50" />
          </div>
          <p className="text-xs text-gray-500">Bot token dogrulandiktan sonra test mesaji gonderilecek.</p>
          <button onClick={saveTelegramConfig} disabled={tgSaving || !tgBotToken || !tgChatId}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all bg-blue-500/10 text-blue-400 hover:text-blue-300 border border-blue-500/20 hover:border-blue-500/40 disabled:opacity-50">
            {tgSaving ? 'Kaydediliyor...' : 'Kaydet ve Test Et'}
          </button>
          {tgResult && <p className={'text-sm ' + (tgResult.ok ? 'text-green-400' : 'text-red-400')}>{tgResult.msg}</p>}
        </div>
      </div>

      {/* Gecmis Bildirimler */}
      <div className="bg-[#0d1117]/80 backdrop-blur-xl border border-[#1a2332] rounded-2xl p-6">
        <h2 className="text-sm font-semibold text-white mb-4">Gecmis Bildirimler</h2>
        {notifications.length === 0 ? (
          <p className="text-gray-500 text-sm">Henuz bildirim yok</p>
        ) : (
          <div className="space-y-2">
            {notifications.map((n: any) => {
              const icon = getNotifIcon(n.type)
              return (
                <div key={n.id} onClick={() => !n.read && markRead(n.id)}
                  className={'flex items-start gap-3 p-3 rounded-xl cursor-pointer transition-all border ' + (n.read ? 'bg-[#1a2332]/20 border-transparent' : 'bg-blue-500/5 border-blue-500/20')}>
                  <div className={'w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 ' + (icon ? '' : '')}
                    style={icon ? { backgroundColor: icon.bg + '1A', color: icon.color } : {}}>
                    {icon ? <div className="w-4 h-4" dangerouslySetInnerHTML={{ __html: icon.svg }} /> : <div className={'w-2 h-2 rounded-full ' + (n.read ? 'bg-gray-600' : 'bg-blue-400')} />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={'text-sm ' + (n.read ? 'text-gray-400' : 'text-white font-medium')}>{n.title}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{n.message}</p>
                  </div>
                  <span className="text-xs text-gray-600 flex-shrink-0">{new Date(n.createdAt).toLocaleString('tr-TR')}</span>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
