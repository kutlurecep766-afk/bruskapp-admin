import { Card, CardHeader, CardContent } from '../ui/card'

const metrics = [
  { label: 'Yanit Suresi', value: '1.2s', color: 'emerald', progress: 85 },
  { label: 'Dogruluk', value: '%94.7', color: 'blue', progress: 95 },
  { label: 'Musteri Memnuniyeti', value: '4.8/5', color: 'violet', progress: 96 },
  { label: 'Cozum Orani', value: '%88.3', color: 'amber', progress: 88 },
]

function gradClass(c: string) {
  if (c === 'emerald') return 'from-emerald-500 to-emerald-400'
  if (c === 'blue') return 'from-blue-500 to-blue-400'
  if (c === 'violet') return 'from-violet-500 to-violet-400'
  return 'from-amber-500 to-amber-400'
}

export default function AiPerformance() {
  return (
    <Card>
      <CardHeader><h3 className="text-white font-semibold">AI Performans Istatistikleri</h3></CardHeader>
      <CardContent className="space-y-4">
        {metrics.map((m) => (
          <div key={m.label}>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-sm text-gray-400">{m.label}</span>
              <span className="text-sm font-semibold text-white">{m.value}</span>
            </div>
            <div className="h-2 bg-[#1a2332] rounded-full overflow-hidden">
              <div className={'h-full rounded-full bg-gradient-to-r ' + gradClass(m.color) + ' transition-all duration-1000'} style={{ width: m.progress + '%' }} />
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}