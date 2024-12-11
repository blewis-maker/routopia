import { prisma } from '@/lib/prisma';
import { getPineconeClient, pineconeConfig } from '@/lib/pinecone';
import { redis, chatCacheKey } from '@/lib/redis';
import type { ChatMessage } from '@/types/chat';

export class ChatHistoryManager {
  private pineconeClient: Awaited<ReturnType<typeof getPineconeClient>> | null = null;

  async initialize() {
    this.pineconeClient = await getPineconeClient();
  }

  async saveMessage(message: ChatMessage) {
    // Save to PostgreSQL
    await prisma.chatMessage.create({
      data: message
    });

    // Store in Pinecone for semantic search
    if (message.content.length > 20 && this.pineconeClient) {
      const embedding = await this.getEmbedding(message.content);
      const index = this.pineconeClient.Index(pineconeConfig.indexName);
      
      await index.upsert({
        upsertRequest: {
          vectors: [{
            id: message.id,
            values: embedding,
            metadata: {
              routeId: message.routeId,
              timestamp: message.timestamp.toISOString()
            }
          }]
        }
      });
    }

    // Update Redis cache
    await this.updateChatCache(message.routeId);
  }

  async getRouteHistory(routeId: string, limit = 50): Promise<ChatMessage[]> {
    // Try Redis cache first
    const cached = await redis?.get(chatCacheKey(routeId));
    if (cached) return JSON.parse(cached);

    // Fall back to database
    const messages = await prisma.chatMessage.findMany({
      where: { routeId },
      orderBy: { timestamp: 'desc' },
      take: limit
    });

    // Update cache
    if (messages.length > 0) {
      await this.updateChatCache(routeId);
    }

    return messages;
  }

  private async updateChatCache(routeId: string) {
    const messages = await prisma.chatMessage.findMany({
      where: { routeId },
      orderBy: { timestamp: 'desc' },
      take: 50
    });

    if (messages.length > 0) {
      await redis?.setex(
        chatCacheKey(routeId),
        parseInt(process.env.REDIS_TTL!, 10),
        JSON.stringify(messages)
      );
    }
  }

  private async getEmbedding(text: string): Promise<number[]> {
    // Implement your embedding logic here
    // You might want to use OpenAI's embedding API or another service
    return [];
  }
} 