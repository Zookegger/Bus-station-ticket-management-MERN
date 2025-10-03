import { Router } from "express";
import { updateProfile } from "../../controllers/userController";
import { errorHandler } from "../../middlewares/errorHandler";
import { userInfoValidation, updateProfileValidation } from "../../validators/userValidator";
import { loginValidation, registerValidation } from "../../validators/authValidator";

const userRoutes = Router();


userRoutes.post("/update-profile", updateProfileValidation, updateProfile)

userRoutes.get("/", (req, res) => {
	res.json("It's working");
});

export default userRoutes;
