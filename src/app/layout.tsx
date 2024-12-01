import '@/app/globals.css';
import NavBar from '@/components/NavBar';
import { AuthProvider } from '@/components/AuthProvider';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Routopia',
  description: 'Your AI-powered route planning assistant',
  icons: {
    icon: '/favicon.ico',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link 
          rel="preload" 
          href="/next/image?url=%2F_next%2Fstatic%2Fmedia%2Flogo.png&w=256&q=75" 
          as="image"
        />
        <link 
          rel="preload"
          href="/routopia.ico" 
          as="image" 
          type="image/x-icon"
        />
      </head>
      <body>
        <AuthProvider>
          <NavBar />
          <main className="pt-16">
            {children}
          </main>
        </AuthProvider>
      </body>
    </html>
  );
}
