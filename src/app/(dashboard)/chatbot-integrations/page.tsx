'use client'
import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { Link2, CheckCircle, XCircle, Loader2, AlertCircle, CheckCircle2, Bot, X, Globe, Copy, Check, Plug, Unplug, ExternalLink, Shield, Smartphone, Monitor, Activity } from 'lucide-react'

const PLATFORM_SVGS: Record<string, string> = {
  whatsapp: '<svg viewBox="0 0 24 24" fill="none"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.626.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" fill="currentColor"/></svg>',
  instagram: '<svg viewBox="0 0 24 24" fill="none"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" fill="currentColor"/></svg>',
  facebook: '<svg viewBox="0 0 24 24" fill="none"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" fill="currentColor"/></svg>',
  telegram: '<svg viewBox="0 0 24 24" fill="none"><path d="M11.944 0A12 12 0 000 12a12 12 0 0012 12 12 12 0 0012-12A12 12 0 0012 0a12 12 0 00-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 01.171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" fill="currentColor"/></svg>',

  webchat: '<svg viewBox="0 0 24 24" fill="none"><path d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z" stroke="currentColor" stroke-width="1.5" fill="none"/><path d="M9 10h6M9 13h4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>',
}

const platforms = [
  { key: 'whatsapp', label: 'WhatsApp', color: 'text-green-400', bg: 'bg-[#25D366]/10', border: 'border-green-500/20', note: 'WhatsApp Business hesabınızı bağlayın', type: 'zernio' as const },
  { key: 'instagram', label: 'Instagram', color: 'text-pink-400', bg: 'bg-[#E4405F]/10', border: 'border-pink-500/20', note: 'Instagram işletme hesabınızı bağlayın', type: 'zernio' as const },
  { key: 'facebook', label: 'Facebook Messenger', color: 'text-blue-400', bg: 'bg-[#0866FF]/10', border: 'border-blue-500/20', note: 'Facebook sayfanızı bağlayın', type: 'zernio' as const },
  { key: 'telegram', label: 'Telegram', color: 'text-sky-400', bg: 'bg-[#0088CC]/10', border: 'border-sky-500/20', note: "BotFather'da oluşturduğunuz botu bağlayın", type: 'telegram' as const },
  { key: 'webchat', label: 'Web Chat', color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', note: 'Web sitenize entegre edin', type: 'webchat' as const },

]

const WEB_CHAT_STEPS = [
  { title: 'Kodu Kopyalayın', desc: 'Aşağıdaki embed kodunu kopyalayın.' },
  { title: 'Web Sitenize Ekleyin', desc: 'Panelinizde "Özel Kod" bölümüne yapıştırın.' },
  { title: 'Tamam!', desc: 'Müşterileriniz sohbet balonunu görecek.' },
]

const PLATFORM_CATEGORIES = [
  { label: 'Sosyal Medya & Mesajlaşma', keys: ['whatsapp', 'instagram', 'facebook', 'telegram'] },
  { label: 'Web Siteleri', keys: ['webchat'] },

]

export default function ChatbotIntegrationsPage() {
  const searchParams = useSearchParams()
  const [connections, setConnections] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [connecting, setConnecting] = useState<string | null>(null)
  const [profileReady, setProfileReady] = useState(false)
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null)
  const [telegramModal, setTelegramModal] = useState(false)
  const [telegramToken, setTelegramToken] = useState('')
  const [telegramTesting, setTelegramTesting] = useState(false)
  const [telegramError, setTelegramError] = useState('')
  const [telegramConnected, setTelegramConnected] = useState(false)
  const [telegramBotInfo, setTelegramBotInfo] = useState<any>(null)
  const [currentTenantId, setCurrentTenantId] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const [tenantSlug, setTenantSlug] = useState<string>('')
  const [webchatConnected, setWebchatConnected] = useState(false)
  const [webchatModal, setWebchatModal] = useState(false)
  const [webchatCode, setWebchatCode] = useState('')
  const [features, setFeatures] = useState<Record<string, any>>({})
  const [userPerms, setUserPerms] = useState<string[]>([])
  const [isSuperAdmin, setIsSuperAdmin] = useState(false)

  const hasPlatformPerm = (key: string) => {
    const permMap: Record<string, string> = { webchat: 'webchat-widget' }
    return userPerms.includes(permMap[key] || key)
  }

  const showToast = (type: 'success' | 'error', message: string) => {
    setToast({ type, message })
    setTimeout(() => setToast(null), 5000)
  }

  const getTenantId = async (): Promise<string | null> => {
    try {
      const res = await fetch('/api/tenants/me', { credentials: 'include' })
      if (!res.ok) return null
      const json = await res.json()
      const t = json?.tenant || json
      const id = t?.id
      if (id) setCurrentTenantId(id)
      if (t?.slug) setTenantSlug(t.slug)
      return id
    } catch { return null }
  }

  const fetchConnections = async () => {
    try {
      const res = await fetch('/api/zernio/connections', { credentials: 'include' })
      if (res.ok) {
        const json = await res.json()
        setConnections(json.data?.[0] || null)
      }
    } catch {}
    setLoading(false)
  }

  const checkTelegramStatus = async () => {
    const tid = currentTenantId || await getTenantId()
    if (!tid) return
    try {
      const res = await fetch('/api/telegram/tenant-status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tenantId: tid }),
      })
      const json = await res.json()
      setTelegramConnected(json.connected)
      setTelegramBotInfo(json.botInfo || null)
    } catch {}
  }

  const ensureProfile = async () => {
    const tid = await getTenantId()
    if (!tid) return
    try {
      await fetch('/api/zernio/ensure-profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tenantId: tid }),
      })
      setProfileReady(true)
    } catch {}
  }

  useEffect(() => {
    const connected = searchParams.get('connected')
    const error = searchParams.get('error')
    if (connected) showToast('success', connected + ' başarıyla bağlandı!')
    if (error) showToast('error', decodeURIComponent(error))
    fetchConnections()
    ensureProfile()
    checkTelegramStatus()
    fetch('/api/tenants/me', { credentials: 'include' })
      .then(r => r.json())
      .then(t => { const tenant = t?.tenant || t; if (tenant?.features) setFeatures(tenant.features) })
      .catch(() => {})
    fetch('/api/users/me', { credentials: 'include' })
      .then(r => r.ok ? r.json() : null)
      .then(u => { if (u) { setIsSuperAdmin(u.role === 'SUPER_ADMIN'); setUserPerms(u.permissions || []) } })
      .catch(() => {})
  }, [searchParams])

  const handleConnect = async (platform: string, type: string) => {
    if (type === 'telegram') {
      setTelegramToken('')
      setTelegramError('')
      setTelegramModal(true)
      return
    }
    if (type === 'webchat') {
      let slug = tenantSlug
      if (!slug) {
        try {
          const res = await fetch('/api/tenants/me', { credentials: 'include' })
          if (res.ok) { const json = await res.json(); const t = json?.tenant || json; slug = t?.slug || 'default'; setTenantSlug(slug) }
        } catch { slug = 'default' }
      }
      setWebchatCode('<script src="https://bruskapp.com/embed.js" data-tenant="' + slug + '"></script>')
      setWebchatModal(true)
      return
    }
    setConnecting(platform)
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 35000)
    try {
      const tenantId = currentTenantId || await getTenantId()
      if (!tenantId) { setConnecting(null); return }
      const connRes = await fetch('/api/zernio/connect/' + platform + '?tenantId=' + tenantId, { signal: controller.signal })
      const data = await connRes.json()
      clearTimeout(timeout)
      if (data.success && data.url) {
        const isApp = window.matchMedia('(display-mode: standalone)').matches || !!(navigator as any).standalone
        if (isApp) {
          window.open(data.url, '_blank')
          setConnecting(null)
          showToast('success', platform.charAt(0).toUpperCase() + platform.slice(1) + ' sayfası açıldı, onaylayın ve geri dönün.')
        } else {
          window.location.href = data.url
        }
      } else {
        showToast('error', 'Bağlantı URL alınamadı: ' + (data.message || ''))
        setConnecting(null)
      }
    } catch (e: any) {
      clearTimeout(timeout)
      showToast('error', 'Bağlantı hatası: ' + (e.message || ''))
      setConnecting(null)
    }
  }

  const handleTelegramConnect = async () => {
    if (!telegramToken.trim()) { setTelegramError('Lütfen bot token girin'); return }
    setTelegramTesting(true)
    setTelegramError('')
    try {
      const tenantId = currentTenantId || await getTenantId()
      if (!tenantId) { setTelegramError('Tenant bulunamadı'); setTelegramTesting(false); return }
      const res = await fetch('/api/telegram/tenant-connect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tenantId, token: telegramToken.trim() }),
      })
      const json = await res.json()
      if (json.success) {
        setTelegramConnected(true)
        setTelegramBotInfo(json.botInfo)
        setTelegramModal(false)
        showToast('success', 'Telegram botu başarıyla bağlandı!')
      } else { setTelegramError(json.message || 'Bağlantı başarısız') }
    } catch { setTelegramError('Bağlantı hatası') } finally { setTelegramTesting(false) }
  }

  const handleTelegramDisconnect = async () => {
    const tenantId = currentTenantId || await getTenantId()
    if (!tenantId) return
    try {
      await fetch('/api/telegram/tenant-disconnect', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ tenantId }) })
      setTelegramConnected(false)
      setTelegramBotInfo(null)
      showToast('success', 'Telegram bağlantısı kesildi')
    } catch {}
  }

  const handleDisconnect = async (platform: string, type: string) => {
    if (type === 'telegram') { await handleTelegramDisconnect(); return }
    if (type === 'webchat') { setWebchatConnected(false); showToast('success', 'Web Chat devre dışı bırakıldı'); return }
    try {
      const tenantId = currentTenantId || await getTenantId()
      if (!tenantId) return
      await fetch('/api/zernio/disconnect', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ tenantId, platform }) })
      showToast('success', platform + ' bağlantısı kesildi')
      fetchConnections()
    } catch {}
  }

  const isPlatformConnected = (key: string, type: string) => {
    if (key === 'telegram') return telegramConnected
    if (type === 'webchat') return webchatConnected
    return (connections?.platforms || []).some((p: any) => p.platform === key)
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const connectedCount = platforms.filter(p => isPlatformConnected(p.key, p.type)).length
  const availableCount = platforms.filter(p => features[p.key] !== false && (isSuperAdmin || hasPlatformPerm(p.key))).length

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-6 pb-12">
      {toast && (
        <div className={'fixed top-4 right-4 z-50 flex items-center gap-3 px-5 py-3 rounded-xl shadow-2xl border backdrop-blur-xl transition-all animate-in slide-in-from-right ' + (toast.type === 'success' ? 'bg-green-500/10 border-green-500/20 text-green-300' : 'bg-red-500/10 border-red-500/20 text-red-300')}>
          {toast.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
          <span className="text-sm font-medium">{toast.message}</span>
        </div>
      )}

      {telegramModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={() => setTelegramModal(false)}>
          <div className="bg-[#0d1117] border border-[#1a2332] rounded-2xl p-6 w-full max-w-md mx-4 shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-[#0088CC]/10">
                  <svg className="w-6 h-6 text-sky-400" viewBox="0 0 24 24" fill="currentColor"><path d="M11.944 0A12 12 0 000 12a12 12 0 0012 12 12 12 0 0012-12A12 12 0 0012 0a12 12 0 00-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 01.171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/></svg>
                </div>
                <h3 className="text-white font-semibold">Telegram Bot Bağla</h3>
              </div>
              <button onClick={() => setTelegramModal(false)} className="text-gray-500 hover:text-gray-300 transition-colors"><X className="w-5 h-5" /></button>
            </div>
            <p className="text-sm text-gray-500 mb-4">@BotFather ile yeni bir bot oluşturun, aldığınız tokenı aşağıya yapıştırın.</p>
            <input type="text" value={telegramToken} onChange={e => { setTelegramToken(e.target.value); setTelegramError('') }} placeholder="1234567890:ABCdefGHIjklmNOPqrSTUvWXyz" className="w-full px-4 py-3 rounded-xl bg-[#1a2332] border border-[#2a3a4a] text-white text-sm placeholder-gray-600 focus:outline-none focus:border-blue-500/50 transition-colors mb-4" />
            {telegramError && <p className="text-xs text-red-400 mb-3">{telegramError}</p>}
            <button onClick={handleTelegramConnect} disabled={telegramTesting} className="w-full py-3 rounded-xl text-sm font-medium bg-gradient-to-r from-sky-600 to-sky-500 text-white hover:shadow-lg hover:shadow-sky-500/25 transition-all disabled:opacity-50 flex items-center justify-center gap-2">
              {telegramTesting ? <><Loader2 className="w-4 h-4 animate-spin" /> Doğrulanıyor...</> : <><Bot className="w-4 h-4" /> Doğrula ve Bağla</>}
            </button>
          </div>
        </div>
      )}

      {webchatModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={() => { setWebchatModal(false); if (!webchatConnected) setWebchatCode('') }}>
          <div className="bg-[#0d1117] border border-[#1a2332] rounded-2xl p-6 w-full max-w-lg mx-4 shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-emerald-500/10">
                  <Globe className="w-5 h-5 text-emerald-400" />
                </div>
                <h3 className="text-white font-semibold">Web Chat Kurulumu</h3>
              </div>
              <button onClick={() => { setWebchatModal(false); if (!webchatConnected) setWebchatCode('') }} className="text-gray-500 hover:text-gray-300 transition-colors"><X className="w-5 h-5" /></button>
            </div>
            <div className="space-y-6">
              {WEB_CHAT_STEPS.map((step, i) => (
                <div key={i} className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-500 to-green-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">{i + 1}</div>
                    {i < WEB_CHAT_STEPS.length - 1 && <div className="w-0.5 flex-1 bg-[#1a2332] my-1" />}
                  </div>
                  <div className="flex-1 pb-4">
                    <h4 className="text-white font-medium text-sm mb-1">{step.title}</h4>
                    <p className="text-xs text-gray-500">{step.desc}</p>
                  </div>
                </div>
              ))}
              <div className="bg-[#080b12] border border-[#1a2332] rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs text-gray-500 font-medium">Embed Kodu</label>
                  <button onClick={() => copyToClipboard(webchatCode)} className="flex items-center gap-1.5 text-xs text-blue-400 hover:text-blue-300 transition-colors">
                    {copied ? <><Check size={12} className="text-green-400" /> Kopyalandı</> : <><Copy size={12} /> Kopyala</>}
                  </button>
                </div>
                <code className="block text-xs text-gray-300 font-mono bg-[#0d1117] rounded-lg p-3 border border-[#1a2332] break-all">{webchatCode || 'Yükleniyor...'}</code>
              </div>
              <div className="flex gap-3">
                <button onClick={() => { setWebchatModal(false) }} className="flex-1 py-2.5 border border-[#1a2332] text-gray-400 rounded-xl text-sm font-medium hover:text-white transition-all">İptal</button>
                <button onClick={() => { setWebchatConnected(true); setWebchatModal(false); showToast('success', 'Web Chat aktifleştirildi! Kodu web sitenize ekleyin.') }} className="flex-1 py-2.5 bg-gradient-to-r from-emerald-600 to-emerald-500 text-white rounded-xl text-sm font-medium hover:shadow-lg hover:shadow-emerald-500/25 transition-all flex items-center justify-center gap-2">
                  <Check size={16} /> Aktifleştir
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#0f1420] via-[#0d1117] to-[#0a0e14] border border-[#1a2332] p-8">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-500/5 rounded-full blur-3xl" />
        <div className="relative flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
              <Bot className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">Chatbot Bağlantıları</h1>
              <p className="text-sm text-gray-500 mt-0.5">Tüm platformları tek merkezden yönetin</p>
            </div>
          </div>
          <div className="flex items-center gap-3 bg-[#080b12]/60 border border-[#1a2332] rounded-2xl px-5 py-3">
            <Plug className="w-5 h-5 text-emerald-400" />
            <div>
              <p className="text-2xl font-bold text-emerald-400 tracking-tight">{connectedCount}</p>
              <p className="text-[10px] text-gray-600 uppercase tracking-wider">Bağlı Platform</p>
            </div>
          </div>
        </div>
      </div>

      {/* Premium Stats Bento */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'Toplam Platform', value: platforms.length, icon: Link2, color: 'from-blue-500 to-indigo-600', glow: 'shadow-blue-500/20' },
          { label: 'Bağlı Platform', value: connectedCount, icon: Plug, color: 'from-emerald-500 to-teal-600', glow: 'shadow-emerald-500/20' },
          { label: 'Kullanılabilir', value: availableCount, icon: Shield, color: 'from-purple-500 to-pink-600', glow: 'shadow-purple-500/20' },
          { label: 'Bağlanmamış', value: platforms.length - connectedCount, icon: Activity, color: 'from-amber-500 to-orange-600', glow: 'shadow-amber-500/20' },
        ].map((stat, i) => (
          <div key={stat.label} className="group relative overflow-hidden rounded-2xl bg-[#0d1117] border border-[#1a2332] p-5 transition-all duration-500 hover:scale-[1.02] hover:border-white/20">
            <div className="absolute -top-8 -right-8 w-24 h-24 rounded-full bg-gradient-to-br opacity-[0.07] blur-2xl transition-all duration-700 group-hover:opacity-[0.15] group-hover:scale-150" style={{ backgroundImage: `linear-gradient(to bottom right, var(--tw-gradient-stops))` }} />
            <div className="relative">
              <div className={'w-9 h-9 rounded-xl bg-gradient-to-br ' + stat.color + ' flex items-center justify-center mb-3 shadow-lg ' + stat.glow}>
                <stat.icon size={15} className="text-white" />
              </div>
              <p className="text-2xl font-bold text-white tracking-tight">{stat.value}</p>
              <p className="text-[10px] text-gray-500 mt-0.5 uppercase tracking-wider font-medium">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Premium Modules Bar */}
      {features && Object.keys(features).length > 0 && (
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#0d1117] via-[#0f1420] to-[#0d1117] border border-[#1a2332] p-5">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/[0.02] via-transparent to-purple-500/[0.02]" />
          <div className="relative flex items-center flex-wrap gap-2">
            <div className="flex items-center gap-2 mr-3">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
                <Link2 size={13} className="text-white" />
              </div>
              <span className="text-xs font-semibold text-gray-400 tracking-wide">Aktif Modüller</span>
            </div>
            <div className="w-px h-6 bg-[#1a2332] mr-2" />
            {platforms.filter(p => features[p.key] !== false && (isSuperAdmin || hasPlatformPerm(p.key))).map(p => (
              <span key={p.key} className={'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-semibold tracking-wide ' + p.bg + ' ' + p.color + ' border ' + p.border + ' shadow-sm'}>
                <span className={'w-1.5 h-1.5 rounded-full ' + (isPlatformConnected(p.key, p.type) ? 'bg-emerald-500 shadow-sm shadow-emerald-500/50' : 'bg-gray-600')} />
                {p.label}
              </span>
            ))}
            {platforms.filter(p => features[p.key] === false).map(p => (
              <span key={p.key} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-medium bg-gray-500/10 text-gray-600 border border-gray-500/20 line-through">
                <span className="w-1.5 h-1.5 rounded-full bg-gray-700" />
                {p.label}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Platform Cards by Category */}
      {PLATFORM_CATEGORIES.map(cat => {
        const catPlatforms = platforms.filter(p => cat.keys.includes(p.key) && features[p.key] !== false && (isSuperAdmin || hasPlatformPerm(p.key)))
        if (catPlatforms.length === 0) return null
        return (
          <div key={cat.label}>
            <div className="flex items-center gap-3 mb-4">
              <h2 className="text-sm font-semibold text-gray-300 tracking-wide">{cat.label}</h2>
              <div className="flex-1 h-px bg-gradient-to-r from-[#1a2332] to-transparent" />
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
              {catPlatforms.map(p => {
                const isConnected = isPlatformConnected(p.key, p.type)
                return (
                  <div key={p.key}
                    className={'group relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#0f1420] to-[#0d1117] border p-5 transition-all duration-300 hover:scale-[1.02] ' + (isConnected ? 'border-emerald-500/20 hover:border-emerald-500/30 hover:shadow-lg hover:shadow-emerald-500/5' : 'border-[#1a2332] hover:border-blue-500/30 hover:shadow-lg hover:shadow-blue-500/5')}>
                    <div className={'absolute top-0 right-0 w-32 h-32 rounded-full blur-2xl transition-all duration-700 ' + (isConnected ? 'opacity-50 bg-emerald-500/5' : 'opacity-0 bg-blue-500/5 group-hover:opacity-50')} />
                    <div className="relative">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className={'w-12 h-12 rounded-xl flex items-center justify-center overflow-hidden ' + p.bg + ' border ' + p.border}>
                            <div className={'w-9 h-9 ' + p.color} dangerouslySetInnerHTML={{ __html: PLATFORM_SVGS[p.key] }} />
                          </div>
                          <div>
                            <h3 className="text-white font-semibold text-sm">{p.label}</h3>
                            <div className="flex items-center gap-1.5 mt-0.5">
                              <div className={'w-2 h-2 rounded-full ' + (isConnected ? 'bg-emerald-500 shadow-sm shadow-emerald-500/50' : 'bg-gray-600')} />
                              <p className="text-[10px] text-gray-500">{isConnected ? (p.key === 'telegram' && telegramBotInfo ? '@' + (telegramBotInfo.username || '') : 'Bağlı') : 'Bağlı değil'}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {isConnected ? (
                          <button onClick={() => handleDisconnect(p.key, p.type)} className="flex-1 py-2.5 rounded-xl text-xs font-medium border border-red-500/20 text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-all flex items-center justify-center gap-1.5">
                            <Unplug className="w-3.5 h-3.5" /> Kes
                          </button>
                        ) : (
                          <button onClick={() => handleConnect(p.key, p.type)} disabled={connecting === p.key} className="flex-1 py-2.5 rounded-xl text-xs font-medium bg-gradient-to-r from-blue-600 to-blue-500 text-white hover:shadow-lg hover:shadow-blue-500/25 transition-all disabled:opacity-50 flex items-center justify-center gap-1.5">
                            {connecting === p.key ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Bağlanıyor</> : <><Link2 className="w-3.5 h-3.5" /> Bağla</>}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )
      })}
    </div>
  )
}
