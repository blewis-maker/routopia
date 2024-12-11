'use client';

import * as React from 'react';
import * as TooltipPrimitive from '@radix-ui/react-tooltip';
import { cn } from '@/lib/utils';
import { styleGuide as sg } from '@/styles/theme/styleGuide';

const TooltipProvider = TooltipPrimitive.Provider;
const TooltipTrigger = TooltipPrimitive.Trigger;
const Tooltip = TooltipPrimitive.Root;

const TooltipContent = React.forwardRef<
  React.ElementRef<typeof TooltipPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TooltipPrimitive.Content>
>(({ className, sideOffset = 4, ...props }, ref) => (
  <TooltipPrimitive.Content
    ref={ref}
    side="bottom"
    align="start"
    sideOffset={sideOffset}
    className={cn(
      // Base styles
      "z-50 overflow-hidden rounded-sm",
      // Colors and effects
      sg.colors.background.primary,
      sg.colors.border.primary,
      "border",
      sg.effects.glass,
      // Typography - matching the trigger text size
      sg.typography.base,
      "text-xs", // Smaller text size
      sg.colors.text.secondary,
      // Spacing
      "px-1.5 py-0.5", // Reduced padding
      // Animation
      "animate-in fade-in-0 zoom-in-95",
      "data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95",
      "data-[side=bottom]:slide-in-from-top-1",
      className
    )}
    {...props}
  />
));
TooltipContent.displayName = TooltipPrimitive.Content.displayName;

export { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider }; 