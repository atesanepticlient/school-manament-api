import { Router } from "express";
import { login, signup } from "@/controllers/authController";
import { preventIfLoggedIn } from "@/middlewares/auth";

export const router = Router();

/**
 * @route   POST /login
 * @desc    Authenticates a user using email and password.
 * @access  Public (but blocked if already logged in via `preventIfLoggedIn`)
 * @body    {
 *            email: string,
 *            password: string
 *          }
 * @returns Sets a JWT token in an HTTP-only cookie and returns user info.
 */
router.post("/login", preventIfLoggedIn, login);

/**
 * @route   POST /signup
 * @desc    Registers a new user account. Creates an Account and User model entry,
 *          and also a Teacher profile if `role` is `TEACHER`.
 * @access  Public (but blocked if already logged in via `preventIfLoggedIn`)
 * @body    {
 *            email: string,
 *            password: string,
 *            firstName: string,
 *            lastName: string,
 *            role?: 'STUDENT' | 'TEACHER'
 *          }
 * @returns Returns created user account (without password) with status 201.
 */
router.post("/signup", preventIfLoggedIn, signup);
