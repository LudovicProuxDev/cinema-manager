import type { ReactNode } from 'react'

/** An error message, announced by screen readers. */
export function Alert({ children }: { children: ReactNode }) {
  return (
    <p role="alert" className="alert">
      {children}
    </p>
  )
}
