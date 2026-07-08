self.addEventListener('install', () => self.skipWaiting())
self.addEventListener('activate', e => e.waitUntil(clients.claim()))

self.addEventListener('push', e => {
  if (!e.data) return
  try {
    const data = e.data.json()
    e.waitUntil(
      self.registration.showNotification(data.title || 'Bruskapp', {
        body: data.body || '',
        icon: data.icon || '/favicon.svg',
        badge: '/favicon.svg',
        vibrate: [200, 100, 200],
        requireInteraction: true,
        silent: false,
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
})
