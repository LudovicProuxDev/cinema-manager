import { screen } from '@testing-library/react'
import { http, HttpResponse } from 'msw'
import { describe, expect, it } from 'vitest'
import { renderApp } from '../../test/render'
import { server } from '../../test/server'
import type { Movie, MovieRequest } from './moviesApi'

const inception: Movie = {
  id: 1,
  title: 'Inception',
  description: 'A thief who steals secrets through dreams.',
  durationMinutes: 148,
  releaseDate: '2010-07-16',
}

/** A fake API holding the given movies, which records what it receives. */
function serveMovies(movies: Movie[]) {
  const received: { created?: MovieRequest; updated?: MovieRequest } = {}
  server.use(
    http.get('/api/movies', () => HttpResponse.json(movies)),
    http.get('/api/movies/:id', ({ params }) => {
      const movie = movies.find((m) => m.id === Number(params.id))
      return movie ? HttpResponse.json(movie) : HttpResponse.json({ status: 404 }, { status: 404 })
    }),
    http.post('/api/movies', async ({ request }) => {
      received.created = (await request.json()) as MovieRequest
      const movie = { id: movies.length + 1, ...received.created }
      movies = [...movies, movie]
      return HttpResponse.json(movie, { status: 201 })
    }),
    http.put('/api/movies/:id', async ({ request, params }) => {
      received.updated = (await request.json()) as MovieRequest
      movies = movies.map((m) => (m.id === Number(params.id) ? { ...m, ...received.updated } : m))
      return new HttpResponse(null, { status: 204 })
    }),
  )
  return received
}

describe('NewMoviePage', () => {
  it('creates a movie and goes back to the list', async () => {
    const received = serveMovies([])
    const { user } = renderApp('/movies/new')

    await user.type(screen.getByLabelText('Titre'), 'Inception')
    await user.type(screen.getByLabelText('Durée (minutes)'), '148')
    await user.type(screen.getByLabelText('Date de sortie'), '2010-07-16')
    await user.click(screen.getByRole('button', { name: 'Enregistrer' }))

    expect(await screen.findByRole('row', { name: /Inception/ })).toBeInTheDocument()
    expect(received.created).toEqual({
      title: 'Inception',
      durationMinutes: 148,
      releaseDate: '2010-07-16',
      description: null,
    })
  })

  it('shows the errors of the form without calling the API', async () => {
    const received = serveMovies([])
    const { user } = renderApp('/movies/new')

    await user.click(screen.getByRole('button', { name: 'Enregistrer' }))

    expect(screen.getByLabelText('Titre')).toHaveAccessibleDescription('Le titre est obligatoire.')
    expect(screen.getByLabelText('Titre')).toHaveAttribute('aria-invalid', 'true')
    expect(screen.getByLabelText('Date de sortie')).toHaveAccessibleDescription('La date de sortie est obligatoire.')
    expect(screen.getByLabelText('Description')).not.toHaveAttribute('aria-invalid')
    expect(received.created).toBeUndefined()
  })

  it('shows the validation errors returned by the API', async () => {
    serveMovies([])
    server.use(
      http.post('/api/movies', () =>
        HttpResponse.json(
          { title: 'One or more validation errors occurred.', errors: { Title: ['The Title is not allowed.'] } },
          { status: 400 },
        ),
      ),
    )
    const { user } = renderApp('/movies/new')

    await user.type(screen.getByLabelText('Titre'), 'Inception')
    await user.type(screen.getByLabelText('Durée (minutes)'), '148')
    await user.type(screen.getByLabelText('Date de sortie'), '2010-07-16')
    await user.click(screen.getByRole('button', { name: 'Enregistrer' }))

    expect(await screen.findByLabelText('Titre')).toHaveAccessibleDescription('The Title is not allowed.')
  })

  it('reports the validation errors of the API that match no field', async () => {
    serveMovies([])
    server.use(
      http.post('/api/movies', () =>
        HttpResponse.json({ errors: { $: ['The JSON is invalid.'] } }, { status: 400 }),
      ),
    )
    const { user } = renderApp('/movies/new')

    await user.type(screen.getByLabelText('Titre'), 'Inception')
    await user.type(screen.getByLabelText('Durée (minutes)'), '148')
    await user.type(screen.getByLabelText('Date de sortie'), '2010-07-16')
    await user.click(screen.getByRole('button', { name: 'Enregistrer' }))

    expect(await screen.findByRole('alert')).toHaveTextContent("L'enregistrement a échoué.")
  })

  it('reports an error of the API', async () => {
    serveMovies([])
    server.use(http.post('/api/movies', () => new HttpResponse(null, { status: 500 })))
    const { user } = renderApp('/movies/new')

    await user.type(screen.getByLabelText('Titre'), 'Inception')
    await user.type(screen.getByLabelText('Durée (minutes)'), '148')
    await user.type(screen.getByLabelText('Date de sortie'), '2010-07-16')
    await user.click(screen.getByRole('button', { name: 'Enregistrer' }))

    expect(await screen.findByRole('alert')).toHaveTextContent("L'enregistrement a échoué.")
  })

  it('reports a network error', async () => {
    serveMovies([])
    server.use(http.post('/api/movies', () => HttpResponse.error()))
    const { user } = renderApp('/movies/new')

    await user.type(screen.getByLabelText('Titre'), 'Inception')
    await user.type(screen.getByLabelText('Durée (minutes)'), '148')
    await user.type(screen.getByLabelText('Date de sortie'), '2010-07-16')
    await user.click(screen.getByRole('button', { name: 'Enregistrer' }))

    expect(await screen.findByRole('alert')).toHaveTextContent("L'enregistrement a échoué.")
  })

  it('goes back to the list when cancelled', async () => {
    serveMovies([])
    const { user } = renderApp('/movies/new')

    await user.click(screen.getByRole('link', { name: 'Annuler' }))

    expect(screen.getByRole('heading', { level: 1, name: 'Films' })).toBeInTheDocument()
  })
})

