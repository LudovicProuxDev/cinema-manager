import { describe, expect, it } from 'vitest'
import { formatDate, formatDateTime, formatDuration, formatPrice, fromDateTimeInput, toDateTimeInput } from './format'

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

// The tests run in the Europe/Paris time zone: UTC+1 in winter, UTC+2 in summer
describe('formatDateTime', () => {
  it('formats a UTC time of the API in local time', () => {
    expect(formatDateTime('2026-11-01T19:30:00Z')).toBe('01/11/2026 20:30')
  })
})

describe('formatPrice', () => {
  it('formats a price in euros', () => {
    expect(formatPrice(9.5)).toBe('9,50 €')
  })
})

describe('toDateTimeInput', () => {
  it('converts a UTC time of the API into the local time of a datetime-local input', () => {
    expect(toDateTimeInput('2026-11-01T19:30:00Z')).toBe('2026-11-01T20:30')
    expect(toDateTimeInput('2026-07-01T19:30:00Z')).toBe('2026-07-01T21:30')
  })
})

describe('fromDateTimeInput', () => {
  it('converts the local time of a datetime-local input into a UTC time for the API', () => {
    expect(fromDateTimeInput('2026-11-01T20:30')).toBe('2026-11-01T19:30:00.000Z')
  })
})
