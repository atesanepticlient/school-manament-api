import { getPopulatedAccount } from "@/helpers/type";
import { AccountType } from "@/models/account";
import { UserType } from "@/models/user";
import { Request } from "express";

export type PopulatedAccountType = Awaited<
  ReturnType<typeof getPopulatedAccount>
>;
