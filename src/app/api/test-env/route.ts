import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    clientId: process.env.GOOGLE_CLIENT_ID?.slice(0, 10) + '...',
    nextAuthUrl: process.env.NEXTAUTH_URL,
    nodeEnv: process.env.NODE_ENV,
  });
} 