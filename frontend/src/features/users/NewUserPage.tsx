import { useCreate } from '../../forms/useSave'
import { UserForm } from './UserForm'
import { emptyUserForm } from './userForm'
import { usersApi } from './usersApi'

export function NewUserPage() {
  const create = useCreate(usersApi, '/users')

  return (
    <>
      <h1>Nouvel utilisateur</h1>
      <UserForm initialValues={emptyUserForm} onSubmit={create} />
    </>
  )
}
