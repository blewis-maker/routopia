# Routopia UI Integration Plan

## Primary Views Structure

### 1. Landing Experience (`/`)
```typescript
interface LandingStructure {
  components: {
    hero: {
      primary: 'LocationSearch',
      supporting: [
        'MapPreview',
        'ActivityTypeScroller',
        'QuickStart'
      ]
    },
    content: {
      sections: [
        'AIFeatureShowcase',
        'ActivityTypesGrid',
        'CommunityHighlights'
      ]
    }
  },
  enhancement: {
    interactions: {
      gestures: 'Touch-optimized controls',
      animations: 'Smooth transitions',
      feedback: 'Interactive responses'
    },
    accessibility: {
      standards: 'WCAG 2.1 AAA',
      features: [
        'Screen reader support',
        'Keyboard navigation',
        'High contrast mode'
      ]
    }
  }
}
```

### 2. Main Application View (`/app`)
```typescript
interface AppLayout {
  grid: {
    left: {
      component: 'ChatInterface',
      features: [
        'MessageHistory',
        'RouteGPT',
        'LocationSuggestions'
      ],
      state: 'collapsible'
    },
    center: {
      component: 'MapView',
      overlays: [
        'RouteLayer',
        'POIMarkers',
        'WeatherInfo'
      ]
    },
    right: {
      component: 'RoutePanel',
      features: [
        'RouteDetails',
        'ActivityMetrics',
        'Waypoints'
      ],
      state: 'collapsible'
    }
  },
  visualSystem: {
    components: {
      cards: 'Unified design system',
      buttons: 'Consistent interactions',
      inputs: 'Standardized forms'
    },
    animations: {
      duration: '300ms',
      easing: 'cubic-bezier(0.4, 0, 0.2, 1)'
    }
  }
}
```

### 3. Route Planning Interface (`/app/route`)
```typescript
interface RoutePlanningLayout {
  layout: {
    header: {
      components: [
        'ActivitySelector',
        'RouteOptions',
        'ShareControls'
      ]
    },
    main: {
      map: 'MapWithControls',
      sidebar: 'RouteBuilder',
      overlay: 'AIAssistant'
    },
    footer: {
      components: [
        'RouteMetrics',
        'WeatherInfo',
        'SaveOptions'
      ]
    }
  },
  adaptation: {
    viewport: {
      desktop: 'Optimized workspace',
      tablet: 'Touch-friendly layout',
      mobile: 'Essential features focus'
    },
    context: {
      activity: 'Mode-specific layouts',
      location: 'Context-aware views'
    }
  }
}
```

## Integration Strategy

### 1. Core Systems Integration
```typescript
interface SystemIntegration {
  features: {
    map: {
      interaction: '