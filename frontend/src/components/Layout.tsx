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
        </nav>
      </header>
      <main>
        <Outlet />
      </main>
    </>
  )
}
