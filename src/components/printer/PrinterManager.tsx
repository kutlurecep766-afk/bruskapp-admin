'use client'
import { useState, useEffect, useRef, useCallback } from 'react'
import { Printer, Wifi, Usb, CheckCircle2, AlertTriangle, Loader2, PlugZap, Unplug, Play, Armchair, Globe, Bell } from 'lucide-react'
import { buildTestReceipt, buildOrderReceipt } from './escpos'
import { printReceiptSystem, parseNoteAddress as parseNoteAddressImpl, parseNotePayment as parseNotePaymentImpl, type ReceiptData } from '@/lib/receipt'

interface PrinterManagerProps {
  tenantId?: string
  storeInfo?: { name: string; address: string; phone: string }
}

const storageKey = (k: string) => 'brusk_print_' + k
type PrintMode = 'system' | 'usb'

function orderType(o: any): 'table' | 'online' | 'waiter' | 'other' {
  const p = String(o.platform || '').trim()
  if (p.includes('Garson')) return 'waiter'
  if (p === 'Masa' || p === 'Masa Siparişi' || o.tableNumber) return 'table'
  if (p === 'QR Menü' || p === 'Online' || p === 'Online Sipariş') return 'online'
  return 'other'
}

function orderToReceipt(order: any, storeInfo: { name: string; address: string; phone: string }): ReceiptData {
  const isWaiter = String(order.platform || '').includes('Garson')
  const items = isWaiter
    ? [{ name: String(order.note || 'Garson çağrısı'), price: 0, qty: 1 }]
    : (order.products || []).map((p: any) => ({ name: String(p.name || ''), price: Number(p.price) || 0, qty: p.quantity || 1, note: p.note }))
  return {
    businessName: storeInfo.name || 'İşletme',
    address: storeInfo.address || '',
    phone: storeInfo.phone || '',
    orderId: order.id,
    trackingCode: order.trackingCode || null,
    tableNumber: order.tableNumber || null,
    customerName: order.customerName || '',
    customerContact: order.customerContact || '',
    customerAddress: parseNoteAddressImpl(order.note) || '',
    payment: isWaiter ? 'Garson Çağrı' : (parseNotePaymentImpl(order.note) || ''),
    dateLabel: new Date(order.createdAt || Date.now()).toLocaleString('tr-TR', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
    items,
    total: isWaiter ? 0 : (order.products?.reduce((a: number, p: any) => a + (Number(p.price) || 0) * (p.quantity || 1), 0) || order.totalAmount || 0),
  }
}

export default function PrinterManager({ tenantId, storeInfo }: PrinterManagerProps) {
  const [mode, setMode] = useState<PrintMode>('system')
  const [supported, setSupported] = useState(true)
  const [port, setPort] = useState<SerialPort | null>(null)
  const [connected, setConnected] = useState(false)
  const [autoPrint, setAutoPrint] = useState(false)
  const [printTable, setPrintTable] = useState(true)
  const [printOnline, setPrintOnline] = useState(true)
  const [printWaiter, setPrintWaiter] = useState(false)
  const [busy, setBusy] = useState(false)
  const [status, setStatus] = useState('Sistem yazıcısı kullanılacak')
  const [logs, setLogs] = useState<string[]>([])
  const portRef = useRef<SerialPort | null>(null)
  const autoPrintRef = useRef(false)
  const lastIdRef = useRef<number>(0)
  const storeInfoRef = useRef({ name: '', address: '', phone: '' })

  useEffect(() => { storeInfoRef.current = storeInfo || storeInfoRef.current }, [storeInfo])

  const addLog = useCallback((msg: string) => {
    setLogs(prev => [`${new Date().toLocaleTimeString('tr-TR')} - ${msg}`, ...prev].slice(0, 30))
  }, [])

  useEffect(() => {
    autoPrintRef.current = autoPrint
  }, [autoPrint])

  const printTableRef = useRef(true)
  const printOnlineRef = useRef(true)
  const printWaiterRef = useRef(false)
  useEffect(() => { printTableRef.current = printTable }, [printTable])
  useEffect(() => { printOnlineRef.current = printOnline }, [printOnline])
  useEffect(() => { printWaiterRef.current = printWaiter }, [printWaiter])

  useEffect(() => {
    try {
      const saved = localStorage.getItem(storageKey('mode'))
      if (saved === 'usb' || saved === 'system') setMode(saved)
      setAutoPrint(localStorage.getItem(storageKey('auto_print')) === '1')
      setPrintTable(localStorage.getItem(storageKey('print_table')) !== '0')
      setPrintOnline(localStorage.getItem(storageKey('print_online')) !== '0')
      setPrintWaiter(localStorage.getItem(storageKey('print_waiter')) === '1')
    } catch {}
  }, [])

  useEffect(() => { localStorage.setItem(storageKey('mode'), mode) }, [mode])
  useEffect(() => { localStorage.setItem(storageKey('auto_print'), autoPrint ? '1' : '0') }, [autoPrint])
  useEffect(() => { localStorage.setItem(storageKey('print_table'), printTable ? '1' : '0') }, [printTable])
  useEffect(() => { localStorage.setItem(storageKey('print_online'), printOnline ? '1' : '0') }, [printOnline])
  useEffect(() => { localStorage.setItem(storageKey('print_waiter'), printWaiter ? '1' : '0') }, [printWaiter])

  useEffect(() => {
    if (!tenantId) return
    if (!('serial' in navigator)) {
      setSupported(false)
    }
    if (mode !== 'usb') return
    if (!('serial' in navigator)) {
      setStatus('Tarayıcı Web Serial desteklemiyor')
      return
    }
    ;(async () => {
      try {
        const ports = await navigator.serial!.getPorts()
        if (ports.length > 0) await openPort(ports[0])
      } catch {}
    })()
  }, [tenantId, mode])

  async function openPort(p: SerialPort) {
    try {
      if (!p.writable) await p.open({ baudRate: 9600 })
      portRef.current = p
      setPort(p)
      setConnected(true)
      const info = p.getInfo()
      const vendor = info.usbVendorId ? info.usbVendorId.toString(16).padStart(4, '0') : '????'
      const product = info.usbProductId ? info.usbProductId.toString(16).padStart(4, '0') : '????'
      setStatus(`USB bağlı (${vendor}:${product})`)
      addLog('USB yazıcı bağlandı')
    } catch (e: any) {
      setStatus('Bağlantı hatası: ' + (e?.message || 'bilinmiyor'))
      addLog('Bağlantı hatası')
    }
  }

  async function writeBytes(data: Uint8Array) {
    const p = portRef.current
    if (!p?.writable) throw new Error('Yazıcı bağlı değil')
    const writer = p.writable.getWriter()
    try { await writer.write(data) } finally { writer.releaseLock() }
  }

  async function connect() {
    if (!navigator.serial) return
    setBusy(true)
    try {
      const p = await navigator.serial.requestPort()
      await openPort(p)
    } catch (e: any) {
      if (e?.name !== 'NotFoundError') {
        setStatus('Bağlantı iptal edildi / hata')
        addLog('Bağlantı iptal edildi')
      }
    } finally { setBusy(false) }
  }

  async function disconnect() {
    const p = portRef.current
    if (p) {
      try {
        if (p.writable) {
          const writer = p.writable.getWriter()
          try { await writer.close() } catch {}
        }
        await p.close()
      } catch {}
    }
    portRef.current = null
    setPort(null)
    setConnected(false)
    setStatus('Yazıcı bağlı değil')
    addLog('USB bağlantısı kapatıldı')
  }

  function systemTest() {
    printReceiptSystem({
      businessName: storeInfoRef.current.name || 'TEST',
      address: storeInfoRef.current.address || '',
      phone: storeInfoRef.current.phone || '',
      orderId: 'TEST',
      trackingCode: null,
      tableNumber: null,
      customerName: '',
      customerContact: '',
      customerAddress: '',
      payment: '',
      dateLabel: new Date().toLocaleString('tr-TR', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
      items: [{ name: 'Test Fişi', price: 1, qty: 1 }],
      total: 1,
    })
    setStatus('Tarayıcı yazdırma penceresi açıldı')
    addLog('Test fişi yazıcıya gönderildi')
  }

  async function usbTest() {
    if (!portRef.current) return
    setBusy(true)
    try {
      await writeBytes(buildTestReceipt(storeInfoRef.current.name || 'BRUSKAPP'))
      addLog('Test fişi gönderildi')
      setStatus('Test fişi basıldı')
    } catch (e: any) {
      setStatus('Yazdırma hatası: ' + (e?.message || 'bilinmiyor'))
      addLog('Yazdırma hatası')
    } finally { setBusy(false) }
  }

  async function testPrint() {
    if (mode === 'system') systemTest()
    else await usbTest()
  }

  async function handleNewOrder(order: any) {
    if (!autoPrintRef.current) return
    if (!order?.id || order.id <= lastIdRef.current) return
    lastIdRef.current = order.id
    if (order.customerName === 'Test') return
    const type = orderType(order)
    const enabled = type === 'table' ? printTableRef.current : type === 'online' ? printOnlineRef.current : printWaiterRef.current
    if (!enabled) {
      addLog('Sipariş #' + order.id + ' fiş filtresine takıldı, atlandı')
      return
    }
    addLog('Yeni sipariş #' + order.id + ' → yazdırılıyor')
    try {
      if (mode === 'system') {
        printReceiptSystem(orderToReceipt(order, storeInfoRef.current))
        setStatus('Fiş #' + order.id + ' yazıcıya gönderildi')
      } else {
        if (!portRef.current) {
          addLog('USB yazıcı bağlı değil, fiş atlandı')
          return
        }
        await writeBytes(buildOrderReceipt(order, storeInfoRef.current.name || 'BRUSKAPP', storeInfoRef.current.address))
        setStatus('Fiş basıldı #' + order.id)
      }
      addLog('Fiş basıldı: #' + order.id)
    } catch (e: any) {
      addLog('Otomatik basım hatası')
    }
  }

  useEffect(() => {
    if (!tenantId) return
    ;(async () => {
      try {
        const res = await fetch('/api/orders?tenantId=' + tenantId, { credentials: 'include' })
        if (res.ok) {
          const arr = await res.json()
          if (Array.isArray(arr) && arr.length > 0) lastIdRef.current = arr[0].id || 0
        }
      } catch {}
    })()
  }, [tenantId])

  useEffect(() => {
    if (!tenantId || !autoPrint) return
    const es = new EventSource('/api/orders/events?tenantId=' + tenantId)
    es.addEventListener('new_order', async (ev) => {
      try { await handleNewOrder(JSON.parse((ev as MessageEvent).data)) } catch {}
    })
    return () => es.close()
  }, [tenantId, autoPrint, mode])

  const modeBtn = (m: PrintMode, label: string, icon: any, desc: string, activeCls: string) => {
    const Icon = icon
    const active = mode === m
    return (
      <button onClick={() => { setMode(m); setStatus(m === 'system' ? 'Sistem yazıcısı kullanılacak' : 'USB yazıcı bağlamak için "Bağla"ya basın') }}
        className={'flex flex-1 items-center gap-3 rounded-2xl border-2 px-4 py-3.5 text-left transition-all active:scale-[0.98] ' + (active ? activeCls : 'bg-white text-gray-600 border-blue-200 hover:border-blue-300 hover:bg-blue-50')}>
        <div className={'w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 ' + (active ? 'bg-white/25' : 'bg-blue-50')}>
          <Icon size={16} className={active ? 'text-white' : 'text-blue-500'} />
        </div>
        <div>
          <p className={'text-sm font-bold ' + (active ? 'text-white' : 'text-gray-800')}>{label}</p>
          <p className={'text-[10px] ' + (active ? 'text-white/80' : 'text-gray-400')}>{desc}</p>
        </div>
      </button>
    )
  }

  return (
    <div className="rounded-2xl bg-white border border-blue-100 p-6 shadow-sm">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
            <Printer size={20} className="text-white" />
          </div>
          <div>
            <h3 className="text-gray-900 font-semibold text-sm">Fiş Yazıcısı</h3>
            <p className="text-xs text-gray-500 mt-0.5 flex items-center gap-1.5">
              <span className={'w-1.5 h-1.5 rounded-full ' + (connected || mode === 'system' ? 'bg-emerald-400 animate-pulse' : 'bg-red-400')} />
              {status}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button onClick={testPrint} disabled={busy}
            className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-gradient-to-r from-emerald-500 to-teal-600 text-white text-sm font-semibold hover:shadow-lg hover:shadow-emerald-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50">
            {busy ? <Loader2 size={16} className="animate-spin" /> : <Play size={16} />} Test Fişi
          </button>
          {mode === 'usb' && (connected ? (
            <button onClick={disconnect} className="flex items-center gap-2 px-4 py-2.5 rounded-full border border-blue-200 text-gray-600 hover:text-red-500 hover:border-red-300 transition-all text-sm font-semibold">
              <Unplug size={16} /> Kapat
            </button>
          ) : (
            <button onClick={connect} disabled={busy || !supported}
              className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white text-sm font-semibold hover:shadow-lg hover:shadow-blue-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50">
              {busy ? <Loader2 size={16} className="animate-spin" /> : <PlugZap size={16} />} Yazıcı Bağla
            </button>
          ))}
        </div>
      </div>

      <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3">
        {modeBtn('system', 'Wi-Fi / Kablosuz', Wifi, 'Bilgisayara kurulu tüm yazıcılar kullanılır', 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white border-cyan-600 shadow-md shadow-cyan-500/30')}
        {modeBtn('usb', 'USB Fiş Yazıcısı', Usb, 'Doğrudan bağlanır (Chrome/Edge)', 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white border-blue-700 shadow-md shadow-blue-600/30')}
      </div>

      {mode === 'usb' && !supported && (
        <div className="mt-4 flex items-start gap-3 p-3 rounded-xl bg-amber-50 border border-amber-200">
          <AlertTriangle size={18} className="text-amber-500 mt-0.5 flex-shrink-0" />
          <p className="text-xs text-amber-800 leading-relaxed">
            Bu tarayıcı <b>Web Serial</b> desteklemiyor. USB fiş yazıcısını bağlamak için Chrome veya Edge (masaüstü) kullanın. Bunun yerine <b>Wi-Fi / Kablosuz</b> modunu seçebilirsiniz.
          </p>
        </div>
      )}

      {mode === 'system' && (
        <div className="mt-4 flex items-start gap-3 p-3 rounded-xl bg-cyan-50 border border-cyan-100">
          <Wifi size={18} className="text-cyan-600 mt-0.5 flex-shrink-0" />
          <p className="text-xs text-cyan-900 leading-relaxed">
            Test Fişi'ne basın; tarayıcı açacağı yazdırma penceresinde bilgisayara kurulu yazıcıyı (USB, Wi-Fi veya ağ) seçin ve <b>Her zaman bu yazıcıda yazdır</b> kutucuğunu işaretleyin. Bir kez yaptıktan sonra her siparişte fiş otomatik basılır ve her seferinde tek <b>Yazdır</b> tıklaması gerekir.
          </p>
        </div>
      )}

      {(mode === 'system' || connected) && (
        <div className="mt-4 space-y-3">
          <label className="flex items-center gap-3 p-3 rounded-xl bg-blue-50/60 border border-blue-100 cursor-pointer w-full">
            <input type="checkbox" checked={autoPrint} onChange={e => setAutoPrint(e.target.checked)} className="w-4 h-4 accent-blue-600" />
            <div>
              <p className="text-sm text-gray-800 font-semibold">Otomatik fiş basımı</p>
              <p className="text-[11px] text-gray-500">Yeni sipariş ve garson çağrılarında fişi otomatik bas</p>
            </div>
          </label>

          {autoPrint && (
            <div className="rounded-xl bg-white border border-blue-100 p-4">
              <p className="text-[10px] uppercase tracking-wider text-gray-400 font-semibold mb-3">Hangi siparişler fiş olsun?</p>
              <div className="flex flex-col gap-2">
                {([
                  { key: 'printTable', label: 'Masa QR siparişleri', desc: 'Masa koduyla verilen siparişler', icon: Armchair, value: printTable, set: setPrintTable },
                  { key: 'printOnline', label: 'Online QR siparişleri', desc: 'Online QR menüden gelen siparişler', icon: Globe, value: printOnline, set: setPrintOnline },
                  { key: 'printWaiter', label: 'Garson çağrıları', desc: 'Masadan yapılan garson çağrıları', icon: Bell, value: printWaiter, set: setPrintWaiter },
                ]).map(x => {
                  const Icon = x.icon
                  const active = x.value
                  return (
                    <button key={x.key} onClick={() => x.set(!active)}
                      className={'flex items-center gap-3 rounded-xl border px-3 py-2.5 text-left transition-all active:scale-[0.98] ' + (active ? 'bg-blue-600 border-blue-700 text-white shadow-md shadow-blue-600/30' : 'bg-white border-blue-200 text-gray-600 hover:border-blue-300 hover:bg-blue-50')}>
                      <div className={'w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 ' + (active ? 'bg-white/25' : 'bg-blue-50')}>
                        <Icon size={14} className={active ? 'text-white' : 'text-blue-500'} />
                      </div>
                      <div className="flex-1">
                        <p className={'text-sm font-semibold ' + (active ? 'text-white' : 'text-gray-800')}>{x.label}</p>
                        <p className={'text-[10px] ' + (active ? 'text-white/80' : 'text-gray-400')}>{x.desc}</p>
                      </div>
                      <div className={'w-9 h-5 rounded-full transition-colors flex-shrink-0 ' + (active ? 'bg-emerald-400' : 'bg-gray-300')}>
                        <span className={'block w-4 h-4 rounded-full bg-white shadow transition-all mt-0.5 ' + (active ? 'ml-[18px]' : 'ml-0.5')} />
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {autoPrint && (
        <div className="mt-3 flex items-center gap-2 text-xs text-emerald-600">
          <CheckCircle2 size={14} />
          Otomatik basım aktif — bu sayfa açıkken yeni siparişler otomatik yazdırılır.
        </div>
      )}

      {logs.length > 0 && (
        <div className="mt-4 bg-blue-50/40 border border-blue-100 rounded-xl p-3 max-h-28 overflow-y-auto">
          {logs.map((l, i) => (
            <p key={i} className="text-[11px] font-mono text-gray-500 mb-0.5">› {l}</p>
          ))}
        </div>
      )}
    </div>
  )
}