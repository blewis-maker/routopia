import { render, screen } from '@testing-library/react';
import { vi } from 'vitest';
import { MainApplicationView } from '../../../components/core/app/MainApplicationView';

// Mock CSS import
vi.mock('../../../styles/components/MainApplicationView.css', () => ({}));

// Mock the stores
vi.mock('../../../store/activity/activity.store', () => ({
  useActivityStore: () => ({
    activities: [],
    currentActivity: null,
    setCurrentActivity: vi.fn()
  })
}));

vi.mock('../../../store/app/mainApplication.store', () => ({
  useMainApplicationStore: () => ({
    isLoading: false,
    setLoading: vi.fn()
  })
}));

// Mock components
vi.mock('../../../components/activity/ActivityControls', () => ({
  ActivityControls: () => <div data-testid="activity-controls">Activity Controls</div>
}));

vi.mock('../../../components/realtime/RealTimeUpdates', () => ({
  RealTimeUpdates: () => <div data-testid="realtime-updates">Real Time Updates</div>
}));

vi.mock('../../../components/feedback/FeedbackInterface', () => ({
  FeedbackInterface: () => <div data-testid="feedback-interface">Feedback Interface</div>
}));

vi.mock('../../../components/visualization/RouteVisualizationComposite', () => ({
  RouteVisualizationComposite: () => <div data-testid="route-visualization">Route Visualization</div>
}));

describe('MainApplicationView', () => {
  it('renders main layout structure', () => {
    render(<MainApplicationView />);
    expect(screen.getByTestId('main-application')).toBeInTheDocument();
  });

  it('renders all major components', () => {
    render(<MainApplicationView />);
    expect(screen.getByTestId('activity-controls')).toBeInTheDocument();
    expect(screen.getByTestId('realtime-updates')).toBeInTheDocument();
    expect(screen.getByTestId('feedback-interface')).toBeInTheDocument();
    expect(screen.getByTestId('route-visualization')).toBeInTheDocument();
  });
}); 