'use client'
import { useState, useEffect, useRef, useCallback } from 'react'
import {
  ShoppingBag, Search, Clock, CheckCircle2, XCircle, Timer, Bell, UtensilsCrossed,
  Globe, Armchair, Banknote, Layers, TrendingUp, MapPin, Phone,
  Printer, Volume2, VolumeX, Eye, History, Loader2, Truck, X, Store, CalendarClock,
  Play, Pause, Lock, FileText, ShieldBan, Ban, Unlock, FileBarChart, Download,
} from 'lucide-react'
import { buildOrderReceipt } from '@/components/printer/escpos'
import { openReceiptPdf, parseNoteAddress as parseReceiptAddress, parseNotePayment as parseReceiptPayment } from '@/lib/receipt'
import PrinterManager from '@/components/printer/PrinterManager'
import { usePrinter } from '@/components/printer/usePrinter'

const STATUS_MAP: Record<string, { label: string; color: string; bg: string; border: string; dot: string; icon: any }> = {
  pending: { label: 'Bekliyor', color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-200', dot: 'bg-amber-500', icon: Timer },
  preparing: { label: 'Hazırlanıyor', color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-200', dot: 'bg-blue-500', icon: Timer },
  out_for_delivery: { label: 'Yola Çıktı', color: 'text-purple-600', bg: 'bg-purple-50', border: 'border-purple-200', dot: 'bg-purple-500', icon: Truck },
  delivered: { label: 'Teslim Edildi', color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-200', dot: 'bg-emerald-500', icon: CheckCircle2 },
  completed: { label: 'Tamamlandı', color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-200', dot: 'bg-emerald-500', icon: CheckCircle2 },
  cancelled: { label: 'İptal', color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-200', dot: 'bg-red-500', icon: XCircle },
}

type TabKey = 'table' | 'online' | 'waiter' | 'history' | 'store'

function esc(s: any): string {
  return String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c] as string))
}

function isTableOrder(o: any) {
  const p = (o.platform || '').trim()
  if (isWaiterCall(o)) return false
  return (p === 'Masa' || p === 'Masa Siparişi' || o.tableNumber)
}
function isOnlineOrder(o: any) {
  const p = (o.platform || '').trim()
  return (p === 'QR Menü' || p === 'Online' || p === 'Online Sipariş')
}
function isWaiterCall(o: any) {
  return (o.platform || '').includes('Garson')
}
function isHistorical(o: any) {
  return o.status === 'completed' || o.status === 'delivered' || o.status === 'cancelled'
}

const PLATFORM_META: Record<'table' | 'online', { label: string; bg: string; border: string; icon: any; grad: string }> = {
  table: {
    label: 'Masa', bg: 'bg-blue-50', border: 'border-blue-200',
    icon: Armchair, grad: 'from-blue-600 to-blue-700',
  },
  online: {
    label: 'Online', bg: 'bg-cyan-50', border: 'border-cyan-200',
    icon: Globe, grad: 'from-cyan-500 to-blue-600',
  },
}

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'az önce'
  if (mins < 60) return `${mins} dk önce`
  if (mins < 1440) return `${Math.floor(mins / 60)} sa ${mins % 60} dk önce`
  return new Date(dateStr).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' })
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleString('tr-TR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })
}

type StoreScopeSettings = { status: string; autoMode: boolean; openTime: string; closeTime: string }

const DEFAULT_SCOPE_SETTINGS: StoreScopeSettings = { status: 'open', autoMode: false, openTime: '09:00', closeTime: '23:00' }

function StoreStatusPill({ label, status }: { label: string; status: string }) {
  return (
    <span className={'inline-flex items-center gap-2 px-3 py-2.5 rounded-full text-xs font-bold shadow-md ' + (status === 'open' ? 'bg-white text-emerald-700' : status === 'busy' ? 'bg-white text-amber-700' : 'bg-white text-red-700')}>
      <span className="relative flex w-2.5 h-2.5">
        <span className={'absolute inline-flex w-full h-full rounded-full animate-ping ' + (status === 'open' ? 'bg-emerald-400' : status === 'busy' ? 'bg-amber-400' : 'bg-red-400')} />
        <span className={'relative inline-flex w-2.5 h-2.5 rounded-full ' + (status === 'open' ? 'bg-emerald-500' : status === 'busy' ? 'bg-amber-500' : 'bg-red-500')} />
      </span>
      {label}: {status === 'open' ? 'Açık' : status === 'busy' ? 'Yoğun' : 'Kapalı'}
    </span>
  )
}

function StoreSettingsCard({ title, badge, desc, settings, effective, onChange }: {
  title: string
  badge: string
  desc: string
  settings: StoreScopeSettings | null
  effective: string
  onChange: (s: StoreScopeSettings) => void
}) {
  const set = settings || DEFAULT_SCOPE_SETTINGS
  return (
    <div className="relative overflow-hidden rounded-2xl bg-white border border-blue-100 p-4 sm:p-6 shadow-sm hover:shadow-lg hover:shadow-blue-600/10 transition-all duration-300">
      <div className="absolute -top-8 -right-8 w-24 h-24 rounded-full bg-blue-50" />
      <div className="relative">
        <div className="flex items-center gap-2 flex-wrap mb-1">
          <h3 className="text-gray-900 font-bold flex items-center gap-2"><Store size={18} className="text-blue-600" /> {title}</h3>
          <span className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 text-[9px] font-bold border border-blue-100">{badge}</span>
        </div>
        <p className="text-xs text-gray-500 mb-5">{desc}</p>

        <div className={'inline-flex items-center gap-2 px-3 sm:px-4 py-2 rounded-full border text-xs sm:text-sm font-bold mb-6 ' + (effective === 'open' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : effective === 'busy' ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-red-50 text-red-700 border-red-200')}>
          <span className="relative flex w-2.5 h-2.5">
            <span className={'absolute inline-flex w-full h-full rounded-full animate-ping ' + (effective === 'open' ? 'bg-emerald-400' : effective === 'busy' ? 'bg-amber-400' : 'bg-red-400')} />
            <span className={'relative inline-flex w-2.5 h-2.5 rounded-full ' + (effective === 'open' ? 'bg-emerald-500' : effective === 'busy' ? 'bg-amber-500' : 'bg-red-500')} />
          </span>
          {effective === 'open' ? 'Açık — siparişler alınıyor' : effective === 'busy' ? 'Yoğun — siparişlere ara verildi' : 'Kapalı — sipariş alınmıyor'}
        </div>

        <p className="text-[10px] text-gray-500 font-semibold uppercase tracking-wider mb-2">Durum</p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
          {[
            { key: 'open', label: 'Açık', desc: 'Siparişler alınır', icon: Play, active: 'bg-emerald-500 text-white border-emerald-600 shadow-lg shadow-emerald-500/30', idle: 'bg-white text-gray-600 border-gray-200 hover:border-emerald-300 hover:bg-emerald-50' },
            { key: 'busy', label: 'Yoğun', desc: 'Siparişlere ara verilir', icon: Pause, active: 'bg-amber-500 text-white border-amber-600 shadow-lg shadow-amber-500/30', idle: 'bg-white text-gray-600 border-gray-200 hover:border-amber-300 hover:bg-amber-50' },
            { key: 'closed', label: 'Kapalı', desc: 'Sipariş alınmaz', icon: Lock, active: 'bg-red-500 text-white border-red-600 shadow-lg shadow-red-500/30', idle: 'bg-white text-gray-600 border-gray-200 hover:border-red-300 hover:bg-red-50' },
          ].map(s => {
            const Icon = s.icon
            const selected = set.status === s.key && !set.autoMode
            return (
              <button key={s.key}
                onClick={() => onChange({ ...set, status: s.key, autoMode: false })}
                className={'flex items-center gap-3 rounded-2xl border-2 px-4 py-3.5 text-left transition-all active:scale-[0.98] ' + (selected ? s.active : s.idle)}>
                <div className={'w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 ' + (selected ? 'bg-white/25' : 'bg-gray-50')}>
                  <Icon size={16} className={selected ? 'text-white' : 'text-gray-400'} />
                </div>
                <div>
                  <p className={'text-sm font-bold ' + (selected ? 'text-white' : 'text-gray-800')}>{s.label}</p>
                  <p className={'text-[10px] ' + (selected ? 'text-white/80' : 'text-gray-400')}>{s.desc}</p>
                </div>
              </button>
            )
          })}
        </div>

        <div className="rounded-2xl border border-blue-100 bg-blue-50/50 p-4 mb-2">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center shadow-md shadow-blue-600/30">
                <CalendarClock size={17} className="text-white" />
              </div>
              <div>
                <p className="text-sm font-bold text-gray-800 flex items-center gap-2">
                  Günlük Açılış / Kapanış Saati
                  {set.autoMode && (
                    <span className="px-2 py-0.5 rounded-full bg-blue-600 text-white text-[9px] font-bold">OTOMATİK</span>
                  )}
                </p>
                <p className="text-[11px] text-gray-500 mt-0.5">Açılış saatinde otomatik <b>açılır</b>, kapanışta otomatik <b>kapanır</b>.</p>
              </div>
            </div>
            <button onClick={() => onChange({ ...set, autoMode: !set.autoMode })}
              className={'relative w-12 h-7 rounded-full transition-colors flex-shrink-0 ' + (set.autoMode ? 'bg-blue-600' : 'bg-gray-300')}>
              <span className={'absolute top-0.5 w-6 h-6 rounded-full bg-white shadow transition-all ' + (set.autoMode ? 'left-[22px]' : 'left-0.5')} />
            </button>
          </div>
          {set.autoMode && (
            <div className="grid grid-cols-2 gap-3 mt-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] text-gray-500 font-semibold uppercase tracking-wider">Açılış Saati</label>
                <input type="time" value={set.openTime || ''} onChange={e => onChange({ ...set, openTime: e.target.value })}
                  className="w-full bg-white border border-blue-200 rounded-xl px-3 py-2.5 text-gray-900 text-sm focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100" />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] text-gray-500 font-semibold uppercase tracking-wider">Kapanış Saati</label>
                <input type="time" value={set.closeTime || ''} onChange={e => onChange({ ...set, closeTime: e.target.value })}
                  className="w-full bg-white border border-blue-200 rounded-xl px-3 py-2.5 text-gray-900 text-sm focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100" />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function orderTotal(o: any) {
  if (o.products?.reduce) {
    return o.products.reduce((a: any, p: any) => a + (Number(p.price) || 0) * (p.quantity || 1), 0)
  }
  return o.totalAmount || 0
}

function parseAddress(note?: string) {
  const m = /Adres: (.+)/.exec(note || '')
  return m?.[1] || ''
}

function parseLocation(note?: string) {
  const m = /Konum: (https?:\/\/[^\s|]+)/.exec(note || '')
  return m?.[1] || ''
}

function LocationButton({ note }: { note?: string }) {
  const link = parseLocation(note)
  if (!link) return null
  return (
    <a href={link} target="_blank" rel="noopener noreferrer" onClick={e => e.stopPropagation()}
      className="inline-flex items-center gap-1.5 px-3 py-2 rounded-full bg-cyan-600 text-white text-xs font-bold shadow-md shadow-cyan-600/30 hover:bg-cyan-700 hover:scale-105 active:scale-95 transition-all">
      <MapPin size={13} /> Konum
    </a>
  )
}

function StatusBadge({ o }: { o: any }) {
  const s = STATUS_MAP[o.status] || STATUS_MAP.pending
  const Icon = s.icon
  return (
    <span className={'inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold border ' + s.bg + ' ' + s.color + ' ' + s.border}>
      <span className={'w-1.5 h-1.5 rounded-full ' + s.dot + (o.status === 'pending' ? ' animate-pulse' : '')} />
      {s.label}
    </span>
  )
}

/* ---------------- SOUND ---------------- */
const SOUND_KEY = 'brusk_orders_sound'

let audioCtx: AudioContext | null = null
function ensureAudio(): AudioContext | null {
  try {
    if (!audioCtx) {
      const AC = window.AudioContext || (window as any).webkitAudioContext
      audioCtx = new AC()
    }
    if (audioCtx.state === 'suspended') audioCtx.resume()
    return audioCtx
  } catch { return null }
}

function playChime(kind: 'order' | 'waiter') {
  try {
    const ctx = ensureAudio()
    if (!ctx) return
    const now = ctx.currentTime
    const notes = kind === 'order' ? [523.25, 659.25, 783.99] : [659.25, 523.25, 659.25, 783.99]
    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.type = 'sine'
      osc.frequency.value = freq
      const t = now + i * 0.13
      gain.gain.setValueAtTime(0.0001, t)
      gain.gain.exponentialRampToValueAtTime(0.22, t + 0.03)
      gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.11)
      osc.connect(gain).connect(ctx.destination)
      osc.start(t)
      osc.stop(t + 0.13)
    })
  } catch {}
}

/* ---------------- PRINTER ---------------- */
const PRINTER_SHOP = 'brusk_print_shop_name'
const PRINTER_ADDR = 'brusk_print_shop_address'

export default function OrdersPage() {
  const [orders, setOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('')
  const [search, setSearch] = useState('')
  const [tab, setTab] = useState<TabKey>('table')
  const [updating, setUpdating] = useState<number | null>(null)
  const [detail, setDetail] = useState<any>(null)
  const [soundOn, setSoundOn] = useState(true)
  const [historyLimit, setHistoryLimit] = useState(100)
  const [historyFrom, setHistoryFrom] = useState('')
  const [historyTo, setHistoryTo] = useState('')
  const [historyList, setHistoryList] = useState<any[]>([])
  const [historyPreset, setHistoryPreset] = useState('7d')
  const [tableSettings, setTableSettings] = useState<StoreScopeSettings | null>(null)
  const [onlineSettings, setOnlineSettings] = useState<StoreScopeSettings | null>(null)
  const [storeEffectiveTable, setStoreEffectiveTable] = useState('open')
  const [storeEffectiveOnline, setStoreEffectiveOnline] = useState('open')
  const [storeSaving, setStoreSaving] = useState(false)
  const [storeMsg, setStoreMsg] = useState<string | null>(null)
  const [storeInfo, setStoreInfo] = useState<{ name: string; address: string; phone: string }>({ name: '', address: '', phone: '' })
  const [tenantId, setTenantId] = useState('')
  const [blockedDevices, setBlockedDevices] = useState<any[]>([])
  const [blockMsg, setBlockMsg] = useState<string | null>(null)
  const [cancelTarget, setCancelTarget] = useState<any>(null)
  const [cancelReason, setCancelReason] = useState('')
  const [statsScope, setStatsScope] = useState<'today' | 'all'>('today')

  const printer = usePrinter(tenantId, storeInfo)

  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const esRef = useRef<EventSource | null>(null)
  const soundRef = useRef(true)
  const portRef = useRef<SerialPort | null>(null)
  const [printerBusy, setPrinterBusy] = useState(false)
  const [printerStatus, setPrinterStatus] = useState('')
  const [customerNote, setCustomerNote] = useState('')
  const shopRef = useRef({ name: 'BRUSKAPP', address: '' })

  useEffect(() => { soundRef.current = soundOn }, [soundOn])

  useEffect(() => {
    try {
      setSoundOn(localStorage.getItem(SOUND_KEY) !== '0')
      shopRef.current.name = localStorage.getItem(PRINTER_SHOP) || 'BRUSKAPP'
      shopRef.current.address = localStorage.getItem(PRINTER_ADDR) || ''
    } catch {}
  }, [])

  const load = useCallback(async () => {
    try {
      const tenant = await fetch('/api/tenants/me', { credentials: 'include' }).then(r => r.json())
      const tid = tenant?.tenant?.id || tenant?.id
      if (tid) {
        setTenantId(tid)
        const res = await fetch('/api/orders?tenantId=' + tid + '&limit=300', { credentials: 'include' })
        if (res.ok) setOrders(await res.json())
      }
    } catch {} finally { setLoading(false) }
  }, [])

  const loadStoreSettings = useCallback(async () => {
    try {
      const res = await fetch('/api/storefront/admin/me/settings', { credentials: 'include' })
      if (res.ok) {
        const data = await res.json()
        setTableSettings(data.table?.settings || null)
        setOnlineSettings(data.online?.settings || null)
        setStoreEffectiveTable(data.table?.effectiveStatus || 'open')
        setStoreEffectiveOnline(data.online?.effectiveStatus || 'open')
      }
    } catch {}
  }, [])

  const loadBlocked = useCallback(async () => {
    try {
      const res = await fetch('/api/orders/blocked', { credentials: 'include' })
      if (res.ok) setBlockedDevices(await res.json())
    } catch {}
  }, [])

  const loadHistory = useCallback(async (from: string, to: string, limit: number) => {
    if (!tenantId) return
    try {
      const params = new URLSearchParams({ tenantId, limit: String(limit) })
      if (from) params.set('from', from)
      if (to) params.set('to', to)
      const res = await fetch('/api/orders?' + params.toString(), { credentials: 'include' })
      if (res.ok) setHistoryList(await res.json())
    } catch {}
  }, [tenantId])

  useEffect(() => { loadStoreSettings() }, [loadStoreSettings])

  useEffect(() => { loadBlocked() }, [loadBlocked])

  useEffect(() => {
    if (tab !== 'history') return
    const now = new Date()
    const iso = (d: Date) => d.toISOString()
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const endOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999)

    let from = ''
    let to = ''
    if (historyPreset === 'today') { from = iso(startOfToday); to = iso(endOfToday) }
    else if (historyPreset === 'yesterday') {
      const yd = new Date(startOfToday); yd.setDate(yd.getDate() - 1)
      const yde = new Date(startOfToday); yde.setMilliseconds(-1)
      from = iso(yd); to = iso(yde)
    }
    else if (historyPreset === '7d') { from = iso(new Date(startOfToday.getTime() - 6 * 86400000)); to = iso(endOfToday) }
    else if (historyPreset === '14d') { from = iso(new Date(startOfToday.getTime() - 13 * 86400000)); to = iso(endOfToday) }
    else if (historyPreset === '30d') { from = iso(new Date(startOfToday.getTime() - 29 * 86400000)); to = iso(endOfToday) }
    else if (historyPreset === 'all') { from = ''; to = '' }

    const f = historyFrom || from
    const t = historyTo || to
    loadHistory(f, t, historyLimit)
  }, [tab, historyPreset, historyFrom, historyTo, historyLimit, loadHistory])

  useEffect(() => {
    fetch('/api/storefront/admin/me', { credentials: 'include' }).then(r => r.ok ? r.json() : null).then(d => {
      if (!d) return
      setStoreInfo({ name: d.shopName || d.name || '', address: d.address || '', phone: d.phone || '' })
    }).catch(() => {})
  }, [])

  const saveStoreSettings = async () => {
    if (!tableSettings || !onlineSettings) return
    setStoreSaving(true); setStoreMsg(null)
    try {
      const res = await fetch('/api/storefront/admin/me/settings', {
        method: 'PUT',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ table: tableSettings, online: onlineSettings }),
      })
      if (res.ok) {
        const data = await res.json()
        setTableSettings(data.table?.settings || tableSettings)
        setOnlineSettings(data.online?.settings || onlineSettings)
        setStoreEffectiveTable(data.table?.effectiveStatus || 'open')
        setStoreEffectiveOnline(data.online?.effectiveStatus || 'open')
        setStoreMsg('Mağaza ayarları kaydedildi.')
      } else setStoreMsg('Kaydedilemedi.')
    } catch { setStoreMsg('Bağlantı hatası') }
    setStoreSaving(false)
  }

  useEffect(() => {
    load()
    async function connect() {
      try {
        const tenant = await fetch('/api/tenants/me', { credentials: 'include' }).then(r => r.json())
        const tid = tenant?.tenant?.id || tenant?.id
        if (!tid) return
        const es = new EventSource('/api/orders/events?tenantId=' + tid)
        esRef.current = es
        es.addEventListener('new_order', (ev) => {
          try {
            const order = JSON.parse((ev as MessageEvent).data)
            const isWaiter = isWaiterCall(order)
            if (order.customerName !== 'Test' && soundRef.current) playChime(isWaiter ? 'waiter' : 'order')
            printer.handleNewOrder(order)
          } catch {}
          load()
        })
        es.addEventListener('status_update', () => load())
        es.onerror = () => {}
      } catch {}
    }
    connect()
    pollRef.current = setInterval(load, 30000)
    return () => {
      if (pollRef.current) clearInterval(pollRef.current)
      if (esRef.current) esRef.current.close()
    }
  }, [load])

  useEffect(() => {
    const unlock = () => ensureAudio()
    window.addEventListener('pointerdown', unlock, { once: true })
    window.addEventListener('keydown', unlock, { once: true })
    window.addEventListener('touchstart', unlock, { once: true })
    return () => {
      window.removeEventListener('pointerdown', unlock)
      window.removeEventListener('keydown', unlock)
      window.removeEventListener('touchstart', unlock)
    }
  }, [])

  useEffect(() => { setCustomerNote(detail?.customerNote || '') }, [detail])

  const updateStatus = async (id: number, status: string, customerNote?: string) => {
    setUpdating(id)
    try {
      await fetch('/api/orders/' + id + '/status', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(customerNote ? { status, customerNote } : { status }),
      })
      await load()
    } catch {} finally { setUpdating(null) }
  }

  const tableOrders = orders.filter(isTableOrder)
  const onlineOrders = orders.filter(isOnlineOrder)
  const waiterCalls = orders.filter(isWaiterCall)
  const historyOrders = orders.filter(isHistorical)

  const pendingWaiter = waiterCalls.filter(o => o.status === 'pending')
  const pendingTable = tableOrders.filter(o => o.status === 'pending')
  const pendingOnline = onlineOrders.filter(o => o.status === 'pending')

  const countFor: Record<TabKey, number> = {
    table: tableOrders.length,
    online: onlineOrders.length,
    waiter: pendingWaiter.length,
    history: historyOrders.length,
    store: 0,
  }
  const pendingFor: Record<TabKey, number> = {
    table: pendingTable.length,
    online: pendingOnline.length,
    waiter: pendingWaiter.length,
    history: 0,
    store: 0,
  }

  const baseList = tab === 'table' ? tableOrders : tab === 'online' ? onlineOrders : tab === 'waiter' ? waiterCalls : tab === 'history' ? historyList.filter(isHistorical) : []
  const filtered = baseList.filter((o: any) => {
    if (tab !== 'waiter' && filter && o.status !== filter) return false
    if (search) {
      const s = search.toLowerCase()
      return o.customerName?.toLowerCase().includes(s)
        || o.platform?.toLowerCase().includes(s)
        || String(o.tableNumber || '').includes(s)
    }
    return true
  }).slice(0, tab === 'history' ? historyLimit : 200)

  const isToday = (o: any) => {
    const d = new Date(o.createdAt)
    const now = new Date()
    return d.toDateString() === now.toDateString()
  }

  const todayTable = tableOrders.filter(isToday)
  const todayOnline = onlineOrders.filter(isToday)
  const todayWaiter = waiterCalls.filter(isToday)

  const statsFor = (list: any[]) => ({
    total: list.length,
    pending: list.filter(o => o.status === 'pending').length,
    completed: list.filter(o => o.status === 'completed' || o.status === 'delivered').length,
    cancelled: list.filter(o => o.status === 'cancelled').length,
    revenue: list.filter(o => o.status !== 'cancelled').reduce((a, o) => a + orderTotal(o), 0),
  })

  const tabStats = {
    table: statsFor(tableOrders),
    online: statsFor(onlineOrders),
  } as Record<TabKey, any>

  const todayStats = {
    table: statsFor(todayTable),
    online: statsFor(todayOnline),
    waiter: { total: todayWaiter.length, pending: todayWaiter.filter(o => o.status === 'pending').length, completed: todayWaiter.filter(o => o.status === 'completed').length, cancelled: 0, revenue: 0 },
  } as Record<TabKey, any>

  if (loading) return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" /></div>

  /* ---------------- PRINTER ACTIONS ---------------- */
  async function ensurePort(): Promise<SerialPort | null> {
    if (portRef.current?.writable) return portRef.current
    try {
      const serial = (navigator as any).serial as Serial | undefined
      if (!serial) {
        setPrinterStatus('Tarayıcı Web Serial desteklemiyor')
        return null
      }
      const ports = await serial.getPorts()
      let p = ports[0]
      if (!p) p = await serial.requestPort()
      if (p && !p.writable) await p.open({ baudRate: 9600 })
      portRef.current = p
      setPrinterStatus('Yazıcı bağlı')
      return p
    } catch (e: any) {
      if (e?.name !== 'NotFoundError') setPrinterStatus('Bağlantı iptal edildi')
      return null
    }
  }

  async function printReceipt(order: any) {
    setPrinterBusy(true)
    try {
      const p = await ensurePort()
      if (!p?.writable) {
        setPrinterStatus('Yazıcı bağlanamadı')
        return
      }
      const w = p.writable.getWriter()
      try { await w.write(buildOrderReceipt(order, shopRef.current.name, shopRef.current.address)) } finally { w.releaseLock() }
      setPrinterStatus('Fiş yazdırıldı #' + order.id)
    } catch { setPrinterStatus('Yazdırma hatası') } finally { setPrinterBusy(false) }
  }

  async function printBulk() {
    const list = filtered.filter((o: any) => o.status === 'pending')
    if (list.length === 0) {
      setPrinterStatus('Yazdırılacak bekleyen sipariş yok')
      return
    }
    setPrinterBusy(true)
    try {
      const p = await ensurePort()
      if (!p?.writable) { setPrinterStatus('Yazıcı bağlanamadı'); return }
      const w = p.writable.getWriter()
      try {
        for (const o of list) {
          await w.write(buildOrderReceipt(o, shopRef.current.name, shopRef.current.address))
        }
      } finally { w.releaseLock() }
      setPrinterStatus(list.length + ' fiş yazdırıldı')
    } catch { setPrinterStatus('Yazdırma hatası') } finally { setPrinterBusy(false) }
  }

  function viewReceipt(o: any) {
    openReceiptPdf({
      businessName: storeInfo.name || 'İşletme',
      address: storeInfo.address,
      phone: storeInfo.phone,
      orderId: o.id,
      trackingCode: o.trackingCode || null,
      tableNumber: o.tableNumber || null,
      customerName: o.customerName || '',
      customerContact: o.customerContact || '',
      customerAddress: parseReceiptAddress(o.note) || (isTableOrder(o) ? storeInfo.address : ''),
      payment: parseReceiptPayment(o.note) || '',
      dateLabel: new Date(o.createdAt || Date.now()).toLocaleString('tr-TR', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
      items: (o.products || []).map((p: any) => ({ name: p.name, price: Number(p.price) || 0, qty: p.quantity || 1, note: p.note })),
      total: orderTotal(o),
    })
  }

  const blockOrder = async (o: any) => {
    if (!window.confirm(`#${o.id} siparişinin cihazını engellemek istediğinize emin misiniz? Bu cihazdan bir daha sipariş alınamaz.`)) return
    try {
      const res = await fetch(`/api/orders/${o.id}/block`, {
        method: 'POST', credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: `Sipariş #${o.id} işletme tarafından engellendi` }),
      })
      if (res.ok) {
        setBlockMsg(`#${o.id} siparişinin cihazı engellendi.`)
        loadBlocked()
      } else {
        const data = await res.json()
        setBlockMsg(data?.message || 'Engelleme yapılamadı')
      }
    } catch { setBlockMsg('Bağlantı hatası') }
  }

  const unblockDevice = async (b: any) => {
    if (!window.confirm('Bu cihazın engelini kaldırmak istediğinize emin misiniz?')) return
    try {
      const res = await fetch(`/api/orders/${b.id}/unblock`, {
        method: 'POST', credentials: 'include',
      })
      if (res.ok) {
        setBlockMsg('Cihaz engeli kaldırıldı.')
        loadBlocked()
      } else setBlockMsg('Kaldırılamadı')
    } catch { setBlockMsg('Bağlantı hatası') }
  }

  const isOrderBlocked = (o: any) => {
    if (!blockedDevices.length) return false
    return blockedDevices.some(b => (o.deviceId && b.deviceId === o.deviceId) || (o.ipAddress && b.ipAddress === o.ipAddress))
  }

  const blockedRecordFor = (o: any) => {
    return blockedDevices.find(b => (o.deviceId && b.deviceId === o.deviceId) || (o.ipAddress && b.ipAddress === o.ipAddress))
  }

  const unblockByOrder = async (o: any) => {
    const rec = blockedRecordFor(o)
    if (rec) await unblockDevice(rec)
    else setBlockMsg('Bu sipariş için engel kaydı bulunamadı')
  }

  const downloadEvidence = (o: any) => {
    const lines = [
      'SAHTE SİPARİŞ / HUKUKİ İNCELEME KAYDI',
      '----------------------------------------',
      'İşletme: ' + (storeInfo.name || '-'),
      'Sipariş No: #' + o.id,
      'Tarih/Saat: ' + new Date(o.createdAt || Date.now()).toLocaleString('tr-TR'),
      'Platform: ' + (o.platform || '-'),
      'Masa: ' + (o.tableNumber || '-'),
      'Müşteri Adı: ' + (o.customerName || '-'),
      'Telefon: ' + (o.customerContact || '-'),
      'Toplam: ' + orderTotal(o).toFixed(2) + ' TL',
      '',
      'TEKNİK KAYITLAR',
      '----------------------------------------',
      'IP Adresi: ' + (o.ipAddress || 'kayıt yok'),
      'Cihaz Kimliği: ' + (o.deviceId || 'kayıt yok'),
      'Not: ' + (o.note || '-'),
      '',
      'Bu kayıt; IP adresi, cihaz kimliği ve zaman bilgisi içerir.',
      'Kişinin tespiti için yetkili makamlara (savcılık/emniyet)',
      'başvurulabilir; IP üzerinden internet servis sağlayıcıdan',
      'abone bilgisi talep edilebilir.',
    ]
    const blob = new Blob([lines.join('\n')], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `siparis-${o.id}-kayit.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const downloadHistory = () => {
    const list = historyList.filter(isHistorical)
    if (list.length === 0) { alert('İndirilecek sipariş yok'); return }
    const esc = (v: any) => {
      const s = String(v ?? '')
      return /[",;\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s
    }
    const header = ['Sipariş No', 'Tarih', 'Saat', 'Platform', 'Masa', 'Müşteri', 'Telefon', 'Ürünler', 'Toplam', 'Ödeme', 'Durum']
    const rows = list.map(o => [
      o.id,
      new Date(o.createdAt).toLocaleDateString('tr-TR'),
      new Date(o.createdAt).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }),
      String(o.platform || ''),
      o.tableNumber || '',
      o.customerName || '',
      o.customerContact || '',
      (o.products || []).map((p: any) => `${p.quantity}x ${p.name}`).join('; '),
      orderTotal(o).toFixed(2),
      parseReceiptPayment(o.note) || '',
      o.status,
    ].map(esc).join(';'))
    const csv = '\uFEFF' + [header.join(';'), ...rows].join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `siparis-gecmisi-${new Date().toISOString().slice(0, 10)}.csv`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const openDailyReport = () => {
    const fmt = (n: number) => '₺' + (isFinite(n) ? n.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '0,00')
    const today = orders.filter(isToday)
    const active = today.filter(o => o.status !== 'cancelled')
    const revenue = active.reduce((a, o) => a + orderTotal(o), 0)
    const total = today.length
    const completed = today.filter(o => o.status === 'completed' || o.status === 'delivered').length
    const pending = today.filter(o => o.status === 'pending').length
    const cancelled = today.filter(o => o.status === 'cancelled').length
    const dateLabel = new Date().toLocaleDateString('tr-TR', { day: '2-digit', month: 'long', year: 'numeric' })

    const rows = today.map(o => {
      const plat = String(o.platform || '')
      const platLabel = plat === 'QR Menü' ? 'OnlineQR' : (plat === 'Masa' || plat === 'Masa Siparişi' ? 'Masa' : (plat.includes('Garson') ? 'Garson Çağrı' : plat))
      return `
      <tr>
        <td>#${o.id}</td>
        <td>${new Date(o.createdAt).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}</td>
        <td>${platLabel}</td>
        <td>${o.tableNumber ? 'Masa ' + o.tableNumber : (o.customerName || '-')}</td>
        <td>${o.customerContact || '-'}</td>
        <td style="text-align:right">${orderTotal(o).toFixed(2)} TL</td>
        <td>${o.status === 'cancelled' ? 'İptal' : o.status === 'delivered' ? 'Teslim' : o.status === 'completed' ? 'Tamam' : 'Diğer'}</td>
      </tr>
    `
    }).join('')

    const w = window.open('', '_blank', 'width=860,height=720')
    if (!w) { alert('Lütfen pop-up engelleyicisini açın'); return }
    w.document.write(`<!doctype html><html lang="tr"><head><meta charset="utf-8"><title>Gün Sonu Raporu ${esc(dateLabel)}</title><style>
      body { font-family: Arial, sans-serif; margin: 32px; color: #111; }
      h1 { font-size: 20px; margin-bottom: 4px; }
      .sub { color: #666; font-size: 13px; margin-bottom: 20px; }
      .cards { display: flex; gap: 12px; flex-wrap: wrap; margin-bottom: 24px; }
      .card { border: 1px solid #ddd; border-radius: 12px; padding: 14px 18px; min-width: 110px; }
      .card b { display: block; font-size: 20px; }
      .card span { font-size: 11px; color: #666; }
      table { width: 100%; border-collapse: collapse; font-size: 13px; }
      th, td { border-bottom: 1px solid #eee; padding: 8px 10px; text-align: left; }
      th { background: #f7f7f7; font-size: 11px; text-transform: uppercase; color: #555; }
      .tot { margin-top: 20px; font-size: 16px; font-weight: 700; }
      @media print { body { margin: 16px; } }
    </style></head><body>
      <h1>Gün Sonu Raporu</h1>
      <div class="sub">${esc(storeInfo.name || 'İşletme')} · ${esc(dateLabel)} · ${today.length} sipariş</div>
      <div class="cards">
        <div class="card"><b>${total}</b><span>Toplam Sipariş</span></div>
        <div class="card"><b>${pending}</b><span>Bekleyen</span></div>
        <div class="card"><b>${completed}</b><span>Tamamlanan</span></div>
        <div class="card"><b>${cancelled}</b><span>İptal</span></div>
        <div class="card"><b>${fmt(revenue)}</b><span>Ciro</span></div>
      </div>
      <table>
        <thead><tr><th>No</th><th>Saat</th><th>Platform</th><th>Müşteri</th><th>Telefon</th><th>Tutar</th><th>Durum</th></tr></thead>
        <tbody>${rows}</tbody>
      </table>
      <div class="tot">Gün Sonu Toplam: ${fmt(revenue)}</div>
    </body></html>`)
    w.document.close()
    w.focus()
  }

  const TABS: { key: TabKey; label: string; icon: any }[] = [
    { key: 'table', label: 'Masa', icon: Armchair },
    { key: 'online', label: 'Online', icon: Globe },
    { key: 'waiter', label: 'Garson Çağrıları', icon: Bell },
    { key: 'history', label: 'Geçmiş Siparişler', icon: History },
    { key: 'store', label: 'Mağaza Ayarları', icon: Store },
  ]

  const StatsCards = ({ data }: { data: any }) => (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {[
        { label: 'Toplam Sipariş', value: data.total, grad: 'from-blue-600 to-blue-700', icon: Layers },
        { label: 'Bekleyen', value: data.pending, grad: 'from-amber-500 to-orange-500', icon: Timer },
        { label: 'Tamamlanan', value: data.completed, grad: 'from-emerald-500 to-teal-600', icon: CheckCircle2 },
        { label: 'Ciro (₺)', value: data.revenue.toLocaleString('tr-TR', { minimumFractionDigits: 2 }), grad: 'from-indigo-500 to-purple-600', icon: Banknote },
      ].map((s, i) => {
        const Icon = s.icon
        return (
          <div key={s.label} className="relative overflow-hidden rounded-2xl bg-white border border-blue-100 p-5 shadow-sm hover:shadow-lg hover:shadow-blue-600/10 hover:-translate-y-0.5 transition-all duration-300">
            <div className="absolute -top-8 -right-8 w-20 h-20 rounded-full bg-blue-50" />
            <div className="relative">
              <div className={'w-9 h-9 rounded-full bg-gradient-to-br ' + s.grad + ' flex items-center justify-center mb-3 shadow-md'} style={{ animationDelay: i * 0.05 + 's' }}>
                <Icon className="w-4 h-4 text-white" />
              </div>
              <p className="text-xl font-bold text-gray-900 tracking-tight">{s.value}</p>
              <p className="text-[10px] text-gray-500 uppercase tracking-wider font-semibold mt-1">{s.label}</p>
            </div>
          </div>
        )
      })}
    </div>
  )

  return (
    <div className="space-y-5 pb-12">
      {/* Header */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-700 via-blue-600 to-blue-500 p-6 lg:p-8 shadow-lg shadow-blue-600/20">
        <div className="absolute -top-16 -right-16 w-64 h-64 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute -bottom-20 -left-10 w-72 h-72 rounded-full bg-blue-900/20 blur-3xl" />
        <div className="relative flex items-start justify-between flex-wrap gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-white/15 backdrop-blur flex items-center justify-center shadow-inner">
              <ShoppingBag className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-xl lg:text-2xl font-bold text-white tracking-tight">Sipariş Yönetimi</h1>
              <p className="text-sm text-blue-100 mt-0.5 flex items-center gap-1.5">
                <TrendingUp className="w-3.5 h-3.5" />
                Masa, online ve garson çağrıları tek ekranda
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <StoreStatusPill label="Masa" status={storeEffectiveTable} />
            <StoreStatusPill label="Online" status={storeEffectiveOnline} />
            <button onClick={() => { setSoundOn(v => { localStorage.setItem(SOUND_KEY, (!v) ? '1' : '0'); return !v }) }}
              className={'flex items-center gap-2 px-3 py-2.5 rounded-full text-xs font-semibold transition-all ' + (soundOn ? 'bg-white text-blue-700 shadow-md' : 'bg-white/15 text-white backdrop-blur')}>
              {soundOn ? <Volume2 size={14} /> : <VolumeX size={14} />}
              {soundOn ? 'Ses Açık' : 'Ses Kapalı'}
            </button>
            <button onClick={printBulk} disabled={printerBusy}
              className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-white text-blue-700 text-xs font-bold shadow-md hover:shadow-lg hover:scale-105 active:scale-95 transition-all disabled:opacity-60">
              {printerBusy ? <Loader2 size={14} className="animate-spin" /> : <Printer size={14} />} Toplu Yazdır
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="relative mt-6 flex items-center gap-2 overflow-x-auto no-scrollbar">
          {TABS.map(t => {
            const active = tab === t.key
            const Icon = t.icon
            const pending = pendingFor[t.key]
            return (
              <button key={t.key} onClick={() => setTab(t.key)}
                className={'flex items-center gap-2 px-4 py-2.5 rounded-full text-xs font-bold whitespace-nowrap transition-all ' + (active
                  ? 'bg-white text-blue-700 shadow-md'
                  : 'bg-white/15 text-white backdrop-blur hover:bg-white/25')}>
                <Icon size={15} />
                {t.label}
                {pending > 0 && (
                  <span className="px-1.5 py-0.5 rounded-full bg-white text-blue-700 text-[9px] font-bold animate-pulse">{pending}</span>
                )}
              </button>
            )
          })}
        </div>
      </div>

      {/* Printer status */}
      {printerStatus && (
        <div className="flex items-center gap-2 text-xs text-blue-700 bg-blue-50 border border-blue-200 rounded-full px-4 py-2">
          <Printer size={13} /> {printerStatus}
        </div>
      )}

      {tab === 'waiter' ? (
        <div className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {pendingWaiter.map(o => (
              <div key={o.id} className="relative overflow-hidden rounded-2xl bg-white border border-amber-200 p-5 shadow-sm hover:shadow-lg hover:shadow-amber-500/10 hover:-translate-y-0.5 transition-all duration-300">
                <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-amber-400 via-orange-400 to-amber-400" />
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-md shadow-amber-500/20">
                    {o.tableNumber ? <UtensilsCrossed className="w-6 h-6 text-white" /> : <Bell className="w-6 h-6 text-white" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-gray-900 font-bold text-base">Masa {o.tableNumber || o.customerName}</p>
                      <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
                    </div>
                    <p className="text-[11px] text-gray-500 flex items-center gap-1"><Clock size={11} /> {timeAgo(o.createdAt)}</p>
                  </div>
                </div>
                <div className="rounded-xl bg-amber-50 border border-amber-100 px-4 py-3 mb-4">
                  <p className="text-sm text-amber-900/90 leading-relaxed">{o.note || 'Garson çağrısı'}</p>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => updateStatus(o.id, 'completed')} disabled={updating === o.id}
                    className="flex-1 py-2.5 rounded-full bg-gradient-to-r from-blue-600 to-blue-700 text-white text-xs font-bold shadow-md shadow-blue-600/30 hover:from-blue-700 hover:to-blue-800 hover:scale-105 active:scale-95 transition-all disabled:opacity-50">
                    {updating === o.id ? 'İşaretleniyor...' : '✓ Çağrıyı Tamamla'}
                  </button>
                  <button onClick={() => printReceipt(o)} disabled={printerBusy}
                    className="p-2.5 rounded-full border border-blue-200 text-blue-700 hover:bg-blue-50 hover:border-blue-300 transition-all active:scale-90">
                    <Printer size={15} />
                  </button>
                </div>
              </div>
            ))}
            {pendingWaiter.length === 0 && (
              <div className="md:col-span-2 xl:col-span-3 rounded-2xl bg-white border border-dashed border-blue-200 py-20 text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center">
                  <Bell className="w-8 h-8 text-blue-300" />
                </div>
                <p className="text-gray-500 text-sm font-semibold">Bekleyen garson çağrısı yok</p>
                <p className="text-gray-400 text-xs mt-1.5">Masadan çağrı geldiğinde burada anında görünecek</p>
              </div>
            )}
          </div>

          {waiterCalls.filter(o => o.status === 'completed').length > 0 && (
            <div className="bg-white border border-blue-100 rounded-2xl overflow-hidden shadow-sm">
              <div className="px-5 py-3.5 border-b border-blue-50 flex items-center gap-2">
                <CheckCircle2 size={14} className="text-emerald-500" />
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Tamamlanan Çağrılar</span>
              </div>
              <div className="divide-y divide-blue-50/70">
                {waiterCalls.filter(o => o.status === 'completed').map(o => (
                  <div key={o.id} className="flex items-center gap-3 px-5 py-3.5 hover:bg-blue-50/40 transition-colors">
                    <div className="w-8 h-8 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center">
                      <UtensilsCrossed size={14} className="text-blue-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-gray-900 text-xs font-medium">Masa {o.tableNumber || o.customerName}</p>
                      <p className="text-[10px] text-gray-400 truncate">{o.note || 'Garson çağrısı'}</p>
                    </div>
                    <span className="text-[10px] text-gray-400 whitespace-nowrap">{timeAgo(o.createdAt)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : tab === 'history' ? (
        <div className="space-y-4">
          <div className="rounded-2xl bg-white border border-blue-100 p-4 sm:p-5 shadow-sm">
            <div className="flex items-center justify-between flex-wrap gap-3 mb-4">
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <History size={16} className="text-blue-600" />
                Tamamlanan ve iptal edilen siparişler
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <button onClick={downloadHistory}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white text-xs font-bold shadow-md shadow-emerald-600/30 hover:from-emerald-700 hover:to-teal-700 hover:scale-105 active:scale-95 transition-all">
                  <Download size={14} /> Toplu İndir (CSV)
                </button>
                <select value={historyLimit} onChange={e => setHistoryLimit(Number(e.target.value))}
                  className="bg-white border border-blue-200 rounded-xl px-3 py-2 text-xs font-semibold text-gray-700 focus:outline-none focus:border-blue-600">
                  {[50, 100, 250, 500, 1000, 5000].map(n => <option key={n} value={n}>{n} Kayıt</option>)}
                </select>
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <div className="flex gap-1 bg-blue-50/60 border border-blue-100 rounded-xl p-1 overflow-x-auto no-scrollbar">
                <div className="flex gap-1 w-max">
                  {[
                    { k: 'today', l: 'Bugün' }, { k: 'yesterday', l: 'Dün' }, { k: '7d', l: 'Son 7 Gün' },
                    { k: '14d', l: 'Son 2 Hafta' }, { k: '30d', l: 'Son 30 Gün' }, { k: 'all', l: 'Tümü (5 yıl)' },
                  ].map(p => (
                    <button key={p.k} onClick={() => { setHistoryPreset(p.k); setHistoryFrom(''); setHistoryTo('') }}
                      className={'px-3 py-2 rounded-lg text-xs font-bold whitespace-nowrap transition-all ' + (historyPreset === p.k && !historyFrom && !historyTo ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30' : 'text-gray-600 hover:text-blue-600')}>
                      {p.l}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                <div className="flex items-center gap-2">
                  <input type="date" value={historyFrom} onChange={e => { setHistoryFrom(e.target.value); setHistoryPreset('') }}
                    className="flex-1 sm:flex-none bg-white border border-blue-200 rounded-xl px-3 py-2 text-xs font-semibold text-gray-700 focus:outline-none focus:border-blue-600" />
                  <span className="text-xs text-gray-400">→</span>
                  <input type="date" value={historyTo} onChange={e => { setHistoryTo(e.target.value); setHistoryPreset('') }}
                    className="flex-1 sm:flex-none bg-white border border-blue-200 rounded-xl px-3 py-2 text-xs font-semibold text-gray-700 focus:outline-none focus:border-blue-600" />
                </div>
                <span className="text-[10px] text-gray-400">{historyList.length} sipariş</span>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            {filtered.length === 0 ? (
              <div className="rounded-2xl bg-white border border-dashed border-blue-200 py-20 text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center">
                  <History className="w-8 h-8 text-blue-300" />
                </div>
                <p className="text-gray-500 text-sm font-semibold">Seçilen tarih aralığında sipariş bulunmuyor</p>
              </div>
            ) : filtered.map(o => {
              const meta = isOnlineOrder(o) ? PLATFORM_META.online : PLATFORM_META.table
              const Icon = meta.icon
              const total = orderTotal(o)
              return (
                <div key={o.id} className="group rounded-2xl bg-white border border-blue-100 p-5 shadow-sm hover:shadow-lg hover:shadow-blue-600/10 transition-all duration-300">
                  <div className="flex items-start justify-between gap-4 flex-wrap">
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <div className={'w-11 h-11 rounded-full bg-gradient-to-br ' + meta.grad + ' flex items-center justify-center shadow-md flex-shrink-0'}>
                        <Icon className="w-5 h-5 text-white" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-[10px] text-gray-400 font-mono font-semibold tracking-wider">#{o.id}</span>
                          {o.trackingCode && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-yellow-50 text-yellow-700 font-mono text-[10px] font-bold border border-yellow-200" title="Müşteri Takip Kodu">
                              <Search size={9} /> {o.trackingCode}
                            </span>
                          )}
                          <span className={'inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold border ' + meta.bg + ' ' + meta.border}>
                            <Icon size={11} /> {meta.label}
                          </span>
                          {isTableOrder(o) && o.tableNumber ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-600 border border-indigo-200">
                              <Armchair size={11} /> Masa {o.tableNumber}
                            </span>
                          ) : null}
                          <StatusBadge o={o} />
                        </div>
                        <p className="text-gray-900 font-semibold text-sm mt-1.5 truncate">{o.customerName || 'Müşteri'}</p>
                        <p className="text-[11px] text-gray-400 mt-0.5 flex items-center gap-1.5"><Clock size={10} /> {formatDate(o.createdAt)}</p>
                      </div>
                    </div>
                    <div className="flex flex-col items-end shrink-0 gap-1">
                      <p className="text-base font-bold text-gray-900 tracking-tight">₺{total.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}</p>
                    </div>
                  </div>
                  {o.products?.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {o.products.map((p: any, i: number) => (
                        <span key={i} className="inline-flex items-center gap-1 text-[10px] bg-blue-50 text-blue-700 px-2.5 py-1 rounded-full border border-blue-100">
                          {p.quantity > 1 && <span className="font-bold">{p.quantity}×</span>}
                          {p.name}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      ) : tab === 'store' ? (
        <div className="space-y-4">
          <div className="rounded-2xl bg-white border border-blue-100 p-4 sm:p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-1">
              <Store size={18} className="text-blue-600" />
              <h3 className="text-gray-900 font-bold">Mağaza Ayarları</h3>
            </div>
            <p className="text-xs text-gray-500">Masa QR ve Online QR menüleri için sipariş alınıp alınmayacağını ayrı ayrı yönetin. Kapalı veya Yoğun olan ekranda müşteri ürünleri görür ama sepete ekleyemez ve ödeme yapamaz.</p>
          </div>

          <StoreSettingsCard
            title="Masa QR"
            badge="Restoran içi"
            desc="Masa kodlu QR menüden yapılan siparişler için geçerlidir. Kapalı veya Yoğun olduğunda masalardan sipariş alınmaz."
            settings={tableSettings}
            effective={storeEffectiveTable}
            onChange={setTableSettings}
          />

          <StoreSettingsCard
            title="Online QR"
            badge="Dışarıdan sipariş"
            desc="Online QR menüden yapılan siparişler için geçerlidir. Kapalı veya Yoğun olduğunda online sipariş alınmaz."
            settings={onlineSettings}
            effective={storeEffectiveOnline}
            onChange={setOnlineSettings}
          />

          <PrinterManager printer={printer} />

          <div className="rounded-2xl bg-white border border-blue-100 p-4 sm:p-6 shadow-sm">
            <div className="flex items-center justify-between gap-2 mb-1">
              <div className="flex items-center gap-2">
                <ShieldBan size={18} className="text-red-600" />
                <h3 className="text-gray-900 font-bold">Engellenen Cihazlar</h3>
              </div>
              <button onClick={loadBlocked} className="text-[10px] text-blue-600 font-semibold hover:underline">Yenile</button>
            </div>
            <p className="text-xs text-gray-500 mb-3">Engellenen cihazlardan (IP/cihaz kimliği) sipariş alınamaz. Engeli kaldırmak için listeden kaldırın.</p>
            {blockMsg && <p className={'text-sm mb-3 ' + (blockMsg.includes('engellendi') || blockMsg.includes('kaldırıldı') ? 'text-emerald-600' : 'text-red-600')}>{blockMsg}</p>}
            {blockedDevices.length === 0 ? (
              <p className="text-xs text-gray-400 bg-blue-50/50 border border-blue-100 rounded-xl px-4 py-3">Henüz engellenen cihaz yok.</p>
            ) : (
              <div className="space-y-2">
                {blockedDevices.map(b => (
                  <div key={b.id} className="flex items-center justify-between gap-3 p-3 rounded-xl bg-red-50/50 border border-red-100">
                    <div className="min-w-0">
                      <p className="text-xs text-gray-800 font-mono font-semibold truncate">{b.deviceId}</p>
                      <p className="text-[10px] text-gray-500 mt-0.5">IP: {b.ipAddress || '-'} · {new Date(b.createdAt).toLocaleString('tr-TR')}</p>
                    </div>
                    <button onClick={() => unblockDevice(b)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white text-red-600 border border-red-200 text-xs font-bold hover:bg-red-50 transition-all flex-shrink-0">
                      <Unlock size={13} /> Kaldır
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {storeMsg && <p className={'text-sm ' + (storeMsg.includes('kaydedildi') ? 'text-emerald-600' : 'text-red-600')}>{storeMsg}</p>}
          <button onClick={saveStoreSettings} disabled={storeSaving || !tableSettings || !onlineSettings}
            className="w-full sm:w-auto px-6 py-2.5 rounded-full bg-gradient-to-r from-blue-600 to-blue-700 text-white text-xs font-bold shadow-md shadow-blue-600/30 hover:from-blue-700 hover:to-blue-800 hover:scale-105 active:scale-95 transition-all disabled:opacity-50">
            {storeSaving ? 'Kaydediliyor...' : 'Ayarları Kaydet'}
          </button>
        </div>
      ) : (
        <>
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div className="flex gap-1 bg-white border border-blue-100 rounded-full p-1 shadow-sm">
              <button onClick={() => setStatsScope('today')}
                className={'px-4 py-2 rounded-full text-xs font-bold transition-all ' + (statsScope === 'today' ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30' : 'text-gray-500 hover:text-blue-600')}>
                Bugün
              </button>
              <button onClick={() => setStatsScope('all')}
                className={'px-4 py-2 rounded-full text-xs font-bold transition-all ' + (statsScope === 'all' ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30' : 'text-gray-500 hover:text-blue-600')}>
                Tümü
              </button>
            </div>
            <button onClick={openDailyReport}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white text-xs font-bold shadow-md shadow-emerald-600/30 hover:from-emerald-700 hover:to-teal-700 hover:scale-105 active:scale-95 transition-all">
              <FileBarChart size={15} /> Gün Sonu Raporu
            </button>
          </div>

          <StatsCards data={(statsScope === 'today' ? todayStats[tab] : tabStats[tab]) || { total: 0, pending: 0, completed: 0, revenue: 0 }} />

          {/* Filters */}
          <div className="flex items-center gap-3 flex-wrap">
            <div className="relative flex-1 min-w-[200px]">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input value={search} onChange={e => setSearch(e.target.value)}
                placeholder={tab === 'table' ? 'Masa numarası veya müşteri ara...' : 'Müşteri, telefon veya adres ara...'}
                className="w-full bg-white border border-blue-100 rounded-full pl-9 pr-4 py-2.5 text-gray-900 text-sm focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100 placeholder-gray-400 shadow-sm" />
            </div>
            <div className="overflow-x-auto no-scrollbar -mx-1 px-1">
            <div className="flex gap-1 bg-white border border-blue-100 rounded-full p-1 shadow-sm w-max">
              {[{ key: '', label: 'Tümü' }, { key: 'pending', label: 'Bekleyen' }, { key: 'preparing', label: 'Hazırlanıyor' }, { key: 'out_for_delivery', label: 'Yola Çıktı' }, { key: 'delivered', label: 'Teslim Edildi' }, { key: 'completed', label: 'Tamamlanan' }, { key: 'cancelled', label: 'İptal' }].map(f => (
                <button key={f.key} onClick={() => setFilter(f.key)}
                  className={'px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ' + (filter === f.key ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30' : 'text-gray-500 hover:text-blue-600')}>{f.label}</button>
              ))}
            </div>
          </div>
          </div>

          {/* Order list */}
          <div className="space-y-3">
            {filtered.length === 0 ? (
              <div className="rounded-2xl bg-white border border-dashed border-blue-200 py-20 text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center">
                  {tab === 'table' ? <Armchair className="w-8 h-8 text-blue-300" /> : <Globe className="w-8 h-8 text-blue-300" />}
                </div>
                <p className="text-gray-500 text-sm font-semibold">{tab === 'table' ? 'Masa siparişi bulunmuyor' : 'Online sipariş bulunmuyor'}</p>
                <p className="text-gray-400 text-xs mt-1.5">Yeni siparişler geldiğinde burada görünecek</p>
              </div>
            ) : filtered.map(o => {
              const meta = isOnlineOrder(o) ? PLATFORM_META.online : PLATFORM_META.table
              const Icon = meta.icon
              const total = orderTotal(o)
              const address = parseAddress(o.note)
              return (
                <div key={o.id} className="group rounded-2xl bg-white border border-blue-100 p-5 shadow-sm hover:shadow-lg hover:shadow-blue-600/10 hover:-translate-y-0.5 transition-all duration-300 cursor-pointer" onClick={() => setDetail(o)}>
                  <div className="flex items-start justify-between gap-4 flex-wrap">
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <div className={'w-11 h-11 rounded-full bg-gradient-to-br ' + meta.grad + ' flex items-center justify-center shadow-md flex-shrink-0'}>
                        <Icon className="w-5 h-5 text-white" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-[10px] text-gray-400 font-mono font-semibold tracking-wider">#{o.id}</span>
                          {o.trackingCode && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-yellow-50 text-yellow-700 font-mono text-[10px] font-bold border border-yellow-200" title="Müşteri Takip Kodu">
                              <Search size={9} /> {o.trackingCode}
                            </span>
                          )}
                          <span className={'inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold border ' + meta.bg + ' ' + meta.border}>
                            <Icon size={11} /> {meta.label}
                          </span>
                          {isTableOrder(o) && o.tableNumber ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-600 border border-indigo-200">
                              <Armchair size={11} /> Masa {o.tableNumber}
                            </span>
                          ) : null}
                          <StatusBadge o={o} />
                        </div>
                        <p className="text-gray-900 font-semibold text-sm mt-1.5 truncate">{o.customerName || 'Müşteri'}</p>
                        <div className="flex flex-col gap-0.5 mt-0.5">
                          {o.customerContact && (
                            <p className="flex items-center gap-1.5 text-[11px] text-gray-500">
                              <Phone size={10} className="text-gray-400" /> {o.customerContact}
                            </p>
                          )}
                          {address && (
                            <p className="flex items-center gap-1.5 text-[11px] text-gray-500 truncate max-w-md">
                              <MapPin size={10} className="text-cyan-500" /> {address}
                            </p>
                          )}
                          <LocationButton note={o.note} />
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col items-end shrink-0 gap-2">
                      <p className="text-lg font-bold text-gray-900 tracking-tight">₺{total.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}</p>
                      <p className="text-[10px] text-gray-400 flex items-center gap-1"><Clock size={10} /> {timeAgo(o.createdAt)}</p>
                      <button onClick={e => { e.stopPropagation(); setDetail(o) }}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-blue-50 text-blue-700 text-[10px] font-bold border border-blue-200 hover:bg-blue-600 hover:text-white hover:border-blue-600 transition-all">
                        <Eye size={11} /> Detay
                      </button>
                    </div>
                  </div>

                  {o.products?.length > 0 && (
                    <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                      {o.products.slice(0, 6).map((p: any, i: number) => (
                        <div key={i} className="flex items-center gap-2 text-[11px] bg-blue-50/60 px-3 py-2 rounded-full border border-blue-100/70">
                          <span className={'flex-shrink-0 text-[10px] font-bold px-1.5 py-0.5 rounded-full border ' + (p.quantity > 1 ? 'bg-blue-600 border-blue-600 text-white' : 'bg-white border-blue-200 text-blue-600')}>
                            {p.quantity}×
                          </span>
                          <span className="text-gray-700 font-medium truncate">{p.name}</span>
                          {p.note && <span className="text-gray-400 truncate hidden md:inline">· {p.note}</span>}
                        </div>
                      ))}
                      {o.products.length > 6 && (
                        <div className="flex items-center justify-center text-[11px] text-blue-600 font-semibold">+{o.products.length - 6} ürün daha</div>
                      )}
                    </div>
                  )}

                  {o.status !== 'delivered' && o.status !== 'completed' && o.status !== 'cancelled' && (() => {
                    const online = isOnlineOrder(o)
                    return (
                      <div className="mt-4 flex items-center gap-2 flex-wrap border-t border-blue-50 pt-4">
                        {o.status === 'pending' && (
                          <button onClick={e => { e.stopPropagation(); updateStatus(o.id, 'preparing') }} disabled={updating === o.id}
                            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-blue-50 text-blue-700 text-xs font-bold border border-blue-200 hover:bg-blue-600 hover:text-white hover:border-blue-600 hover:scale-105 active:scale-95 transition-all disabled:opacity-50">
                            <Timer size={13} /> Hazırlanıyor
                          </button>
                        )}
                        {online && o.status === 'preparing' && (
                          <button onClick={e => { e.stopPropagation(); updateStatus(o.id, 'out_for_delivery') }} disabled={updating === o.id}
                            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-purple-50 text-purple-700 text-xs font-bold border border-purple-200 hover:bg-purple-600 hover:text-white hover:border-purple-600 hover:scale-105 active:scale-95 transition-all disabled:opacity-50">
                            <Truck size={13} /> Yola Çıktı
                          </button>
                        )}
                        <button onClick={e => { e.stopPropagation(); updateStatus(o.id, 'delivered') }} disabled={updating === o.id}
                          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 text-white text-xs font-bold shadow-md shadow-blue-600/30 hover:from-blue-700 hover:to-blue-800 hover:scale-105 active:scale-95 transition-all disabled:opacity-50">
                          <CheckCircle2 size={13} /> Teslim Edildi
                        </button>
                        <button onClick={e => { e.stopPropagation(); setCancelTarget(o); setCancelReason('') }} disabled={updating === o.id}
                          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white text-red-500 text-xs font-bold border border-red-200 hover:bg-red-50 hover:border-red-300 hover:scale-105 active:scale-95 transition-all disabled:opacity-50">
                          <XCircle size={13} /> İptal
                        </button>
                        <span className="w-px h-6 bg-blue-100 mx-1 hidden md:block" />
                        <button onClick={e => { e.stopPropagation(); viewReceipt(o) }}
                          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-50 text-blue-700 text-xs font-bold border border-blue-200 hover:bg-blue-600 hover:text-white hover:border-blue-600 hover:scale-105 active:scale-95 transition-all">
                          <FileText size={13} /> Fişi Görüntüle
                        </button>
                        <button onClick={e => { e.stopPropagation(); printReceipt(o) }} disabled={printerBusy}
                          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white text-gray-700 text-xs font-bold border border-gray-200 hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700 hover:scale-105 active:scale-95 transition-all disabled:opacity-50">
                          <Printer size={13} /> Yazdır
                        </button>
                        <button onClick={e => { e.stopPropagation(); downloadEvidence(o) }}
                          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white text-gray-700 text-xs font-bold border border-gray-200 hover:bg-amber-50 hover:border-amber-300 hover:text-amber-700 hover:scale-105 active:scale-95 transition-all">
                          <ShieldBan size={13} /> Kayıt İndir
                        </button>
                        {isOrderBlocked(o) ? (
                          <>
                            <span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-red-600 text-white text-xs font-bold border border-red-600 shadow-md shadow-red-600/30">
                              <Ban size={13} /> Cihaz Engellendi
                            </span>
                            <button onClick={e => { e.stopPropagation(); unblockByOrder(o) }}
                              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200 hover:bg-emerald-100 hover:border-emerald-300 hover:scale-105 active:scale-95 transition-all">
                              <Unlock size={13} /> Engeli Kaldır
                            </button>
                          </>
                        ) : (
                          <button onClick={e => { e.stopPropagation(); blockOrder(o) }}
                            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-red-50 text-red-600 text-xs font-bold border border-red-200 hover:bg-red-100 hover:border-red-300 hover:scale-105 active:scale-95 transition-all">
                            <Ban size={13} /> Cihazı Engelle
                          </button>
                        )}
                      </div>
                    )
                  })()}
                </div>
              )
            })}
          </div>
        </>
      )}

      {/* Detail Modal */}
      {detail && (
        <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-blue-950/60 backdrop-blur-sm p-0 md:p-4" onClick={() => setDetail(null)}>
          <div className="w-full md:max-w-lg bg-white rounded-t-3xl md:rounded-3xl overflow-hidden shadow-2xl animate-fadeIn flex flex-col max-h-[90dvh] md:max-h-[85vh]" onClick={e => e.stopPropagation()}>
            <div className="relative bg-gradient-to-br from-blue-700 via-blue-600 to-blue-500 p-6 flex-shrink-0">
              <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-white/10 blur-2xl" />
              <div className="md:hidden w-10 h-1 rounded-full bg-white/40 mx-auto mb-5" />
              <div className="relative flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-white/70 text-xs font-mono font-semibold">SİPARİŞ #{detail.id}</span>
                    {detail.trackingCode && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-yellow-400/20 border border-yellow-300/30 text-yellow-100 text-xs font-mono font-bold" title="Takip Kodu">
                        <Search size={11} /> {detail.trackingCode}
                      </span>
                    )}
                    <StatusBadge o={detail} />
                  </div>
                  <p className="text-white text-xl font-bold mt-2">{detail.customerName || 'Müşteri'}</p>
                  <p className="text-blue-100 text-xs mt-1 flex items-center gap-1.5">
                    <Clock size={12} /> {formatDate(detail.createdAt)}
                  </p>
                </div>
                <button onClick={() => setDetail(null)} title="Kapat"
                  className="w-10 h-10 -mr-2 -mt-2 rounded-full bg-white text-blue-700 flex items-center justify-center shadow-lg shadow-blue-900/20 hover:bg-blue-50 hover:scale-105 active:scale-90 transition-all flex-shrink-0">
                  <X size={18} strokeWidth={2.5} />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-5 overflow-y-auto flex-1">
              {/* Info chips */}
              <div className="flex flex-wrap gap-2">
                {isTableOrder(detail) && detail.tableNumber ? (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-indigo-50 text-indigo-600 text-xs font-bold border border-indigo-200">
                    <Armchair size={13} /> Masa {detail.tableNumber}
                  </span>
                ) : null}
                {isOnlineOrder(detail) ? (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-cyan-50 text-cyan-600 text-xs font-bold border border-cyan-200">
                    <Globe size={13} /> Online Sipariş
                  </span>
                ) : isTableOrder(detail) ? (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-blue-50 text-blue-600 text-xs font-bold border border-blue-200">
                    <Armchair size={13} /> Masa Siparişi
                  </span>
                ) : null}
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-50 text-amber-600 text-xs font-bold border border-amber-200">
                  <Banknote size={13} /> ₺{orderTotal(detail).toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
                </span>
              </div>

              {/* Contact */}
              {(detail.customerContact || parseAddress(detail.note)) && (
                <div className="rounded-2xl bg-blue-50/60 border border-blue-100 p-4 space-y-2.5">
                  <p className="text-[10px] text-blue-600 font-bold uppercase tracking-wider">İletişim & Adres</p>
                  {detail.customerContact && (
                    <p className="flex items-center gap-2 text-sm text-gray-700">
                      <Phone size={15} className="text-blue-600" /> {detail.customerContact}
                    </p>
                  )}
                  {parseAddress(detail.note) && (
                    <p className="flex items-start gap-2 text-sm text-gray-700">
                      <MapPin size={15} className="text-cyan-600 flex-shrink-0 mt-0.5" /> {parseAddress(detail.note)}
                    </p>
                  )}
                  <LocationButton note={detail.note} />
                </div>
              )}

              {/* Items */}
              <div>
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-2.5">Ürünler ({detail.products?.length || 0})</p>
                <div className="space-y-2">
                  {detail.products?.map((p: any, i: number) => (
                    <div key={i} className="flex items-center gap-3 py-2.5 border-b border-blue-50 last:border-0">
                      <span className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-600 to-blue-700 text-white text-[10px] font-bold flex items-center justify-center flex-shrink-0">
                        {p.quantity}×
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-gray-900 font-semibold">{p.name}</p>
                        {p.note && <p className="text-[11px] text-gray-400 mt-0.5">Not: {p.note}</p>}
                      </div>
                      <p className="text-sm text-gray-700 font-bold">₺{((Number(p.price) || 0) * (p.quantity || 1)).toLocaleString('tr-TR', { minimumFractionDigits: 2 })}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* General note */}
              {detail.note && detail.note !== 'Garson çağrısı' && !/^Adres: /.test(detail.note) && (
                <div className="rounded-2xl bg-amber-50 border border-amber-200 p-4">
                  <p className="text-[10px] text-amber-600 font-bold uppercase tracking-wider mb-1.5">Genel Not</p>
                  <p className="text-sm text-gray-700 leading-relaxed">{detail.note.replace(/ \| Konum: https?:\/\/[^\s|]+/, '')}</p>
                </div>
              )}

              {/* Customer note */}
              <div className="rounded-2xl bg-blue-50/60 border border-blue-100 p-4">
                <p className="text-[10px] text-blue-600 font-bold uppercase tracking-wider mb-2">Müşteriye Not</p>
                <textarea value={customerNote} onChange={e => setCustomerNote(e.target.value)}
                  placeholder="Örn: Siparişiniz yola çıktı, tahmini varış 30 dk."
                  rows={3}
                  className="w-full bg-white border border-blue-100 rounded-xl px-3 py-2.5 text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100 resize-none" />
                <p className="text-[10px] text-gray-400 mt-1.5">Müşteri, sipariş takip ekranında bu notu görecek.</p>
                <button onClick={() => { updateStatus(detail.id, detail.status, customerNote) }} disabled={updating === detail.id}
                  className="mt-3 py-2 px-4 rounded-full bg-blue-600 text-white text-xs font-bold shadow-md shadow-blue-600/30 hover:bg-blue-700 transition-all active:scale-95 disabled:opacity-50">
                  {updating === detail.id ? 'Kaydediliyor...' : 'Notu Kaydet'}
                </button>
              </div>

              {/* Total */}
              <div className="flex items-center justify-between bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl px-5 py-4 shadow-md shadow-blue-600/20">
                <p className="text-white text-sm font-semibold">Toplam</p>
                <p className="text-white text-xl font-bold">₺{orderTotal(detail).toLocaleString('tr-TR', { minimumFractionDigits: 2 })}</p>
              </div>

              {/* Actions */}
              <div className="space-y-2.5">
                <div className="grid grid-cols-2 gap-2.5">
                  <button onClick={() => viewReceipt(detail)}
                    className="flex items-center justify-center gap-2 py-3 rounded-xl bg-blue-50 border border-blue-200 text-blue-700 text-sm font-bold hover:bg-blue-100 hover:border-blue-300 hover:shadow-md hover:shadow-blue-600/10 active:scale-95 transition-all">
                    <FileText size={16} /> Fişi Görüntüle (PDF)
                  </button>
                  <button onClick={() => { printReceipt(detail); setDetail(null) }} disabled={printerBusy}
                    className="flex items-center justify-center gap-2 py-3 rounded-xl bg-white border border-gray-200 text-gray-700 text-sm font-bold hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700 active:scale-95 transition-all disabled:opacity-50">
                    <Printer size={16} /> Fiş Yazdır
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-2.5">
                  <button onClick={() => downloadEvidence(detail)}
                    className="flex items-center justify-center gap-2 py-3 rounded-xl bg-white border border-gray-200 text-gray-600 text-sm font-bold hover:bg-amber-50 hover:border-amber-300 hover:text-amber-700 hover:shadow-md hover:shadow-amber-500/10 active:scale-95 transition-all">
                    <ShieldBan size={16} /> Kayıt İndir
                  </button>
                  {isOrderBlocked(detail) ? (
                    <button onClick={() => unblockByOrder(detail)}
                      className="flex items-center justify-center gap-2 py-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm font-bold hover:bg-emerald-100 hover:border-emerald-300 hover:shadow-md hover:shadow-emerald-500/10 active:scale-95 transition-all">
                      <Unlock size={16} /> Engeli Kaldır
                    </button>
                  ) : (
                    <button onClick={() => blockOrder(detail)}
                      className="flex items-center justify-center gap-2 py-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm font-bold hover:bg-red-100 hover:border-red-300 hover:shadow-md hover:shadow-red-500/10 active:scale-95 transition-all">
                      <Ban size={16} /> Cihazı Engelle
                    </button>
                  )}
                </div>
                {detail.status !== 'delivered' && detail.status !== 'completed' && detail.status !== 'cancelled' && (
                  (() => {
                    const online = isOnlineOrder(detail)
                    return (
                      <>
                        {online && detail.status === 'preparing' && (
                          <button onClick={() => { updateStatus(detail.id, 'out_for_delivery') }} disabled={updating === detail.id}
                            className="flex w-full items-center justify-center gap-2 py-3 rounded-xl bg-purple-50 border border-purple-200 text-purple-700 text-sm font-bold hover:bg-purple-100 hover:border-purple-300 active:scale-95 transition-all disabled:opacity-50">
                            <Truck size={16} /> Yola Çıktı
                          </button>
                        )}
                        <button onClick={() => { updateStatus(detail.id, 'delivered'); setDetail(null) }} disabled={updating === detail.id}
                          className="flex w-full items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 text-white text-sm font-bold shadow-md shadow-blue-600/30 hover:from-blue-700 hover:to-blue-800 active:scale-95 transition-all disabled:opacity-50">
                          <CheckCircle2 size={16} /> Teslim Edildi
                        </button>
                      </>
                    )
                  })()
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* İptal Sebebi Modalı */}
      {cancelTarget && (
        <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center p-0 md:p-4 bg-blue-950/60 backdrop-blur-sm" onClick={() => setCancelTarget(null)}>
          <div className="w-full md:max-w-md bg-white rounded-t-3xl md:rounded-3xl overflow-hidden shadow-2xl animate-fadeIn" onClick={e => e.stopPropagation()}>
            <div className="bg-gradient-to-br from-red-600 via-red-600 to-rose-600 p-6">
              <div className="md:hidden w-10 h-1 rounded-full bg-white/40 mx-auto mb-5" />
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-full bg-white/20 flex items-center justify-center">
                  <XCircle size={22} className="text-white" />
                </div>
                <div>
                  <h3 className="text-white font-bold">Siparişi İptal Et</h3>
                  <p className="text-white/80 text-xs mt-0.5">#{cancelTarget.id} · {cancelTarget.customerName}</p>
                </div>
              </div>
            </div>

            <div className="p-6">
              <p className="text-[10px] text-gray-500 font-semibold uppercase tracking-wider mb-3">İptal Sebebi (müşteriye gösterilir)</p>
              <div className="flex flex-wrap gap-2 mb-4">
                {['Ürün eksik', 'Hizmet bölgesi dışı', 'Adres bulunamadı', 'Müşteri talebi', 'Stok yok', 'Ödeme alınamadı'].map(opt => {
                  const active = cancelReason === opt
                  return (
                    <button key={opt} onClick={() => setCancelReason(opt)}
                      className={'px-3.5 py-2 rounded-full text-xs font-bold border transition-all active:scale-95 ' + (active ? 'bg-red-600 text-white border-red-600 shadow-md shadow-red-600/30' : 'bg-white text-gray-600 border-gray-200 hover:border-red-300 hover:bg-red-50')}>
                      {opt}
                    </button>
                  )
                })}
              </div>
              <textarea value={cancelReason} onChange={e => setCancelReason(e.target.value)}
                placeholder="Veya özel bir sebep yazın..."
                rows={3}
                className="w-full bg-blue-50/40 border border-blue-100 rounded-xl px-3 py-2.5 text-gray-900 text-sm focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-100 resize-none" />

              <div className="flex gap-3 mt-5">
                <button onClick={() => setCancelTarget(null)}
                  className="flex-1 py-3 rounded-full bg-gray-100 text-gray-600 text-sm font-bold hover:bg-gray-200 transition-all">
                  Vazgeç
                </button>
                <button onClick={async () => {
                  const reason = cancelReason.trim()
                  if (!reason) { alert('İptal sebebi girin veya seçin.'); return }
                  await updateStatus(cancelTarget.id, 'cancelled', reason)
                  setCancelTarget(null)
                }} disabled={updating === cancelTarget.id}
                  className="flex-1 py-3 rounded-full bg-gradient-to-r from-red-500 to-red-600 text-white text-sm font-bold shadow-md shadow-red-500/30 hover:from-red-600 hover:to-red-700 transition-all disabled:opacity-50">
                  {updating === cancelTarget.id ? 'İptal Ediliyor...' : 'İptal Et'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}