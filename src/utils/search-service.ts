interface SearchResult {
  id: string;
  name: string;
  type: 'location' | 'route' | 'activity';
  coordinates: [number, number];
  description?: string;
  popularity?: number;
}

interface RecentSearch {
  id: string;
  query: string;
  timestamp: number;
  type: 'location' | 'route' | 'activity';
}

export const SearchService = {
  // Mock data for suggestions
  suggestions: [
    { id: '1', name: 'Central Park', type: 'location', coordinates: [-73.9665, 40.7829] },
    { id: '2', name: 'Hudson River Trail', type: 'route', coordinates: [-74.0060, 40.7128] },
    { id: '3', name: 'Mountain Biking', type: 'activity', coordinates: [-74.1155, 40.7128] },
  ],

  // Get search suggestions
  async getSuggestions(query: string): Promise<SearchResult[]> {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 300));
    return SearchService.suggestions.filter(item => 
      item.name.toLowerCase().includes(query.toLowerCase())
    );
  },

  // Get recent searches
  getRecentSearches(): RecentSearch[] {
    const searches = localStorage.getItem('recentSearches');
    return searches ? JSON.parse(searches) : [];
  },

  // Save recent search
  saveRecentSearch(search: Omit<RecentSearch, 'timestamp'>): void {
    const searches = SearchService.getRecentSearches();
    const newSearch = { ...search, timestamp: Date.now() };
    
    const updatedSearches = [
      newSearch,
      ...searches.filter(s => s.id !== search.id).slice(0, 4)
    ];
    
    localStorage.setItem('recentSearches', JSON.stringify(updatedSearches));
  }
}; 