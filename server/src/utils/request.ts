import { Request } from "express";

/**
 * Extracts and validates a numeric ID from the request URL parameters.
 *
 * @param req - Express request object.
 * @returns The validated numeric ID.
 * @throws An error object if the ID is not a valid number.
 */
export const getParamNumericId = (req: Request): number => {
	const { id } = req.params;

	if (!id) throw { status: 400, message: "Missing ID parameter." };

	const numericId = Number.parseInt(id, 10);

	if (isNaN(numericId)) {
		throw {
			status: 400,
			message: "Invalid ID parameter. Must be a number.",
		};
	}
	return numericId;
};

/**
 * Extracts and validates a string ID from the request URL parameters.
 *
 * @param req - Express request object.
 * @returns The validated string ID.
 * @throws An error object if the ID is missing or is not a valid string.
 */
export const getParamStringId = (req: Request): string => {
	const { id } = req.params;

	if (!id || typeof id !== "string" || id.trim() === "") {
		throw { status: 400, message: "Invalid or missing ID parameter." };
	}
	return id;
};

/**
 * Extracts and validates a numeric ID from the request body.
 *
 * @param req - Express request object.
 * @returns The validated numeric ID.
 * @throws An error object if the ID is not a valid number.
 */
export const getBodyId = (req: Request): number => {
	const { id } = req.body;
	const numericId = Number.parseInt(id, 10);

	if (isNaN(numericId)) {
		throw {
			status: 400,
			message: "Invalid ID in request body. Must be a number.",
		};
	}
	return numericId;
};

/**
 * Extracts and validates a numeric ID from the query string.
 *
 * @param req - Express request object.
 * @param paramName - The name of the query parameter (defaults to 'id').
 * @returns The validated numeric ID.
 * @throws An error object if the ID is not a valid number.
 */
export const getQueryId = (req: Request, paramName: string = "id"): number => {
	const idFromQuery = req.query[paramName];

	if (typeof idFromQuery !== "string") {
		throw {
			status: 400,
			message: `Invalid or missing '${paramName}' in query parameters.`,
		};
	}

	const numericId = Number.parseInt(idFromQuery, 10);

	if (isNaN(numericId)) {
		throw {
			status: 400,
			message: `Invalid '${paramName}' in query parameters. Must be a number.`,
		};
	}
	return numericId;
};
