import { describe, expect, it } from 'vitest'
import { toReservationForm, toReservationRequest, validateReservation } from './reservationForm'

describe('validateReservation', () => {
  it('accepts a user and a screening', () => {
    expect(validateReservation({ userId: '1', screeningId: '5' })).toEqual({})
  })

  it('requires a user and a screening', () => {
    expect(validateReservation({ userId: '', screeningId: '' })).toEqual({
      userId: 'Choisissez un utilisateur.',
      screeningId: 'Choisissez une séance.',
    })
  })
})

describe('toReservationRequest', () => {
  it('sends the ids', () => {
    expect(toReservationRequest({ userId: '1', screeningId: '5' })).toEqual({ userId: 1, screeningId: 5 })
  })
})

describe('toReservationForm', () => {
  it('fills the form with a reservation', () => {
    expect(toReservationForm({ id: 7, userId: 1, screeningId: 5, createdAt: '2026-10-15T08:00:00Z' })).toEqual({
      userId: '1',
      screeningId: '5',
    })
  })
})
