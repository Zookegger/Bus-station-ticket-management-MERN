// TODO: Implement auto driver assignment to trip, then set trip's status TripStatus.SCHEDULED

import db from "@models/index";
import { TripSchedule } from "@models/tripSchedule";
import { AssignmentMode, TripStatus } from "@my_types/trip";
import { getDriverById } from "@services/driverServices";
import {
	AvailabilityBasedStrategy,
	IDriverAssignmentStrategy,
} from "@utils/schedulingStrategy";
import logger from "@utils/logger";
import { emitCrudChange } from "./realtimeEvents";
import { User } from "@models/user";

/**
 * Auto-assigns a driver to a trip using the provided strategy.
 * Sets trip status to SCHEDULED upon successful assignment.
 *
 * @param {number} trip_id - ID of the trip to assign
 * @param {IDriverAssignmentStrategy} strategy - Assignment strategy (defaults to availability-based)
 * @returns {Promise<TripSchedule>} Promise resolving to created assignment record
 * @throws {Object} Error with status code and message if assignment fails
 */
export const autoAssignDriver = async (
	tripId: number,
	strategy: IDriverAssignmentStrategy = new AvailabilityBasedStrategy()
): Promise<TripSchedule> => {
	const transaction = await db.sequelize.transaction();

	try {
		// Lock trip row to prevent concurrent assignments
		const trip = await db.Trip.findByPk(tripId, {
			lock: transaction.LOCK.UPDATE,
			transaction,
		});

		if (!trip) {
			logger.error(`[Auto Assign Driver]: Trip ${tripId} not found`);
			throw { status: 404, message: `Trip ${tripId} not found.` };
		}

		// Check if trip already has an assignment
		const existing_schedule = await db.TripSchedule.findOne({
			where: { tripId },
			transaction,
		});

		if (existing_schedule) {
			logger.warn(
				`[Auto Assign Driver]: Trip ${tripId} already has assignment id=${existing_schedule.id}`
			);
			throw {
				status: 409,
				message: `Trip ${tripId} already has a driver assigned`,
			};
		}

		// Use strategy to select a driver
		const selected_driver_id = await strategy.selectDriver(tripId);

		if (!selected_driver_id) {
			logger.warn(
				`[Auto Assign Driver]: No available driver for trip ${tripId}`
			);
			throw {
				status: 404,
				message: `No available driver found for trip ${tripId}`,
			};
		}

		const schedule = await db.TripSchedule.create(
			{
				tripId,
				driverId: selected_driver_id,
				assignedAt: new Date(),
				assignmentMode: AssignmentMode.AUTO,
				assignedBy: null,
			},
			{ transaction }
		);

		await db.Trip.update(
			{ status: TripStatus.SCHEDULED },
			{ where: { id: tripId }, transaction }
		);

		await transaction.commit();

		emitCrudChange(
			"trip_assignment",
			"create",
			{ tripId, driverId: selected_driver_id, mode: "auto" },
			{ id: "system", name: "System Auto-Assign" }
		);

		return schedule;
	} catch (err) {
		try {
			if (
				transaction &&
				(transaction as any).finished !== "commit" &&
				(transaction as any).finished !== "rollback"
			) {
				await transaction.rollback();
				logger.info(
					`transaction rolled back for autoAssignDriver(tripId=${tripId})`
				);
			} else {
				logger.warn(
					`transaction already finished for autoAssignDriver(tripId=${tripId}): ${
						(transaction as any).finished
					}`
				);
			}
		} catch (rbErr) {
			logger.error(
				`Error during transaction rollback for trip ${tripId}:`,
				rbErr as Error
			);
		}
		logger.error(
			`Auto Assign Driver failed for trip ${tripId}:`,
			err as Error
		);
		throw err;
	}
};

/**
 * Manually assigns or reassigns a driver to a trip.
 * Validates driver availability and eligibility.
 * Updates trip status to SCHEDULED upon successful assignment.
 *
 * @param {number} trip_id - ID of the trip
 * @param {number} driver_id - ID of the driver to assign
 * @param {number} assigned_by - ID of the admin/user making the assignment
 * @returns {Promise<TripSchedule>} Promise resolving to created/updated assignment record
 * @throws {Object} Error with status code and message if assignment fails
 */
