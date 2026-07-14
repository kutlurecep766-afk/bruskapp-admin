'use client'
import { useState, useEffect } from 'react'
import { X, Megaphone } from 'lucide-react'

export default function AnnouncementBanner() {
  const [announcements, setAnnouncements] = useState<any[]>([])
  const [dismissed, setDismissed] = useState<Set<string>>(new Set())

  useEffect(() => {
    fetch('/api/notifications/announcements', { credentials: 'include' })
      .then(r => r.json())
      .then(data => {
        if (Array.isArray(data)) setAnnouncements(data)
      })
      .catch(() => {})
  }, [])

  const dismiss = (id: string) => {
    setDismissed(prev => new Set(prev).add(id))
  }

  const visible = announcements.filter(a => !dismissed.has(a.id))
  if (visible.length === 0) return null

  return (
    <div className="space-y-2 mb-4">
      {visible.map(a => (
        <div key={a.id} className="flex items-start gap-3 px-4 py-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300">
          <Megaphone className="w-4 h-4 mt-0.5 flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium">{a.title}</p>
            {a.message && <p className="text-xs text-amber-400/70 mt-0.5">{a.message}</p>}
          </div>
          <button onClick={() => dismiss(a.id)} className="text-amber-400/50 hover:text-amber-300 flex-shrink-0">
            <X className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  )
}
