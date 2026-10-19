import { checkChosen, withoutEmpty } from '../../forms/rules'
import type { FormErrors } from '../../forms/useForm'
import type { Ticket, TicketRequest } from './ticketsApi'

export type TicketFormValues = { reservationId: string; seatId: string }

export const emptyTicketForm: TicketFormValues = { reservationId: '', seatId: '' }

export function toTicketForm(ticket: Ticket): TicketFormValues {
  return { reservationId: String(ticket.reservationId), seatId: String(ticket.seatId) }
}

export function validateTicket(values: TicketFormValues): FormErrors<TicketFormValues> {
  return withoutEmpty({
    reservationId: checkChosen(values.reservationId, 'Choisissez une réservation.'),
    seatId: checkChosen(values.seatId, 'Choisissez un siège.'),
  })
}

export function toTicketRequest(values: TicketFormValues): TicketRequest {
  return { reservationId: Number(values.reservationId), seatId: Number(values.seatId) }
}
