import { fromDateTimeInput, toDateTimeInput } from '../../format'
import { checkChosen, withoutEmpty } from '../../forms/rules'
import type { FormErrors } from '../../forms/useForm'
import type { Screening, ScreeningRequest } from './screeningsApi'

export type ScreeningFormValues = {
  movieId: string
  roomId: string
  /** The local time of a datetime-local input: "2026-11-01T20:30". */
  startsAt: string
  price: string
}

export const emptyScreeningForm: ScreeningFormValues = { movieId: '', roomId: '', startsAt: '', price: '' }

export function toScreeningForm(screening: Screening): ScreeningFormValues {
  return {
    movieId: String(screening.movieId),
    roomId: String(screening.roomId),
    startsAt: toDateTimeInput(screening.startsAt),
    price: String(screening.price),
  }
}

// What the database stores: up to 999 999.99, with 2 decimals
const pricePattern = /^\d{1,6}(\.\d{1,2})?$/

export function validateScreening(values: ScreeningFormValues): FormErrors<ScreeningFormValues> {
  return withoutEmpty({
    movieId: checkChosen(values.movieId, 'Choisissez un film.'),
    roomId: checkChosen(values.roomId, 'Choisissez une salle.'),
    startsAt: values.startsAt === '' ? "La date et l'heure de début sont obligatoires." : undefined,
    price: pricePattern.test(values.price.trim())
      ? undefined
      : 'Le prix doit être un montant de 0 à 999 999,99 €, avec 2 décimales au plus.',
  })
}

export function toScreeningRequest(values: ScreeningFormValues): ScreeningRequest {
  return {
    movieId: Number(values.movieId),
    roomId: Number(values.roomId),
    startsAt: fromDateTimeInput(values.startsAt),
    price: Number(values.price),
  }
}
