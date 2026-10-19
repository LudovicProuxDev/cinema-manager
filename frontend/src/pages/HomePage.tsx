import { useQuery } from '@tanstack/react-query'

export function HomePage() {
  const health = useQuery({
    queryKey: ['health'],
    queryFn: async () => (await fetch('/api/health')).ok,
  })

  return (
    <>
      <h1>Cinema Manager</h1>
      <p>
        Statut de l'API :{' '}
        {health.isPending && 'vérification…'}
        {health.data === true && <strong className="status-ok">opérationnelle</strong>}
        {(health.data === false || health.isError) && <strong className="status-error">indisponible</strong>}
      </p>
    </>
  )
}
