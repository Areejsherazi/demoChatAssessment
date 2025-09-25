import Link from 'next/link'
import { useAuth } from '../../lib/useAuth'

export default function Header() {
  const { user, logout } = useAuth()
  return (
    <header className="header">
      <div className="container header-inner">
        <Link href="/" className="brand">SecureChat</Link>
        <nav>
          {user ? (
            <>
              <span className="muted">Hello, {user.displayName || user.email}</span>
              <button className="btn small" onClick={logout}>Logout</button>
            </>
          ) : (
            <>
              <Link href="/login" className="btn small">Login</Link>
              <Link href="/register" className="btn small ghost">Register</Link>
            </>
          )}
        </nav>
      </div>
    </header>
  )
}
