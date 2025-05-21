import mongoose, { Schema } from "mongoose";

const followSchema = new Schema(
  {
    student: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    teacher: {
      type: Schema.Types.ObjectId,
      ref: "Teacher",
      required: true,
    },
  },
  { timestamps: true }
);
export const Follow = mongoose.model("Follow", followSchema);
