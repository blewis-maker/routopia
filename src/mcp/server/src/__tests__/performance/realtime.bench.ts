import { describe, bench, expect } from 'vitest';
import { WebSocket } from 'ws';
import { RealTimeService } from '../../services/RealTimeService';
import { POICategory } from '../../types/poi';
import { UpdateType } from '../../types/realtime';

describe('RealTime Service Performance', () => {
  let service: RealTimeService;
  let clients: WebSocket[];
  const NUM_CLIENTS = 1000;
  const UPDATES_PER_SECOND = 10;
  const TEST_DURATION = 10000; // 10 seconds

  beforeEach(() => {
    service = new RealTimeService();
    clients = Array.from({ length: NUM_CLIENTS }, () => new WebSocket(null));
    
    // Setup clients
    clients.forEach((client, index) => {
      client.send = vi.fn();
      service.handleConnection(client);
      
      // Subscribe to different update types based on client index
      const types: UpdateType[] = [];
      if (index % 2 === 0) types.push('POI');
      if (index % 3 === 0) types.push('WEATHER');
      if (index % 4 === 0) types.push('TRAFFIC');
      
      client.emit('message', JSON.stringify({
        action: 'subscribe',
        types
      }));
    });
  });

  bench('should handle high-frequency POI updates', async () => {
    const startTime = Date.now();
    let updateCount = 0;

    while (Date.now() - startTime < TEST_DURATION) {
      const update = {
        type: 'POI' as const,
        data: {
          results: [{
            id: `poi-${updateCount}`,
            name: `POI ${updateCount}`,
            location: { lat: 37.7749, lng: -122.4194 },
            category: POICategory.RESTAURANT,
            recommendedActivities: ['WALK'],
            confidence: 0.9,
            details: {
              description: 'Test POI',
              openingHours: '9:00-17:00',
              amenities: ['parking'],
              ratings: { overall: 4.0 }
            }
          }],
          metadata: {
            total: 1,
            radius: 1000,
            categories: [POICategory.RESTAURANT],
            searchTime: Date.now()
          }
        },
        timestamp: Date.now()
      };

      service.broadcast(update);
      updateCount++;
      
      // Simulate UPDATES_PER_SECOND frequency
      await new Promise(resolve => setTimeout(resolve, 1000 / UPDATES_PER_SECOND));
    }

    // Calculate metrics
    const totalTime = Date.now() - startTime;
    const updatesPerSecond = (updateCount / totalTime) * 1000;
    const messagesSent = updateCount * (NUM_CLIENTS / 2); // Half of clients subscribed to POI

    expect(updatesPerSecond).toBeGreaterThanOrEqual(UPDATES_PER_SECOND);
    expect(messagesSent).toBeGreaterThan(0);
  });

  bench('should handle concurrent updates of different types', async () => {
    const startTime = Date.now();
    let updateCount = 0;

    while (Date.now() - startTime < TEST_DURATION) {
      // Send POI, Weather, and Traffic updates concurrently
      await Promise.all([
        service.broadcast({
          type: 'POI',
          data: { id: `poi-${updateCount}`, type: 'restaurant' },
          timestamp: Date.now()
        }),
        service.broadcast({
          type: 'WEATHER',
          data: { temperature: 20 + Math.random() * 10 },
          timestamp: Date.now()
        }),
        service.broadcast({
          type: 'TRAFFIC',
          data: { congestionLevel: 'moderate' },
          timestamp: Date.now()
        })
      ]);

      updateCount++;
      await new Promise(resolve => setTimeout(resolve, 1000 / UPDATES_PER_SECOND));
    }

    const totalTime = Date.now() - startTime;
    const updatesPerSecond = ((updateCount * 3) / totalTime) * 1000;

    expect(updatesPerSecond).toBeGreaterThanOrEqual(UPDATES_PER_SECOND * 3);
  });

  bench('should handle client subscriptions/unsubscriptions under load', async () => {
    const operations = [];
    const numOperations = 1000;

    // Generate random subscribe/unsubscribe operations
    for (let i = 0; i < numOperations; i++) {
      const client = clients[Math.floor(Math.random() * NUM_CLIENTS)];
      const operation = Math.random() > 0.5 ? 'subscribe' : 'unsubscribe';
      const types: UpdateType[] = ['POI', 'WEATHER', 'TRAFFIC'].filter(() => Math.random() > 0.5);

      operations.push(() => {
        client.emit('message', JSON.stringify({
          action: operation,
          types
        }));
      });
    }

    const startTime = Date.now();

    // Execute all operations concurrently
    await Promise.all(operations.map(op => op()));

    // Broadcast updates while operations are being processed
    for (let i = 0; i < 100; i++) {
      service.broadcast({
        type: 'POI',
        data: { id: `poi-${i}` },
        timestamp: Date.now()
      });
    }

    const totalTime = Date.now() - startTime;
    const operationsPerSecond = (numOperations / totalTime) * 1000;

    expect(operationsPerSecond).toBeGreaterThan(100);
  });

  bench('should handle client disconnections under load', async () => {
    const startTime = Date.now();
    let disconnectCount = 0;

    // Disconnect half of the clients while sending updates
    for (let i = 0; i < NUM_CLIENTS / 2; i++) {
      service.broadcast({
        type: 'POI',
        data: { id: `poi-${i}` },
        timestamp: Date.now()
      });

      clients[i].emit('close');
      disconnectCount++;

      if (i % 100 === 0) {
        await new Promise(resolve => setTimeout(resolve, 10));
      }
    }

    const totalTime = Date.now() - startTime;
    const disconnectsPerSecond = (disconnectCount / totalTime) * 1000;

    expect(disconnectsPerSecond).toBeGreaterThan(100);
  });
}); 