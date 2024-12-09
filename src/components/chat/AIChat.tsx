import { useState, useRef, useEffect } from 'react';
import { ChatMessage, RouteContext, ChatSuggestion } from '@/types/chat/types';
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
  onViewSuggestion: (suggestion: ChatSuggestion) => void;
  onAddToRoute: (suggestion: ChatSuggestion) => void;
}

export function AIChat({
  messages,
  onSendMessage,
  userLocation,
  destinationLocation,
  weatherData,
  onViewSuggestion,
  onAddToRoute
}: AIChatProps) {
  const [inputValue, setInputValue] = useState('');
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [routeType, setRouteType] = useState<'drive' | 'bike' | 'run' | 'ski' | 'adventure'>('drive');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;
    onSendMessage(inputValue);
    setInputValue('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#1B1B1B]">
      {/* Chat Header */}
      <div className="flex items-center px-4 py-2 border-b border-stone-800/50">
        <div className="flex items-center gap-2 text-xs text-stone-400">
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
          </svg>
          <span>CHAT</span>
        </div>
      </div>

      {/* Generation Status Bar */}
      {isGenerating && (
        <div className="flex items-center justify-between px-4 py-1 bg-stone-800/30 border-b border-stone-700/30">
          <div className="flex items-center gap-2 text-xs text-stone-400">
            <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
            <span>Generating...</span>
          </div>
          <button 
            onClick={() => {/* Add cancel logic */}}
            className="text-xs text-stone-400 hover:text-stone-300"
          >
            Cancel
          </button>
        </div>
      )}

      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto space-y-4 p-4">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'} px-2`}
          >
            {/* Message Bubble */}
            <div
              className={`max-w-[85%] rounded-lg px-4 py-2.5 ${
                message.type === 'user'
                  ? 'bg-emerald-600/10 text-emerald-200 border border-emerald-600/20'
                  : 'bg-stone-800/50 text-stone-200 border border-stone-700/50'
              }`}
            >
              {/* Typing Indicator */}
              {message.type === 'assistant' && message.content === '...' ? (
                <div className="flex items-center space-x-1.5 h-6 px-2">
                  <div className="w-1.5 h-1.5 bg-stone-400 rounded-full animate-pulse" />
                  <div className="w-1.5 h-1.5 bg-stone-400 rounded-full animate-pulse delay-150" />
                  <div className="w-1.5 h-1.5 bg-stone-400 rounded-full animate-pulse delay-300" />
                </div>
              ) : (
                <div className="prose prose-invert prose-sm max-w-none">
                  {message.content}
                </div>
              )}

              {/* Suggestions - Cursor-like cards */}
              {message.type === 'assistant' && message.suggestions?.waypoints?.length > 0 && (
                <div className="mt-4 space-y-3">
                  {message.suggestions.waypoints.map((suggestion, idx) => (
                    <div 
                      key={idx}
                      className="bg-stone-800/70 border border-stone-700/50 rounded-lg p-3 space-y-2 hover:bg-stone-800/90 transition-colors"
                    >
                      <div className="flex justify-between items-start gap-4">
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-medium text-stone-100 truncate">{suggestion.name}</h4>
                          <p className="text-xs text-stone-400 line-clamp-2">{suggestion.description}</p>
                        </div>
                        <span className="flex-shrink-0 text-[10px] px-1.5 py-0.5 bg-stone-700/50 text-stone-300 rounded-full">
                          {suggestion.type}
                        </span>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => onAddToRoute(suggestion)}
                          className="text-xs px-3 py-1.5 bg-emerald-500/10 text-emerald-300 rounded-md hover:bg-emerald-500/20 transition-colors"
                        >
                          Add to Route
                        </button>
                        <button
                          onClick={() => onViewSuggestion(suggestion)}
                          className="text-xs px-3 py-1.5 bg-stone-700/50 text-stone-300 rounded-md hover:bg-stone-700/70 transition-colors"
                        >
                          View on Map
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Route Type Selector and Input Form */}
      <div className="border-t border-stone-800/50">
        {/* Route Type Selector */}
        <div className="flex items-center justify-end gap-2 px-4 py-2 border-b border-stone-800/30">
          {(['drive', 'bike', 'run', 'ski', 'adventure'] as const).map((type) => (
            <button
              key={type}
              onClick={() => setRouteType(type)}
              className={`text-xs px-2 py-1 rounded ${
                routeType === type
                  ? 'bg-stone-700/50 text-stone-200'
                  : 'text-stone-400 hover:text-stone-300'
              }`}
            >
              {type}
            </button>
          ))}
        </div>

        {/* Input Form */}
        <div className="p-4">
          <div className="relative">
            <textarea
              ref={inputRef}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Where would you like to go?"
              className="w-full px-4 py-3 bg-stone-900/90 text-stone-100 rounded-lg border border-stone-700/50 focus:outline-none focus:border-emerald-500/30 focus:ring-1 focus:ring-emerald-500/30 resize-none placeholder-stone-500"
              rows={1}
            />
            <button
              type="submit"
              disabled={!inputValue.trim() || isGenerating}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-stone-400 hover:text-emerald-400 disabled:opacity-30 disabled:hover:text-stone-400 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 