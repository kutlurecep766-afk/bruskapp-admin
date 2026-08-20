'use client'
import { useState, useEffect, useCallback } from 'react'
import { CheckCircle, XCircle, Loader2 } from 'lucide-react'
import InstallmentSelect from './installment-select'

interface Props {
  onDone?: () => void
}

const labelCls = "text-[10px] text-gray-500 font-semibold uppercase tracking-wider"
const inputCls = "w-full bg-blue-50/40 border border-blue-100 rounded-xl px-3 py-2 text-gray-900 text-sm focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100 placeholder-gray-400 transition-all"

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
      <button onClick={reset} className="mt-3 px-4 py-2 bg-white border border-blue-200 rounded-xl text-sm text-gray-500 hover:text-blue-600 hover:border-blue-300 transition-all">İptal</button>
    </div>
  )

  if (step === 'done') return (
    <div className="text-center py-10">
      {result?.status === 'success' ? (
        <><CheckCircle size={48} className="mx-auto text-emerald-500 mb-3" /><h3 className="text-lg font-semibold text-gray-900">Ödeme Başarılı</h3></>
      ) : (
        <><XCircle size={48} className="mx-auto text-red-500 mb-3" /><h3 className="text-lg font-semibold text-gray-900">Ödeme Başarısız</h3></>
      )}
      <p className="text-xs text-gray-400 mt-2 font-mono">{result?.oid}</p>
      <div className="flex gap-3 justify-center mt-6">
        <button onClick={reset} className="px-4 py-2 bg-white border border-blue-200 rounded-xl text-sm text-gray-500 hover:text-blue-600 transition-all">Yeni Ödeme</button>
        <button onClick={onDone} className="px-4 py-2 rounded-full bg-gradient-to-r from-blue-600 to-blue-700 text-white text-sm font-bold shadow-md shadow-blue-600/30 hover:from-blue-700 hover:to-blue-800 transition-all">Kapat</button>
      </div>
    </div>
  )

  return (
    <div className="space-y-4">
      {error && <div className="px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">{error}</div>}
      <div className="flex flex-col gap-1">
        <label className={labelCls}>Tutar (TL)</label>
        <input type="number" step="0.01" value={amount} onChange={e => setAmount(e.target.value)} className={inputCls} placeholder="100.00" />
      </div>
      <div className="flex flex-col gap-1">
        <label className={labelCls}>Açıklama</label>
        <input type="text" value={desc} onChange={e => setDesc(e.target.value)} className={inputCls} placeholder="Sipariş ödemesi" />
      </div>
      <InstallmentSelect installments={installments} value={selectedInstallment} onChange={setSelectedInstallment} loading={instLoading} />
      <button onClick={start} disabled={loading || !amount} className="px-6 py-2.5 rounded-full bg-gradient-to-r from-blue-600 to-blue-700 text-white text-sm font-bold shadow-md shadow-blue-600/30 hover:from-blue-700 hover:to-blue-800 hover:scale-105 active:scale-95 transition-all disabled:opacity-50">
        {loading ? <><Loader2 size={16} className="inline animate-spin mr-2" />Başlatılıyor...</> : 'Ödeme Başlat'}
      </button>
    </div>
  )
}