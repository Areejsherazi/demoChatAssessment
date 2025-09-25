// models/Message.ts
import mongoose, { Schema, model, models } from "mongoose"

const messageSchema = new Schema(
  {
    chat: { type: Schema.Types.ObjectId, ref: "Chat", required: true },
    sender: { type: Schema.Types.ObjectId, ref: "User", required: true },
    encryptedPayload: { type: Object, required: true },
  },
  { timestamps: true }
)

export default models.Message || model("Message", messageSchema)
