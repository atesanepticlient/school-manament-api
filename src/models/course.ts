import mongoose, { Schema } from "mongoose";

const courseSchema = new Schema(
  {
    title: { type: String, required: true },
    description: { type: String },
    thumbnail: { type: String },
    teacher: {
      type: Schema.Types.ObjectId,
      ref: "Teacher",
      required: true,
    },
    lessons: [
      {
        type: Schema.Types.ObjectId,
        ref: "Lesson",
      },
    ],
    students: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    feedbacks: [
      {
        type: Schema.Types.ObjectId,
        ref: "Feedback",
      },
    ],
  },
  { timestamps: true }
);
export const Course = mongoose.model("Course", courseSchema);
