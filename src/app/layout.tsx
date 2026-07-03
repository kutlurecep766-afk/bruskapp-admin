import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "bruskapp - Admin Panel",
  description: "AI otomasyon platformu yonetim paneli",
  icons: {
    icon: "/favicon.svg",
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="tr">
      <head>
        <link rel="manifest" href="/brk-mgmt/manifest.json" />
      </head>
      <body className={inter.className}>{children}</body>
    </html>
  )
}