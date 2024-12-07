import { typography } from './typography'
import { colors } from './colors'

export const tokens = {
  typography,
  colors,
} as const

export type TypographyToken = typeof typography
export type ColorToken = typeof colors 