'use client';

import { useState } from 'react';
import ChatMessages from './ChatMessages';
import ChatInput from './ChatInput';

interface ChatWindowProps {
  onSendMessage: (message: string) => void;
  onDestinationChange?: (destination: string) => void;
}

const ChatWindow = ({ onSendMessage, onDestinationChange }: ChatWindowProps) => {
  const [messages, setMessages] = useState<Array<{
    type: 'user' | 'assistant';
    content: string;
  }>>([{
    type: 'assistant',
    content: "I'm here to help you plan routes in Colorado. Where would you like to go?"
  }]);

  const handleSendMessage = async (message: string) => {
    // Add user message to chat
    setMessages(prev => [...prev, { type: 'user', content: message }]);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message }),
      });

      const data = await response.json();
      
      // Add assistant response to chat
      setMessages(prev => [...prev, { type: 'assistant', content: data.message }]);
      
      // Call parent handlers
      onSendMessage(data.message);
      if (onDestinationChange && data.destination) {
        onDestinationChange(data.destination);
      }
    } catch (error) {
      console.error('Chat error:', error);
      setMessages(prev => [...prev, {
        type: 'assistant',
        content: 'Sorry, I encountered an error processing your request.'
      }]);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b border-stone-800">
        <h2 className="text-white text-lg font-semibold">RouteGPT</h2>
      </div>
      
      <div className="flex-1 overflow-y-auto">
        <ChatMessages messages={messages} />
      </div>
      
      <div className="p-4 border-t border-stone-800">
        <ChatInput onSendMessage={handleSendMessage} />
      </div>
    </div>
  );
};

export default ChatWindow; 