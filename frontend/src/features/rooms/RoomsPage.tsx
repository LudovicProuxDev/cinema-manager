import { useList } from '../../api/resource'
import { ActionsHeader, ListPage, RowActions } from '../../components/ListPage'
import { QueryContent } from '../../components/QueryContent'
import { useDelete } from '../../forms/useDelete'
import { roomsApi, type Room } from './roomsApi'

export function RoomsPage() {
  const rooms = useList(roomsApi)
  const { remove, errorMessage } = useDelete<Room>({
    ...roomsApi,
    // Its seats are deleted with it
    confirmMessage: (room) => `Supprimer la salle « ${room.name} » et ses sièges ?`,
    conflictMessage: (room) => `Impossible de supprimer « ${room.name} » : la salle a des séances.`,
  })

  return (
    <ListPage title="Salles" addTo="/rooms/new" addLabel="Ajouter une salle" errorMessage={errorMessage}>
      <QueryContent query={rooms} errorMessage="Impossible de charger les salles.">
        {(rooms) =>
          rooms.length === 0 ? (
            <p>Aucune salle pour le moment.</p>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Nom</th>
                  <ActionsHeader />
                </tr>
              </thead>
              <tbody>
                {rooms.map((room) => (
                  <tr key={room.id}>
                    <td>{room.name}</td>
                    <RowActions editTo={`/rooms/${room.id}/edit`} onDelete={() => remove(room)} />
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
