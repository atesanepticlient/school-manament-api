// Import necessary modules from Express and controllers/middlewares
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

// @route   POST /
// @desc    Create a new course (Teacher only)
// @access  Private (Teacher)
// @body    { title, description, price, etc. }
router
  .route("/")
  .post(requireLogin, isTeacher, createCourse)

  // @route   GET /
  // @desc    Get all courses (public)
  // @access  Public
  // @query   ?page=1&limit=10 (optional)
  .get(fetchAllCourses);

// @route   PUT /enroll/:id
// @desc    Enroll in a course by ID
// @access  Private
// @params  id: Course ID (MongoDB ObjectId)
// @body    empty
router.put("/enroll/:id([a-fA-F0-9]{24})", requireLogin, enrollInCourse);

// @route   PUT /rate/:id
// @desc    Rate a course
// @access  Private
// @params  id: Course ID
// @body    { rating: number (e.g. 1-5), comment?: string }
router.put("/rate/:id([a-fA-F0-9]{24})", requireLogin, rateCourse);

// @route   GET /teacher
// @desc    Get all courses created by the logged-in teacher
// @access  Private (Teacher)
router.get("/teacher", requireLogin, isTeacher, fetchCoursesOfTeacher);

// @route   GET /:id
// @desc    Get a single course by ID
// @access  Private (must be logged in)
// @params  id: Course ID
router
  .route("/:id([a-fA-F0-9]{24})")
  .get(requireLogin, fetchCourse)

  // @route   PUT /:id
  // @desc    Update course details
  // @access  Private (Teacher only)
  // @params  id: Course ID
  // @body    { title?, description?, etc. }
  .put(requireLogin, isTeacher, updateCourse)

  // @route   DELETE /:id
  // @desc    Delete a course
  // @access  Private (Teacher only)
  // @params  id: Course ID
  .delete(requireLogin, isTeacher, deleteCourse);

// @route   POST /lesson/:id
// @desc    Add a lesson to a course
// @access  Private (Teacher only)
// @params  id: Course ID
// @body    { title, content, videoUrl?, etc. }
router
  .route("/lesson/:id([a-fA-F0-9]{24})")
  .post(requireLogin, isTeacher, addLessonToCourse)

  // @route   PUT /lesson/:id
  // @desc    Update a lesson of a course
  // @access  Private (Teacher only)
  // @params  id: Lesson ID
  // @body    { title?, content?, etc. }
  .put(requireLogin, isTeacher, updateLessonToCourse)

  // @route   DELETE /lesson/:id
  // @desc    Delete a lesson
  // @access  Private (Teacher only)
  // @params  id: Lesson ID
  .delete(requireLogin, isTeacher, deleteLessonToCourse);

// @route   POST /quiz/:id/join
// @desc    Join a quiz for a course
// @access  Private (Enrolled students only)
// @params  id: Course ID
// @body    empty
router.post(
  "/quiz/:id([a-fA-F0-9]{24})/join",
  requireLogin,
  ensureEnrolled,
  joinQuiz
);

// @route   POST /quiz/:id/check
// @desc    Submit and check quiz answers
// @access  Private (Enrolled students only)
// @params  id: Course ID
// @body    { answers: [...] }
router.post(
  "/quiz/:id([a-fA-F0-9]{24})/check",
  requireLogin,
  ensureEnrolled,
  checkQuizAnswer
);
