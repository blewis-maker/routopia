import { useState } from 'react';
import ChatMessages from './ChatMessages';
import ChatInput from './ChatInput';

interface ChatWindowProps {
  onSendMessage: (message: string) => void;
}

const ChatWindow = ({ onSendMessage }: ChatWindowProps) => {
  const [messages, setMessages] = useState<Array<{
    type: 'user' | 'assistant';
    content: string;
  }>>([{
    type: 'assistant',
    content: "I'm here and ready to help you with any route planning or travel-related questions you may have in Colorado. Where are you currently located or where are you planning to go?"
  }]);

  const handleSendMessage = async (message: string) => {
    // Add user message to chat
    setMessages(prev => [...prev, { type: 'user', content: message }]);

    try {
      // Send to API
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message }),
      });

      if (!response.ok) {
        throw new Error('Failed to get response');
      }

      const data = await response.json();
      
      // Add AI response to chat
      setMessages(prev => [...prev, { type: 'assistant', content: data.message }]);
      
      // Update map marker
      onSendMessage(data.message);
      
    } catch (error) {
      console.error('Error:', error);
      setMessages(prev => [...prev, { 
        type: 'assistant', 
        content: 'Sorry, I encountered an error processing your request.' 
      }]);
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#1E1E1E]">
      {/* Header */}
      <div className="p-4 border-b border-gray-800">
        <h2 className="text-white text-lg font-semibold">RouteGPT</h2>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto">
        <ChatMessages messages={messages} />
      </div>

      {/* Input Area */}
      <div className="p-4 border-t border-gray-800 bg-[#1E1E1E]">
        <ChatInput onSendMessage={handleSendMessage} />
      </div>
    </div>
  );
};

export default ChatWindow; 