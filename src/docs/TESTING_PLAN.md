# Routopia Testing & Optimization Plan

## 1. Testing Infrastructure

### Directory Structure
```
src/
├── __tests__/
│   ├── unit/
│   │   ├── components/
│   │   │   ├── shared/
│   │   │   └── features/
│   │   ├── hooks/
│   │   └── utils/
│   ├── integration/
│   │   ├── routes/
│   │   ├── activities/
│   │   └── auth/
│   ├── e2e/
│   │   └── journeys/
│   └── __mocks__/
│       ├── services/
│       └── next-auth.ts
├── test-utils/
│   ├── setup.ts
│   ├── mocks.ts
│   └── fixtures.ts
└── playwright/
    ├── fixtures/
    └── specs/
```

### Test Configuration

```typescript
// jest.config.js
const nextJest = require('next/jest')

const createJestConfig = nextJest({
  dir: './',
})

const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/test-utils/setup.ts'],
  testEnvironment: 'jest-environment-jsdom',
  moduleNameMapper: {
    '^@/components/(.*)$': '<rootDir>/src/components/$1',
    '^@/services/(.*)$': '<rootDir>/src/services/$1',
    '^@/hooks/(.*)$': '<rootDir>/src/hooks/$1',
  },
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/*.stories.{ts,tsx}',
  ],
}

module.exports = createJestConfig(customJestConfig)
```

```typescript
// playwright.config.ts
import { PlaywrightTestConfig } from '@playwright/test'

const config: PlaywrightTestConfig = {
  testDir: './playwright/specs',
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
    video: 'on-first-retry',
  },
  projects: [
    {
      name: 'Chrome',
      use: { browserName: 'chromium' },
    },
    {
      name: 'Firefox',
      use: { browserName: 'firefox' },
    },
  ],
}

export default config
```

## 2. Test Examples

### Unit Tests

```typescript
// src/__tests__/unit/components/shared/MapView.test.tsx
import { render, screen, fireEvent } from '@testing-library/react'
import { MapView } from '@/components/shared/MapView'
import { mapboxService } from '@/services/mapbox/client'

jest.mock('@/services/mapbox/client')

describe('MapView', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('initializes map with correct props', () => {
    const center: [number, number] = [-74.5, 40]
    const zoom = 9
    
    render(<MapView center={center} zoom={zoom} />)
    
    expect(mapboxService.createMap).toHaveBeenCalledWith(
      expect.objectContaining({
        center,
        zoom,
      })
    )
  })

  it('handles map load callback', () => {
    const onMapLoad = jest.fn()
    render(<MapView onMapLoad={onMapLoad} />)
    
    // Simulate map load
    const map = mapboxService.createMap()
    map.fire('load')
    
    expect(onMapLoad).toHaveBeenCalledWith(map)
  })
})
```

### Integration Tests

```typescript
// src/__tests__/integration/routes/RoutePlanner.test.tsx
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { RoutePlannerPage } from '@/app/(dashboard)/route-planner/page'
import { routeService } from '@/services/api/routes'
import { weatherService } from '@/services/weather/client'

jest.mock('@/services/api/routes')
jest.mock('@/services/weather/client')

describe('Route Planning Flow', () => {
  it('creates and optimizes a route', async () => {
    const user = userEvent.setup()
    
    render(<RoutePlannerPage />)
    
    // Create route
    await user.click(screen.getByRole('button', { name: /create route/i }))
    
    // Add waypoints
    await user.click(screen.getByRole('button', { name: /add point/i }))
    
    // Optimize
    await user.click(screen.getByRole('button', { name: /optimize/i }))
    
    await waitFor(() => {
      expect(routeService.optimizeRoute).toHaveBeenCalled()
      expect(screen.getByText(/route optimized/i)).toBeInTheDocument()
    })
  })
})
```

### E2E Tests

