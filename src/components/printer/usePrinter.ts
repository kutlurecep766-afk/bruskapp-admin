'use client'
import { useState, useEffect, useRef, useCallback } from 'react'
import { buildTestReceipt, buildOrderReceipt } from './escpos'

const storageKey = (k: string) => 'brusk_print_' + k

export function orderToReceipt(order: any, storeInfo: { name: string; address: string; phone: string }): Uint8Array {
  return buildOrderReceipt(order, storeInfo.name || 'BRUSKAPP', storeInfo.address || '')
}

export interface PrinterState {
  supported: boolean
  connected: boolean
  autoPrint: boolean
  printTable: boolean
  printOnline: boolean
  printWaiter: boolean
  busy: boolean
  status: string
  logs: string[]
  connect: () => Promise<void>
  disconnect: () => Promise<void>
  testPrint: () => Promise<void>
  handleNewOrder: (order: any) => Promise<void>
  setAutoPrint: (v: boolean) => void
  setPrintTable: (v: boolean) => void
  setPrintOnline: (v: boolean) => void
  setPrintWaiter: (v: boolean) => void
}

export function usePrinter(tenantId: string, storeInfo: { name: string; address: string; phone: string }): PrinterState {
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
  const printTableRef = useRef(true)
  const printOnlineRef = useRef(true)
  const printWaiterRef = useRef(false)

  useEffect(() => { storeInfoRef.current = storeInfo || storeInfoRef.current }, [storeInfo])
  useEffect(() => { autoPrintRef.current = autoPrint }, [autoPrint])
  useEffect(() => { printTableRef.current = printTable }, [printTable])
  useEffect(() => { printOnlineRef.current = printOnline }, [printOnline])
  useEffect(() => { printWaiterRef.current = printWaiter }, [printWaiter])

  const addLog = useCallback((msg: string) => {
    setLogs(prev => [`${new Date().toLocaleTimeString('tr-TR')} - ${msg}`, ...prev].slice(0, 30))
  }, [])

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

  const connect = useCallback(async () => {
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
  }, [addLog])

  const disconnect = useCallback(async () => {
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
  }, [addLog])

  const testPrint = useCallback(async () => {
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
  }, [addLog])

  const handleNewOrder = useCallback(async (order: any) => {
    if (!order?.id || order.id <= lastIdRef.current) return
    lastIdRef.current = order.id
    if (order.customerName === 'Test') return
    if (!autoPrintRef.current) return
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
  }, [addLog])

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

  return {
    supported, connected, autoPrint, printTable, printOnline, printWaiter, busy, status, logs,
    connect, disconnect, testPrint, handleNewOrder,
    setAutoPrint, setPrintTable, setPrintOnline, setPrintWaiter,
  }
}