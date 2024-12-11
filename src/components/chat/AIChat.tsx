import { useState, useRef, useEffect } from 'react';
import { ChatMessage, RouteContext, ChatSuggestion } from '@/types/chat/types';
import { Location } from '@/types';
import { CoreActivityType } from '@/types/activities';
import { useActivityContext } from '@/contexts/ActivityContext';
import { MapVisualization } from '@/types/maps/visualization';
import { Keyboard, Car, Bike, Footprints, Snowflake, Compass } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ActivityTypeSelector } from '@/components/route-planner/ActivityTypeSelector';

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
      <div className="flex items-center px-4 py-1.5 border-b border-stone-800/50">
        <div className="flex items-center gap-2 text-xs text-stone-400">
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
          </svg>
          <span>CHAT</span>
        </div>
      </div>

      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto">
        <div className="flex flex-col justify-end min-h-full p-4 space-y-4">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`px-2 py-1 rounded text-[14px] font-medium ${
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
        {/* Activity Type Icons with Loading State */}
        <div className="border-b border-stone-800/50">
          <div className="flex items-center justify-between px-4 py-1.5">
            <ActivityTypeSelector 
              selected={currentActivity.activityType.toLowerCase() as any}
              onChange={handleRouteTypeChange}
              className="flex gap-2"
            />
            
            {/* Loading Indicator */}
            {isGenerating && (
              <div className="flex items-center gap-2 text-xs text-stone-400">
                <span>Generating</span>
                <div className="w-2 h-2 rounded-full bg-teal-500/20 shadow-[0_0_8px_rgba(45,212,191,0.5)] animate-pulse-analog" />
              </div>
            )}
          </div>
        </div>

        {/* Input Form */}
        <div className="p-2.5">
          <div className="relative flex items-center">
            <textarea
              ref={inputRef}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Where would you like to go?"
              rows={1}
              className="w-full px-4 py-2.5 bg-[#1B1B1B] text-stone-200 text-[14px] rounded-lg border border-stone-800 focus:outline-none resize-none placeholder-stone-500"
            />
            <button 
              className={cn(
                "absolute right-3 transition-colors",
                inputValue.trim() 
                  ? "text-teal-500 hover:text-teal-400" 
                  : "text-stone-600"
              )}
              onClick={handleSubmit}
            >
              <Keyboard className="w-6 h-6" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 