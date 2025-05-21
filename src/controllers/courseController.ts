import { NextFunction, Request, Response } from "express";
import { Course } from "@/models/course";
import { Teacher } from "@/models/teacher";
import { successResponse } from "@/helpers/http-response";
import { isValidObjectId } from "mongoose";

import createError from "http-errors";
import { Lesson } from "@/models/lesson";
import { Quiz } from "@/models/quiz";
import { populate } from "dotenv";
import { Progress } from "@/models/progress";
import { Feedback } from "@/models/feedback";

export const createCourse = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { title, description, thumbnail } = req.body;

    // User must be authenticated and be a teacher

    const teacher = await Teacher.findOne({ acc_id: req.user?._id });
    if (!teacher) {
      throw createError(403, "Only teachers can create courses.");
    }

    const newCourse = await Course.create({
      title,
      description,
      thumbnail,
      teacher: teacher._id,
    });

    return successResponse(res, {
      statusCode: 201,
      message: "Course created successfully.",
      data: {
        course: newCourse,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const updateCourse = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const { title, description } = req.body;

    // Get teacher ID from logged in user
    const teacherId = req.user?.teacher._id;

    const course = await Course.findOne({ _id: id });
    if (!course) {
      throw createError(404, "Course was not found ");
    }
    if (course?.teacher._id.toString() !== teacherId.toString()) {
      throw createError(
        403,
        "You are not authorized to update this course or it doesn't exist."
      );
    }

    // Update course fields
    if (title) course.title = title;
    if (description) course.description = description;

    await course.save();

    return successResponse(res, {
      statusCode: 200,
      message: "Course updated successfully",
      data: { course },
    });
  } catch (error) {
    next(error);
  }
};

export const deleteCourse = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;

    const teacherId = req.user?.teacher._id;

    const course = await Course.findOne({ _id: id });

    if (!course) {
      throw createError(404, "Course was not found or it was already deleted");
    }

    if (course?.teacher._id.toString() !== teacherId.toString()) {
      throw createError(
        403,
        "You are not authorized to update this course or it doesn't exist."
      );
    }

    await Course.findOneAndDelete({
      _id: id,
    });

    return successResponse(res, {
      statusCode: 200,
      message: "Course deleted successfully",
    });
  } catch (error) {
    console.error("Delete Error:", error);
    res
      .status(500)
      .json({ error: "Something went wrong while deleting the course" });
  }
};

export const addLessonToCourse = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id: courseId } = req.params;
    const teacherId = req.user?.teacher._id;
    const role = req.user?.role;

    if (!isValidObjectId(courseId)) {
      throw createError(400, "Invalid course ID.");
    }

    const course = await Course.findById(courseId)
      .populate("teacher")
      .populate("lessons");
    if (!course) {
      throw createError(404, "Course not found.");
    }

    // Check if current user owns the course
    if (course.teacher._id.toString() !== teacherId.toString()) {
      throw createError(403, "You do not own this course.");
    }

    // Extract lesson data
    const { title, content, videoUrl, videoThumbnail, quizzes } = req.body;

    if (!title || !videoUrl) {
      return res
        .status(400)
        .json({ error: "Title and video URL are required." });
    }

    const lesson = await Lesson.create({
      title,
      content,
      videoUrl,
      videoThumbnail,
      course: course._id,
      quizzes: [], // Will push after quiz creation
    });

    const createdQuizzes = await Quiz.insertMany(
      quizzes.map((q: any) => ({
        ...q,
        lesson: lesson._id,
      }))
    );

    // Update lesson with quiz references
    lesson.quizzes = createdQuizzes.map((quiz) => quiz._id);
    await lesson.save();

    // Add lesson to course
    course.lessons.push(lesson._id);
    await course.save();

    return successResponse(res, {
      statusCode: 201,
      message: "Lesson added successfully.",
      data: { course },
    });
  } catch (error) {
    next(error);
  }
};

export const updateLessonToCourse = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id: lessonId } = req.params;
    const teacherId = req.user?.teacher._id;

    if (!isValidObjectId(lessonId)) {
      throw createError(400, "Invalid lesson ID");
    }

    const lesson = await Lesson.findById(lessonId).populate({
      path: "course",
      populate: { path: "teacher", select: "acc_id" },
    });

    if (!lesson) {
      throw createError(404, "Lesson not found");
    }

    // Check if the logged-in teacher owns the course
    if (lesson.course.teacher._id.toString() !== teacherId.toString()) {
      throw createError(403, "Unauthorized to update this lesson");
    }

    // Extract allowed fields only (excluding videoUrl)
    const { title, content, videoThumbnail } = req.body;

    if (title !== undefined) lesson.title = title;
    if (content !== undefined) lesson.content = content;
    if (videoThumbnail !== undefined) lesson.videoThumbnail = videoThumbnail;

    await lesson.save();

    res.status(200).json({ message: "Lesson updated successfully" });
  } catch (error) {
    next(error);
  }
};

