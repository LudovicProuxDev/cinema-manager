import { useParams } from 'react-router'
import { useItem } from '../../api/resource'
import { QueryContent } from '../../components/QueryContent'
import { useUpdate } from '../../forms/useSave'
import { ReservationForm } from './ReservationForm'
import { toReservationForm } from './reservationForm'
import { reservationsApi } from './reservationsApi'

export function EditReservationPage() {
  const id = Number(useParams().id)
  const reservation = useItem(reservationsApi, id)
  const update = useUpdate(reservationsApi, id, '/reservations')

  return (
    <>
      <h1>Modifier la réservation</h1>
      <QueryContent
        query={reservation}
        errorMessage="Impossible de charger la réservation."
        notFoundMessage="Cette réservation n'existe pas."
      >
        {(reservation) => <ReservationForm initialValues={toReservationForm(reservation)} onSubmit={update} />}
      </QueryContent>
    </>
  )
}
