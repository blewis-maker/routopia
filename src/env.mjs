import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
  server: {
    // Redis
    REDIS_ENABLED: z.string().transform(x => x === 'true'),
    REDIS_ENDPOINT: z.string().min(1),
    REDIS_PORT: z.string().transform(x => parseInt(x)),
    REDIS_TTL: z.string().transform(x => parseInt(x)),
    UPSTASH_REDIS_URL: z.string().optional(),
    UPSTASH_REDIS_TOKEN: z.string().optional(),

    // Pinecone
    PINECONE_API_KEY: z.string().min(1),
    PINECONE_ENVIRONMENT: z.string().min(1),
    PINECONE_INDEX_NAME: z.string().min(1),

    // OpenAI
    OPENAI_API_KEY: z.string().min(1),
    
    // Monitoring
    SENTRY_DSN: z.string().optional(),
    SLACK_WEBHOOK_URL: z.string().optional(),
    ALERT_EMAIL: z.string().email().optional(),
  },
  client: {
    NEXT_PUBLIC_APP_URL: z.string().url(),
  },
  runtimeEnv: process.env,
}); 