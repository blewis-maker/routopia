import React, { createContext, useContext, useReducer } from 'react';
import type { 
  SearchState, 
  SettingsState, 
  FeedbackState,
  AppAction 
} from '@/types/state';

interface AppState {
  search: SearchState;
  settings: SettingsState;
  feedback: FeedbackState;
}

const AppStateContext = createContext<{
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
} | undefined>(undefined);

export const AppStateProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(appReducer, initialState);

  return (
    <AppStateContext.Provider value={{ state, dispatch }}>
      {children}
    </AppStateContext.Provider>
  );
};

export const useAppState = () => {
  const context = useContext(AppStateContext);
  if (!context) {
    throw new Error('useAppState must be used within AppStateProvider');
  }
  return context;
}; 