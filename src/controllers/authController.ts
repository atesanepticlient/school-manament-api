import { NextFunction, Request, Response } from "express";
import bcrypt from "bcrypt";
import createError from "http-errors";
import jwt from "jsonwebtoken";

import { Account, AccountType } from "@/models/account";
import { User } from "@/models/user";
import { Teacher } from "@/models/teacher";

import { ROLE } from "@/types/model";
import { successResponse } from "@/helpers/http-response";
import { success } from "zod/v4";

export const login = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { email, password } = req.body;
  try {
    // Check if account exists
    const account = await Account.findOne({ email });
    if (!account) {
      throw createError(404, "Account not found");
    }

    // Check password
    const isMatch = await bcrypt.compare(password, account.password);
    if (!isMatch) {
      throw createError(401, "Invalid password");
    }

    // Get user's name from related User model
    const user = await User.findOne({ acc_id: account._id });

    // Create JWT payload
    const payload = {
      id: account._id,
      email: account.email,
    };

    // Create token
    const token = jwt.sign(payload, process.env.JWT_SECRET!, {
      expiresIn: "7d",
    });

    // Set cookie
    res.cookie("token", token, {
      httpOnly: true,
      maxAge: 7 * 24 * 60 * 60 * 1000,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
    });

    return successResponse(res, {
      statusCode: 200,
      message: "Login successful",
      data: { user: payload, token },
    });
  } catch (error) {
    next(error);
  }
};

export const signup = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { email, password, firstName, lastName, role } = req.body;

  try {
    // Check if email already exists
    const existingAccount = await Account.findOne({ email });
    if (existingAccount) {
      throw createError(400, "Email Already Registerd");
    }

    const hashedPassword = bcrypt.hashSync(password, 10);

    // Create account first
    const newAccount = new Account({
      email,
      password: hashedPassword,
      role: role || ROLE.STUDENT,
    });

    await newAccount.save();

    // Create user
    const user = new User({
      first_name: firstName,
      last_name: lastName,
      acc_id: newAccount._id,
    });

    await user.save();

    // If writer role, create writer profile too
    if (role === ROLE.TEACHER) {
      const writer = new Teacher({
        acc_id: newAccount._id,
        bio: "",
        headline: "",
        social: {},
        education: {},
        experience: {},
      });

      await writer.save();
    }

    return successResponse<{ newAccount: AccountType }>(res, {
      message: "Signup successful",
      statusCode: 201,
      data: { newAccount },
    });
  } catch (error) {
    next(error);
  }
};
