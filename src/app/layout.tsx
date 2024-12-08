import '@/styles/base/globals.css';
import '@/styles/base/typography.css';
import '@/styles/components/layout/AppShell.css';
import '@/styles/components/layout/NavigationBar.css';
import { Providers } from '@/app/providers';
import { Metadata, Viewport } from 'next';
import { montserrat, inter } from './fonts';
import { authOptions } from '@/lib/auth';
import { getServerSession } from 'next-auth';
import { SessionProvider } from 'next-auth/react';

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
        url: '/favicon-16x16.png',
        sizes: '16x16',
        type: 'image/png',
      },
      {
        url: '/favicon-32x32.png',
        sizes: '32x32',
        type: 'image/png',
      },
      {
        url: '/icon-192.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        url: '/icon-512.png',
        sizes: '512x512',
        type: 'image/png',
      },
    ],
    apple: [
      {
        url: '/apple-touch-icon.png',
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
    <html lang="en" className={`${montserrat.variable} ${inter.variable}`}>
      <body className="antialiased bg-background-primary text-text-primary">
        <Providers session={session}>
          {children}
        </Providers>
      </body>
    </html>
  );
}