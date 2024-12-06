import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { WebSocket } from 'ws';
import { RealTimeService } from '../../services/RealTimeService';
import { WeatherService } from '../../services/WeatherService';
import { RealTimeUpdate } from '../../types/realtime';
import { WeatherConditions } from '../../types/weather';

describe('Real-time Weather Integration', () => {
  let realTimeService: RealTimeService;
  let weatherService: WeatherService;
  let mockWs: WebSocket;
  let receivedUpdates: RealTimeUpdate[] = [];

  beforeEach(() => {
    vi.clearAllMocks();
    realTimeService = new RealTimeService();
    weatherService = new WeatherService();
    mockWs = new WebSocket(null);

    mockWs.send = vi.fn((data: string) => {
      receivedUpdates.push(JSON.parse(data));
    });
  });

  afterEach(() => {
    receivedUpdates = [];
  });

  it('should notify subscribed clients of weather updates', async () => {
    realTimeService.handleConnection(mockWs);
    mockWs.emit('message', JSON.stringify({
      action: 'subscribe',
      types: ['WEATHER']
    }));

    const weatherUpdate: WeatherConditions = {
      temperature: 22.5,
      humidity: 65,
      windSpeed: 10,
      precipitation: 0,
      conditions: 'clear',
      visibility: 10000,
      alerts: [],
      forecast: {
        hourly: [
          {
            time: Date.now() + 3600000,
            temperature: 23.5,
            precipitation: 0,
            conditions: 'clear'
          }
        ],
        daily: [
          {
            date: new Date().toISOString().split('T')[0],
            highTemp: 25,
            lowTemp: 18,
            conditions: 'clear'
          }
        ]
      }
    };

    realTimeService.broadcast({
      type: 'WEATHER',
      data: weatherUpdate,
      timestamp: Date.now()
    });

    expect(receivedUpdates).toHaveLength(1);
    expect(receivedUpdates[0].type).toBe('WEATHER');
    expect(receivedUpdates[0].data.temperature).toBe(22.5);
  });

  it('should handle weather alert updates', async () => {
    realTimeService.handleConnection(mockWs);
    mockWs.emit('message', JSON.stringify({
      action: 'subscribe',
      types: ['WEATHER']
    }));

    const weatherAlert = {
      type: 'severe_weather',
      severity: 'warning',
      message: 'Strong winds expected',
      startTime: Date.now(),
      endTime: Date.now() + 7200000
    };

    realTimeService.broadcast({
      type: 'WEATHER',
      data: {
        alert: weatherAlert,
        conditions: {
          temperature: 18,
          windSpeed: 45,
          conditions: 'windy'
        }
      },
      timestamp: Date.now()
    });

    expect(receivedUpdates).toHaveLength(1);
    expect(receivedUpdates[0].data.alert.severity).toBe('warning');
  });

  it('should handle multiple weather subscriptions with different update frequencies', async () => {
    const clients = Array.from({ length: 3 }, () => new WebSocket(null));
    const clientUpdates: Record<number, RealTimeUpdate[]> = {
      0: [], 1: [], 2: []
    };

    clients.forEach((client, index) => {
      client.send = vi.fn((data: string) => {
        clientUpdates[index].push(JSON.parse(data));
      });
      realTimeService.handleConnection(client);
    });

    // Subscribe clients with different update frequencies
    clients.forEach((client, index) => {
      client.emit('message', JSON.stringify({
        action: 'subscribe',
        types: ['WEATHER'],
        frequency: index === 0 ? 'high' : index === 1 ? 'medium' : 'low'
      }));
    });

    // Simulate weather updates
    const updates = Array.from({ length: 5 }, (_, i) => ({
      type: 'WEATHER' as const,
      data: {
        temperature: 20 + i,
        conditions: 'clear',
        timestamp: Date.now() + i * 60000
      },
      timestamp: Date.now() + i * 60000
    }));

    updates.forEach(update => realTimeService.broadcast(update));

    // High frequency client should receive all updates
    expect(clientUpdates[0].length).toBe(5);
    // Medium frequency client should receive fewer updates
    expect(clientUpdates[1].length).toBeLessThan(5);
    // Low frequency client should receive even fewer updates
    expect(clientUpdates[2].length).toBeLessThan(clientUpdates[1].length);
  });
}); 