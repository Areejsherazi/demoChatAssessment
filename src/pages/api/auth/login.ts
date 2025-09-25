import type { NextApiRequest, NextApiResponse } from "next"
import { dbConnect } from "../../../utils/db"
import User from "../../../models/User"
import { comparePassword, signToken } from "../../../utils/auth"

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).end()

  await dbConnect()
  const { email, password } = req.body
  const user = await User.findOne({ email })
  if (!user) return res.status(401).json({ error: "Invalid credentials" })

  const match = await comparePassword(password, user.passwordHash)
  if (!match) return res.status(401).json({ error: "Invalid credentials" })

  const token = signToken(user._id.toString())
  res.json({ token, user: { id: user._id, email: user.email, displayName: user.displayName } })
}
