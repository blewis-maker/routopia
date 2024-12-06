# Routopia Real-Time System Troubleshooting Guide

## Connection Issues

### Connection Fails to Establish

#### Symptoms
- WebSocket connection fails to open
- Client receives ECONNREFUSED error
- Connection times out

#### Diagnostic Steps
1. Check server status:
```bash
curl http://localhost:3000/health
```

2. Verify network connectivity:
```bash
ping websocket-server.routopia.com
telnet websocket-server.routopia.com 3000
```

3. Check SSL/TLS configuration:
```bash
openssl s_client -connect websocket-server.routopia.com:443
```

#### Common Solutions
1. Server not running:
```bash
# Start the server
npm run start:realtime

# Check logs
tail -f logs/realtime.log
```

2. Firewall issues:
```bash
# Check firewall rules
sudo iptables -L | grep 3000
```

3. SSL certificate problems:
```bash
# Verify certificate
openssl verify -CAfile ca.crt server.crt
```

### Frequent Disconnections

#### Symptoms
- Connections drop unexpectedly
- Client repeatedly attempts to reconnect
- Inconsistent connection state

#### Diagnostic Steps
1. Check server resources:
```bash
# Memory usage
free -m
# CPU usage
top -n 1
```

2. Monitor network stability:
```bash
ping -c 100 websocket-server.routopia.com | grep loss
```

3. Check connection limits:
```bash
# System limits
ulimit -n
# Redis connection count
redis-cli info clients
```

#### Common Solutions
1. Increase system limits:
```bash
# Edit system limits
sudo vim /etc/security/limits.conf
# Add:
* soft nofile 65535
* hard nofile 65535
```

2. Adjust heartbeat settings:
```typescript
const client = new RealTimeClient({
  heartbeatInterval: 15000,
  heartbeatTimeout: 45000
});
```

3. Enable connection debugging:
```typescript
const client = new RealTimeClient({
  debug: true,
  logger: console
});
```

## Performance Issues

### High Latency

#### Symptoms
- Message delivery delays
- Slow update propagation
- Increasing queue size

#### Diagnostic Steps
1. Check message queue metrics:
```bash
# Redis queue length
redis-cli llen realtime:queue

# Message rate
redis-cli info stats | grep ops
```

2. Monitor system metrics:
```bash
# CPU and memory
vmstat 1
# Network I/O
iotop
```

3. Check Prometheus metrics:
```bash
curl http://localhost:9090/metrics | grep realtime_latency
```

#### Common Solutions
1. Enable message batching:
```typescript
const service = new RealTimeService({
  batchSize: 100,
  batchInterval: 50
});
```

2. Optimize Redis configuration:
```conf
# redis.conf
maxmemory 2gb
maxmemory-policy allkeys-lru
```

3. Scale WebSocket servers:
```bash
# Update HAProxy configuration
vim /etc/haproxy/haproxy.cfg
service haproxy reload
```

### Memory Leaks

#### Symptoms
- Increasing memory usage
- Degraded performance over time
- OOM errors

#### Diagnostic Steps
1. Generate heap dump:
```bash
node --heapsnapshot realtime-server.js
```

2. Analyze memory usage:
```bash
# Node.js memory usage
node --inspect realtime-server.js

# System memory
watch -n 1 free -m
```

3. Check subscription leaks:
```bash
curl http://localhost:3000/metrics | grep subscriptions
```

#### Common Solutions
1. Implement proper cleanup:
```typescript
class RealTimeService {
  cleanup() {
    this.subscriptions.clear();
    this.messageQueue.clear();
    this.metrics.reset();
  }
}
```

2. Add memory limits:
```bash
# Docker memory limit
docker run --memory=2g realtime-server

# Node.js memory limit
node --max-old-space-size=2048 server.js
```

3. Enable automatic cleanup:
```typescript
const service = new RealTimeService({
  cleanupInterval: 300000,
  maxInactiveTime: 3600000
});
```

## Message Handling Issues

### Message Loss

#### Symptoms
- Updates not reaching clients
- Missing sequence numbers
- Inconsistent state

#### Diagnostic Steps
1. Enable message tracking:
```typescript
const service = new RealTimeService({
  messageTracking: true,
  trackingWindow: 3600
});
```

2. Check message queues:
```bash
# Redis queue status
redis-cli info persistence
redis-cli monitor | grep PUBLISH
```

3. Verify client subscriptions:
```typescript
service.getSubscriptions(clientId).then(console.log);
```

#### Common Solutions
1. Enable message persistence:
```typescript
const broker = new MessageBroker({
  persistence: true,
  retentionPeriod: '1h'
});
```

2. Implement message acknowledgment:
```typescript
client.on('message', async (msg) => {
  await client.acknowledge(msg.id);
});
```

3. Add message recovery:
```typescript
const client = new RealTimeClient({
  messageRecovery: true,
  recoveryWindow: 300000
});
```

### Rate Limiting Issues

