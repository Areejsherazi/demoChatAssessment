import { useEffect, useState } from "react"
import { useRouter } from "next/router"
import { useAuth } from "../../lib/useAuth"
import api from "../../lib/api"   // <-- yahan sahi import

export default function UsersPage() {
  const { user } = useAuth()
  const [users, setUsers] = useState<any[]>([])
  const router = useRouter()

  useEffect(() => {
    api.get("/api/users")   // tumhari API route hai /api/users
      .then(res => res.json())
      .then(setUsers)
      .catch(err => console.error("❌ Users fetch failed:", err))
  }, [])

  const startChat = async (otherUserId: string) => {
    try {
      const res = await api.post("/api/chats", { body: { userId: otherUserId } })
      const chat = await res.json()
      router.push(`/chats/${chat._id}`)
    } catch (err) {
      console.error("❌ Chat create failed:", err)
    }
  }

  return (
    <div>
      <h1>Available Users</h1>
      <ul>
        {users
          .filter(u => u._id !== user?._id) // apne aap ko skip karo
          .map(u => (
            <li key={u._id}>
              {u.displayName}{" "}
              <button onClick={() => startChat(u._id)}>Chat</button>
            </li>
          ))}
      </ul>
    </div>
  )
}
