import React from 'react';

interface MapLegendProps {
  showRiverLegend?: boolean;
  showTributaries?: boolean;
  showPOIs?: boolean;
}

export const MapLegend: React.FC<MapLegendProps> = ({
  showRiverLegend = true,
  showTributaries = true,
  showPOIs = true,
}) => {
  return (
    <div className="absolute bottom-4 left-4 bg-white/90 dark:bg-stone-800/90 p-4 rounded-lg shadow-lg">
      <h3 className="text-sm font-semibold mb-2">Route Legend</h3>
      
      {showRiverLegend && (
        <div className="flex items-center gap-2 mb-2">
          <div className="w-8 h-1 bg-blue-600 rounded-full" />
          <span className="text-xs">Main Route</span>
        </div>
      )}
      
      {showTributaries && (
        <div className="flex items-center gap-2 mb-2">
          <div className="w-8 h-0.5 bg-blue-400 rounded-full" />
          <span className="text-xs">Tributaries</span>
        </div>
      )}
      
      {showPOIs && (
        <>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-3 h-3 rounded-full bg-emerald-500" />
            <span className="text-xs">Scenic Points</span>
          </div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-3 h-3 rounded-full bg-amber-500" />
            <span className="text-xs">Activities</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-indigo-500" />
            <span className="text-xs">Rest Areas</span>
          </div>
        </>
      )}
    </div>
  );
}; 