import { Router } from "express";
import { login, register, logout, updateProfile } from "../../controllers/userController";
import { errorHandler } from "../../middlewares/errorHandler";
import { userInfoValidation, updateProfileValidation } from "../../validators/userValidator";
import { loginValidation, registerValidation } from "../../validators/authValidator";

const userRoutes = Router();

userRoutes.post("/login", loginValidation, login, errorHandler);

userRoutes.post("/register", registerValidation, register, errorHandler);

userRoutes.post("/update-profile", updateProfileValidation, updateProfile)

userRoutes.get("/", (req, res) => {
	res.json("It's working");
});

export default userRoutes;
