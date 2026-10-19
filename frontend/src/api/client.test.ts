import { http, HttpResponse } from 'msw'
import { describe, expect, it } from 'vitest'
import { server } from '../test/server'
import { api, ApiError } from './client'

describe('api', () => {
  it('gets JSON from the API under /api', async () => {
    server.use(http.get('/api/movies', () => HttpResponse.json([{ id: 1 }])))

    expect(await api.get('/movies')).toEqual([{ id: 1 }])
  })

  it('sends the body as JSON', async () => {
    let received: unknown
    let contentType: string | null = null
    server.use(
      http.post('/api/movies', async ({ request }) => {
        contentType = request.headers.get('Content-Type')
        received = await request.json()
        return HttpResponse.json({ id: 1 }, { status: 201 })
      }),
    )

    expect(await api.post('/movies', { title: 'Inception' })).toEqual({ id: 1 })
    expect(received).toEqual({ title: 'Inception' })
    expect(contentType).toBe('application/json')
  })

  it('returns nothing for 204 No Content', async () => {
    server.use(http.put('/api/movies/1', () => new HttpResponse(null, { status: 204 })))

    expect(await api.put('/movies/1', {})).toBeUndefined()
  })

  it('deletes', async () => {
    let deleted = false
    server.use(
      http.delete('/api/movies/1', () => {
        deleted = true
        return new HttpResponse(null, { status: 204 })
      }),
    )

    await api.delete('/movies/1')

    expect(deleted).toBe(true)
  })

  it('throws an ApiError with the status and the detail of the problem', async () => {
    server.use(
      http.delete('/api/movies/1', () =>
        HttpResponse.json({ status: 409, title: 'Conflict', detail: 'Still referenced.' }, { status: 409 }),
      ),
    )

    const error = await api.delete('/movies/1').catch((e: unknown) => e)

    expect(error).toBeInstanceOf(ApiError)
    expect(error).toMatchObject({ status: 409, message: 'Still referenced.' })
  })

  it('exposes the validation errors by field, in camelCase like the JSON', async () => {
    server.use(
      http.post('/api/movies', () =>
        HttpResponse.json(
          { title: 'One or more validation errors occurred.', errors: { DurationMinutes: ['Too short.'] } },
          { status: 400 },
        ),
      ),
    )

    const error = (await api.post('/movies', {}).catch((e: unknown) => e)) as ApiError

    expect(error.fieldErrors).toEqual({ durationMinutes: ['Too short.'] })
    expect(error.message).toBe('One or more validation errors occurred.')
  })

  it('throws an ApiError even when the error has no JSON body', async () => {
    server.use(http.get('/api/movies', () => new HttpResponse('Bad gateway', { status: 502 })))

    const error = (await api.get('/movies').catch((e: unknown) => e)) as ApiError

    expect(error).toBeInstanceOf(ApiError)
    expect(error.status).toBe(502)
    expect(error.fieldErrors).toEqual({})
  })
})
