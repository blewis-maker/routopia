export const mockStravaAuthCode = 'test_auth_code_123';

export const mockStravaTokenResponse = {
  access_token: 'mock_access_token',
  refresh_token: 'mock_refresh_token',
  expires_at: Date.now() + 21600,
  athlete: {
    id: 'test_athlete_id'
  }
};

export const mockStravaActivity = {
  id: '12345',
  type: 'Ride',
  start_date: '2024-03-14T10:00:00Z',
  elapsed_time: 3600,
  moving_time: 3500,
  distance: 20000,
  total_elevation_gain: 500,
  average_speed: 5.5,
  max_speed: 12.3,
  athlete: { id: 'user123' },
  name: 'Test Activity',
  description: 'Test activity description'
}; 