import mongoose, { Schema } from "mongoose";

const progressSchema = new Schema(
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
    completedQuizzes: [
      {
        type: Schema.Types.ObjectId,
        ref: "Quiz",
      },
    ],
    progressPercentage: { type: Number, default: 0 },
  },
  { timestamps: true }
);
export const Progress = mongoose.model("Progress", progressSchema);
