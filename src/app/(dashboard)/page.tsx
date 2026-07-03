import StatsCards from '@/components/dashboard/stats-cards'
import RevenueChart from '@/components/dashboard/revenue-chart'
import RecentOrders from '@/components/dashboard/recent-orders'
import AiPerformance from '@/components/dashboard/ai-performance'
import LiveConversations from '@/components/dashboard/live-conversations'
import NotificationsPanel from '@/components/dashboard/notifications-panel'

export default function DashboardPage() {
  const callData = [
    { day: 'Pazartesi', calls: 234 },
    { day: 'Sali', calls: 312 },
    { day: 'Carsamba', calls: 198 },
    { day: 'Persembe', calls: 267 },
    { day: 'Cuma', calls: 423 },
  ]
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Dashboard</h1>
        <p className="text-sm text-gray-500 mt-1">bruskapp AI platformuna hosgeldiniz</p>
      </div>
      <StatsCards />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RevenueChart />
        <AiPerformance />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2"><RecentOrders /></div>
        <NotificationsPanel />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <LiveConversations />
        <div className="bg-[#0d1117]/80 backdrop-blur-xl border border-[#1a2332] rounded-2xl p-6">
          <h3 className="text-white font-semibold mb-4">Sesli Arama Aktiviteleri</h3>
          <div className="space-y-3">
            {callData.map((d) => (
              <div key={d.day} className="flex items-center gap-4">
                <span className="text-sm text-gray-400 w-20">{d.day}</span>
                <div className="flex-1 h-2 bg-[#1a2332] rounded-full overflow-hidden">
                  <div className="h-full rounded-full bg-gradient-to-r from-violet-600 to-violet-400" style={{ width: (d.calls / 500 * 100) + '%' }} />
                </div>
                <span className="text-sm text-white font-medium w-12 text-right">{d.calls}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}