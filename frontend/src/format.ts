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

const dateTimeFormat = new Intl.DateTimeFormat('fr-FR', { dateStyle: 'short', timeStyle: 'short' })

/** "2026-11-01T19:30:00Z" (a UTC time of the API) → "01/11/2026 20:30" in the time zone of the browser */
export function formatDateTime(isoDateTime: string): string {
  return dateTimeFormat.format(new Date(isoDateTime))
}

const priceFormat = new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' })

/** 9.5 → "9,50 €" */
export function formatPrice(price: number): string {
  return priceFormat.format(price)
}

/**
 * "2026-11-01T19:30:00Z" (a UTC time of the API) → "2026-11-01T20:30",
 * the local time shown by an <input type="datetime-local">.
 */
export function toDateTimeInput(isoDateTime: string): string {
  const date = new Date(isoDateTime)
  const pad = (n: number) => String(n).padStart(2, '0')
  return (
    `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}` +
    `T${pad(date.getHours())}:${pad(date.getMinutes())}`
  )
}

/** "2026-11-01T20:30" (the local time of a datetime-local input) → "2026-11-01T19:30:00.000Z" for the API */
export function fromDateTimeInput(localDateTime: string): string {
  // Without a time zone, a date-time string is read as a local time
  return new Date(localDateTime).toISOString()
}
