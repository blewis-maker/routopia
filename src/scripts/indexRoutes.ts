import { BatchIndexer } from '@/services/search/BatchIndexer';
import { PineconeService } from '@/services/search/PineconeService';
import { RouteDescriptionGenerator } from '@/services/ai/RouteDescriptionGenerator';

async function indexAllRoutes() {
  const batchIndexer = new BatchIndexer(
    new PineconeService(),
    new RouteDescriptionGenerator()
  );

  try {
    // Here we'll add logic to fetch routes from your database
    const routes = []; // await fetchRoutesFromDatabase();
    
    console.log(`Starting batch indexing of ${routes.length} routes...`);
    
    const results = await batchIndexer.indexRoutes(routes);
    
    console.log('Indexing completed:', {
      total: results.total,
      successful: results.successful,
      failed: results.failed
    });

    if (results.failed > 0) {
      console.log('Failed routes:', results.errors);
      
      // Attempt to reindex failed routes
      const retryResults = await batchIndexer.reindexFailedRoutes(routes, results.errors);
      console.log('Retry results:', retryResults);
    }

    // Validate the index
    const validation = await batchIndexer.validateIndex(routes);
    console.log('Validation results:', validation);

  } catch (error) {
    console.error('Batch indexing failed:', error);
  }
}

// Only run if called directly
if (require.main === module) {
  indexAllRoutes()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error('Fatal error:', error);
      process.exit(1);
    });
} 