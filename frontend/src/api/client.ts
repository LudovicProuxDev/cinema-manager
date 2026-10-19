// Every request goes through /api: the Vite proxy (dev) and nginx (Docker) forward it to the .NET API
const BASE_URL = '/api'

/** An error returned by the API, as a problem details (RFC 9457). */
export interface ProblemDetails {
  title?: string
  detail?: string
  status?: number
  errors?: Record<string, string[]>
}

/** Thrown when the API answers with an error status (4xx, 5xx). */
export class ApiError extends Error {
  readonly status: number
  /** The validation errors, by field name in camelCase (as in the JSON bodies). */
  readonly fieldErrors: Record<string, string[]>

  constructor(status: number, problem: ProblemDetails = {}) {
    super(problem.detail ?? problem.title ?? `The API answered with status ${status}.`)
    this.name = 'ApiError'
    this.status = status
    // ASP.NET names the fields like the C# properties (DurationMinutes)
    this.fieldErrors = Object.fromEntries(
      Object.entries(problem.errors ?? {}).map(([field, messages]) => [
        field.charAt(0).toLowerCase() + field.slice(1),
        messages,
      ]),
    )
  }
}

async function request<T>(method: string, path: string, body?: unknown): Promise<T> {
  const response = await fetch(`${BASE_URL}${path}`, {
    method,
    headers: body === undefined ? undefined : { 'Content-Type': 'application/json' },
    body: body === undefined ? undefined : JSON.stringify(body),
  })

  if (!response.ok) {
    const problem = (await response.json().catch(() => undefined)) as ProblemDetails | undefined
    throw new ApiError(response.status, problem)
  }
  return (response.status === 204 ? undefined : await response.json()) as T
}

export const api = {
  get: <T>(path: string) => request<T>('GET', path),
  post: <T>(path: string, body: unknown) => request<T>('POST', path, body),
  put: (path: string, body: unknown) => request<void>('PUT', path, body),
  delete: (path: string) => request<void>('DELETE', path),
}
