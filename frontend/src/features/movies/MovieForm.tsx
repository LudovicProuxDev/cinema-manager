import { Field, Form } from '../../forms/Form'
import { useForm } from '../../forms/useForm'
import { toMovieRequest, validateMovie, type MovieFormValues } from './movieForm'
import type { MovieRequest } from './moviesApi'

interface MovieFormProps {
  initialValues: MovieFormValues
  onSubmit: (movie: MovieRequest) => Promise<unknown>
}

/** The form to create or edit a movie, shared by the two pages. */
export function MovieForm({ initialValues, onSubmit }: MovieFormProps) {
  const form = useForm({ initialValues, validate: validateMovie, toRequest: toMovieRequest, onSubmit })

  return (
    <Form form={form} cancelTo="/movies">
      <Field name="title" label="Titre" error={form.errors.title}>
        <input type="text" maxLength={200} {...form.field('title')} />
      </Field>
      <Field name="durationMinutes" label="Durée (minutes)" error={form.errors.durationMinutes}>
        <input type="number" min={1} step={1} {...form.field('durationMinutes')} />
      </Field>
      <Field name="releaseDate" label="Date de sortie" error={form.errors.releaseDate}>
        <input type="date" {...form.field('releaseDate')} />
      </Field>
      <Field name="description" label="Description" error={form.errors.description}>
        <textarea rows={5} maxLength={2000} {...form.field('description')} />
      </Field>
    </Form>
  )
}