export const deleteLessonToCourse = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id: lessonId } = req.params;
    const teacherId = req.user?.teacher._id;

    if (!isValidObjectId(lessonId)) {
      throw createError(400, "Invalid lesson ID");
    }

    const lesson = await Lesson.findById(lessonId).populate({
      path: "course",
      populate: { path: "teacher", select: "acc_id" },
    });

    if (!lesson) {
      throw createError(404, "Lesson not found");
    }

    // Check if the current teacher owns the lesson's course
    if (lesson.course?.teacher?._id?.toString() !== teacherId.toString()) {
      throw createError(403, "You are not authorized to delete this lesson.");
    }

    // Delete associated quizzes
    await Quiz.deleteMany({ _id: { $in: lesson.quizzes } });

    // Remove lesson from course.lessons
    await Course.findByIdAndUpdate(lesson.course._id, {
      $pull: { lessons: lesson._id },
    });

    // Delete the lesson
    await lesson.deleteOne();

    return successResponse(res, {
      statusCode: 200,
      message: "Lesson and associated quizzes deleted successfully.",
    });
  } catch (error) {
    next(error);
  }
};

export const fetchCoursesOfTeacher = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const teacherId = req.user?.teacher?._id;

    if (!teacherId) {
      throw createError(403, "Only teachers can access this route.");
    }

    const courses = await Course.find({ teacher: teacherId })
      .populate({
        path: "teacher",
        select: "profile",
      })
      .select("title thumbnail description students createdAt")
      .sort({ createdAt: -1 })
      .lean();
    const enrichedCourses = courses.map((course) => ({
      _id: course._id,
      title: course.title,
      thumbnail: course.thumbnail,
      description: course.description,
      createdAt: course.createdAt,
      totalEnrollments: course.students?.length || 0,
      teacher: {
        name: req.user.user.first_name + req.user.user.last_name,
        profile: req.user.teacher?.profile,
      },
    }));
    return successResponse(res, {
      statusCode: 200,
      data: { enrichedCourses },
      message: "",
    });
  } catch (error) {
    next(error);
  }
};

