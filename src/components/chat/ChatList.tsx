import Link from 'next/link'

export default function ChatList({ chats, loading }: { chats: any[], loading?: boolean }) {
  return (
    <div className="chat-list card">
      {loading && <div>Loading chats...</div>}
      {!loading && chats.length === 0 && <div>No chats yet</div>}
      <ul>
        {chats.map((c: any) => (
          <li key={c._id}>
            <Link href={`/chats/${c._id}`} className="chat-item">
              <div>
                <div className="chat-title">{c.title || c._id}</div>
                <div className="chat-preview">{c.latestMessagePreview || 'No messages'}</div>
              </div>
              <div className="chat-meta">{c.updatedAt ? new Date(c.updatedAt).toLocaleString() : ''}</div>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}
