import { useList } from '../../api/resource'
import { Field, Form } from '../../forms/Form'
import { Options } from '../../forms/Options'
import { useForm } from '../../forms/useForm'
import { roomsApi } from '../rooms/roomsApi'
import { toSeatRequest, validateSeat, type SeatFormValues } from './seatForm'
import type { SeatRequest } from './seatsApi'

interface SeatFormProps {
  initialValues: SeatFormValues
  onSubmit: (seat: SeatRequest) => Promise<unknown>
  conflictMessage: string
}

export function SeatForm({ initialValues, onSubmit, conflictMessage }: SeatFormProps) {
  const rooms = useList(roomsApi)
  const form = useForm({ initialValues, validate: validateSeat, toRequest: toSeatRequest, onSubmit, conflictMessage })

  return (
    <Form form={form} cancelTo="/seats">
      <Field name="roomId" label="Salle" error={form.errors.roomId}>
        <select {...form.field('roomId')}>
          <Options items={rooms.data} placeholder="Choisissez une salle" label={(room) => room.name} />
        </select>
      </Field>
      <Field name="row" label="Rang" error={form.errors.row}>
        <input type="text" maxLength={5} {...form.field('row')} />
      </Field>
      <Field name="number" label="Numéro" error={form.errors.number}>
        <input type="number" min={1} step={1} {...form.field('number')} />
      </Field>
    </Form>
  )
}
