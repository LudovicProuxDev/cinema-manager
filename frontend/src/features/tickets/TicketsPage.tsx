import { nameOf, useList } from '../../api/resource'
import { ActionsHeader, ListPage, RowActions } from '../../components/ListPage'
import { QueryContent } from '../../components/QueryContent'
import { formatPrice } from '../../format'
import { useDelete } from '../../forms/useDelete'
import { reservationsApi } from '../reservations/reservationsApi'
import { roomsApi } from '../rooms/roomsApi'
import { seatLabel, seatsApi, type Seat } from '../seats/seatsApi'
import { ticketsApi, type Ticket } from './ticketsApi'
import { useReservationLabels } from './useReservationLabels'

export function TicketsPage() {
  const tickets = useList(ticketsApi)
  const reservations = useList(reservationsApi)
  const seats = useList(seatsApi)
  const rooms = useList(roomsApi)
  const { reservationLabel, screeningLabel } = useReservationLabels()
  /** "Salle 1 – A12" */
  const seatOfTheRoom = (seat: Seat) => `${nameOf(rooms.data, seat.roomId, (room) => room.name)} – ${seatLabel(seat)}`
  const { remove, errorMessage } = useDelete<Ticket>({
    ...ticketsApi,
    confirmMessage: (ticket) =>
      `Supprimer le billet du siège ${nameOf(seats.data, ticket.seatId, seatLabel)} de la réservation n° ${ticket.reservationId} ?`,
  })

  return (
    <ListPage title="Billets" addTo="/tickets/new" addLabel="Ajouter un billet" errorMessage={errorMessage}>
      <QueryContent query={tickets} errorMessage="Impossible de charger les billets.">
        {(tickets) =>
          tickets.length === 0 ? (
            <p>Aucun billet pour le moment.</p>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Réservation</th>
                  <th>Séance</th>
                  <th>Siège</th>
                  <th>Prix</th>
                  <ActionsHeader />
                </tr>
              </thead>
              <tbody>
                {tickets.map((ticket) => (
                  <tr key={ticket.id}>
                    <td>{nameOf(reservations.data, ticket.reservationId, reservationLabel)}</td>
                    <td>{nameOf(reservations.data, ticket.reservationId, screeningLabel)}</td>
                    <td>{nameOf(seats.data, ticket.seatId, seatOfTheRoom)}</td>
                    <td>{formatPrice(ticket.price)}</td>
                    <RowActions editTo={`/tickets/${ticket.id}/edit`} onDelete={() => remove(ticket)} />
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
