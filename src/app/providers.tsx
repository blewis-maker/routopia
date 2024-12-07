'use client'

import { SessionProvider } from "next-auth/react"
import { ThemeProvider } from "@/styles/theme/themeProvider"
import { AIChatProvider } from "@/context/ai/AIChatContext"
import { AuthProvider } from "@/context/auth/AuthContext"

export function Providers({ 
  children,
}: { 
  children: React.ReactNode
}) {
  return (
    <SessionProvider>
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
