import { useParams } from 'react-router'
import { useItem } from '../../api/resource'
import { QueryContent } from '../../components/QueryContent'
import { useUpdate } from '../../forms/useSave'
import { ScreeningForm } from './ScreeningForm'
import { toScreeningForm } from './screeningForm'
import { screeningsApi } from './screeningsApi'

export function EditScreeningPage() {
  const id = Number(useParams().id)
  const screening = useItem(screeningsApi, id)
  const update = useUpdate(screeningsApi, id, '/screenings')

  return (
    <>
      <h1>Modifier la séance</h1>
      <QueryContent
        query={screening}
        errorMessage="Impossible de charger la séance."
        notFoundMessage="Cette séance n'existe pas."
      >
        {(screening) => <ScreeningForm initialValues={toScreeningForm(screening)} onSubmit={update} />}
      </QueryContent>
    </>
  )
}
