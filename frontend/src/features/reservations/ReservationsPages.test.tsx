import { screen, within } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { reservations, serveCinema } from '../../test/cinema'
import { failWith, fakeResource } from '../../test/fakeApi'
import { renderApp } from '../../test/render'
import type { Reservation } from './reservationsApi'

describe('ReservationsPage', () => {
  it('lists the reservations with their user, screening and creation time', async () => {
    serveCinema()
    fakeResource('/reservations', reservations)

    renderApp('/reservations')

    const row = await screen.findByRole('row', { name: /Ada Lovelace/ })
    expect(within(row).getByText('7')).toBeInTheDocument()
    expect(within(row).getByText('Inception – 01/11/2026 20:30')).toBeInTheDocument()
    expect(within(row).getByText('15/10/2026 10:00')).toBeInTheDocument()
  })

  it('says when there is no reservation', async () => {
    serveCinema()
    fakeResource('/reservations', [])

    renderApp('/reservations')

    expect(await screen.findByText('Aucune réservation pour le moment.')).toBeInTheDocument()
  })

  it('deletes a reservation and its tickets after confirmation', async () => {
    serveCinema()
    const received = fakeResource('/reservations', reservations)
    const confirm = vi.spyOn(window, 'confirm').mockReturnValue(true)
    const { user } = renderApp('/reservations')

    await user.click(within(await screen.findByRole('row', { name: /Ada/ })).getByRole('button', { name: 'Supprimer' }))

    expect(confirm).toHaveBeenCalledWith('Supprimer la réservation n° 7 et ses billets ?')
    expect(await screen.findByText('Aucune réservation pour le moment.')).toBeInTheDocument()
    expect(received.deletedId).toBe(7)
  })
})

describe('NewReservationPage', () => {
  it('creates a reservation and goes back to the list', async () => {
    serveCinema()
    const received = fakeResource<Reservation>('/reservations', [], () => ({ createdAt: '2026-10-19T08:00:00Z' }))
    const { user } = renderApp('/reservations')

    await user.click(screen.getByRole('link', { name: 'Ajouter une réservation' }))
    await user.selectOptions(screen.getByLabelText('Utilisateur'), await screen.findByRole('option', { name: 'Ada Lovelace' }))
    await user.selectOptions(
      screen.getByLabelText('Séance'),
      await screen.findByRole('option', { name: 'Interstellar – 02/11/2026 20:30' }),
    )
    await user.click(screen.getByRole('button', { name: 'Enregistrer' }))

    expect(await screen.findByRole('row', { name: /Interstellar/ })).toBeInTheDocument()
    expect(received.created).toEqual({ userId: 1, screeningId: 6 })
  })

  it('shows the errors of the form', async () => {
    serveCinema()
    fakeResource('/reservations', [])
    const { user } = renderApp('/reservations/new')

    await user.click(screen.getByRole('button', { name: 'Enregistrer' }))

    expect(screen.getByLabelText('Utilisateur')).toHaveAccessibleDescription('Choisissez un utilisateur.')
  })
})

describe('EditReservationPage', () => {
  it('saves the changes and goes back to the list', async () => {
    serveCinema()
    const received = fakeResource('/reservations', reservations)
    const { user } = renderApp('/reservations')

    await user.click(await screen.findByRole('link', { name: 'Modifier' }))
    expect(await screen.findByRole('option', { name: 'Inception – 01/11/2026 20:30' })).toHaveProperty('selected', true)
    await user.selectOptions(screen.getByLabelText('Séance'), 'Interstellar – 02/11/2026 20:30')
    await user.click(screen.getByRole('button', { name: 'Enregistrer' }))

    expect(await screen.findByRole('row', { name: /Interstellar/ })).toBeInTheDocument()
    expect(received.updated).toEqual({ userId: 1, screeningId: 6 })
  })

  it('explains why a reservation with tickets cannot change screening', async () => {
    serveCinema()
    fakeResource('/reservations', reservations)
    failWith('put', '/reservations/:id', 409)
    const { user } = renderApp('/reservations/7/edit')

    await user.click(await screen.findByRole('button', { name: 'Enregistrer' }))

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'La réservation ne peut pas changer de séance : elle a des billets.',
    )
  })

  it('says when the reservation does not exist', async () => {
    serveCinema()
    fakeResource('/reservations', [])

    renderApp('/reservations/42/edit')

    expect(await screen.findByRole('alert')).toHaveTextContent("Cette réservation n'existe pas.")
  })
})
