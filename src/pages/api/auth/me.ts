import type { NextApiRequest, NextApiResponse } from "next"
import { verifyToken } from "../../../utils/auth"
import { dbConnect } from "../../../utils/db"
import User from "../../../models/User"

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") return res.status(405).end()

  const authHeader = req.headers.authorization
  if (!authHeader) return res.status(401).json({ error: "No token" })

  const token = authHeader.split(" ")[1]
  const payload = verifyToken(token)
  if (!payload) return res.status(401).json({ error: "Invalid token" })

  await dbConnect()
  const user = await User.findById(payload.userId).select("email displayName")
  if (!user) return res.status(404).json({ error: "User not found" })

  res.json({ user })
}
