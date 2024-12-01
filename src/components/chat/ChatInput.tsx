import React, { useState, KeyboardEvent } from 'react';

interface ChatInputProps {
  onSendMessage: (message: string) => void;
}

const ChatInput = ({ onSendMessage }: ChatInputProps) => {
  const [message, setMessage] = useState('');

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (message.trim()) {
        onSendMessage(message);
        setMessage('');
      }
    }
  };

  return (
    <div className="p-4 border-t border-gray-800">
      <textarea
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        onKeyDown={handleKeyDown}
        className="w-full bg-[#2D2D2D] text-white rounded-lg p-3 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
        placeholder="Enter your route planning question..."
        rows={3}
      />
    </div>
  );
};

export default ChatInput; 