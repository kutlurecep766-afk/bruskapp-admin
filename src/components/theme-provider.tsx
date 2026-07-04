'use client'
import { createContext, useContext, useEffect, useState } from 'react'

type Theme = 'dark' | 'light'

const ThemeContext = createContext<{ theme: Theme; toggle: () => void }>({ theme: 'dark', toggle: () => {} })

export const useTheme = () => useContext(ThemeContext)

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>('dark')
  const [mounted, setMounted] = useState(false)

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

  const toggle = () => setTheme(t => t === 'dark' ? 'light' : 'dark')

  if (!mounted) return <>{children}</>

  return (
    <ThemeContext.Provider value={{ theme, toggle }}>
      <style dangerouslySetInnerHTML={{ __html: `
[data-theme="light"] body { background: #f3f4f6 !important; color: #1f2937 !important }
[data-theme="light"] .text-white { color: #1f2937 !important }
[data-theme="light"] .text-gray-300 { color: #4b5563 !important }
[data-theme="light"] .text-gray-400 { color: #6b7280 !important }
[data-theme="light"] .text-gray-500 { color: #9ca3af !important }
[data-theme="light"] .text-gray-600 { color: #9ca3af !important }
[data-theme="light"] [class*="bg-[#080b12]"] { background: #f3f4f6 !important }
[data-theme="light"] [class*="bg-[#0d1117]"] { background: #ffffff !important }
[data-theme="light"] [class*="bg-[#0a0e14]"] { background: #ffffff !important }
[data-theme="light"] [class*="border-"] { border-color: #e5e7eb !important }
[data-theme="light"] [class*="bg-[#1a2332]"] { background: #e5e7eb !important }
[data-theme="light"] [class*="bg-[#1f2a3a]"] { background: #e5e7eb !important }
[data-theme="light"] .hover\\:bg-white\\/5:hover { background: rgba(0,0,0,0.05) !important }
[data-theme="light"] .hover\\:text-white:hover { color: #1f2937 !important }
[data-theme="light"] input, [data-theme="light"] textarea, [data-theme="light"] select { color: #1f2937 !important; background: #fff !important; border-color: #e5e7eb !important }
` }} />
      {children}
    </ThemeContext.Provider>
  )
}