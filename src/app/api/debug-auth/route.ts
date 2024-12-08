import { NextResponse } from 'next/server';
import { env } from '@/lib/env';
import { headers } from 'next/headers';

export async function GET() {
  const headersList = headers();
  
  return NextResponse.json({
    env: {
      googleClientId: env.googleClientId.slice(0, 10) + '...',
      nextAuthUrl: env.nextAuthUrl,
      host: headersList.get('host'),
    },
    processEnv: {
      nodeEnv: process.env.NODE_ENV,
      googleClientId: process.env.GOOGLE_CLIENT_ID?.slice(0, 10) + '...',
    }
  });
} 