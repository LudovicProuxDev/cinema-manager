import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useNavigate, useParams } from 'react-router'
import { ApiError } from '../../api/client'
import { MovieForm } from './MovieForm'
import { toMovieForm } from './movieForm'
import { movieKeys, moviesApi, type MovieRequest } from './moviesApi'

export function EditMoviePage() {
  const id = Number(useParams().id)
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  const movie = useQuery({ queryKey: movieKeys.detail(id), queryFn: () => moviesApi.get(id) })
  const update = useMutation({
    mutationFn: (request: MovieRequest) => moviesApi.update(id, request),
    onSuccess: async () => {
      // Reloads the movie shown by this page, so that the cache does not keep the old version
      await queryClient.invalidateQueries({ queryKey: movieKeys.all })
      await navigate('/movies')
    },
  })

  return (
    <>
      <h1>Modifier le film</h1>
      {movie.isPending && <p>Chargement…</p>}
      {movie.isError && (
        <p role="alert" className="alert">
          {movie.error instanceof ApiError && movie.error.status === 404
            ? "Ce film n'existe pas."
            : 'Impossible de charger le film.'}
        </p>
      )}
      {movie.data && <MovieForm initialValues={toMovieForm(movie.data)} onSubmit={update.mutateAsync} />}
    </>
  )
}
