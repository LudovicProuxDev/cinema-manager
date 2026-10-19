import { describe, expect, it } from 'vitest'
import { toTicketForm, toTicketRequest, validateTicket } from './ticketForm'

describe('validateTicket', () => {
  it('accepts a reservation and a seat', () => {
    expect(validateTicket({ reservationId: '7', seatId: '1' })).toEqual({})
  })

  it('requires a reservation and a seat', () => {
    expect(validateTicket({ reservationId: '', seatId: '' })).toEqual({
      reservationId: 'Choisissez une réservation.',
      seatId: 'Choisissez un siège.',
    })
  })
})

describe('toTicketRequest', () => {
  it('sends the ids', () => {
    expect(toTicketRequest({ reservationId: '7', seatId: '1' })).toEqual({ reservationId: 7, seatId: 1 })
  })
})

describe('toTicketForm', () => {
  it('fills the form with a ticket', () => {
    expect(toTicketForm({ id: 9, reservationId: 7, seatId: 1, price: 9.5 })).toEqual({ reservationId: '7', seatId: '1' })
  })
})
