import { vi, describe, it, expect, beforeEach } from 'vitest';
import { WebSocket } from 'ws';
import { RealTimeService } from '../../services/RealTimeService';
import { MetricsCollector } from '../../utils/metrics';
import { RealTimeUpdate } from '../../types/realtime';

vi.mock('ws');
vi.mock('../../utils/metrics');

describe('RealTimeService', () => {
  let service: RealTimeService;
  let mockWs: WebSocket;

  beforeEach(() => {
    vi.clearAllMocks();
    service = new RealTimeService();
    mockWs = new WebSocket(null);
  });

  it('should handle new connections', () => {
    service.handleConnection(mockWs);
    expect(mockWs.on).toHaveBeenCalledTimes(3); // message, close, error
  });

  it('should handle client subscriptions', () => {
    service.handleConnection(mockWs);
    const message = JSON.stringify({
      action: 'subscribe',
      types: ['POI', 'WEATHER']
    });

    mockWs.emit('message', message);
    
    // Broadcast a POI update
    const update: RealTimeUpdate = {
      type: 'POI',
      data: { id: 'test' },
      timestamp: Date.now()
    };
    
    service.broadcast(update);
    expect(mockWs.send).toHaveBeenCalledWith(JSON.stringify(update));
  });

  it('should handle client unsubscriptions', () => {
    service.handleConnection(mockWs);
    
    // First subscribe
    mockWs.emit('message', JSON.stringify({
      action: 'subscribe',
      types: ['POI']
    }));

    // Then unsubscribe
    mockWs.emit('message', JSON.stringify({
      action: 'unsubscribe',
      types: ['POI']
    }));

    // Broadcast should not reach the client
    const update: RealTimeUpdate = {
      type: 'POI',
      data: { id: 'test' },
      timestamp: Date.now()
    };
    
    service.broadcast(update);
    expect(mockWs.send).not.toHaveBeenCalled();
  });

  it('should handle client disconnections', () => {
    service.handleConnection(mockWs);
    mockWs.emit('close');

    const update: RealTimeUpdate = {
      type: 'POI',
      data: { id: 'test' },
      timestamp: Date.now()
    };
    
    service.broadcast(update);
    expect(mockWs.send).not.toHaveBeenCalled();
  });

  it('should handle heartbeats', () => {
    vi.useFakeTimers();
    service.handleConnection(mockWs);

    // Send heartbeat
    mockWs.emit('message', JSON.stringify({
      action: 'heartbeat'
    }));

    // Advance time by 20 seconds
    vi.advanceTimersByTime(20000);
    expect(mockWs.close).not.toHaveBeenCalled();

    // Advance time by 40 seconds (total 60s, > 30s timeout)
    vi.advanceTimersByTime(40000);
    expect(mockWs.close).toHaveBeenCalled();

    vi.useRealTimers();
  });

  it('should handle broadcast errors gracefully', () => {
    service.handleConnection(mockWs);
    mockWs.emit('message', JSON.stringify({
      action: 'subscribe',
      types: ['POI']
    }));

    // Simulate send error
    mockWs.send.mockImplementationOnce(() => {
      throw new Error('Send failed');
    });

    const update: RealTimeUpdate = {
      type: 'POI',
      data: { id: 'test' },
      timestamp: Date.now()
    };

    expect(() => service.broadcast(update)).not.toThrow();
  });
}); 