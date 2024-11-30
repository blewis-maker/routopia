import { AuthProvider } from '@/components/AuthProvider';
import { Providers } from './providers';
import NavBar from '@/components/NavBar';
import { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Routopia - AI Route Planning Companion',
  description: 'Plan your next adventure with AI-powered inspiration.',
  icons: {
    icon: [
      {
        url: '/favicon.ico',
        sizes: 'any',
      },
      {
        url: '/icon.svg',
        type: 'image/svg+xml',
      }
    ],
    apple: '/apple-touch-icon.png',
  },
  manifest: '/site.webmanifest'
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" type="image/svg+xml" href="/icon.svg" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        <link rel="manifest" href="/site.webmanifest" />
      </head>
      <body className="bg-stone-900">
        <Providers>
          <AuthProvider>
            <NavBar />
            <main>{children}</main>
          </AuthProvider>
        </Providers>
      </body>
    </html>
  );
}
