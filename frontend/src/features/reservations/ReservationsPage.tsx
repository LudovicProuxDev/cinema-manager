import { nameOf, useList } from '../../api/resource'
import { ActionsHeader, ListPage, RowActions } from '../../components/ListPage'
import { QueryContent } from '../../components/QueryContent'
import { formatDateTime } from '../../format'
import { useDelete } from '../../forms/useDelete'
import { screeningsApi } from '../screenings/screeningsApi'
import { useScreeningLabel } from '../screenings/useScreeningLabel'
import { fullName, usersApi } from '../users/usersApi'
import { reservationsApi, type Reservation } from './reservationsApi'

export function ReservationsPage() {
  const reservations = useList(reservationsApi)
  const users = useList(usersApi)
  const screenings = useList(screeningsApi)
  const screeningLabel = useScreeningLabel()
  const { remove, errorMessage } = useDelete<Reservation>({
    ...reservationsApi,
    // Its tickets are deleted with it: no conflict possible
    confirmMessage: (reservation) => `Supprimer la réservation n° ${reservation.id} et ses billets ?`,
  })

  return (
    <ListPage
      title="Réservations"
      addTo="/reservations/new"
      addLabel="Ajouter une réservation"
      errorMessage={errorMessage}
    >
      <QueryContent query={reservations} errorMessage="Impossible de charger les réservations.">
        {(reservations) =>
          reservations.length === 0 ? (
            <p>Aucune réservation pour le moment.</p>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>N°</th>
                  <th>Utilisateur</th>
                  <th>Séance</th>
                  <th>Réservée le</th>
                  <ActionsHeader />
                </tr>
              </thead>
              <tbody>
                {reservations.map((reservation) => (
                  <tr key={reservation.id}>
                    <td>{reservation.id}</td>
                    <td>{nameOf(users.data, reservation.userId, fullName)}</td>
                    <td>{nameOf(screenings.data, reservation.screeningId, screeningLabel)}</td>
                    <td>{formatDateTime(reservation.createdAt)}</td>
                    <RowActions editTo={`/reservations/${reservation.id}/edit`} onDelete={() => remove(reservation)} />
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
