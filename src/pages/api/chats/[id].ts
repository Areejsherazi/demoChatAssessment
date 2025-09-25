// pages/api/chats/[id].ts
import type { NextApiRequest, NextApiResponse } from "next"
import { verifyToken } from "../../../utils/auth"
import { dbConnect } from "../../../utils/db"
import Chat from "../../../models/Chat"

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const authHeader = req.headers.authorization
  if (!authHeader) return res.status(401).json({ error: "No token" })
  const token = authHeader.split(" ")[1]
  const payload = verifyToken(token)
  if (!payload) return res.status(401).json({ error: "Invalid token" })

  await dbConnect()

const { id } = req.query


if (req.method === "GET") {
  if (id === "new") {
  return res.status(400).json({ error: "Chat must be created before sending messages" })
  }

  const chat = await Chat.findById(id).populate("members", "displayName email")
  if (!chat) return res.status(404).json({ error: "Chat not found" })
  return res.json(chat)
}


  res.status(405).end()
}
