import type { UseQueryResult } from '@tanstack/react-query'
import type { ReactNode } from 'react'
import { ApiError } from '../api/client'
import { Alert } from './Alert'

interface QueryContentProps<T> {
  query: UseQueryResult<T>
  /** Shown when the API cannot be reached or fails. */
  errorMessage: string
  /** Shown when the API answers 404 Not Found. */
  notFoundMessage?: string
  /** Renders the data, once loaded. */
  children: (data: T) => ReactNode
}

/** Shows the loading or the error of a query, then its data. */
export function QueryContent<T>({ query, errorMessage, notFoundMessage, children }: QueryContentProps<T>) {
  if (query.isPending) return <p>Chargement…</p>
  if (query.isError) {
    const notFound = query.error instanceof ApiError && query.error.status === 404
    return <Alert>{notFound && notFoundMessage ? notFoundMessage : errorMessage}</Alert>
  }
  return children(query.data)
}
