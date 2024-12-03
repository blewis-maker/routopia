import { vi } from 'vitest';
import { render, screen, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { RouteCreator } from '@/components/route/RouteCreator';
import { routeService } from '@/services/routeService';

// Mock the route service
vi.mock('@/services/routeService', () => ({
  routeService: {
    saveRoute: vi.fn().mockResolvedValue({ success: true }),
    getCurrentLocation: vi.fn().mockResolvedValue([0, 0])
  }
}));

describe('Critical - Route Operations', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('basic map functionality', async () => {
    await act(async () => {
      render(<RouteCreator />);
    });

    await waitFor(() => {
      expect(routeService.getCurrentLocation).toHaveBeenCalled();
    });
  });

  it('route creation and saving', async () => {
    await act(async () => {
      render(<RouteCreator />);
    });
    
    // Fill in route name
    await act(async () => {
      await userEvent.type(screen.getByLabelText('Route Name'), 'Test Route');
    });
    
    // Click save
    await act(async () => {
      await userEvent.click(screen.getByLabelText('Save Route'));
    });

    await waitFor(() => {
      expect(routeService.saveRoute).toHaveBeenCalled();
      expect(screen.getByText('Route saved successfully')).toBeInTheDocument();
    });
  });
}); 