import { screen, within } from '@testing-library/react'
import { http, HttpResponse } from 'msw'
import { describe, expect, it, vi } from 'vitest'
import { renderApp } from '../../test/render'
import { server } from '../../test/server'
import type { Movie } from './moviesApi'

const inception: Movie = {
  id: 1,
  title: 'Inception',
  description: null,
  durationMinutes: 148,
  releaseDate: '2010-07-16',
}

/** A fake API holding the given movies, which can be deleted. */
function serveMovies(movies: Movie[]) {
  server.use(
    http.get('/api/movies', () => HttpResponse.json(movies)),
    http.delete('/api/movies/:id', ({ params }) => {
      movies = movies.filter((movie) => movie.id !== Number(params.id))
      return new HttpResponse(null, { status: 204 })
    }),
  )
}

const rowOf = (title: string) => screen.findByRole('row', { name: new RegExp(title) })

describe('MoviesPage', () => {
  it('lists the movies with their duration and release date', async () => {
    serveMovies([inception])

    renderApp('/movies')

    const row = await rowOf('Inception')
    expect(within(row).getByText('2 h 28 min')).toBeInTheDocument()
    expect(within(row).getByText('16/07/2010')).toBeInTheDocument()
  })

  it('says when there is no movie', async () => {
    serveMovies([])

    renderApp('/movies')

    expect(await screen.findByText('Aucun film pour le moment.')).toBeInTheDocument()
  })

  it('says when the movies cannot be loaded', async () => {
    server.use(http.get('/api/movies', () => new HttpResponse(null, { status: 500 })))

    renderApp('/movies')

    expect(await screen.findByRole('alert')).toHaveTextContent('Impossible de charger les films.')
  })

  it('links to the form to add a movie', async () => {
    serveMovies([])
    const { user } = renderApp('/movies')

    await user.click(screen.getByRole('link', { name: 'Ajouter un film' }))

    expect(screen.getByRole('heading', { level: 1, name: 'Nouveau film' })).toBeInTheDocument()
  })

  it('deletes a movie after confirmation', async () => {
    serveMovies([inception])
    const confirm = vi.spyOn(window, 'confirm').mockReturnValue(true)
    const { user } = renderApp('/movies')

    await user.click(within(await rowOf('Inception')).getByRole('button', { name: 'Supprimer' }))

    expect(confirm).toHaveBeenCalledWith('Supprimer le film « Inception » ?')
    expect(await screen.findByText('Aucun film pour le moment.')).toBeInTheDocument()
  })

  it('keeps the movie when the deletion is not confirmed', async () => {
    let deleted = false
    serveMovies([inception])
    server.use(
      http.delete('/api/movies/:id', () => {
        deleted = true
        return new HttpResponse(null, { status: 204 })
      }),
    )
    vi.spyOn(window, 'confirm').mockReturnValue(false)
    const { user } = renderApp('/movies')

    await user.click(within(await rowOf('Inception')).getByRole('button', { name: 'Supprimer' }))

    expect(deleted).toBe(false)
    expect(screen.getByRole('row', { name: /Inception/ })).toBeInTheDocument()
  })

  it('explains why a movie with screenings cannot be deleted', async () => {
    serveMovies([inception])
    server.use(
      http.delete('/api/movies/:id', () =>
        HttpResponse.json({ status: 409, detail: 'The resource is still referenced by other resources.' }, { status: 409 }),
      ),
    )
    vi.spyOn(window, 'confirm').mockReturnValue(true)
    const { user } = renderApp('/movies')

    await user.click(within(await rowOf('Inception')).getByRole('button', { name: 'Supprimer' }))

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Impossible de supprimer « Inception » : le film a des séances.',
    )
  })

  it('reports any other deletion error', async () => {
    serveMovies([inception])
    server.use(http.delete('/api/movies/:id', () => new HttpResponse(null, { status: 500 })))
    vi.spyOn(window, 'confirm').mockReturnValue(true)
    const { user } = renderApp('/movies')

    await user.click(within(await rowOf('Inception')).getByRole('button', { name: 'Supprimer' }))

    expect(await screen.findByRole('alert')).toHaveTextContent('La suppression de « Inception » a échoué.')
  })
})