describe('EditMoviePage', () => {
  it('is reached from the list', async () => {
    serveMovies([inception])
    const { user } = renderApp('/movies')

    await user.click(await screen.findByRole('link', { name: 'Modifier' }))

    expect(await screen.findByLabelText('Titre')).toHaveValue('Inception')
  })

  it('fills the form with the movie', async () => {
    serveMovies([inception])

    renderApp('/movies/1/edit')

    expect(await screen.findByLabelText('Titre')).toHaveValue('Inception')
    expect(screen.getByLabelText('Durée (minutes)')).toHaveValue(148)
    expect(screen.getByLabelText('Date de sortie')).toHaveValue('2010-07-16')
    expect(screen.getByLabelText('Description')).toHaveValue('A thief who steals secrets through dreams.')
  })

  it('saves the changes and goes back to the list', async () => {
    const received = serveMovies([inception])
    const { user } = renderApp('/movies/1/edit')

    const title = await screen.findByLabelText('Titre')
    await user.clear(title)
    await user.type(title, 'Inception (2010)')
    await user.click(screen.getByRole('button', { name: 'Enregistrer' }))

    expect(await screen.findByRole('row', { name: /Inception \(2010\)/ })).toBeInTheDocument()
    expect(received.updated).toEqual({
      title: 'Inception (2010)',
      durationMinutes: 148,
      releaseDate: '2010-07-16',
      description: 'A thief who steals secrets through dreams.',
    })
  })

  it('shows the saved values when the movie is edited again', async () => {
    serveMovies([inception])
    const { user } = renderApp('/movies/1/edit')

    const title = await screen.findByLabelText('Titre')
    await user.clear(title)
    await user.type(title, 'Inception (2010)')
    await user.click(screen.getByRole('button', { name: 'Enregistrer' }))
    await user.click(await screen.findByRole('link', { name: 'Modifier' }))

    // Not the previous title, still in the cache from the first visit
    expect(await screen.findByLabelText('Titre')).toHaveValue('Inception (2010)')
  })

  it('says when the movie does not exist', async () => {
    serveMovies([])

    renderApp('/movies/42/edit')

    expect(await screen.findByRole('alert')).toHaveTextContent("Ce film n'existe pas.")
  })

  it('says when the movie cannot be loaded', async () => {
    server.use(http.get('/api/movies/:id', () => new HttpResponse(null, { status: 500 })))

    renderApp('/movies/1/edit')

    expect(await screen.findByRole('alert')).toHaveTextContent('Impossible de charger le film.')
  })
})
