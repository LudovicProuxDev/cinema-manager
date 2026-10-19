import { useMutation } from '@tanstack/react-query'
import { useNavigate } from 'react-router'
import { MovieForm } from './MovieForm'
import { emptyMovieForm } from './movieForm'
import { moviesApi } from './moviesApi'

export function NewMoviePage() {
  const navigate = useNavigate()
  const create = useMutation({
    mutationFn: moviesApi.create,
    // No cache to refresh: the list reloads the movies when it is shown again
    onSuccess: () => navigate('/movies'),
  })

  return (
    <>
      <h1>Nouveau film</h1>
      <MovieForm initialValues={emptyMovieForm} onSubmit={create.mutateAsync} />
    </>
  )
}
