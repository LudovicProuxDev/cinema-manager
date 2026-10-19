import { useItem } from '../../api/resource'
import { useParams } from 'react-router'
import { QueryContent } from '../../components/QueryContent'
import { useUpdate } from '../../forms/useSave'
import { MovieForm } from './MovieForm'
import { toMovieForm } from './movieForm'
import { moviesApi } from './moviesApi'

export function EditMoviePage() {
  const id = Number(useParams().id)
  const movie = useItem(moviesApi, id)
  const update = useUpdate(moviesApi, id, '/movies')

  return (
    <>
      <h1>Modifier le film</h1>
      <QueryContent query={movie} errorMessage="Impossible de charger le film." notFoundMessage="Ce film n'existe pas.">
        {(movie) => <MovieForm initialValues={toMovieForm(movie)} onSubmit={update} />}
      </QueryContent>
    </>
  )
}
