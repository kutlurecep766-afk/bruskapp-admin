'use client'
import { useState, useEffect, useRef, useCallback } from 'react'
import {
  ShoppingBag, Search, Clock, CheckCircle2, XCircle, Timer, Bell, UtensilsCrossed,
  Globe, Armchair, Banknote, Layers, TrendingUp, MapPin, Phone,
  Printer, Volume2, VolumeX, Eye, History, Loader2, Truck, X,
} from 'lucide-react'
import { buildOrderReceipt } from '@/components/printer/escpos'

const STATUS_MAP: Record<string, { label: string; color: string; bg: string; border: string; dot: string; icon: any }> = {
  pending: { label: 'Bekliyor', color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-200', dot: 'bg-amber-500', icon: Timer },
  preparing: { label: 'Hazırlanıyor', color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-200', dot: 'bg-blue-500', icon: Timer },
  out_for_delivery: { label: 'Yola Çıktı', color: 'text-purple-600', bg: 'bg-purple-50', border: 'border-purple-200', dot: 'bg-purple-500', icon: Truck },
  delivered: { label: 'Teslim Edildi', color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-200', dot: 'bg-emerald-500', icon: CheckCircle2 },
  completed: { label: 'Tamamlandı', color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-200', dot: 'bg-emerald-500', icon: CheckCircle2 },
  cancelled: { label: 'İptal', color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-200', dot: 'bg-red-500', icon: XCircle },
}

type TabKey = 'table' | 'online' | 'waiter' | 'history'

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
  const [historyLimit, setHistoryLimit] = useState(20)

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
        const res = await fetch('/api/orders?tenantId=' + tid + '&limit=300', { credentials: 'include' })
        if (res.ok) setOrders(await res.json())
      }
    } catch {} finally { setLoading(false) }
  }, [])

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
  }
  const pendingFor: Record<TabKey, number> = {
    table: pendingTable.length,
    online: pendingOnline.length,
    waiter: pendingWaiter.length,
    history: 0,
  }

  const baseList = tab === 'table' ? tableOrders : tab === 'online' ? onlineOrders : tab === 'waiter' ? waiterCalls : historyOrders
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

  const tabStats = {
    table: {
      total: tableOrders.length, pending: pendingTable.length,
      completed: tableOrders.filter(o => o.status === 'completed').length,
      revenue: tableOrders.filter(o => o.status !== 'cancelled').reduce((a, o) => a + orderTotal(o), 0),
    },
    online: {
      total: onlineOrders.length, pending: pendingOnline.length,
      completed: onlineOrders.filter(o => o.status === 'completed').length,
      revenue: onlineOrders.filter(o => o.status !== 'cancelled').reduce((a, o) => a + orderTotal(o), 0),
    },
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

  const TABS: { key: TabKey; label: string; icon: any }[] = [
    { key: 'table', label: 'Masa', icon: Armchair },
    { key: 'online', label: 'Online', icon: Globe },
    { key: 'waiter', label: 'Garson Çağrıları', icon: Bell },
    { key: 'history', label: 'Geçmiş Siparişler', icon: History },
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
            <span className="inline-flex items-center gap-2 px-3 py-2.5 rounded-full bg-white/15 text-white text-xs font-semibold backdrop-blur">
              <span className="relative flex w-2.5 h-2.5">
                <span className="absolute inline-flex w-full h-full rounded-full bg-emerald-400 opacity-75 animate-ping" />
                <span className="relative inline-flex w-2.5 h-2.5 rounded-full bg-emerald-400" />
              </span>
              Canlı
            </span>
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
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <History size={16} className="text-blue-600" />
              Tamamlanan ve iptal edilen siparişler
            </div>
            <div className="flex items-center gap-2">
              {[20, 50, 100].map(n => (
                <button key={n} onClick={() => setHistoryLimit(n)}
                  className={'px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ' + (historyLimit === n ? 'bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-600/30' : 'bg-white text-blue-700 border-blue-200 hover:bg-blue-50')}>
                  {n} Kayıt
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            {filtered.length === 0 ? (
              <div className="rounded-2xl bg-white border border-dashed border-blue-200 py-20 text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center">
                  <History className="w-8 h-8 text-blue-300" />
                </div>
                <p className="text-gray-500 text-sm font-semibold">Geçmiş sipariş bulunmuyor</p>
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
      ) : (
        <>
          <StatsCards data={tabStats[tab] || { total: 0, pending: 0, completed: 0, revenue: 0 }} />

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
                          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-gradient-to-r from-blue-600 to-blue-700 text-white text-xs font-bold shadow-md shadow-blue-600/30 hover:from-blue-700 hover:to-blue-800 hover:scale-105 active:scale-95 transition-all disabled:opacity-50">
                          <CheckCircle2 size={13} /> Teslim Edildi
                        </button>
                        <button onClick={e => { e.stopPropagation(); updateStatus(o.id, 'cancelled') }} disabled={updating === o.id}
                          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-white text-red-500 text-xs font-bold border border-red-200 hover:bg-red-50 hover:border-red-300 hover:scale-105 active:scale-95 transition-all disabled:opacity-50">
                          <XCircle size={13} /> İptal
                        </button>
                        <button onClick={e => { e.stopPropagation(); printReceipt(o) }} disabled={printerBusy}
                          className="ml-auto inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-white text-gray-700 text-xs font-bold border border-blue-200 hover:bg-blue-50 hover:border-blue-300 hover:scale-105 active:scale-95 transition-all disabled:opacity-50">
                          <Printer size={13} /> Yazdır
                        </button>
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
              <div className="flex gap-2">
                <button onClick={() => { printReceipt(detail); setDetail(null) }} disabled={printerBusy}
                  className="flex-1 py-3 rounded-full bg-white border-2 border-blue-600 text-blue-700 text-sm font-bold hover:bg-blue-50 transition-all active:scale-95 disabled:opacity-50">
                  <Printer size={15} className="inline mr-1.5 -mt-0.5" /> Fiş Yazdır
                </button>
                {detail.status !== 'delivered' && detail.status !== 'completed' && detail.status !== 'cancelled' && (
                  (() => {
                    const online = isOnlineOrder(detail)
                    return (
                      <>
                        {online && detail.status === 'preparing' && (
                          <button onClick={() => { updateStatus(detail.id, 'out_for_delivery') }} disabled={updating === detail.id}
                            className="flex-1 py-3 rounded-full bg-purple-50 border-2 border-purple-500 text-purple-700 text-sm font-bold hover:bg-purple-100 transition-all active:scale-95 disabled:opacity-50">
                            <Truck size={15} className="inline mr-1.5 -mt-0.5" /> Yola Çıktı
                          </button>
                        )}
                        <button onClick={() => { updateStatus(detail.id, 'delivered'); setDetail(null) }} disabled={updating === detail.id}
                          className="flex-1 py-3 rounded-full bg-gradient-to-r from-blue-600 to-blue-700 text-white text-sm font-bold shadow-md shadow-blue-600/30 hover:from-blue-700 hover:to-blue-800 transition-all active:scale-95 disabled:opacity-50">
                          <CheckCircle2 size={15} className="inline mr-1.5 -mt-0.5" /> Teslim Edildi
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
    </div>
  )
}