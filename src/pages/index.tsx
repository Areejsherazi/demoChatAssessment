import { useEffect, useState } from "react"
import { useRouter } from "next/router"
import api from "../lib/api"
import { useAuth } from "../lib/useAuth"

export default function HomePage() {
  const { user } = useAuth()
  const [users, setUsers] = useState<any[]>([])
  const router = useRouter()

  useEffect(() => {
    if (!user) return
    api.get("/users")
      .then(res => res.json())
      .then(setUsers)
      .catch(err => console.error(err))
  }, [user])

  async function startChatWith(otherUserId: string) {
    try {
      const res = await api.post("/chats", { body: { memberId: otherUserId } })
      const chat = await res.json()
      router.push(`/chats/${chat._id}`)
    } catch (err) {
      console.error("Failed to start chat", err)
    }
  }

  if (!user) return <p>Please login first.</p>

  return (
    <div>
      <h2>Users</h2>
      <ul>
        {users.map(u => (
          <li key={u._id}>
            {u.displayName} ({u.email}){" "}
            <button onClick={() => startChatWith(u._id)}>Chat</button>
          </li>
        ))}
      </ul>
    </div>
  )
}
