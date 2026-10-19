import type { FormErrors } from '../../forms/useForm'
import { checkRequiredText, withoutEmpty } from '../../forms/rules'
import type { User, UserRequest } from './usersApi'

export type UserFormValues = { firstName: string; lastName: string; email: string }

export const emptyUserForm: UserFormValues = { firstName: '', lastName: '', email: '' }

export function toUserForm(user: User): UserFormValues {
  return { firstName: user.firstName, lastName: user.lastName, email: user.email }
}

export function validateUser(values: UserFormValues): FormErrors<UserFormValues> {
  return withoutEmpty({
    firstName: checkRequiredText(values.firstName, 100, 'Le prénom'),
    lastName: checkRequiredText(values.lastName, 100, 'Le nom'),
    email: checkRequiredText(values.email, 255, "L'adresse e-mail") ?? checkEmail(values.email.trim()),
  })
}

/** The same check as the API: a single "@", neither first nor last. */
function checkEmail(email: string) {
  const at = email.indexOf('@')
  const valid = at > 0 && at === email.lastIndexOf('@') && at < email.length - 1
  return valid ? undefined : "L'adresse e-mail n'est pas valide."
}

export function toUserRequest(values: UserFormValues): UserRequest {
  return { firstName: values.firstName.trim(), lastName: values.lastName.trim(), email: values.email.trim() }
}
