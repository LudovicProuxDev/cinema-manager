import { useEffect, useState } from 'react'

type ApiStatus = 'loading' | 'ok' | 'error'

function App() {
  const [apiStatus, setApiStatus] = useState<ApiStatus>('loading')

  useEffect(() => {
    fetch('/api/health')
      .then((response) => setApiStatus(response.ok ? 'ok' : 'error'))
      .catch(() => setApiStatus('error'))
  }, [])

  return (
    <main>
      <h1>Cinema Manager</h1>
      <p>
        Statut de l'API :{' '}
        {apiStatus === 'loading' && 'vérification…'}
        {apiStatus === 'ok' && <strong className="status-ok">opérationnelle</strong>}
        {apiStatus === 'error' && <strong className="status-error">indisponible</strong>}
      </p>
    </main>
  )
}

export default App
