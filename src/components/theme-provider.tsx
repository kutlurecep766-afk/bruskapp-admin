'use client'
import { createContext, useContext, useEffect, useState } from 'react'

const ThemeContext = createContext<{ theme: 'dark' }>({ theme: 'dark' })

export const useTheme = () => useContext(ThemeContext)

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', 'dark')
    setMounted(true)
  }, [])

  if (!mounted) return <>{children}</>

  return (
    <ThemeContext.Provider value={{ theme: 'dark' }}>
      {children}
    </ThemeContext.Provider>
  )
}
