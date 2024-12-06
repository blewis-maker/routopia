import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { WebSocket } from 'ws';
import { RealTimeService } from '../../services/RealTimeService';
import { POIService } from '../../services/POIService';
import { RealTimeUpdate } from '../../types/realtime';
import { POISearchResult, POICategory } from '../../types/poi';
import { ActivityType } from '../../types/activities';

describe('Real-time POI Integration', () => {
  let realTimeService: RealTimeService;
  let poiService: POIService;
  let mockWs: WebSocket;
  let receivedUpdates: RealTimeUpdate[] = [];

  beforeEach(() => {
    vi.clearAllMocks();
    realTimeService = new RealTimeService();
    poiService = new POIService();
    mockWs = new WebSocket(null);

    // Setup WebSocket mock
    mockWs.send = vi.fn((data: string) => {
      receivedUpdates.push(JSON.parse(data));
    });
  });

  afterEach(() => {
    receivedUpdates = [];
  });

  it('should notify subscribed clients of POI updates', async () => {
    // Setup client subscription
    realTimeService.handleConnection(mockWs);
    mockWs.emit('message', JSON.stringify({
      action: 'subscribe',
      types: ['POI']
    }));

    // Simulate POI update
    const poiUpdate: POISearchResult = {
      results: [{
        id: 'new-poi',
        name: 'New Restaurant',
        location: { lat: 37.7749, lng: -122.4194 },
        category: POICategory.RESTAURANT,
        recommendedActivities: [ActivityType.WALK, ActivityType.FOOD],
        confidence: 0.95,
        details: {
          description: 'A new restaurant',
          openingHours: '9:00-22:00',
          amenities: ['parking', 'wifi'],
          ratings: {
            overall: 4.5,
            aspects: {
              safety: 0.9,
              accessibility: 0.8
            }
          }
        }
      }],
      metadata: {
        total: 1,
        radius: 1000,
        categories: [POICategory.RESTAURANT],
        searchTime: Date.now()
      }
    };

    // Broadcast the update
    realTimeService.broadcast({
      type: 'POI',
      data: poiUpdate,
      timestamp: Date.now()
    });

    // Verify the client received the update
    expect(receivedUpdates).toHaveLength(1);
    expect(receivedUpdates[0].type).toBe('POI');
    expect(receivedUpdates[0].data.results[0].id).toBe('new-poi');
  });

  it('should handle multiple POI subscriptions and updates', async () => {
    const clients = Array.from({ length: 3 }, () => new WebSocket(null));
    clients.forEach(client => {
      client.send = vi.fn((data: string) => {
        receivedUpdates.push(JSON.parse(data));
      });
      realTimeService.handleConnection(client);
    });

    // Subscribe only first two clients to POI updates
    clients.slice(0, 2).forEach(client => {
      client.emit('message', JSON.stringify({
        action: 'subscribe',
        types: ['POI']
      }));
    });

    // Simulate multiple POI updates
    const updates = Array.from({ length: 3 }, (_, i) => ({
      type: 'POI' as const,
      data: {
        results: [{
          id: `poi-${i}`,
          name: `POI ${i}`,
          location: { lat: 37.7749, lng: -122.4194 },
          category: POICategory.RESTAURANT,
          recommendedActivities: [ActivityType.WALK],
          confidence: 0.9,
          details: {
            description: `Test POI ${i}`,
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
    }));

    // Broadcast updates
    updates.forEach(update => realTimeService.broadcast(update));

    // Verify only subscribed clients received updates
    expect(receivedUpdates).toHaveLength(6); // 2 clients * 3 updates
    expect(receivedUpdates.every(update => update.type === 'POI')).toBe(true);
    
    // Verify the third client didn't receive updates
    const thirdClientSend = clients[2].send as jest.Mock;
    expect(thirdClientSend).not.toHaveBeenCalled();
  });

  it('should handle POI update errors gracefully', async () => {
    realTimeService.handleConnection(mockWs);
    mockWs.emit('message', JSON.stringify({
      action: 'subscribe',
      types: ['POI']
    }));

    // Simulate send error
    mockWs.send = vi.fn().mockImplementationOnce(() => {
      throw new Error('Network error');
    });

    const update: RealTimeUpdate = {
      type: 'POI',
      data: {
        results: [{
          id: 'error-poi',
          name: 'Error POI',
          location: { lat: 37.7749, lng: -122.4194 },
          category: POICategory.RESTAURANT,
          recommendedActivities: [ActivityType.WALK],
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

    // Should not throw
    expect(() => realTimeService.broadcast(update)).not.toThrow();
  });
}); 