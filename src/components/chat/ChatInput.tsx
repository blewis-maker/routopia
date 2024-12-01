import React, { useState, KeyboardEvent } from 'react';

interface ChatInputProps {
  onSendMessage: (message: string) => void;
}

const ChatInput = ({ onSendMessage }: ChatInputProps) => {
  const [message, setMessage] = useState('');

  const handleSend = () => {
    if (message.trim()) {
      onSendMessage(message.trim());
      setMessage('');
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="relative">
      <textarea
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Enter your route planning question..."
        className="w-full px-4 py-2 bg-[#2D2D2D] text-white rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
        rows={2}
        style={{ minHeight: '50px', maxHeight: '80px' }}
      />
      <div className="absolute right-2 bottom-1 text-xs text-gray-400">
        Press Enter to send
      </div>
    </div>
  );
};

export default ChatInput; 