import { stravaConfig } from './config';
import { prisma } from '@/lib/prisma';
import { ErrorLogger } from '@/lib/utils/errors/ErrorLogger';

export class StravaClient {
  private accessToken: string | null = null;
  private userId: string;

  constructor(userId: string) {
    this.userId = userId;
  }

  async getActivities(after?: Date): Promise<any[]> {
    await this.ensureValidToken();
    
    const params = new URLSearchParams({
      per_page: '100',
      ...(after && { after: Math.floor(after.getTime() / 1000).toString() })
    });

    const response = await fetch(
      `${stravaConfig.apiBaseUrl}/athlete/activities?${params}`,
      {
        headers: {
          'Authorization': `Bearer ${this.accessToken}`
        }
      }
    );

    if (!response.ok) {
      throw new Error(`Strava API error: ${response.statusText}`);
    }

    return response.json();
  }

  private async ensureValidToken(): Promise<void> {
    const account = await prisma.account.findFirst({
      where: {
        provider: 'strava',
        user: { id: this.userId }
      }
    });

    if (!account) {
      throw new Error('No Strava account connected');
    }

    // Check if token needs refresh
    const now = Math.floor(Date.now() / 1000);
    if (now >= (account.expires_at || 0)) {
      await this.refreshToken(account.refresh_token);
    } else {
      this.accessToken = account.access_token;
    }
  }

  private async refreshToken(refreshToken: string | null): Promise<void> {
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    try {
      const response = await fetch(stravaConfig.tokenUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          client_id: stravaConfig.clientId,
          client_secret: stravaConfig.clientSecret,
          refresh_token: refreshToken,
          grant_type: 'refresh_token'
        })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message);
      }

      // Update tokens in database
      await prisma.account.update({
        where: {
          provider_providerAccountId: {
            provider: 'strava',
            providerAccountId: this.userId
          }
        },
        data: {
          access_token: data.access_token,
          refresh_token: data.refresh_token,
          expires_at: Math.floor(Date.now() / 1000 + data.expires_in)
        }
      });

      this.accessToken = data.access_token;
    } catch (error) {
      await ErrorLogger.log(error as Error, {
        userId: this.userId,
        provider: 'strava',
        operation: 'token_refresh',
        severity: 'high'
      });
      throw error;
    }
  }

  async createActivity(activity: any): Promise<any> {
    await this.ensureValidToken();
    
    const response = await fetch(`${stravaConfig.apiBaseUrl}/activities`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(activity)
    });

    if (!response.ok) {
      throw new Error(`Failed to create activity: ${response.statusText}`);
    }

    return response.json();
  }

  async getAthlete(): Promise<any> {
    await this.ensureValidToken();
    
    const response = await fetch(`${stravaConfig.apiBaseUrl}/athlete`, {
      headers: {
        'Authorization': `Bearer ${this.accessToken}`
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to get athlete: ${response.statusText}`);
    }

    return response.json();
  }
} 