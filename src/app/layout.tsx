import '@/styles/main.css';
import { Providers } from '@/app/providers';
import { Metadata, Viewport } from 'next';
import { montserrat, inter } from './fonts';
import { authOptions } from '@/lib/auth';
import { getServerSession } from 'next-auth';
import { SessionProvider } from 'next-auth/react';
import { headers } from 'next/headers';
import { ThemeProvider } from 'next-themes'

export const viewport: Viewport = {
  themeColor: '#0F172A',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
}

export const metadata: Metadata = {
  title: 'Routopia - AI-Powered Route Planning',
  description: 'Plan your next adventure with AI-powered inspiration. Discover optimal routes tailored to your preferences.',
  icons: {
    icon: [
      {
        url: '/icons/favicon-16x16.png',
        sizes: '16x16',
        type: 'image/png',
      },
      {
        url: '/icons/favicon-32x32.png',
        sizes: '32x32',
        type: 'image/png',
      },
      {
        url: '/icons/icon-144x144.png',
        sizes: '144x144',
        type: 'image/png',
      },
      {
        url: '/icons/icon-192.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        url: '/icons/icon-512.png',
        sizes: '512x512',
        type: 'image/png',
      },
    ],
    apple: [
      {
        url: '/icons/apple-touch-icon.png',
        sizes: '180x180',
        type: 'image/png',
      },
    ],
  },
  manifest: '/manifest.json',
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  return (
    <html lang="en" className={`${montserrat.variable} ${inter.variable}`} suppressHydrationWarning>
      <head>
        <link 
          rel="preload" 
          href="/_next/static/css/app/layout.css" 
          as="style"
          crossOrigin="anonymous"
        />
      </head>
      <body className="antialiased bg-background-primary text-text-primary">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem={true}
          disableTransitionOnChange
        >
          <Providers session={session}>
            {children}
          </Providers>
        </ThemeProvider>
      </body>
    </html>
  );
}