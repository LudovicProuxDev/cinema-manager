import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router'
import type { ResourceApi } from '../api/resource'

/** Creates an item, then goes back to the list. */
export function useCreate<T, TRequest>(resource: ResourceApi<T, TRequest>, listUrl: string) {
  const navigate = useNavigate()
  const mutation = useMutation({
    mutationFn: resource.create,
    // No cache to refresh: the list reloads its items when it is shown again
    onSuccess: () => navigate(listUrl),
  })
  return mutation.mutateAsync
}

/** Replaces an item, then goes back to the list. */
export function useUpdate<T, TRequest>(resource: ResourceApi<T, TRequest>, id: number, listUrl: string) {
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  const mutation = useMutation({
    mutationFn: (request: TRequest) => resource.update(id, request),
    onSuccess: async () => {
      // Reloads the item shown by the edit page, so that the cache does not keep the old version
      await queryClient.invalidateQueries({ queryKey: resource.keys.all })
      await navigate(listUrl)
    },
  })
  return mutation.mutateAsync
}
