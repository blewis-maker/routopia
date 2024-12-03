import styled from 'styled-components';

export const Section = styled.section`
  padding: 1rem;
  margin-bottom: 1rem;
  background: var(--bg-secondary);
  border-radius: 0.5rem;
  
  h2, h3 {
    margin-top: 0;
    color: var(--text-primary);
  }
`;

export const Panel = styled.div`
  background: var(--bg-primary);
  border-radius: 0.75rem;
  padding: 1.5rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  
  .route-summary {
    display: grid;
    gap: 1rem;
    margin: 1rem 0;
  }
  
  .waypoints-list {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    margin: 1rem 0;
  }
  
  .route-options {
    display: flex;
    gap: 1rem;
    margin-top: 1rem;
  }
`;

export const Button = styled.button<{ variant?: 'primary' | 'secondary' | 'icon' }>`
  padding: ${props => props.variant === 'icon' ? '0.5rem' : '0.75rem 1.25rem'};
  border-radius: 0.375rem;
  border: none;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  
  ${props => {
    switch (props.variant) {
      case 'primary':
        return `
          background: var(--primary);
          color: white;
          &:hover {
            background: var(--primary-dark);
          }
        `;
      case 'secondary':
        return `
          background: var(--secondary);
          color: var(--text-primary);
          &:hover {
            background: var(--secondary-dark);
          }
        `;
      case 'icon':
        return `
          background: transparent;
          color: var(--text-secondary);
          &:hover {
            background: var(--bg-hover);
          }
        `;
      default:
        return `
          background: var(--primary);
          color: white;
          &:hover {
            background: var(--primary-dark);
          }
        `;
    }
  }}
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

// Add CSS variables to :root in your global styles
export const GlobalStyles = `
  :root {
    --primary: #3B82F6;
    --primary-dark: #2563EB;
    --secondary: #E5E7EB;
    --secondary-dark: #D1D5DB;
    --bg-primary: #FFFFFF;
    --bg-secondary: #F9FAFB;
    --bg-hover: #F3F4F6;
    --text-primary: #111827;
    --text-secondary: #4B5563;
  }

  @media (prefers-color-scheme: dark) {
    :root {
      --primary: #60A5FA;
      --primary-dark: #3B82F6;
      --secondary: #374151;
      --secondary-dark: #1F2937;
      --bg-primary: #111827;
      --bg-secondary: #1F2937;
      --bg-hover: #374151;
      --text-primary: #F9FAFB;
      --text-secondary: #E5E7EB;
    }
  }
`; 