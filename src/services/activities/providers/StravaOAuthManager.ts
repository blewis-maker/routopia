import { StravaConfig } from '@/lib/external/strava/config';

interface StravaTokens {
  access_token: string;
  refresh_token: string;
  expires_at: number;
}

export class StravaOAuthManager {
  async exchangeCode(code: string): Promise<StravaTokens> {
    const response = await fetch('https://www.strava.com/oauth/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        client_id: StravaConfig.clientId,
        client_secret: StravaConfig.clientSecret,
        code,
        grant_type: 'authorization_code'
      })
    });

    if (!response.ok) {
      throw new Error('Failed to exchange auth code');
    }

    return response.json();
  }

  async refreshTokens(refreshToken: string): Promise<StravaTokens> {
    const response = await fetch('https://www.strava.com/oauth/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        client_id: StravaConfig.clientId,
        client_secret: StravaConfig.clientSecret,
        refresh_token: refreshToken,
        grant_type: 'refresh_token'
      })
    });

    if (!response.ok) {
      throw new Error('Failed to refresh tokens');
    }

    return response.json();
  }
} 