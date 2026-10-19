import { useMutation, useQueryClient } from '@tanstack/react-query'
import { ApiError } from '../api/client'

interface DeleteOptions<T> {
  delete: (id: number) => Promise<void>
  /** The cache to refresh once deleted, e.g. the list. */
  keys: { all: readonly unknown[] }
  confirmMessage: (item: T) => string
  /** Shown when the API answers 409 Conflict: the item is still used. */
  conflictMessage?: (item: T) => string
}

/** Deletes an item after confirmation, and gives the message of the error if it fails. */
export function useDelete<T extends { id: number }>(options: DeleteOptions<T>) {
  const queryClient = useQueryClient()
  const mutation = useMutation({
    mutationFn: (item: T) => options.delete(item.id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: options.keys.all }),
  })

  function remove(item: T) {
    if (window.confirm(options.confirmMessage(item))) {
      mutation.mutate(item)
    }
  }

  let errorMessage: string | undefined
  if (mutation.isError) {
    const conflict = mutation.error instanceof ApiError && mutation.error.status === 409
    errorMessage =
      conflict && options.conflictMessage ? options.conflictMessage(mutation.variables) : 'La suppression a échoué.'
  }

  return { remove, errorMessage }
}
