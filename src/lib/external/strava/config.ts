export const stravaConfig = {
  clientId: process.env.STRAVA_CLIENT_ID!,
  clientSecret: process.env.STRAVA_CLIENT_SECRET!,
  redirectUri: process.env.STRAVA_REDIRECT_URI!,
  scope: 'read,activity:read_all',
  authorizationEndpoint: 'https://www.strava.com/oauth/authorize',
  tokenEndpoint: 'https://www.strava.com/oauth/token'
} as const; 