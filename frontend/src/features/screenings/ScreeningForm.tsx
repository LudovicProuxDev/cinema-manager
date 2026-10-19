import { useList } from '../../api/resource'
import { Field, Form } from '../../forms/Form'
import { Options } from '../../forms/Options'
import { useForm } from '../../forms/useForm'
import { moviesApi } from '../movies/moviesApi'
import { roomsApi } from '../rooms/roomsApi'
import { toScreeningRequest, validateScreening, type ScreeningFormValues } from './screeningForm'
import type { ScreeningRequest } from './screeningsApi'

interface ScreeningFormProps {
  initialValues: ScreeningFormValues
  onSubmit: (screening: ScreeningRequest) => Promise<unknown>
}

export function ScreeningForm({ initialValues, onSubmit }: ScreeningFormProps) {
  const movies = useList(moviesApi)
  const rooms = useList(roomsApi)
  const form = useForm({
    initialValues,
    validate: validateScreening,
    toRequest: toScreeningRequest,
    onSubmit,
    // Only possible on a change of room
    conflictMessage: 'La séance ne peut pas changer de salle : des billets sont vendus pour elle.',
  })

  return (
    <Form form={form} cancelTo="/screenings">
      <Field name="movieId" label="Film" error={form.errors.movieId}>
        <select {...form.field('movieId')}>
          <Options items={movies.data} placeholder="Choisissez un film" label={(movie) => movie.title} />
        </select>
      </Field>
      <Field name="roomId" label="Salle" error={form.errors.roomId}>
        <select {...form.field('roomId')}>
          <Options items={rooms.data} placeholder="Choisissez une salle" label={(room) => room.name} />
        </select>
      </Field>
      <Field name="startsAt" label="Début" error={form.errors.startsAt}>
        <input type="datetime-local" {...form.field('startsAt')} />
      </Field>
      <Field name="price" label="Prix (€)" error={form.errors.price}>
        <input type="number" min={0} max={999999.99} step={0.01} {...form.field('price')} />
      </Field>
    </Form>
  )
}
