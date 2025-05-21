import mongoose, { InferSchemaType, Schema, model } from "mongoose";

const userSchema = new Schema(
  {
    first_name: { type: String, required: true },
    last_name: { type: String, required: true },
    profile: {
      type: String,
      default: "default_user_image_will_be_set_later",
    },
    acc_id: {
      type: Schema.Types.ObjectId,
      ref: "Account",
      required: true,
      unique: true,
    },
  },
  { timestamps: true }
);

export const User = model("User", userSchema);
export type UserType = InferSchemaType<typeof userSchema>;
