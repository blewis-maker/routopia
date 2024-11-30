# Routopia Features Documentation

## Core Components

### Navigation System
- 🚧 Fixed position header with blur effect
- Components:
  - 🚧 Logo with SVG icon
  - 🚧 Gradient text effect for "Routopia"
  - ⬜ Navigation links (Discover, Routes, Profile)
  - ⬜ Activity type selector
  - 🚧 Sign In/Profile button

### Map System (`src/components/map/`)
- ✅ Interactive Mapbox integration
- ⬜ Multi-mode visualization
- Components:
  - ✅ MapView.tsx (base map component)
  - ⬜ RouteLayer.tsx (route visualization)
  - ⬜ ElevationLayer.tsx (for ski/bike routes)
  - ⬜ POIMarkers.tsx (nodes/points of interest)
  - ⬜ WeatherOverlay.tsx

### AI Assistant System (`src/components/ai/`)
- ⬜ Chat interface for route planning
- Components:
  - ⬜ ChatInterface.tsx
  - ⬜ SuggestionBubble.tsx
  - ⬜ ContextDisplay.tsx
  - ⬜ PreferenceManager.tsx

### Route Management (`src/components/routes/`)
- ⬜ Route type-specific interfaces
- Components:
  - ⬜ RouteBuilder.tsx
  - ⬜ RouteDetails.tsx
  - ⬜ ActivityMetrics.tsx
  - ⬜ NodeManager.tsx

### Activity Tracking (`src/components/activity/`)
- ⬜ Performance monitoring
- Components:
  - ⬜ PerformanceMetrics.tsx
  - ⬜ ActivityHistory.tsx
  - ⬜ TrainingIntegration.tsx
  - ⬜ DeviceSync.tsx

## Pages

### Landing Page (`src/app/page.tsx`)
- ✅ Activity showcase
- ⬜ Quick route creation
- ⬜ Recent routes display
- ⬜ Weather integration

### Route Planning (`src/app/routes/`)
- ⬜ Activity-specific views
- ⬜ Real-time conditions
- ⬜ AI assistance integration
- ⬜ Route customization

### Profile Dashboard (`src/app/profile/`)
- ⬜ User preferences
- ⬜ Activity history
- ⬜ Saved routes
- ⬜ Device management

## Systems

### Auth System
- ✅ NextAuth setup
- ✅ Google OAuth provider
- ⬜ Apple OAuth provider
- ⬜ Email provider
- ✅ Protected routes
- ✅ User sessions

### AI Integration
- ⬜ Natural language processing
- ⬜ Context awareness
- ⬜ Real-time monitoring
- ⬜ Alert system

### External Integrations
- ⬜ Weather services
- ⬜ Traffic monitoring
- ⬜ Device connectivity
- ⬜ POI Services

### State Management
- ✅ User context
- ⬜ Route state
- ⬜ Activity monitoring
- ⬜ Real-time updates

## Route Types

### Car Routes
- ⬜ Traffic monitoring
- ⬜ POI integration
- ⬜ Budget-aware stops
- ⬜ Real-time alerts

### Bike Routes
- ⬜ Training integration
- ⬜ Elevation profiles
- ⬜ Performance tracking
- ⬜ Weather optimization

### Ski Routes
- ⬜ Resort integration
- ⬜ Trail mapping
- ⬜ Condition monitoring
- ⬜ Performance tracking

## Development Status

✅ Implemented:
- Map integration
- Database setup
- Initial schema
- Landing page design
- Sign-in modal structure

🚧 In Progress:
- Basic navigation
- Auth system setup
- Google OAuth integration
- User sessions
- Apple OAuth integration
- Email authentication
- Route planning interface
- Activity type selection
- Real-time monitoring

⬜ Pending:
- AI chat components
- Activity-specific routes
- External API integration
- Weather integration
- Device connectivity