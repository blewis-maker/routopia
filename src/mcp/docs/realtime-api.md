# Routopia Real-Time API Reference

## WebSocket Endpoints

### Main WebSocket Connection
`ws://localhost:3000/realtime`

#### Connection Parameters
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| token | string | Yes | Authentication token |
| clientId | string | No | Client identifier for reconnection |
| version | string | No | API version (defaults to latest) |

## Message Types

### Client → Server Messages

#### Subscribe
```typescript
{
  action: 'subscribe',
  types: ('POI' | 'WEATHER' | 'TRAFFIC' | 'ROUTE')[],
  options?: {
    frequency?: 'high' | 'medium' | 'low',
    filters?: {
      bounds?: {
        north: number,
        south: number,
        east: number,
        west: number
      },
      categories?: string[],
      minConfidence?: number
    }
  }
}
```

#### Unsubscribe
```typescript
{
  action: 'unsubscribe',
  types: ('POI' | 'WEATHER' | 'TRAFFIC' | 'ROUTE')[]
}
```

#### Heartbeat
```typescript
{
  action: 'heartbeat',
  timestamp: number
}
```

### Server → Client Messages

#### POI Update
```typescript
{
  type: 'POI',
  data: {
    id: string,
    name: string,
    location: {
      lat: number,
      lng: number
    },
    category: string,
    recommendedActivities: string[],
    confidence: number,
    details: {
      description?: string,
      openingHours: string,
      amenities: string[],
      ratings?: {
        overall: number,
        aspects?: {
          safety?: number,
          accessibility?: number
        }
      }
    }
  },
  timestamp: number
}
```

#### Weather Update
```typescript
{
  type: 'WEATHER',
  data: {
    temperature: number,
    humidity: number,
    windSpeed: number,
    precipitation: number,
    conditions: string,
    visibility: number,
    alerts: Array<{
      type: string,
      severity: string,
      message: string,
      startTime: number,
      endTime: number
    }>,
    forecast: {
      hourly: Array<{
        time: number,
        temperature: number,
        precipitation: number,
        conditions: string
      }>,
      daily: Array<{
        date: string,
        highTemp: number,
        lowTemp: number,
        conditions: string
      }>
    }
  },
  timestamp: number
}
```

#### Traffic Update
```typescript
{
  type: 'TRAFFIC',
  data: {
    congestionLevel: 'low' | 'moderate' | 'high' | 'severe',
    averageSpeed: number,
    incidents: Array<{
      type: string,
      severity: string,
      location: {
        lat: number,
        lng: number
      },
      description: string,
      startTime: number,
      expectedDuration: number
    }>,
    segments: Array<{
      startPoint: {
        lat: number,
        lng: number
      },
      endPoint: {
        lat: number,
        lng: number
      },
      congestionLevel: string,
      averageSpeed: number,
      travelTime: number
    }>
  },
  timestamp: number
}
```

#### Route Update
```typescript
{
  type: 'ROUTE',
  data: {
    id: string,
    status: 'active' | 'completed' | 'cancelled',
    segments: Array<{
      id: string,
      startPoint: {
        lat: number,
        lng: number
      },
      endPoint: {
        lat: number,
        lng: number
      },
      distance: number,
      duration: number,
      activity: string,
      conditions: {
        weather: {
          temperature: number,
          conditions: string
        },
        traffic?: {
          congestionLevel: string,
          delay: number
        }
      }
    }>,
    metrics: {
      totalDistance: number,
      totalDuration: number,
      elevationGain: number,
      elevationLoss: number
    }
  },
  timestamp: number
}
```

## Error Codes

| Code | Name | Description |
|------|------|-------------|
| 1000 | NORMAL_CLOSURE | Normal connection closure |
| 1001 | GOING_AWAY | Server is shutting down or client is navigating away |
| 1002 | PROTOCOL_ERROR | Protocol error in message format |
| 1003 | UNSUPPORTED_DATA | Received data type cannot be accepted |
| 1008 | POLICY_VIOLATION | Message violates server policy |
| 1011 | INTERNAL_ERROR | Server encountered an error |
| 4000 | INVALID_TOKEN | Authentication token is invalid or expired |
| 4001 | RATE_LIMITED | Client has exceeded rate limits |
| 4002 | INVALID_SUBSCRIPTION | Subscription request is invalid |
| 4003 | MAX_SUBSCRIPTIONS | Client has reached maximum subscriptions |
| 4004 | INVALID_MESSAGE | Message format is invalid |

## Rate Limits

| Operation | Limit | Window | Notes |
|-----------|-------|--------|-------|
| Connections | 100 | per minute per IP | |
| Messages | 100 | per second per client | |
| Subscriptions | 10 | concurrent per client | |
| Updates | 50 | per second per subscription | |

## Metrics

### Available Metrics
| Metric | Type | Description |
|--------|------|-------------|
| connections_total | Counter | Total connection attempts |
| connections_active | Gauge | Currently active connections |
| messages_sent | Counter | Total messages sent |
| messages_received | Counter | Total messages received |
| errors_total | Counter | Total error count |
| subscription_count | Gauge | Active subscriptions |
| message_latency | Histogram | Message delivery latency |
| memory_usage | Gauge | Server memory usage |

### Prometheus Endpoint
`GET /metrics`

Example response:
```text
# HELP realtime_connections_total Total WebSocket connections
# TYPE realtime_connections_total counter
realtime_connections_total 1234

# HELP realtime_messages_sent_total Total messages sent
# TYPE realtime_messages_sent_total counter
realtime_messages_sent_total 5678
```

## Health Check

### Endpoint
`GET /health`

Response:
```json
{
  "status": "healthy",
  "version": "1.0.0",
  "uptime": 123456,
  "connections": 100,
  "memory": {
    "used": 1234567,
    "total": 2345678
  }
}
```

## Authentication

### Headers
```typescript
{
  "Authorization": "Bearer <token>",
  "X-Client-ID": "<client_id>",
  "X-API-Version": "1.0"
}
```

### JWT Claims
```typescript
{
  "sub": string,      // Subject (user ID)
  "iat": number,      // Issued at
  "exp": number,      // Expiration
  "scope": string[],  // Subscription scopes
  "rate": {           // Rate limit overrides
    "messages": number,
    "subscriptions": number
  }
}
``` 