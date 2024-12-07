import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { RoutePlannerPage } from '@/app/(dashboard)/route-planner/page'
import { routeService } from '@/services/api/routes'
import { weatherService } from '@/services/weather/client'

jest.mock('@/services/api/routes')
jest.mock('@/services/weather/client')

describe('Route Planning Flow', () => {
  const mockRoute = {
    id: '1',
    name: 'Test Route',
    waypoints: [
      { lat: 40, lng: -74 },
      { lat: 41, lng: -75 },
    ],
  }

  beforeEach(() => {
    jest.clearAllMocks()
    ;(routeService.createRoute as jest.Mock).mockResolvedValue(mockRoute)
    ;(routeService.optimizeRoute as jest.Mock).mockResolvedValue({
      ...mockRoute,
      optimized: true,
    })
    ;(weatherService.getWeatherForRoute as jest.Mock).mockResolvedValue({
      temperature: 20,
      conditions: 'Clear',
    })
  })

  it('creates and optimizes a route', async () => {
    const user = userEvent.setup()
    render(<RoutePlannerPage />)

    // Create route
    await user.click(screen.getByRole('button', { name: /create route/i }))
    
    // Add waypoints
    await user.click(screen.getByRole('button', { name: /add point/i }))
    await user.type(screen.getByLabelText(/route name/i), 'Test Route')
    
    // Optimize
    await user.click(screen.getByRole('button', { name: /optimize/i }))
    
    await waitFor(() => {
      expect(routeService.optimizeRoute).toHaveBeenCalled()
      expect(screen.getByText(/route optimized/i)).toBeInTheDocument()
    })
  })

  it('displays weather information for the route', async () => {
    render(<RoutePlannerPage />)
    
    await waitFor(() => {
      expect(weatherService.getWeatherForRoute).toHaveBeenCalled()
      expect(screen.getByText(/20°/)).toBeInTheDocument()
      expect(screen.getByText(/clear/i)).toBeInTheDocument()
    })
  })

  it('handles route creation errors gracefully', async () => {
    const user = userEvent.setup()
    ;(routeService.createRoute as jest.Mock).mockRejectedValue(new Error('Failed to create route'))
    
    render(<RoutePlannerPage />)
    
    await user.click(screen.getByRole('button', { name: /create route/i }))
    
    await waitFor(() => {
      expect(screen.getByText(/failed to create route/i)).toBeInTheDocument()
    })
  })
}) 