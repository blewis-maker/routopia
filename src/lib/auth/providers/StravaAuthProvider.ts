import { OAuth2Client } from 'oauth';
import { redis } from '@/lib/redis';

export class StravaAuthProvider {
  private client: OAuth2Client;
  private readonly SCOPES = ['activity:read_all', 'activity:write'];
  private readonly TOKEN_TTL = 21600; // 6 hours

  constructor() {
    this.client = new OAuth2Client({
      clientId: process.env.STRAVA_CLIENT_ID!,
      clientSecret: process.env.STRAVA_CLIENT_SECRET!,
      callbackURL: process.env.STRAVA_REDIRECT_URI!,
      authorizationURL: 'https://www.strava.com/oauth/authorize',
      tokenURL: 'https://www.strava.com/oauth/token'
    });
  }

  getAuthorizationUrl(state: string): string {
    return this.client.getAuthorizationUrl({
      scope: this.SCOPES.join(' '),
      state
    });
  }

  async handleCallback(code: string): Promise<string> {
    const { accessToken, refreshToken, expiresIn } = await this.client.getToken(code);
    return this.storeTokens(accessToken, refreshToken, expiresIn);
  }

  private async storeTokens(
    accessToken: string,
    refreshToken: string,
    expiresIn: number
  ): Promise<string> {
    const tokenId = crypto.randomUUID();
    await redis.setex(
      `strava:token:${tokenId}`,
      this.TOKEN_TTL,
      JSON.stringify({
        accessToken,
        refreshToken,
        expiresAt: Date.now() + expiresIn * 1000
      })
    );
    return tokenId;
  }
} 