import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { WebSocket } from 'ws';
import { RealTimeService } from '../../services/RealTimeService';
import { TrafficService } from '../../services/TrafficService';
import { RealTimeUpdate } from '../../types/realtime';
import { TrafficConditions } from '../../types/traffic';

describe('Real-time Traffic Integration', () => {
  let realTimeService: RealTimeService;
  let trafficService: TrafficService;
  let mockWs: WebSocket;
  let receivedUpdates: RealTimeUpdate[] = [];

  beforeEach(() => {
    vi.clearAllMocks();
    realTimeService = new RealTimeService();
    trafficService = new TrafficService();
    mockWs = new WebSocket(null);

    mockWs.send = vi.fn((data: string) => {
      receivedUpdates.push(JSON.parse(data));
    });
  });

  afterEach(() => {
    receivedUpdates = [];
  });

  it('should notify subscribed clients of traffic updates', async () => {
    realTimeService.handleConnection(mockWs);
    mockWs.emit('message', JSON.stringify({
      action: 'subscribe',
      types: ['TRAFFIC']
    }));

    const trafficUpdate: TrafficConditions = {
      congestionLevel: 'moderate',
      averageSpeed: 45,
      incidents: [],
      segments: [
        {
          startPoint: { lat: 37.7749, lng: -122.4194 },
          endPoint: { lat: 37.7858, lng: -122.4008 },
          congestionLevel: 'low',
          averageSpeed: 50,
          travelTime: 300
        }
      ],
      lastUpdated: Date.now()
    };

    realTimeService.broadcast({
      type: 'TRAFFIC',
      data: trafficUpdate,
      timestamp: Date.now()
    });

    expect(receivedUpdates).toHaveLength(1);
    expect(receivedUpdates[0].type).toBe('TRAFFIC');
    expect(receivedUpdates[0].data.congestionLevel).toBe('moderate');
  });

  it('should handle traffic incident updates', async () => {
    realTimeService.handleConnection(mockWs);
    mockWs.emit('message', JSON.stringify({
      action: 'subscribe',
      types: ['TRAFFIC']
    }));

    const trafficIncident = {
      type: 'accident',
      severity: 'major',
      location: { lat: 37.7749, lng: -122.4194 },
      description: 'Multi-vehicle collision',
      startTime: Date.now(),
      expectedDuration: 3600000
    };

    realTimeService.broadcast({
      type: 'TRAFFIC',
      data: {
        incident: trafficIncident,
        conditions: {
          congestionLevel: 'severe',
          averageSpeed: 15
        }
      },
      timestamp: Date.now()
    });

    expect(receivedUpdates).toHaveLength(1);
    expect(receivedUpdates[0].data.incident.severity).toBe('major');
  });

  it('should handle route-specific traffic updates', async () => {
    realTimeService.handleConnection(mockWs);
    mockWs.emit('message', JSON.stringify({
      action: 'subscribe',
      types: ['TRAFFIC'],
      routeId: 'route-123'
    }));

    const routeTrafficUpdates = Array.from({ length: 3 }, (_, i) => ({
      type: 'TRAFFIC' as const,
      data: {
        routeId: 'route-123',
        segments: [
          {
            id: `segment-${i}`,
            congestionLevel: i === 1 ? 'high' : 'moderate',
            averageSpeed: 45 - i * 10,
            travelTime: 300 + i * 60
          }
        ],
        alternateRoutes: [
          {
            id: `alt-${i}`,
            travelTime: 360 + i * 30,
            congestionLevel: 'low'
          }
        ]
      },
      timestamp: Date.now() + i * 60000
    }));

    // Send updates
    routeTrafficUpdates.forEach(update => realTimeService.broadcast(update));

    expect(receivedUpdates).toHaveLength(3);
    expect(receivedUpdates[1].data.segments[0].congestionLevel).toBe('high');
    expect(receivedUpdates.every(update => update.data.routeId === 'route-123')).toBe(true);
  });

  it('should handle traffic prediction updates', async () => {
    realTimeService.handleConnection(mockWs);
    mockWs.emit('message', JSON.stringify({
      action: 'subscribe',
      types: ['TRAFFIC']
    }));

    const trafficPrediction = {
      predictions: Array.from({ length: 12 }, (_, i) => ({
        time: Date.now() + i * 3600000,
        congestionLevel: i < 4 ? 'high' : i < 8 ? 'moderate' : 'low',
        averageSpeed: 30 + (i < 4 ? 0 : i < 8 ? 15 : 30),
        confidence: 0.8 - (i * 0.05)
      }))
    };

    realTimeService.broadcast({
      type: 'TRAFFIC',
      data: {
        prediction: trafficPrediction,
        currentConditions: {
          congestionLevel: 'high',
          averageSpeed: 25
        }
      },
      timestamp: Date.now()
    });

    expect(receivedUpdates).toHaveLength(1);
    expect(receivedUpdates[0].data.prediction.predictions).toHaveLength(12);
    expect(receivedUpdates[0].data.prediction.predictions[0].congestionLevel).toBe('high');
    expect(receivedUpdates[0].data.prediction.predictions[8].congestionLevel).toBe('low');
  });
}); 