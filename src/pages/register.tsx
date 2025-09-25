import { useState } from 'react'
import Link from 'next/link'
import { useAuth } from '../lib/useAuth'
import Button from '../components/ui/Button'

export default function RegisterPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { register } = useAuth()

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      await register(email, password, displayName)
    } catch (err: any) {
      setError(err?.message || 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-page">
      <form className="card" onSubmit={submit}>
        <h2>Register</h2>
        <label>
          Display name
          <input value={displayName} onChange={e => setDisplayName(e.target.value)} required />
        </label>
        <label>
          Email
          <input value={email} onChange={e => setEmail(e.target.value)} type="email" required />
        </label>
        <label>
          Password
          <input value={password} onChange={e => setPassword(e.target.value)} type="password" required />
        </label>
        {error && <div className="error">{error}</div>}
        <Button type="submit" disabled={loading}>{loading ? 'Creating...' : 'Register'}</Button>
        <div className="muted">
          Already have an account? <Link href="/login">Login</Link>
        </div>
      </form>
    </div>
  )
}
