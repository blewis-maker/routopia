import '@/styles/globals.css';
import '@/styles/main.css';
import '@/styles/mapbox-gl.css';
import { Providers } from '@/app/providers';
import { Metadata } from 'next';
import { inter } from './fonts';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { ThemeProvider } from 'next-themes';
import { TooltipProvider } from '@/components/ui/Tooltip';

export const metadata: Metadata = {
  title: 'Routopia - AI-Powered Route Planning',
  description: 'Plan your next adventure with AI-powered inspiration.',
  icons: {
    icon: [
      { url: '/icons/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/icons/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/icons/icon-144x144.png', sizes: '144x144', type: 'image/png' },
    ],
  },
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
            <Providers session={session}>
              {children}
            </Providers>
          </TooltipProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}