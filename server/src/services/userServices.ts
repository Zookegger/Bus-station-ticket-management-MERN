import db from "../models";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { add, addDays, Duration } from "date-fns";
import { RegisterDTO, LoginDTO, UpdateProfileDTO } from "../types/user";
import ms from "ms";
import { role } from "../models/users";

const BCRYPT_SALT_ROUNDS = 12;

const JWT_SECRET: jwt.Secret = process.env.JWT_SECRET || "yoursupersecret";
const JWT_EXPIRES_IN = (process.env.JWT_EXPIRES_IN as ms.StringValue) || "3d";
const REFRESH_TOKEN_EXPIRES_IN = Number(process.env.REFRESH_TOKEN_EXPIRES_IN || 30);

interface JwtPayload {
	id: number;
	role: string;
}

const generateAccessToken = (payload: JwtPayload) => {
	return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
};

const generateRefreshTokenValue = () => {
	return crypto.randomBytes(64).toString("hex");
};

export const createUser = async (dto: RegisterDTO) => {
	const existing = await db.user.findOne({ where: { email: dto.email } });
	if (existing) throw { status: 400, message: "Email already in use" };
	
	const passwordHash = await bcrypt.hash(dto.password, BCRYPT_SALT_ROUNDS);
	const user = await db.user.create({
		userName: dto.username,
		email: dto.email,
		role: dto.role,
		passwordHash
	});

	const refreshValue = generateRefreshTokenValue();
	const expiresAt = add(new Date(), {days: REFRESH_TOKEN_EXPIRES_IN});
	await db.
};

export const 

