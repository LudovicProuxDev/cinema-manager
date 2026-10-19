import { Link, NavLink, Outlet } from 'react-router'

/** The frame of every page: the header with the navigation, then the page itself. */
export function Layout() {
  return (
    <>
      <header className="header">
        <Link to="/" className="brand">
          Cinema Manager
        </Link>
        <nav>
          <NavLink to="/movies">Films</NavLink>
          <NavLink to="/rooms">Salles</NavLink>
          <NavLink to="/seats">Sièges</NavLink>
          <NavLink to="/screenings">Séances</NavLink>
          <NavLink to="/users">Utilisateurs</NavLink>
          <NavLink to="/reservations">Réservations</NavLink>
          <NavLink to="/tickets">Billets</NavLink>
        </nav>
      </header>
      <main>
        <Outlet />
      </main>
    </>
  )
}
