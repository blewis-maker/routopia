'use client';

import React, { useState, useCallback } from 'react';
import { useChat } from '@/hooks/useChat';
import { POISuggestion } from './POISuggestion';
import logger from '@/utils/logger';
import { RouteContext } from '@/types/route';
import { GeoPoint } from '@/types/geo';
import { ActivityType } from '@/types/activity';
import { ChatMessage, ChatResponse } from '@/types/chat';

interface ChatInterfaceProps {
  onRouteUpdate?: (route: RouteContext) => void;
  onLocationSelect?: (location: GeoPoint) => void;
  onActivitySelect?: (activity: ActivityType) => void;
}

export const ChatInterface: React.FC<ChatInterfaceProps> = ({
  onRouteUpdate,
  onLocationSelect,
  onActivitySelect,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { sendMessage } = useChat();

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    setIsLoading(true);
    const userMessage: ChatMessage = {
      id: `msg_${Date.now()}`,
      role: 'user',
      content: input,
      timestamp: new Date().toISOString(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');

    try {
      logger.info('Sending message to chat service', { content: input });
      const response: ChatResponse = await sendMessage(input);

      // Handle route updates
      if (response.context?.route && onRouteUpdate) {
        onRouteUpdate(response.context.route);
      }

      // Handle location selection
      if (response.context?.location && onLocationSelect) {
        onLocationSelect(response.context.location);
      }

      const assistantMessage: ChatMessage = {
        id: `msg_${Date.now()}_response`,
        role: 'assistant',
        content: response.content,
        timestamp: new Date().toISOString(),
        context: {
          route: response.context?.route,
          location: response.context?.location,
          suggestions: response.context?.suggestions,
        },
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      logger.error('Error in chat interaction', error);
      const errorMessage: ChatMessage = {
        id: `msg_${Date.now()}_error`,
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.',
        timestamp: new Date().toISOString()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  }, [input, isLoading, onRouteUpdate, onLocationSelect, sendMessage]);

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${
              message.role === 'user' ? 'justify-end' : 'justify-start'
            }`}
          >
            <div
              className={`max-w-3/4 p-3 rounded-lg ${
                message.role === 'user'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-200 text-gray-800'
              }`}
            >
              <p>{message.content}</p>
              {message.context?.suggestions && (
                <POISuggestion suggestions={message.context.suggestions} />
              )}
            </div>
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="p-4 border-t">
        <div className="flex space-x-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your message..."
            className="flex-1 p-2 border rounded-lg"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={isLoading}
            className={`px-4 py-2 rounded-lg ${
              isLoading
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-blue-500 hover:bg-blue-600'
            } text-white`}
          >
            {isLoading ? 'Sending...' : 'Send'}
          </button>
        </div>
      </form>
    </div>
  );
}; 