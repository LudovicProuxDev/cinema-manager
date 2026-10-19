import { Field, Form } from '../../forms/Form'
import { useForm } from '../../forms/useForm'
import { toUserRequest, validateUser, type UserFormValues } from './userForm'
import type { UserRequest } from './usersApi'

interface UserFormProps {
  initialValues: UserFormValues
  onSubmit: (user: UserRequest) => Promise<unknown>
}

export function UserForm({ initialValues, onSubmit }: UserFormProps) {
  const form = useForm({
    initialValues,
    validate: validateUser,
    toRequest: toUserRequest,
    onSubmit,
    conflictMessage: 'Cette adresse e-mail est déjà utilisée.',
  })

  return (
    <Form form={form} cancelTo="/users">
      <Field name="firstName" label="Prénom" error={form.errors.firstName}>
        <input type="text" maxLength={100} autoComplete="given-name" {...form.field('firstName')} />
      </Field>
      <Field name="lastName" label="Nom" error={form.errors.lastName}>
        <input type="text" maxLength={100} autoComplete="family-name" {...form.field('lastName')} />
      </Field>
      <Field name="email" label="Adresse e-mail" error={form.errors.email}>
        <input type="email" maxLength={255} autoComplete="email" {...form.field('email')} />
      </Field>
    </Form>
  )
}
