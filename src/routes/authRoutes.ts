import { Router } from "express";
import { login, signup } from "@/controllers/authController";
import { preventIfLoggedIn } from "@/middlewares/auth";

export const router = Router();

router.post("/login", preventIfLoggedIn, login);
router.post("/signup", preventIfLoggedIn, signup);
