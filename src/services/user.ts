import { Account } from "@/models/account";
import { User } from "@/models/user";
import { populate } from "dotenv";

export const findUserByEmail = async (email: string) => {
  try {
    const account = await Account.findOne({ email })
      .populate("user")
      .populate("teacher")
      .lean({ virtuals: true });

    return account;
  } catch (error) {
    return null;
  }
};
