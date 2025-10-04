import { Request, Response, NextFunction } from "express";
import { format } from "date-fns";
import logger from "../utils/logger";

export const errorHandler = (
	err: any,
	req: Request,
	res: Response,
	next: NextFunction
) => {
	logger.debug(err);
	const time = Date.now();
    const status = err.status || 500;
	res.status(status).json({
		message: err.message || "Internal Server Error",
        time: format(time, "dd/MM/yyyy"),
    });
};
