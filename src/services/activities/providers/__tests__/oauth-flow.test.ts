import { StravaOAuthManager } from '../StravaOAuthManager';
import { mockStravaTokenResponse, mockStravaAuthCode } from '@/test/mocks/strava';

describe('Strava OAuth Flow', () => {
  let oAuthManager: StravaOAuthManager;

  beforeEach(() => {
    oAuthManager = new StravaOAuthManager();
  });

  it('should exchange auth code for tokens', async () => {
    const tokens = await oAuthManager.exchangeCode(mockStravaAuthCode);
    expect(tokens.access_token).toBeDefined();
    expect(tokens.refresh_token).toBeDefined();
  });

  it('should refresh expired tokens', async () => {
    const newTokens = await oAuthManager.refreshTokens('expired_token');
    expect(newTokens.access_token).toBeDefined();
  });
}); 