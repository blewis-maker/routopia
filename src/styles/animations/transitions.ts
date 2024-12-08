import { keyframes, css } from 'styled-components';

// Timing configurations
export const timing = {
  duration: {
    fast: '150ms',
    normal: '300ms',
    slow: '500ms'
  },
  
  easing: {
    default: 'cubic-bezier(0.4, 0, 0.2, 1)',
    smooth: 'cubic-bezier(0.4, 0, 0.6, 1)',
    bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)'
  }
} as const;

// Styled-components keyframes
export const animationKeyframes = {
  fadeIn: keyframes`
    from { opacity: 0; }
    to { opacity: 1; }
  `,
  
  slideIn: keyframes`
    from { transform: translateX(-100%); }
    to { transform: translateX(0); }
  `,
  
  expand: keyframes`
    from { height: 0; }
    to { height: var(--expanded-height); }
  `
} as const;

// Reusable animation mixins for styled-components
export const animationMixins = {
  panelTransition: css`
    transition: transform ${timing.duration.normal} ${timing.easing.smooth};
  `,
  
  contentFade: css`
    animation: ${animationKeyframes.fadeIn} ${timing.duration.normal} ${timing.easing.default};
  `,
  
  interactionFeedback: css`
    transition: transform ${timing.duration.fast} ${timing.easing.bounce};
    
    &:active {
      transform: scale(0.95);
    }
  `
} as const;

// Main export
export const transitions = {
  timing,
  keyframes: animationKeyframes,
  mixins: animationMixins
} as const; 