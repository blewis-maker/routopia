'use client'

import { SessionProvider } from "next-auth/react"
import { ThemeProvider } from "@/styles/theme/themeProvider"
import { AIChatProvider } from "@/context/ai/AIChatContext"
import { AuthProvider } from "@/context/auth/AuthContext"
import { Session } from 'next-auth'

export function Providers({ 
  children,
  session
}: { 
  children: React.ReactNode
  session: Session | null
}) {
  return (
    <SessionProvider session={session}>
      <AuthProvider>
        <ThemeProvider>
          <AIChatProvider>
            {children}
          </AIChatProvider>
        </ThemeProvider>
      </AuthProvider>
    </SessionProvider>
  )
}
