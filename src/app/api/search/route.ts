import { NextResponse } from 'next/server';
import { SemanticSearchHandler } from '@/services/ai/SemanticSearchHandler';
import { PineconeService } from '@/services/search/PineconeService';
import { RouteDescriptionGenerator } from '@/services/ai/RouteDescriptionGenerator';

const searchHandler = new SemanticSearchHandler(
  new PineconeService(),
  new RouteDescriptionGenerator()
);

export async function POST(request: Request) {
  try {
    const { query, filters } = await request.json();

    const results = await searchHandler.handleSearchQuery(query, filters);

    return NextResponse.json({ results });
  } catch (error) {
    console.error('Search API error:', error);
    return NextResponse.json(
      { error: 'Failed to process search request' },
      { status: 500 }
    );
  }
}

// Index new route
export async function PUT(request: Request) {
  try {
    const { route } = await request.json();
    await searchHandler.indexNewRoute(route);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Route indexing error:', error);
    return NextResponse.json(
      { error: 'Failed to index route' },
      { status: 500 }
    );
  }
} 