# Routopia Real-Time System Code Examples

## Server-Side Examples

### Basic Server Setup with Clustering
```typescript
// server.ts
import cluster from 'cluster';
import { cpus } from 'os';
import { WebSocketServer } from 'ws';
import { RealTimeService } from './services/RealTimeService';
import { RedisMessageBroker } from './services/MessageBroker';
import { MetricsCollector } from './utils/metrics';

if (cluster.isPrimary) {
  // Fork workers for each CPU
  cpus().forEach(() => cluster.fork());

  cluster.on('exit', (worker, code, signal) => {
    console.log(`Worker ${worker.id} died. Restarting...`);
    cluster.fork();
  });
} else {
  const wss = new WebSocketServer({ port: 3000 });
  const broker = new RedisMessageBroker();
  const metrics = new MetricsCollector('realtime');
  const service = new RealTimeService(broker, metrics);

  wss.on('connection', (ws) => {
    service.handleConnection(ws);
  });

  // Graceful shutdown
  process.on('SIGTERM', async () => {
    await service.shutdown();
    process.exit(0);
  });
}
```

### Advanced Message Handling
```typescript
// messageHandler.ts
import { RealTimeUpdate, UpdateType } from './types';

class MessageHandler {
  private messageQueue: Map<string, RealTimeUpdate[]> = new Map();
  private batchSize = 10;
  private flushInterval = 100; // ms

  constructor() {
    setInterval(() => this.flushQueues(), this.flushInterval);
  }

  public queueMessage(clientId: string, update: RealTimeUpdate): void {
    let queue = this.messageQueue.get(clientId);
    if (!queue) {
      queue = [];
      this.messageQueue.set(clientId, queue);
    }

    queue.push(update);
    if (queue.length >= this.batchSize) {
      this.flushQueue(clientId);
    }
  }

  private async flushQueue(clientId: string): Promise<void> {
    const queue = this.messageQueue.get(clientId);
    if (!queue?.length) return;

    try {
      const client = await this.getClient(clientId);
      if (client) {
        const batch = {
          type: 'batch' as UpdateType,
          updates: queue,
          timestamp: Date.now()
        };
        client.send(JSON.stringify(batch));
      }
    } catch (error) {
      console.error(`Failed to flush queue for client ${clientId}:`, error);
    }

    this.messageQueue.delete(clientId);
  }

  private async flushQueues(): Promise<void> {
    const clients = Array.from(this.messageQueue.keys());
    await Promise.all(clients.map(clientId => this.flushQueue(clientId)));
  }
}
```

### Rate Limiting Implementation
```typescript
// rateLimiter.ts
class RateLimiter {
  private windowMs: number;
  private maxRequests: number;
  private requests: Map<string, number[]> = new Map();

  constructor(windowMs: number, maxRequests: number) {
    this.windowMs = windowMs;
    this.maxRequests = maxRequests;
    
    // Cleanup old requests
    setInterval(() => this.cleanup(), windowMs);
  }

  public async checkLimit(clientId: string): Promise<boolean> {
    const now = Date.now();
    let timestamps = this.requests.get(clientId) || [];
    
    // Remove old timestamps
    timestamps = timestamps.filter(time => now - time < this.windowMs);
    
    if (timestamps.length >= this.maxRequests) {
      return false;
    }

    timestamps.push(now);
    this.requests.set(clientId, timestamps);
    return true;
  }

  private cleanup(): void {
    const now = Date.now();
    for (const [clientId, timestamps] of this.requests.entries()) {
      const valid = timestamps.filter(time => now - time < this.windowMs);
      if (valid.length === 0) {
        this.requests.delete(clientId);
      } else {
        this.requests.set(clientId, valid);
      }
    }
  }
}
```

## Client-Side Examples

### React Integration
```typescript
// useRealTime.ts
import { useEffect, useRef, useState } from 'react';
import { RealTimeClient } from '@routopia/mcp-client';

interface UseRealTimeOptions {
  url: string;
  types: string[];
  onUpdate?: (update: any) => void;
  onError?: (error: Error) => void;
}

export function useRealTime({ url, types, onUpdate, onError }: UseRealTimeOptions) {
  const [isConnected, setIsConnected] = useState(false);
  const [isReconnecting, setIsReconnecting] = useState(false);
  const clientRef = useRef<RealTimeClient | null>(null);

  useEffect(() => {
    const client = new RealTimeClient({ url });
    clientRef.current = client;

    client.on('connected', () => {
      setIsConnected(true);
      setIsReconnecting(false);
      client.subscribe(types);
    });

    client.on('disconnected', () => {
      setIsConnected(false);
    });

    client.on('reconnecting', () => {
      setIsReconnecting(true);
    });

    client.on('update', (update) => {
      onUpdate?.(update);
    });

    client.on('error', (error) => {
      onError?.(error);
    });

    client.connect();

    return () => {
      client.disconnect();
    };
  }, [url]);

  return { isConnected, isReconnecting };
}

// Usage in component
function MapComponent() {
  const [pois, setPois] = useState([]);
  const [weather, setWeather] = useState(null);

  const { isConnected } = useRealTime({
    url: 'ws://localhost:3000/realtime',
    types: ['POI', 'WEATHER'],
    onUpdate: (update) => {
      switch (update.type) {
        case 'POI':
          setPois(prev => [...prev, update.data]);
          break;
        case 'WEATHER':
          setWeather(update.data);
          break;
      }
    },
    onError: (error) => {
      console.error('Real-time error:', error);
    }
  });

  return (
    <div>
      <div>Connection Status: {isConnected ? 'Connected' : 'Disconnected'}</div>
      <Map pois={pois} weather={weather} />
    </div>
  );
}
```

