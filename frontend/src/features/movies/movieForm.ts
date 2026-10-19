import type { Movie, MovieRequest } from './moviesApi'

/** The fields of the form, as typed by the user (inputs hold strings). */
export interface MovieFormValues {
  title: string
  durationMinutes: string
  releaseDate: string
  description: string
}

export type MovieFormErrors = Partial<Record<keyof MovieFormValues, string>>

export const emptyMovieForm: MovieFormValues = { title: '', durationMinutes: '', releaseDate: '', description: '' }

export function toMovieForm(movie: Movie): MovieFormValues {
  return {
    title: movie.title,
    durationMinutes: String(movie.durationMinutes),
    releaseDate: movie.releaseDate,
    description: movie.description ?? '',
  }
}

/** The same rules as the API, checked before sending to give French messages right away. */
export function validateMovie(values: MovieFormValues): MovieFormErrors {
  const errors: MovieFormErrors = {}
  const title = values.title.trim()
  const duration = Number(values.durationMinutes)

  if (title === '') errors.title = 'Le titre est obligatoire.'
  else if (title.length > 200) errors.title = 'Le titre ne doit pas dépasser 200 caractères.'

  if (values.durationMinutes.trim() === '' || !Number.isInteger(duration) || duration < 1) {
    errors.durationMinutes = 'La durée doit être un nombre entier de minutes, supérieur à 0.'
  }

  if (values.releaseDate === '') errors.releaseDate = 'La date de sortie est obligatoire.'

  if (values.description.trim().length > 2000) {
    errors.description = 'La description ne doit pas dépasser 2000 caractères.'
  }
  return errors
}

export function toMovieRequest(values: MovieFormValues): MovieRequest {
  return {
    title: values.title.trim(),
    durationMinutes: Number(values.durationMinutes),
    releaseDate: values.releaseDate,
    description: values.description.trim() || null,
  }
}
