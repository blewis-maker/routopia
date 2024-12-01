interface QuickStartProps {
  onHover: (isHovered: boolean) => void;
}

export default function QuickStart({ onHover }: QuickStartProps) {
  return (
    <button
      className="
        w-full p-4 
        bg-gradient-to-r from-teal-500 to-emerald-500
        hover:from-teal-400 hover:to-emerald-400
        rounded-lg text-stone-900 font-medium
        transition-all duration-300
        transform hover:scale-105
      "
      onMouseEnter={() => onHover(true)}
      onMouseLeave={() => onHover(false)}
      aria-label="Quick start your journey"
    >
      <span className="block text-lg">Start Your Journey</span>
      <span className="block text-sm opacity-80">
        AI-powered route planning
      </span>
    </button>
  );
} 