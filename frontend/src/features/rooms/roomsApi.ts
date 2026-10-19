import { createResourceApi } from '../../api/resource'

/** A room of the cinema, as returned by the API. */
export interface Room {
  id: number
  name: string
}

export type RoomRequest = Omit<Room, 'id'>

export const roomsApi = createResourceApi<Room, RoomRequest>('/rooms')
