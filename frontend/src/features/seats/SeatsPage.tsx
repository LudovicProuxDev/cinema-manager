import { nameOf, useList } from '../../api/resource'
import { ActionsHeader, ListPage, RowActions } from '../../components/ListPage'
import { QueryContent } from '../../components/QueryContent'
import { useDelete } from '../../forms/useDelete'
import { roomsApi } from '../rooms/roomsApi'
import { seatLabel, seatsApi, type Seat } from './seatsApi'

export function SeatsPage() {
  const seats = useList(seatsApi)
  const rooms = useList(roomsApi)
  const roomName = (seat: Seat) => nameOf(rooms.data, seat.roomId, (room) => room.name)
  const { remove, errorMessage } = useDelete<Seat>({
    ...seatsApi,
    confirmMessage: (seat) => `Supprimer le siège ${seatLabel(seat)} de la salle « ${roomName(seat)} » ?`,
    conflictMessage: (seat) => `Impossible de supprimer le siège ${seatLabel(seat)} : des billets sont vendus pour lui.`,
  })

  return (
    <ListPage title="Sièges" addTo="/seats/new" addLabel="Ajouter un siège" errorMessage={errorMessage}>
      <QueryContent query={seats} errorMessage="Impossible de charger les sièges.">
        {(seats) =>
          seats.length === 0 ? (
            <p>Aucun siège pour le moment.</p>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Salle</th>
                  <th>Rang</th>
                  <th>Numéro</th>
                  <ActionsHeader />
                </tr>
              </thead>
              <tbody>
                {seats.map((seat) => (
                  <tr key={seat.id}>
                    <td>{roomName(seat)}</td>
                    <td>{seat.row}</td>
                    <td>{seat.number}</td>
                    <RowActions editTo={`/seats/${seat.id}/edit`} onDelete={() => remove(seat)} />
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
