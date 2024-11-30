import { auth } from '@/lib/auth'

export default auth((req) => {
  const isAuthenticated = !!req.auth
  
  // Redirect authenticated users from home to routopia
  if (req.nextUrl.pathname === '/') {
    if (isAuthenticated) {
      return Response.redirect(new URL('/routopia', req.url))
    }
  }
  
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
    return Response.redirect(new URL('/?signin=true', req.url))
  }

  return null
})

export const config = {
  matcher: [
    '/',
    '/dashboard/:path*',
    '/routopia/:path*',
    '/routes/:path*',
    '/profile/:path*',
    '/settings/:path*',
    '/api/chat/:path*',
    '/api/routes/:path*',
  ],
}
