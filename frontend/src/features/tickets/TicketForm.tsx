import { findById, useList } from '../../api/resource'
import { Field, Form } from '../../forms/Form'
import { Options } from '../../forms/Options'
import { useForm } from '../../forms/useForm'
import { reservationsApi } from '../reservations/reservationsApi'
import { screeningsApi } from '../screenings/screeningsApi'
import { seatLabel, seatsApi } from '../seats/seatsApi'
import { toTicketRequest, validateTicket, type TicketFormValues } from './ticketForm'
import type { TicketRequest } from './ticketsApi'
import { useReservationLabels } from './useReservationLabels'

interface TicketFormProps {
  initialValues: TicketFormValues
  onSubmit: (ticket: TicketRequest) => Promise<unknown>
}

export function TicketForm({ initialValues, onSubmit }: TicketFormProps) {
  const reservations = useList(reservationsApi)
  const screenings = useList(screeningsApi)
  const seats = useList(seatsApi)
  const { reservationLabel, screeningLabel } = useReservationLabels()
  const form = useForm({
    initialValues,
    validate: validateTicket,
    toRequest: toTicketRequest,
    onSubmit,
    // The seats offered are in the room of the screening: it can only be already booked
    conflictMessage: 'Ce siège est déjà réservé pour cette séance.',
  })

  const reservation = findById(reservations.data, Number(form.values.reservationId))
  const screening = reservation && findById(screenings.data, reservation.screeningId)
  const seatsOfTheRoom = screening && seats.data?.filter((seat) => seat.roomId === screening.roomId)

  return (
    <Form form={form} cancelTo="/tickets">
      <Field name="reservationId" label="Réservation" error={form.errors.reservationId}>
        <select
          {...form.field('reservationId')}
          // The seat chosen belongs to the room of the previous reservation
          onChange={(event) => form.setValues({ reservationId: event.target.value, seatId: '' })}
        >
          <Options
            items={reservations.data}
            placeholder="Choisissez une réservation"
            label={(reservation) => `${reservationLabel(reservation)} – ${screeningLabel(reservation)}`}
          />
        </select>
      </Field>
      <Field name="seatId" label="Siège" error={form.errors.seatId}>
        <select {...form.field('seatId')}>
          <Options
            items={seatsOfTheRoom}
            placeholder={screening ? 'Choisissez un siège' : "Choisissez d'abord une réservation"}
            label={seatLabel}
          />
        </select>
      </Field>
    </Form>
  )
}
