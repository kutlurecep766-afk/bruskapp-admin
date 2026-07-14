'use client'
import { useState, useEffect } from 'react'

const NOTIF_ICONS: Record<string, { svg: string; color: string; bg: string }> = {
  whatsapp: { svg: `<svg viewBox="0 0 39 39" fill="none" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="wa" x1="0.5" y1="0" x2="0.5" y2="1"><stop offset="0" stop-color="#25D366"/><stop offset="1" stop-color="#128C7E"/></linearGradient></defs><circle cx="19.5" cy="19.5" r="19.5" fill="url(#wa)"/><path fill="#fff" d="M10.3 28.7l1.9-7c-.9-1.6-1.4-3.4-1.4-5.2C10.8 11.2 15 7 20.2 7c2.5 0 4.8.9 6.6 2.7 1.8 1.8 2.7 4.1 2.7 6.6 0 5.2-4.2 9.4-9.4 9.4-1.8 0-3.5-.5-5-1.4l-7 1.9zm4.7-2.9l.4.3c1.4.9 3.1 1.4 4.8 1.4 4.3 0 7.8-3.5 7.8-7.8 0-2.1-.8-4-2.3-5.5s-3.4-2.3-5.5-2.3c-4.3 0-7.8 3.5-7.8 7.8 0 1.7.5 3.3 1.5 4.6l.3.4-.9 3.4 3.4-.9z"/></svg>`, color: '#25D366', bg: '#25D366' },
  instagram: { svg: `<svg viewBox="0 0 39 39" fill="none" xmlns="http://www.w3.org/2000/svg"><defs><radialGradient id="ig" cx="0.5" cy="0.5" r="0.5"><stop offset="0" stop-color="#F58529"/><stop offset="0.25" stop-color="#FEDA77"/><stop offset="0.4" stop-color="#DD2A7B"/><stop offset="0.6" stop-color="#8134AF"/><stop offset="0.85" stop-color="#515BD4"/></radialGradient></defs><circle cx="19.5" cy="19.5" r="19.5" fill="url(#ig)"/><rect x="8" y="8" width="23" height="23" rx="5.5" fill="none" stroke="#fff" stroke-width="2.2"/><circle cx="19.5" cy="19.5" r="5.5" fill="none" stroke="#fff" stroke-width="2.2"/><circle cx="26" cy="13" r="1.8" fill="#fff"/></svg>`, color: '#DD2A7B', bg: '#DD2A7B' },
  facebook: { svg: `<svg viewBox="0 0 39 39" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="19.5" cy="19.5" r="19.5" fill="#1877F2"/><path fill="#fff" d="M24.5 7v6H22c-1 0-1.8.8-1.8 1.8v3.6h4.2l-.6 4.4H20v11h-4.6v-11h-3.4v-4.4h3.4V14c0-3.8 3-6.8 6.8-6.8h3.3z"/></svg>`, color: '#1877F2', bg: '#1877F2' },
  telegram: { svg: `<svg viewBox="0 0 39 39" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="19.5" cy="19.5" r="19.5" fill="#0088CC"/><path fill="#fff" d="M14.6 27c-.5 0-.5-.2-.4-.7l1.8-8.2s.1-.4.5-.2l5.2 3.2c.3.2.5.1.5-.1l5.2-6.1c.3-.3.6-.2.4 0L14.8 27.8c-.1.1-.2.2-.2.2z"/></svg>`, color: '#0088CC', bg: '#0088CC' },
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
