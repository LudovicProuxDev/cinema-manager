import { useState, type ChangeEvent, type FormEvent } from 'react'
import { Link } from 'react-router'
import { ApiError } from '../../api/client'
import { toMovieRequest, validateMovie, type MovieFormErrors, type MovieFormValues } from './movieForm'
import type { MovieRequest } from './moviesApi'

interface MovieFormProps {
  initialValues: MovieFormValues
  /** Sends the movie to the API. A rejected ApiError is shown in the form. */
  onSubmit: (movie: MovieRequest) => Promise<unknown>
}

/** The form to create or edit a movie, shared by the two pages. */
export function MovieForm({ initialValues, onSubmit }: MovieFormProps) {
  const [values, setValues] = useState(initialValues)
  const [errors, setErrors] = useState<MovieFormErrors>({})
  const [submitError, setSubmitError] = useState<string>()
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSubmitError(undefined)

    const validationErrors = validateMovie(values)
    setErrors(validationErrors)
    if (Object.keys(validationErrors).length > 0) return

    setSubmitting(true)
    try {
      await onSubmit(toMovieRequest(values))
    } catch (error) {
      // 400: the API has rules the form does not know, show its messages by field
      if (error instanceof ApiError && Object.keys(error.fieldErrors).length > 0) {
        setErrors(Object.fromEntries(Object.entries(error.fieldErrors).map(([field, messages]) => [field, messages[0]])))
      } else {
        setSubmitError("L'enregistrement a échoué.")
      }
    } finally {
      setSubmitting(false)
    }
  }

  /** The props that bind an input to its value and its error. */
  function field(name: keyof MovieFormValues) {
    return {
      id: name,
      name,
      value: values[name],
      onChange: (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
        setValues({ ...values, [name]: event.target.value }),
      'aria-invalid': errors[name] ? true : undefined,
      'aria-describedby': errors[name] ? `${name}-error` : undefined,
    }
  }

  function errorOf(name: keyof MovieFormValues) {
    return (
      errors[name] && (
        <p id={`${name}-error`} className="field-error">
          {errors[name]}
        </p>
      )
    )
  }

  return (
    // noValidate: the errors are checked and shown by the form, in French
    <form onSubmit={handleSubmit} noValidate className="form">
      {submitError && (
        <p role="alert" className="alert">
          {submitError}
        </p>
      )}

      <div className="field">
        <label htmlFor="title">Titre</label>
        <input type="text" maxLength={200} {...field('title')} />
        {errorOf('title')}
      </div>

      <div className="field">
        <label htmlFor="durationMinutes">Durée (minutes)</label>
        <input type="number" min={1} step={1} {...field('durationMinutes')} />
        {errorOf('durationMinutes')}
      </div>

      <div className="field">
        <label htmlFor="releaseDate">Date de sortie</label>
        <input type="date" {...field('releaseDate')} />
        {errorOf('releaseDate')}
      </div>

      <div className="field">
        <label htmlFor="description">Description</label>
        <textarea rows={5} maxLength={2000} {...field('description')} />
        {errorOf('description')}
      </div>

      <div className="form-actions">
        <button type="submit" disabled={submitting}>
          Enregistrer
        </button>
        <Link to="/movies">Annuler</Link>
      </div>
    </form>
  )
}
