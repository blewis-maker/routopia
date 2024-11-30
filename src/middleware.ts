import { withAuth } from "next-auth/middleware"

export default withAuth({
  callbacks: {
    authorized: ({ token }) => !!token
  },
})

export const config = {
  matcher: [
    "/routes/:path*",
    "/profile/:path*",
    "/api/chat/:path*",
    "/api/routes/:path*",
  ],
}
