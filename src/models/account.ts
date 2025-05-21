import mongoose, { InferSchemaType, Schema, model } from "mongoose";
import { ROLE } from "@/types/model";

const accountSchema = new Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: Object.values(ROLE),
      default: ROLE.STUDENT,
    },
    isBanned: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

export const Account = model("Account", accountSchema);

export type AccountType = InferSchemaType<typeof accountSchema>;

accountSchema.virtual("user", {
  ref: "User",
  localField: "_id",
  foreignField: "acc_id",
  justOne: true,
});
accountSchema.virtual("teacher", {
  ref: "Teacher",
  localField: "_id",
  foreignField: "acc_id",
  justOne: true,
});

// Include virtuals in toJSON and toObject
accountSchema.set("toObject", { virtuals: true });
accountSchema.set("toJSON", { virtuals: true });
