export function generateId(): string {
  return 'route_' + Math.random().toString(36).substring(2, 15);
} 