#### Symptoms
- 429 Too Many Requests errors
- Dropped messages
- Throttled connections

#### Diagnostic Steps
1. Check rate limits:
```bash
# Current rate limits
curl http://localhost:3000/config/limits

# Rate limit metrics
curl http://localhost:3000/metrics | grep rate_limit
```

2. Monitor client behavior:
```typescript
client.on('rateLimit', (info) => {
  console.log('Rate limited:', info);
});
```

3. Analyze traffic patterns:
```bash
# Network traffic analysis
tcpdump -i any port 3000
```

#### Common Solutions
1. Adjust rate limits:
```typescript
const limiter = new RateLimiter({
  windowMs: 60000,
  maxRequests: 100,
  burstSize: 20
});
```

2. Implement backoff:
```typescript
const client = new RealTimeClient({
  backoff: {
    initial: 1000,
    max: 30000,
    factor: 2
  }
});
```

3. Add request prioritization:
```typescript
const service = new RealTimeService({
  prioritization: true,
  highPriorityTypes: ['ROUTE', 'WEATHER']
});
```

## Security Issues

### Authentication Failures

#### Symptoms
- 401 Unauthorized errors
- Token validation failures
- Connection rejections

#### Diagnostic Steps
1. Check token validity:
```bash
# Decode JWT
jwt decode <token>

# Verify token
jwt verify <token> <secret>
```

2. Monitor auth logs:
```bash
tail -f logs/auth.log | grep realtime
```

3. Test authentication flow:
```typescript
const token = await auth.generateToken(userId);
console.log(await auth.verifyToken(token));
```

#### Common Solutions
1. Refresh tokens automatically:
```typescript
const client = new RealTimeClient({
  autoRefresh: true,
  refreshThreshold: 300
});
```

2. Update token settings:
```typescript
const auth = new AuthService({
  tokenExpiration: '1h',
  refreshExpiration: '7d'
});
```

3. Enable secure transport:
```typescript
const server = new WebSocketServer({
  secure: true,
  cert: fs.readFileSync('server.crt'),
  key: fs.readFileSync('server.key')
});
```

## Monitoring and Debugging

### Enable Debug Mode
```typescript
// Server-side
const service = new RealTimeService({
  debug: true,
  logLevel: 'debug',
  metrics: true
});

// Client-side
const client = new RealTimeClient({
  debug: true,
  logger: console,
  metrics: true
});
```

### Common Metrics to Monitor
- Connection count
- Message throughput
- Error rates
- Latency percentiles
- Memory usage
- CPU utilization

### Logging Best Practices
1. Use structured logging:
```typescript
logger.info('Client connected', {
  clientId,
  timestamp: Date.now(),
  context: 'realtime'
});
```

2. Include correlation IDs:
```typescript
const correlationId = generateId();
logger.debug('Processing message', {
  messageId,
  correlationId,
  type: 'POI'
});
```

3. Set appropriate log levels:
```typescript
const logger = createLogger({
  development: {
    level: 'debug',
    format: 'pretty'
  },
  production: {
    level: 'info',
    format: 'json'
  }
});
```

## Recovery Procedures

### Server Recovery
1. Backup current state:
```bash
# Redis backup
redis-cli save
# Configuration backup
cp /etc/realtime/* /backup/
```

2. Stop services:
```bash
pm2 stop realtime-server
systemctl stop redis
```

3. Restore from backup:
```bash
# Redis restore
redis-cli flushall
redis-cli --pipe < dump.rdb
```

### Client Recovery
1. Implement automatic reconnection:
```typescript
const client = new RealTimeClient({
  autoReconnect: true,
  maxRetries: 5,
  retryDelay: 1000
});
```

2. Handle state recovery:
```typescript
client.on('reconnected', async () => {
  const state = await client.getState();
  await client.reconcile(state);
});
```

3. Enable offline mode:
```typescript
const client = new RealTimeClient({
  offlineSupport: true,
  syncOnReconnect: true
});
```

## Performance Optimization

### Message Optimization
1. Enable compression:
```typescript
const service = new RealTimeService({
  compression: true,
  compressionThreshold: 1024
});
```

2. Use binary protocols:
```typescript
const client = new RealTimeClient({
  binaryType: 'arraybuffer',
  protocol: 'protobuf'
});
```

3. Implement message filtering:
```typescript
client.subscribe(['POI'], {
  filter: (update) => {
    return update.confidence > 0.8;
  }
});
```

### Connection Optimization
1. Enable connection pooling:
```typescript
const pool = new ConnectionPool({
  min: 5,
  max: 20,
  idleTimeout: 60000
});
```

2. Use connection multiplexing:
```typescript
const client = new RealTimeClient({
  multiplexing: true,
  maxChannels: 4
});
```

3. Optimize heartbeat settings:
```typescript
const service = new RealTimeService({
  heartbeat: {
    interval: 15000,
    timeout: 45000,
    maxMissed: 3
  }
});
```

For more detailed information, see the [full documentation](./realtime-system.md). 