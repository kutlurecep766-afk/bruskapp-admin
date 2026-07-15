import { NextResponse } from 'next/server'

export const dynamic = 'force-static'

const manifest = {
  name: "Bruskapp",
  short_name: "Bruskapp",
  description: "Bruskapp yonetim paneli",
  start_url: "/brk-mgmt",
  display: "standalone",
  background_color: "#020408",
  theme_color: "#2563eb",
  orientation: "portrait-primary",
  icons: [
    {
      src: "/brk-mgmt/favicon.svg",
      sizes: "any",
      type: "image/svg+xml",
      purpose: "any maskable",
    },
  ],
  categories: ["business", "productivity"],
}

export async function GET() {
  return NextResponse.json(manifest, {
    headers: {
      'Cache-Control': 'no-cache, no-store, must-revalidate',
    },
  })
}
