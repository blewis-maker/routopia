'use client';

import { createContext, useContext, ReactNode, useState } from 'react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface AIChatContextType {
  isOpen: boolean;
  messages: Message[];
  toggleChat: () => void;
  sendMessage: (message: string) => Promise<void>;
}

const AIChatContext = createContext<AIChatContextType | null>(null);

export function AIChatProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);

  const toggleChat = () => setIsOpen(prev => !prev);

  const sendMessage = async (content: string) => {
    // Add user message
    const userMessage: Message = { role: 'user', content };
    setMessages(prev => [...prev, userMessage]);

    try {
      // Call AI API endpoint
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: content }),
      });

      if (!response.ok) throw new Error('Failed to send message');

      const data = await response.json();
      
      // Add AI response
      const aiMessage: Message = { role: 'assistant', content: data.message };
      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
      // Add error message
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.',
      }]);
    }
  };

  const value = {
    isOpen,
    messages,
    toggleChat,
    sendMessage,
  };

  return (
    <AIChatContext.Provider value={value}>
      {children}
    </AIChatContext.Provider>
  );
}

export function useAIChat() {
  const context = useContext(AIChatContext);
  if (!context) {
    throw new Error('useAIChat must be used within an AIChatProvider');
  }
  return context;
} 