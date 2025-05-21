import { Router } from "express";
import { login, signup } from "@/controllers/authController";
import { requireLogin } from "@/middlewares/auth";
import { getCourseProgress } from "@/controllers/userController";

export const router = Router();

// @route   GET /progress/:id
// @desc    Get the current logged-in user's progress for a specific course
// @access  Private (Only logged-in users can access)
// @params  id: Course ID (MongoDB ObjectId)
// @query   None
// @body    None
router.get("/progress/:id", requireLogin, getCourseProgress);
