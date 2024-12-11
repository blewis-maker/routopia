import { NextApiRequest, NextApiResponse } from 'next';
import { PreferenceCache } from '@/services/cache/PreferenceCache';
import { CacheMonitor } from '@/services/monitoring/CacheMonitor';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const monitor = new CacheMonitor();
  const stats = await monitor.getStats();

  res.status(200).json(stats);
} 