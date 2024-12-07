const logger = typeof window === 'undefined' 
  ? require('./server').default 
  : require('./client').default;

export default logger; 