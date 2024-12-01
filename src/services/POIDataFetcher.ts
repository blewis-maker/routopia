import type { 
  POIData, 
  FetchConfig,
  DataSource,
  CacheConfig 
} from '@/types/poi';

export class POIDataFetcher {
  private dataSource: POIDataSource;
  private cacheManager: CacheManager;
  private dataTransformer: DataTransformer;

  async fetch(config: FetchConfig): Promise<POIData[]> {
    const cachedData = await this.checkCache(config);
    if (cachedData) return cachedData;

    const rawData = await this.fetchFromSources(config);
    const processedData = this.processData(rawData);
    
    await this.cacheData(config, processedData);
    return processedData;
  }

  private async fetchFromSources(config: FetchConfig): Promise<RawPOIData[]> {
    const sources = this.determineSources(config);
    const fetchPromises = sources.map(source => 
      this.dataSource.fetch(source, config)
    );

    return Promise.all(fetchPromises)
      .then(results => this.mergeResults(results))
      .catch(error => this.handleFetchError(error));
  }

  private processData(data: RawPOIData[]): POIData[] {
    return data.map(poi => ({
      id: this.generateUniqueId(poi),
      name: this.formatName(poi.name),
      location: this.normalizeLocation(poi.location),
      category: this.categorize(poi),
      details: this.extractDetails(poi),
      images: this.processImages(poi.images),
      ratings: this.normalizeRatings(poi.ratings)
    }));
  }
} 