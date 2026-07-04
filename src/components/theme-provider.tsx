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
      <style>{`
        [data-theme="light"] {
          --bg-primary: #f3f4f6 !important;
          --bg-secondary: #ffffff !important;
          --bg-sidebar: #ffffff !important;
          --border-color: #e5e7eb !important;
          --text-primary: #1f2937 !important;
          --text-secondary: #6b7280 !important;
          --text-muted: #9ca3af !important;
        }
        [data-theme="light"] body {
          background: #f3f4f6 !important;
          color: #1f2937 !important;
        }
        [data-theme="light"] .text-white { color: #1f2937 !important }
        [data-theme="light"] .text-gray-400 { color: #6b7280 !important }
        [data-theme="light"] .text-gray-500 { color: #9ca3af !important }
        [data-theme="light"] .text-gray-300 { color: #4b5563 !important }
        [data-theme="light"] .text-gray-600 { color: #9ca3af !important }
        [data-theme="light"] .text-gray-700 { color: #374151 !important }
        [data-theme="light"] [class*="bg-[#080b12]"] { background: #f3f4f6 !important }
        [data-theme="light"] [class*="bg-[#0d1117]"] { background: #ffffff !important }
        [data-theme="light"] [class*="bg-[#0a0e14]"] { background: #ffffff !important }
        [data-theme="light"] [class*="border-[#1a2332]"] { border-color: #e5e7eb !important }
        [data-theme="light"] [class*="border-[#2a3a4a]"] { border-color: #d1d5db !important }
        [data-theme="light"] [class*="bg-[#1a2332]"] { background: #e5e7eb !important }
        [data-theme="light"] [class*="bg-[#1f2a3a]"] { background: #e5e7eb !important }
        [data-theme="light"] .placeholder-gray-600 { color: #d1d5db !important }
        [data-theme="light"] .placeholder-gray-500 { color: #d1d5db !important }
        [data-theme="light"] .hover\\:text-white:hover { color: #1f2937 !important }
        [data-theme="light"] .hover\\:bg-white\\/5:hover { background: rgba(0,0,0,0.03) !important }
        [data-theme="light"] [class*="bg-black/"] { background: rgba(0,0,0,0.05) !important }
        [data-theme="light"] [class*="backdrop-blur"] { background: rgba(255,255,255,0.9) !important }
        [data-theme="light"] .bg-white\\/5 { background: rgba(0,0,0,0.03) !important }
        [data-theme="light"] [class*="hover\\:bg-white\\/\\[0\\.02\\]"]:hover { background: rgba(0,0,0,0.02) !important }
        [data-theme="light"] [class*="bg-white/\\[0\\.02\\]"] { background: rgba(0,0,0,0.02) !important }
        [data-theme="light"] [class*="from-\\[#020408\\]"] { background: #f3f4f6 !important }
        [data-theme="light"] [class*="via-\\[#0a0e17\\]"] { background: #f3f4f6 !important }
        [data-theme="light"] [class*="to-\\[#020408\\]"] { background: #f3f4f6 !important }
        [data-theme="light"] select { color: #1f2937 !important; background: #ffffff !important }
        [data-theme="light"] input, [data-theme="light"] textarea {
          color: #1f2937 !important;
          background: #ffffff !important;
          border-color: #e5e7eb !important;
        }
        [data-theme="light"] .hover\\:text-gray-300:hover { color: #4b5563 !important }
        [data-theme="light"] .hover\\:text-white\\/70:hover { color: #374151 !important }
      `}</style>
        [data-theme="light"] .text-gray-400 { color: #6b7280 !important }
        [data-theme="light"] .text-gray-500 { color: #9ca3af !important }
        [data-theme="light"] .text-gray-300 { color: #4b5563 !important }
        [data-theme="light"] .text-gray-600 { color: #9ca3af !important }
        [data-theme="light"] [class*="bg-[#080b12]"] { background-color: #f3f4f6 !important }
        [data-theme="light"] [class*="bg-[#0d1117]"] { background-color: #ffffff !important }
        [data-theme="light"] [class*="border-[#1a2332]"] { border-color: #e5e7eb !important }
        [data-theme="light"] [class*="border-[#2a3a4a]"] { border-color: #d1d5db !important }
        [data-theme="light"] [class*="bg-[#1a2332]"] { background: #e5e7eb !important }
        [data-theme="light"] [class*="placeholder-gray"] { color: #d1d5db !important }
        [data-theme="light"] .placeholder-gray-600 { color: #d1d5db !important }
        [data-theme="light"] .placeholder-gray-500 { color: #d1d5db !important }
        [data-theme="light"] .hover\\:text-white:hover { color: #1f2937 !important }
        [data-theme="light"] .hover\\:bg-white\\/5:hover { background: rgba(0,0,0,0.03) !important }
        [data-theme="light"] .hover\\:bg-white\\/\\[0\\.02\\]:hover { background: rgba(0,0,0,0.02) !important }
        [data-theme="light"] [class*="bg-black/"] { background: rgba(0,0,0,0.05) !important }
        [data-theme="light"] [class*="backdrop-blur"] { background: rgba(255,255,255,0.85) !important }
        [data-theme="light"] .bg-white\\/5 { background: rgba(0,0,0,0.03) !important }
        [data-theme="light"] .bg-white\\/\\[0\\.02\\] { background: rgba(0,0,0,0.02) !important }
        [data-theme="light"] [class*="bg-\\[\\#1f2a3a\\]"] { background: #e5e7eb !important }
        [data-theme="light"] [class*="text-gray-500"] { color: #6b7280 !important }
      `}</style>
      {children}
    </ThemeContext.Provider>
  )
}
