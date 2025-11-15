import multer from "multer";
import path from "path";
import { Request } from "express";
import fs from "fs";

const uploadDir = path.resolve(__dirname, "..", "..", "uploads");
if (!fs.existsSync(uploadDir)) {
	fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
	destination: (_req: Request, _file: Express.Multer.File, cb) => {
		cb(null, uploadDir);
	},
	filename: (_req: Request, file: Express.Multer.File, cb) => {
		const ext = path.extname(file.originalname);
		const name = `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
		cb(null, name);
	},
});

const fileFilter = (
	_req: Request,
	file: Express.Multer.File,
	cb: multer.FileFilterCallback
) => {
	const allowed = ["image/jpeg", "image/png", "image/webp"];
	if (allowed.includes(file.mimetype)) {
		cb(null, true);
	} else {
		cb(new Error("Unsupported file type. Only JPEG, PNG, and WebP images are allowed."));
	}
};

export const uploadMiddleware = multer({
	storage,
	fileFilter,
	limits: { fileSize: 8 * 1024 * 1024 }, // 8 MB
});
