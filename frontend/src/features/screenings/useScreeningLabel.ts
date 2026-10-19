import { nameOf, useList } from '../../api/resource'
import { formatDateTime } from '../../format'
import { moviesApi } from '../movies/moviesApi'
import type { Screening } from './screeningsApi'

/** Names a screening by its movie and its start time: "Inception – 01/11/2026 20:30". */
export function useScreeningLabel() {
  const movies = useList(moviesApi)
  return (screening: Screening) =>
    `${nameOf(movies.data, screening.movieId, (movie) => movie.title)} – ${formatDateTime(screening.startsAt)}`
}
