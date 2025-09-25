export default function MessageBubble({ message, currentUserId }: any) {
   console.log("💬 Message sender:", message.sender) 
  const mine = message.senderId === currentUserId
  return (
    <div className={`bubble ${mine ? 'mine' : 'theirs'}`}>
      <div className="bubble-meta">
        <strong>{mine ? 'You' : message.sender.displayName || 'User'}</strong>
        <span className="muted">{new Date(message.createdAt).toLocaleTimeString()}</span>
      </div>
      <div className="bubble-body">{message.plaintext}</div>
      <div className="bubble-footer muted">{message.readBy?.length ? `Read by ${message.readBy.length}` : ''}</div>
    </div>
  )
}
