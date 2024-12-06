import { MCPClientService } from '../infrastructure/MCPClientService';
import { RouteContext, MCPResponse } from '../types/mcp.types';

interface MigrationConfig {
  batchSize: number;
  timeout: number;
  enableFallback: boolean;
  parallelTesting: boolean;
}

interface MigrationStats {
  total: number;
  migrated: number;
  failed: number;
  skipped: number;
  errors: Error[];
}

export class MCPMigrationService {
  private stats: MigrationStats = {
    total: 0,
    migrated: 0,
    failed: 0,
    skipped: 0,
    errors: []
  };

  constructor(
    private mcpClient: MCPClientService,
    private config: MigrationConfig
  ) {}

  async migrateRoutes(routes: RouteContext[]): Promise<MigrationStats> {
    this.stats.total = routes.length;
    
    for (let i = 0; i < routes.length; i += this.config.batchSize) {
      const batch = routes.slice(i, i + this.config.batchSize);
      await this.migrateBatch(batch);
      
      // Log progress
      console.log(`Migration progress: ${i + batch.length}/${routes.length}`);
      console.log(`Success rate: ${(this.stats.migrated / this.stats.total * 100).toFixed(2)}%`);
    }

    return this.stats;
  }

  private async migrateBatch(routes: RouteContext[]): Promise<void> {
    const migrations = routes.map(route => this.migrateRoute(route));
    const results = await Promise.allSettled(migrations);

    results.forEach(result => {
      if (result.status === 'fulfilled') {
        this.stats.migrated++;
      } else {
        if (this.config.enableFallback) {
          this.handleFallback(result.reason);
        } else {
          this.stats.failed++;
          this.stats.errors.push(result.reason);
        }
      }
    });
  }

  private async migrateRoute(route: RouteContext): Promise<MCPResponse> {
    try {
      // If parallel testing is enabled, compare with ChatGPT
      if (this.config.parallelTesting) {
        const [mcpResponse, chatGptResponse] = await Promise.all([
          this.mcpClient.generateRoute(route),
          this.generateChatGPTResponse(route)
        ]);

        await this.compareResponses(mcpResponse, chatGptResponse);
        return mcpResponse;
      }

      return await this.mcpClient.generateRoute(route);
    } catch (error) {
      console.error('Route migration failed:', error);
      throw error;
    }
  }

  private async handleFallback(error: Error): Promise<void> {
    // Implement fallback logic here if needed
    console.warn('Fallback triggered:', error);
    this.stats.skipped++;
  }

  private async generateChatGPTResponse(route: RouteContext): Promise<any> {
    // This will be removed after migration
    throw new Error('ChatGPT integration to be removed');
  }

  private async compareResponses(mcpResponse: MCPResponse, chatGptResponse: any): Promise<void> {
    // Implement response comparison logic
    // This is temporary for validation during migration
    console.log('Response comparison:', {
      mcp: mcpResponse,
      chatgpt: chatGptResponse
    });
  }

  getStats(): MigrationStats {
    return { ...this.stats };
  }
}

// Migration utilities
export async function validateMigration(stats: MigrationStats): Promise<boolean> {
  const successRate = (stats.migrated / stats.total) * 100;
  const failureRate = (stats.failed / stats.total) * 100;

  console.log('Migration Validation Results:');
  console.log(`Success Rate: ${successRate.toFixed(2)}%`);
  console.log(`Failure Rate: ${failureRate.toFixed(2)}%`);
  console.log(`Skipped: ${stats.skipped}`);
  
  if (stats.errors.length > 0) {
    console.log('Error Summary:');
    stats.errors.forEach((error, index) => {
      console.log(`Error ${index + 1}:`, error.message);
    });
  }

  return successRate >= 95; // Require 95% success rate for validation
}

export async function cleanupChatGPT(): Promise<void> {
  // List of files/modules to remove or update
  const cleanup = [
    'src/services/ai/ChatGPTService.ts',
    'src/services/ai/ChatGPTTypes.ts',
    'src/utils/chatgpt/',
    'src/config/chatgpt.config.ts'
  ];

  console.log('ChatGPT cleanup required for:', cleanup);
  console.log('Please remove these files/directories after successful migration');
} 