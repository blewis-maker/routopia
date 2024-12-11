import { PineconeConfiguration } from '@pinecone-database/pinecone';

interface PineconeConfig extends PineconeConfiguration {
  indexName: string;
  environment: string;
}

export const pineconeConfig: PineconeConfig = {
  apiKey: process.env.PINECONE_API_KEY!,
  environment: process.env.PINECONE_ENVIRONMENT || 'us-west-2',
  indexName: process.env.PINECONE_INDEX_NAME || 'routopia-routes'
}; 