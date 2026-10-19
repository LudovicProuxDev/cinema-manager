import { describe, expect, it } from 'vitest'
import { nameOf } from './resource'

describe('nameOf', () => {
  const rooms = [
    { id: 1, name: 'Salle 1' },
    { id: 2, name: 'Salle 2' },
  ]

  it('names the item with the given id', () => {
    expect(nameOf(rooms, 2, (room) => room.name)).toBe('Salle 2')
  })

  it('gives an empty name while the items are loading, or for an unknown id', () => {
    expect(nameOf(undefined, 2, (room: { id: number; name: string }) => room.name)).toBe('')
    expect(nameOf(rooms, 3, (room) => room.name)).toBe('')
  })
})
