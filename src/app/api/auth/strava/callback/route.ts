import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { stravaConfig } from '@/lib/external/strava/config';
import { ErrorLogger } from '@/lib/utils/errors/ErrorLogger';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const code = searchParams.get('code');
    
    if (!code) {
      return NextResponse.redirect('/settings?error=missing_code');
    }

    // Exchange code for token
    const tokenResponse = await fetch(stravaConfig.tokenUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        client_id: stravaConfig.clientId,
        client_secret: stravaConfig.clientSecret,
        code,
        grant_type: 'authorization_code'
      })
    });

    const tokenData = await tokenResponse.json();

    if (!tokenResponse.ok) {
      throw new Error(`Strava token exchange failed: ${tokenData.message}`);
    }

    // Store tokens in database
    await prisma.account.upsert({
      where: {
        provider_providerAccountId: {
          provider: 'strava',
          providerAccountId: tokenData.athlete.id.toString()
        }
      },
      update: {
        access_token: tokenData.access_token,
        refresh_token: tokenData.refresh_token,
        expires_at: Math.floor(Date.now() / 1000 + tokenData.expires_in),
        token_type: tokenData.token_type,
        scope: tokenData.scope
      },
      create: {
        provider: 'strava',
        providerAccountId: tokenData.athlete.id.toString(),
        access_token: tokenData.access_token,
        refresh_token: tokenData.refresh_token,
        expires_at: Math.floor(Date.now() / 1000 + tokenData.expires_in),
        token_type: tokenData.token_type,
        scope: tokenData.scope,
        user: {
          connectOrCreate: {
            where: { email: tokenData.athlete.email },
            create: {
              email: tokenData.athlete.email,
              name: tokenData.athlete.firstname + ' ' + tokenData.athlete.lastname,
              image: tokenData.athlete.profile
            }
          }
        }
      }
    });

    return NextResponse.redirect('/settings?success=strava_connected');
  } catch (error) {
    await ErrorLogger.log(error as Error, {
      operation: 'strava_oauth_callback',
      severity: 'high'
    });
    return NextResponse.redirect('/settings?error=auth_failed');
  }
} 