import { Plus, Minus } from 'lucide-react';
import { AccessibleComponents } from '../AccessibilityEnhancements';

interface MapControlsProps {
  onZoomIn: () => void;
  onZoomOut: () => void;
}

export function MapControls({ onZoomIn, onZoomOut }: MapControlsProps) {
  return (
    <div className="
      absolute top-4 right-4 
      flex flex-col space-y-2
    ">
      <AccessibleComponents.Button
        onClick={onZoomIn}
        description="Zoom in"
        className="
          p-2 rounded-lg
          bg-stone-900/80 backdrop-blur-sm
          hover:bg-stone-800
          transition-colors
        "
      >
        <Plus className="h-4 w-4" />
      </AccessibleComponents.Button>

      <AccessibleComponents.Button
        onClick={onZoomOut}
        description="Zoom out"
        className="
          p-2 rounded-lg
          bg-stone-900/80 backdrop-blur-sm
          hover:bg-stone-800
          transition-colors
        "
      >
        <Minus className="h-4 w-4" />
      </AccessibleComponents.Button>
    </div>
  );
} 