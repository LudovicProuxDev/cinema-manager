import { createResourceApi } from '../../api/resource'

/** A screening of a movie in a room, as returned by the API. */
export interface Screening {
  id: number
  movieId: number
  roomId: number
  /** In UTC: "2026-11-01T19:30:00Z". */
  startsAt: string
  /** The price of a ticket, in euros. */
  price: number
}

export type ScreeningRequest = Omit<Screening, 'id'>

export const screeningsApi = createResourceApi<Screening, ScreeningRequest>('/screenings')
