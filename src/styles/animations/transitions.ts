import { keyframes, css } from 'styled-components';

export const transitions = {
  // Base transitions
  duration: {
    fast: '150ms',
    normal: '300ms',
    slow: '500ms'
  },
  
  easing: {
    default: 'cubic-bezier(0.4, 0, 0.2, 1)',
    smooth: 'cubic-bezier(0.4, 0, 0.6, 1)',
    bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)'
  },

  // Keyframe animations
  animations: {
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
  },

  // Reusable animation mixins
  mixins: {
    panelTransition: css`
      transition: transform ${props => props.theme.transitions.duration.normal} ${props => props.theme.transitions.easing.smooth};
    `,
    
    contentFade: css`
      animation: ${props => props.theme.transitions.animations.fadeIn} ${props => props.theme.transitions.duration.normal} ${props => props.theme.transitions.easing.default};
    `,
    
    interactionFeedback: css`
      transition: transform ${props => props.theme.transitions.duration.fast} ${props => props.theme.transitions.easing.bounce};
      
      &:active {
        transform: scale(0.95);
      }
    `
  }
}; 