# Visual Testing Guide for Routopia

## Tools & Infrastructure

1. **Storybook**
   - Development environment for UI components
   - Access at `http://localhost:6006`
   - Run with `npm run storybook`

2. **Percy**
   - Visual regression testing
   - Integrated with CI pipeline
   - Run with `npm run test:visual`

3. **Manual Testing Checklist**
   - Run app locally with `npm run dev`
   - Access at `http://localhost:3000`

## Testing Checklist

### 1. Component Visual Testing

#### Layout Components
- [ ] AppShell renders correctly in all breakpoints
- [ ] NavigationBar is responsive and maintains proper spacing
- [ ] Sidebar collapses/expands smoothly
- [ ] Command palette appears centered with proper overlay

#### Map Components
- [ ] MapView loads and displays correctly
- [ ] Markers appear with proper icons and labels
- [ ] Route lines render with correct colors and widths
- [ ] Weather overlay is visible and properly positioned
- [ ] POI markers cluster appropriately at different zoom levels

#### Feature Components
- [ ] ActivityTracker displays stats in a clear layout
- [ ] Route planner tools are properly aligned
- [ ] Weather widget shows all information clearly
- [ ] AI chat interface maintains proper spacing

### 2. Responsive Design

#### Mobile (< 640px)
- [ ] Navigation is accessible through hamburger menu
- [ ] Map controls are touch-friendly
- [ ] Forms are usable on small screens
- [ ] No horizontal scrolling
- [ ] Text remains readable

#### Tablet (640px - 1024px)
- [ ] Sidebar behavior is appropriate
- [ ] Grid layouts adjust properly
- [ ] Map and content balance is maintained
- [ ] Touch targets are properly sized

#### Desktop (> 1024px)
- [ ] Layout utilizes space effectively
- [ ] Advanced features are easily accessible
- [ ] Multi-column layouts are properly aligned
- [ ] Hover states work correctly

### 3. Theme Testing

#### Light Theme
- [ ] All text is readable
- [ ] Proper contrast ratios maintained
- [ ] Icons are visible
- [ ] Shadows and depth cues are appropriate

#### Dark Theme
- [ ] No harsh color transitions
- [ ] Maps and overlays adjust properly
- [ ] System preferences are respected
- [ ] All states (hover, active, disabled) are visible

### 4. Animation & Interactions

- [ ] Route drawing animations are smooth
- [ ] Marker placement has proper feedback
- [ ] Modal transitions are fluid
- [ ] Loading states are informative
- [ ] Error states are clearly visible
- [ ] Success feedback is noticeable

### 5. Cross-browser Testing

#### Chrome
- [ ] All features work as expected
- [ ] Performance is smooth
- [ ] No console errors

#### Firefox
- [ ] Map renders correctly
- [ ] Animations work properly
- [ ] Forms behave consistently

#### Safari
- [ ] iOS-specific behaviors work
- [ ] Gestures are properly handled
- [ ] No visual artifacts

### 6. Accessibility

- [ ] Proper heading hierarchy
- [ ] ARIA labels are meaningful
- [ ] Keyboard navigation works
- [ ] Screen reader compatibility
- [ ] Color contrast meets WCAG standards
- [ ] Focus states are visible

## Running Visual Tests

```bash
# Start Storybook
npm run storybook

# Run Percy visual regression tests
npm run test:visual

# Run local development server
npm run dev
```

## CI Integration

Visual tests are automatically run:
1. On pull requests
2. After merging to main
3. Before deployments

## Reporting Issues

When reporting visual issues:
1. Screenshot the problem
2. Note the browser and device
3. Steps to reproduce
4. Expected vs actual appearance
5. Link to Storybook story if applicable
``` 