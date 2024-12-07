'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Command } from 'lucide-react';
import { combineClasses } from '@/utils/formatters';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
}

interface CommandItem {
  id: string;
  name: string;
  description?: string;
  shortcut?: string[];
  icon?: React.ReactNode;
  action: () => void;
}

export default function CommandPalette({ isOpen, onClose }: CommandPaletteProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  // Sample commands - we'll expand this later
  const commands: CommandItem[] = [
    {
      id: 'home',
      name: 'Go to Home',
      description: 'Return to the home page',
      shortcut: ['g', 'h'],
      icon: '🏠',
      action: () => router.push('/'),
    },
    {
      id: 'new-route',
      name: 'Create New Route',
      description: 'Start planning a new route',
      shortcut: ['c', 'r'],
      icon: '🗺️',
      action: () => router.push('/routes/new'),
    },
  ];

  // Filter commands based on search query
  const filteredCommands = commands.filter(command =>
    command.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    command.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus();
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
      setSearchQuery('');
      setSelectedIndex(0);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setSelectedIndex(i => 
            i < filteredCommands.length - 1 ? i + 1 : 0
          );
          break;
        case 'ArrowUp':
          e.preventDefault();
          setSelectedIndex(i => 
            i > 0 ? i - 1 : filteredCommands.length - 1
          );
          break;
        case 'Enter':
          e.preventDefault();
          if (filteredCommands[selectedIndex]) {
            filteredCommands[selectedIndex].action();
            onClose();
          }
          break;
        case 'Escape':
          e.preventDefault();
          onClose();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, filteredCommands, selectedIndex, onClose]);

  if (!isOpen) return null;

  return (
    <div 
      className={combineClasses(
        "fixed inset-0 z-50",
        "bg-black/80 backdrop-blur-sm",
        "flex items-start justify-center pt-[20vh]",
      )}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className={combineClasses(
        "w-full max-w-2xl mx-4",
        "bg-stone-900 rounded-xl",
        "shadow-2xl shadow-black/20",
        "border border-stone-800",
        "divide-y divide-stone-800",
      )}>
        {/* Search input */}
        <div className="p-4 flex items-center gap-3">
          <Command className="w-5 h-5 text-stone-400" />
          <input
            ref={inputRef}
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setSelectedIndex(0);
            }}
            placeholder="Search commands..."
            className={combineClasses(
              "flex-1 bg-transparent",
              "text-white placeholder-stone-400",
              "text-lg",
              "focus:outline-none"
            )}
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="text-stone-400 hover:text-stone-300"
            >
              Clear
            </button>
          )}
        </div>

        {/* Command list */}
        <div className="max-h-[60vh] overflow-y-auto">
          {filteredCommands.length === 0 ? (
            <div className="p-4 text-stone-400 text-center">
              No commands found
            </div>
          ) : (
            <div className="py-2">
              {filteredCommands.map((command, index) => (
                <button
                  key={command.id}
                  onClick={() => {
                    command.action();
                    onClose();
                  }}
                  className={combineClasses(
                    "w-full px-4 py-3",
                    "flex items-center gap-3",
                    "text-left",
                    "transition-colors duration-100",
                    index === selectedIndex
                      ? "bg-stone-800 text-white"
                      : "text-stone-300 hover:bg-stone-800/50"
                  )}
                >
                  <span className="flex-shrink-0">{command.icon}</span>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium">{command.name}</div>
                    {command.description && (
                      <div className="text-sm text-stone-400 truncate">
                        {command.description}
                      </div>
                    )}
                  </div>
                  {command.shortcut && (
                    <div className="flex items-center gap-1">
                      {command.shortcut.map((key, i) => (
                        <kbd
                          key={i}
                          className={combineClasses(
                            "px-2 py-1 rounded",
                            "bg-stone-800",
                            "text-sm text-stone-400",
                            "border border-stone-700"
                          )}
                        >
                          {key}
                        </kbd>
                      ))}
                    </div>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 