export const manualAssignDriver = async (
	tripId: number,
	driverId: number,
	assignedBy: string
): Promise<TripSchedule> => {
	// Begin transaction for safe multi-model update
	const transaction = await db.sequelize.transaction();

	try {
		// Validate trip exists and lock it
		const trip = await db.Trip.findByPk(tripId, {
			lock: transaction.LOCK.UPDATE,
			transaction,
		});
		if (!trip) {
			logger.warn(`manualAssignDriver: Trip ${tripId} not found`);
			throw { status: 404, message: `Trip ${tripId} not found.` };
		}

		// Validate driver exists and is eligible
		const driver = await getDriverById(driverId);
		if (!driver) {
			logger.warn(`manualAssignDriver: Driver ${driverId} not found`);
			throw { status: 404, message: `Driver ${driverId} not found.` };
		}

		if (!driver.isActive) {
			logger.info(`manualAssignDriver: Driver ${driverId} not active`);
			throw { status: 400, message: "Driver is not active" };
		}

		if (driver.isSuspended) {
			logger.info(`manualAssignDriver: Driver ${driverId} suspended`);
			throw { status: 400, message: "Driver is suspended" };
		}

		if (driver.licenseExpiryDate && driver.licenseExpiryDate < new Date()) {
			logger.info(
				`manualAssignDriver: Driver ${driverId} license expired`
			);
			throw { status: 400, message: "Driver license has expired" };
		}

		// Check for existing assignment
		let schedule = await db.TripSchedule.findOne({
			where: { tripId },
			lock: transaction.LOCK.UPDATE,
			transaction,
		});

		if (schedule) {
			await schedule.update({
				driverId,
				tripId,
				assignmentMode: AssignmentMode.MANUAL,
				assignedAt: new Date(),
				assignedBy,
			});
		} else {
			schedule = await db.TripSchedule.create(
				{
					driverId,
					tripId,
					assignmentMode: AssignmentMode.MANUAL,
					assignedAt: new Date(),
					assignedBy,
				},
				{ transaction }
			);
		}

		// Update trip status to SCHEDULED
		await db.Trip.update(
			{ status: TripStatus.SCHEDULED },
			{ where: { id: tripId }, transaction }
		);

		await transaction.commit();

		// Fetch user for notification
		let actorName = "Admin";
		try {
			const user = await User.findByPk(assignedBy);
			if (user) actorName = `${user.firstName} ${user.lastName}`;
		} catch (e) {
			// ignore
		}

		emitCrudChange(
			"trip_assignment",
			"update",
			{ tripId, driverId, mode: "manual" },
			{ id: assignedBy, name: actorName }
		);

		return schedule;
	} catch (err) {
		try {
			if (
				transaction &&
				(transaction as any).finished !== "commit" &&
				(transaction as any).finished !== "rollback"
			) {
				await transaction.rollback();
				logger.info(
					`transaction rolled back for manualAssignDriver(tripId=${tripId})`
				);
			} else {
				logger.warn(
					`transaction already finished for manualAssignDriver(tripId=${tripId}): ${
						(transaction as any).finished
					}`
				);
			}
		} catch (rbErr) {
			logger.error(
				`Error during transaction rollback for manual assign trip ${tripId}:`,
				rbErr as Error
			);
		}
		logger.error(
			`manualAssignDriver failed for trip ${tripId}:`,
			err as Error
		);
		throw err;
	}
};

/**
 * Retrieves a driver's schedule with trip details.
 * Returns all trip assignments for the specified driver.
 *
 * @param {number} driver_id - ID of the driver
 * @returns {Promise<TripSchedule[] | null>} Promise resolving to array of schedule records
 * @throws {Object} Error with status code and message if driver not found
 */
export const getDriverSchedule = async (
	driverId: number
): Promise<TripSchedule[] | null> => {
	const driver = await getDriverById(driverId);
	if (!driver)
		throw {
			status: 404,
			message: `Cannot find driver with ID ${driverId}`,
		};

	const schedule = await db.TripSchedule.findAll({
		where: { driverId: driver.id },
		include: [
			{
				model: db.Trip,
				as: "trip",
				include: [
					{ model: db.Route, as: "route" },
					{ model: db.Vehicle, as: "vehicle" },
				],
			},
			{
				model: db.Driver,
				as: "driver",
			},
			{
				model: db.User,
				as: "assigner",
				attributes: ["id", "firstName", "lastName", "email"],
			},
		],
		order: [["assignedAt", "DESC"]],
	});

	return schedule;
};

/**
 * Removes a driver assignment from a trip.
 * Sets trip status back to PENDING.
 *
 * @param {number} trip_id - ID of the trip
 * @param {string} [userId] - ID of the user performing the action
 * @returns {Promise<void>}
 * @throws {Object} Error with status code and message if schedule not found
 */
export const unassignDriver = async (
	tripId: number,
	userId?: string
): Promise<void> => {
	const transaction = await db.sequelize.transaction();

	try {
		const schedule = await db.TripSchedule.findOne({
			where: { tripId },
			transaction,
		});

		if (!schedule) {
			logger.info(
				`unassignDriver: No assignment found for trip ${tripId}`
			);
			throw {
				status: 404,
				message: `No driver assigned to trip ${tripId}`,
			};
		}

		await schedule.destroy({ transaction });

		// Update trip status back to PENDING
		await db.Trip.update(
			{ status: TripStatus.PENDING },
			{
				where: { id: tripId },
				transaction,
			}
		);

		await transaction.commit();

		let actorName = "Admin";
		if (userId) {
			try {
				const user = await User.findByPk(userId);
				if (user) actorName = `${user.firstName} ${user.lastName}`;
			} catch (e) {
				// ignore
			}
		}

		emitCrudChange(
			"trip_assignment",
			"delete",
			{ tripId },
			userId ? { id: userId, name: actorName } : undefined
		);
	} catch (err) {
		try {
			if (
				transaction &&
				(transaction as any).finished !== "commit" &&
				(transaction as any).finished !== "rollback"
			) {
				await transaction.rollback();
				logger.info(
					`transaction rolled back for unassignDriver(tripId=${tripId})`
				);
			} else {
				logger.warn(
					`transaction already finished for unassignDriver(tripId=${tripId}): ${
						(transaction as any).finished
					}`
				);
			}
		} catch (rbErr) {
			logger.error(
				`Error during transaction rollback for unassignDriver ${tripId}:`,
				rbErr as Error
			);
		}
		logger.error(`unassignDriver failed for trip ${tripId}:`, err as Error);
		throw err;
	}
};
