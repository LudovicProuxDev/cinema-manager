import { screen } from '@testing-library/react'
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

  it('navigates to the movies', async () => {
    server.use(
      http.get('/api/health', () => HttpResponse.text('Healthy')),
      http.get('/api/movies', () => HttpResponse.json([])),
    )
    const { user } = renderApp('/')

    await user.click(screen.getByRole('link', { name: 'Films' }))

    expect(await screen.findByRole('heading', { level: 1, name: 'Films' })).toBeInTheDocument()
  })

  it('shows a page not found for an unknown URL', () => {
    renderApp('/nowhere')

    expect(screen.getByRole('heading', { level: 1, name: 'Page introuvable' })).toBeInTheDocument()
  })
})
