import { useEffect, useState } from 'react'
import { useAuth } from '../../lib/useAuth'
import api from '../../lib/api'
import { useRouter } from 'next/router'

export default function ChatsPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [users, setUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!user) return
    setLoading(true)
    api.get('/users')
      .then(res => res.json())
      .then(data => setUsers(data.filter(u => u._id !== user._id)))
      .finally(() => setLoading(false))
  }, [user])

  async function startChat(otherUserId: string) {
    try {
      const res = await api.post('/chats', { body: { otherUserId } })
      const chat = await res.json()
      router.push(`/chats/${chat._id}`)
    } catch (e) {
      console.error(e)
      alert('Failed to start chat')
    }
  }

  if (!user) return <div className="auth-page">Please login...</div>

  return (
    <div className="container">
      <h2 className="page-head">Available Users</h2>
      {loading ? (
        <p>Loading...</p>
      ) : (
        <div className="chat-list card">
          {users.length === 0 ? (
            <p className="muted">No users available</p>
          ) : (
            <ul>
              {users.map(u => (
                <li key={u._id} className="chat-item">
                  <span className="chat-title">{u.displayName}</span>
                  <button className="btn small" onClick={() => startChat(u._id)}>
                    Chat
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  )
}
