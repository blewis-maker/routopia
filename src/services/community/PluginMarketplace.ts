interface Plugin {
  id: string;
  name: string;
  version: string;
  author: string;
  description: string;
  downloads: number;
  rating: number;
  reviews: Review[];
  dependencies: string[];
  tags: string[];
}

interface Review {
  userId: string;
  rating: number;
  comment: string;
  date: Date;
}

interface SearchOptions {
  query?: string;
  tags?: string[];
  sortBy?: 'downloads' | 'rating' | 'date';
  page?: number;
  limit?: number;
}

export class PluginMarketplace {
  private plugins: Map<string, Plugin>;
  private userVotes: Map<string, Map<string, number>>;
  private featureRequests: Map<string, number>;

  constructor() {
    this.plugins = new Map();
    this.userVotes = new Map();
    this.featureRequests = new Map();
  }

  async searchPlugins(options: SearchOptions): Promise<Plugin[]> {
    let results = Array.from(this.plugins.values());

    if (options.query) {
      results = this.filterByQuery(results, options.query);
    }

    if (options.tags) {
      results = this.filterByTags(results, options.tags);
    }

    results = this.sortPlugins(results, options.sortBy || 'downloads');

    if (options.page && options.limit) {
      const start = (options.page - 1) * options.limit;
      results = results.slice(start, start + options.limit);
    }

    return results;
  }

  async submitPlugin(plugin: Omit<Plugin, 'id' | 'downloads' | 'rating' | 'reviews'>): Promise<string> {
    const id = this.generatePluginId();
    const newPlugin: Plugin = {
      ...plugin,
      id,
      downloads: 0,
      rating: 0,
      reviews: []
    };

    await this.validatePlugin(newPlugin);
    this.plugins.set(id, newPlugin);
    return id;
  }

  async submitReview(pluginId: string, review: Omit<Review, 'date'>): Promise<void> {
    const plugin = this.plugins.get(pluginId);
    if (!plugin) throw new Error('Plugin not found');

    plugin.reviews.push({
      ...review,
      date: new Date()
    });

    this.updatePluginRating(pluginId);
  }

  async voteForFeature(featureId: string, userId: string): Promise<void> {
    if (!this.userVotes.has(featureId)) {
      this.userVotes.set(featureId, new Map());
    }

    const featureVotes = this.userVotes.get(featureId)!;
    if (!featureVotes.has(userId)) {
      featureVotes.set(userId, 1);
      this.incrementFeatureVotes(featureId);
    }
  }

  private filterByQuery(plugins: Plugin[], query: string): Plugin[] {
    const lowercaseQuery = query.toLowerCase();
    return plugins.filter(plugin =>
      plugin.name.toLowerCase().includes(lowercaseQuery) ||
      plugin.description.toLowerCase().includes(lowercaseQuery)
    );
  }

  private filterByTags(plugins: Plugin[], tags: string[]): Plugin[] {
    return plugins.filter(plugin =>
      tags.every(tag => plugin.tags.includes(tag))
    );
  }

  private sortPlugins(plugins: Plugin[], sortBy: string): Plugin[] {
    return plugins.sort((a, b) => {
      switch (sortBy) {
        case 'downloads':
          return b.downloads - a.downloads;
        case 'rating':
          return b.rating - a.rating;
        case 'date':
          return new Date(b.reviews[0]?.date || 0).getTime() -
                 new Date(a.reviews[0]?.date || 0).getTime();
        default:
          return 0;
      }
    });
  }

  private generatePluginId(): string {
    // Implementation of ID generation
    return '';
  }

  private async validatePlugin(plugin: Plugin): Promise<void> {
    // Implementation of plugin validation
  }

  private updatePluginRating(pluginId: string): void {
    // Implementation of rating update
  }

  private incrementFeatureVotes(featureId: string): void {
    // Implementation of vote increment
  }
} 