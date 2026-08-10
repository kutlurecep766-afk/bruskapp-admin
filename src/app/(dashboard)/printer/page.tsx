'use client'
import { useState, useEffect } from 'react'
import { Printer, Loader2, Info } from 'lucide-react'
import PrinterManager from '@/components/printer/PrinterManager'

export default function PrinterPage() {
  const [tenantId, setTenantId] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/tenants/me', { credentials: 'include' })
      .then(r => r.json())
      .then(t => {
        const tid = t?.tenant?.id || t?.id
        if (tid) setTenantId(tid)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="flex items-center justify-center h-64"><Loader2 size={28} className="text-blue-400 animate-spin" /></div>

  return (
    <div className="space-y-6 pb-12">
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#0f1420] via-[#0d1117] to-[#0a0e14] border border-[#1a2332] p-6 lg:p-8">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-500/5 rounded-full blur-3xl" />
        <div className="relative flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
              <Printer className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">Yazıcı</h1>
              <p className="text-sm text-gray-500 mt-0.5">Fiş yazıcısını bağlayın, test edin, otomatik basımı açın</p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-start gap-3 p-4 rounded-2xl bg-blue-500/5 border border-blue-500/10">
        <Info size={16} className="text-blue-400 mt-0.5 flex-shrink-0" />
        <p className="text-xs text-gray-400 leading-relaxed">
          USB fiş yazıcınızı Chrome veya Edge (masaüstü) üzerinden bağlayın. Yazıcı seçildikten sonra <b className="text-gray-200">Test Fişi</b> ile deneyin, ardından <b className="text-gray-200">Otomatik Yazdır</b>'ı açın — yeni siparişler bu sayfa açıkken fişe düşer. Ağ/kablosuz yazıcılar için kurulabilir uygulama gerekir.
        </p>
      </div>

      <PrinterManager tenantId={tenantId} />
    </div>
  )
}
