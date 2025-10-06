import { body } from "express-validator";

export const loginValidation = [
	body("login").notEmpty().withMessage("Username or email is required"),
	body("password").notEmpty().withMessage("Password is required"),
];

export const registerValidation = [
	body("username").notEmpty().withMessage("Username is required"),
	body("password")
		.notEmpty()
		.isLength({ min: 8 })
		.withMessage("Password must be at least 8 characters")
		.matches(/\d/)
		.withMessage("Password must contain a number")
		.matches(/[a-zA-Z]/)
		.withMessage("Password must contain a letter")
		.isStrongPassword()
		.withMessage("Password is not strong enough"),
	body("confirmPassword")
		.notEmpty()
		.custom((value, { req }) => {
			if (value !== req.body.password) {
				throw new Error("Passwords do not match");
			}
			return true;
		}),
	body("email")
		.notEmpty()
		.withMessage("Email is required")
		.normalizeEmail()
		.isEmail()
		.withMessage("Email must be in valid email format"),
];
