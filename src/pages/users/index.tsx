import { useEffect, useState } from 'react'
import { useAuth } from '../../lib/useAuth'
import api from '../../lib/api'
import { useRouter } from 'next/router'

export default function UsersPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [users, setUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!user) return
    setLoading(true)
    api.get('/users')
      .then(res => res.json())
      .then(data => setUsers(data))
      .finally(() => setLoading(false))
  }, [user])

  if (!user) return <div>Please login...</div>

  async function startChat(otherUserId: string) {
    try {
      if (otherUserId === user._id) return
      const res = await api.post('/chats', { body: { otherUserId } })
      const chat = await res.json()
      router.push(`/chats/${chat._id}`)
    } catch (e) {
      console.error(e)
      alert('Failed to start chat')
    }
  }

  return (
    <div className="page">
      <h2>Available Users</h2>
      {loading ? <p>Loading...</p> : (
        <ul>
          {users.map(u => (
            u._id !== user._id && ( 
              <li key={u._id}>
                <button onClick={() => startChat(u._id)}>
                  {u.displayName}
                </button>
              </li>
            )
          ))}
        </ul>
      )}
    </div>
  )
}
