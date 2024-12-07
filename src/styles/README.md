# Routopia Styles Guide

## Directory Structure

```
src/styles/
├── base/                  # Base styles and resets
│   ├── globals.css       # Global styles and CSS reset
│   ├── typography.css    # Typography styles
│   └── animations.css    # Global animations
├── components/           # Component-specific styles
│   ├── route/           # Route-related components
│   │   ├── RouteDrawing.css
│   │   ├── RouteLayer.css
│   │   └── RouteVisualization.css
│   ├── map/            # Map-related components
│   │   ├── POIMarkers.css
│   │   └── WeatherOverlay.css
│   └── features/       # Feature components
│       ├── ActivityTracker.css
│       ├── AdvancedFeatures.css
│       └── PlaceReviews.css
├── theme/              # Theme configuration
│   ├── theme.config.ts # Theme tokens and configuration
│   ├── themeProvider.tsx # Theme context provider
│   └── index.ts       # Theme exports
└── utils/             # Utility styles
    └── utils.module.css # Utility classes
```

## Usage Guidelines

### Importing Styles

1. **Component Styles**: Import directly from the components directory
   ```typescript
   import '@/styles/components/features/ActivityTracker.css';
   ```

2. **Theme Usage**: Import from theme directory
   ```typescript
   import { useTheme } from '@/styles/theme';
   ```

3. **Base Styles**: These are automatically imported in `src/styles/index.ts`

### Theme System

#### Color System
```css
/* Brand Colors */
--color-primary: #2BAF9D;      /* Teal */
--color-secondary: #3BA47A;    /* Emerald */

/* Background Colors */
--background-primary: #FFFFFF;  /* Light mode */
--background-secondary: #F8FAFC;
--background-tertiary: #F1F5F9;

/* Text Colors */
--text-primary: #0F172A;
--text-secondary: #334155;
--text-tertiary: #64748B;
```

#### Dark Mode
Dark mode colors are automatically applied when the `[data-theme="dark"]` attribute is present on the HTML element:
```css
[data-theme="dark"] {
  --background-primary: #0F172A;
  --background-secondary: #1E293B;
  --text-primary: #F8FAFC;
  /* etc... */
}
```

### Typography System

#### Font Families
- Primary: Montserrat (Headings)
- Secondary: Inter (Body text)

#### Font Sizes
```css
--font-xs: 0.75rem;    /* 12px */
--font-sm: 0.875rem;   /* 14px */
--font-base: 1rem;     /* 16px */
--font-lg: 1.125rem;   /* 18px */
--font-xl: 1.25rem;    /* 20px */
--font-2xl: 1.5rem;    /* 24px */
--font-3xl: 1.875rem;  /* 30px */
--font-4xl: 2.25rem;   /* 36px */
```

### Responsive Design

#### Breakpoints
```css
/* Mobile First Approach */
@media (min-width: 640px) { /* sm */ }
@media (min-width: 768px) { /* md */ }
@media (min-width: 1024px) { /* lg */ }
@media (min-width: 1280px) { /* xl */ }
```

#### Container Sizes
```css
.container {
  width: 100%;
  margin-left: auto;
  margin-right: auto;
  padding-left: 1rem;
  padding-right: 1rem;
}

@media (min-width: 640px) { .container { max-width: 640px; } }
@media (min-width: 768px) { .container { max-width: 768px; } }
@media (min-width: 1024px) { .container { max-width: 1024px; } }
@media (min-width: 1280px) { .container { max-width: 1280px; } }
```

### Animation System

#### Predefined Animations
```css
.animate-fade-in { animation: fadeIn 0.5s ease-out; }
.animate-slide-up { animation: slideUp 0.5s ease-out; }
.animate-bounce-slow { animation: bounce 2s infinite; }
.animate-gradient-text { animation: gradientText 4s ease infinite; }
```

### Best Practices

1. **Component Styling**
   - Keep component styles in their respective directories
   - Use BEM naming convention for component classes
   - Avoid deep nesting (max 3 levels)

2. **Theme Usage**
   - Always use CSS variables from theme.config.ts
   - Use semantic color names (e.g., `--text-primary` instead of `--gray-900`)
   - Test both light and dark modes

3. **Responsive Design**
   - Use mobile-first approach
   - Utilize predefined breakpoints
   - Test on multiple screen sizes

4. **Performance**
   - Minimize CSS bundle size
   - Use CSS modules for scoped styles
   - Avoid unnecessary animations on mobile

5. **Naming Conventions**
   - Component classes: `component-name__element--modifier`
   - Utility classes: `u-utilityName`
   - Theme variables: `--category-name`
   - Data attributes: `data-component="name"`

6. **CSS Modules Usage**
   ```typescript
   // Component.module.css
   .container { /* styles */ }
   
   // Component.tsx
   import styles from './Component.module.css';
   
   return <div className={styles.container}>...</div>;
   ```

### Common Patterns

1. **Gradients**
   ```css
   .gradient-brand {
     @apply bg-gradient-to-r from-teal-400 to-emerald-400;
   }
   ```

2. **Glass Effect**
   ```css
   .glass-effect {
     @apply bg-white/10 backdrop-blur-lg;
   }
   ```

3. **Card Shadows**
   ```css
   .card-shadow {
     @apply shadow-lg shadow-stone-900/5;
   }
   ```