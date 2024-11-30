'use client';

interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  createdAt: Date;
}

interface ChatInterfaceProps {
  routeContext?: {
    startLocation?: string;
    endLocation?: string;
    routeType?: 'CAR' | 'BIKE' | 'SKI';
  };
}

export function ChatInterface({ routeContext }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // ... rest of implementation
} 