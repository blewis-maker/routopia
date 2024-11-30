# Routopia Features Documentation

## Core Components

### Navigation System
- Fixed position header with blur effect
- Dynamic route type highlighting (Car/Bike/Ski)
- Components:
  - Logo with SVG icon
  - Gradient text effect for "Routopia"
  - Navigation links (Discover, Routes, Profile)
  - Activity type selector
  - Sign In/Profile button

### Map System (`src/components/map/`)
- Interactive Mapbox integration
- Multi-mode visualization
- Components:
  - MapView.tsx (base map component)
  - RouteLayer.tsx (route visualization)
  - ElevationLayer.tsx (for ski/bike routes)
  - POIMarkers.tsx (nodes/points of interest)
  - WeatherOverlay.tsx
- Features:
  - Activity-specific styling
  - Elevation profile display
  - Real-time condition overlays
  - Multi-route visualization

### AI Assistant System (`src/components/ai/`)
- Chat interface for route planning
- Components:
  - ChatInterface.tsx
  - SuggestionBubble.tsx
  - ContextDisplay.tsx
  - PreferenceManager.tsx
- Features:
  - Natural language route planning
  - Contextual suggestions
  - Weather/condition alerts
  - Budget-aware recommendations

### Route Management (`src/components/routes/`)
- Route type-specific interfaces
- Components:
  - RouteBuilder.tsx
  - RouteDetails.tsx
  - ActivityMetrics.tsx
  - NodeManager.tsx
- Features:
  - Multi-point route planning
  - Activity-specific parameters
  - Real-time monitoring
  - Route history and saving

### Activity Tracking (`src/components/activity/`)
- Performance monitoring
- Components:
  - PerformanceMetrics.tsx
  - ActivityHistory.tsx
  - TrainingIntegration.tsx
  - DeviceSync.tsx

## Pages

### Landing Page (`src/app/page.tsx`)
- Activity showcase
- Quick route creation
- Recent routes display
- Weather integration

### Route Planning (`src/app/routes/`)
- Activity-specific views
- Real-time conditions
- AI assistance integration
- Route customization

### Profile Dashboard (`src/app/profile/`)
- User preferences
- Activity history
- Saved routes
- Device management

## Systems

### AI Integration
- Natural language processing
- Context awareness
- Real-time monitoring
- Alert system
- Integration points:
  - Route planning
  - Weather alerts
  - Traffic monitoring
  - POI suggestions

### External Integrations
- Weather services
- Traffic monitoring
- Device connectivity:
  - Hammerhead
  - Training Peaks
  - Strava
- POI Services:
  - Google Places
  - Yelp
  - AllTrails

### State Management
- User context
- Route state
- Activity monitoring
- Real-time updates

## Route Types

### Car Routes
- Features:
  - Traffic monitoring
  - POI integration
  - Budget-aware stops
  - Real-time alerts

### Bike Routes
- Features:
  - Training integration
  - Elevation profiles
  - Performance tracking
  - Weather optimization

### Ski Routes
- Features:
  - Resort integration
  - Trail mapping
  - Condition monitoring
  - Performance tracking

## Development Status

✅ Implemented:
- Basic navigation
- Map integration
- Initial route planning
- Location search
- Database setup
- Initial schema

🚧 In Progress:
- Auth system setup
- API route structure
- AI chat components
- Activity-specific routes
- Real-time monitoring
- External API integration

## Development Guidelines
1. Component Development:
   - Test in isolation
   - Document props and state
   - Include usage examples
   
2. AI Integration:
   - Test context awareness
   - Validate suggestions
   - Monitor performance

3. Route Type Development:
   - Implement core features first
   - Add type-specific features
   - Test transitions

4. Documentation:
   - Update feature list
   - Document API integrations
   - Note breaking changes

## Implementation Checklist
1. Database
   - ✅ Initial setup
   - ⬜ Add remaining models
   - ⬜ Add indexes
   - ⬜ Add constraints

2. Auth System
   - ⬜ NextAuth setup
   - ⬜ OAuth providers
   - ⬜ Protected routes
   - ⬜ User sessions

3. API Routes
   - ⬜ Auth endpoints
   - ⬜ Chat endpoints
   - ⬜ User endpoints
   - ⬜ Route endpoints

4. AI Integration
   - ⬜ Base components
   - ⬜ Chat interface
   - ⬜ Context management
   - ⬜ Route processing