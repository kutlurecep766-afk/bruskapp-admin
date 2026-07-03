'use client'
import { useState, useCallback, useEffect } from 'react'
import { Loader2 } from 'lucide-react'

interface Props {
  tenantSlug: string
  amount: number
  description?: string
  buttonText?: string
  className?: string
}

export default function StorefrontPayButton({ tenantSlug, amount, description, buttonText = 'Satın Al', className = '' }: Props) {
  const [token, setToken] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<{ status: string } | null>(null)

  const handler = useCallback((e: MessageEvent) => {
    if (e.data?.type === 'PAYTR_RESULT') {
      setResult({ status: e.data.status })
    }
  }, [])

  useEffect(() => {
    if (token) { window.addEventListener('message', handler); return () => window.removeEventListener('message', handler) }
  }, [token, handler])

  const pay = async () => {
    setLoading(true); setError(null)
    try {
      const res = await fetch('/api/payments/storefront/paytr/init', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tenantSlug, amount, description }),
      })
      const data = await res.json()
      if (res.ok) setToken(data.token)
      else setError(data.message || 'Ödeme başlatılamadı')
    } catch { setError('Bağlantı hatası') }
    setLoading(false)
  }

  const reset = () => { setToken(null); setResult(null); setError(null) }

  if (result) return (
    <div className="text-center py-8">
      {result.status === 'success' ? (
        <><div className="w-12 h-12 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-3 text-emerald-400 text-2xl">✓</div><p className="text-green-600 font-medium">Ödeme Başarılı</p></>
      ) : (
        <><div className="w-12 h-12 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-3 text-red-400 text-2xl">✗</div><p className="text-red-600 font-medium">Ödeme Başarısız</p></>
      )}
      <button onClick={reset} className="mt-4 text-sm text-gray-500 hover:text-gray-700 underline">Tekrar Dene</button>
    </div>
  )

  if (token) return (
    <div className="w-full">
      <iframe src={`https://www.paytr.com/odeme/guvenli/${token}`} className="w-full border-0" style={{ height: 520 }} title="PayTR Ödeme" />
      <button onClick={reset} className="mt-2 text-sm text-gray-500 hover:text-gray-700 underline">İptal</button>
    </div>
  )

  return (
    <div>
      {error && <p className="text-red-500 text-sm mb-2">{error}</p>}
      <button onClick={pay} disabled={loading} className={className || 'w-full py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors disabled:opacity-50'}>
        {loading ? <><Loader2 size={16} className="inline animate-spin mr-2" />Yönlendiriliyor...</> : buttonText}
      </button>
    </div>
  )
}
