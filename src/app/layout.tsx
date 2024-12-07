import '@/app/globals.css';
import { AuthProvider } from '@/components/AuthProvider';
import AppShell from '@/components/layout/AppShell';
import { Metadata } from 'next';
import { montserrat, inter } from './fonts';

export const metadata: Metadata = {
  title: 'Routopia - AI-Powered Route Planning',
  description: 'Discover your perfect route with AI-powered planning that adapts to your preferences, weather conditions, and points of interest.',
  icons: {
    icon: '/favicon.ico',
    apple: '/apple-touch-icon.png',
  },
  manifest: '/site.webmanifest',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${montserrat.variable} ${inter.variable}`}>
      <body className="antialiased">
        <AuthProvider>
          <AppShell>{children}</AppShell>
        </AuthProvider>
      </body>
    </html>
  );
}
