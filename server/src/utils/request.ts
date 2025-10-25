import { Request } from "express";
import { isStringObject } from "util/types";

/**
 * Extracts and validates ID parameter from request URL
 *
 * @param req - Express request object
 * @returns Validated numeric ID
 * @throws {Object} Error object with status and message if ID is invalid
 *
 * @example
 * // In controller:
 * const id = getParamNumericId(req);
 * const vehicle = await getVehicleTypeById(id);
 */
export const getParamNumericId = (req: Request): number => {
	const id: number = Number.parseInt(req.params.id as string);

	if (isNaN(id)) {
		throw { status: 400, message: "Invalid ID parameter" };
	}
	return id;
};

/**
 * Extracts and validates ID parameter from request URL
 *
 * @param req - Express request object
 * @returns Validated numeric ID
 * @throws {Object} Error object with status and message if ID is invalid
 *
 * @example
 * // In controller:
 * const id = getParamNumericId(req);
 * const vehicle = await getVehicleTypeById(id);
 */
export const getParamStringId = (req: Request): string => {
	const id: string = req.params.id as string;

	if (isStringObject(id)) {
		throw { status: 400, message: "Invalid ID parameter" };
	}
	return id;
};

/**
 * Extracts and validates ID from request body
 *
 * @param req - Express request object
 * @returns Validated numeric ID
 * @throws {Object} Error object with status and message if ID is invalid
 */
export const getBodyId = (req: Request): number => {
	const id: number = Number.parseInt(req.body.id as string);

	if (isNaN(id)) {
		throw { status: 400, message: "Invalid ID in request body" };
	}
	return id;
};

/**
 * Extracts and validates ID from query parameters
 *
 * @param req - Express request object
 * @param paramName - Query parameter name (default: 'id')
 * @returns Validated numeric ID
 * @throws {Object} Error object with status and message if ID is invalid
 */
export const getQueryId = (req: Request, paramName: string = "id"): number => {
	const id: number = Number.parseInt(req.query[paramName] as string);
	
	if (isNaN(id)) {
		throw { status: 400, message: `Invalid ${paramName} in query parameters`, };
	}
	return id;
};
