/**
 * Checks a required text, trimmed, of at most `maxLength` characters.
 * `label` starts the message: "Le titre" → "Le titre est obligatoire."
 */
export function checkRequiredText(value: string, maxLength: number, label: string): string | undefined {
  const text = value.trim()
  if (text === '') return `${label} est obligatoire.`
  if (text.length > maxLength) return `${label} ne doit pas dépasser ${maxLength} caractères.`
  return undefined
}

/** Whether the text is a whole number of at least 1, e.g. a duration or a seat number. */
export function isPositiveInteger(value: string): boolean {
  // An empty text gives 0, so it is rejected too
  const number = Number(value)
  return Number.isInteger(number) && number >= 1
}

/** Checks that an option of a select is chosen (its value is "" otherwise). */
export function checkChosen(value: string, message: string): string | undefined {
  return value === '' ? message : undefined
}

/** Keeps only the fields that have an error. */
export function withoutEmpty<T extends Record<string, string | undefined>>(errors: T): Partial<Record<keyof T, string>> {
  return Object.fromEntries(Object.entries(errors).filter(([, message]) => message !== undefined)) as Partial<
    Record<keyof T, string>
  >
}
