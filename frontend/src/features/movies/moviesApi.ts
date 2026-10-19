import { api } from '../../api/client'

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

/** The keys under which TanStack Query caches the movies. */
export const movieKeys = {
  all: ['movies'] as const,
  detail: (id: number) => ['movies', id] as const,
}

export const moviesApi = {
  list: () => api.get<Movie[]>('/movies'),
  get: (id: number) => api.get<Movie>(`/movies/${id}`),
  create: (movie: MovieRequest) => api.post<Movie>('/movies', movie),
  update: (id: number, movie: MovieRequest) => api.put(`/movies/${id}`, movie),
  delete: (id: number) => api.delete(`/movies/${id}`),
}
