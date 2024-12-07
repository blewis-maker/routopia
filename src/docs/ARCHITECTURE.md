# Routopia Architecture Guide

## 1. Directory Structure

```
src/
├── app/                    # Next.js App Router pages
├── components/            # React components
├── context/              # Global state & providers
├── hooks/               # Custom React hooks
├── services/           # API & external services
├── styles/            # Global styles & themes
├── types/            # TypeScript definitions
├── utils/           # Utility functions
└── lib/            # Third-party library configs
```

### Detailed Structure

```
src/
├── app/
│   ├── (marketing)/
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── (dashboard)/
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   ├── route-planner/
│   │   ├── activity-hub/
│   │   └── poi-explorer/
│   └── api/
│       ├── auth/
│       ├── activities/
│       ├── routes/
│       └── weather/
│
├── components/
│   ├── layout/
│   │   ├── AppShell/
│   │   ���── NavigationBar/
│   │   └── CommandPalette/
│   ├── shared/
│   │   ├── MapView/
│   │   ├── WeatherWidget/
│   │   ├── AIChat/
│   │   └── ActivityTracker/
│   └── features/
│       ├── route-planner/
│       ├── activity-hub/
│       └── poi-explorer/
│
├── context/
│   ├── auth/
│   │   ├── AuthContext.tsx
│   │   └── AuthProvider.tsx
│   ├── theme/
│   │   ├── ThemeContext.tsx
│   │   └── ThemeProvider.tsx
│   └── ai/
│       ├── AIChatContext.tsx
│       └── AIChatProvider.tsx
│
├── hooks/
│   ├── auth/
│   │   └── useAuth.ts
│   ├── routes/
│   │   ├── useRoutePlanner.ts
│   │   └── useRouteOptimization.ts
│   └── shared/
│       ├── useMapbox.ts
│       └── useWeather.ts
│
├── services/
│   ├── api/
│   │   ├── activities.ts
│   │   ├── routes.ts
│   │   └── weather.ts
│   ├── mapbox/
│   │   └── client.ts
│   └── weather/
│       └── client.ts
│
├── styles/
│   ├── base/
│   ├── components/
│   ├── theme/
│   └── utils/
│
└── types/
    ├── api.ts
    ├── auth.ts
    ├── routes.ts
    └── weather.ts
```

## 2. Data Fetching Strategy

### Server Components (Default)
```typescript
// app/(dashboard)/route-planner/page.tsx
export default async function RoutePlannerPage() {
  // Fetch data at the page level
  const routes = await fetchRoutes();
  
  return (
    <Suspense fallback={<RoutesSkeleton />}>
      <RoutePlannerClient initialRoutes={routes} />
    </Suspense>
  );
}
```

### Client Components (When Needed)
```typescript
// components/features/route-planner/RoutePlannerClient.tsx
'use client';

export function RoutePlannerClient({ initialRoutes }) {
  const { routes, updateRoute } = useRoutes(initialRoutes);
  
  return (
    <div className="route-planner">
      <MapView routes={routes} />
      <Sidebar onRouteUpdate={updateRoute} />
    </div>
  );
}
```

## 3. State Management

### Global State (Context)
```typescript
// context/ai/AIChatContext.tsx
export const AIChatContext = createContext<AIChatContextType | null>(null);

export function AIChatProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);

  const value = {
    isOpen,
    messages,
    toggleChat: () => setIsOpen(prev => !prev),
    sendMessage: async (message: string) => {
      // Implementation
    }
  };

  return (
    <AIChatContext.Provider value={value}>
      {children}
    </AIChatContext.Provider>
  );
}
```

### Feature State (Hooks)
```typescript
// hooks/routes/useRouteOptimization.ts
export function useRouteOptimization() {
  const [optimizing, setOptimizing] = useState(false);
  const [route, setRoute] = useState<Route | null>(null);

  const optimizeRoute = async (params: OptimizationParams) => {
    setOptimizing(true);
    try {
      const optimizedRoute = await routeService.optimize(params);
      setRoute(optimizedRoute);
    } finally {
      setOptimizing(false);
    }
  };

  return { route, optimizing, optimizeRoute };
}
```

## 4. API Integration

### Service Layer
```typescript
// services/api/routes.ts
export class RouteService {
  private api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: '/api/routes',
    });
  }

  async getRoutes(): Promise<Route[]> {
    const { data } = await this.api.get<Route[]>('/');
    return data;
  }

  async optimize(params: OptimizationParams): Promise<Route> {
    const { data } = await this.api.post<Route>('/optimize', params);
    return data;
  }
}

export const routeService = new RouteService();
```

## 5. Component Organization

### Shared Components
```typescript
// components/shared/MapView/index.tsx
export function MapView({ 
  routes,
  onRouteSelect,
  ...props 
}: MapViewProps) {
  // Implementation
}

// components/shared/MapView/MapControls.tsx
export function MapControls({ 
  onZoomIn,
  onZoomOut,
  ...props 
}: MapControlsProps) {
  // Implementation
}
```

### Feature Components
```typescript
// components/features/route-planner/RouteList.tsx
export function RouteList({ 
  routes,
  onSelect,
  ...props 
}: RouteListProps) {
  // Implementation
}
```

## 6. Testing Strategy

### Directory Structure
```
src/
└── __tests__/
    ├── components/
    │   ├── shared/
    │   └── features/
    ├── hooks/
    ├── services/
    └── e2e/
```

### Component Tests
```typescript
// __tests__/components/shared/MapView.test.tsx
describe('MapView', () => {
  it('renders map with correct initial position', () => {
    // Test implementation
  });

  it('handles route selection', () => {
    // Test implementation
  });
});
```

## 7. Performance Optimization

### Code Splitting
```typescript
// app/(dashboard)/layout.tsx
const AIChat = dynamic(() => import('@/components/shared/AIChat'), {
  loading: () => <AIChatSkeleton />,
  ssr: false
});
```

### Route-Based Code Splitting
```typescript
// app/(dashboard)/route-planner/page.tsx
const RouteOptimizer = dynamic(() => 
  import('@/components/features/route-planner/RouteOptimizer')
);
```

## Implementation Steps

1. **Foundation (Week 1)**
   - Set up directory structure
   - Implement base components
   - Configure TypeScript and ESLint

2. **Core Features (Week 2)**
   - Implement authentication flow
   - Set up API routes
   - Create base layouts

3. **Feature Development (Week 3-4)**
   - Build route planner
   - Implement activity hub
   - Create POI explorer

4. **Integration & Polish (Week 5)**
   - Connect all features
   - Implement global state
   - Add error boundaries

5. **Testing & Optimization (Week 6)**
   - Write unit tests
   - Add E2E tests
   - Optimize performance

## Best Practices

1. **Component Design**
   - Use composition over inheritance
   - Keep components focused and small
   - Implement proper error boundaries

2. **State Management**
   - Use server components by default
   - Lift state only when necessary
   - Implement proper loading states

3. **Performance**
   - Implement proper caching strategies
   - Use React.memo for expensive renders
   - Optimize images and assets

4. **Type Safety**
   - Use strict TypeScript settings
   - Implement proper API types
   - Use Zod for runtime validation
</rewritten_file> 