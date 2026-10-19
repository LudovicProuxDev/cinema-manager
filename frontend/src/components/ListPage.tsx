import type { ReactNode } from 'react'
import { Link } from 'react-router'
import { Alert } from './Alert'

interface ListPageProps {
  title: string
  /** The link to the form that adds an item. */
  addTo: string
  addLabel: string
  /** The error of the last deletion, if any. */
  errorMessage?: string
  children: ReactNode
}

/** A page that lists items: its title, its "add" link, an error message, then the list. */
export function ListPage({ title, addTo, addLabel, errorMessage, children }: ListPageProps) {
  return (
    <>
      <div className="page-header">
        <h1>{title}</h1>
        <Link to={addTo} className="button">
          {addLabel}
        </Link>
      </div>
      {errorMessage && <Alert>{errorMessage}</Alert>}
      {children}
    </>
  )
}

/** The "Modifier" and "Supprimer" actions of a row. */
export function RowActions({ editTo, onDelete }: { editTo: string; onDelete: () => void }) {
  return (
    <td className="actions">
      <Link to={editTo}>Modifier</Link>
      <button type="button" className="danger" onClick={onDelete}>
        Supprimer
      </button>
    </td>
  )
}

/** The header cell of the actions column, named for screen readers only. */
export function ActionsHeader() {
  return (
    <th>
      <span className="visually-hidden">Actions</span>
    </th>
  )
}
