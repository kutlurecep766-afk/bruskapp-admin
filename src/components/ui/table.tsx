interface TableProps { children: React.ReactNode; className?: string }
export function Table({ children, className = "" }: TableProps) {
  return <div className={"overflow-x-auto " + className}><table className="w-full text-sm">{children}</table></div>
}
export function TableHead({ children, className = "" }: TableProps) {
  return <thead className={"border-b border-[#1a2332] " + className}>{children}</thead>
}
export function TableBody({ children, className = "" }: TableProps) {
  return <tbody className={"divide-y divide-[#1a2332] " + className}>{children}</tbody>
}
export function TableRow({ children, className = "" }: TableProps) {
  return <tr className={"hover:bg-white/[0.02] transition-colors " + className}>{children}</tr>
}
export function TableCell({ children, className = "" }: TableProps) {
  return <td className={"px-4 py-3 text-gray-300 " + className}>{children}</td>
}
export function TableHeaderCell({ children, className = "" }: TableProps) {
  return <th className={"px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider " + className}>{children}</th>
}