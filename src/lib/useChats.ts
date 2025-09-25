import { useState } from 'react'
import api from './api'

export function useChats() {
  const [chats, setChats] = useState<any[]>([])

  async function loadChats() {
    const res = await api.get('/chats')
    const data = await res.json()
    setChats(data)
    return data
  }

  return { chats, loadChats, setChats }
}
