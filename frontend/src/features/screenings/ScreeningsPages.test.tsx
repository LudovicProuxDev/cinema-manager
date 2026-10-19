import { screen, within } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { failWith, fakeResource } from '../../test/fakeApi'
import { renderApp } from '../../test/render'
import type { Movie } from '../movies/moviesApi'
import type { Room } from '../rooms/roomsApi'
import type { Screening } from './screeningsApi'

const movies: Movie[] = [
  { id: 1, title: 'Inception', description: null, durationMinutes: 148, releaseDate: '2010-07-16' },
  { id: 2, title: 'Interstellar', description: null, durationMinutes: 169, releaseDate: '2014-11-05' },
]
const rooms: Room[] = [{ id: 1, name: 'Salle 1' }]
// 19:30 UTC is 20:30 in Paris (where the tests run) on 1 November 2026
const screening: Screening = { id: 5, movieId: 1, roomId: 1, startsAt: '2026-11-01T19:30:00Z', price: 9.5 }

function serveMoviesAndRooms() {
  fakeResource('/movies', movies)
  fakeResource('/rooms', rooms)
}

describe('ScreeningsPage', () => {
  it('lists the screenings with their movie, room, local time and price', async () => {
    serveMoviesAndRooms()
    fakeResource('/screenings', [screening])

    renderApp('/screenings')

    const row = await screen.findByRole('row', { name: /Inception/ })
    expect(within(row).getByText('Salle 1')).toBeInTheDocument()
    expect(within(row).getByText('01/11/2026 20:30')).toBeInTheDocument()
    expect(within(row).getByText('9,50 €')).toBeInTheDocument()
  })

  it('says when there is no screening', async () => {
    serveMoviesAndRooms()
    fakeResource('/screenings', [])

    renderApp('/screenings')

    expect(await screen.findByText('Aucune séance pour le moment.')).toBeInTheDocument()
  })

  it('deletes a screening after confirmation', async () => {
    serveMoviesAndRooms()
    const received = fakeResource('/screenings', [screening])
    const confirm = vi.spyOn(window, 'confirm').mockReturnValue(true)
    const { user } = renderApp('/screenings')

    await user.click(within(await screen.findByRole('row', { name: /Inception/ })).getByRole('button', { name: 'Supprimer' }))

    expect(confirm).toHaveBeenCalledWith('Supprimer la séance « Inception » du 01/11/2026 20:30 ?')
    expect(await screen.findByText('Aucune séance pour le moment.')).toBeInTheDocument()
    expect(received.deletedId).toBe(5)
  })

  it('explains why a screening with reservations cannot be deleted', async () => {
    serveMoviesAndRooms()
    fakeResource('/screenings', [screening])
    failWith('delete', '/screenings/:id', 409)
    vi.spyOn(window, 'confirm').mockReturnValue(true)
    const { user } = renderApp('/screenings')

    await user.click(within(await screen.findByRole('row', { name: /Inception/ })).getByRole('button', { name: 'Supprimer' }))

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Impossible de supprimer la séance « Inception » du 01/11/2026 20:30 : elle a des réservations.',
    )
  })
})

describe('NewScreeningPage', () => {
  it('creates a screening, with its start time in UTC, and goes back to the list', async () => {
    serveMoviesAndRooms()
    const received = fakeResource('/screenings', [])
    const { user } = renderApp('/screenings')

    await user.click(screen.getByRole('link', { name: 'Ajouter une séance' }))
    await user.selectOptions(screen.getByLabelText('Film'), await screen.findByRole('option', { name: 'Interstellar' }))
    await user.selectOptions(screen.getByLabelText('Salle'), await screen.findByRole('option', { name: 'Salle 1' }))
    await user.type(screen.getByLabelText('Début'), '2026-11-01T20:30')
    await user.type(screen.getByLabelText('Prix (€)'), '9.5')
    await user.click(screen.getByRole('button', { name: 'Enregistrer' }))

    expect(await screen.findByRole('row', { name: /Interstellar/ })).toBeInTheDocument()
    expect(received.created).toEqual({ movieId: 2, roomId: 1, startsAt: '2026-11-01T19:30:00.000Z', price: 9.5 })
  })

  it('shows the errors of the form', async () => {
    serveMoviesAndRooms()
    fakeResource('/screenings', [])
    const { user } = renderApp('/screenings/new')

    await user.click(screen.getByRole('button', { name: 'Enregistrer' }))

    expect(screen.getByLabelText('Film')).toHaveAccessibleDescription('Choisissez un film.')
  })
})

describe('EditScreeningPage', () => {
  it('shows the start time in local time and saves the changes', async () => {
    serveMoviesAndRooms()
    const received = fakeResource('/screenings', [screening])
    const { user } = renderApp('/screenings')

    await user.click(await screen.findByRole('link', { name: 'Modifier' }))
    expect(await screen.findByLabelText('Début')).toHaveValue('2026-11-01T20:30')
    const price = screen.getByLabelText('Prix (€)')
    await user.clear(price)
    await user.type(price, '11')
    await user.click(screen.getByRole('button', { name: 'Enregistrer' }))

    expect(await screen.findByRole('row', { name: /11,00/ })).toBeInTheDocument()
    expect(received.updated).toEqual({ movieId: 1, roomId: 1, startsAt: '2026-11-01T19:30:00.000Z', price: 11 })
  })

  it('explains why a screening with tickets cannot change room', async () => {
    serveMoviesAndRooms()
    fakeResource('/screenings', [screening])
    failWith('put', '/screenings/:id', 409)
    const { user } = renderApp('/screenings/5/edit')

    await user.click(await screen.findByRole('button', { name: 'Enregistrer' }))

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'La séance ne peut pas changer de salle : des billets sont vendus pour elle.',
    )
  })

  it('says when the screening does not exist', async () => {
    serveMoviesAndRooms()
    fakeResource('/screenings', [])

    renderApp('/screenings/42/edit')

    expect(await screen.findByRole('alert')).toHaveTextContent("Cette séance n'existe pas.")
  })
})
