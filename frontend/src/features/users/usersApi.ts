import { createResourceApi } from '../../api/resource'

/** A user who books tickets, as returned by the API. */
export interface User {
  id: number
  firstName: string
  lastName: string
  /** Unique regardless of case, stored in lower case. */
  email: string
}

export type UserRequest = Omit<User, 'id'>

export const usersApi = createResourceApi<User, UserRequest>('/users')

export const fullName = (user: User) => `${user.firstName} ${user.lastName}`
