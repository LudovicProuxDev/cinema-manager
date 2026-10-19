import { useCreate } from '../../forms/useSave'
import { ScreeningForm } from './ScreeningForm'
import { emptyScreeningForm } from './screeningForm'
import { screeningsApi } from './screeningsApi'

export function NewScreeningPage() {
  const create = useCreate(screeningsApi, '/screenings')

  return (
    <>
      <h1>Nouvelle séance</h1>
      <ScreeningForm initialValues={emptyScreeningForm} onSubmit={create} />
    </>
  )
}
