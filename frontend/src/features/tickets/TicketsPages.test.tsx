import { screen, within } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { reservations, serveCinema } from '../../test/cinema'
import { failWith, fakeResource } from '../../test/fakeApi'
import { renderApp } from '../../test/render'
import type { Ticket } from './ticketsApi'

const ticket: Ticket = { id: 9, reservationId: 7, seatId: 1, price: 9.5 }
const reservationLabel = 'n° 7 – Ada Lovelace – Inception – 01/11/2026 20:30'

function serveTickets(tickets: Ticket[]) {
  serveCinema()
  fakeResource('/reservations', reservations)
  // Like the API, a ticket takes the price of its screening
  return fakeResource('/tickets', tickets, () => ({ price: 9.5 }))
}

describe('TicketsPage', () => {
  it('lists the tickets with their reservation, seat and price', async () => {
    serveTickets([ticket])

    renderApp('/tickets')

    const row = await screen.findByRole('row', { name: /n° 7/ })
    expect(within(row).getByText('n° 7 – Ada Lovelace')).toBeInTheDocument()
    expect(within(row).getByText('Inception – 01/11/2026 20:30')).toBeInTheDocument()
    expect(within(row).getByText('Salle 1 – A12')).toBeInTheDocument()
    expect(within(row).getByText('9,50 €')).toBeInTheDocument()
  })

  it('says when there is no ticket', async () => {
    serveTickets([])

    renderApp('/tickets')

    expect(await screen.findByText('Aucun billet pour le moment.')).toBeInTheDocument()
  })

  it('deletes a ticket after confirmation', async () => {
    const received = serveTickets([ticket])
    const confirm = vi.spyOn(window, 'confirm').mockReturnValue(true)
    const { user } = renderApp('/tickets')

    await user.click(within(await screen.findByRole('row', { name: /n° 7/ })).getByRole('button', { name: 'Supprimer' }))

    expect(confirm).toHaveBeenCalledWith('Supprimer le billet du siège A12 de la réservation n° 7 ?')
    expect(await screen.findByText('Aucun billet pour le moment.')).toBeInTheDocument()
    expect(received.deletedId).toBe(9)
  })
})

describe('NewTicketPage', () => {
  it('offers only the seats of the room of the screening', async () => {
    serveTickets([])
    const { user } = renderApp('/tickets/new')

    const seat = screen.getByLabelText('Siège')
    expect(within(seat).getAllByRole('option').map((option) => option.textContent)).toEqual([
      "Choisissez d'abord une réservation",
    ])

    await user.selectOptions(screen.getByLabelText('Réservation'), await screen.findByRole('option', { name: reservationLabel }))

    expect(within(seat).getAllByRole('option').map((option) => option.textContent)).toEqual([
      'Choisissez un siège',
      'A12',
      'A13',
    ])
  })

  it('creates a ticket, at the price of the screening, and goes back to the list', async () => {
    const received = serveTickets([])
    const { user } = renderApp('/tickets')

    await user.click(screen.getByRole('link', { name: 'Ajouter un billet' }))
    await user.selectOptions(screen.getByLabelText('Réservation'), await screen.findByRole('option', { name: reservationLabel }))
    await user.selectOptions(screen.getByLabelText('Siège'), 'A13')
    await user.click(screen.getByRole('button', { name: 'Enregistrer' }))

    expect(await screen.findByRole('row', { name: /A13/ })).toHaveTextContent('9,50 €')
    expect(received.created).toEqual({ reservationId: 7, seatId: 2 })
  })

  it('forgets the chosen seat when the reservation changes: it is in another room', async () => {
    serveTickets([])
    fakeResource('/reservations', [
      ...reservations,
      { id: 8, userId: 1, screeningId: 6, createdAt: '2026-10-16T08:00:00Z' },
    ])
    const { user } = renderApp('/tickets/new')

    await user.selectOptions(screen.getByLabelText('Réservation'), await screen.findByRole('option', { name: reservationLabel }))
    await user.selectOptions(screen.getByLabelText('Siège'), 'A13')
    await user.selectOptions(screen.getByLabelText('Réservation'), 'n° 8 – Ada Lovelace – Interstellar – 02/11/2026 20:30')
    await user.click(screen.getByRole('button', { name: 'Enregistrer' }))

    expect(screen.getByLabelText('Siège')).toHaveAccessibleDescription('Choisissez un siège.')
  })

  it('shows the errors of the form', async () => {
    serveTickets([])
    const { user } = renderApp('/tickets/new')

    await user.click(screen.getByRole('button', { name: 'Enregistrer' }))

    expect(screen.getByLabelText('Réservation')).toHaveAccessibleDescription('Choisissez une réservation.')
  })

  it('says when the seat is already booked', async () => {
    serveTickets([ticket])
    failWith('post', '/tickets', 409)
    const { user } = renderApp('/tickets/new')

    await user.selectOptions(screen.getByLabelText('Réservation'), await screen.findByRole('option', { name: reservationLabel }))
    await user.selectOptions(screen.getByLabelText('Siège'), 'A12')
    await user.click(screen.getByRole('button', { name: 'Enregistrer' }))

    expect(await screen.findByRole('alert')).toHaveTextContent('Ce siège est déjà réservé pour cette séance.')
  })
})

describe('EditTicketPage', () => {
  it('saves the changes and goes back to the list', async () => {
    const received = serveTickets([ticket])
    const { user } = renderApp('/tickets')

    await user.click(await screen.findByRole('link', { name: 'Modifier' }))
    expect(await screen.findByRole('option', { name: 'A12' })).toHaveProperty('selected', true)
    await user.selectOptions(screen.getByLabelText('Siège'), 'A13')
    await user.click(screen.getByRole('button', { name: 'Enregistrer' }))

    expect(await screen.findByRole('row', { name: /A13/ })).toBeInTheDocument()
    expect(received.updated).toEqual({ reservationId: 7, seatId: 2 })
  })

  it('says when the ticket does not exist', async () => {
    serveTickets([])

    renderApp('/tickets/42/edit')

    expect(await screen.findByRole('alert')).toHaveTextContent("Ce billet n'existe pas.")
  })
})
