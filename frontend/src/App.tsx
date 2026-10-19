import { Route, Routes } from 'react-router'
import { Layout } from './components/Layout'
import { EditMoviePage } from './features/movies/EditMoviePage'
import { MoviesPage } from './features/movies/MoviesPage'
import { NewMoviePage } from './features/movies/NewMoviePage'
import { EditRoomPage } from './features/rooms/EditRoomPage'
import { NewRoomPage } from './features/rooms/NewRoomPage'
import { RoomsPage } from './features/rooms/RoomsPage'
import { EditUserPage } from './features/users/EditUserPage'
import { NewUserPage } from './features/users/NewUserPage'
import { UsersPage } from './features/users/UsersPage'
import { EditScreeningPage } from './features/screenings/EditScreeningPage'
import { NewScreeningPage } from './features/screenings/NewScreeningPage'
import { ScreeningsPage } from './features/screenings/ScreeningsPage'
import { EditSeatPage } from './features/seats/EditSeatPage'
import { NewSeatPage } from './features/seats/NewSeatPage'
import { SeatsPage } from './features/seats/SeatsPage'
import { EditReservationPage } from './features/reservations/EditReservationPage'
import { NewReservationPage } from './features/reservations/NewReservationPage'
import { ReservationsPage } from './features/reservations/ReservationsPage'
import { EditTicketPage } from './features/tickets/EditTicketPage'
import { NewTicketPage } from './features/tickets/NewTicketPage'
import { TicketsPage } from './features/tickets/TicketsPage'
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
        <Route path="rooms">
          <Route index element={<RoomsPage />} />
          <Route path="new" element={<NewRoomPage />} />
          <Route path=":id/edit" element={<EditRoomPage />} />
        </Route>
        <Route path="seats">
          <Route index element={<SeatsPage />} />
          <Route path="new" element={<NewSeatPage />} />
          <Route path=":id/edit" element={<EditSeatPage />} />
        </Route>
        <Route path="screenings">
          <Route index element={<ScreeningsPage />} />
          <Route path="new" element={<NewScreeningPage />} />
          <Route path=":id/edit" element={<EditScreeningPage />} />
        </Route>
        <Route path="users">
          <Route index element={<UsersPage />} />
          <Route path="new" element={<NewUserPage />} />
          <Route path=":id/edit" element={<EditUserPage />} />
        </Route>
        <Route path="reservations">
          <Route index element={<ReservationsPage />} />
          <Route path="new" element={<NewReservationPage />} />
          <Route path=":id/edit" element={<EditReservationPage />} />
        </Route>
        <Route path="tickets">
          <Route index element={<TicketsPage />} />
          <Route path="new" element={<NewTicketPage />} />
          <Route path=":id/edit" element={<EditTicketPage />} />
        </Route>
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  )
}

export default App
