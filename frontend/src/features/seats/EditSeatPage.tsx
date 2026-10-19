import { useParams } from 'react-router'
import { useItem } from '../../api/resource'
import { QueryContent } from '../../components/QueryContent'
import { useUpdate } from '../../forms/useSave'
import { SeatForm } from './SeatForm'
import { toSeatForm } from './seatForm'
import { seatsApi } from './seatsApi'

export function EditSeatPage() {
  const id = Number(useParams().id)
  const seat = useItem(seatsApi, id)
  const update = useUpdate(seatsApi, id, '/seats')

  return (
    <>
      <h1>Modifier le siège</h1>
      <QueryContent query={seat} errorMessage="Impossible de charger le siège." notFoundMessage="Ce siège n'existe pas.">
        {(seat) => (
          <SeatForm
            initialValues={toSeatForm(seat)}
            onSubmit={update}
            // Either rule of the API: a unique row and number in the room, no change of room once tickets are sold
            conflictMessage="Ce siège existe déjà dans cette salle, ou il ne peut pas changer de salle : des billets sont vendus pour lui."
          />
        )}
      </QueryContent>
    </>
  )
}
