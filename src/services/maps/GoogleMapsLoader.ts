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
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY;
    if (!apiKey) {
      throw new Error('Google Maps API key not configured');
    }

    this.loader = new Loader({
      apiKey,
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
      this.loadPromise = this.loader.load().catch(error => {
        console.error('Failed to load Google Maps:', error);
        this.loadPromise = null;
        throw error;
      });
    }
    return this.loadPromise;
  }
}

export default GoogleMapsLoader; 