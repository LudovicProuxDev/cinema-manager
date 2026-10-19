import { describe, expect, it } from 'vitest'
import { emptyMovieForm, toMovieForm, toMovieRequest, validateMovie, type MovieFormValues } from './movieForm'

const valid: MovieFormValues = {
  title: 'Inception',
  durationMinutes: '148',
  releaseDate: '2010-07-16',
  description: 'A thief who steals secrets through dreams.',
}

describe('validateMovie', () => {
  it('accepts a valid movie', () => {
    expect(validateMovie(valid)).toEqual({})
  })

  it('accepts a movie without description', () => {
    expect(validateMovie({ ...valid, description: '' })).toEqual({})
  })

  it.each([
    ['title', '  ', 'Le titre est obligatoire.'],
    ['title', 'x'.repeat(201), 'Le titre ne doit pas dépasser 200 caractères.'],
    ['durationMinutes', '', 'La durée doit être un nombre entier de minutes, supérieur à 0.'],
    ['durationMinutes', '0', 'La durée doit être un nombre entier de minutes, supérieur à 0.'],
    ['durationMinutes', '90.5', 'La durée doit être un nombre entier de minutes, supérieur à 0.'],
    ['releaseDate', '', 'La date de sortie est obligatoire.'],
    ['description', 'x'.repeat(2001), 'La description ne doit pas dépasser 2000 caractères.'],
  ] as const)('rejects %s "%s"', (field, value, message) => {
    expect(validateMovie({ ...valid, [field]: value })).toEqual({ [field]: message })
  })

  it('accepts the maximum lengths', () => {
    expect(validateMovie({ ...valid, title: 'x'.repeat(200), description: 'x'.repeat(2000) })).toEqual({})
  })
})

describe('toMovieRequest', () => {
  it('converts the form values into the request of the API', () => {
    expect(toMovieRequest({ ...valid, title: ' Inception ' })).toEqual({
      title: 'Inception',
      durationMinutes: 148,
      releaseDate: '2010-07-16',
      description: 'A thief who steals secrets through dreams.',
    })
  })

  it('sends no description when it is blank', () => {
    expect(toMovieRequest({ ...valid, description: '  ' }).description).toBeNull()
  })
})

describe('toMovieForm', () => {
  it('fills the form with a movie', () => {
    expect(
      toMovieForm({ id: 1, title: 'Inception', durationMinutes: 148, releaseDate: '2010-07-16', description: null }),
    ).toEqual({ title: 'Inception', durationMinutes: '148', releaseDate: '2010-07-16', description: '' })
  })

  it('starts empty for a new movie', () => {
    expect(emptyMovieForm).toEqual({ title: '', durationMinutes: '', releaseDate: '', description: '' })
  })
})
