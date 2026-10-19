import { createResourceApi } from '../../api/resource'

/** A reservation of a user for a screening, as returned by the API. */
export interface Reservation {
  id: number
  userId: number
  screeningId: number
  /** Set by the server, in UTC. */
  createdAt: string
}

export type ReservationRequest = Omit<Reservation, 'id' | 'createdAt'>

export const reservationsApi = createResourceApi<Reservation, ReservationRequest>('/reservations')
