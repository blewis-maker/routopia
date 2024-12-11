import { Loader } from '@googlemaps/js-api-loader';

const GOOGLE_MAPS_LIBRARIES = [
  'places',
  'geometry',
  'drawing',
  'visualization',
  'marker'
] as const;

class GoogleMapsLoader {
  private static instance: GoogleMapsLoader;
  private loader: Loader;
  private loadPromise: Promise<void> | null = null;

  private constructor() {
    this.loader = new Loader({
      apiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY || '',
      version: 'weekly',
      libraries: GOOGLE_MAPS_LIBRARIES,
      mapIds: [process.env.NEXT_PUBLIC_GOOGLE_MAP_ID || '']
    });
  }

  public static getInstance(): GoogleMapsLoader {
    if (!GoogleMapsLoader.instance) {
      GoogleMapsLoader.instance = new GoogleMapsLoader();
    }
    return GoogleMapsLoader.instance;
  }

  public async load(): Promise<void> {
    if (!this.loadPromise) {
      this.loadPromise = this.loader.load();
    }
    return this.loadPromise;
  }
}

export default GoogleMapsLoader; 