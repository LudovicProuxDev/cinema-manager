import { createResourceApi } from '../../api/resource'

/** A ticket: a seat booked in a reservation, as returned by the API. */
export interface Ticket {
  id: number
  reservationId: number
  seatId: number
  /** Set by the server: the price of the screening, in euros. */
  price: number
}

export type TicketRequest = Omit<Ticket, 'id' | 'price'>

export const ticketsApi = createResourceApi<Ticket, TicketRequest>('/tickets')
