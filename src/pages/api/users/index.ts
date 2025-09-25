import type { NextApiRequest, NextApiResponse } from "next"
import { dbConnect } from "../../../utils/db"
import { verifyToken } from "../../../utils/auth"
import User from "../../../models/User"

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const authHeader = req.headers.authorization
  if (!authHeader) return res.status(401).json({ error: "No token" })
  const token = authHeader.split(" ")[1]
  const payload = verifyToken(token)
  if (!payload) return res.status(401).json({ error: "Invalid token" })

  await dbConnect()

  if (req.method === "GET") {
    const users = await User.find({}, "displayName email").lean()
    return res.json(users)
  }

  res.status(405).end()
}
