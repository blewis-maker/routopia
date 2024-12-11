import { NextResponse } from 'next/server';
import { redis } from '@/lib/redis';

export async function redisMiddleware(req: Request) {
  try {
    await redis.ping();
  } catch (error) {
    console.error('Redis health check failed:', error);
    // Continue without Redis if it's not available
    return NextResponse.next();
  }
  
  return NextResponse.next();
} 