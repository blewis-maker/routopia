'use client';

import { useState } from 'react';

export function AIChat() {
  const [messages, setMessages] = useState<Array<{
    role: 'user' | 'assistant';
    content: string;
  }>>([]);

  const [input, setInput] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const newMessage = { role: 'user' as const, content: input };
    setMessages(prev => [...prev, newMessage]);
    setInput('');
  };

  return (
    <div className="ai-chat">
      <div className="ai-chat__messages">
        {messages.map((msg, i) => (
          <div key={i} className={`ai-chat__message ai-chat__message--${msg.role}`}>
            {msg.content}
          </div>
        ))}
      </div>
      <form onSubmit={handleSubmit} className="ai-chat__input">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask me anything..."
          className="ai-chat__input-field"
        />
        <button type="submit" className="ai-chat__submit">
          Send
        </button>
      </form>
    </div>
  );
} 