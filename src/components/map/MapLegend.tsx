'use client';

import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { cn } from '@/lib/utils';
import { styleGuide as sg } from '@/styles/theme/styleGuide';

interface LegendItem {
  color: string;
  label: string;
}

const LEGEND_ITEMS: LegendItem[] = [
  { color: 'bg-teal-500', label: 'Current Location' },
  { color: 'bg-emerald-500', label: 'Route Start' },
  { color: 'bg-blue-500', label: 'Route End' },
  { color: 'bg-purple-500', label: 'Waypoint' },
];

export function MapLegend() {
  const [isExpanded, setIsExpanded] = useState(true);

  return (
    <div className={cn(
      "absolute bottom-6 right-6 z-10",
      "rounded-md",
      sg.colors.background.primary,
      sg.colors.border.primary,
      "border",
      sg.effects.glass,
      sg.effects.shadow
    )}>
      {/* Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className={cn(
          "w-full px-3 py-2",
          "flex items-center justify-between",
          "border-b",
          isExpanded ? sg.colors.border.primary : "border-transparent",
          sg.effects.transition
        )}
      >
        <span className={cn(
          sg.typography.base,
          sg.typography.sizes.sm,
          sg.colors.text.primary
        )}>
          Legend
        </span>
        {isExpanded ? (
          <ChevronUp className={cn("w-4 h-4", sg.colors.text.secondary)} />
        ) : (
          <ChevronDown className={cn("w-4 h-4", sg.colors.text.secondary)} />
        )}
      </button>

      {/* Content */}
      <div className={cn(
        "grid transition-all duration-200 ease-in-out",
        isExpanded ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
      )}>
        <div className="overflow-hidden">
          <div className={cn(
            "flex flex-col gap-2",
            "p-3"
          )}>
            {LEGEND_ITEMS.map((item, index) => (
              <div 
                key={index} 
                className={cn(
                  "flex items-center gap-2",
                  "transition-opacity duration-200",
                  isExpanded ? "opacity-100" : "opacity-0"
                )}
              >
                <div className={cn(
                  "w-3 h-3 rounded-sm",
                  item.color,
                  sg.effects.shadow
                )} />
                <span className={cn(
                  sg.typography.base,
                  sg.typography.sizes.sm,
                  sg.colors.text.secondary
                )}>
                  {item.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
} 