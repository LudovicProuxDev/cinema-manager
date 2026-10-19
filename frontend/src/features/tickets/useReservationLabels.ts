import { nameOf, useList } from '../../api/resource'
import type { Reservation } from '../reservations/reservationsApi'
import { screeningsApi } from '../screenings/screeningsApi'
import { useScreeningLabel } from '../screenings/useScreeningLabel'
import { fullName, usersApi } from '../users/usersApi'

/** How a ticket names its reservation: by its number and user, and by its screening. */
export function useReservationLabels() {
  const users = useList(usersApi)
  const screenings = useList(screeningsApi)
  const screeningLabel = useScreeningLabel()

  return {
    /** "n° 7 – Ada Lovelace" */
    reservationLabel: (reservation: Reservation) =>
      `n° ${reservation.id} – ${nameOf(users.data, reservation.userId, fullName)}`,
    /** "Inception – 01/11/2026 20:30" */
    screeningLabel: (reservation: Reservation) => nameOf(screenings.data, reservation.screeningId, screeningLabel),
  }
}
