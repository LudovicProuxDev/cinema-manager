import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Link } from 'react-router'
import { ApiError } from '../../api/client'
import { formatDate, formatDuration } from '../../format'
import { movieKeys, moviesApi, type Movie } from './moviesApi'

export function MoviesPage() {
  const queryClient = useQueryClient()
  const movies = useQuery({ queryKey: movieKeys.all, queryFn: moviesApi.list })
  const remove = useMutation({
    mutationFn: (movie: Movie) => moviesApi.delete(movie.id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: movieKeys.all }),
  })

  function handleDelete(movie: Movie) {
    if (window.confirm(`Supprimer le film « ${movie.title} » ?`)) {
      remove.mutate(movie)
    }
  }

  return (
    <>
      <div className="page-header">
        <h1>Films</h1>
        <Link to="/movies/new" className="button">
          Ajouter un film
        </Link>
      </div>

      {remove.isError && (
        <p role="alert" className="alert">
          {deleteErrorMessage(remove.error, remove.variables)}
        </p>
      )}

      {movies.isPending && <p>Chargement…</p>}
      {movies.isError && (
        <p role="alert" className="alert">
          Impossible de charger les films.
        </p>
      )}
      {movies.data?.length === 0 && <p>Aucun film pour le moment.</p>}
      {!!movies.data?.length && (
        <table>
          <thead>
            <tr>
              <th>Titre</th>
              <th>Durée</th>
              <th>Sortie</th>
              <th>
                <span className="visually-hidden">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {movies.data.map((movie) => (
              <tr key={movie.id}>
                <td>{movie.title}</td>
                <td>{formatDuration(movie.durationMinutes)}</td>
                <td>{formatDate(movie.releaseDate)}</td>
                <td className="actions">
                  <Link to={`/movies/${movie.id}/edit`}>Modifier</Link>
                  <button type="button" className="danger" onClick={() => handleDelete(movie)}>
                    Supprimer
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </>
  )
}

function deleteErrorMessage(error: Error, movie: Movie) {
  // 409: the database refuses to delete a movie that still has screenings
  return error instanceof ApiError && error.status === 409
    ? `Impossible de supprimer « ${movie.title} » : le film a des séances.`
    : `La suppression de « ${movie.title} » a échoué.`
}
