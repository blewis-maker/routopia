import { PineconeService } from '../PineconeService';
import { pineconeConfig } from '@/config/pinecone';

describe('PineconeService', () => {
  let pineconeService: PineconeService;

  beforeAll(async () => {
    pineconeService = new PineconeService();
    await pineconeService.initialize();
  });

  it('should connect to Pinecone', async () => {
    const status = await pineconeService.checkConnection();
    expect(status.isConnected).toBe(true);
  });

  it('should have the correct index', async () => {
    const indexInfo = await pineconeService.getIndexInfo();
    expect(indexInfo.name).toBe(pineconeConfig.indexName);
    expect(indexInfo.dimension).toBe(1536); // OpenAI embedding dimension
  });
}); 