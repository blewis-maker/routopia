import React from 'react';

interface POI {
  id: string;
  name: string;
  type: string;
  rating?: number;
  address: string;
  distance?: number;
  openNow?: boolean;
  photos?: string[];
}

interface Props {
  poi: POI;
  onSelect: (poi: POI) => void;
}

export const POICard: React.FC<Props> = ({ poi, onSelect }) => {
  return (
    <div 
      className="poi-card bg-stone-800 rounded-lg p-4 cursor-pointer hover:bg-stone-700 transition-colors"
      onClick={() => onSelect(poi)}
    >
      <h3 className="text-lg font-semibold text-white">{poi.name}</h3>
      {poi.rating && (
        <div className="flex items-center gap-1 text-amber-400">
          <span>{poi.rating}</span>
          <StarIcon className="w-4 h-4" />
        </div>
      )}
      <p className="text-stone-300 text-sm mt-1">{poi.address}</p>
      {poi.distance && (
        <p className="text-stone-400 text-sm mt-1">{poi.distance.toFixed(1)} km away</p>
      )}
      {typeof poi.openNow !== 'undefined' && (
        <p className={`text-sm mt-1 ${poi.openNow ? 'text-emerald-400' : 'text-red-400'}`}>
          {poi.openNow ? 'Open Now' : 'Closed'}
        </p>
      )}
    </div>
  );
}; 