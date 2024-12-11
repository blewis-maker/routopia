interface RouteTypeSelectorProps {
  selected: CoreActivityType;
  onChange: (type: CoreActivityType) => void;
}

export function RouteTypeSelector({ selected, onChange }: RouteTypeSelectorProps) {
  return (
    <div className="flex items-center gap-2">
      {(['Drive', 'Bike', 'Run', 'Ski', 'Adventure'] as const).map((type) => (
        <button
          key={type}
          onClick={() => onChange(type)}
          className={`text-xs px-2 py-1 rounded ${
            selected === type
              ? 'bg-stone-700/50 text-stone-200'
              : 'text-stone-400 hover:text-stone-300'
          }`}
        >
          {type}
        </button>
      ))}
    </div>
  );
} 