import { useList } from '../../api/resource'
import { ActionsHeader, ListPage, RowActions } from '../../components/ListPage'
import { QueryContent } from '../../components/QueryContent'
import { useDelete } from '../../forms/useDelete'
import { formatDate, formatDuration } from '../../format'
import { moviesApi, type Movie } from './moviesApi'

export function MoviesPage() {
  const movies = useList(moviesApi)
  const { remove, errorMessage } = useDelete<Movie>({
    ...moviesApi,
    confirmMessage: (movie) => `Supprimer le film « ${movie.title} » ?`,
    // The database refuses to delete a movie that still has screenings
    conflictMessage: (movie) => `Impossible de supprimer « ${movie.title} » : le film a des séances.`,
  })

  return (
    <ListPage title="Films" addTo="/movies/new" addLabel="Ajouter un film" errorMessage={errorMessage}>
      <QueryContent query={movies} errorMessage="Impossible de charger les films.">
        {(movies) =>
          movies.length === 0 ? (
            <p>Aucun film pour le moment.</p>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Titre</th>
                  <th>Durée</th>
                  <th>Sortie</th>
                  <ActionsHeader />
                </tr>
              </thead>
              <tbody>
                {movies.map((movie) => (
                  <tr key={movie.id}>
                    <td>{movie.title}</td>
                    <td>{formatDuration(movie.durationMinutes)}</td>
                    <td>{formatDate(movie.releaseDate)}</td>
                    <RowActions editTo={`/movies/${movie.id}/edit`} onDelete={() => remove(movie)} />
                  </tr>
                ))}
              </tbody>
            </table>
          )
        }
      </QueryContent>
    </ListPage>
  )
}
