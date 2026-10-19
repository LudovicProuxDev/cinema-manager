import { useState, type ChangeEvent, type FormEvent } from 'react'
import { ApiError } from '../api/client'

/** The fields of a form, as typed by the user (inputs hold strings). */
export type FormValues = Record<string, string>

/** An error message by field. */
export type FormErrors<TValues extends FormValues> = Partial<Record<keyof TValues, string>>

interface UseFormOptions<TValues extends FormValues, TRequest> {
  initialValues: TValues
  /** Checks the values before sending them, to give French messages right away. */
  validate: (values: TValues) => FormErrors<TValues>
  /** Converts the values into the request of the API. */
  toRequest: (values: TValues) => TRequest
  /** Sends the request to the API. A rejected ApiError is shown in the form. */
  onSubmit: (request: TRequest) => Promise<unknown>
  /** Shown when the API answers 409 Conflict (a value already used, a business rule…). */
  conflictMessage?: string
}

/** The state of a form: its values, its errors and its submission. */
export function useForm<TValues extends FormValues, TRequest>(options: UseFormOptions<TValues, TRequest>) {
  const [values, setValues] = useState(options.initialValues)
  const [errors, setErrors] = useState<FormErrors<TValues>>({})
  const [submitError, setSubmitError] = useState<string>()
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSubmitError(undefined)

    const validationErrors = options.validate(values)
    setErrors(validationErrors)
    if (Object.keys(validationErrors).length > 0) return

    setSubmitting(true)
    try {
      await options.onSubmit(options.toRequest(values))
    } catch (error) {
      const fieldErrors = error instanceof ApiError ? errorsOfFields(error, values) : {}
      if (Object.keys(fieldErrors).length > 0) {
        // 400: the API has rules the form does not know, show its messages by field
        setErrors(fieldErrors)
      } else if (error instanceof ApiError && error.status === 409 && options.conflictMessage) {
        setSubmitError(options.conflictMessage)
      } else {
        setSubmitError("L'enregistrement a échoué.")
      }
    } finally {
      setSubmitting(false)
    }
  }

  /** The props that bind an input, a textarea or a select to its value and its error. */
  function field(name: keyof TValues & string) {
    return {
      id: name,
      name,
      value: values[name],
      onChange: (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
        setValues((current) => ({ ...current, [name]: event.target.value })),
      'aria-invalid': errors[name] ? true : undefined,
      'aria-describedby': errors[name] ? `${name}-error` : undefined,
    }
  }

  return { values, setValues, errors, submitError, submitting, field, handleSubmit }
}

export type FormState = ReturnType<typeof useForm>

/** The first message of each validation error of the API that matches a field of the form. */
function errorsOfFields<TValues extends FormValues>(error: ApiError, values: TValues): FormErrors<TValues> {
  return Object.fromEntries(
    Object.entries(error.fieldErrors)
      .filter(([field]) => field in values)
      .map(([field, messages]) => [field, messages[0]]),
  ) as FormErrors<TValues>
}
