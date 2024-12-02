import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { TrafficOverlay } from '../../components/TrafficOverlay';

describe('TrafficOverlay', () => {
  const mockSegments = [
    {
      start: [0, 0],
      end: [100, 100],
      congestion: 'heavy' as const,
      speed: 15
    },
    {
      start: [100, 100],
      end: [200, 200],
      congestion: 'moderate' as const,
      speed: 30
    },
    {
      start: [200, 200],
      end: [300, 300],
      congestion: 'low' as const,
      speed: 60
    }
  ];

  it('should render all traffic segments', () => {
    render(<TrafficOverlay segments={mockSegments} />);
    
    const lines = document.querySelectorAll('line');
    expect(lines).toHaveLength(mockSegments.length);
  });

  it('should apply correct colors based on congestion', () => {
    render(<TrafficOverlay segments={mockSegments} />);
    
    const lines = document.querySelectorAll('line');
    expect(lines[0]).toHaveAttribute('stroke', '#FF4444'); // heavy
    expect(lines[1]).toHaveAttribute('stroke', '#FFAA00'); // moderate
    expect(lines[2]).toHaveAttribute('stroke', '#44FF44'); // low
  });

  it('should include speed information in tooltips', () => {
    render(<TrafficOverlay segments={mockSegments} />);
    
    const titles = document.querySelectorAll('title');
    expect(titles[0]).toHaveTextContent('Traffic: heavy (15 km/h)');
  });

  it('should handle segments without speed data', () => {
    const segmentsWithoutSpeed = mockSegments.map(({ speed, ...segment }) => segment);
    render(<TrafficOverlay segments={segmentsWithoutSpeed} />);
    
    const titles = document.querySelectorAll('title');
    expect(titles[0]).toHaveTextContent('Traffic: heavy');
  });
}); 