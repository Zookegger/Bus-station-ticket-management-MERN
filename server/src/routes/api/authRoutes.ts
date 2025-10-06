import { Router } from "express";
import { errorHandler } from "../../middlewares/errorHandler";
import { loginValidation, registerValidation } from "../../validators/authValidator";
import { login, register } from "../../controllers/authController";
import { handleValidationResult } from "../../middlewares/validateRequest";

const authRoutes = Router();

authRoutes.post("/login", loginValidation, handleValidationResult, login, errorHandler);

authRoutes.post("/register", registerValidation, handleValidationResult, register, errorHandler);

// userRoutes.post("/register", registerValidation, register, errorHandler);

export default authRoutes;