import { screen, within } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { failWith, fakeResource } from '../../test/fakeApi'
import { renderApp } from '../../test/render'
import type { Room } from './roomsApi'

const room: Room = { id: 1, name: 'Salle 1' }

describe('RoomsPage', () => {
  it('lists the rooms', async () => {
    fakeResource('/rooms', [room])

    renderApp('/rooms')

    expect(await screen.findByRole('row', { name: /Salle 1/ })).toBeInTheDocument()
  })

  it('says when there is no room', async () => {
    fakeResource('/rooms', [])

    renderApp('/rooms')

    expect(await screen.findByText('Aucune salle pour le moment.')).toBeInTheDocument()
  })

  it('deletes a room after confirmation', async () => {
    const received = fakeResource('/rooms', [room])
    const confirm = vi.spyOn(window, 'confirm').mockReturnValue(true)
    const { user } = renderApp('/rooms')

    await user.click(within(await screen.findByRole('row', { name: /Salle 1/ })).getByRole('button', { name: 'Supprimer' }))

    expect(confirm).toHaveBeenCalledWith('Supprimer la salle « Salle 1 » et ses sièges ?')
    expect(await screen.findByText('Aucune salle pour le moment.')).toBeInTheDocument()
    expect(received.deletedId).toBe(1)
  })

  it('explains why a room with screenings cannot be deleted', async () => {
    fakeResource('/rooms', [room])
    failWith('delete', '/rooms/:id', 409)
    vi.spyOn(window, 'confirm').mockReturnValue(true)
    const { user } = renderApp('/rooms')

    await user.click(within(await screen.findByRole('row', { name: /Salle 1/ })).getByRole('button', { name: 'Supprimer' }))

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Impossible de supprimer « Salle 1 » : la salle a des séances.',
    )
  })
})

describe('NewRoomPage', () => {
  it('creates a room and goes back to the list', async () => {
    const received = fakeResource('/rooms', [])
    const { user } = renderApp('/rooms')

    await user.click(screen.getByRole('link', { name: 'Ajouter une salle' }))
    await user.type(screen.getByLabelText('Nom'), 'Salle 1')
    await user.click(screen.getByRole('button', { name: 'Enregistrer' }))

    expect(await screen.findByRole('row', { name: /Salle 1/ })).toBeInTheDocument()
    expect(received.created).toEqual({ name: 'Salle 1' })
  })

  it('shows the errors of the form', async () => {
    fakeResource('/rooms', [])
    const { user } = renderApp('/rooms/new')

    await user.click(screen.getByRole('button', { name: 'Enregistrer' }))

    expect(screen.getByLabelText('Nom')).toHaveAccessibleDescription('Le nom est obligatoire.')
  })

  it('says when the name is already used', async () => {
    fakeResource('/rooms', [room])
    failWith('post', '/rooms', 409)
    const { user } = renderApp('/rooms/new')

    await user.type(screen.getByLabelText('Nom'), 'Salle 1')
    await user.click(screen.getByRole('button', { name: 'Enregistrer' }))

    expect(await screen.findByRole('alert')).toHaveTextContent('Une salle porte déjà ce nom.')
  })

  it('reports any other error of the API', async () => {
    fakeResource('/rooms', [])
    failWith('post', '/rooms', 500)
    const { user } = renderApp('/rooms/new')

    await user.type(screen.getByLabelText('Nom'), 'Salle 1')
    await user.click(screen.getByRole('button', { name: 'Enregistrer' }))

    expect(await screen.findByRole('alert')).toHaveTextContent("L'enregistrement a échoué.")
  })
})

describe('EditRoomPage', () => {
  it('saves the changes and goes back to the list', async () => {
    const received = fakeResource('/rooms', [room])
    const { user } = renderApp('/rooms')

    await user.click(await screen.findByRole('link', { name: 'Modifier' }))
    const name = await screen.findByLabelText('Nom')
    expect(name).toHaveValue('Salle 1')
    await user.clear(name)
    await user.type(name, 'Salle Lumière')
    await user.click(screen.getByRole('button', { name: 'Enregistrer' }))

    expect(await screen.findByRole('row', { name: /Salle Lumière/ })).toBeInTheDocument()
    expect(received.updated).toEqual({ name: 'Salle Lumière' })
  })

  it('says when the name is already used', async () => {
    fakeResource('/rooms', [room])
    failWith('put', '/rooms/:id', 409)
    const { user } = renderApp('/rooms/1/edit')

    await user.click(await screen.findByRole('button', { name: 'Enregistrer' }))

    expect(await screen.findByRole('alert')).toHaveTextContent('Une salle porte déjà ce nom.')
  })

  it('says when the room does not exist', async () => {
    fakeResource('/rooms', [])

    renderApp('/rooms/42/edit')

    expect(await screen.findByRole('alert')).toHaveTextContent("Cette salle n'existe pas.")
  })
})
