import { create } from 'zustand';

interface ProgressState {
  progress: number;
  status: 'idle' | 'loading' | 'complete' | 'error';
  setProgress: (progress: number) => void;
  setStatus: (status: 'idle' | 'loading' | 'complete' | 'error') => void;
  reset: () => void;
}

export const useProgressStore = create<ProgressState>((set) => ({
  progress: 0,
  status: 'idle',
  setProgress: (progress) => set({ progress }),
  setStatus: (status) => set({ status }),
  reset: () => set({ progress: 0, status: 'idle' })
})); 