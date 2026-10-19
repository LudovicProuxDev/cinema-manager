import { describe, expect, it } from 'vitest'
import { toRoomForm, toRoomRequest, validateRoom } from './roomForm'

describe('validateRoom', () => {
  it('accepts a name of up to 50 characters', () => {
    expect(validateRoom({ name: 'x'.repeat(50) })).toEqual({})
  })

  it.each([
    ['  ', 'Le nom est obligatoire.'],
    ['x'.repeat(51), 'Le nom ne doit pas dépasser 50 caractères.'],
  ])('rejects "%s"', (name, message) => {
    expect(validateRoom({ name })).toEqual({ name: message })
  })
})

describe('toRoomRequest', () => {
  it('trims the name', () => {
    expect(toRoomRequest({ name: ' Salle 1 ' })).toEqual({ name: 'Salle 1' })
  })
})

describe('toRoomForm', () => {
  it('fills the form with a room', () => {
    expect(toRoomForm({ id: 1, name: 'Salle 1' })).toEqual({ name: 'Salle 1' })
  })
})
