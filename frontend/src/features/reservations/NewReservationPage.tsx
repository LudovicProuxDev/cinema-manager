import { useCreate } from '../../forms/useSave'
import { ReservationForm } from './ReservationForm'
import { emptyReservationForm } from './reservationForm'
import { reservationsApi } from './reservationsApi'

export function NewReservationPage() {
  const create = useCreate(reservationsApi, '/reservations')

  return (
    <>
      <h1>Nouvelle réservation</h1>
      <ReservationForm initialValues={emptyReservationForm} onSubmit={create} />
    </>
  )
}
