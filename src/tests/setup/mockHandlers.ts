import { http, HttpResponse } from 'msw'

export const handlers = [
  http.get('/api/metrics', () => {
    return HttpResponse.json({
      metrics: []
    }, {
      status: 200
    })
  })
] 