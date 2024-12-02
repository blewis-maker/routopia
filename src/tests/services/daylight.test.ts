import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getDaylightInfo } from '../../services/daylight';

describe('Daylight Service', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    global.fetch = vi.fn();
  });

  it('should fetch and parse daylight data correctly', async () => {
    const mockResponse = {
      results: {
        sunrise: '2024-03-15T06:00:00.000Z',
        sunset: '2024-03-15T18:00:00.000Z'
      }
    };

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse
    });

    const daylight = await getDaylightInfo();

    expect(daylight).toMatchObject({
      isDaytime: expect.any(Boolean),
      remainingDaylight: expect.any(Number),
      sunriseTime: expect.any(Number),
      sunsetTime: expect.any(Number)
    });
  });

  it('should handle API errors with fallback data', async () => {
    (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('API Error'));

    const daylight = await getDaylightInfo();

    expect(daylight).toMatchObject({
      isDaytime: expect.any(Boolean),
      remainingDaylight: 8,
      sunriseTime: expect.any(Number),
      sunsetTime: expect.any(Number)
    });
  });
}); 