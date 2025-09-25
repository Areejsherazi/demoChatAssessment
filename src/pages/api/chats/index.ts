import type { NextApiRequest, NextApiResponse } from "next"
import { dbConnect } from "../../../utils/db"
import { verifyToken } from "../../../utils/auth"
import Chat from "../../../models/Chat"

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const authHeader = req.headers.authorization
  if (!authHeader) return res.status(401).json({ error: "No token" })
  const token = authHeader.split(" ")[1]
  const payload = verifyToken(token)
  if (!payload) return res.status(401).json({ error: "Invalid token" })

  await dbConnect()

  if (req.method === "GET") {
    const chats = await Chat.find({ members: payload.userId })
      .populate("members", "displayName email")
      .lean()
    return res.json(chats)
  }

  if (req.method === "POST") {
    const { userId } = req.body // jis user ke sath chat shuru karni hai
    if (!userId) return res.status(400).json({ error: "Missing userId" })

    // check if already chat exists
    let chat = await Chat.findOne({
      members: { $all: [payload.userId, userId] },
    }).lean()

    if (!chat) {
      chat = await Chat.create({ members: [payload.userId, userId] })
    }

    return res.status(201).json(chat)
  }

  res.status(405).end()
}
