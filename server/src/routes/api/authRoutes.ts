import { Router } from "express";
import { errorHandler } from "../../middlewares/errorHandler";
import { loginValidation, registerValidation } from "../../validators/authValidator";
import { login, register } from "../../controllers/authController";

const authRoutes = Router();

authRoutes.post("/login", loginValidation, login, errorHandler);

authRoutes.post("/register", registerValidation, register, errorHandler);

// userRoutes.post("/register", registerValidation, register, errorHandler);

export default authRoutes;