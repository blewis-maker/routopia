# Troubleshooting Guide

## Common Issues

### Search Component

#### Voice Search Not Working
```typescript
// Problem: Voice search button not appearing or not working
// Solution: Check browser compatibility and permissions

// 1. Check browser support
if (!('SpeechRecognition' in window || 'webkitSpeechRecognition' in window)) {
  console.warn('Voice search not supported in this browser');
}

// 2. Request permissions explicitly
async function requestMicrophonePermission() {
  try {
    await navigator.mediaDevices.getUserMedia({ audio: true });
    return true;
  } catch (error) {
    console.error('Microphone permission denied:', error);
    return false;
  }
}
```

### Feedback System

#### Notifications Not Stacking
```typescript
// Problem: Multiple notifications overwriting each other
// Solution: Ensure proper configuration

// Correct setup
const feedbackSystem = (
  <EnhancedFeedbackSystem
    enableStacking={true}  // Enable stacking
    maxStack={3}           // Set maximum visible notifications
    groupSimilar={true}    // Group similar notifications
  />
);

// Check for existing notifications
const { notifications } = useFeedback();
if (notifications.length >= maxStack) {
  // Handle overflow
  notifications.shift(); // Remove oldest
}
```

### Performance Issues

#### Search Performance
```typescript
// Problem: Search feeling sluggish
// Solution: Implement proper debouncing and caching

// 1. Debounce search requests
const debouncedSearch = useDebounce(searchFunction, 300);

// 2. Cache recent results
const searchCache = new Map();
const cachedSearch = async (query: string) => {
  if (searchCache.has(query)) {
    return searchCache.get(query);
  }
  const results = await performSearch(query);
  searchCache.set(query, results);
  return results;
};
```

[Continues with more troubleshooting scenarios and solutions...] 