export const fetchAllCourses = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { page = "1", limit = "10", search = "" } = req.query;

    const pageNumber = parseInt(page as string);
    const pageSize = parseInt(limit as string);
    const searchRegex = new RegExp(search as string, "i");

    const filter = search ? { title: { $regex: searchRegex } } : {};

    const courses = await Course.find(filter)
      .select("title thumbnail teacher")
      .skip((pageNumber - 1) * pageSize)
      .limit(pageSize)
      .populate({
        path: "teacher",
        select: "profile acc_id",
        populate: {
          path: "acc_id",
          select: "_id", // minimal account fields
          populate: {
            path: "user",
            select: "first_name last_name",
          },
        },
      })
      .lean();

    const formattedCourses = courses.map((course) => {
      const teacher = course.teacher || {};
      const account = teacher.acc_id || {};
      const user = account.user || {};

      return {
        _id: course._id,
        title: course.title,
        thumbnail: course.thumbnail,
        teacher: {
          profile: teacher.profile || "",
          name: `${user.first_name || ""} ${user.last_name || ""}`.trim(),
        },
      };
    });

    return successResponse(res, {
      statusCode: 200,
      data: {
        page: pageNumber,
        limit: pageSize,
        count: formattedCourses.length,
        courses: formattedCourses,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const fetchCourse = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id: courseId } = req.params;

    const course = await Course.findById(courseId)
      .populate({
        path: "teacher",
        select: "profile acc_id",
        populate: {
          path: "acc_id",
          select: "_id",
          populate: {
            path: "user",
            select: "firstName lastName",
          },
        },
      })
      .populate({
        path: "lessons",
        populate: {
          path: "quizzes",
        },
      })
      .populate({ path: "feedbacks" })
      .populate({
        path: "students",
        select: "firstName lastName email", // or whatever fields exist on User
      });
    const studentCount = await Course.findById(courseId).select("students");
    if (!course) {
      throw createError(404, "Course not found");
    }

    const teacher = course.teacher || {};
    const account = teacher.acc_id || {};
    const user = account.user || {};

    const formattedCourse = {
      _id: course._id,
      title: course.title,
      description: course.description,
      thumbnail: course.thumbnail,
      createdAt: course.createdAt,
      updatedAt: course.updatedAt,
      totalEnrollment: course.students?.length || 0,
      teacher: {
        profile: teacher.profile || "",
        name: `${user.firstName || ""} ${user.lastName || ""}`.trim(),
      },
      lessons: course.lessons || [],
      feedbacks: course.feedbacks || [],
    };

    return successResponse(res, {
      statusCode: 200,
      data: {
        studentCount : studentCount?.students?.length || 0,
        course: formattedCourse,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const joinQuiz = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id: quizId } = req.params;
    const userId = req.user._id;

    // 1. Find the quiz
    const quiz = await Quiz.findById(quizId).populate({
      path: "lesson",
      select: "_id course",
    });

    if (!quiz || !quiz.lesson) {
      throw createError(404, "Quiz or lesson not found");
    }

    const courseId = quiz.lesson.course;

    // 2. Ensure course exists
    const course = await Course.findById(courseId);
    if (!course) {
      throw createError(404, "Course not found");
    }

    // 3. Update course progress
    let progress = await Progress.findOne({
      user: userId,
      course: courseId,
    });

    if (!progress) {
      progress = await Progress.create({
        user: userId,
        course: courseId,
        completedQuizzes: [quizId],
      });
    } else if (!progress.completedQuizzes.includes(quizId)) {
      progress.completedQuizzes.push(quizId);
      await progress.save();
    }

    return successResponse(res, {
      statusCode: 200,
      message: "Quiz joined and progress updated",
      data: {
        progress,
      },
    });
  } catch (err) {
    next(err);
  }
};

export const checkQuizAnswer = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id: quizId } = req.params;
    const { userAnswer } = req.body;

    if (!quizId || !userAnswer) {
      throw createError(400, "quizId and userAnswer are required");
    }

    const quiz = await Quiz.findById(quizId).lean();

    if (!quiz) {
      throw createError(404, "Quiz not found");
    }

    const isCorrect =
      quiz.correctAnswer.trim().toLowerCase() ===
      userAnswer.trim().toLowerCase();

    return successResponse(res, {
      statusCode: 200,
      data: {
        isCorrect,
        correctAnswer: quiz.correctAnswer,
      },
      message: isCorrect ? "Correct answer!" : "Incorrect answer.",
    });
  } catch (error) {
    next(error);
  }
};

export const enrollInCourse = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id: courseId } = req.params;
    const userId = req.user?._id;

    if (!userId) {
      throw createError(401, "Unauthorized: User not found");
    }

    const course = await Course.findById(courseId);

    if (!course) {
      throw createError(404, "Course not found");
    }

    // Check if user is already enrolled
    if (course.students.includes(userId)) {
      throw createError(200, "You are already enrolled in this course.");
    }

    // Add user to the students array
    course.students.push(userId);
    await course.save();

    return successResponse(res, {
      statusCode: 200,
      message: "Successfully enrolled in the course.",
      data: { courseId: course._id },
    });
  } catch (error) {
    next(error);
  }
};

export const rateCourse = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const courseId = req.params.id;
    const userId = req.user._id;
    const { rating, comment } = req.body;

    if (!rating || rating < 1 || rating > 5) {
      throw createError(400, "Rating must be between 1 and 5");
    }

    if (!comment || comment.trim() === "") {
      throw createError(400, "Comment is required");
    }

    // Check if course exists and the user is enrolled
    const course = await Course.findById(courseId).select("students feedbacks");
    if (!course) {
      throw createError(404, "Course not found");
    }

    const isEnrolled = course.students.some(
      (studentId) => studentId.toString() === userId.toString()
    );

    if (!isEnrolled) {
      throw createError(403, "You are not enrolled in this course");
    }

    // Check if feedback already exists
    let feedback = await Feedback.findOne({
      user: userId,
      course: courseId,
    });

    if (feedback) {
      feedback.rating = rating;
      feedback.comment = comment;
      await feedback.save();

      return successResponse(res, {
        statusCode: 200,
        message: "Feedback updated successfully",
        data: feedback,
      });
    }

    // Create new feedback
    feedback = await Feedback.create({
      user: userId,
      course: courseId,
      rating,
      comment,
    });

    // Save feedback ID to course
    course.feedbacks.push(feedback._id);
    await course.save();

    return successResponse(res, {
      statusCode: 201,
      message: "Course rated successfully",
      data: feedback,
    });
  } catch (err) {
    next(err);
  }
};
