import React, { useState, useCallback, useEffect, useRef } from 'react';
import { useChat } from '@/hooks/useChat';
import { useMapIntegration } from '@/hooks/useMapIntegration';
import { ChatMessage } from '@/types/chat';
import { AIContext } from '@/types/ai';
import { RouteContext } from '@/types/route';
import { ActivityType } from '@/types/activity';
import { POISuggestion } from './POISuggestion';
import { RouteSuggestion } from './RouteSuggestion';
import logger from '@/utils/logger';

interface AIChatProps {
  onRouteUpdate?: (route: RouteContext) => void;
  onActivitySelect?: (activity: ActivityType) => void;
  className?: string;
  initialContext?: AIContext;
}

export const AIChat: React.FC<AIChatProps> = ({
  onRouteUpdate,
  onActivitySelect,
  className,
  initialContext
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [context, setContext] = useState<AIContext>(initialContext || {});
  const { sendMessage, isProcessing } = useChat();
  const { currentLocation } = useMapIntegration();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isProcessing) return;

    const userMessage: ChatMessage = {
      id: `msg_${Date.now()}`,
      role: 'user',
      content: input.trim(),
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');

    try {
      const response = await sendMessage(input, {
        route: context.route,
        location: currentLocation || context.location
      });

      // Update context with AI response
      if (response.context) {
        setContext(prev => ({
          ...prev,
          ...response.context,
          sessionContext: {
            ...prev.sessionContext,
            lastInteraction: Date.now(),
            interactionCount: (prev.sessionContext?.interactionCount || 0) + 1
          }
        }));

        // Handle route updates
        if (response.context.route && onRouteUpdate) {
          onRouteUpdate(response.context.route);
        }
      }

      const assistantMessage: ChatMessage = {
        id: `msg_${Date.now()}_response`,
        role: 'assistant',
        content: response.content,
        timestamp: new Date().toISOString(),
        context: {
          route: response.context?.route,
          location: response.context?.location,
          suggestions: response.suggestions
        }
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      logger.error('Chat error:', error);
      const errorMessage: ChatMessage = {
        id: `msg_${Date.now()}_error`,
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.',
        timestamp: new Date().toISOString(),
        context: {
          error: error instanceof Error ? error.message : 'Unknown error'
        }
      };
      setMessages(prev => [...prev, errorMessage]);
    }
  }, [input, isProcessing, context, currentLocation, sendMessage, onRouteUpdate]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      const form = e.currentTarget.closest('form');
      if (form) form.requestSubmit();
    }
  }, []);

  return (
    <div className={`flex flex-col h-full ${className || ''}`}>
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
              <p className="whitespace-pre-wrap">{message.content}</p>
              {message.context?.route && (
                <RouteSuggestion route={message.context.route} />
              )}
              {message.context?.suggestions && (
                <POISuggestion
                  suggestions={message.context.suggestions}
                  onSelect={suggestion => setInput(prev => `${prev} ${suggestion}`)}
                />
              )}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSubmit} className="p-4 border-t">
        <div className="flex space-x-2">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type your message..."
            className="flex-1 p-2 border rounded-lg resize-none"
            rows={1}
            disabled={isProcessing}
          />
          <button
            type="submit"
            disabled={isProcessing}
            className={`px-4 py-2 rounded-lg ${
              isProcessing
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-blue-500 hover:bg-blue-600'
            } text-white`}
          >
            {isProcessing ? 'Sending...' : 'Send'}
          </button>
        </div>
      </form>
    </div>
  );
}; 