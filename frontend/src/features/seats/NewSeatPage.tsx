import { useCreate } from '../../forms/useSave'
import { SeatForm } from './SeatForm'
import { emptySeatForm } from './seatForm'
import { seatsApi } from './seatsApi'

export function NewSeatPage() {
  const create = useCreate(seatsApi, '/seats')

  return (
    <>
      <h1>Nouveau siège</h1>
      <SeatForm
        initialValues={emptySeatForm}
        onSubmit={create}
        conflictMessage="Ce siège existe déjà dans cette salle."
      />
    </>
  )
}
