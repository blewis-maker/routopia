import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ElevationProfile } from '../../components/ElevationProfile';

describe('ElevationProfile', () => {
  const mockElevationData = [
    { distance: 0, elevation: 100, grade: 0 },
    { distance: 2500, elevation: 300, grade: 8 },
    { distance: 5000, elevation: 200, grade: -4 }
  ];

  it('should render elevation metrics correctly', () => {
    render(<ElevationProfile elevation={mockElevationData} />);

    expect(screen.getByText('200m elevation gain')).toBeInTheDocument();
    expect(screen.getByText('Max: 300m')).toBeInTheDocument();
    expect(screen.getByText('Min: 100m')).toBeInTheDocument();
  });

  it('should render SVG elements', () => {
    render(<ElevationProfile elevation={mockElevationData} />);

    expect(screen.getByTestId('elevation-profile')).toBeInTheDocument();
    expect(document.querySelector('path')).toBeInTheDocument();
    expect(document.querySelector('linearGradient')).toBeInTheDocument();
  });

  it('should handle empty elevation data', () => {
    render(<ElevationProfile elevation={[]} />);

    expect(screen.getByText('0m elevation gain')).toBeInTheDocument();
  });

  it('should respect custom dimensions', () => {
    const customWidth = 800;
    const customHeight = 300;

    render(
      <ElevationProfile 
        elevation={mockElevationData} 
        width={customWidth} 
        height={customHeight} 
      />
    );

    const svg = document.querySelector('svg');
    expect(svg).toHaveAttribute('width', customWidth.toString());
    expect(svg).toHaveAttribute('height', customHeight.toString());
  });
}); 