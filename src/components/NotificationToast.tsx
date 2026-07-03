'use client'
import { useEffect, useState, useCallback, useRef } from 'react'

let toastId = 0
let globalAddToast: ((notification: any) => void) | null = null
let sseConnected = false
let businessSseConnected = false
let pushSubscribed = false

export function showToast(title: string, message: string, type = 'info') {
  if (globalAddToast) {
    globalAddToast({ title, message, type, _id: ++toastId })
  }
}

const COLORS: Record<string, { bg: string; border: string; dot: string }> = {
  whatsapp: { bg: 'from-green-500/20 to-green-600/10', border: 'border-green-500/30', dot: 'bg-green-400' },
  instagram: { bg: 'from-pink-500/20 to-purple-600/10', border: 'border-pink-500/30', dot: 'bg-pink-400' },
  telegram: { bg: 'from-blue-500/20 to-blue-600/10', border: 'border-blue-500/30', dot: 'bg-blue-400' },
  trendyol: { bg: 'from-orange-500/20 to-red-600/10', border: 'border-orange-500/30', dot: 'bg-orange-400' },
  hepsiburada: { bg: 'from-purple-500/20 to-violet-600/10', border: 'border-purple-500/30', dot: 'bg-purple-400' },
}

function playNotificationSound() {
  try {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)()
    const oscillator = ctx.createOscillator()
    const gain = ctx.createGain()
    oscillator.connect(gain)
    gain.connect(ctx.destination)
    oscillator.frequency.value = 880
    oscillator.type = 'sine'
    gain.gain.setValueAtTime(0.3, ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3)
    oscillator.start(ctx.currentTime)
    oscillator.stop(ctx.currentTime + 0.3)

    // Second beep slightly higher
    const osc2 = ctx.createOscillator()
    const gain2 = ctx.createGain()
    osc2.connect(gain2)
    gain2.connect(ctx.destination)
    osc2.frequency.value = 1100
    osc2.type = 'sine'
    gain2.gain.setValueAtTime(0.3, ctx.currentTime + 0.1)
    gain2.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4)
    osc2.start(ctx.currentTime + 0.1)
    osc2.stop(ctx.currentTime + 0.4)
  } catch {}
}

function b64ToUint8(s: string) {
  const pad = '='.repeat((4 - s.length % 4) % 4)
  const b64 = (s + pad).replace(/-/g, '+').replace(/_/g, '/')
  const raw = window.atob(b64)
  const arr = new Uint8Array(raw.length)
  for (let i = 0; i < raw.length; i++) arr[i] = raw.charCodeAt(i)
  return arr
}

function connectSSE(addToast: (n: any) => void) {
  if (sseConnected) return
  sseConnected = true
  try {
    const es = new EventSource('/api/notifications/events')
    es.onmessage = (e) => {
      try { addToast(JSON.parse(e.data)) } catch {}
    }
    es.onerror = () => {
      es.close()
      sseConnected = false
      setTimeout(() => connectSSE(addToast), 3000)
    }
  } catch {
    sseConnected = false
  }
}

function connectBusinessSSE(businessId: string, addToast: (n: any) => void) {
  if (businessSseConnected) return
  businessSseConnected = true
  try {
    const es = new EventSource('/api/notifications/stream/' + businessId)
    es.onmessage = (e) => {
      try {
        const data = JSON.parse(e.data)
        addToast(data)
        playNotificationSound()
      } catch {}
    }
    es.onerror = () => {
      es.close()
      businessSseConnected = false
      setTimeout(() => connectBusinessSSE(businessId, addToast), 3000)
    }
  } catch {
    businessSseConnected = false
  }
}

function subscribePush() {
  if (pushSubscribed) return
  pushSubscribed = true
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) return
  Notification.requestPermission().then(p => {
    if (p !== 'granted') return
    navigator.serviceWorker.ready.then(reg => {
      reg.pushManager.getSubscription().then(sub => {
        if (sub) return
        reg.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: b64ToUint8('BNA3QVVAzAcanJ6udZdQonyKFqc4mmhxzEbKhsD_4okPWOoEkqWDxIJfUGdg9jk03tYUuJwOla6N3IqzP_tQRyo')
        }).then(s => {
          fetch('/api/notifications/subscribe', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(s.toJSON()),
            credentials: 'include'
          }).catch(() => {})
        }).catch(() => {})
      })
    })
  }).catch(() => {})
}

export default function NotificationToast() {
  const [toasts, setToasts] = useState<any[]>([])

  const addToast = useCallback((n: any) => {
    const id = ++toastId
    setToasts(prev => [...prev, { ...n, _id: id }])
    setTimeout(() => setToasts(prev => prev.filter(t => t._id !== id)), 8000)
  }, [])

  globalAddToast = addToast

  useEffect(() => {
    connectSSE(addToast)
    connectBusinessSSE('default', addToast)
    subscribePush()
  }, [addToast])

  if (toasts.length === 0) return null

  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 max-w-sm">
      {toasts.map(t => {
        const c = COLORS[t.type] || { bg: 'from-blue-500/20 to-blue-600/10', border: 'border-blue-500/30', dot: 'bg-blue-400' }
        return (
          <div key={t._id}
            className={'animate-slide-in-right bg-gradient-to-br ' + c.bg + ' backdrop-blur-xl border ' + c.border + ' rounded-xl p-4 shadow-2xl cursor-pointer hover:scale-[1.02] transition-all duration-300'}
            onClick={() => setToasts(prev => prev.filter(x => x._id !== t._id))}>
            <div className="flex items-start gap-3">
              <div className={'w-2.5 h-2.5 rounded-full mt-1.5 flex-shrink-0 animate-pulse ' + c.dot} />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-white drop-shadow-md">{t.title}</p>
                <p className="text-xs text-gray-300 mt-0.5">{t.message}</p>
                {t.type === 'order' && t.amount && (
                  <p className="text-xs text-green-400 mt-1 font-medium">{t.amount} {t.currency || 'TRY'}</p>
                )}
              </div>
              <button className="text-gray-500 hover:text-white text-xs flex-shrink-0" onClick={e => { e.stopPropagation(); setToasts(prev => prev.filter(x => x._id !== t._id)) }}>✕</button>
            </div>
          </div>
        )
      })}
    </div>
  )
}
