interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> { variant?: "primary" | "ghost" | "outline"; size?: "sm" | "md" | "lg" }
export function Button({ variant = "primary", size = "md", className = "", children, ...props }: ButtonProps) {
  const base = "inline-flex items-center justify-center font-medium rounded-xl transition-all duration-200 disabled:opacity-50"
  const variants: Record<string, string> = {
    primary: "bg-gradient-to-r from-[#0066ff] to-[#0052cc] text-white hover:shadow-lg hover:shadow-blue-500/20",
    ghost: "text-gray-400 hover:text-white hover:bg-white/5",
    outline: "border border-[#1a2332] text-gray-300 hover:border-blue-500/50 hover:text-white"
  }
  const sizes: Record<string, string> = { sm: "px-3 py-1.5 text-sm", md: "px-4 py-2 text-sm", lg: "px-6 py-3 text-base" }
  return <button className={base + " " + variants[variant] + " " + sizes[size] + " " + className} {...props}>{children}</button>
}