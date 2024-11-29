interface ComponentRegistry {
  name: string;
  dependencies: string[];
  requiredBy: string[];
  path: string;
}

export const components: ComponentRegistry[] = [
  {
    name: 'Navigation',
    dependencies: ['next/link', 'next/navigation'],
    requiredBy: ['RootLayout'],
    path: 'src/components/Navigation.tsx'
  },
  {
    name: 'Map',
    dependencies: ['mapbox-gl', 'RoutePanel', 'SearchBox'],
    requiredBy: ['MapPage'],
    path: 'src/components/Map.tsx'
  },
  {
    name: 'RootLayout',
    dependencies: ['Navigation', './globals.css'],
    requiredBy: [],
    path: 'src/app/layout.tsx'
  }
]; 