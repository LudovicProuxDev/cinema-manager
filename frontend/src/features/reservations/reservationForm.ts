import { checkChosen, withoutEmpty } from '../../forms/rules'
import type { FormErrors } from '../../forms/useForm'
import type { Reservation, ReservationRequest } from './reservationsApi'

export type ReservationFormValues = { userId: string; screeningId: string }

export const emptyReservationForm: ReservationFormValues = { userId: '', screeningId: '' }

export function toReservationForm(reservation: Reservation): ReservationFormValues {
  return { userId: String(reservation.userId), screeningId: String(reservation.screeningId) }
}

export function validateReservation(values: ReservationFormValues): FormErrors<ReservationFormValues> {
  return withoutEmpty({
    userId: checkChosen(values.userId, 'Choisissez un utilisateur.'),
    screeningId: checkChosen(values.screeningId, 'Choisissez une séance.'),
  })
}

export function toReservationRequest(values: ReservationFormValues): ReservationRequest {
  return { userId: Number(values.userId), screeningId: Number(values.screeningId) }
}
