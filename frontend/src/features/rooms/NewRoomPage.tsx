import { useCreate } from '../../forms/useSave'
import { RoomForm } from './RoomForm'
import { emptyRoomForm } from './roomForm'
import { roomsApi } from './roomsApi'

export function NewRoomPage() {
  const create = useCreate(roomsApi, '/rooms')

  return (
    <>
      <h1>Nouvelle salle</h1>
      <RoomForm initialValues={emptyRoomForm} onSubmit={create} />
    </>
  )
}
