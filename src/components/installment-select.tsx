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
      <label className="block text-sm font-medium text-gray-400 mb-1">{label || 'Taksit Seçeneği'}</label>
      <select value={value} onChange={e => onChange(parseInt(e.target.value))}
        className="w-full px-4 py-2.5 bg-[#080b12] border border-[#1a2332] rounded-xl text-white text-sm focus:outline-none focus:border-blue-500/50 transition-colors">
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
