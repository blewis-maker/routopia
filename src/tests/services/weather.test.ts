import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getCurrentWeather } from '../../services/weather';

describe('Weather Service', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    global.fetch = vi.fn();
  });

  it('should fetch and parse weather data correctly', async () => {
    const mockWeatherResponse = {
      main: {
        temp: 20,
        humidity: 65
      },
      wind: {
        speed: 5
      },
      weather: [
        { main: 'Clear' }
      ],
      visibility: 10000
    };

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockWeatherResponse
    });

    const weather = await getCurrentWeather();

    expect(weather).toEqual({
      temperature: 20,
      windSpeed: 5,
      condition: 'clear',
      humidity: 65,
      visibility: 10000
    });
  });

  it('should handle API errors gracefully', async () => {
    (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('API Error'));

    const weather = await getCurrentWeather();

    expect(weather).toEqual({
      temperature: 20,
      windSpeed: 5,
      condition: 'clear',
      humidity: 50,
      visibility: 10000
    });
  });
}); 