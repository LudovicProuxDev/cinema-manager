import { useItem } from '../../api/resource'
import { useParams } from 'react-router'
import { QueryContent } from '../../components/QueryContent'
import { useUpdate } from '../../forms/useSave'
import { RoomForm } from './RoomForm'
import { toRoomForm } from './roomForm'
import { roomsApi } from './roomsApi'

export function EditRoomPage() {
  const id = Number(useParams().id)
  const room = useItem(roomsApi, id)
  const update = useUpdate(roomsApi, id, '/rooms')

  return (
    <>
      <h1>Modifier la salle</h1>
      <QueryContent query={room} errorMessage="Impossible de charger la salle." notFoundMessage="Cette salle n'existe pas.">
        {(room) => <RoomForm initialValues={toRoomForm(room)} onSubmit={update} />}
      </QueryContent>
    </>
  )
}
