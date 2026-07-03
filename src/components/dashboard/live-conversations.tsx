import { Card, CardHeader, CardContent } from '../ui/card'
import { Badge } from '../ui/badge'

const conversations = [
  { agent: 'Chatbot - Müşteri Hizmetleri', active: 42, status: 'success' as const },
  { agent: 'Sesli Asistan - Sipariş', active: 28, status: 'warning' as const },
  { agent: 'Chatbot - Destek', active: 15, status: 'info' as const },
  { agent: 'Sesli Asistan - Rezervasyon', active: 8, status: 'success' as const },
]

export default function LiveConversations() {
  return (
    <Card>
      <CardHeader><h3 className="text-white font-semibold">Canlı Konuşmalar</h3></CardHeader>
      <CardContent className="space-y-3">
        {conversations.map((c, i) => (
          <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02] border border-[#1a2332]">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-sm text-gray-300">{c.agent}</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm font-semibold text-white">{c.active}</span>
              <Badge variant={c.status}>Aktif</Badge>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}