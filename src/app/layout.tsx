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
      <body>
        <Providers>
          <div className="flex flex-col min-h-screen">
            <NavBar />
            <main className="flex-1 pt-16 relative">
              {children}
            </main>
          </div>
        </Providers>
      </body>
    </html>
  );
}
