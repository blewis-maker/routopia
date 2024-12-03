import { http, HttpResponse } from 'msw'

export const handlers = [
  http.post('*/api/auth/login', () => {
    return HttpResponse.json({
      token: 'mock-token',
      user: { id: '1', email: 'test@example.com' }
    })
  }),

  http.post('*/api/routes', () => {
    return HttpResponse.json({
      id: 'route-123',
      name: 'Test Route',
      points: [[0, 0], [1, 1]]
    })
  }),

  http.get('*/api/routes/:id', () => {
    return HttpResponse.json({
      id: 'route-123',
      name: 'Test Route',
      points: [[0, 0], [1, 1]]
    })
  })
] 