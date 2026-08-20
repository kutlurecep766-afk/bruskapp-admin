'use client'
import { useState, useEffect, useRef, useCallback } from 'react'
import { Printer, CheckCircle2, AlertTriangle, Loader2, PlugZap, Unplug, Play, Armchair, Globe, Bell } from 'lucide-react'
import { buildTestReceipt, buildOrderReceipt } from './escpos'

interface PrinterManagerProps {
  tenantId?: string
  storeInfo?: { name: string; address: string; phone: string }
}

const storageKey = (k: string) => 'brusk_print_' + k

function orderToReceipt(order: any, storeInfo: { name: string; address: string; phone: string }): Uint8Array {
  return buildOrderReceipt(order, storeInfo.name || 'BRUSKAPP', storeInfo.address || '')
}

export default function PrinterManager({ tenantId, storeInfo }: PrinterManagerProps) {
  const [supported, setSupported] = useState(true)
  const [port, setPort] = useState<SerialPort | null>(null)
  const [connected, setConnected] = useState(false)
  const [autoPrint, setAutoPrint] = useState(false)
  const [printTable, setPrintTable] = useState(true)
  const [printOnline, setPrintOnline] = useState(true)
  const [printWaiter, setPrintWaiter] = useState(false)
  const [busy, setBusy] = useState(false)
  const [status, setStatus] = useState('Yazıcı bağlı değil')
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

  useEffect(() => {
    try {
      setAutoPrint(localStorage.getItem(storageKey('auto_print')) === '1')
      setPrintTable(localStorage.getItem(storageKey('print_table')) !== '0')
      setPrintOnline(localStorage.getItem(storageKey('print_online')) !== '0')
      setPrintWaiter(localStorage.getItem(storageKey('print_waiter')) === '1')
    } catch {}
  }, [])

  useEffect(() => { localStorage.setItem(storageKey('auto_print'), autoPrint ? '1' : '0') }, [autoPrint])
  useEffect(() => { localStorage.setItem(storageKey('print_table'), printTable ? '1' : '0') }, [printTable])
  useEffect(() => { localStorage.setItem(storageKey('print_online'), printOnline ? '1' : '0') }, [printOnline])
  useEffect(() => { localStorage.setItem(storageKey('print_waiter'), printWaiter ? '1' : '0') }, [printWaiter])

  useEffect(() => {
    if (!tenantId) return
    if (!('serial' in navigator)) {
      setSupported(false)
      setStatus('Tarayıcı Web Serial desteklemiyor')
      return
    }
    ;(async () => {
      try {
        const ports = await navigator.serial!.getPorts()
        if (ports.length > 0) await openPort(ports[0])
      } catch {}
    })()
  }, [tenantId])

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

  async function testPrint() {
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

  async function handleNewOrder(order: any) {
    if (!autoPrintRef.current) return
    if (!order?.id || order.id <= lastIdRef.current) return
    lastIdRef.current = order.id
    if (order.customerName === 'Test') return
    const p = String(order.platform || '')
    const type = p.includes('Garson') ? 'waiter' : (p === 'Masa' || p === 'Masa Siparişi' || order.tableNumber) ? 'table' : 'online'
    const enabled = type === 'table' ? printTableRef.current : type === 'online' ? printOnlineRef.current : printWaiterRef.current
    if (!enabled) {
      addLog('Sipariş #' + order.id + ' fiş filtresine takıldı, atlandı')
      return
    }
    addLog('Yeni sipariş #' + order.id + ' → yazdırılıyor')
    try {
      if (!portRef.current) {
        addLog('USB yazıcı bağlı değil, fiş atlandı')
        return
      }
      await writeBytes(orderToReceipt(order, storeInfoRef.current))
      setStatus('Fiş basıldı #' + order.id)
      addLog('Fiş basıldı: #' + order.id)
    } catch (e: any) {
      addLog('Otomatik basım hatası')
    }
  }

  const printTableRef = useRef(true)
  const printOnlineRef = useRef(true)
  const printWaiterRef = useRef(false)

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
  }, [tenantId, autoPrint])

  const toggle = (set: (v: boolean) => void, value: boolean) => (
    <button onClick={() => set(!value)}
      className={'relative w-12 h-7 rounded-full transition-colors flex-shrink-0 ' + (value ? 'bg-emerald-500' : 'bg-gray-300')}>
      <span className={'absolute top-0.5 w-6 h-6 rounded-full bg-white shadow transition-all ' + (value ? 'left-[22px]' : 'left-0.5')} />
    </button>
  )

  return (
    <div className="rounded-2xl bg-white border border-blue-100 p-6 shadow-sm">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
            <Printer size={20} className="text-white" />
          </div>
          <div>
            <h3 className="text-gray-900 font-semibold text-sm">USB Fiş Yazıcısı</h3>
            <p className="text-xs text-gray-500 mt-0.5 flex items-center gap-1.5">
              <span className={'w-1.5 h-1.5 rounded-full ' + (connected ? 'bg-emerald-400 animate-pulse' : 'bg-red-400')} />
              {status}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button onClick={testPrint} disabled={busy || !connected}
            className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-gradient-to-r from-emerald-500 to-teal-600 text-white text-sm font-semibold hover:shadow-lg hover:shadow-emerald-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50">
            {busy ? <Loader2 size={16} className="animate-spin" /> : <Play size={16} />} Test Fişi
          </button>
          {connected ? (
            <button onClick={disconnect} className="flex items-center gap-2 px-4 py-2.5 rounded-full border border-blue-200 text-gray-600 hover:text-red-500 hover:border-red-300 transition-all text-sm font-semibold">
              <Unplug size={16} /> Kapat
            </button>
          ) : (
            <button onClick={connect} disabled={busy || !supported}
              className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white text-sm font-semibold hover:shadow-lg hover:shadow-blue-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50">
              {busy ? <Loader2 size={16} className="animate-spin" /> : <PlugZap size={16} />} Yazıcı Bağla
            </button>
          )}
        </div>
      </div>

      {!supported && (
        <div className="mt-4 flex items-start gap-3 p-3 rounded-xl bg-amber-50 border border-amber-200">
          <AlertTriangle size={18} className="text-amber-500 mt-0.5 flex-shrink-0" />
          <p className="text-xs text-amber-800 leading-relaxed">
            Bu tarayıcı <b>Web Serial</b> desteklemiyor. USB fiş yazıcısını bağlamak için Chrome veya Edge (masaüstü) kullanın.
          </p>
        </div>
      )}

      <div className="mt-4 flex items-center justify-between gap-4 rounded-xl bg-blue-50/60 border border-blue-100 p-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center shadow-md shadow-blue-600/30">
            <CheckCircle2 size={17} className="text-white" />
          </div>
          <div>
            <p className="text-sm text-gray-800 font-semibold">Otomatik fiş basımı</p>
            <p className="text-[11px] text-gray-500">Açıkken yeni siparişler ve seçilen türlerdeki garson çağrıları otomatik basılır</p>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <span className={'text-xs font-bold ' + (autoPrint ? 'text-emerald-600' : 'text-gray-400')}>{autoPrint ? 'Açık' : 'Kapalı'}</span>
          {toggle(setAutoPrint, autoPrint)}
        </div>
      </div>

      {autoPrint && (
        <div className="mt-3 rounded-xl bg-white border border-blue-100 p-4">
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

      {connected && autoPrint && (
        <div className="mt-3 flex items-center gap-2 text-xs text-emerald-600">
          <CheckCircle2 size={14} />
          Bu sekme açık kaldığı sürece yeni siparişler USB yazıcıdan sesli düşer — başka sekmede YouTube açsan bile çalışır.
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