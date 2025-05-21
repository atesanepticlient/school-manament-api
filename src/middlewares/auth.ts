import { findUserByEmail } from "@/services/user";
import { ROLE } from "@/types/model";
import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import createError from "http-errors";
import { Course } from "@/models/course";
import { Quiz } from "@/models/quiz";

export const requireLogin = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const token = req.cookies?.token;

  if (!token) {
    return res.status(401).json({ error: "Authentication required" });
  }

  try {
    const decoded: any = jwt.verify(token, process.env.JWT_SECRET!);
    const user = await findUserByEmail(decoded.email);
    if (!user) throw Error;
    (req as any).user = user;
    next();
  } catch (error) {
    return res.status(401).json({ error: "Invalid or expired token" });
  }
};

export const preventIfLoggedIn = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const token = req.cookies?.token;

  if (token) {
    try {
      jwt.verify(token, process.env.JWT_SECRET!);
      return res.status(400).json({ error: "You are already logged in" });
    } catch (error) {
      // If token is invalid, allow to continue (e.g. corrupted token)
      return next();
    }
  }

  next();
};

export const isTeacher = (req: Request, res: Response, next: NextFunction) => {
  try {
    console.log("x", req.user);
    if (!req.user || req.user.role !== "TEACHER") {
      return res.status(403).json({ error: "Access denied: Teachers only" });
    }
    // All good, proceed
    next();
  } catch (err) {
    console.error("Teacher check failed:", err);
    res.status(500).json({ error: "Server error" });
  }
};

export const ensureEnrolled = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const quizId = req.params.id;
    const userId = req.user._id;

    const quiz = await Quiz.findById(quizId).populate({
      path: "lesson",
      select: "course",
    });

    if (!quiz || !quiz.lesson || !quiz.lesson.course) {
      throw createError(404, "Quiz or related course not found");
    }

    const courseId = quiz.lesson.course;

    const course = await Course.findById(courseId).select("students").lean();
    if (!course) {
      throw createError(404, "Course not found");
    }

    const isEnrolled = course.students.some(
      (studentId) => studentId.toString() === userId.toString()
    );

    if (!isEnrolled) {
      throw createError(403, "You are not enrolled in this course");
    }

    // Attach courseId for potential downstream use
    req.courseId = courseId;

    next();
  } catch (error) {
    next(error);
  }
};
