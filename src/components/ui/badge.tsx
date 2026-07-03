interface BadgeProps { variant?: "success" | "warning" | "danger" | "info"; children: React.ReactNode; className?: string }
export function Badge({ variant = "info", children, className = "" }: BadgeProps) {
  const styles: Record<string, string> = {
    success: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    warning: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    danger: "bg-red-500/10 text-red-400 border-red-500/20",
    info: "bg-blue-500/10 text-blue-400 border-blue-500/20"
  }
  return <span className={"inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border " + styles[variant] + " " + className}>{children}</span>
}