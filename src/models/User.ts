import mongoose, { Schema, model, models } from "mongoose"

const UserSchema = new Schema(
  {
    email: { type: String, required: true, unique: true },
    passwordHash: { type: String, required: true },
    displayName: { type: String, required: true }
  },
  { timestamps: true }
)

export default models.User || model("User", UserSchema)
