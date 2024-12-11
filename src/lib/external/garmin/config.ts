export const garminConfig = {
  consumerKey: process.env.GARMIN_CONSUMER_KEY!,
  consumerSecret: process.env.GARMIN_CONSUMER_SECRET!,
  apiKey: process.env.GARMIN_API_KEY!,
  apiBaseUrl: 'https://apis.garmin.com',
  oauthUrl: 'https://connect.garmin.com/oauthConfirm',
  callbackUrl: process.env.GARMIN_CALLBACK_URL!
};

