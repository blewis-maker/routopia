import { NextResponse } from 'next/server'
import { getToken } from 'next-auth/jwt'
import type { NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET })
  const isAuthenticated = !!token
  
  const protectedPaths = [
    '/routopia',
    '/routes',
    '/profile',
    '/settings',
    '/api/chat',
    '/api/routes',
  ]

  const isProtectedPath = protectedPaths.some(path => 
    req.nextUrl.pathname.startsWith(path)
  )

  if (isProtectedPath && !isAuthenticated) {
    return NextResponse.redirect(new URL('/', req.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/routopia/:path*',
    '/routes/:path*',
    '/profile/:path*',
    '/settings/:path*',
    '/api/chat/:path*',
    '/api/routes/:path*',
  ],
}
