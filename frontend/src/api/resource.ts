import { useQuery } from '@tanstack/react-query'
import { api } from './client'

/**
 * The CRUD endpoints of a resource of the API (e.g. /movies),
 * and the keys under which TanStack Query caches it.
 */
export function createResourceApi<T, TRequest>(path: string) {
  return {
    keys: {
      all: [path] as const,
      detail: (id: number) => [path, id] as const,
    },
    list: () => api.get<T[]>(path),
    get: (id: number) => api.get<T>(`${path}/${id}`),
    create: (request: TRequest) => api.post<T>(path, request),
    update: (id: number, request: TRequest) => api.put(`${path}/${id}`, request),
    delete: (id: number) => api.delete(`${path}/${id}`),
  }
}

export type ResourceApi<T, TRequest> = ReturnType<typeof createResourceApi<T, TRequest>>

/** All the items of a resource, e.g. to show a list or fill a select. */
export function useList<T, TRequest>(resource: ResourceApi<T, TRequest>) {
  return useQuery({ queryKey: resource.keys.all, queryFn: resource.list })
}

/** One item of a resource, e.g. to fill the edit form. */
export function useItem<T, TRequest>(resource: ResourceApi<T, TRequest>, id: number) {
  return useQuery({ queryKey: resource.keys.detail(id), queryFn: () => resource.get(id) })
}

/** The item with the given id, if loaded. */
export function findById<T extends { id: number }>(items: T[] | undefined, id: number): T | undefined {
  return items?.find((item) => item.id === id)
}

/** Names the item with the given id, e.g. the room of a seat; empty while the items are loading. */
export function nameOf<T extends { id: number }>(items: T[] | undefined, id: number, label: (item: T) => string): string {
  const item = findById(items, id)
  return item ? label(item) : ''
}
