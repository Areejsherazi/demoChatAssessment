import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'   // 👈 add this
import { useAuth } from '../lib/useAuth'
import Button from '../components/ui/Button'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { login } = useAuth()
  const router = useRouter()   // 👈 init router

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      await login(email, password)
      // 👇 after successful login, go to chats page
      router.push('/chats')
    } catch (err: any) {
      setError(err?.message || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-page">
      <form className="card" onSubmit={submit}>
        <h2>Login</h2>
        <label>
          Email
          <input value={email} onChange={e => setEmail(e.target.value)} required />
        </label>
        <label>
          Password
          <input value={password} onChange={e => setPassword(e.target.value)} type="password" required />
        </label>
        {error && <div className="error">{error}</div>}
        <Button type="submit" disabled={loading}>
          {loading ? 'Logging...' : 'Login'}
        </Button>
        <div className="muted">
          Don't have an account? <Link href="/register">Register</Link>
        </div>
      </form>
    </div>
  )
}
