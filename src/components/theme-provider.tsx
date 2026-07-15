'use client'
import { createContext, useContext, useEffect, useState } from 'react'

type Theme = 'dark' | 'light'

const ThemeContext = createContext<{ theme: Theme; toggle: () => void }>({ theme: 'dark', toggle: () => {} })

export const useTheme = () => useContext(ThemeContext)

function getTransitionCSS() {
  const css = document.createElement('style')
  css.textContent = `
@keyframes theme-rise {
  from { clip-path: inset(100% 0 0 0); }
  to { clip-path: inset(0 0 0 0); }
}
.theme-transition {
  animation: theme-rise 0.5s ease-out;
}
* { transition: background-color 0.3s ease, border-color 0.3s ease, color 0.2s ease; }
`
  return css
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>('dark')
  const [mounted, setMounted] = useState(false)
  const [animating, setAnimating] = useState(false)

  useEffect(() => {
    const stored = localStorage.getItem('bruskapp-theme') as Theme | null
    if (stored) setTheme(stored)
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted) return
    document.documentElement.setAttribute('data-theme', theme)
    localStorage.setItem('bruskapp-theme', theme)
  }, [theme, mounted])

  const toggle = () => {
    setAnimating(true)
    document.body.classList.add('theme-transition')
    setTimeout(() => {
      setTheme(t => t === 'dark' ? 'light' : 'dark')
      setTimeout(() => {
        document.body.classList.remove('theme-transition')
        setAnimating(false)
      }, 500)
    }, 50)
  }

  if (!mounted) return <>{children}</>

  return (
    <ThemeContext.Provider value={{ theme, toggle }}>
      <style dangerouslySetInnerHTML={{ __html: `
[data-theme="light"] body { background: #f3f4f6 !important; color: #1f2937 !important }
[data-theme="light"] .text-white { color: #1f2937 !important }
[data-theme="light"] .text-white\\/60, [data-theme="light"] .text-white\\/40, [data-theme="light"] .text-white\\/35, [data-theme="light"] .text-white\\/30, [data-theme="light"] .text-white\\/25, [data-theme="light"] .text-white\\/20, [data-theme="light"] .text-white\\/15, [data-theme="light"] .text-white\\/10 { color: #6b7280 !important }
[data-theme="light"] .text-gray-100 { color: #374151 !important }
[data-theme="light"] .text-gray-200 { color: #4b5563 !important }
[data-theme="light"] .text-gray-300 { color: #4b5563 !important }
[data-theme="light"] .text-gray-400 { color: #6b7280 !important }
[data-theme="light"] .text-gray-500 { color: #9ca3af !important }
[data-theme="light"] .text-gray-600 { color: #9ca3af !important }
[data-theme="light"] [class*="bg-[#080b12]"] { background: #f3f4f6 !important }
[data-theme="light"] [class*="bg-[#0d1117]"] { background: #ffffff !important }
[data-theme="light"] [class*="bg-[#0a0e14]"] { background: #ffffff !important }
[data-theme="light"] [class*="border-"] { border-color: #e5e7eb !important }
[data-theme="light"] [class*="bg-[#1a2332]"], [data-theme="light"] [class*="bg-[#1g2a3a]"] { background: #e5e7eb !important }
[data-theme="light"] [class*="bg-[#2a3a4a]"] { background: #d1d5db !important }
[data-theme="light"] [class*="border-white/"], [data-theme="light"] [class*="bg-white/"] { border-color: #e5e7eb !important; background: transparent !important }
[data-theme="light"] [class*="shadow-lg"] { box-shadow: none !important }
[data-theme="light"] .hover\\:text-white:hover { color: #1f2937 !important }
[data-theme="light"] .hover\\:bg-white\\/5:hover { background: rgba(0,0,0,0.05) !important }
[data-theme="light"] input, [data-theme="light"] textarea, [data-theme="light"] select { color: #1f2937 !important; background: #fff !important; border-color: #e5e7eb !important }
[data-theme="light"] input::placeholder { color: #9ca3af !important }
[data-theme="light"] .text-gradient { background: linear-gradient(135deg, #2563eb, #1d4ed8) !important; -webkit-background-clip: text !important; -webkit-text-fill-color: transparent !important }
` }} />
      {animating && <style>{`body { animation: theme-rise 0.5s ease-out; }`}</style>}
      {children}
    </ThemeContext.Provider>
  )
}
