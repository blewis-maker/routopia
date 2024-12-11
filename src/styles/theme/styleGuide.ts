export const styleGuide = {
  colors: {
    background: {
      primary: 'bg-[#1B1B1B]',
      secondary: 'bg-[#242424]',
      transparent: 'bg-[#1B1B1B]/95',
      overlay: 'bg-[#1B1B1B]/80',
    },
    text: {
      primary: 'text-stone-200',
      secondary: 'text-stone-300',
      accent: 'text-teal-500',
    },
    border: {
      primary: 'border-stone-800/50',
      secondary: 'border-stone-700/50',
      accent: 'border-teal-500',
    },
    hover: {
      text: 'hover:text-teal-500',
      background: 'hover:bg-[#242424]',
    }
  },
  typography: {
    base: 'font-sans font-medium',
    sizes: {
      sm: 'text-sm',
      base: 'text-base',
      lg: 'text-lg',
    }
  },
  effects: {
    glass: 'backdrop-blur-sm',
    shadow: 'shadow-sm',
    transition: 'transition-colors duration-200',
  },
  animations: {
    blink: 'animate-blink',
    pulse: 'animate-pulse',
    weatherBlink: 'animate-weather-blink',
  }
}; 