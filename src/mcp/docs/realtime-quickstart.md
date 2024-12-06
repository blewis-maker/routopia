# Routopia Real-Time System Quick Start Guide

## Installation

1. Install the required packages:

```bash
npm install @routopia/mcp-server ws prom-client
```

2. Add the following to your `.env` file:

```env
REALTIME_PORT=3000
REALTIME_HOST=0.0.0.0
```

## Basic Server Setup

1. Create a new WebSocket server:

```typescript
// server.ts
import { RealTimeService } from '@routopia/mcp-server';
import { WebSocket, WebSocketServer } from 'ws';

const wss = new WebSocketServer({ port: 3000 });
const realTimeService = new RealTimeService();

wss.on('connection', (ws: WebSocket) => {
  realTimeService.handleConnection(ws);
});
```

2. Send updates:

```typescript
// Send POI update
realTimeService.broadcast({
  type: 'POI',
  data: {
    id: 'poi-123',
    name: 'New Restaurant',
    location: { lat: 37.7749, lng: -122.4194 }
  },
  timestamp: Date.now()
});
```

## Basic Client Setup

1. Create a new client:

```typescript
// client.ts
import { RealTimeClient } from '@routopia/mcp-client';

const client = new RealTimeClient({
  url: 'ws://localhost:3000/realtime'
});

// Connect and subscribe
client.on('connected', () => {
  client.subscribe(['POI', 'WEATHER']);
});

// Handle updates
client.on('POI', (data) => {
  console.log('POI Update:', data);
});

client.on('WEATHER', (data) => {
  console.log('Weather Update:', data);
});

// Handle errors
client.on('error', (error) => {
  console.error('Error:', error);
});

// Connect to server
client.connect();
```

## Common Patterns

### 1. Batch Updates

```typescript
// Server-side
const updates = poiUpdates.map(poi => ({
  type: 'POI',
  data: poi,
  timestamp: Date.now()
}));

updates.forEach(update => realTimeService.broadcast(update));
```

### 2. Filtered Subscriptions

```typescript
// Client-side
client.subscribe(['POI']);

client.on('POI', (data) => {
  if (data.location.lat >= bounds.south && 
      data.location.lat <= bounds.north) {
    updateMap(data);
  }
});
```

### 3. Reconnection Handling

```typescript
client.on('disconnected', () => {
  console.log('Lost connection, will retry...');
});

client.on('reconnecting', (attempt) => {
  console.log(`Reconnection attempt ${attempt}`);
});

client.on('connected', () => {
  console.log('Reconnected!');
  // Resubscribe or refresh data if needed
});
```

## Monitoring

1. Enable metrics collection:

```typescript
// server.ts
import { MetricsCollector } from '@routopia/mcp-server';

const metrics = new MetricsCollector('realtime');
metrics.gauge('connections', wss.clients.size);
```

2. View metrics:

```bash
curl http://localhost:3000/metrics
```

## Testing

1. Run the test suite:

```bash
npm run test:realtime
```

2. Run integration tests:

```bash
npm run test:integration
```

3. Run performance tests:

```bash
npm run test:performance
```

## Common Issues

### Connection Issues

```typescript
client.on('error', (error) => {
  if (error.code === 'ECONNREFUSED') {
    console.error('Server is not running');
  } else if (error.code === 'ETIMEDOUT') {
    console.error('Connection timed out');
  }
});
```

### Memory Leaks

```typescript
// Clean up when done
client.on('beforeunload', () => {
  client.disconnect();
});
```

## Next Steps

1. Implement authentication
2. Add message compression
3. Set up monitoring
4. Configure production deployment
5. Implement error recovery strategies

For more detailed information, see the full [documentation](./realtime-system.md). 