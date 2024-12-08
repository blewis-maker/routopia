# Routopia Styles Guide

## Directory Structure

```
src/styles/
├── main.css              # Main entry point with Tailwind directives
├── base/                 # Base styles and resets
│   ├── typography.css    # Typography styles
│   └── animations.css    # Global animations
├── components/           # Component-specific styles
│   ├── layout/          # Layout components
│   │   ├── NavigationBar.css
│   │   └── AppShell.css
│   ├── route/           # Route-related components
│   └── features/        # Feature components
├── theme/               # Theme configuration
│   ├── variables.css    # CSS variables and theme tokens
│   └── index.ts        # Theme exports
├── utils/              # Utility styles
│   └── effects.css     # Reusable effects
└── animations/         # Animation system
    └── transitions.ts  # Programmatic animations
```

## Usage Guidelines

### Style Organization

1. **Main Entry Point**: All styles are imported through `main.css`
   ```css
   /* main.css */
   @tailwind base;
   @tailwind components;
   @tailwind utilities;
   
   @import './theme/variables.css';
   // Other imports...
   ```

2. **Component Styles**: Use the `@layer components` directive
   ```css
   @layer components {
     .component-name { ... }
   }
   ```

3. **Utility Classes**: Use the `@layer utilities` directive
   ```css
   @layer utilities {
     .utility-class { ... }
   }
   ```

### Animation System

1. **CSS Animations**: Use `animations.css` for static animations
   ```css
   .animate-fade-in { animation: fadeIn 0.5s ease-out; }
   ```

2. **Programmatic Animations**: Use `transitions.ts` for dynamic animations
   ```typescript
   import { transitions } from '@/styles/animations/transitions';
   ```

### Theme Usage

1. **CSS Variables**: Define in `theme/variables.css`
   ```css
   :root {
     --color-primary: theme('colors.teal.400');
   }
   ```

2. **Component Usage**: Use theme variables consistently
   ```css
   .component {
     color: var(--color-primary);
   }
   ```

## Best Practices

1. **File Organization**
   - Keep component styles in their respective directories
   - Use appropriate layer directives
   - Import all styles through main.css

2. **Naming Conventions**
   - Component classes: `component-name__element--modifier`
   - Utility classes: `utility-name`
   - Animation classes: `animate-name`

3. **Performance**
   - Use appropriate layer directives
   - Keep files modular and focused
   - Minimize style duplication