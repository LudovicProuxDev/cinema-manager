import { checkChosen, checkRequiredText, isPositiveInteger, withoutEmpty } from '../../forms/rules'
import type { FormErrors } from '../../forms/useForm'
import type { Seat, SeatRequest } from './seatsApi'

export type SeatFormValues = { roomId: string; row: string; number: string }

export const emptySeatForm: SeatFormValues = { roomId: '', row: '', number: '' }

export function toSeatForm(seat: Seat): SeatFormValues {
  return { roomId: String(seat.roomId), row: seat.row, number: String(seat.number) }
}

export function validateSeat(values: SeatFormValues): FormErrors<SeatFormValues> {
  return withoutEmpty({
    roomId: checkChosen(values.roomId, 'Choisissez une salle.'),
    row: checkRequiredText(values.row, 5, 'Le rang'),
    number: isPositiveInteger(values.number) ? undefined : 'Le numéro doit être un nombre entier, supérieur à 0.',
  })
}

export function toSeatRequest(values: SeatFormValues): SeatRequest {
  // In upper case, so that "a" and "A" are the same row
  return { roomId: Number(values.roomId), row: values.row.trim().toUpperCase(), number: Number(values.number) }
}
