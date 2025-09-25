// src/pages/api/users/index.ts
import type { NextApiRequest, NextApiResponse } from 'next'
import { dbConnect } from '../../../utils/db'
import User from '../../../models/User'
import { verifyToken } from '../../../utils/auth'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const authHeader = req.headers.authorization
  if (!authHeader) return res.status(401).json({ error: 'No token' })
  const token = authHeader.split(' ')[1]
  const payload = verifyToken(token)
  if (!payload) return res.status(401).json({ error: 'Invalid token' })

  await dbConnect()
  const users = await User.find({ _id: { $ne: payload.userId } }).select('displayName email').lean()
  res.status(200).json(users)
}
