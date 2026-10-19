import { screen, within } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { failWith, fakeResource } from '../../test/fakeApi'
import { renderApp } from '../../test/render'
import type { Room } from '../rooms/roomsApi'
import type { Seat } from './seatsApi'

const rooms: Room[] = [
  { id: 1, name: 'Salle 1' },
  { id: 2, name: 'Salle 2' },
]
const seat: Seat = { id: 3, roomId: 1, row: 'A', number: 12 }

describe('SeatsPage', () => {
  it('lists the seats with the name of their room', async () => {
    fakeResource('/rooms', rooms)
    fakeResource('/seats', [seat])

    renderApp('/seats')

    const row = await screen.findByRole('row', { name: /Salle 1/ })
    expect(within(row).getByText('A')).toBeInTheDocument()
    expect(within(row).getByText('12')).toBeInTheDocument()
  })

  it('says when there is no seat', async () => {
    fakeResource('/rooms', rooms)
    fakeResource('/seats', [])

    renderApp('/seats')

    expect(await screen.findByText('Aucun siège pour le moment.')).toBeInTheDocument()
  })

  it('deletes a seat after confirmation', async () => {
    fakeResource('/rooms', rooms)
    const received = fakeResource('/seats', [seat])
    const confirm = vi.spyOn(window, 'confirm').mockReturnValue(true)
    const { user } = renderApp('/seats')

    await user.click(within(await screen.findByRole('row', { name: /Salle 1/ })).getByRole('button', { name: 'Supprimer' }))

    expect(confirm).toHaveBeenCalledWith('Supprimer le siège A12 de la salle « Salle 1 » ?')
    expect(await screen.findByText('Aucun siège pour le moment.')).toBeInTheDocument()
    expect(received.deletedId).toBe(3)
  })

  it('explains why a seat with tickets cannot be deleted', async () => {
    fakeResource('/rooms', rooms)
    fakeResource('/seats', [seat])
    failWith('delete', '/seats/:id', 409)
    vi.spyOn(window, 'confirm').mockReturnValue(true)
    const { user } = renderApp('/seats')

    await user.click(within(await screen.findByRole('row', { name: /Salle 1/ })).getByRole('button', { name: 'Supprimer' }))

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Impossible de supprimer le siège A12 : des billets sont vendus pour lui.',
    )
  })
})

describe('NewSeatPage', () => {
  it('creates a seat in the chosen room and goes back to the list', async () => {
    fakeResource('/rooms', rooms)
    const received = fakeResource('/seats', [])
    const { user } = renderApp('/seats')

    await user.click(screen.getByRole('link', { name: 'Ajouter un siège' }))
    await user.selectOptions(screen.getByLabelText('Salle'), await screen.findByRole('option', { name: 'Salle 2' }))
    await user.type(screen.getByLabelText('Rang'), 'B')
    await user.type(screen.getByLabelText('Numéro'), '7')
    await user.click(screen.getByRole('button', { name: 'Enregistrer' }))

    expect(await screen.findByRole('row', { name: /Salle 2/ })).toBeInTheDocument()
    expect(received.created).toEqual({ roomId: 2, row: 'B', number: 7 })
  })

  it('shows the errors of the form', async () => {
    fakeResource('/rooms', rooms)
    fakeResource('/seats', [])
    const { user } = renderApp('/seats/new')

    await user.click(screen.getByRole('button', { name: 'Enregistrer' }))

    expect(screen.getByLabelText('Salle')).toHaveAccessibleDescription('Choisissez une salle.')
  })

  it('requires a room even when the user goes back to "Choisissez une salle"', async () => {
    fakeResource('/rooms', rooms)
    fakeResource('/seats', [])
    const { user } = renderApp('/seats/new')

    await user.selectOptions(screen.getByLabelText('Salle'), await screen.findByRole('option', { name: 'Salle 1' }))
    await user.selectOptions(screen.getByLabelText('Salle'), 'Choisissez une salle')
    await user.click(screen.getByRole('button', { name: 'Enregistrer' }))

    expect(screen.getByLabelText('Salle')).toHaveAccessibleDescription('Choisissez une salle.')
  })

  it('says when the seat already exists', async () => {
    fakeResource('/rooms', rooms)
    fakeResource('/seats', [seat])
    failWith('post', '/seats', 409)
    const { user } = renderApp('/seats/new')

    await user.selectOptions(screen.getByLabelText('Salle'), await screen.findByRole('option', { name: 'Salle 1' }))
    await user.type(screen.getByLabelText('Rang'), 'A')
    await user.type(screen.getByLabelText('Numéro'), '12')
    await user.click(screen.getByRole('button', { name: 'Enregistrer' }))

    expect(await screen.findByRole('alert')).toHaveTextContent('Ce siège existe déjà dans cette salle.')
  })
})

describe('EditSeatPage', () => {
  it('saves the changes and goes back to the list', async () => {
    fakeResource('/rooms', rooms)
    const received = fakeResource('/seats', [seat])
    const { user } = renderApp('/seats')

    await user.click(await screen.findByRole('link', { name: 'Modifier' }))
    const number = await screen.findByLabelText('Numéro')
    expect(number).toHaveValue(12)
    expect(await screen.findByRole('option', { name: 'Salle 1' })).toHaveProperty('selected', true)
    await user.clear(number)
    await user.type(number, '13')
    await user.click(screen.getByRole('button', { name: 'Enregistrer' }))

    expect(await screen.findByRole('row', { name: /13/ })).toBeInTheDocument()
    expect(received.updated).toEqual({ roomId: 1, row: 'A', number: 13 })
  })

  it('explains a conflict: the seat exists, or it cannot change room', async () => {
    fakeResource('/rooms', rooms)
    fakeResource('/seats', [seat])
    failWith('put', '/seats/:id', 409)
    const { user } = renderApp('/seats/3/edit')

    await user.click(await screen.findByRole('button', { name: 'Enregistrer' }))

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Ce siège existe déjà dans cette salle, ou il ne peut pas changer de salle : des billets sont vendus pour lui.',
    )
  })

  it('says when the seat does not exist', async () => {
    fakeResource('/rooms', rooms)
    fakeResource('/seats', [])

    renderApp('/seats/42/edit')

    expect(await screen.findByRole('alert')).toHaveTextContent("Ce siège n'existe pas.")
  })
})
