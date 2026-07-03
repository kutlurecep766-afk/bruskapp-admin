'use client'
import { useState, useEffect, useCallback } from 'react'
import { CheckCircle, XCircle, Loader2 } from 'lucide-react'
import InstallmentSelect from './installment-select'

interface Props {
  onDone?: () => void
}

export default function PaytrPaymentForm({ onDone }: Props) {
  const [step, setStep] = useState<'form' | 'iframe' | 'done'>('form')
  const [amount, setAmount] = useState('')
  const [desc, setDesc] = useState('')
  const [token, setToken] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<{ status: string; oid: string } | null>(null)
  const [installments, setInstallments] = useState<Array<{ number: number; totalPrice: number; installmentPrice: number }>>([])
  const [selectedInstallment, setSelectedInstallment] = useState(1)
  const [instLoading, setInstLoading] = useState(false)

  useEffect(() => {
    setInstLoading(true)
    fetch('/api/payments/installment-settings', { credentials: 'include' })
      .then(r => r.json())
      .then(data => {
        const s = data.paytr
        if (s?.allowedInstallments) {
          setInstallments(s.allowedInstallments.map((n: number) => ({ number: n, totalPrice: 0, installmentPrice: 0 })))
        }
      })
      .catch(() => {})
      .finally(() => setInstLoading(false))
  }, [])

  const handler = useCallback((e: MessageEvent) => {
    if (e.data?.type === 'PAYTR_RESULT') {
      setResult({ status: e.data.status, oid: e.data.merchantOid })
      setStep('done')
    }
  }, [])

  useEffect(() => {
    if (step === 'iframe') { window.addEventListener('message', handler); return () => window.removeEventListener('message', handler) }
  }, [step, handler])

  const start = async () => {
    setLoading(true); setError(null)
    try {
      const res = await fetch('/api/payments/virtual-pos/paytr/init', {
        method: 'POST', credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: parseFloat(amount), description: desc, installment: selectedInstallment }),
      })
      const data = await res.json()
      if (res.ok) { setToken(data.token); setStep('iframe') }
      else setError(data.message || 'Ödeme başlatılamadı')
    } catch { setError('Bağlantı hatası') }
    setLoading(false)
  }

  const reset = () => { setStep('form'); setToken(''); setResult(null); setError(null); window.removeEventListener('message', handler) }

  if (step === 'iframe') return (
    <div>
      <iframe src={`https://www.paytr.com/odeme/guvenli/${token}`} className="w-full border-0 rounded-xl" style={{ height: 520 }} title="PayTR Ödeme" />
      <button onClick={reset} className="mt-3 px-4 py-2 bg-white/5 border border-[#1a2332] rounded-xl text-sm text-gray-400 hover:text-white transition-colors">İptal</button>
    </div>
  )

  if (step === 'done') return (
    <div className="text-center py-10">
      {result?.status === 'success' ? (
        <><CheckCircle size={48} className="mx-auto text-emerald-400 mb-3" /><h3 className="text-lg font-semibold text-white">Ödeme Başarılı</h3></>
      ) : (
        <><XCircle size={48} className="mx-auto text-red-400 mb-3" /><h3 className="text-lg font-semibold text-white">Ödeme Başarısız</h3></>
      )}
      <p className="text-xs text-gray-600 mt-2 font-mono">{result?.oid}</p>
      <div className="flex gap-3 justify-center mt-6">
        <button onClick={reset} className="px-4 py-2 bg-white/5 border border-[#1a2332] rounded-xl text-sm text-gray-400 hover:text-white">Yeni Ödeme</button>
        <button onClick={onDone} className="px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-xl text-sm">Kapat</button>
      </div>
    </div>
  )

  return (
    <div className="space-y-4">
      {error && <div className="px-4 py-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm">{error}</div>}
      <div><label className="block text-sm font-medium text-gray-400 mb-1">Tutar (TL)</label><input type="number" step="0.01" value={amount} onChange={e => setAmount(e.target.value)} className="w-full px-4 py-2.5 bg-[#080b12] border border-[#1a2332] rounded-xl text-white text-sm focus:outline-none focus:border-blue-500/50" placeholder="100.00" /></div>
      <div><label className="block text-sm font-medium text-gray-400 mb-1">Açıklama</label><input type="text" value={desc} onChange={e => setDesc(e.target.value)} className="w-full px-4 py-2.5 bg-[#080b12] border border-[#1a2332] rounded-xl text-white text-sm focus:outline-none focus:border-blue-500/50" placeholder="Sipariş ödemesi" /></div>
      <InstallmentSelect installments={installments} value={selectedInstallment} onChange={setSelectedInstallment} loading={instLoading} />
      <button onClick={start} disabled={loading || !amount} className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-xl text-sm font-medium hover:shadow-lg hover:shadow-blue-500/20 transition-all disabled:opacity-50">
        {loading ? <><Loader2 size={16} className="inline animate-spin mr-2" />Başlatılıyor...</> : 'Ödeme Başlat'}
      </button>
    </div>
  )
}
