import mongoose, { Schema } from "mongoose";

const feedbackSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    course: {
      type: Schema.Types.ObjectId,
      ref: "Course",
      required: true,
    },
    comment: { type: String, required: true },
    rating: { type: Number, min: 1, max: 5 },
  },
  { timestamps: true }
);
export const Feedback = mongoose.model("Feedback", feedbackSchema);