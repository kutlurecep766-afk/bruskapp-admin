'use client'
import { useState, useEffect } from 'react'

const PLATFORMS = [
  { key: 'whatsapp', label: 'WhatsApp', color: '#25D366' },
  { key: 'instagram', label: 'Instagram', color: '#E4405F' },
  { key: 'telegram', label: 'Telegram', color: '#0088CC' },
  { key: 'trendyol', label: 'Trendyol', color: '#FF6000' },
  { key: 'hepsiburada', label: 'Hepsiburada', color: '#8B5CF6' },
]

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<any[]>([])
  const [sending, setSending] = useState<string | null>(null)
  const [result, setResult] = useState<{ ok: boolean; msg: string } | null>(null)

  // Telegram config state
  const [tgConfig, setTgConfig] = useState<{ botToken: string; chatId: string; configured: boolean; enabled: boolean }>({ botToken: '', chatId: '', configured: false, enabled: false })
  const [tgBotToken, setTgBotToken] = useState('')
  const [tgChatId, setTgChatId] = useState('')
  const [tgSaving, setTgSaving] = useState(false)
  const [tgResult, setTgResult] = useState<{ ok: boolean; msg: string } | null>(null)

  const sendTest = async (platform: string) => {
    setSending(platform)
    setResult(null)
    try {
      const res = await fetch('/api/notifications/test/' + platform, { method: 'POST', credentials: 'include' })
      const data = await res.json()
      setResult({ ok: res.ok, msg: res.ok ? 'Bildirim gonderildi: ' + data.title : 'Hata: ' + (data.message || 'Bilinmeyen hata') })
      fetchNotifications()
    } catch (e: any) {
      setResult({ ok: false, msg: 'Baglanti hatasi: ' + e.message })
    } finally {
      setSending(null)
    }
  }

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
        method: 'POST',
        credentials: 'include',
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
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ botToken: tgBotToken, chatId: tgChatId }),
      })
      const data = await res.json()
      setTgResult({ ok: data.success, msg: data.message })
      if (data.success) {
        fetchTelegramConfig()
      }
    } catch (e: any) {
      setTgResult({ ok: false, msg: 'Baglanti hatasi: ' + e.message })
    } finally {
      setTgSaving(false)
    }
  }

  useEffect(() => { fetchNotifications(); fetchTelegramConfig() }, [])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-white">Bildirimler</h1>
        <button onClick={markAllRead} className="text-xs text-blue-400 hover:text-blue-300 bg-blue-500/10 px-3 py-1.5 rounded-lg">
          Tumunu okundu isaretle
        </button>
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
                {tgConfig.enabled ? 'Aktif' : 'Devre D???'}
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
          <p className="text-xs text-gray-500">Bot token dogrulandiktan sonra test mesaji gonderilecek. Chat ID'yi @userinfobot ile ogrenebilirsiniz.</p>
          <button onClick={saveTelegramConfig} disabled={tgSaving || !tgBotToken || !tgChatId}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all bg-blue-500/10 text-blue-400 hover:text-blue-300 border border-blue-500/20 hover:border-blue-500/40 disabled:opacity-50">
            {tgSaving ? 'Kaydediliyor...' : 'Kaydet ve Test Et'}
          </button>
          {tgResult && (
            <p className={'text-sm ' + (tgResult.ok ? 'text-green-400' : 'text-red-400')}>{tgResult.msg}</p>
          )}
        </div>
      </div>

      {/* Test Bildirimi Gonder */}
      <div className="bg-[#0d1117]/80 backdrop-blur-xl border border-[#1a2332] rounded-2xl p-6">
        <h2 className="text-sm font-semibold text-white mb-4">Test Bildirimi Gonder</h2>
        <div className="flex flex-wrap gap-3">
          {PLATFORMS.map(p => (
            <button key={p.key} onClick={() => sendTest(p.key)} disabled={sending === p.key}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all bg-[#1a2332]/50 text-gray-300 hover:text-white border border-[#1a2332] hover:border-blue-500/30 disabled:opacity-50">
              <div className="w-2.5 h-2.5 rounded-full" style={{ background: p.color }} />
              {sending === p.key ? 'Gonderiliyor...' : p.label + ' Test'}
            </button>
          ))}
        </div>
        {result && (
          <p className={'mt-3 text-sm ' + (result.ok ? 'text-green-400' : 'text-red-400')}>{result.msg}</p>
        )}
      </div>

      {/* Gecmis Bildirimler */}
      <div className="bg-[#0d1117]/80 backdrop-blur-xl border border-[#1a2332] rounded-2xl p-6">
        <h2 className="text-sm font-semibold text-white mb-4">Gecmis Bildirimler</h2>
        {notifications.length === 0 ? (
          <p className="text-gray-500 text-sm">Henuz bildirim yok</p>
        ) : (
          <div className="space-y-2">
            {notifications.map((n: any) => (
              <div key={n.id} onClick={() => !n.read && markRead(n.id)}
                className={'flex items-start gap-3 p-3 rounded-xl cursor-pointer transition-all border ' + (n.read ? 'bg-[#1a2332]/20 border-transparent' : 'bg-blue-500/5 border-blue-500/20')}>
                <div className={'w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ' + (n.read ? 'bg-gray-600' : 'bg-blue-400')} />
                <div className="flex-1 min-w-0">
                  <p className={'text-sm ' + (n.read ? 'text-gray-400' : 'text-white font-medium')}>{n.title}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{n.message}</p>
                </div>
                <span className="text-xs text-gray-600 flex-shrink-0">{new Date(n.createdAt).toLocaleString('tr-TR')}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
