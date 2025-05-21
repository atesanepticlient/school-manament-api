import mongoose, { Schema } from "mongoose";

const quizSchema = new Schema(
  {
    question: { type: String, required: true },
    options: [{ type: String, required: true }],
    correctAnswer: { type: String, required: true },
    lesson: {
      type: Schema.Types.ObjectId,
      ref: "Lesson",
      required: true,
    },
  },
  { timestamps: true }
);
export const Quiz = mongoose.model("Quiz", quizSchema);