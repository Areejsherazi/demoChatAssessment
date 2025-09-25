import { useState } from 'react'
import api from './api'

export function useChats() {
  const [chats, setChats] = useState<any[]>([])

  async function loadChats() {
    console.log("📡 calling /api/chats ...")
    const res = await api.get('/chats')
    const data = await res.json()
    console.log("✅ chats response", data)
    setChats(data)
  }

  return { chats, loadChats }
}
