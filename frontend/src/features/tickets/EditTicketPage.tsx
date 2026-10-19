import { useParams } from 'react-router'
import { useItem } from '../../api/resource'
import { QueryContent } from '../../components/QueryContent'
import { useUpdate } from '../../forms/useSave'
import { TicketForm } from './TicketForm'
import { toTicketForm } from './ticketForm'
import { ticketsApi } from './ticketsApi'

export function EditTicketPage() {
  const id = Number(useParams().id)
  const ticket = useItem(ticketsApi, id)
  const update = useUpdate(ticketsApi, id, '/tickets')

  return (
    <>
      <h1>Modifier le billet</h1>
      <QueryContent query={ticket} errorMessage="Impossible de charger le billet." notFoundMessage="Ce billet n'existe pas.">
        {(ticket) => <TicketForm initialValues={toTicketForm(ticket)} onSubmit={update} />}
      </QueryContent>
    </>
  )
}
