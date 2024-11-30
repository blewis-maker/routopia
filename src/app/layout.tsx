import '@/app/globals.css';
import NavBar from '@/components/NavBar';
import { AuthProvider } from '@/components/AuthProvider';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Routopia - AI Route Planning Companion',
  description: 'Plan your next adventure with AI-powered inspiration',
  icons: {
    icon: '/routopia-logo.png',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
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
