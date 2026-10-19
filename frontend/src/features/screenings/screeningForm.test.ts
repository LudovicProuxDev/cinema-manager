import { describe, expect, it } from 'vitest'
import { toScreeningForm, toScreeningRequest, validateScreening, type ScreeningFormValues } from './screeningForm'

const valid: ScreeningFormValues = { movieId: '1', roomId: '2', startsAt: '2026-11-01T20:30', price: '9.5' }

describe('validateScreening', () => {
  it('accepts a valid screening', () => {
    expect(validateScreening(valid)).toEqual({})
  })

  it.each(['0', '999999.99', '12.30'])('accepts the price %s', (price) => {
    expect(validateScreening({ ...valid, price })).toEqual({})
  })

  const priceError = 'Le prix doit être un montant de 0 à 999 999,99 €, avec 2 décimales au plus.'

  it.each([
    ['movieId', '', 'Choisissez un film.'],
    ['roomId', '', 'Choisissez une salle.'],
    ['startsAt', '', "La date et l'heure de début sont obligatoires."],
    ['price', '', priceError],
    ['price', '-1', priceError],
    ['price', '1000000', priceError],
    ['price', '9.999', priceError],
  ] as const)('rejects %s "%s"', (field, value, message) => {
    expect(validateScreening({ ...valid, [field]: value })).toEqual({ [field]: message })
  })
})

// The tests run in the Europe/Paris time zone (UTC+1 on 1 November 2026)
describe('toScreeningRequest', () => {
  it('sends the local start time in UTC', () => {
    expect(toScreeningRequest(valid)).toEqual({
      movieId: 1,
      roomId: 2,
      startsAt: '2026-11-01T19:30:00.000Z',
      price: 9.5,
    })
  })
})

describe('toScreeningForm', () => {
  it('shows the UTC start time of the API in local time', () => {
    expect(toScreeningForm({ id: 5, movieId: 1, roomId: 2, startsAt: '2026-11-01T19:30:00Z', price: 9.5 })).toEqual(
      valid,
    )
  })
})
