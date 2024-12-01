'use client';

import { useState, useRef, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { v4 as uuidv4 } from 'uuid';
import { MapIntegrationLayer } from '../../services/maps/MapIntegrationLayer';
import ChatInput from './ChatInput';

interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  createdAt: Date;
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
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleMessage = async (message: string) => {
    try {
      // First, try to parse intent from message
      const intent = await parseIntent(message);
      
      // Handle map-related actions
      if (intent.type === 'LOCATION_SEARCH' || intent.type === 'ROUTE_PLANNING') {
        const result = await mapIntegration.handleChatAction({
          type: intent.type === 'LOCATION_SEARCH' ? 'SEARCH_LOCATION' : 'PLAN_ROUTE',
          payload: intent.payload
        });

        // Update chat with results
        setMessages(prev => [...prev, {
          id: uuidv4(),
          content: formatResponseFromResult(result),
          role: 'assistant',
          createdAt: new Date()
        }]);
      }

      // Continue with normal chat processing
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, { role: 'user', content: message }],
          routeContext,
          mapContext: mapIntegration.getState()
        })
      });

      if (!response.ok) throw new Error('Failed to send message');

      const reader = response.body?.getReader();
      if (!reader) throw new Error('No response reader');

      // Handle streaming response
      const decoder = new TextDecoder();
      let assistantMessage = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        assistantMessage += decoder.decode(value);
        
        // Update the UI with partial response
        setMessages(prev => {
          const lastMessage = prev[prev.length - 1];
          if (lastMessage.role === 'assistant') {
            return [...prev.slice(0, -1), {
              ...lastMessage,
              content: assistantMessage,
            }];
          } else {
            return [...prev, {
              id: uuidv4(),
              content: assistantMessage,
              role: 'assistant',
              createdAt: new Date(),
            }];
          }
        });
      }
    } catch (error) {
      console.error('Chat error:', error);
      // Handle error state
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
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Form */}
      <form onSubmit={handleSubmit} className="p-4 border-t border-stone-800">
        <div className="flex gap-2">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Ask about route planning..."
            disabled={isLoading}
            className="flex-1 bg-stone-800 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
          <button
            type="submit"
            disabled={isLoading}
            className="bg-teal-600 text-white px-4 py-2 rounded-lg hover:bg-teal-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Sending...' : 'Send'}
          </button>
        </div>
      </form>
    </div>
  );
} 