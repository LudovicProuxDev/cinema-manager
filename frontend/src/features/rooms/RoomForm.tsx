import { Field, Form } from '../../forms/Form'
import { useForm } from '../../forms/useForm'
import { toRoomRequest, validateRoom, type RoomFormValues } from './roomForm'
import type { RoomRequest } from './roomsApi'

interface RoomFormProps {
  initialValues: RoomFormValues
  onSubmit: (room: RoomRequest) => Promise<unknown>
}

export function RoomForm({ initialValues, onSubmit }: RoomFormProps) {
  const form = useForm({
    initialValues,
    validate: validateRoom,
    toRequest: toRoomRequest,
    onSubmit,
    conflictMessage: 'Une salle porte déjà ce nom.',
  })

  return (
    <Form form={form} cancelTo="/rooms">
      <Field name="name" label="Nom" error={form.errors.name}>
        <input type="text" maxLength={50} {...form.field('name')} />
      </Field>
    </Form>
  )
}
