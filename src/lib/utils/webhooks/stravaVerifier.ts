import crypto from 'crypto';

export function verifyStravaWebhook(req: Request): boolean {
  const signature = req.headers.get('x-hub-signature');
  if (!signature) return false;

  const hmac = crypto.createHmac('sha256', process.env.STRAVA_WEBHOOK_SECRET!);
  const computedSignature = hmac.update(JSON.stringify(req.body)).digest('hex');
  
  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(computedSignature)
  );
} 