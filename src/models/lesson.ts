import mongoose, { Schema } from "mongoose";


const lessonSchema = new Schema(
  {
    title: { type: String, required: true },
    content: { type: String },
    videoUrl: { type: String },
    videoThumbnail: { type: String },
    course: {
      type: Schema.Types.ObjectId,
      ref: "Course",
      required: true,
    },
    quizzes: [
      {
        type: Schema.Types.ObjectId,
        ref: "Quiz",
      },
    ],
  },
  { timestamps: true }
);
export const Lesson = mongoose.model("Lesson", lessonSchema);