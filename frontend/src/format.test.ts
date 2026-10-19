import { describe, expect, it } from 'vitest'
import { formatDate, formatDuration } from './format'

describe('formatDuration', () => {
  it.each([
    [148, '2 h 28 min'],
    [120, '2 h'],
    [45, '45 min'],
  ])('formats %i minutes as "%s"', (minutes, expected) => {
    expect(formatDuration(minutes)).toBe(expected)
  })
})

describe('formatDate', () => {
  it('formats an ISO date (as sent by the API) the French way', () => {
    expect(formatDate('2010-07-16')).toBe('16/07/2010')
  })
})
