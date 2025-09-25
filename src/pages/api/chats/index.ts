// src/pages/api/chats/index.ts
import type { NextApiRequest, NextApiResponse } from 'next'
import { dbConnect } from '../../../utils/db'
import Chat from '../../../models/Chat'
import { verifyToken } from '../../../utils/auth'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const authHeader = req.headers.authorization
  if (!authHeader) return res.status(401).json({ error: 'No token' })
  const token = authHeader.split(' ')[1]
  const payload = verifyToken(token)
  if (!payload) return res.status(401).json({ error: 'Invalid token' })

  await dbConnect()

 // src/pages/api/chats/index.ts
if (req.method === 'POST') {
  const { otherUserId } = req.body
  if (!otherUserId) return res.status(400).json({ error: 'otherUserId required' })

  // Prevent user from starting chat with self
  if (payload.userId === otherUserId) {
    return res.status(400).json({ error: 'Cannot start chat with yourself' })
  }

  // Check if chat already exists between exactly these 2 users
  let chat = await Chat.findOne({
    members: { $size: 2, $all: [payload.userId, otherUserId] }
  })

  // Create new chat if not exists
  if (!chat) {
    chat = await Chat.create({ members: [payload.userId, otherUserId] })
  }

  // Populate members to get displayName
  chat = await chat.populate('members', 'displayName')

  return res.status(201).json(chat)
}


  // GET all chats for current user
// src/pages/api/chats/index.ts

if (req.method === 'GET') {
  const chats = await Chat.find({ members: payload.userId })
    .populate('members', 'displayName') // <--- yahi important hai
    .lean()
  return res.status(200).json(chats)
}

  res.status(405).end()
}
