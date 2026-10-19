import { createResourceApi } from '../../api/resource'

/** A movie, as returned by the API. */
export interface Movie {
  id: number
  title: string
  description: string | null
  durationMinutes: number
  /** A date without time: "2010-07-16". */
  releaseDate: string
}

/** A movie to create or replace. */
export type MovieRequest = Omit<Movie, 'id'>

export const moviesApi = createResourceApi<Movie, MovieRequest>('/movies')
