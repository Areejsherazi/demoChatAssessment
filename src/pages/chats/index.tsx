// pages/chats/index.tsx
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useAuth } from '../../lib/useAuth'
import api from '../../lib/api'
import { useRouter } from 'next/router'
import { useChats } from '../../lib/useChats'
import ChatList from '../../components/chat/ChatList'

export default function ChatsPage() {
  const { user } = useAuth()
  const router = useRouter()
  const { chats, loadChats } = useChats()
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!user) return
    setLoading(true)
    loadChats().finally(() => setLoading(false))
  }, [user])

  if (!user) {
    return <div>Please login...</div>
  }
// pages/chats/index.tsx -> handleNewChat()
async function handleNewChat() {
  try {
    const otherUserId = prompt("Enter other user's ID")
    if (!otherUserId) return

    const res = await api.post('/chats', { body: { otherUserId } })
    const newChat = await res.json()
    console.log('NEW CHAT RESPONSE', newChat)   // <-- add this

    // guard: ensure _id exists and is not 'new'
    if (!newChat || !newChat._id || newChat._id === 'new') {
      alert('Server returned invalid chat id. Check backend logs.')
      return
    }

    router.push(`/chats/${newChat._id}`)
  } catch (e) {
    console.error(e)
    alert('Failed to create chat')
  }
}


  return (
    <div className="page">
      <div className="page-head">
        <h2>Chats</h2>
        <button onClick={handleNewChat} className="btn small">New Chat</button>
      </div>
      <ChatList chats={chats} loading={loading} />
    </div>
  )
}
