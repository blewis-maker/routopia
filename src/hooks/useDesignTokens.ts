import { tokens } from '@/styles/tokens'

export const useDesignTokens = () => {
  return {
    ...tokens,
    // Add computed values or theme-specific overrides here
    getColorValue: (path: string) => {
      const parts = path.split('.')
      let value: any = tokens.colors
      for (const part of parts) {
        value = value[part]
      }
      return value
    },
    getTypographyValue: (path: string) => {
      const parts = path.split('.')
      let value: any = tokens.typography
      for (const part of parts) {
        value = value[part]
      }
      return value
    }
  }
} 