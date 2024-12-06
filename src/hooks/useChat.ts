import { useState, useCallback } from 'react';
import { ChatMessage, ChatResponse, ChatError } from '@/types/chat';
import { RouteContext } from '@/types/route';
import { GeoPoint } from '@/types/geo';
import logger from '@/utils/logger';

interface UseChatProps {
  onError?: (error: ChatError) => void;
}

export function useChat({ onError }: UseChatProps = {}) {
  const [isProcessing, setIsProcessing] = useState(false);

  const sendMessage = useCallback(async (
    content: string,
    context?: {
      route?: RouteContext;
      location?: GeoPoint;
    }
  ): Promise<ChatResponse> => {
    setIsProcessing(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: content,
          context,
        }),
      });

      if (!response.ok) {
        const error: ChatError = await response.json();
        logger.error('Chat API error:', error);
        if (onError) {
          onError(error);
        }
        throw new Error(error.message);
      }

      const data: ChatResponse = await response.json();
      return data;
    } catch (error) {
      logger.error('Failed to send message:', error);
      const chatError: ChatError = {
        message: error instanceof Error ? error.message : 'Unknown error occurred',
        code: 'CHAT_ERROR',
        details: error,
      };
      if (onError) {
        onError(chatError);
      }
      throw error;
    } finally {
      setIsProcessing(false);
    }
  }, [onError]);

  return {
    sendMessage,
    isProcessing,
  };
} 