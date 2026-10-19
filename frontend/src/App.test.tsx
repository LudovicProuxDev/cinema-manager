import { screen, within } from '@testing-library/react'
import { http, HttpResponse } from 'msw'
import { describe, expect, it } from 'vitest'
import { renderApp } from './test/render'
import { server } from './test/server'

describe('App', () => {
  it('shows that the API is up', async () => {
    server.use(http.get('/api/health', () => HttpResponse.text('Healthy')))

    renderApp('/')

    expect(await screen.findByText('opérationnelle')).toBeInTheDocument()
  })

  it('shows that the API is down', async () => {
    server.use(http.get('/api/health', () => new HttpResponse(null, { status: 503 })))

    renderApp('/')

    expect(await screen.findByText('indisponible')).toBeInTheDocument()
  })

  it.each([
    ['Films', '/movies'],
    ['Salles', '/rooms'],
    ['Sièges', '/seats'],
    ['Séances', '/screenings'],
    ['Utilisateurs', '/users'],
    ['Réservations', '/reservations'],
    ['Billets', '/tickets'],
  ])('navigates to the page "%s" (%s)', async (name) => {
    server.use(
      http.get('/api/health', () => HttpResponse.text('Healthy')),
      // Every list, as a page also loads the items it refers to (e.g. the rooms of the seats)
      http.get('/api/:resource', () => HttpResponse.json([])),
    )
    const { user } = renderApp('/')

    await user.click(within(screen.getByRole('navigation')).getByRole('link', { name }))

    expect(await screen.findByRole('heading', { level: 1, name })).toBeInTheDocument()
  })

  it('shows a page not found for an unknown URL', () => {
    renderApp('/nowhere')

    expect(screen.getByRole('heading', { level: 1, name: 'Page introuvable' })).toBeInTheDocument()
  })
})
