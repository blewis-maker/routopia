import { Loader } from '@googlemaps/js-api-loader';

class GoogleMapsLoader {
  private static instance: GoogleMapsLoader;
  private loader: Loader;
  private loadPromise: Promise<typeof google> | null = null;

  private constructor() {
    const googleMapsKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY;
    if (!googleMapsKey) {
      throw new Error('Google Maps API key not found');
    }

    this.loader = new Loader({
      apiKey: googleMapsKey,
      version: 'weekly',
      libraries: ['places', 'visualization', 'geometry']
    });
  }

  public static getInstance(): GoogleMapsLoader {
    if (!GoogleMapsLoader.instance) {
      GoogleMapsLoader.instance = new GoogleMapsLoader();
    }
    return GoogleMapsLoader.instance;
  }

  public async load(): Promise<typeof google> {
    if (!this.loadPromise) {
      this.loadPromise = this.loader.load();
    }
    return this.loadPromise;
  }
}

export default GoogleMapsLoader; 