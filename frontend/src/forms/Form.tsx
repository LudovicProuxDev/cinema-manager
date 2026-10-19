import type { ReactNode } from 'react'
import { Link } from 'react-router'
import { Alert } from '../components/Alert'
import type { FormState } from './useForm'

interface FormProps {
  form: Pick<FormState, 'handleSubmit' | 'submitError' | 'submitting'>
  /** Where "Annuler" goes back to. */
  cancelTo: string
  children: ReactNode
}

/** A form with its error message, its fields and its buttons. */
export function Form({ form, cancelTo, children }: FormProps) {
  return (
    // noValidate: the errors are checked and shown by the form, in French
    <form onSubmit={form.handleSubmit} noValidate className="form">
      {form.submitError && <Alert>{form.submitError}</Alert>}
      {children}
      <div className="form-actions">
        <button type="submit" disabled={form.submitting}>
          Enregistrer
        </button>
        <Link to={cancelTo}>Annuler</Link>
      </div>
    </form>
  )
}

interface FieldProps {
  /** The name of the field, also the id of its input. */
  name: string
  label: string
  error?: string
  children: ReactNode
}

/** A label, its input (the children) and its error message. */
export function Field({ name, label, error, children }: FieldProps) {
  return (
    <div className="field">
      <label htmlFor={name}>{label}</label>
      {children}
      {error && (
        <p id={`${name}-error`} className="field-error">
          {error}
        </p>
      )}
    </div>
  )
}
