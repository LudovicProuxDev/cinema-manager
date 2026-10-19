import { describe, expect, it } from 'vitest'
import { toSeatForm, toSeatRequest, validateSeat, type SeatFormValues } from './seatForm'

const valid: SeatFormValues = { roomId: '1', row: 'A', number: '12' }

describe('validateSeat', () => {
  it('accepts a valid seat', () => {
    expect(validateSeat(valid)).toEqual({})
  })

  it.each([
    ['roomId', '', 'Choisissez une salle.'],
    ['row', ' ', 'Le rang est obligatoire.'],
    ['row', 'ABCDEF', 'Le rang ne doit pas dépasser 5 caractères.'],
    ['number', '0', 'Le numéro doit être un nombre entier, supérieur à 0.'],
    ['number', '', 'Le numéro doit être un nombre entier, supérieur à 0.'],
  ] as const)('rejects %s "%s"', (field, value, message) => {
    expect(validateSeat({ ...valid, [field]: value })).toEqual({ [field]: message })
  })
})

describe('toSeatRequest', () => {
  it('converts the form values into the request of the API', () => {
    expect(toSeatRequest({ roomId: '1', row: ' a ', number: '12' })).toEqual({ roomId: 1, row: 'A', number: 12 })
  })
})

describe('toSeatForm', () => {
  it('fills the form with a seat', () => {
    expect(toSeatForm({ id: 3, roomId: 1, row: 'A', number: 12 })).toEqual(valid)
  })
})
