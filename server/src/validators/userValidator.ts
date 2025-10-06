import { body } from "express-validator";

const genderValidator = body("gender")
	.optional()
	.custom((value) => {
		const genders = ["male", "female", "other"];
		if (value && !genders.includes(value)) {
			throw new Error("Invalid Gender");
		}
		return true;
	});

const dateOfBirthValidator = body("dateOfBirth")
	.optional()
	.isDate()
	.withMessage("Birthday must be in valid date format");

const addressValidator = body("address")
	.optional()
	.isString()
	.withMessage("Address must be a string");

const avatarValidator = body("avatar")
	.optional()
	.isURL()
	.withMessage("Avatar must be a valid URL");

const phoneValidator = body("phoneNumber")
	.optional()
	.isMobilePhone("any")
	.withMessage("Phone number must be valid");

export const userInfoValidation = [
	body("fullName").notEmpty().withMessage("Fullname is required"),
	genderValidator,
	dateOfBirthValidator,
	addressValidator,
	avatarValidator,
	phoneValidator,
];

export const updateProfileValidation = [
	body("fullName")
		.optional()
		.isString()
		.withMessage("Fullname must be a string"),
	genderValidator,
	dateOfBirthValidator,
	addressValidator,
	avatarValidator,
	phoneValidator,
];
