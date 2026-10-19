import { useItem } from '../../api/resource'
import { useParams } from 'react-router'
import { QueryContent } from '../../components/QueryContent'
import { useUpdate } from '../../forms/useSave'
import { UserForm } from './UserForm'
import { toUserForm } from './userForm'
import { usersApi } from './usersApi'

export function EditUserPage() {
  const id = Number(useParams().id)
  const user = useItem(usersApi, id)
  const update = useUpdate(usersApi, id, '/users')

  return (
    <>
      <h1>Modifier l'utilisateur</h1>
      <QueryContent
        query={user}
        errorMessage="Impossible de charger l'utilisateur."
        notFoundMessage="Cet utilisateur n'existe pas."
      >
        {(user) => <UserForm initialValues={toUserForm(user)} onSubmit={update} />}
      </QueryContent>
    </>
  )
}
