import express, { Application, Request, Response } from "express";
import cors from "cors";
import morgan from "morgan";
import cookieParser from 'cookie-parser';
export const app: Application = express();

app.use(cors());
app.use(
	morgan("dev", {
		stream: {
			write: (message: string) => {
                const currentTime = new Date(Date.now());

				console.log(`[SERVER - ${currentTime.toUTCString()}]:`, message.trim());
			},
		},
	})
);
app.use(express.json());
app.use(cookieParser());
app.get("/", (req: Request, res: Response): void => {
	res.status(200).json({
		status: "ok",
		message: "Server is running",
	});
});

// app.use('/api', routes);