### Vue Integration
```typescript
// useRealTime.ts
import { ref, onMounted, onUnmounted } from 'vue';
import { RealTimeClient } from '@routopia/mcp-client';

export function useRealTime(url: string, types: string[]) {
  const client = ref<RealTimeClient | null>(null);
  const isConnected = ref(false);
  const isReconnecting = ref(false);
  const updates = ref<any[]>([]);

  onMounted(() => {
    client.value = new RealTimeClient({ url });

    client.value.on('connected', () => {
      isConnected.value = true;
      isReconnecting.value = false;
      client.value?.subscribe(types);
    });

    client.value.on('disconnected', () => {
      isConnected.value = false;
    });

    client.value.on('reconnecting', () => {
      isReconnecting.value = true;
    });

    client.value.on('update', (update) => {
      updates.value.push(update);
    });

    client.value.connect();
  });

  onUnmounted(() => {
    client.value?.disconnect();
  });

  return {
    isConnected,
    isReconnecting,
    updates
  };
}

// Usage in component
<script setup lang="ts">
import { useRealTime } from './useRealTime';

const { isConnected, updates } = useRealTime(
  'ws://localhost:3000/realtime',
  ['POI', 'WEATHER']
);
</script>

<template>
  <div>
    <div>Status: {{ isConnected ? 'Connected' : 'Disconnected' }}</div>
    <div v-for="update in updates" :key="update.timestamp">
      {{ update.type }}: {{ update.data }}
    </div>
  </div>
</template>
```

### Error Recovery
```typescript
// errorRecovery.ts
class ErrorRecoveryStrategy {
  private maxRetries: number;
  private backoffMs: number;
  private maxBackoffMs: number;
  private retryCount: number = 0;

  constructor(maxRetries = 5, initialBackoffMs = 1000, maxBackoffMs = 30000) {
    this.maxRetries = maxRetries;
    this.backoffMs = initialBackoffMs;
    this.maxBackoffMs = maxBackoffMs;
  }

  public async handleError(error: Error): Promise<boolean> {
    if (this.retryCount >= this.maxRetries) {
      return false;
    }

    const backoff = Math.min(
      this.backoffMs * Math.pow(2, this.retryCount),
      this.maxBackoffMs
    );

    await new Promise(resolve => setTimeout(resolve, backoff));
    this.retryCount++;

    return true;
  }

  public reset(): void {
    this.retryCount = 0;
  }
}

// Usage
const client = new RealTimeClient({
  url: 'ws://localhost:3000/realtime',
  errorRecovery: new ErrorRecoveryStrategy()
});
```

### Performance Optimization
```typescript
// optimizedClient.ts
class OptimizedRealTimeClient extends RealTimeClient {
  private updateBuffer: Map<string, RealTimeUpdate[]> = new Map();
  private processingInterval: number = 100;
  private maxBufferSize: number = 1000;

  constructor(options: RealTimeClientOptions) {
    super(options);
    this.startProcessing();
  }

  private startProcessing(): void {
    setInterval(() => this.processBuffer(), this.processingInterval);
  }

  private processBuffer(): void {
    for (const [type, updates] of this.updateBuffer.entries()) {
      if (updates.length > 0) {
        this.emit(type, updates);
        this.updateBuffer.set(type, []);
      }
    }
  }

  protected handleUpdate(update: RealTimeUpdate): void {
    let buffer = this.updateBuffer.get(update.type) || [];
    
    if (buffer.length >= this.maxBufferSize) {
      buffer = buffer.slice(-this.maxBufferSize);
    }
    
    buffer.push(update);
    this.updateBuffer.set(update.type, buffer);
  }
}
```

These examples demonstrate common patterns and best practices for using the real-time system. For more details, see the [full documentation](./realtime-system.md). 