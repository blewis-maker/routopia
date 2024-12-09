import { useState, useRef, useEffect } from 'react';
import { ChatMessage, RouteContext } from '@/types/chat/types';
import { Location } from '@/types';

interface AIChatProps {
  messages: ChatMessage[];
  onSendMessage: (message: string) => void;
  userLocation?: Location | null;
  destinationLocation?: Location | null;
  weatherData?: {
    temperature: number;
    conditions: string;
    windSpeed: number;
  } | null;
}

export function AIChat({
  messages,
  onSendMessage,
  userLocation,
  destinationLocation,
  weatherData
}: AIChatProps) {
  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const [isTyping, setIsTyping] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedSuggestion, setSelectedSuggestion] = useState<string | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    setIsTyping(true);
    setError(null);

    try {
      // Create route context from current state
      const context: Partial<RouteContext> = {
        start: userLocation?.address || 'Current Location',
        end: destinationLocation?.address,
        mode: 'car',
        timeOfDay: new Date().toLocaleTimeString(),
        weather: weatherData ? {
          temperature: weatherData.temperature,
          conditions: weatherData.conditions,
          windSpeed: weatherData.windSpeed
        } : undefined
      };

      onSendMessage(inputValue);
      setInputValue('');
    } catch (err) {
      setError('Failed to send message. Please try again.');
      console.error('Chat error:', err);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const renderSuggestionButtons = (suggestion: any) => (
    <div className="flex gap-2 mt-2">
      <button
        onClick={() => handleAddToRoute(suggestion)}
        className="px-3 py-1 text-sm bg-emerald-600/20 text-emerald-400 rounded-full hover:bg-emerald-600/30"
      >
        Add to Route
      </button>
      <button
        onClick={() => handleShowDetails(suggestion)}
        className="px-3 py-1 text-sm bg-stone-700/50 text-stone-300 rounded-full hover:bg-stone-700/70"
      >
        Details
      </button>
    </div>
  );

  const handleAddToRoute = async (suggestion: any) => {
    setSelectedSuggestion(suggestion.name);
    // Trigger route recalculation with waypoint
  };

  const handleShowDetails = (suggestion: any) => {
    // For now, just add the details to the chat
    onSendMessage(`Tell me more about ${suggestion.name}`);
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex ${
              message.type === 'user' ? 'justify-end' : 'justify-start'
            }`}
          >
            <div
              className={`max-w-[80%] rounded-lg px-4 py-2 ${
                message.type === 'user'
                  ? 'bg-emerald-600 text-white'
                  : 'bg-stone-800 text-stone-100'
              }`}
            >
              <p className="whitespace-pre-wrap">{message.content}</p>
            </div>
          </div>
        ))}
        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-stone-800 rounded-lg px-4 py-2">
              <div className="flex space-x-2">
                <div className="w-2 h-2 bg-stone-400 rounded-full animate-bounce" />
                <div className="w-2 h-2 bg-stone-400 rounded-full animate-bounce delay-100" />
                <div className="w-2 h-2 bg-stone-400 rounded-full animate-bounce delay-200" />
              </div>
            </div>
          </div>
        )}
        {error && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 text-red-500">
            {error}
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSubmit} className="p-4 border-t border-stone-800">
        <div className="relative">
          <textarea
            ref={inputRef}
            id="chat-input"
            name="chat-message"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask about your route..."
            className="w-full px-4 py-2 bg-stone-900/80 backdrop-blur-sm text-white rounded-lg border border-stone-800 focus:outline-none focus:border-emerald-500 resize-none"
            rows={1}
            aria-label="Chat message input"
          />
          <button
            type="submit"
            disabled={!inputValue.trim()}
            aria-label="Send message"
            className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-emerald-500 hover:text-emerald-400 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
              />
            </svg>
          </button>
        </div>
      </form>
    </div>
  );
} 