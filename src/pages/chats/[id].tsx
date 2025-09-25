import { useRouter } from 'next/router'
import { useEffect, useState, useRef } from 'react'
import { useAuth } from '../../lib/useAuth'
import api from '../../lib/api'
import MessageBubble from '../../components/chat/MessageBubble'
import { decryptMessageForDisplay, ensureChatKeyAvailable, encryptMessageForSend } from '../../lib/crypto'
import Button from '../../components/ui/Button'

export default function ChatDetailPage() {
  const router = useRouter()
  const { id } = router.query
  const { user } = useAuth()
  const [messages, setMessages] = useState<any[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [chat, setChat] = useState<any | null>(null)
  const listRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
  if (!id || id === "new") return
    fetchChat()
    fetchMessages()
    // naive polling for demo
    const iv = setInterval(fetchMessages, 3000)
    return () => clearInterval(iv)
  }, [id])

  async function fetchChat() {
    try {
      const res = await api.get(`/chats/${id}`)
      setChat(await res.json())
      // ensure chat key exists locally (derive/wrap)
      await ensureChatKeyAvailable(String(id))
    } catch (e) {
      console.error(e)
    }
  }

  

  async function fetchMessages() {
    if (!id) return
    try {
      const res = await api.get(`/chats/${id}/messages`)
      const data = await res.json()
      const decrypted = await Promise.all(
        data.map(async (m: any) => {
          try {
            const plain = await decryptMessageForDisplay(String(id), m.encryptedPayload)
            return { ...m, plaintext: plain }
          } catch (e) {
            return { ...m, plaintext: '[unable to decrypt]' }
          }
        })
      )
      setMessages(decrypted)
      setTimeout(() => listRef.current?.scrollTo({ top: 99999 }), 100)
    } catch (e) {
      console.error(e)
    }
  }

   async function ensureRealChat() {
  if (id && id !== "new") return id
  // Create a new chat on backend
  const res = await api.post('/chats', { body: { title: "Untitled Chat" } })
  const newChat = await res.json()
  const newId = newChat._id
  // redirect user to /chats/<newId>
  router.replace(`/chats/${newId}`)
  return newId
}

async function send() {
  if (!input.trim()) return
  setLoading(true)
  try {
    const chatId = await ensureRealChat()
    const payload = await encryptMessageForSend(chatId, input.trim())
    await api.post(`/chats/${chatId}/messages`, {
      body: { encryptedPayload: payload }
    })
    setInput('')
    await fetchMessages()
  } catch (e) {
    console.error(e)
    alert('Send failed')
  } finally {
    setLoading(false)
  }
}


  return (
    <div className="chat-page">
      <h3>{chat?.title || 'Chat'}</h3>
      <div className="messages" ref={listRef}>
        {messages.map(m => (
          <MessageBubble key={m._id} message={m} currentUserId={user?.id} />
        ))}
      </div>

      <div className="composer">
        <input placeholder="Type a message..." value={input} onChange={e => setInput(e.target.value)} />
        <Button onClick={send} disabled={loading}>{loading ? 'Sending...' : 'Send'}</Button>
      </div>
    </div>
  )
}
