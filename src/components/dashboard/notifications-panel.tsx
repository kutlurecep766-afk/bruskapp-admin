import { Card, CardHeader, CardContent } from '../ui/card'

const notifications = [
  { text: 'Yeni musteri kaydi: +3', time: '5 dk', type: 'info' },
  { text: 'AI asistan guncellendi', time: '1 sa', type: 'success' },
  { text: 'Sistem bakimi 23:00', time: '3 sa', type: 'warning' },
  { text: 'Odeme hatasi raporlandi', time: '5 sa', type: 'error' },
]

function dotBg(t: string) {
  if (t === 'info') return 'bg-blue-400'
  if (t === 'success') return 'bg-emerald-400'
  if (t === 'warning') return 'bg-amber-400'
  return 'bg-red-400'
}

export default function NotificationsPanel() {
  return (
    <Card>
      <CardHeader><h3 className="text-white font-semibold">Bildirim Paneli</h3></CardHeader>
      <CardContent className="space-y-2">
        {notifications.map((n, i) => (
          <div key={i} className="flex items-start gap-3 p-3 rounded-xl hover:bg-white/[0.02] transition-colors cursor-pointer">
            <div className={'w-2 h-2 mt-2 rounded-full flex-shrink-0 ' + dotBg(n.type)} />
            <div className="flex-1 min-w-0">
              <p className="text-sm text-gray-300">{n.text}</p>
              <p className="text-xs text-gray-600 mt-0.5">{n.time} once</p>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}