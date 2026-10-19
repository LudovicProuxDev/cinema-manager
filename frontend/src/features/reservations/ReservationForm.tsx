import { useList } from '../../api/resource'
import { Field, Form } from '../../forms/Form'
import { Options } from '../../forms/Options'
import { useForm } from '../../forms/useForm'
import { screeningsApi } from '../screenings/screeningsApi'
import { useScreeningLabel } from '../screenings/useScreeningLabel'
import { fullName, usersApi } from '../users/usersApi'
import { toReservationRequest, validateReservation, type ReservationFormValues } from './reservationForm'
import type { ReservationRequest } from './reservationsApi'

interface ReservationFormProps {
  initialValues: ReservationFormValues
  onSubmit: (reservation: ReservationRequest) => Promise<unknown>
}

export function ReservationForm({ initialValues, onSubmit }: ReservationFormProps) {
  const users = useList(usersApi)
  const screenings = useList(screeningsApi)
  const screeningLabel = useScreeningLabel()
  const form = useForm({
    initialValues,
    validate: validateReservation,
    toRequest: toReservationRequest,
    onSubmit,
    // Only possible on a change of screening
    conflictMessage: 'La réservation ne peut pas changer de séance : elle a des billets.',
  })

  return (
    <Form form={form} cancelTo="/reservations">
      <Field name="userId" label="Utilisateur" error={form.errors.userId}>
        <select {...form.field('userId')}>
          <Options items={users.data} placeholder="Choisissez un utilisateur" label={fullName} />
        </select>
      </Field>
      <Field name="screeningId" label="Séance" error={form.errors.screeningId}>
        <select {...form.field('screeningId')}>
          <Options items={screenings.data} placeholder="Choisissez une séance" label={screeningLabel} />
        </select>
      </Field>
    </Form>
  )
}
