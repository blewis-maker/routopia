# Routopia Features Documentation

## Core Components

### Navigation (`src/components/Navigation.tsx`)
- Fixed position header with blur effect
- Responsive design
- Dynamic route highlighting
- Components:
  - Logo with SVG icon
  - Gradient text effect for "Routopia"
  - Navigation links (Discover, Routes, About)
  - Sign In button

### Map (`src/components/Map.tsx`)
- Interactive Mapbox integration
- Dark theme styling
- Features:
  - Route planning button
  - Location search
  - Route visualization
  - Waypoint management
- State Management:
  - Start location
  - End location
  - Waypoints array
  - Search panel visibility

### SearchBox (`src/components/SearchBox.tsx`)
- Mapbox Geocoding API integration
- Debounced search
- Features:
  - Auto-complete suggestions
  - Loading indicator
  - Error handling
  - Result selection

### RoutePanel (`src/components/RoutePanel.tsx`)
- Route planning interface
- Features:
  - Start location input
  - End location input
  - Waypoint management
  - Close/Cancel functionality

## Pages

### Landing Page (`src/app/page.tsx`)
- Full-screen design
- Components:
  - Background image with overlay
  - Main heading with gradient effect
  - Subheading
  - "Get Started" CTA button

### Map Page (`src/app/map/page.tsx`)
- Full-height map view
- Integrated map component
- Proper navigation spacing

## Utility Systems

### Asset Management
- Type-safe asset tracking
- Usage monitoring
- Duplicate detection
- File path validation

### Theme Configuration
- Color schemes
- Spacing constants
- Map styling defaults

## Current Working State
Last Updated: [Current Date]

✅ Working Features:
- Navigation bar with proper styling
- Landing page layout and design
- Basic map initialization
- Location search functionality
- Route planning UI

🚧 In Progress:
- Route visualization
- Waypoint management
- Direction calculations

## Known Issues
- [List any known issues or bugs here]

## Development Guidelines
1. Test new features in isolation before integration
2. Document new components and features in this file
3. Update the "Current Working State" section when making changes
4. Note any breaking changes or updates in the "Known Issues" section 