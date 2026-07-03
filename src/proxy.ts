import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const PUBLIC_ROUTES = ['/login', '/register']
const STATIC_PATTERNS = ['/_next/', '/favicon', '/logo.svg', '/images/', '/api/auth/login', '/api/auth/status', '/api/auth/setup', '/api/auth/register', '/api/auth/refresh', '/api/auth/2fa/']

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  if (STATIC_PATTERNS.some(p => pathname.startsWith(p))) return NextResponse.next()
  if (PUBLIC_ROUTES.some(r => pathname === r || pathname === r + '/')) return NextResponse.next()

  const token = request.cookies.get('access_token')?.value
  if (!token) return NextResponse.redirect(new URL('/brk-mgmt/login', request.url))
  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
