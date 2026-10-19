import { setupServer } from 'msw/node'

/**
 * A fake API for the tests: it intercepts the requests made with fetch.
 * Each test declares the responses it needs with server.use(...).
 */
export const server = setupServer()
