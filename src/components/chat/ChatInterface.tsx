'use client';

import { useState, useRef, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { v4 as uuidv4 } from 'uuid';
import { MapIntegrationLayer } from '../../services/maps/MapIntegrationLayer';
import { UserInteractionContext, ChatMessage } from '@/mcp/types/mcp-integration.types';
import ChatInput from './ChatInput';
import { RouteSuggestion } from './RouteSuggestion';
import { POISuggestion } from './POISuggestion';
import logger from '@/utils/logger';

interface Message extends ChatMessage {
  id: string;
}

interface ChatInterfaceProps {
  mapIntegration: MapIntegrationLayer;
  routeContext?: {
    startLocation?: string;
    endLocation?: string;
    routeType?: 'CAR' | 'BIKE' | 'SKI';
  };
}

export function ChatInterface({ mapIntegration, routeContext }: ChatInterfaceProps) {
  const { data: session } = useSession();
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [context, setContext] = useState<UserInteractionContext | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleMessage = async (message: string) => {
    try {
      setIsLoading(true);

      // Add user message
      const userMessage: Message = {
        id: uuidv4(),
        role: 'user',
        content: message,
        timestamp: Date.now(),
        context: {
          route: routeContext,
          location: mapIntegration.getCurrentLocation(),
          weather: context?.sessionContext.weather,
          poi: context?.sessionContext.recentPOIs
        }
      };

      setMessages(prev => [...prev, userMessage]);

      // Prepare request context
      const requestContext = {
        route: routeContext,
        location: mapIntegration.getCurrentLocation(),
        preferences: context?.userPreferences || {}
      };

      // Send to API
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message,
          context: requestContext,
          messages: messages.map(({ id, ...msg }) => msg)
        })
      });

      if (!response.ok) throw new Error('Failed to send message');

      const reader = response.body?.getReader();
      if (!reader) throw new Error('No response reader');

      // Handle streaming response
      const decoder = new TextDecoder();
      let assistantMessage = '';
      let currentMessageId = uuidv4();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        try {
          // Try to parse as JSON (complete message)
          const data = JSON.parse(chunk);
          assistantMessage = data.message;
          
          // Handle suggestions
          if (data.suggestions?.routes) {
            mapIntegration.showRouteSuggestions(data.suggestions.routes);
          }
          if (data.suggestions?.pois) {
            mapIntegration.showPOISuggestions(data.suggestions.pois);
          }

          // Update context
          setContext(data.context);

          // Log metrics
          logger.info('Chat message processed', {
            metrics: data.metrics,
            hasRouteSuggestions: !!data.suggestions?.routes,
            hasPOISuggestions: !!data.suggestions?.pois
          });
        } catch {
          // Not JSON, treat as streaming text
          assistantMessage += chunk;
        }
        
        // Update the UI with partial response
        setMessages(prev => {
          const lastMessage = prev[prev.length - 1];
          if (lastMessage.role === 'assistant' && lastMessage.id === currentMessageId) {
            return [...prev.slice(0, -1), {
              ...lastMessage,
              content: assistantMessage,
              context: context
            }];
          } else {
            return [...prev, {
              id: currentMessageId,
              role: 'assistant',
              content: assistantMessage,
              timestamp: Date.now(),
              context: context
            }];
          }
        });
      }

    } catch (error) {
      logger.error('Chat error:', { error });
      setMessages(prev => [...prev, {
        id: uuidv4(),
        role: 'assistant',
        content: 'Sorry, I encountered an error processing your request.',
        timestamp: Date.now()
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-stone-900 rounded-lg shadow-lg">
      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${
              message.role === 'user' ? 'justify-end' : 'justify-start'
            }`}
          >
            <div
              className={`max-w-[80%] rounded-lg p-3 ${
                message.role === 'user'
                  ? 'bg-teal-600 text-white'
                  : 'bg-stone-800 text-stone-100'
              }`}
            >
              {message.content}
              {message.role === 'assistant' && message.context?.route && (
                <RouteSuggestion route={message.context.route} />
              )}
              {message.role === 'assistant' && message.context?.poi && (
                <POISuggestion pois={message.context.poi} />
              )}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Form */}
      <div className="p-4 border-t border-stone-800">
        <ChatInput onSendMessage={handleMessage} isLoading={isLoading} />
      </div>
    </div>
  );
} 