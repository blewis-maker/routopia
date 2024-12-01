import { createContext, useContext, useState, useEffect } from 'react';
import { designSystem } from '../system/designSystem';
import { transitions } from '../animations/transitions';

// Theme interface
export interface Theme {
  mode: 'light' | 'dark';
  colors: typeof designSystem.colors;
  typography: typeof designSystem.typography;
  spacing: typeof designSystem.spacing;
  transitions: typeof transitions;
  elevation: {
    small: string;
    medium: string;
    large: string;
  };
}

// Theme variants
export const themes = {
  light: {
    mode: 'light',
    colors: {
      ...designSystem.colors,
      background: {
        primary: '#FFFFFF',
        secondary: '#F8FAFC',
        tertiary: '#F1F5F9'
      },
      text: {
        primary: '#0F172A',
        secondary: '#334155',
        tertiary: '#64748B'
      }
    },
    elevation: {
      small: '0 1px 2px rgba(0, 0, 0, 0.05)',
      medium: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
      large: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
    }
  },
  dark: {
    mode: 'dark',
    colors: {
      ...designSystem.colors,
      background: {
        primary: '#0F172A',
        secondary: '#1E293B',
        tertiary: '#334155'
      },
      text: {
        primary: '#F8FAFC',
        secondary: '#E2E8F0',
        tertiary: '#CBD5E1'
      }
    },
    elevation: {
      small: '0 1px 2px rgba(0, 0, 0, 0.3)',
      medium: '0 4px 6px -1px rgba(0, 0, 0, 0.4)',
      large: '0 10px 15px -3px rgba(0, 0, 0, 0.5)'
    }
  }
} as const; 