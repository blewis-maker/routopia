import React from 'react';

interface Message {
  type: 'user' | 'assistant';
  content: string;
}

interface ChatMessagesProps {
  messages: Message[];
}

const ChatMessages = ({ messages }: ChatMessagesProps) => {
  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4">
      {messages.map((message, index) => (
        <div
          key={index}
          className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
        >
          <div
            className={`max-w-[80%] rounded-lg p-3 ${
              message.type === 'user'
                ? 'bg-blue-600 text-white'
                : 'bg-[#2D2D2D] text-white'
            }`}
          >
            {message.content}
          </div>
        </div>
      ))}
    </div>
  );
};

export default ChatMessages; 