# Component Structure Cleanup Checklist

## Phase 1: Analysis & Documentation 📊
### Directory Analysis
- [x] Generate initial directory tree
- [x] Document component counts per directory
- [🔄] Identify component relationships

### Component Relationships
#### Activity System
- ActivityControls.tsx
  - Depends on: ActivitySelector.tsx
  - Used by: PreferencePanel.tsx
  - Affected by: ConstraintManager.tsx

- ActivitySelector.tsx
  - Used by: PreferencePanel.tsx, ActivityControls.tsx
  - Affects: Activity system configuration

- ConstraintManager.tsx
  - Affects: ActivityControls.tsx
  - Used by: PreferencePanel.tsx
  - Integrates with: Activity validation system

- PreferencePanel.tsx
  - Uses: ActivitySelector.tsx
  - Affects: ConstraintManager.tsx
  - Configures: Activity system settings

#### AI System
- GPTTest.tsx
  - Integrates with: ChatInterface.tsx
  - Depends on: PredictiveRoutingPanel.tsx
  - Used by: AI-powered features

#### Feature Management
- FeatureManager.tsx
  - Controls: Feature flags across application
  - Used by: Multiple components for feature availability
  - Styles: FeatureManager.styles.ts

- PredictiveRoutingPanel.tsx
  - Depends on: FeatureManager.tsx
  - Integrates with: GPTTest.tsx
  - Affects: Route planning features

#### Display & Visualization System
- ElevationProfile.tsx
  - Integrates with: Route planning system
  - Used by: Route details views
  - Depends on: Route data services

- POICard.tsx
  - Used by: Map overlay system
  - Integrates with: Place details
  - Affects: Map interaction layer

- TrafficVisualization.tsx
  - Depends on: Map services
  - Integrates with: Real-time traffic data
  - Used by: Route planning system

- WeatherOverlay.tsx
  - Integrates with: Weather services
  - Used by: Map visualization
  - Affects: Route recommendations

- WeatherVisualization.tsx
  - Depends on: Weather services
  - Used by: Route planning, Activity planning
  - Affects: User recommendations

#### Chat System
- ChatInput.tsx
  - Used by: ChatWindow.tsx
  - Integrates with: ChatInterface.tsx
  - Affects: Message composition

- ChatInterface.tsx
  - Manages: Overall chat system
  - Uses: ChatInput.tsx, ChatMessages.tsx
  - Integrates with: GPTTest.tsx
  - Parent: ChatWindow.tsx

- ChatMessages.tsx
  - Used by: ChatInterface.tsx
  - Displays: Message history
  - Affects: Chat scroll behavior

- ChatWindow.tsx
  - Contains: ChatInterface.tsx
  - Manages: Chat UI state
  - Controls: Chat visibility

#### Social & Community System
- ChallengeDashboard.tsx
  - Integrates with: SocialChallenge.tsx
  - Uses: CommunityDashboard.tsx
  - Affects: User engagement features

- CommunityDashboard.tsx
  - Manages: Community features
  - Uses: FeatureVoting.tsx, RouteSharing.tsx
  - Displays: Community activity

- EnhancedFeatureVoting.tsx
  - Extends: FeatureVoting.tsx
  - Uses: FeatureManager.tsx
  - Integrates with: MarketplaceVoting.tsx

- FeatureVoting.tsx
  - Used by: CommunityDashboard.tsx
  - Base for: EnhancedFeatureVoting.tsx
  - Affects: Feature prioritization

- MarketplaceVoting.tsx
  - Integrates with: EnhancedFeatureVoting.tsx
  - Uses: FeatureManager.tsx
  - Affects: Marketplace features

- RouteSharing.tsx
  - Used by: CommunityDashboard.tsx
  - Integrates with: Route system
  - Affects: Social features

- SocialChallenge.tsx
  - Used by: ChallengeDashboard.tsx
  - Integrates with: Activity system
  - Affects: Community engagement

#### Beta System
- BetaFeedback.tsx
  - Integrates with: Feedback system
  - Used by: Beta feature testing
  - Affects: Feature development cycle
  - Reports to: FeatureManager.tsx

#### Controls System
- SettingsMenu.tsx
  - Affects: Application configuration
  - Integrates with: PreferencePanel.tsx
  - Controls: User preferences
  - Used by: MainApplicationView.tsx

### Component Categorization
- [ ] Activity Components
  - [ ] ActivityControls.tsx
  - [ ] ActivitySelector.tsx
  - [ ] ConstraintManager.tsx
  - [ ] PreferencePanel.tsx

- [ ] AI Components
  - [ ] GPTTest.tsx

- [ ] App Components
  - [ ] MainApplicationView.tsx

- [ ] Beta Components
  - [ ] BetaFeedback.tsx

- [ ] Display & Visualization
  - [ ] ElevationProfile.tsx
  - [ ] POICard.tsx
  - [ ] TrafficVisualization.tsx
  - [ ] WeatherOverlay.tsx
  - [ ] WeatherVisualization.tsx

- [ ] Features
  - [ ] FeatureManager.tsx
  - [ ] FeatureManager.styles.ts
  - [ ] PredictiveRoutingPanel.tsx

- [ ] Controls
  - [ ] SettingsMenu.tsx

- [ ] Social & Community
  - [ ] ChallengeDashboard.tsx
  - [ ] CommunityDashboard.tsx
  - [ ] EnhancedFeatureVoting.tsx
  - [ ] FeatureVoting.tsx
  - [ ] MarketplaceVoting.tsx
  - [ ] RouteSharing.tsx
  - [ ] SocialChallenge.tsx

- [ ] Chat System
  - [ ] ChatInput.tsx
  - [ ] ChatInterface.tsx
  - [ ] ChatMessages.tsx
  - [ ] ChatWindow.tsx

## Phase 2: Component Reorganization 🔄
### Current Migration: MainApplicationView.tsx

#### Step 1: File Copy Commands
```bash
# Create directory
mkdir -p src/components/core/app

# Create backup
cp -r src/components/app/MainApplicationView* src/components/backup/

# Copy files
cp src/components/app/MainApplicationView.tsx src/components/core/app/
cp src/components/app/MainApplicationView.test.tsx src/components/core/app/
cp src/components/app/MainApplicationView.styles.ts src/components/core/app/

# Verify copy
ls -la src/components/core/app/
```

#### Step 2: Import Update Commands
```bash
# Search for files that need import updates
grep -r "from.*MainApplicationView" src/

# Update imports using sed (be careful with these commands)
sed -i 's|from "../../app/MainApplicationView"|from "../../core/app/MainApplicationView"|g' src/components/**/*.tsx
sed -i 's|from "../../app/MainApplicationView"|from "../../core/app/MainApplicationView"|g' src/components/**/*.ts
```

#### Step 3: Testing Commands
```bash
# Run unit tests
npm run test src/components/core/app/MainApplicationView.test.tsx

# Run integration tests
npm run test:integration

# Run linting
npm run lint src/components/core/app/MainApplicationView.tsx
```

#### Step 4: Cleanup Commands
```bash
# After successful testing, remove old files
rm src/components/app/MainApplicationView.tsx
rm src/components/app/MainApplicationView.test.tsx
rm src/components/app/MainApplicationView.styles.ts

# Verify removal
ls -la src/components/app/
```

## Current Status
- Phase: 2 - Reorganization
- Progress: Commands prepared for MainApplicationView.tsx migration
- Next Step: Execute Step 1 commands

## Notes
- Run commands one at a time
- Verify each step before proceeding
- Keep backup until complete verification
- Document any errors encountered