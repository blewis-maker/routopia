'use client';

import { createContext, useContext, ReactNode } from 'react';
import { useSession, signIn, signOut } from 'next-auth/react';

interface User {
  id: string;
  email: string;
  name?: string;
  image?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: Error | null;
  signIn: (provider: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const { data: session, status } = useSession();

  const user = session?.user ? {
    id: session.user.id || '',
    email: session.user.email || '',
    name: session.user.name || undefined,
    image: session.user.image || undefined,
  } : null;

  const value = {
    user,
    loading: status === 'loading',
    error: null,
    signIn: async (provider: string) => {
      try {
        await signIn(provider, { callbackUrl: '/dashboard' });
      } catch (error) {
        console.error('Sign in error:', error);
        throw error;
      }
    },
    signOut: async () => {
      try {
        await signOut({ callbackUrl: '/' });
      } catch (error) {
        console.error('Sign out error:', error);
        throw error;
      }
    },
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
} 