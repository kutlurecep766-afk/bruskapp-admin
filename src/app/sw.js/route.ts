import { NextResponse } from 'next/server'

export const dynamic = 'force-static'

const sw = `self.addEventListener('install', () => self.skipWaiting())
self.addEventListener('activate', e => e.waitUntil(clients.claim()))

self.addEventListener('push', e => {
  if (!e.data) return
  try {
    const data = e.data.json()
    const title = data.title || 'Bruskapp'
    const body = data.body || ''
    e.waitUntil(
      self.registration.showNotification(title, {
        body,
        icon: data.icon || '/brk-mgmt/favicon.svg',
        badge: data.icon || '/brk-mgmt/favicon.svg',
        vibrate: [300, 150, 200, 150, 300],
        requireInteraction: true,
        silent: false,
        timestamp: Date.now(),
        data: { url: data.url || '/brk-mgmt/messages' },
      })
    )
  } catch {}
})

self.addEventListener('notificationclick', e => {
  e.notification.close()
  e.waitUntil(clients.matchAll({ type: 'window', includeUncontrolled: true }).then(clist => {
    if (clist.length > 0) { clist[0].focus(); return }
    clients.openWindow('/brk-mgmt/messages')
  }))
})`

export async function GET() {
  return new NextResponse(sw, {
    headers: {
      'Content-Type': 'application/javascript',
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Service-Worker-Allowed': '/brk-mgmt/',
    },
  })
}
