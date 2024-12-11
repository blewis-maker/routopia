export interface ChatMessage {
  id: string;
  routeId: string;
  content: string;
  timestamp: Date;
  userId: string;
  type: 'user' | 'system' | 'ai';
} 