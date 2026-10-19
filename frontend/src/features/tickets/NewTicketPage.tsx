import { useCreate } from '../../forms/useSave'
import { TicketForm } from './TicketForm'
import { emptyTicketForm } from './ticketForm'
import { ticketsApi } from './ticketsApi'

export function NewTicketPage() {
  const create = useCreate(ticketsApi, '/tickets')

  return (
    <>
      <h1>Nouveau billet</h1>
      <TicketForm initialValues={emptyTicketForm} onSubmit={create} />
    </>
  )
}
