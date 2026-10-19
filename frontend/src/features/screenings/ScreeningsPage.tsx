import { nameOf, useList } from '../../api/resource'
import { ActionsHeader, ListPage, RowActions } from '../../components/ListPage'
import { QueryContent } from '../../components/QueryContent'
import { formatDateTime, formatPrice } from '../../format'
import { useDelete } from '../../forms/useDelete'
import { moviesApi } from '../movies/moviesApi'
import { roomsApi } from '../rooms/roomsApi'
import { screeningsApi, type Screening } from './screeningsApi'

export function ScreeningsPage() {
  const screenings = useList(screeningsApi)
  const movies = useList(moviesApi)
  const rooms = useList(roomsApi)
  const movieTitle = (screening: Screening) => nameOf(movies.data, screening.movieId, (movie) => movie.title)
  const describe = (screening: Screening) =>
    `la séance « ${movieTitle(screening)} » du ${formatDateTime(screening.startsAt)}`
  const { remove, errorMessage } = useDelete<Screening>({
    ...screeningsApi,
    confirmMessage: (screening) => `Supprimer ${describe(screening)} ?`,
    conflictMessage: (screening) => `Impossible de supprimer ${describe(screening)} : elle a des réservations.`,
  })

  return (
    <ListPage title="Séances" addTo="/screenings/new" addLabel="Ajouter une séance" errorMessage={errorMessage}>
      <QueryContent query={screenings} errorMessage="Impossible de charger les séances.">
        {(screenings) =>
          screenings.length === 0 ? (
            <p>Aucune séance pour le moment.</p>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Film</th>
                  <th>Salle</th>
                  <th>Début</th>
                  <th>Prix</th>
                  <ActionsHeader />
                </tr>
              </thead>
              <tbody>
                {screenings.map((screening) => (
                  <tr key={screening.id}>
                    <td>{movieTitle(screening)}</td>
                    <td>{nameOf(rooms.data, screening.roomId, (room) => room.name)}</td>
                    <td>{formatDateTime(screening.startsAt)}</td>
                    <td>{formatPrice(screening.price)}</td>
                    <RowActions editTo={`/screenings/${screening.id}/edit`} onDelete={() => remove(screening)} />
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
