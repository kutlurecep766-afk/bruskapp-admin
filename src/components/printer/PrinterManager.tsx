'use client'
import { useState, useEffect, useRef, useCallback } from 'react'
import { Printer, RefreshCw, CheckCircle2, AlertTriangle, Loader2, PlugZap, Unplug, Play } from 'lucide-react'
import { buildTestReceipt, buildOrderReceipt } from './escpos'

interface PrinterManagerProps {
  tenantId?: string
}

const storageKey = (k: string) => 'brusk_print_' + k

export default function PrinterManager({ tenantId }: PrinterManagerProps) {
  const [supported, setSupported] = useState(true)
  const [port, setPort] = useState<SerialPort | null>(null)
  const [connected, setConnected] = useState(false)
  const [autoPrint, setAutoPrint] = useState(false)
  const [busy, setBusy] = useState(false)
  const [status, setStatus] = useState('Yazıcı bağlı değil')
  const [logs, setLogs] = useState<string[]>([])
  const [shopName, setShopName] = useState('BRUSKAPP')
  const [shopAddress, setShopAddress] = useState('')
  const portRef = useRef<SerialPort | null>(null)
  const autoPrintRef = useRef(false)
  const lastIdRef = useRef<number>(0)
  const shopRef = useRef({ name: 'BRUSKAPP', address: '' })

  const addLog = useCallback((msg: string) => {
    setLogs(prev => [`${new Date().toLocaleTimeString('tr-TR')} - ${msg}`, ...prev].slice(0, 30))
  }, [])

  useEffect(() => {
    autoPrintRef.current = autoPrint
  }, [autoPrint])

  useEffect(() => {
    shopRef.current = { name: shopName, address: shopAddress }
  }, [shopName, shopAddress])

  useEffect(() => {
    if (!tenantId) return
    setShopName(localStorage.getItem(storageKey('shop_name')) || 'BRUSKAPP')
    setShopAddress(localStorage.getItem(storageKey('shop_address')) || '')
    setAutoPrint(localStorage.getItem(storageKey('auto_print')) === '1')

    if (!('serial' in navigator)) {
      setSupported(false)
      setStatus('Tarayıcı Web Serial desteklemiyor')
      return
    }

    // Reconnect to a previously-authorized port
    ;(async () => {
      try {
        const ports = await navigator.serial!.getPorts()
        if (ports.length > 0) {
          await openPort(ports[0])
        }
      } catch {}
    })()

    return () => {
      // keep port open across navigation within same tab
    }
  }, [tenantId])

  async function openPort(p: SerialPort) {
    try {
      if (!p.writable) {
        await p.open({ baudRate: 9600 })
      }
      portRef.current = p
      setPort(p)
      setConnected(true)
      const info = p.getInfo()
      const vendor = info.usbVendorId ? info.usbVendorId.toString(16).padStart(4, '0') : '????'
      const product = info.usbProductId ? info.usbProductId.toString(16).padStart(4, '0') : '????'
      setStatus(`Bağlı (USB ${vendor}:${product})`)
      addLog('Yazıcı bağlandı')
    } catch (e: any) {
      setStatus('Bağlantı hatası: ' + (e?.message || 'bilinmiyor'))
      addLog('Bağlantı hatası')
    }
  }

  async function writeBytes(data: Uint8Array) {
    const p = portRef.current
    if (!p?.writable) throw new Error('Yazıcı bağlı değil')
    const writer = p.writable.getWriter()
    try {
      await writer.write(data)
    } finally {
      writer.releaseLock()
    }
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
    } finally {
      setBusy(false)
    }
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
    addLog('Yazıcı bağlantısı kapatıldı')
  }

  async function testPrint() {
    if (!portRef.current) return
    setBusy(true)
    try {
      await writeBytes(buildTestReceipt(shopRef.current.name))
      addLog('Test fişi gönderildi')
      setStatus('Test fişi basıldı')
    } catch (e: any) {
      setStatus('Yazdırma hatası: ' + (e?.message || 'bilinmiyor'))
      addLog('Yazdırma hatası')
    } finally {
      setBusy(false)
    }
  }

  // Save settings
  useEffect(() => {
    try {
      localStorage.setItem(storageKey('auto_print'), autoPrint ? '1' : '0')
      if (shopName) localStorage.setItem(storageKey('shop_name'), shopName)
      if (shopAddress) localStorage.setItem(storageKey('shop_address'), shopAddress)
    } catch {}
  }, [autoPrint, shopName, shopAddress])

  // Load recent orders on mount to set lastId
  useEffect(() => {
    if (!tenantId || !connected) return
    ;(async () => {
      try {
        const res = await fetch('/api/orders?tenantId=' + tenantId, { credentials: 'include' })
        if (res.ok) {
          const arr = await res.json()
          if (Array.isArray(arr) && arr.length > 0) {
            lastIdRef.current = arr[0].id || 0
          }
        }
      } catch {}
    })()
  }, [tenantId, connected])

  // SSE live order stream → auto print
  useEffect(() => {
    if (!tenantId || !autoPrint || !connected) return
    const es = new EventSource('/api/orders/events?tenantId=' + tenantId)
    es.addEventListener('new_order', async (ev) => {
      try {
        const order = JSON.parse((ev as MessageEvent).data)
        if (order.id && order.id <= lastIdRef.current) return
        lastIdRef.current = order.id || lastIdRef.current
        if (!autoPrintRef.current) return
        if (order.customerName === 'Test') return
        addLog('Yeni sipariş #' + order.id + ' → yazdırılıyor')
        await writeBytes(buildOrderReceipt(order, shopRef.current.name, shopRef.current.address))
        addLog('Fiş basıldı: #' + order.id)
      } catch (e: any) {
        addLog('Otomatik basım hatası')
      }
    })
    return () => es.close()
  }, [tenantId, autoPrint, connected])

  return (
    <div className="bg-[#0d1117]/80 backdrop-blur-xl border border-[#1a2332] rounded-2xl p-5 shadow-xl shadow-black/10">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
            <Printer size={20} className="text-white" />
          </div>
          <div>
            <h3 className="text-white font-semibold text-sm">Fiş Yazıcısı</h3>
            <p className="text-xs text-gray-500 mt-0.5 flex items-center gap-1.5">
              <span className={'w-1.5 h-1.5 rounded-full ' + (connected ? 'bg-emerald-400 animate-pulse' : 'bg-red-400')} />
              {status}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {connected ? (
            <>
              <button onClick={testPrint} disabled={busy} className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white text-sm font-semibold hover:shadow-lg hover:shadow-emerald-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50">
                {busy ? <Loader2 size={16} className="animate-spin" /> : <Play size={16} />} Test Fişi
              </button>
              <button onClick={disconnect} className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#080b12]/60 border border-[#1a2332] text-gray-400 hover:text-red-400 hover:border-red-500/30 transition-all text-sm font-semibold">
                <Unplug size={16} /> Bağlantıyı Kapat
              </button>
            </>
          ) : (
            <button onClick={connect} disabled={busy || !supported} className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 text-white text-sm font-semibold hover:shadow-lg hover:shadow-blue-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50">
              {busy ? <Loader2 size={16} className="animate-spin" /> : <PlugZap size={16} />} Yazıcı Bağla
            </button>
          )}
        </div>
      </div>

      {!supported && (
        <div className="mt-4 flex items-start gap-3 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20">
          <AlertTriangle size={18} className="text-amber-400 mt-0.5 flex-shrink-0" />
          <p className="text-xs text-amber-200/90 leading-relaxed">
            Bu tarayıcı <b>Web Serial</b> desteklemiyor. USB fiş yazıcısını bağlamak için Chrome veya Edge (masaüstü) kullanın. Ağ/kablosuz yazıcılar için bu ekran yerine kurulabilir uygulama gerekir.
          </p>
        </div>
      )}

      <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-3">
        <div>
          <label className="text-[10px] uppercase tracking-wider text-gray-500 font-semibold block mb-1.5">Fiş Başlığı (işletme adı)</label>
          <input value={shopName} onChange={e => setShopName(e.target.value)} placeholder="BRUSKAPP" className="w-full bg-[#080b12]/80 border border-[#1a2332] rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-blue-500/50" />
        </div>
        <div>
          <label className="text-[10px] uppercase tracking-wider text-gray-500 font-semibold block mb-1.5">Adres (opsiyonel)</label>
          <input value={shopAddress} onChange={e => setShopAddress(e.target.value)} placeholder="İşletme adresi" className="w-full bg-[#080b12]/80 border border-[#1a2332] rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-blue-500/50" />
        </div>
        <div className="flex items-end">
          <label className="flex items-center gap-3 p-3 rounded-xl bg-[#080b12]/60 border border-[#1a2332] w-full cursor-pointer">
            <input type="checkbox" checked={autoPrint} onChange={e => setAutoPrint(e.target.checked)} className="w-4 h-4 accent-blue-500" />
            <div>
              <p className="text-sm text-white font-semibold">Otomatik Yazdır</p>
              <p className="text-[11px] text-gray-500">Yeni siparişlerde fişi otomatik bas</p>
            </div>
          </label>
        </div>
      </div>

      {logs.length > 0 && (
        <div className="mt-4 bg-[#080b12]/60 border border-[#1a2332] rounded-xl p-3 max-h-28 overflow-y-auto">
          {logs.map((l, i) => (
            <p key={i} className="text-[11px] font-mono text-gray-500 mb-0.5">› {l}</p>
          ))}
        </div>
      )}

      {autoPrint && connected && (
        <div className="mt-3 flex items-center gap-2 text-xs text-emerald-400">
          <CheckCircle2 size={14} />
          Otomatik basım aktif — bu sayfa açıkken yeni siparişler yazıcıdan düşer.
        </div>
      )}
    </div>
  )
}
