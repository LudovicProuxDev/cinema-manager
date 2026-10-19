import { createResourceApi } from '../../api/resource'

/** A seat of a room, as returned by the API. Its row and number are unique within the room. */
export interface Seat {
  id: number
  roomId: number
  row: string
  number: number
}

export type SeatRequest = Omit<Seat, 'id'>

export const seatsApi = createResourceApi<Seat, SeatRequest>('/seats')

/** "A12" */
export const seatLabel = (seat: Seat) => `${seat.row}${seat.number}`
