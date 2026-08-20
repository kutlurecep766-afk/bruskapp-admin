'use client'
interface Installment {
  number: number
  totalPrice: number
  installmentPrice: number
}
interface Props {
  installments: Installment[]
  value: number
  onChange: (v: number) => void
  loading?: boolean
  label?: string
}
export default function InstallmentSelect({ installments, value, onChange, loading, label }: Props) {
  if (loading) return <div className="text-sm text-gray-500">Taksit seçenekleri yükleniyor...</div>
  if (!installments || installments.length === 0) return null
  return (
    <div>
      <label className="block text-[10px] text-gray-500 font-semibold uppercase tracking-wider mb-1">{label || 'Taksit Seçeneği'}</label>
      <select value={value} onChange={e => onChange(parseInt(e.target.value))}
        className="w-full bg-blue-50/40 border border-blue-100 rounded-xl px-3 py-2 text-gray-900 text-sm focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100 transition-all">
        {installments.map(inst => (
          <option key={inst.number} value={inst.number}>
            {inst.number === 1 ? 'Peşin' : `${inst.number} Taksit`}
            {inst.totalPrice > 0 && inst.installmentPrice > 0 ? ` (${inst.installmentPrice.toFixed(2)} TL x ${inst.number})` : ''}
          </option>
        ))}
      </select>
    </div>
  )
}