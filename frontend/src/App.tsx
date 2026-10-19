import { Route, Routes } from 'react-router'
import { Layout } from './components/Layout'
import { EditMoviePage } from './features/movies/EditMoviePage'
import { MoviesPage } from './features/movies/MoviesPage'
import { NewMoviePage } from './features/movies/NewMoviePage'
import { HomePage } from './pages/HomePage'
import { NotFoundPage } from './pages/NotFoundPage'

function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<HomePage />} />
        <Route path="movies">
          <Route index element={<MoviesPage />} />
          <Route path="new" element={<NewMoviePage />} />
          <Route path=":id/edit" element={<EditMoviePage />} />
        </Route>
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  )
}

export default App
