import { Account } from "@/models/account";

export async function getPopulatedAccount() {
  return await Account.findOne({}) // No need to filter by real email
    .populate("user")
    .populate("teacher")
    .lean({ virtuals: true });
}
