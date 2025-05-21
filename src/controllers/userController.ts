import { Request, Response, NextFunction } from "express";
import createError from "http-errors";
import { Progress } from "@/models/progress";
import { Course } from "@/models/course";
import { successResponse } from "@/helpers/http-response";

export const getCourseProgress = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    console.log("C")
    const courseId = req.params.id;
    const userId = req.user._id;

    const course = await Course.findById(courseId);
    if (!course) throw createError(404, "Course not found");

    const progress = await Progress.findOne({
      user: userId,
      course: courseId,
    })
      .populate({
        path: "completedQuizzes",
        select: "question",
      })
      .lean();

    if (!progress) {
      return successResponse(res, {
        statusCode: 200,
        message: "No progress yet for this course",
        data: {
          completedQuizzes: [],
        },
      });
    }

    return successResponse(res, {
      statusCode: 200,
      message: "Course progress fetchedd",
      data: progress,
    });
  } catch (err) {
    next(err);
  }
};
