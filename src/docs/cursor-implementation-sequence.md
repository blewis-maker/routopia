# Cursor Implementation Sequence

## Step 1: Initial Review
```typescript
// First prompt to Cursor:
"Please review my current codebase and show me:
1. All files in src/components/map/
2. Current map initialization code
3. Any existing route visualization code
This will help ensure we preserve existing functionality."
```

## Step 2: Service Directory Setup
```typescript
// After reviewing current code:
"Let's set up the new services directory structure:

1. First, show me any existing service-related files
2. Then, create a new services/ directory with the following structure:
   - maps/
   - routing/
   - location/
   
Please show me the planned structure before implementing."
```

## Step 3: Google Maps Manager
```typescript
// After service directory is set up:
"Let's create the GoogleMapsManager.ts in the maps/ directory:

1. Show me the current map-related service files first
2. We'll keep all existing Mapbox functionality
3. Create GoogleMapsManager.ts with initial setup for:
   - Places API
   - Directions API
   - Traffic layer

Please show me your planned implementation before proceeding."
```

## Step 4: Map Integration Layer
```typescript
// After GoogleMapsManager is created:
"Let's create the MapIntegrationLayer.ts that will coordinate between Mapbox and Google:

1. Show me current map state management
2. Show me existing map event handlers
3. Create MapIntegrationLayer.ts that preserves current functionality while adding Google features

Please outline the planned class structure before implementing."
```

## Step 5: Route Processing Enhancement
```typescript
// After integration layer is set up:
"Let's enhance the route processing:

1. Show me current route handling code
2. Show me existing route data structures
3. Create new RouteProcessor.ts that:
   - Maintains current route logic
   - Adds Google's traffic data
   - Handles alternative routes

Please show planned implementation before proceeding."
```

## Step 6: Location Services Enhancement
```typescript
// After route processing is enhanced:
"Let's enhance location services:

1. Show current location handling code
2. Create GeocodingService.ts that:
   - Uses Google for primary geocoding
   - Keeps Mapbox as fallback
   - Handles POI data

Please outline the planned approach before implementing."
```

## Step 7: GPT Integration Enhancement
```typescript
// After location services are enhanced:
"Let's improve the GPT-to-map integration:

1. Show current GPT integration code
2. Show current route drawing implementation
3. Enhance GPT response processing to:
   - Extract route points
   - Handle waypoints
   - Process route preferences

Please show planned changes before implementing."
```

## Step 8: Route Visualization
```typescript
// After GPT integration is enhanced:
"Let's improve route visualization:

1. Show current route rendering code
2. Enhance visualization to:
   - Show traffic data
   - Display alternative routes
   - Handle waypoints
   - Keep existing style preferences

Please outline planned changes before proceeding."
```

## Step 9: Database Updates
```typescript
// After visualization is enhanced:
"Let's update the database schema:

1. Show current route-related models
2. Add new models for:
   - Route geometry
   - Traffic data
   - Alternative routes

Please show planned schema changes before implementing."
```

## Step 10: Testing & Verification
```typescript
// After all implementations:
"Let's verify everything works:

1. Show current test files
2. Create tests for:
   - Google services integration
   - Route processing
   - GPT integration
   - Visualization

Please outline test plan before implementing."
```

# Important Notes for Each Step

1. **Before Each Change**:
   - Always show existing code first
   - Outline planned changes
   - Wait for confirmation before implementing

2. **During Implementation**:
   - Keep existing functionality
   - Add new features alongside current ones
   - Maintain current styling and behavior

3. **After Each Change**:
   - Verify existing features still work
   - Test new functionality
   - Check for any styling issues

4. **Error Handling**:
   - Preserve current error handling
   - Add new error cases
   - Implement fallbacks

# Feature Flag Implementation

```typescript
// Implement at the start:
const MAP_FEATURE_FLAGS = {
  useGooglePlaces: true,
  useGoogleDirections: true,
  useTrafficData: true,
  useAlternativeRoutes: true
};
```

This allows easy toggling between old and new functionality during development.
