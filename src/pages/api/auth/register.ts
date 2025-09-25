import type { NextApiRequest, NextApiResponse } from "next"
import { dbConnect } from "../../../utils/db"
import User from "../../../models/User"
import { hashPassword, signToken } from "../../../utils/auth"

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).end()

  await dbConnect()
  const { email, password, displayName } = req.body
  if (!email || !password) return res.status(400).json({ error: "Missing fields" })

  const existing = await User.findOne({ email })
  if (existing) return res.status(400).json({ error: "Email already used" })

  const passwordHash = await hashPassword(password)
  const user = await User.create({ email, passwordHash, displayName })
  const token = signToken(user._id.toString())

  res.json({ token, user: { id: user._id, email: user.email, displayName: user.displayName } })
}
