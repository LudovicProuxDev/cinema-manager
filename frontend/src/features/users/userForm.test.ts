import { describe, expect, it } from 'vitest'
import { toUserForm, toUserRequest, validateUser, type UserFormValues } from './userForm'

const valid: UserFormValues = { firstName: 'Ada', lastName: 'Lovelace', email: 'ada@example.com' }

describe('validateUser', () => {
  it('accepts a valid user', () => {
    expect(validateUser(valid)).toEqual({})
  })

  it('accepts the maximum lengths', () => {
    expect(
      validateUser({ firstName: 'x'.repeat(100), lastName: 'x'.repeat(100), email: `${'x'.repeat(243)}@example.com` }),
    ).toEqual({})
  })

  it.each([
    ['firstName', ' ', 'Le prénom est obligatoire.'],
    ['firstName', 'x'.repeat(101), 'Le prénom ne doit pas dépasser 100 caractères.'],
    ['lastName', ' ', 'Le nom est obligatoire.'],
    ['lastName', 'x'.repeat(101), 'Le nom ne doit pas dépasser 100 caractères.'],
    ['email', ' ', "L'adresse e-mail est obligatoire."],
    ['email', 'ada.example.com', "L'adresse e-mail n'est pas valide."],
    ['email', '@example.com', "L'adresse e-mail n'est pas valide."],
    ['email', 'ada@', "L'adresse e-mail n'est pas valide."],
    ['email', 'ada@ex@ample.com', "L'adresse e-mail n'est pas valide."],
    ['email', `${'x'.repeat(244)}@example.com`, "L'adresse e-mail ne doit pas dépasser 255 caractères."],
  ] as const)('rejects %s "%s"', (field, value, message) => {
    expect(validateUser({ ...valid, [field]: value })).toEqual({ [field]: message })
  })
})

describe('toUserRequest', () => {
  it('trims the values', () => {
    expect(toUserRequest({ firstName: ' Ada ', lastName: ' Lovelace ', email: ' ada@example.com ' })).toEqual(valid)
  })
})

describe('toUserForm', () => {
  it('fills the form with a user', () => {
    expect(toUserForm({ id: 1, ...valid })).toEqual(valid)
  })
})
