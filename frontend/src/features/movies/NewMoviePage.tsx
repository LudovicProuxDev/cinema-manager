import { useCreate } from '../../forms/useSave'
import { MovieForm } from './MovieForm'
import { emptyMovieForm } from './movieForm'
import { moviesApi } from './moviesApi'

export function NewMoviePage() {
  const create = useCreate(moviesApi, '/movies')

  return (
    <>
      <h1>Nouveau film</h1>
      <MovieForm initialValues={emptyMovieForm} onSubmit={create} />
    </>
  )
}
