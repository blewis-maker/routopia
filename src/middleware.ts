import { auth } from '@/lib/auth'

export default auth((req) => {
  const isAuthenticated = !!req.auth
  
  // Add your protected routes
  const protectedPaths = [
    '/routes',
    '/profile',
    '/dashboard',
    '/api/chat',
    '/api/routes',
  ]

  // Check if the current path starts with any protected path
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
    "/routes/:path*",
    "/profile/:path*",
    "/dashboard/:path*",
    "/api/chat/:path*",
    "/api/routes/:path*",
  ],
}
