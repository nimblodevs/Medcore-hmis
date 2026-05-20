import { Router } from "express";
import * as authController from "../controllers/auth.controller.js";
import validateRequest from "../middlewares/validateRequest.js";
import authenticateUser from "../middlewares/authenticateUser.js";
import { loginSchema, refreshTokenSchema, registerSchema } from "../validators/auth.validator.js";

const router = Router();

router.post("/register", validateRequest(registerSchema), authController.register);
router.post("/login", validateRequest(loginSchema), authController.login);
router.post("/refresh-token", validateRequest(refreshTokenSchema), authController.refreshToken);
router.post("/logout", authenticateUser, authController.logout);
router.get("/me", authenticateUser, authController.me);

export default router;

