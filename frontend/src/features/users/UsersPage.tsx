import { useList } from '../../api/resource'
import { ActionsHeader, ListPage, RowActions } from '../../components/ListPage'
import { QueryContent } from '../../components/QueryContent'
import { useDelete } from '../../forms/useDelete'
import { fullName, usersApi, type User } from './usersApi'

export function UsersPage() {
  const users = useList(usersApi)
  const { remove, errorMessage } = useDelete<User>({
    ...usersApi,
    confirmMessage: (user) => `Supprimer l'utilisateur « ${fullName(user)} » ?`,
    conflictMessage: (user) => `Impossible de supprimer « ${fullName(user)} » : l'utilisateur a des réservations.`,
  })

  return (
    <ListPage title="Utilisateurs" addTo="/users/new" addLabel="Ajouter un utilisateur" errorMessage={errorMessage}>
      <QueryContent query={users} errorMessage="Impossible de charger les utilisateurs.">
        {(users) =>
          users.length === 0 ? (
            <p>Aucun utilisateur pour le moment.</p>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Nom</th>
                  <th>Adresse e-mail</th>
                  <ActionsHeader />
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id}>
                    <td>{fullName(user)}</td>
                    <td>{user.email}</td>
                    <RowActions editTo={`/users/${user.id}/edit`} onDelete={() => remove(user)} />
                  </tr>
                ))}
              </tbody>
            </table>
          )
        }
      </QueryContent>
    </ListPage>
  )
}
