import { WebSocket } from 'ws';
import { Activity, ActivityProgress } from '@/types/activities/activityTypes';
import { redis } from '@/lib/redis';
import { EventEmitter } from 'events';

export class RealTimeTracker extends EventEmitter {
  private connections: Map<string, WebSocket> = new Map();
  private readonly UPDATE_INTERVAL = 1000; // 1 second
  private readonly STALE_THRESHOLD = 5000; // 5 seconds

  async startTracking(userId: string, activityId: string): Promise<void> {
    const connection = new WebSocket(process.env.TRACKING_WS_URL!);
    
    connection.on('open', () => {
      this.connections.set(activityId, connection);
      this.emit('tracking:started', { userId, activityId });
    });

    connection.on('message', async (data) => {
      const update = JSON.parse(data.toString());
      await this.handleUpdate(userId, activityId, update);
    });

    connection.on('close', () => {
      this.handleDisconnect(userId, activityId);
    });
  }

  private async handleUpdate(
    userId: string,
    activityId: string,
    data: ActivityProgress
  ): Promise<void> {
    // Store latest update in Redis
    await redis.setex(
      `tracking:${activityId}:latest`,
      this.STALE_THRESHOLD / 1000,
      JSON.stringify({
        ...data,
        timestamp: new Date()
      })
    );

    this.emit('tracking:update', {
      userId,
      activityId,
      data
    });
  }

  private async handleDisconnect(userId: string, activityId: string): Promise<void> {
    this.connections.delete(activityId);
    this.emit('tracking:disconnected', { userId, activityId });
    
    // Attempt reconnection
    setTimeout(() => {
      if (!this.connections.has(activityId)) {
        this.startTracking(userId, activityId)
          .catch(err => this.emit('tracking:error', { userId, activityId, error: err }));
      }
    }, 5000);
  }
} 