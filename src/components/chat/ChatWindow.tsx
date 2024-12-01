import { useState, useEffect } from 'react';
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
    content: "I'm here and ready to help you with any route planning or travel-related questions you may have in Colorado. Where are you currently located or where are you planning to go?"
  }]);

  const [currentLocation, setCurrentLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCurrentLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
        },
        (error) => {
          console.error('Error getting location:', error);
        }
      );
    }
  }, []);

  const handleSendMessage = async (message: string) => {
    setMessages(prev => [...prev, { type: 'user', content: message }]);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          message,
          location: currentLocation
        }),
      });

      const data = await response.json();
      
      if (data.message && onDestinationChange) {
        const patterns = [
          /I recommend ([^\.]+)/i,
          /recommend visiting ([^\.]+)/i,
          /Let's head to ([^\.]+)/i,
          /heading to ([^\.]+)/i,
          /suggesting ([^\.]+)/i,
          /visit ([^(]+?)(?=\s*\(|\.)/i,  // Matches up to coordinates or period
          /recommend ([^(]+?)(?=\s*\(|\.)/i  // Same as above but with "recommend"
        ];

        for (const pattern of patterns) {
          const match = data.message.match(pattern);
          if (match) {
            const destination = match[1]
              .trim()
              .replace(/\.$/, '')  // Remove trailing period
              .replace(/\s*\([^)]+\)/, '');  // Remove coordinates if present
            
            console.log('Parsed destination:', destination); // Debug log
            onDestinationChange(destination);
            break;
          }
        }
      }

      setMessages(prev => [...prev, { type: 'assistant', content: data.message }]);
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
      {/* Header with Input */}
      <div className="p-4 border-b border-gray-800 bg-[#1E1E1E]">
        <h2 className="text-white text-lg font-semibold mb-4">RouteGPT</h2>
        <ChatInput onSendMessage={handleSendMessage} />
      </div>

      {/* Messages Area - Now below input */}
      <div className="flex-1 overflow-y-auto">
        <ChatMessages messages={messages} scrollDirection="up" />
      </div>
    </div>
  );
};

export default ChatWindow; 