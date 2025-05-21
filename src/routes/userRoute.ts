import { Router } from "express";
import { login, signup } from "@/controllers/authController";
import { requireLogin } from "@/middlewares/auth";

import { getCourseProgress } from "@/controllers/userController";

export const router = Router();

router.get("/progress/:id", requireLogin, getCourseProgress);
