/** 148 → "2 h 28 min" */
export function formatDuration(minutes: number): string {
  const hours = Math.floor(minutes / 60)
  const rest = minutes % 60
  if (hours === 0) return `${rest} min`
  return rest === 0 ? `${hours} h` : `${hours} h ${rest} min`
}

const dateFormat = new Intl.DateTimeFormat('fr-FR', { timeZone: 'UTC' })

/** "2010-07-16" (a date without time, as sent by the API) → "16/07/2010" */
export function formatDate(isoDate: string): string {
  // Read and formatted in UTC, so the day does not shift with the time zone of the browser
  return dateFormat.format(new Date(isoDate))
}
