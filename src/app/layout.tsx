import '@/styles/globals.css';
import '@/styles/main.css';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Providers } from '@/app/providers';
import { Metadata, Viewport } from 'next';
import { inter } from './fonts';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { ThemeProvider } from 'next-themes';
import { TooltipProvider } from '@/components/ui/Tooltip';
import { UserAvatar } from '@/components/UserAvatar';
import { AuthProvider } from '@/components/AuthProvider';

export const viewport: Viewport = {
  themeColor: '#1B1B1B',
};

export const metadata: Metadata = {
  title: 'Routopia',
  description: 'Plan your routes intelligently',
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
    shortcut: [{ url: '/favicon.ico' }],
  },
  manifest: '/manifest.json',
  themeColor: '#2baf9d',
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  return (
    <html lang="en" className={inter.variable} suppressHydrationWarning>
      <body className="antialiased" suppressHydrationWarning>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem={false}
          disableTransitionOnChange
          forcedTheme="dark"
        >
          <TooltipProvider>
            <AuthProvider>
              <Providers session={session}>
                <nav>
                  <UserAvatar />
                </nav>
                {children}
              </Providers>
            </AuthProvider>
          </TooltipProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}