import mongoose, { Schema, model, models } from "mongoose"

const ChatSchema = new Schema(
  {
    members: [{ type: Schema.Types.ObjectId, ref: "User" }]
  },
  { timestamps: true }
)

export default models.Chat || model("Chat", ChatSchema)
