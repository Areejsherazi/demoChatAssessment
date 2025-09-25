// pages/api/chats/[id]/messages.ts
import type { NextApiRequest, NextApiResponse } from "next"
import { verifyToken } from "../../../../utils/auth"
import { dbConnect } from "../../../../utils/db"
import Message from "../../../../models/Message"
import "../../../../models/User"   // 👈 force register
import "../../../../models/Chat"

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const authHeader = req.headers.authorization
  if (!authHeader) return res.status(401).json({ error: "No token" })
  const token = authHeader.split(" ")[1]
  const payload = verifyToken(token)
  if (!payload) return res.status(401).json({ error: "Invalid token" })

  await dbConnect()
  const { id } = req.query

  // Guard early
  if (!id || id === 'new') {
    if (req.method === "GET") return res.status(200).json([])
    return res.status(400).json({ error: "Chat must be created first" })
  }

if (req.method === "GET") {
  const messages = await Message.find({ chat: id })
    .sort({ createdAt: 1 })
    .populate("sender", "displayName email") // ✅ ab work karega
    .lean()

  return res.json(messages)
}

if (req.method === "POST") {
  const { encryptedPayload } = req.body
  if (!encryptedPayload) return res.status(400).json({ error: "Missing encryptedPayload" })

  let msg = await Message.create({
    chat: id,
    sender: payload.userId,
    encryptedPayload,
  })

  // populate sender before sending back
  msg = await msg.populate("sender", "displayName email")

  return res.status(201).json({ ...msg.toObject(), _id: String(msg._id) })
}


  res.status(405).end()
}
