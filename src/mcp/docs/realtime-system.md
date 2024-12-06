# Routopia Real-Time System Documentation

## Overview
The Routopia Real-Time System provides live updates for POIs, weather conditions, and traffic information. It uses WebSocket connections to maintain bi-directional communication between the server and clients, ensuring users receive immediate updates about relevant changes in their route environment.

## Architecture

### Components
1. **RealTimeService (Server)**
   - Manages WebSocket connections
   - Handles client subscriptions
   - Broadcasts updates to subscribed clients
   - Monitors client health via heartbeats
   - Collects metrics for monitoring

2. **RealTimeClient (Client)**
   - Manages WebSocket connection to server
   - Handles automatic reconnection
   - Manages subscriptions
   - Provides event-based interface
   - Implements heartbeat mechanism

3. **Metrics Collection**
   - Tracks connection statistics
   - Monitors message throughput
   - Measures latency
   - Records error rates

### Data Types

#### Update Types
```typescript
type UpdateType = 'POI' | 'WEATHER' | 'TRAFFIC' | 'ROUTE';

interface RealTimeUpdate {
  type: UpdateType;
  data: any;
  timestamp: number;
}
```

#### Message Types
```typescript
interface RealTimeMessage {
  action: 'subscribe' | 'unsubscribe' | 'heartbeat';
  types?: UpdateType[];
}
```

## Usage

### Server-Side Implementation

1. **Starting the Service**
```typescript
const realTimeService = new RealTimeService();
```

2. **Handling Client Connections**
```typescript
wss.on('connection', (ws) => {
  realTimeService.handleConnection(ws);
});
```

3. **Broadcasting Updates**
```typescript
realTimeService.broadcast({
  type: 'POI',
  data: poiUpdate,
  timestamp: Date.now()
});
```

### Client-Side Implementation

1. **Connecting to the Service**
```typescript
const client = new RealTimeClient({
  url: 'ws://localhost:3000/realtime',
  reconnectInterval: 5000,
  maxReconnectAttempts: 5,
  heartbeatInterval: 15000
});

client.connect();
```

2. **Subscribing to Updates**
```typescript
client.on('connected', () => {
  client.subscribe(['POI', 'WEATHER']);
});

client.on('POI', (data) => {
  console.log('Received POI update:', data);
});

client.on('WEATHER', (data) => {
  console.log('Received weather update:', data);
});
```

3. **Error Handling**
```typescript
client.on('error', (error) => {
  console.error('Real-time client error:', error);
});

client.on('disconnected', () => {
  console.log('Disconnected from server');
});

client.on('reconnecting', (attempt) => {
  console.log(`Reconnection attempt ${attempt}`);
});
```

## Performance Considerations

### Server-Side
- Maximum concurrent connections: 10,000
- Message throughput: Up to 10,000 messages/second
- Latency target: < 100ms
- Memory usage: ~50MB base + ~10KB per connection

### Client-Side
- Reconnection strategy: Exponential backoff
- Heartbeat interval: 15 seconds
- Message buffer size: 1000 messages
- Connection timeout: 30 seconds

### Optimization Tips
1. Use message batching for high-frequency updates
2. Implement client-side rate limiting
3. Use compression for large payloads
4. Maintain connection pooling
5. Implement proper error boundaries

## Testing

### Unit Tests
```bash
npm run test:unit
```
Tests individual components in isolation.

### Integration Tests
```bash
npm run test:integration
```
Tests component interactions and real-world scenarios.

### Performance Tests
```bash
npm run test:performance
```
Tests system behavior under load.

## Monitoring

### Metrics
- Connection count
- Message throughput
- Error rates
- Latency
- Subscription patterns
- Client health

### Alerts
1. High error rate (>1%)
2. High latency (>500ms)
3. Connection drops (>10%)
4. Memory usage (>80%)

## Security

### Best Practices
1. Use WSS (WebSocket Secure) in production
2. Implement authentication/authorization
3. Rate limit connections and messages
4. Validate message formats
5. Sanitize input data

### Rate Limiting
- Connection rate: 100/minute per IP
- Message rate: 100/second per client
- Subscription limit: 10 types per client

## Deployment

### Prerequisites
- Node.js 16+
- Redis for metrics
- Prometheus for monitoring
- Load balancer with WebSocket support

### Configuration
```env
REALTIME_PORT=3000
REALTIME_HOST=0.0.0.0
MAX_CONNECTIONS=10000
HEARTBEAT_INTERVAL=15000
RECONNECT_INTERVAL=5000
```

### Health Checks
- WebSocket server status
- Connection count
- Memory usage
- Message queue size

## Troubleshooting

### Common Issues
1. Connection drops
   - Check network stability
   - Verify heartbeat configuration
   - Monitor server resources

2. High latency
   - Check message queue size
   - Monitor subscription count
   - Verify network conditions

3. Memory leaks
   - Check subscription cleanup
   - Monitor connection lifecycle
   - Verify message buffer size

### Debug Mode
Enable debug logging:
```typescript
const client = new RealTimeClient({
  url: 'ws://localhost:3000/realtime',
  debug: true
});
```

## API Reference

### Server Methods
- `handleConnection(ws: WebSocket)`
- `broadcast(update: RealTimeUpdate)`
- `getMetrics(): RealTimeMetrics`

### Client Methods
- `connect(): void`
- `disconnect(): void`
- `subscribe(types: UpdateType[]): void`
- `unsubscribe(types: UpdateType[]): void`

### Events
- `connected`
- `disconnected`
- `reconnecting`
- `error`
- `update`
- Update type events (`POI`, `WEATHER`, `TRAFFIC`, `ROUTE`) 