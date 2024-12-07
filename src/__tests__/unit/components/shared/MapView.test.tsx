import { render, screen, fireEvent } from '@testing-library/react'
import { MapView } from '@/components/shared/MapView'
import { mapboxService } from '@/services/mapbox/client'

jest.mock('@/services/mapbox/client')

describe('MapView', () => {
  const defaultProps = {
    center: [-74.5, 40] as [number, number],
    zoom: 9,
    onMapLoad: jest.fn(),
    onMapClick: jest.fn(),
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('initializes map with correct props', () => {
    render(<MapView {...defaultProps} />)
    
    expect(mapboxService.createMap).toHaveBeenCalledWith(
      expect.objectContaining({
        container: expect.any(HTMLElement),
        center: defaultProps.center,
        zoom: defaultProps.zoom,
      })
    )
  })

  it('handles map load callback', () => {
    render(<MapView {...defaultProps} />)
    
    const map = mapboxService.createMap()
    map.fire('load')
    
    expect(defaultProps.onMapLoad).toHaveBeenCalledWith(map)
  })

  it('handles map click events', () => {
    render(<MapView {...defaultProps} />)
    
    const map = mapboxService.createMap()
    const event = { lngLat: { lng: -74, lat: 40 } }
    map.fire('click', event)
    
    expect(defaultProps.onMapClick).toHaveBeenCalledWith(event)
  })

  it('cleans up map instance on unmount', () => {
    const { unmount } = render(<MapView {...defaultProps} />)
    const map = mapboxService.createMap()
    
    unmount()
    
    expect(map.remove).toHaveBeenCalled()
  })
}) 