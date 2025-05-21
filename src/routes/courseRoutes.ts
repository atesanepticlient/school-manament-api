import { Router } from "express";
import { login, signup } from "@/controllers/authController";
import {
  ensureEnrolled,
  isTeacher,
  preventIfLoggedIn,
  requireLogin,
} from "@/middlewares/auth";
import {
  createCourse,
  updateCourse,
  deleteCourse,
  addLessonToCourse,
  updateLessonToCourse,
  deleteLessonToCourse,
  fetchCoursesOfTeacher,
  fetchAllCourses,
  fetchCourse,
  joinQuiz,
  checkQuizAnswer,
  enrollInCourse,
  rateCourse,
} from "@/controllers/courseController";

export const router = Router();

router
  .route("/")
  .post(requireLogin, isTeacher, createCourse)
  .get(fetchAllCourses);

router.put("/enroll/:id([a-fA-F0-9]{24})", requireLogin, enrollInCourse);

router.put(
  "/rate/:id([a-fA-F0-9]{24})",
  requireLogin,
  
  rateCourse
);

router.get("/teacher", requireLogin, isTeacher, fetchCoursesOfTeacher);

router
  .route("/:id([a-fA-F0-9]{24})")
  .get(requireLogin, fetchCourse)
  .put(requireLogin, isTeacher, updateCourse)
  .delete(requireLogin, isTeacher, deleteCourse);

router
  .route("/lesson/:id([a-fA-F0-9]{24})")
  .post(requireLogin, isTeacher, addLessonToCourse)
  .put(requireLogin, isTeacher, updateLessonToCourse)
  .delete(requireLogin, isTeacher, deleteLessonToCourse);

router.post(
  "/quiz/:id([a-fA-F0-9]{24})/join",
  requireLogin,
  ensureEnrolled,
  joinQuiz
);
router.post(
  "/quiz/:id([a-fA-F0-9]{24})/check",
  requireLogin,
  ensureEnrolled,
  checkQuizAnswer
);
