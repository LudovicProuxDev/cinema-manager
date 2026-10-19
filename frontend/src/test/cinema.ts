import type { Movie } from '../features/movies/moviesApi'
import type { Reservation } from '../features/reservations/reservationsApi'
import type { Room } from '../features/rooms/roomsApi'
import type { Screening } from '../features/screenings/screeningsApi'
import type { Seat } from '../features/seats/seatsApi'
import type { User } from '../features/users/usersApi'
import { fakeResource } from './fakeApi'

// A small cinema for the tests of the reservations and the tickets.
// The tests run in Paris: 19:30 UTC is 20:30 on 1 November 2026, 08:00 UTC is 10:00 on 15 October.
export const movies: Movie[] = [
  { id: 1, title: 'Inception', description: null, durationMinutes: 148, releaseDate: '2010-07-16' },
  { id: 2, title: 'Interstellar', description: null, durationMinutes: 169, releaseDate: '2014-11-05' },
]
export const rooms: Room[] = [
  { id: 1, name: 'Salle 1' },
  { id: 2, name: 'Salle 2' },
]
export const seats: Seat[] = [
  { id: 1, roomId: 1, row: 'A', number: 12 },
  { id: 2, roomId: 1, row: 'A', number: 13 },
  { id: 3, roomId: 2, row: 'B', number: 1 },
]
export const screenings: Screening[] = [
  { id: 5, movieId: 1, roomId: 1, startsAt: '2026-11-01T19:30:00Z', price: 9.5 },
  { id: 6, movieId: 2, roomId: 2, startsAt: '2026-11-02T19:30:00Z', price: 11 },
]
export const users: User[] = [{ id: 1, firstName: 'Ada', lastName: 'Lovelace', email: 'ada@example.com' }]
export const reservations: Reservation[] = [{ id: 7, userId: 1, screeningId: 5, createdAt: '2026-10-15T08:00:00Z' }]

/** Serves the movies, rooms, seats, screenings, users and reservations above. */
export function serveCinema() {
  fakeResource('/movies', movies)
  fakeResource('/rooms', rooms)
  fakeResource('/seats', seats)
  fakeResource('/screenings', screenings)
  fakeResource('/users', users)
}
