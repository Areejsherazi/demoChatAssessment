// components/chat/ChatList.tsx
import { useRouter } from 'next/router'

export default function ChatList({ chats, loading, currentUserId }: any) {
  const router = useRouter()

  if (loading) return <div>Loading chats...</div>
  if (!chats.length) return <div>No chats yet</div>

  return (
    <ul className="chat-list">
      {chats.map((chat: any) => {
        const otherMembers = chat.members.filter((m: any) => m._id !== currentUserId)
        const title = otherMembers.length
          ? otherMembers.map((m: any) => m.displayName).join(', ')
          : 'No members'

        return (
          <li key={chat._id}>
            <button onClick={() => router.push(`/chats/${chat._id}`)}>
              {title}
            </button>
          </li>
        )
      })}
    </ul>
  )
}
