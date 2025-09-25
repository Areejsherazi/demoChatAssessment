import { useRouter } from 'next/router'
import { useEffect, useState, useRef } from 'react'
import { useAuth } from '../../lib/useAuth'
import api from '../../lib/api'
import MessageBubble from '../../components/chat/MessageBubble'
import Button from '../../components/ui/Button'
import { decryptMessageForDisplay, ensureChatKeyAvailable, encryptMessageForSend } from '../../lib/crypto'

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
    if (!id || id === 'new') return
    fetchChat()
    fetchMessages()
    const interval = setInterval(fetchMessages, 3000)
    return () => clearInterval(interval)
  }, [id])

  async function fetchChat() {
    if (!id) return
    try {
      const res = await api.get(`/chats/${id}`)
      const chatData = await res.json()
      setChat(chatData)
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

  async function send() {
    if (!input.trim()) return
    setLoading(true)
    try {
      const chatId = id === 'new' ? await createChat() : id
      const payload = await encryptMessageForSend(chatId as string, input.trim())
      await api.post(`/chats/${chatId}/messages`, { body: { encryptedPayload: payload } })
      setInput('')
      await fetchMessages()
    } catch (e) {
      console.error(e)
      alert('Send failed')
    } finally {
      setLoading(false)
    }
  }

  async function createChat() {
    const res = await api.post('/chats', { body: { otherUserId: '' } })
    const newChat = await res.json()
    router.replace(`/chats/${newChat._id}`)
    return newChat._id
  }

  // Find other user to display name
  const otherMember = chat?.members?.find((m: any) => m._id !== user?._id)

  return (
    <div className="chat-page">
      <h3>{otherMember?.displayName || 'Chat'}</h3>
      <div className="messages" ref={listRef}>
        {messages.map(m => (
          <MessageBubble key={m._id} message={m} currentUserId={user?.id} />
        ))}
      </div>

      <div className="composer">
        <input
          placeholder="Type a message..."
          value={input}
          onChange={e => setInput(e.target.value)}
        />
        <Button onClick={send} disabled={loading}>
          {loading ? 'Sending...' : 'Send'}
        </Button>
      </div>
    </div>
  )
}
