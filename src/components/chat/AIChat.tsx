import { useState, useRef, useEffect } from 'react';
import { ChatMessage, RouteContext, ChatSuggestion } from '@/types/chat/types';
import { Location } from '@/types';
import { CoreActivityType } from '@/types/activities';
import { useActivityContext } from '@/contexts/ActivityContext';
import { MapVisualization } from '@/types/maps/visualization';

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
  isGenerating: boolean;
  onRouteVisualization?: (visualization: MapVisualization) => void;
}

export function AIChat({
  messages,
  onSendMessage,
  userLocation,
  destinationLocation,
  weatherData,
  onViewSuggestion,
  onAddToRoute,
  isGenerating,
  onRouteVisualization
}: AIChatProps) {
  const [inputValue, setInputValue] = useState('');
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const { currentActivity, setCurrentActivity } = useActivityContext();

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

  const handleRouteTypeChange = (type: CoreActivityType) => {
    setCurrentActivity(type);
    // This will automatically update the prompt context through the provider
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

      {/* Messages Container - Cursor-like styling */}
      <div className="flex-1 overflow-y-auto">
        <div className="flex flex-col justify-end min-h-full p-4 space-y-4">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`px-2 py-1 rounded text-[13px] font-medium ${
                message.type === 'user'
                  ? 'text-emerald-200'
                  : 'text-stone-200'
              }`}
            >
              {message.content}
            </div>
          ))}
        </div>
      </div>

      {/* Input Area */}
      <div className="border-t border-stone-800/50">
        {/* Route Types and Loading State */}
        <div className="flex items-center justify-between px-4 py-2 border-b border-stone-800/30">
          {/* Loading Indicator */}
          {isGenerating && (
            <div className="flex items-center gap-2 text-xs text-stone-400">
              <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
              <span>Generating...</span>
            </div>
          )}
          
          {/* Route Types */}
          <div className="flex items-center gap-2 ml-auto">
            {(['Drive', 'Bike', 'Run', 'Ski', 'Adventure'] as const).map((type) => (
              <button
                key={type}
                onClick={() => handleRouteTypeChange(type)}
                className={`text-xs px-2 py-1 rounded ${
                  currentActivity.activityType === type
                    ? 'bg-stone-700/50 text-stone-200'
                    : 'text-stone-400 hover:text-stone-300'
                }`}
              >
                {type}
              </button>
            ))}
          </div>
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
              className="w-full px-4 py-3 pr-12 bg-stone-900/90 text-stone-100 rounded-lg border border-stone-700/50 focus:outline-none focus:border-emerald-500/30 focus:ring-1 focus:ring-emerald-500/30 resize-none placeholder-stone-500 text-[13px] font-medium"
              rows={1}
            />
            <button
              type="submit"
              onClick={handleSubmit}
              disabled={!inputValue.trim() || isGenerating}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-stone-400 hover:text-stone-300 disabled:opacity-30 disabled:hover:text-stone-400 transition-colors"
            >
              <svg
                className="w-4 h-4 rotate-90"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M5 10l7-7m0 0l7 7m-7-7v18"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 