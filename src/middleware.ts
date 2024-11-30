import { auth } from '@/lib/auth'

export default auth((req) => {
  const isAuthenticated = !!req.auth
  
  const protectedPaths = [
    '/routopia',
    '/routes',
    '/profile',
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
    "/routopia/:path*",
    "/routes/:path*",
    "/profile/:path*",
    "/api/chat/:path*",
    "/api/routes/:path*",
  ],
}
