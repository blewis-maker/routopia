if (!process.env.GOOGLE_CLIENT_ID) {
  throw new Error('GOOGLE_CLIENT_ID is not defined');
}

if (!process.env.GOOGLE_CLIENT_SECRET) {
  throw new Error('GOOGLE_CLIENT_SECRET is not defined');
}

export const env = {
  googleClientId: process.env.GOOGLE_CLIENT_ID,
  googleClientSecret: process.env.GOOGLE_CLIENT_SECRET,
  nextAuthUrl: process.env.NEXTAUTH_URL,
  nextAuthSecret: process.env.NEXTAUTH_SECRET,
} as const;

export function validateEnv() {
  const requiredEnvVars = [
    // Core APIs
    'OPENAI_API_KEY',
    'OPENAI_ORG_ID',
    'NEXT_PUBLIC_GOOGLE_MAPS_KEY',
    // Trail API
    'TRAIL_API_KEY',
    'TRAIL_API_HOST',
    'TRAIL_API_URL',
    // Ski API
    'SKI_API_KEY',
    'SKI_API_HOST',
    'SKI_API_URL'
  ];

  const missingEnvVars = requiredEnvVars.filter(
    envVar => !process.env[envVar]
  );

  if (missingEnvVars.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missingEnvVars.join(', ')}`
    );
  }
}