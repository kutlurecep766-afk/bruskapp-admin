interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> { icon?: React.ReactNode }
export function Input({ icon, className = "", ...props }: InputProps) {
  return (
    <div className="relative">
      {icon && <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">{icon}</div>}
      <input className={"w-full bg-[#0d1117] border border-[#1a2332] rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20 transition-all " + (icon ? "pl-10 " : "") + className} {...props} />
    </div>
  )
}