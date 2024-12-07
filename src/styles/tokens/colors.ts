export const colors = {
  brand: {
    primary: {
      50: '#E6FFF9',
      100: '#B3FFE6',
      200: '#80FFD9',
      300: '#4DFFCC',
      400: '#1AFFBF',
      500: '#00E6A6',
      600: '#00B380',
      700: '#008059',
      800: '#004D33',
      900: '#001A0C',
    },
    secondary: {
      50: '#F0FDF4',
      100: '#DCFCE7',
      200: '#BBF7D0',
      300: '#86EFAC',
      400: '#4ADE80',
      500: '#22C55E',
      600: '#16A34A',
      700: '#15803D',
      800: '#166534',
      900: '#14532D',
    },
  },
  neutral: {
    50: '#FAFAFA',
    100: '#F4F4F5',
    200: '#E4E4E7',
    300: '#D4D4D8',
    400: '#A1A1AA',
    500: '#71717A',
    600: '#52525B',
    700: '#3F3F46',
    800: '#27272A',
    900: '#18181B',
    950: '#121212',
  },
  surface: {
    light: {
      primary: '#FFFFFF',
      secondary: '#F8FAFC',
      tertiary: '#F1F5F9',
    },
    dark: {
      primary: '#121212',
      secondary: '#1E1E1E',
      tertiary: '#2A2A2A',
    },
  },
  text: {
    light: {
      primary: '#18181B',   // neutral-900
      secondary: '#3F3F46', // neutral-700
      tertiary: '#71717A',  // neutral-500
    },
    dark: {
      primary: '#FAFAFA',   // neutral-50
      secondary: '#E4E4E7', // neutral-200
      tertiary: '#A1A1AA',  // neutral-400
    },
  },
  state: {
    success: {
      light: '#22C55E',
      dark: '#4ADE80',
    },
    error: {
      light: '#EF4444',
      dark: '#FCA5A5',
    },
    warning: {
      light: '#F59E0B',
      dark: '#FCD34D',
    },
    info: {
      light: '#3B82F6',
      dark: '#93C5FD',
    },
  },
} as const; 