declare module '*.css';
declare module '*.scss';
declare module '*.png';
declare module '*.jpg';
declare module '*.svg';

// Add any other global type declarations here

declare global {
  interface Window {
    __STORE__: {
      activity: {
        setActivity: (activity: string) => void;
      };
      realTime: {
        getState: () => { activityType: string };
      };
    };
  }
}
