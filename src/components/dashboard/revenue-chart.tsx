'use client'
import { Card, CardHeader, CardContent } from '../ui/card'

export default function RevenueChart() {
  const months = ['Oca', 'Sub', 'Mar', 'Nis', 'May', 'Haz']
  const values = [40, 65, 45, 80, 55, 90]
  return (
    <Card>
      <CardHeader><div className="flex items-center justify-between"><h3 className="text-white font-semibold">Aylik Gelir</h3><span className="text-xs text-gray-500">Son 6 ay</span></div></CardHeader>
      <CardContent>
        <div className="flex items-end justify-between gap-2 h-40">
          {values.map((v, i) => {
            const amount = (v * 3.5).toFixed(1)
            return (
              <div key={i} className="flex-1 flex flex-col items-center gap-2">
                <span className="text-xs text-gray-500">{amount}K</span>
                <div className="w-full relative" style={{ height: v + '%' }}>
                  <div className="absolute bottom-0 w-full rounded-t-lg bg-gradient-to-t from-blue-600 to-blue-400 hover:from-blue-500 hover:to-blue-300 transition-all cursor-pointer" style={{ height: '100%' }} />
                </div>
                <span className="text-xs text-gray-500">{months[i]}</span>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}