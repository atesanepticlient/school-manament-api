import mongoose, { Schema, model } from "mongoose";

const teacherSchema = new Schema(
  {
    bio: String,
    headline: String,
    social: Schema.Types.Mixed,
    education: Schema.Types.Mixed,
    experience: Schema.Types.Mixed,
    profile: {
      type: String,
      default: "writer_defalut_profle_image_will_be_set_later",
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

export const Teacher = model("Teacher", teacherSchema);
