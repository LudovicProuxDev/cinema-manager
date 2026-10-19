import { QueryClient } from '@tanstack/react-query'
import { ApiError } from './client'

/** Retries a failed read, unless the request itself is wrong (4xx): it would fail again. */
export function shouldRetry(failureCount: number, error: Error) {
  if (error instanceof ApiError && error.status < 500) return false
  return failureCount < 2
}

/** The cache of the data read from the API (https://tanstack.com/query). */
export function createQueryClient() {
  return new QueryClient({ defaultOptions: { queries: { retry: shouldRetry } } })
}
