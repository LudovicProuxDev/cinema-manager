import { screen, within } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { failWith, fakeResource } from '../../test/fakeApi'
import { renderApp } from '../../test/render'
import type { User } from './usersApi'

const ada: User = { id: 1, firstName: 'Ada', lastName: 'Lovelace', email: 'ada@example.com' }

describe('UsersPage', () => {
  it('lists the users with their email', async () => {
    fakeResource('/users', [ada])

    renderApp('/users')

    const row = await screen.findByRole('row', { name: /Ada Lovelace/ })
    expect(within(row).getByText('ada@example.com')).toBeInTheDocument()
  })

  it('says when there is no user', async () => {
    fakeResource('/users', [])

    renderApp('/users')

    expect(await screen.findByText('Aucun utilisateur pour le moment.')).toBeInTheDocument()
  })

  it('deletes a user after confirmation', async () => {
    const received = fakeResource('/users', [ada])
    const confirm = vi.spyOn(window, 'confirm').mockReturnValue(true)
    const { user } = renderApp('/users')

    await user.click(within(await screen.findByRole('row', { name: /Ada/ })).getByRole('button', { name: 'Supprimer' }))

    expect(confirm).toHaveBeenCalledWith("Supprimer l'utilisateur « Ada Lovelace » ?")
    expect(await screen.findByText('Aucun utilisateur pour le moment.')).toBeInTheDocument()
    expect(received.deletedId).toBe(1)
  })

  it('explains why a user with reservations cannot be deleted', async () => {
    fakeResource('/users', [ada])
    failWith('delete', '/users/:id', 409)
    vi.spyOn(window, 'confirm').mockReturnValue(true)
    const { user } = renderApp('/users')

    await user.click(within(await screen.findByRole('row', { name: /Ada/ })).getByRole('button', { name: 'Supprimer' }))

    expect(await screen.findByRole('alert')).toHaveTextContent(
      "Impossible de supprimer « Ada Lovelace » : l'utilisateur a des réservations.",
    )
  })
})

describe('NewUserPage', () => {
  it('creates a user and goes back to the list', async () => {
    const received = fakeResource('/users', [])
    const { user } = renderApp('/users')

    await user.click(screen.getByRole('link', { name: 'Ajouter un utilisateur' }))
    await user.type(screen.getByLabelText('Prénom'), 'Ada')
    await user.type(screen.getByLabelText('Nom'), 'Lovelace')
    await user.type(screen.getByLabelText('Adresse e-mail'), 'ada@example.com')
    await user.click(screen.getByRole('button', { name: 'Enregistrer' }))

    expect(await screen.findByRole('row', { name: /Ada Lovelace/ })).toBeInTheDocument()
    expect(received.created).toEqual({ firstName: 'Ada', lastName: 'Lovelace', email: 'ada@example.com' })
  })

  it('shows the errors of the form', async () => {
    fakeResource('/users', [])
    const { user } = renderApp('/users/new')

    await user.click(screen.getByRole('button', { name: 'Enregistrer' }))

    expect(screen.getByLabelText('Adresse e-mail')).toHaveAccessibleDescription("L'adresse e-mail est obligatoire.")
  })

  it('says when the email is already used', async () => {
    fakeResource('/users', [ada])
    failWith('post', '/users', 409)
    const { user } = renderApp('/users/new')

    await user.type(screen.getByLabelText('Prénom'), 'Ada')
    await user.type(screen.getByLabelText('Nom'), 'Byron')
    await user.type(screen.getByLabelText('Adresse e-mail'), 'ADA@example.com')
    await user.click(screen.getByRole('button', { name: 'Enregistrer' }))

    expect(await screen.findByRole('alert')).toHaveTextContent('Cette adresse e-mail est déjà utilisée.')
  })
})

describe('EditUserPage', () => {
  it('saves the changes and goes back to the list', async () => {
    const received = fakeResource('/users', [ada])
    const { user } = renderApp('/users')

    await user.click(await screen.findByRole('link', { name: 'Modifier' }))
    const lastName = await screen.findByLabelText('Nom')
    expect(lastName).toHaveValue('Lovelace')
    await user.clear(lastName)
    await user.type(lastName, 'King')
    await user.click(screen.getByRole('button', { name: 'Enregistrer' }))

    expect(await screen.findByRole('row', { name: /Ada King/ })).toBeInTheDocument()
    expect(received.updated).toEqual({ firstName: 'Ada', lastName: 'King', email: 'ada@example.com' })
  })

  it('says when the user does not exist', async () => {
    fakeResource('/users', [])

    renderApp('/users/42/edit')

    expect(await screen.findByRole('alert')).toHaveTextContent("Cet utilisateur n'existe pas.")
  })
})