```typescript
// playwright/specs/user-journey.spec.ts
import { test, expect } from '@playwright/test'

test('complete route planning journey', async ({ page }) => {
  // Login
  await page.goto('/')
  await page.click('text=Sign In')
  await page.fill('[name=email]', 'test@example.com')
  await page.fill('[name=password]', 'password123')
  await page.click('button[type=submit]')
  
  // Navigate to route planner
  await page.click('text=Route Planner')
  
  // Create route
  await page.click('text=Create Route')
  
  // Add waypoints
  await page.click('#map', { position: { x: 100, y: 100 } })
  await page.click('#map', { position: { x: 200, y: 200 } })
  
  // Save route
  await page.click('text=Save Route')
  
  // Verify route created
  await expect(page.locator('.route-list')).toContainText('New Route')
})
```

## 3. Error Boundaries

### Global Error Boundary

```typescript
// src/components/error/GlobalErrorBoundary.tsx
'use client'

import { Component, ReactNode } from 'react'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error?: Error
}

export class GlobalErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="error-boundary">
          <h2>Something went wrong</h2>
          <button onClick={() => window.location.reload()}>
            Try again
          </button>
        </div>
      )
    }

    return this.props.children
  }
}
```

### Feature-specific Error Boundaries

```typescript
// src/components/error/MapErrorBoundary.tsx
'use client'

import { Component, ReactNode } from 'react'

export class MapErrorBoundary extends Component<{ children: ReactNode }> {
  state = { hasError: false }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="map-error">
          <h3>Unable to load map</h3>
          <p>Please check your connection and try again</p>
          <button onClick={() => window.location.reload()}>
            Reload Map
          </button>
        </div>
      )
    }

    return this.props.children
  }
}
```

## 4. Performance Optimization

### Code Splitting

```typescript
// src/app/(dashboard)/layout.tsx
import dynamic from 'next/dynamic'

const CommandPalette = dynamic(
  () => import('@/components/layout/CommandPalette'),
  {
    loading: () => <div className="command-palette-skeleton" />,
    ssr: false,
  }
)

const AIChat = dynamic(
  () => import('@/components/shared/AIChat'),
  {
    loading: () => <div className="ai-chat-skeleton" />,
    ssr: false,
  }
)
```

### Data Prefetching

```typescript
// src/app/(dashboard)/route-planner/page.tsx
import { Suspense } from 'react'
import { getRoutes } from '@/services/api/routes'

async function RouteList() {
  const routes = await getRoutes()
  return (
    <ul>
      {routes.map(route => (
        <li key={route.id}>{route.name}</li>
      ))}
    </ul>
  )
}

export default function RoutePlannerPage() {
  return (
    <div>
      <Suspense fallback={<div>Loading routes...</div>}>
        <RouteList />
      </Suspense>
    </div>
  )
}
```

## 5. CI Pipeline Configuration

```yaml
# .github/workflows/test.yml
name: Test

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run linter
        run: npm run lint
      
      - name: Run unit tests
        run: npm run test:unit
      
      - name: Run integration tests
        run: npm run test:integration
      
      - name: Install Playwright
        run: npx playwright install --with-deps
      
      - name: Run E2E tests
        run: npm run test:e2e
      
      - name: Run Lighthouse
        run: npm run lighthouse
      
      - name: Upload coverage
        uses: codecov/codecov-action@v2
```

## 6. Performance Monitoring

```typescript
// src/utils/performance.ts
export function reportWebVitals(metric: any) {
  console.log(metric)
  
  // Send to analytics
  if (process.env.NEXT_PUBLIC_ANALYTICS_ID) {
    // Example with Google Analytics
    window.gtag('event', metric.name, {
      value: Math.round(metric.value),
      event_label: metric.id,
      non_interaction: true,
    })
  }
}
```

## Implementation Steps

1. **Week 1: Testing Setup**
   - Install testing dependencies
   - Set up Jest and Playwright
   - Create test utilities and helpers
   - Write first unit tests

2. **Week 2: Component Testing**
   - Write tests for shared components
   - Add integration tests for features
   - Set up CI pipeline
   - Add coverage reporting

3. **Week 3: E2E Testing**
   - Set up Playwright
   - Write core user journey tests
   - Add visual regression tests
   - Document testing patterns

4. **Week 4: Error Handling**
   - Implement error boundaries
   - Add fallback UIs
   - Set up error tracking
   - Test error scenarios

5. **Week 5: Performance**
   - Implement code splitting
   - Add performance monitoring
   - Optimize assets and loading
   - Document performance guidelines
</rewritten_file> 