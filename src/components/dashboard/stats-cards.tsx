import { Card, CardContent } from '../ui/card'

const stats = [
  { label: 'Toplam Musteri', value: '2,847', change: '+12.5%', icon: '\u25C8', color: 'blue' },
  { label: 'Aktif AI Asistan', value: '1,423', change: '+8.2%', icon: '\u2726', color: 'emerald' },
  { label: 'Aylik Gelir', value: '284.7K', change: '+23.1%', icon: '\u229C', color: 'violet' },
  { label: 'Canli Konusma', value: '156', change: '+5.7%', icon: '\u2662', color: 'amber' },
]

function bgClass(c: string) {
  if (c === 'blue') return 'bg-blue-500/10'
  if (c === 'emerald') return 'bg-emerald-500/10'
  if (c === 'violet') return 'bg-violet-500/10'
  return 'bg-amber-500/10'
}

function textClass(c: string) {
  if (c === 'blue') return 'text-blue-400'
  if (c === 'emerald') return 'text-emerald-400'
  if (c === 'violet') return 'text-violet-400'
  return 'text-amber-400'
}

export default function StatsCards() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((s) => (
        <Card key={s.label}>
          <CardContent className="p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">{s.label}</p>
                <p className="text-2xl font-bold text-white mt-1">{s.value}</p>
              </div>
              <div className={'w-10 h-10 rounded-xl ' + bgClass(s.color) + ' flex items-center justify-center text-lg ' + textClass(s.color)}>{s.icon}</div>
            </div>
            <div className="flex items-center gap-1 mt-3">
              <span className="text-xs text-emerald-400 font-medium">{s.change}</span>
              <span className="text-xs text-gray-500">gecen aya gore</span>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}