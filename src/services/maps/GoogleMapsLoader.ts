import { Loader } from '@googlemaps/js-api-loader';

class GoogleMapsLoader {
  private static instance: GoogleMapsLoader;
  private loader: Loader;
  private loadPromise: Promise<void> | null = null;

  private constructor() {
    const googleMapsKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY;
    if (!googleMapsKey) {
      throw new Error('Google Maps API key not found');
    }

    this.loader = new Loader({
      apiKey: googleMapsKey,
      version: 'weekly',
      libraries: ['places', 'visualization', 'geometry', 'elevation']
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

  public async importLibrary(name: string): Promise<any> {
    await this.load();
    return this.loader.importLibrary(name);
  }
}

export default GoogleMapsLoader; 