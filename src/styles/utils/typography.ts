import { typography } from '../tokens/typography'

type HeadingLevel = 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6'
type TextSize = keyof typeof typography.scale

export const getHeadingStyles = (level: HeadingLevel) => {
  const styles: Record<HeadingLevel, { size: TextSize; tracking: string; leading: number }> = {
    h1: { size: '5xl', tracking: typography.letterSpacing.tight, leading: typography.lineHeight.tight },
    h2: { size: '4xl', tracking: typography.letterSpacing.tight, leading: typography.lineHeight.tight },
    h3: { size: '3xl', tracking: typography.letterSpacing.normal, leading: typography.lineHeight.snug },
    h4: { size: '2xl', tracking: typography.letterSpacing.normal, leading: typography.lineHeight.snug },
    h5: { size: 'xl', tracking: typography.letterSpacing.normal, leading: typography.lineHeight.normal },
    h6: { size: 'lg', tracking: typography.letterSpacing.normal, leading: typography.lineHeight.normal },
  }

  return {
    fontSize: typography.scale[styles[level].size],
    letterSpacing: styles[level].tracking,
    lineHeight: styles[level].leading,
    fontFamily: typography.fonts.primary,
  }
}

export const getBodyStyles = (size: TextSize = 'base') => {
  return {
    fontSize: typography.scale[size],
    letterSpacing: typography.letterSpacing.normal,
    lineHeight: typography.lineHeight.normal,
    fontFamily: typography.fonts.secondary,
  }
} 