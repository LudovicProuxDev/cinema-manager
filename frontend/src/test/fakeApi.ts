import { http, HttpResponse } from 'msw'
import { server } from './server'

/** What a fake resource received: the last request created and updated, the last id deleted. */
export interface Received {
  created?: unknown
  updated?: unknown
  deletedId?: number
}

/**
 * Serves a resource of the API (e.g. "/rooms") holding the given items, like the real API:
 * list, get (404 if unknown), create, update and delete. Returns what it received.
 * `complete` adds the fields set by the server to a created item (e.g. the price of a ticket).
 */
export function fakeResource<T extends { id: number }>(
  path: string,
  items: T[],
  complete: (request: Record<string, unknown>) => Partial<T> = () => ({}),
): Received {
  const received: Received = {}
  const url = `/api${path}`

  server.use(
    http.get(url, () => HttpResponse.json(items)),
    http.get(`${url}/:id`, ({ params }) => {
      const item = items.find((i) => i.id === Number(params.id))
      return item ? HttpResponse.json(item) : HttpResponse.json({ status: 404 }, { status: 404 })
    }),
    http.post(url, async ({ request }) => {
      const body = (await request.json()) as Record<string, unknown>
      received.created = body
      const item = { ...body, ...complete(body), id: Math.max(0, ...items.map((i) => i.id)) + 1 } as T
      items = [...items, item]
      return HttpResponse.json(item, { status: 201 })
    }),
    http.put(`${url}/:id`, async ({ request, params }) => {
      const body = (await request.json()) as Partial<T>
      received.updated = body
      items = items.map((i) => (i.id === Number(params.id) ? { ...i, ...body } : i))
      return new HttpResponse(null, { status: 204 })
    }),
    http.delete(`${url}/:id`, ({ params }) => {
      received.deletedId = Number(params.id)
      items = items.filter((i) => i.id !== Number(params.id))
      return new HttpResponse(null, { status: 204 })
    }),
  )
  return received
}

/** Makes the API answer an error (e.g. 409) to the requests of the given method on a path. */
export function failWith(method: 'post' | 'put' | 'delete', path: string, status: number) {
  server.use(http[method](`/api${path}`, () => HttpResponse.json({ status }, { status })))
}
