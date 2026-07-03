interface CardProps { children: React.ReactNode; className?: string }
export function Card({ children, className = '' }: CardProps) {
  return <div className={"bg-[#0d1117]/80 backdrop-blur-xl border border-[#1a2332] rounded-2xl shadow-lg " + className}>{children}</div>
}
export function CardHeader({ children, className = '' }: CardProps) {
  return <div className={"px-6 py-5 border-b border-[#1a2332] " + className}>{children}</div>
}
export function CardContent({ children, className = '' }: CardProps) {
  return <div className={"px-6 py-5 " + className}>{children}</div>
}