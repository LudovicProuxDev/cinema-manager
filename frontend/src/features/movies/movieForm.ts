import { checkRequiredText, isPositiveInteger, withoutEmpty } from '../../forms/rules'
import type { FormErrors } from '../../forms/useForm'
import type { Movie, MovieRequest } from './moviesApi'

export type MovieFormValues = {
  title: string
  durationMinutes: string
  releaseDate: string
  description: string
}

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
export function validateMovie(values: MovieFormValues): FormErrors<MovieFormValues> {
  return withoutEmpty({
    title: checkRequiredText(values.title, 200, 'Le titre'),
    durationMinutes: isPositiveInteger(values.durationMinutes)
      ? undefined
      : 'La durée doit être un nombre entier de minutes, supérieur à 0.',
    releaseDate: values.releaseDate === '' ? 'La date de sortie est obligatoire.' : undefined,
    description:
      values.description.trim().length > 2000 ? 'La description ne doit pas dépasser 2000 caractères.' : undefined,
  })
}

export function toMovieRequest(values: MovieFormValues): MovieRequest {
  return {
    title: values.title.trim(),
    durationMinutes: Number(values.durationMinutes),
    releaseDate: values.releaseDate,
    description: values.description.trim() || null,
  }
}
