import NextAuth from 'next-auth';
import type { NextAuthOptions } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code"
        }
      }
    }),
  ],
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  callbacks: {
    async session({ session, token }) {
      try {
        if (session?.user) {
          session.user.id = token.sub;
        }
        return session;
      } catch (error) {
        console.error("Session callback error:", error);
        return null;
      }
    },
    async jwt({ token, account }) {
      try {
        if (account) {
          token.accessToken = account.access_token;
        }
        return token;
      } catch (error) {
        console.error("JWT callback error:", error);
        return token;
      }
    }
  },
  events: {
    async error(error) {
      console.error("NextAuth error:", error);
    }
  },
  debug: true,
  logger: {
    error(code, ...message) {
      console.error(code, message);
    },
    warn(code, ...message) {
      console.warn(code, message);
    },
    debug(code, ...message) {
      console.debug(code, message);
    }
  }
};

// Export a custom handler that includes error handling
export async function GET(request: Request) {
  try {
    const response = await NextAuth(authOptions)(request);
    return response;
  } catch (error) {
    console.error("NextAuth GET error:", error);
    return new Response(JSON.stringify({ error: "Internal Server Error" }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }
}

export async function POST(request: Request) {
  try {
    const response = await NextAuth(authOptions)(request);
    return response;
  } catch (error) {
    console.error("NextAuth POST error:", error);
    return new Response(JSON.stringify({ error: "Internal Server Error" }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }
}