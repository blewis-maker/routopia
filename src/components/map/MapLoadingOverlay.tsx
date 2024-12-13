import { cn } from '@/lib/utils';
import { styleGuide as sg } from '@/styles/theme/styleGuide';

export function MapLoadingOverlay() {
  return (
    <div className={cn(
      "absolute inset-0",
      "bg-stone-950/95",
      "backdrop-blur-sm",
      "flex items-center justify-center",
      "transition-all duration-500 ease-in-out",
      sg.effects.glass
    )}>
      <div className={cn(
        "w-24 h-24",
        "relative"
      )}>
        <svg 
          className={cn(
            "w-full h-full",
            "animate-analog-blink",
            "text-neon-teal-off",
            "transition-colors duration-500",
            "filter drop-shadow-[0_0_8px_rgba(20,184,166,0.5)]"
          )}
          xmlns="http://www.w3.org/2000/svg" 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="2" 
          strokeLinecap="round" 
          strokeLinejoin="round"
        >
          <circle cx="12" cy="4.5" r="2.5"/>
          <path d="m10.2 6.3-3.9 3.9"/>
          <circle cx="4.5" cy="12" r="2.5"/>
          <path d="M7 12h10"/>
          <circle cx="19.5" cy="12" r="2.5"/>
          <path d="m13.8 17.7 3.9-3.9"/>
          <circle cx="12" cy="19.5" r="2.5"/>
        </svg>
      </div>
    </div>
  );
} 