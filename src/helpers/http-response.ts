import { Response } from "express";

export const successResponse = <T>(
  res: Response,
  {
    message = "Ok",
    statusCode = 200,
    data,
  }: { message?: string; data?: T; statusCode: number }
) => {
  return res.status(statusCode).json({ success: true, message, data });
};

export const errorResponse = (
  res: Response,
  {
    message = "Internal Server Error",
    statusCode = 500,
    stack,
    errorMessages = [],
  }: {
    message: string;
    statusCode: number;
    stack?: string;
    errorMessages?: {
      path: string[];
      message: string;
    }[];
  }
) => {
  return res
    .status(statusCode)
    .json({ success: false, message, stack, errorMessages });
};
