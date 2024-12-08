import { NextAuthOptions } from 'next-auth';
import { PrismaAdapter } from '@auth/prisma-adapter';
import GoogleProvider from 'next-auth/providers/google';
import { getServerSession } from 'next-auth/next';
import { prisma } from '@/lib/prisma';
import { env } from './env';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
    }
  }
}

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: env.googleClientId,
      clientSecret: env.googleClientSecret,
      authorization: {
        params: {
          access_type: "offline",
          response_type: "code",
          prompt: "consent",
        }
      }
    }),
  ],
  debug: true,
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async session({ session, token, user }) {
      if (session.user) {
        session.user.id = token.sub || user.id;
      }
      return session;
    },
    async jwt({ token, user, account }) {
      if (user) {
        token.uid = user.id;
      }
      if (account) {
        token.accessToken = account.access_token;
      }
      return token;
    },
  },
  pages: {
    signIn: '/',
    error: '/auth/error',
    signOut: '/',
  },
  secret: env.nextAuthSecret,
};

export const getAuthSession = () => getServerSession(authOptions);
export default authOptions; 