import { getTypographyClass, getColorVar } from './formatters'
import { TypographyScale, ColorToken } from './type-guards'

const typographyCache = new Map<TypographyScale, string>()
const colorCache = new Map<ColorToken, string>()

export const getCachedTypographyClass = (scale: TypographyScale) => {
  if (!typographyCache.has(scale)) {
    typographyCache.set(scale, getTypographyClass(scale))
  }
  return typographyCache.get(scale)!
}

export const getCachedColorVar = (token: ColorToken) => {
  if (!colorCache.has(token)) {
    colorCache.set(token, getColorVar(token))
  }
  return colorCache.get(token)!
}

// Add to existing performance optimizations
export const memoizedStyleCalculation = <T extends (...args: any[]) => string>(
  fn: T,
  cacheSize = 100
) => {
  const cache = new Map<string, string>()
  
  return (...args: Parameters<T>): string => {
    const key = JSON.stringify(args)
    
    if (!cache.has(key)) {
      if (cache.size >= cacheSize) {
        // Clear oldest entry if cache is full
        const firstKey = cache.keys().next().value
        cache.delete(firstKey)
      }
      cache.set(key, fn(...args))
    }
    
    return cache.get(key)!
  }
} 