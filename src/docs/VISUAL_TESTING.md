# Visual Testing Guide: River-Tributary Route Visualization

This guide explains how to effectively use Storybook and Percy for testing the river-tributary route visualization components.

## Component Structure

The route visualization system consists of three main components:

1. **MapView**: Displays the main route (river) and its tributaries on a map
2. **RouteVisualization**: Sidebar panel showing the hierarchical structure
3. **CompositeRouteView**: Combines both components for a complete experience

## Running Storybook

To start Storybook locally:

```bash
npm run storybook
```

This will launch Storybook at http://localhost:6006

## Available Stories

### MapView Stories
- Default: Basic map setup
- WithTributaries: Shows main route with connected tributaries
- WithPOIs: Displays points of interest along tributaries
- InteractiveRoute: Demonstrates hover and click interactions

### RouteVisualization Stories
- Default: Shows the sidebar with collapsed tributaries
- WithSelectedTributary: Demonstrates expanded tributary view
- Empty: Shows the empty state

### Composite Stories
- RiverAndTributaries: Full implementation with map and sidebar
- EmptyRoute: Starting state for new route creation

## Visual Testing with Percy

We use Percy to capture and compare screenshots of our components in different states.

### Running Visual Tests

To run the visual tests locally:

```bash
npm run test:visual
```

This will:
1. Build Storybook
2. Start the Storybook server
3. Run Percy tests
4. Generate visual diffs

### Test Coverage

Our visual tests cover:

1. **Component States**
   - Default views
   - Interactive states (hover, selected)
   - Empty states
   - Loading states

2. **Interactions**
   - Tributary selection
   - POI selection
   - Hover effects

3. **Responsive Design**
   - Desktop (1920x1080)
   - Tablet (1024x768)
   - Mobile (375x812)

### Best Practices

1. **Component Testing**
   - Test each component in isolation first
   - Test composite views for integration
   - Verify all interactive states

2. **Visual Regression**
   - Review all Percy snapshots carefully
   - Pay attention to hover states and animations
   - Check responsive layouts

3. **Story Organization**
   - Keep stories focused and minimal
   - Use consistent naming conventions
   - Document key interactions

## Workflow Integration

The visual tests are integrated into our CI/CD pipeline:

1. Tests run automatically on pull requests
2. Percy generates visual diffs for review
3. Changes must be approved before merging

## Troubleshooting

Common issues and solutions:

1. **Missing Screenshots**
   - Ensure Storybook is running on port 6006
   - Check Percy token is set correctly
   - Verify test paths are correct

2. **Inconsistent Results**
   - Clear Storybook cache: `npm run clean-storybook`
   - Rebuild: `npm run build-storybook`
   - Check for animation-related issues

3. **Failed Tests**
   - Review Percy diffs carefully
   - Check for intentional vs unintentional changes
   - Verify viewport sizes match expectations

## Adding New Tests

When adding new components or features:

1. Create isolated component stories
2. Add composite stories if needed
3. Update visual tests to cover new cases
4. Document any special considerations

## Maintenance

Regular maintenance tasks:

1. Review and update baseline screenshots
2. Clean up unused stories
3. Verify test coverage
4. Update documentation as needed 