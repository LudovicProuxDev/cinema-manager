import { describe, expect, it } from 'vitest'
import { ApiError } from './client'
import { createQueryClient, shouldRetry } from './queryClient'

describe('shouldRetry', () => {
  it('does not retry an error of the request (4xx): it would fail again', () => {
    expect(shouldRetry(0, new ApiError(404))).toBe(false)
    expect(shouldRetry(0, new ApiError(499))).toBe(false)
  })

  it('retries a server error (5xx) or a network error, twice', () => {
    expect(shouldRetry(0, new ApiError(500))).toBe(true)
    expect(shouldRetry(1, new TypeError('Failed to fetch'))).toBe(true)
    expect(shouldRetry(2, new ApiError(503))).toBe(false)
  })
})

describe('createQueryClient', () => {
  it('applies the retry policy to every query', () => {
    expect(createQueryClient().getDefaultOptions().queries?.retry).toBe(shouldRetry)
  })
})
