import express, { NextFunction, Request, Response } from "express";

import cookieParser from "cookie-parser";
import createError from "http-errors";
import { ZodError } from "zod";
import { routerLimiter } from "./middlewares/routeLimits";

import { router as authRouter } from "./routes/authRoutes";
import { router as courseRouter } from "./routes/courseRoutes";
import { router as userRouter } from "./routes/userRoute";
import { errorResponse } from "./helpers/http-response";

export const app = express();

//middelwares
app.use(routerLimiter(1, 10)); //set requset limit to all route
app.use(express.static("public"));
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

//application routes
app.use("/api/v1/auth", authRouter);
app.use("/api/v1/course", courseRouter);
app.use("/api/v1/student", userRouter);

// route not found
app.use((req, res, next) => {
  throw createError(
    404,
    "This route has been deprecated and is no longer available"
  );
});

//server error handler (500)
app.use((error: any, req: Request, res: Response, next: NextFunction) => {
  let errorMessages = [];
  const errroMessage = error.message;

  if (error instanceof ZodError) {
    errorMessages = error.issues.map((issue) => ({
      path: issue.path.map(String),
      message: issue.message,
    }));
  } else {
    errorMessages = [
      {
        path: [],
        message: errroMessage || "An unexpected error occurred",
      },
    ];
  }

  const statusCode = error.status;

  return errorResponse(res, {
    statusCode,
    message: errroMessage,
    stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
    errorMessages,
  });
});
